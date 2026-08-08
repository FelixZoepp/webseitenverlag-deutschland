/**
 * Meta Marketing API — Kampagnen-Insights für /admin/marketing.
 *
 * Env:
 *  - META_ACCESS_TOKEN   (Pflicht; System-User- oder Long-Lived-Token mit ads_read)
 *  - META_AD_ACCOUNT_ID  (optional; "act_123..." oder nur Ziffern — ohne wird das
 *    erste Werbekonto des Tokens verwendet)
 *
 * Alle Beträge in Cent der Konto-Währung.
 */

const GRAPH = 'https://graph.facebook.com/v23.0'

export interface MetaKonto {
  id: string // act_...
  name: string
  currency: string
  weitereKonten: string[] // Namen weiterer Konten, falls Token mehrere sieht
}

export interface MetaKampagne {
  kampagne: string
  spendCent: number
  impressions: number
  klicks: number
  linkKlicks: number
  ctr: number // 0..1, Link-CTR auf Impressions
  cpcCent: number
  cpmCent: number
  metaLeads: number
  cplCent: number
}

export interface MetaTag {
  datum: string // YYYY-MM-DD
  spendCent: number
  metaLeads: number
}

export interface MetaDaten {
  konto: MetaKonto
  kampagnen: MetaKampagne[]
  tage: MetaTag[]
}

export type MetaErgebnis = { ok: true; daten: MetaDaten } | { ok: false; fehler: string }

export function metaTokenVorhanden(): boolean {
  return Boolean(leseToken())
}

function leseToken(): string | undefined {
  return (
    process.env.META_ACCESS_TOKEN ||
    process.env.FB_ACCESS_TOKEN ||
    process.env.FACEBOOK_ACCESS_TOKEN ||
    process.env.META_TOKEN
  )
}

interface GraphError {
  error?: { message?: string; type?: string; code?: number }
}

async function graphGet<T>(pfad: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH}/${pfad}`)
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  url.searchParams.set('access_token', leseToken()!)

  const res = await fetch(url.toString(), { cache: 'no-store' })
  const json = (await res.json().catch(() => ({}))) as T & GraphError
  if (!res.ok || json.error) {
    const e = json.error
    const code = e?.code
    let hinweis = e?.message || `HTTP ${res.status}`
    if (code === 190) hinweis = `Token ungültig oder abgelaufen (${e?.message}). Neuen Long-Lived-Token hinterlegen.`
    if (code === 10 || code === 200 || code === 294)
      hinweis = `Token hat keine Berechtigung für Werbedaten (${e?.message}). Der Token braucht die Berechtigung "ads_read" und Zugriff aufs Werbekonto.`
    throw new Error(hinweis)
  }
  return json
}

function centAusString(betrag: string | undefined): number {
  return Math.round(parseFloat(betrag || '0') * 100)
}

/** "lead" ist Metas aggregierte Lead-Metrik (On-Facebook + Website-Leads). */
function leadsAusActions(actions: { action_type: string; value: string }[] | undefined): number {
  if (!actions) return 0
  const agg = actions.find((a) => a.action_type === 'lead')
  if (agg) return parseInt(agg.value, 10) || 0
  return actions
    .filter((a) => ['leadgen_grouped', 'onsite_conversion.lead_grouped', 'offsite_conversion.fb_pixel_lead'].includes(a.action_type))
    .reduce((s, a) => s + (parseInt(a.value, 10) || 0), 0)
}

interface InsightRow {
  campaign_name?: string
  date_start?: string
  spend?: string
  impressions?: string
  clicks?: string
  inline_link_clicks?: string
  actions?: { action_type: string; value: string }[]
}

export async function ladeMetaDaten(tage: number): Promise<MetaErgebnis> {
  if (!leseToken()) {
    return { ok: false, fehler: 'Kein Meta-Token gefunden. Env-Var META_ACCESS_TOKEN in Vercel hinterlegen (Settings → Environment Variables) und neu deployen.' }
  }

  try {
    // Werbekonto auflösen
    let kontoId = process.env.META_AD_ACCOUNT_ID?.trim()
    if (kontoId && !kontoId.startsWith('act_')) kontoId = `act_${kontoId}`
    let konto: MetaKonto

    if (kontoId) {
      const k = await graphGet<{ name: string; currency: string }>(kontoId, { fields: 'name,currency' })
      konto = { id: kontoId, name: k.name, currency: k.currency, weitereKonten: [] }
    } else {
      const liste = await graphGet<{ data: { id: string; name: string; currency: string }[] }>('me/adaccounts', {
        fields: 'name,currency',
        limit: '25',
      })
      if (!liste.data?.length) {
        return { ok: false, fehler: 'Der Token sieht kein Werbekonto. Prüfen, ob der Token-User Zugriff aufs Ad-Konto hat, oder META_AD_ACCOUNT_ID setzen.' }
      }
      const erstes = liste.data[0]
      konto = {
        id: erstes.id,
        name: erstes.name,
        currency: erstes.currency,
        weitereKonten: liste.data.slice(1).map((a) => `${a.name} (${a.id})`),
      }
    }

    const bis = new Date()
    const von = new Date(Date.now() - (tage - 1) * 24 * 60 * 60 * 1000)
    const iso = (d: Date) => d.toISOString().slice(0, 10)
    const timeRange = JSON.stringify({ since: iso(von), until: iso(bis) })

    const [kampagnenRes, tageRes] = await Promise.all([
      graphGet<{ data: InsightRow[] }>(`${konto.id}/insights`, {
        level: 'campaign',
        fields: 'campaign_name,spend,impressions,clicks,inline_link_clicks,actions',
        time_range: timeRange,
        limit: '200',
      }),
      graphGet<{ data: InsightRow[] }>(`${konto.id}/insights`, {
        level: 'account',
        fields: 'spend,actions',
        time_range: timeRange,
        time_increment: '1',
        limit: '200',
      }),
    ])

    const kampagnen: MetaKampagne[] = (kampagnenRes.data || [])
      .map((r) => {
        const spendCent = centAusString(r.spend)
        const impressions = parseInt(r.impressions || '0', 10)
        const klicks = parseInt(r.clicks || '0', 10)
        const linkKlicks = parseInt(r.inline_link_clicks || '0', 10)
        const metaLeads = leadsAusActions(r.actions)
        return {
          kampagne: r.campaign_name || '(ohne Name)',
          spendCent,
          impressions,
          klicks,
          linkKlicks,
          ctr: impressions > 0 ? linkKlicks / impressions : 0,
          cpcCent: linkKlicks > 0 ? Math.round(spendCent / linkKlicks) : 0,
          cpmCent: impressions > 0 ? Math.round((spendCent / impressions) * 1000) : 0,
          metaLeads,
          cplCent: metaLeads > 0 ? Math.round(spendCent / metaLeads) : 0,
        }
      })
      .sort((a, b) => b.spendCent - a.spendCent)

    const tagesWerte: MetaTag[] = (tageRes.data || []).map((r) => ({
      datum: r.date_start || '',
      spendCent: centAusString(r.spend),
      metaLeads: leadsAusActions(r.actions),
    }))

    return { ok: true, daten: { konto, kampagnen, tage: tagesWerte } }
  } catch (e) {
    return { ok: false, fehler: e instanceof Error ? e.message : String(e) }
  }
}
