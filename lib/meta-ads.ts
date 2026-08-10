/**
 * Meta Marketing API Client
 * Zieht Kampagnen-Insights (Spend, Impressions, Clicks etc.)
 * und errechnet CPL anhand der Leads in der DB.
 */

const GRAPH_API_VERSION = 'v21.0'
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`

interface MetaCampaignInsight {
  campaign_name: string
  campaign_id: string
  spend: string
  impressions: string
  clicks: string
  cpc: string
  cpm: string
  ctr: string
  reach: string
  actions?: { action_type: string; value: string }[]
}

interface MetaApiResponse {
  data: MetaCampaignInsight[]
  paging?: { cursors: { after: string }; next?: string }
}

export interface KampagnenMetrik {
  kampagne: string
  campaignId: string
  spend: number
  impressions: number
  clicks: number
  cpc: number
  cpm: number
  ctr: number
  reach: number
  leads: number
  cpl: number | null
}

export interface MetaAdsSummary {
  zeitraum: { von: string; bis: string }
  gesamt: {
    spend: number
    impressions: number
    clicks: number
    reach: number
    leads: number
    cpl: number | null
    cpc: number
    ctr: number
  }
  kampagnen: KampagnenMetrik[]
}

export async function fetchMetaAdsInsights(
  datePreset: string = 'last_30d'
): Promise<MetaCampaignInsight[]> {
  const token = process.env.META_ACCESS_TOKEN
  const accountId = process.env.META_AD_ACCOUNT_ID
  if (!token || !accountId) {
    throw new Error('META_ACCESS_TOKEN oder META_AD_ACCOUNT_ID fehlt')
  }

  const fields = [
    'campaign_name',
    'campaign_id',
    'spend',
    'impressions',
    'clicks',
    'cpc',
    'cpm',
    'ctr',
    'reach',
    'actions',
  ].join(',')

  const allInsights: MetaCampaignInsight[] = []
  let url = `${GRAPH_BASE}/${accountId}/insights?fields=${fields}&level=campaign&date_preset=${datePreset}&limit=100&access_token=${token}`

  while (url) {
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Meta API Fehler ${res.status}: ${JSON.stringify(err)}`)
    }
    const body: MetaApiResponse = await res.json()
    allInsights.push(...body.data)
    url = body.paging?.next ?? ''
  }

  return allInsights
}

export function berechneMetaKennzahlen(
  insights: MetaCampaignInsight[],
  leadsProKampagne: Map<string, number>,
  zeitraum: { von: string; bis: string }
): MetaAdsSummary {
  let gesamtSpend = 0
  let gesamtImpressions = 0
  let gesamtClicks = 0
  let gesamtReach = 0
  let gesamtLeads = 0

  const kampagnen: KampagnenMetrik[] = insights.map((row) => {
    const spend = parseFloat(row.spend) || 0
    const impressions = parseInt(row.impressions) || 0
    const clicks = parseInt(row.clicks) || 0
    const reach = parseInt(row.reach) || 0

    // Leads aus DB matchen: utm_campaign enthält oft den Kampagnennamen
    // Wir matchen case-insensitive gegen campaign_name und campaign_id
    const leads =
      leadsProKampagne.get(row.campaign_name.toLowerCase()) ??
      leadsProKampagne.get(row.campaign_id) ??
      0

    gesamtSpend += spend
    gesamtImpressions += impressions
    gesamtClicks += clicks
    gesamtReach += reach
    gesamtLeads += leads

    return {
      kampagne: row.campaign_name,
      campaignId: row.campaign_id,
      spend,
      impressions,
      clicks,
      cpc: parseFloat(row.cpc) || 0,
      cpm: parseFloat(row.cpm) || 0,
      ctr: parseFloat(row.ctr) || 0,
      reach,
      leads,
      cpl: leads > 0 ? spend / leads : null,
    }
  })

  kampagnen.sort((a, b) => b.spend - a.spend)

  return {
    zeitraum,
    gesamt: {
      spend: gesamtSpend,
      impressions: gesamtImpressions,
      clicks: gesamtClicks,
      reach: gesamtReach,
      leads: gesamtLeads,
      cpl: gesamtLeads > 0 ? gesamtSpend / gesamtLeads : null,
      cpc: gesamtClicks > 0 ? gesamtSpend / gesamtClicks : 0,
      ctr: gesamtImpressions > 0 ? (gesamtClicks / gesamtImpressions) * 100 : 0,
    },
    kampagnen,
  }
}
