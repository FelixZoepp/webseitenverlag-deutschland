import { createClient } from '@supabase/supabase-js'
import { sendLeadNotification, sendConfirmationToSender } from '@/lib/email'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Rate limiting: max 5 per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    // Load site
    const { data: site } = await supabase
      .from('sites')
      .select('*, customers!inner(contact_email, company_name)')
      .eq('id', params.siteId)
      .single()

    if (!site) {
      return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404, headers: corsHeaders })
    }

    const body = await request.json()

    // form_type-Whitelist (Flagship-Funnel: anfrage/reservierung, sonst contact)
    const formType: string = ['anfrage', 'reservierung', 'contact'].includes(body.form_type)
      ? body.form_type
      : 'contact'

    // Pflichtfelder: Reservierung → Name + Telefon (E-Mail optional), sonst Name + E-Mail
    if (formType === 'reservierung') {
      if (!body.name || !body.phone) {
        return NextResponse.json(
          { error: 'Name und Telefon sind Pflichtfelder' },
          { status: 400, headers: corsHeaders }
        )
      }
    } else if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name und E-Mail sind Pflichtfelder' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Strukturierte Qualifizierung aus dem Funnel (jsonb-Spalte, BF §1.2)
    const qualifizierung =
      body.qualifizierung && typeof body.qualifizierung === 'object' && !Array.isArray(body.qualifizierung)
        ? (body.qualifizierung as Record<string, unknown>)
        : null

    // Honeypot check
    const isSpam = !!(body.website || body.url)

    // Rate limit check
    const withinLimit = checkRateLimit(ip)

    // Remove honeypot fields from stored data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { website: _w, url: _u, site_id: _s, qualifizierung: _q, ...cleanData } = body

    // Save submission
    const { data: submission, error: insertError } = await supabase
      .from('form_submissions')
      .insert({
        site_id: params.siteId,
        form_type: formType,
        data: cleanData,
        qualifizierung,
        sender_email: body.email || null,
        sender_name: body.name,
        status: isSpam || !withinLimit ? 'spam' : 'new',
        ip_address: ip,
        user_agent: userAgent,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Submission insert error:', insertError.message)
      return NextResponse.json(
        { success: true, message: 'Vielen Dank für deine Nachricht!' },
        { headers: corsHeaders }
      )
    }

    // Don't send mails for spam
    if (isSpam || !withinLimit) {
      return NextResponse.json(
        { success: true, message: 'Vielen Dank für deine Nachricht!' },
        { headers: corsHeaders }
      )
    }

    // Send notification email
    const notificationEnabled = site.notification_enabled !== false
    const notificationEmail = site.notification_email || (site.customers as Record<string, string>).contact_email

    if (notificationEnabled && notificationEmail) {
      const customerName = (site.customers as Record<string, string>).company_name || ''
      const result = await sendLeadNotification(
        notificationEmail,
        customerName,
        site.name,
        { ...cleanData, ...(qualifizierung || {}) },
        submission.id,
        params.siteId,
        body.email
      )

      await supabase
        .from('form_submissions')
        .update({
          notification_sent: result.success,
          notification_error: result.error || null,
        })
        .eq('id', submission.id)

      // Send confirmation to sender (nur wenn eine E-Mail vorliegt — Reservierung ist telefonisch)
      if (result.success && body.email) {
        await sendConfirmationToSender(
          body.email,
          body.name,
          site.name,
          customerName
        )
      }
    }

    return NextResponse.json(
      { success: true, message: 'Vielen Dank für deine Nachricht!' },
      { headers: corsHeaders }
    )
  } catch (err) {
    console.error('Form submit error:', err)
    return NextResponse.json(
      { success: true, message: 'Vielen Dank für deine Nachricht!' },
      { headers: corsHeaders }
    )
  }
}
