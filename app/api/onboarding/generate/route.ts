import { getAuthenticatedCustomer } from '@/lib/api-helpers'
import { generateSiteFromTranscript } from '@/lib/generate-site'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PackageTier } from '@/lib/packages'

const GenerateSchema = z.object({
  siteName: z.string().min(1, 'Seitenname ist erforderlich'),
  transcript: z.string().min(20, 'Transkript muss mindestens 20 Zeichen lang sein'),
  package: z.enum(['starter', 'business', 'growth']).default('starter'),
  templateId: z.string().optional(),
  domain: z.string().optional(),
  cloudflareAccountId: z.string().optional(),
  cloudflareApiToken: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const result = await getAuthenticatedCustomer()
    if (!result.ok) return result.response

    const { customer, supabase } = result.data

    const body = await request.json()
    const parsed = GenerateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { siteName, transcript, domain, cloudflareAccountId, cloudflareApiToken, templateId } = parsed.data
    const packageTier = parsed.data.package as PackageTier

    // Save Cloudflare credentials if provided
    if (cloudflareAccountId || cloudflareApiToken) {
      await supabase
        .from('customers')
        .update({
          cloudflare_account_id: cloudflareAccountId || customer.cloudflare_account_id,
          cloudflare_api_token: cloudflareApiToken || customer.cloudflare_api_token,
        })
        .eq('id', customer.id)
    }

    // Generate site config from transcript based on package + template
    const generatedConfig = await generateSiteFromTranscript(transcript, siteName, packageTier, templateId)

    // Create site with generated config
    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        customer_id: customer.id,
        name: siteName,
        domain: domain || null,
        template_id: templateId || (packageTier === 'starter' ? 'business-basic' : 'business-multipage'),
        config: generatedConfig,
        draft_config: generatedConfig,
        status: 'draft',
        package: packageTier,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Fehler beim Erstellen der Seite' }, { status: 500 })
    }

    // Update customer package
    await supabase.from('customers').update({ package: packageTier }).eq('id', customer.id)

    // Save initial config version
    await supabase.from('config_versions').insert({
      site_id: site.id,
      config: generatedConfig,
      created_by: 'system',
      description: `Automatisch generiert (${packageTier.charAt(0).toUpperCase() + packageTier.slice(1)}-Paket)`,
    })

    return NextResponse.json({ site, config: generatedConfig }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Interner Serverfehler'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
