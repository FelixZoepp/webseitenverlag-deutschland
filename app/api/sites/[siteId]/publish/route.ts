/**
 * Veröffentlichen (Phase G, §11):
 *   deploy_target 'multi_tenant' (Default) → draft_config wird Live-config,
 *     Auslieferung über unsere Infrastruktur (Subdomain unter PRODUKTDOMAIN
 *     bzw. Custom Domain, siehe app/kundenseite/[host]). Kein Kunden-Setup nötig.
 *   deploy_target 'customer_cloudflare' → statischer Export → Pages Direct
 *     Upload ins Kunden-Konto. Bei Fehlern (Token widerrufen/abgelaufen):
 *     automatischer Fallback auf multi_tenant, Reconnect-Mail an den Kunden,
 *     manual_task erst nach 2 gescheiterten Versuchen.
 */
import { getOwnedSite } from '@/lib/api-helpers'
import { renderMultiPageSite } from '@/lib/multipage-renderer'
import { deployMultiPageToCloudflare, createPagesProject } from '@/lib/cloudflare'
import { renderKundenseite, renderSeoLandingpage, rechtstexteDateien, type SiteZeile } from '@/lib/auslieferung'
import { createAdminClient } from '@/lib/supabase/admin'
import { createManualTask } from '@/lib/contracts'
import { sendCloudflareReconnectEmail } from '@/lib/email'
import { NextResponse } from 'next/server'
import { SiteConfig, isMultiPageConfig } from '@/types'

