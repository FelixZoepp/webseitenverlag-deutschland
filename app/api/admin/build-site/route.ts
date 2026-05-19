import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { generateSiteFromTranscript } from '@/lib/generate-site'

const BuildSchema = z.object({
  siteId: z.string().uuid(),
  customerId: z.string().uuid(),
  transcript: z.string().min(10),
})

export async function POST(request: Request) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json()
    const parsed = BuildSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { siteId, customerId, transcript } = parsed.data

    // Site laden
    const { data: site, error: siteErr } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single()

    if (siteErr || !site) {
      return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })
    }

    // Kunde laden
    const { data: customer } = await supabase
      .from('customers')
      .select('company_name, package')
      .eq('id', customerId)
      .single()

    const companyName = (customer?.company_name as string) || 'Unternehmen'
    const packageTier = (site.package as string) || (customer?.package as string) || 'business'
    const templateId = site.template_id as string

    // Kunden-Bilder laden
    const { data: bilder } = await supabase
      .from('kunden_bilder')
      .select('slot_id, public_url, ki_zuordnung')
      .eq('customer_id', customerId)
      .eq('site_id', siteId)

    // KI-Generierung mit Bildern
    const config = await generateSiteFromTranscript(
      transcript,
      companyName,
      packageTier as 'starter' | 'business' | 'growth',
      templateId,
      (bilder || []).map((b) => ({
        slot_id: b.slot_id as string | null,
        public_url: b.public_url as string,
        ki_zuordnung: b.ki_zuordnung as string | null,
      }))
    )

    // Config in Site speichern
    const { error: updateErr } = await supabase
      .from('sites')
      .update({
        config,
        draft_config: config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', siteId)

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 })
    }

    // Config-Version speichern
    await supabase.from('config_versions').insert({
      site_id: siteId,
      config,
      created_by: 'system',
      description: 'KI-generiert aus Onboarding-Transkript + Kundenbilder',
    })

    // Timeline-Eintrag
    await supabase.from('vertrags_timeline').insert({
      customer_id: customerId,
      ereignis: 'Webseite generiert',
      details: `KI hat die Webseite aus Transkript und ${(bilder || []).length} Bildern erstellt`,
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

    return NextResponse.json({
      success: true,
      previewUrl: `${appUrl}/api/sites/${siteId}/preview`,
      siteId,
    })
  } catch (err: unknown) {
    console.error('Build-Site fehlgeschlagen:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Interner Serverfehler',
    }, { status: 500 })
  }
}
