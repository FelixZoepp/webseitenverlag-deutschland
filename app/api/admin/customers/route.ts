import { requireAdmin } from '@/lib/auth-helpers'
import { sendInvitationEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

const CreateCustomerSchema = z.object({
  companyName: z.string().min(1),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  sendInvitation: z.boolean().optional(),
})

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET() {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const body = await request.json()
    const parsed = CreateCustomerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { companyName, contactEmail, sendInvitation } = parsed.data
    const serviceClient = getServiceClient()

    // Generate temp password
    const crypto = await import('crypto')
    const tempPassword = crypto.randomBytes(6).toString('base64url') + crypto.randomBytes(2).toString('hex').toUpperCase() + '!'

    // Create auth user
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email: contactEmail,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json({ error: `User-Erstellung fehlgeschlagen: ${authError.message}` }, { status: 500 })
    }

    // Create customer profile
    const { data: customer, error: customerError } = await serviceClient
      .from('customers')
      .insert({
        user_id: authData.user.id,
        company_name: companyName,
        contact_email: contactEmail,
        role: 'customer',
      })
      .select()
      .single()

    if (customerError) {
      return NextResponse.json({ error: `Profil-Erstellung fehlgeschlagen: ${customerError.message}` }, { status: 500 })
    }

    // Send invitation email
    let invitationSent = false
    if (sendInvitation) {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'}/login`
      const emailResult = await sendInvitationEmail(contactEmail, companyName, loginUrl, tempPassword)
      invitationSent = emailResult.success
    }

    return NextResponse.json({
      customer,
      tempPassword,
      invitationSent,
    }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