function subdomainSlug(name: string | null | undefined, id: string): string {
  const base = (name || 'site')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'site'}-${id.slice(0, 6)}`
}

export async function POST(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, customer, site } = result.data

    if (site.gesperrt) {
      return NextResponse.json(
        { error: 'Diese Website ist gesperrt und kann nicht veröffentlicht werden.' },
        { status: 403 }
      )
    }

    const config = (site.draft_config || site.config) as SiteConfig | null
    if (!config) {
      return NextResponse.json({ error: 'Keine Konfiguration zum Veröffentlichen vorhanden.' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const marketingHost = (process.env.NEXT_PUBLIC_MARKETING_HOST || '').split(':')[0]

    /** Live schalten über unsere Infrastruktur (Default + Fallback) */
    const publishMultiTenant = async (
      deployFelder: Record<string, unknown> = {}
    ): Promise<{ url: string | null }> => {
      let subdomain = (site.subdomain as string) || subdomainSlug(site.name as string, site.id as string)
      const felder = {
        config,
        status: 'published',
        deploy_status: 'OK',
        deploy_fehler: null,
        zuletzt_deployt_am: now,
        updated_at: now,
        ...deployFelder,
      }
      let { error } = await supabase.from('sites').update({ ...felder, subdomain }).eq('id', params.siteId)
      if (error && error.code === '23505') {
        // Subdomain kollidiert (unwahrscheinlich) → deterministischer Ausweichslug
        subdomain = `site-${(site.id as string).slice(0, 8)}`
        ;({ error } = await supabase.from('sites').update({ ...felder, subdomain }).eq('id', params.siteId))
      }
      if (error) throw new Error(error.message)

      await supabase.from('config_versions').insert({
        site_id: params.siteId,
        config,
        created_by: 'system',
        description: 'Veröffentlicht',
      })

      return { url: marketingHost ? `https://${subdomain}.${marketingHost}` : null }
    }

    // ── Kunden-Cloudflare: statischer Export → Pages Direct Upload ──────────
    if (
      site.deploy_target === 'customer_cloudflare' &&
      customer.cloudflare_account_id &&
      customer.cloudflare_api_token
    ) {
      await supabase
        .from('sites')
        .update({ deploy_status: 'LAEUFT', updated_at: now })
        .eq('id', params.siteId)

      const credentials = {
        accountId: customer.cloudflare_account_id,
        apiToken: customer.cloudflare_api_token,
      }
      const projectName = (site.cloudflare_project_name as string) || `site-${(site.id as string).slice(0, 8)}`

      let fehler: string | null = null
      let deployUrl: string | undefined

      try {
        const projectResult = await createPagesProject(credentials, projectName)
        if (!projectResult.success) {
          fehler = projectResult.error || 'Cloudflare-Projekt konnte nicht erstellt werden'
        } else {
          let files: { path: string; content: string }[]
          if (isMultiPageConfig(config)) {
            files = renderMultiPageSite(config, params.siteId)
          } else {
            const zeile: SiteZeile = {
              id: site.id as string,
              template_id: (site.template_id as string) || null,
              config: config as unknown as Record<string, unknown>,
              status: 'published',
              name: site.name as string,
            }
            const html = await renderKundenseite(supabase, zeile, '')
            if (!html) throw new Error('Rendering fehlgeschlagen')
            files = [{ path: 'index.html', content: html }]
          }
          // Rechtstexte aus den Wizard-Pflichtangaben — gewinnen bei Pfadkollision
          const rechtstexte = rechtstexteDateien(config as unknown as Record<string, unknown>, site.name as string)
          for (const extra of rechtstexte) {
            files = files.filter((f) => f.path !== extra.path)
            files.push(extra)
          }

          // Freigegebene SEO-Landingpages (Upsell #1) in den Export aufnehmen
          const { data: seoSeiten } = await supabase
            .from('seo_landingpages')
            .select('slug')
            .eq('site_id', params.siteId)
            .eq('status', 'FREIGEGEBEN')
          for (const sp of seoSeiten || []) {
            const seoHtml = await renderSeoLandingpage(supabase, params.siteId, sp.slug as string, rechtstexte.length > 0)
            if (seoHtml && !files.some((f) => f.path === `${sp.slug}/index.html`)) {
              files.push({ path: `${sp.slug}/index.html`, content: seoHtml })
            }
          }

          const deployResult = await deployMultiPageToCloudflare(credentials, projectName, files)
          if (deployResult.success) deployUrl = deployResult.url
          else fehler = deployResult.error || 'Deploy fehlgeschlagen'
        }
      } catch (e) {
        fehler = e instanceof Error ? e.message : 'Deploy fehlgeschlagen'
      }

      if (!fehler) {
        await supabase
          .from('sites')
          .update({
            config,
            status: 'published',
            cloudflare_project_name: projectName,
            deploy_status: 'OK',
            deploy_fehler: null,
            deploy_fehlversuche: 0,
            zuletzt_deployt_am: now,
            updated_at: now,
          })
          .eq('id', params.siteId)

        await supabase.from('config_versions').insert({
          site_id: params.siteId,
          config,
          created_by: 'system',
          description: 'Veröffentlicht',
        })

        return NextResponse.json({ success: true, url: deployUrl, deploy: 'customer_cloudflare' })
      }

      // ── Fehlerfall: Fallback auf multi_tenant (Site bleibt live) ──────────
      const fehlversuche = ((site.deploy_fehlversuche as number) || 0) + 1
      const fallback = await publishMultiTenant({
        deploy_status: 'FEHLER',
        deploy_fehler: fehler,
        deploy_fehlversuche: fehlversuche,
      })

      if (customer.contact_email) {
        try {
          await sendCloudflareReconnectEmail(
            customer.contact_email as string,
            (customer.company_name as string) || 'Kunde',
            params.siteId
          )
        } catch (e) {
          console.error('[publish] Reconnect-Mail fehlgeschlagen:', e)
        }
      }

      if (fehlversuche >= 2) {
        await createManualTask(createAdminClient(), {
          typ: 'SONSTIGES',
          titel: `Cloudflare-Deploy fehlgeschlagen (${fehlversuche}x): ${site.name || params.siteId}`,
          beschreibung: `Site ${params.siteId} — letzter Fehler: ${fehler}. Site läuft per Fallback über multi_tenant weiter. Kunden-Token prüfen.`,
          customer_id: (customer.id as string) || null,
          quelle: 'publish',
        })
      }

      return NextResponse.json({
        success: true,
        url: fallback.url,
        deploy: 'multi_tenant',
        fallback: true,
        hinweis: 'Cloudflare-Deploy fehlgeschlagen — Website läuft über unsere Infrastruktur weiter. Der Kunde wurde per Mail informiert.',
      })
    }

    // ── Default: multi_tenant ────────────────────────────────────────────────
    const { url } = await publishMultiTenant()
    return NextResponse.json({ success: true, url, deploy: 'multi_tenant' })
  } catch (e) {
    console.error('[publish] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
