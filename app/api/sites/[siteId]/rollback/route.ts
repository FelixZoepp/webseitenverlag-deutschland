import { getOwnedSite } from '@/lib/api-helpers'
import { renderTemplate } from '@/lib/template-renderer'
import { deployToCloudflarePages } from '@/lib/cloudflare'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { SiteConfig } from '@/types'

const RollbackSchema = z.object({
  version_id: z.string().uuid('Ungültige Versions-ID'),
})

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, customer, site } = result.data

    const body = await request.json()
    const parsed = RollbackSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    // Load the target version
    const { data: version } = await supabase
      .from('config_versions')
      .select('*')
      .eq('id', parsed.data.version_id)
      .eq('site_id', params.siteId)
      .single()

    if (!version) {
      return NextResponse.json({ error: 'Version nicht gefunden' }, { status: 404 })
    }

    // Update draft and live config
    await supabase
      .from('sites')
      .update({
        config: version.config,
        draft_config: version.config,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.siteId)

    // Save rollback as new version
    await supabase.from('config_versions').insert({
      site_id: params.siteId,
      config: version.config,
      created_by: 'system',
      description: `Rollback zu Version vom ${new Date(version.created_at).toLocaleString('de-DE')}`,
    })

    // Re-deploy if site was published and has Cloudflare credentials
    let deployUrl: string | undefined
    if (
      (site.status as string) === 'published' &&
      site.cloudflare_project_name &&
      customer.cloudflare_account_id &&
      customer.cloudflare_api_token
    ) {
      const html = renderTemplate(version.config as SiteConfig)
      const deployResult = await deployToCloudflarePages(
        {
          accountId: customer.cloudflare_account_id,
          apiToken: customer.cloudflare_api_token,
        },
        site.cloudflare_project_name as string,
        html
      )
      if (deployResult.success) {
        deployUrl = deployResult.url
      }
    }

    return NextResponse.json({
      success: true,
      config: version.config,
      deployUrl,
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
