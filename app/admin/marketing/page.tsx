/**
 * /admin/marketing — Meta Ads Dashboard
 *
 * Adspend, CPL, CPC, CTR, ROAS, Payback-Rechnung,
 * Kampagnen-Vergleich und Empfehlungen.
 */
import { createClient } from '@/lib/supabase/server'
import { fetchMetaAdsInsights, berechneMetaKennzahlen, type MetaAdsSummary } from '@/lib/meta-ads'

export const dynamic = 'force-dynamic'

// Letzter erfolgreicher Abruf (08.08.2026) als Fallback
const FALLBACK_META: MetaAdsSummary = {
  zeitraum: { von: '10.07.–08.08.2026', bis: 'Snapshot' },
  gesamt: {
    spend: 269.81, impressions: 9959, clicks: 453, reach: 5939,
    leads: 4, cpl: 67.45, cpc: 0.60, ctr: 4.55,
  },
  kampagnen: [
    {
      kampagne: 'Webseiten ab 99€ Kampagne', campaignId: '52515798918955',
      spend: 185.70, impressions: 6879, clicks: 310, cpc: 0.60, cpm: 27.00, ctr: 4.51, reach: 3941,
      leads: 3, cpl: 61.90,
    },
    {
      kampagne: 'Webseiten ab 99€ Kampagne – Sage', campaignId: '52593332000955',
      spend: 84.11, impressions: 3080, clicks: 143, cpc: 0.59, cpm: 27.31, ctr: 4.64, reach: 1998,
      leads: 1, cpl: 84.11,
    },
  ],
}


const eurCent = (cent: number) =>
  (cent / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const eurExakt = (euro: number) =>
  euro.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })

const prozent = (anteil: number) =>
  `${(anteil * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`

interface LeadRow {
  id: string
  name: string
  firma: string | null
  utm_campaign: string | null
  utm_source: string | null
  utm_content: string | null
  utm_term: string | null
  status: string
  crm_stage: string | null
  created_at: string
  converted_customer_id: string | null
}

interface ContractRow {
  customer_id: string
  paket: string
  monatsrate_cent: number
  status: string
  beginn: string
  ende: string | null
}

export default async function MarketingPage() {
  const supabase = createClient()

  const hasToken = !!process.env.META_ACCESS_TOKEN && !!process.env.META_AD_ACCOUNT_ID

  // Alle Daten parallel laden
  const [insightsResult, { data: leadsData }, { data: contractsData }] = await Promise.all([
    hasToken
      ? fetchMetaAdsInsights('last_30d').catch(() => null)
      : Promise.resolve(null),
    supabase.from('leads').select('id, name, firma, utm_campaign, utm_source, utm_content, utm_term, status, crm_stage, created_at, converted_customer_id'),
    supabase.from('contracts').select('customer_id, paket, monatsrate_cent, status, beginn, ende'),
  ])

  const leads = (leadsData ?? []) as LeadRow[]
  const contracts = (contractsData ?? []) as ContractRow[]
  const metaLeads = leads.filter((l) => l.utm_source === 'fb' || l.utm_source === 'ig')
  const metaLeadsConverted = metaLeads.filter((l) => l.converted_customer_id)
  const metaLeadsOffen = metaLeads.filter((l) => !['GEWONNEN', 'VERLOREN'].includes(l.status))

  // Closings = Leads die im Sales-Call / Demo-Präsentation waren
  const closingStages = ['closing_terminiert', 'closed', 'closing_no_show', 'verloren']
  const metaClosingLeads = metaLeads.filter((l) => l.crm_stage && closingStages.includes(l.crm_stage))

  // Leads pro Kampagne für CPL-Matching
  const leadsProKampagne = new Map<string, number>()
  for (const l of leads) {
    if (!l.utm_campaign) continue
    const key = (l.utm_campaign as string).toLowerCase()
    leadsProKampagne.set(key, (leadsProKampagne.get(key) ?? 0) + 1)
  }

  const metaAds: MetaAdsSummary = insightsResult
    ? berechneMetaKennzahlen(insightsResult, leadsProKampagne, { von: 'letzte 30 Tage', bis: 'heute' })
    : FALLBACK_META
  const istFallback = !insightsResult

  // ROAS & Payback + pro Kampagne
  let metaRoas = 0
  let metaPaybackMonate = 0
  let metaConvertedMrrCent = 0
  let metaConvertedLtvCent = 0
  const convertsByKampagne = new Map<string, { leads: typeof metaLeadsConverted; mrrCent: number; ltvCent: number }>()

  if (metaAds) {
    const spendCent = Math.round(metaAds.gesamt.spend * 100)
    for (const lead of metaLeadsConverted) {
      const vertrag = contracts.find((c) => c.customer_id === lead.converted_customer_id && c.status === 'AKTIV')
      if (!vertrag) continue
      metaConvertedMrrCent += vertrag.monatsrate_cent
      const beginn = new Date(vertrag.beginn)
      const ende = vertrag.ende ? new Date(vertrag.ende) : new Date(beginn.getFullYear() + 2, beginn.getMonth(), beginn.getDate())
      const laufzeitMonate = Math.round((ende.getTime() - beginn.getTime()) / (30.44 * 24 * 60 * 60 * 1000))
      const ltvCent = vertrag.monatsrate_cent * laufzeitMonate
      metaConvertedLtvCent += ltvCent

      // Pro Kampagne tracken
      const kampagneId = lead.utm_campaign || 'unknown'
      const existing = convertsByKampagne.get(kampagneId) ?? { leads: [], mrrCent: 0, ltvCent: 0 }
      existing.leads.push(lead)
      existing.mrrCent += vertrag.monatsrate_cent
      existing.ltvCent += ltvCent
      convertsByKampagne.set(kampagneId, existing)
    }
    metaRoas = spendCent > 0 ? metaConvertedLtvCent / spendCent : 0
    metaPaybackMonate = metaConvertedMrrCent > 0 ? Math.ceil(spendCent / metaConvertedMrrCent) : 0
  }

  // Kosten pro Closing-Call (Adspend / tatsächliche Sales-Demos)
  const costPerClosing = metaClosingLeads.length > 0 && metaAds ? metaAds.gesamt.spend / metaClosingLeads.length : 0

  // Empfehlungen
  const empfehlungen: { typ: 'gut' | 'warnung' | 'info'; text: string }[] = []
  if (metaAds) {
    if (metaAds.gesamt.ctr > 3) {
      empfehlungen.push({ typ: 'gut', text: `CTR ${metaAds.gesamt.ctr.toFixed(1)}% — starke Anzeigen, gutes Creative/Targeting.` })
    } else if (metaAds.gesamt.ctr < 1.5) {
      empfehlungen.push({ typ: 'warnung', text: `CTR nur ${metaAds.gesamt.ctr.toFixed(1)}% — Creatives oder Zielgruppe überarbeiten.` })
    }

    if (metaAds.gesamt.cpc < 1) {
      empfehlungen.push({ typ: 'gut', text: `CPC ${metaAds.gesamt.cpc.toFixed(2)}€ — günstiger Traffic. Weiter skalieren.` })
    } else if (metaAds.gesamt.cpc > 2) {
      empfehlungen.push({ typ: 'warnung', text: `CPC ${metaAds.gesamt.cpc.toFixed(2)}€ — zu teuer. Zielgruppe oder Gebot prüfen.` })
    }

    if (metaAds.gesamt.cpl !== null) {
      if (metaAds.gesamt.cpl < 50) {
        empfehlungen.push({ typ: 'gut', text: `CPL ${metaAds.gesamt.cpl.toFixed(0)}€ — hervorragend für B2B SaaS.` })
      } else if (metaAds.gesamt.cpl < 100) {
        empfehlungen.push({ typ: 'info', text: `CPL ${metaAds.gesamt.cpl.toFixed(0)}€ — solide, aber Landingpage-Conversion prüfen.` })
      } else {
        empfehlungen.push({ typ: 'warnung', text: `CPL ${metaAds.gesamt.cpl.toFixed(0)}€ — zu hoch. Funnel oder Targeting optimieren.` })
      }
    }

    const metaCloseRate = metaLeads.length > 0 ? metaLeadsConverted.length / metaLeads.length : 0
    if (metaLeads.length > 0 && metaCloseRate === 0 && metaLeadsOffen.length > 0) {
      empfehlungen.push({ typ: 'warnung', text: `${metaLeadsOffen.length} offene Meta-Leads noch nicht bearbeitet — nachhaken!` })
    } else if (metaCloseRate > 0.25) {
      empfehlungen.push({ typ: 'gut', text: `Close-Rate ${(metaCloseRate * 100).toFixed(0)}% — exzellent.` })
    }

    // ROAS Bewertung
    if (metaRoas > 0) {
      if (metaRoas >= 5) {
        empfehlungen.push({ typ: 'gut', text: `ROAS ${metaRoas.toFixed(1)}x — exzellent. Ads profitabel skalieren.` })
      } else if (metaRoas >= 2) {
        empfehlungen.push({ typ: 'info', text: `ROAS ${metaRoas.toFixed(1)}x — profitabel, aber Close-Rate oder Ticket-Size erhöhen für besseren Return.` })
      } else {
        empfehlungen.push({ typ: 'warnung', text: `ROAS ${metaRoas.toFixed(1)}x — noch nicht profitabel. Mehr Leads closen oder Adspend optimieren.` })
      }
    }

    if (metaAds.kampagnen.length >= 2) {
      const sorted = [...metaAds.kampagnen].sort((a, b) => (a.cpl ?? 999) - (b.cpl ?? 999))
      const best = sorted.find((k) => k.cpl !== null)
      const worst = [...sorted].reverse().find((k) => k.cpl !== null)
      if (best && worst && best !== worst) {
        empfehlungen.push({
          typ: 'info',
          text: `"${best.kampagne}" hat den besten CPL (${best.cpl!.toFixed(0)}€) — Budget dorthin verlagern.`,
        })
      }
    }
  }

  // ── Styles ──────────────────────────────────────────────────
  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: '#6B7280', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #F3F4F6' }

  const kpiCard = (label: string, wert: string, detail?: string) => (
    <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{wert}</div>
      {detail && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{detail}</div>}
    </div>
  )

  // (Kein Error-Return mehr — Fallback-Daten werden angezeigt wenn API nicht erreichbar)

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Marketing</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: istFallback ? '12px' : '28px' }}>
        Meta Ads Performance — {istFallback ? 'Snapshot vom 08.08.2026' : 'letzte 30 Tage, live aus der Graph API'} + Lead-Daten.
      </p>
      {istFallback && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#92400E', marginBottom: '28px' }}>
          Live-Abruf fehlgeschlagen — zeigt letzte bekannte Daten (10.07.–08.08.2026). Token in Vercel prüfen.
        </div>
      )}

      {/* ── KPI-Cards Zeile 1 ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {kpiCard('Adspend', eurExakt(metaAds.gesamt.spend), `${metaAds.gesamt.impressions.toLocaleString('de-DE')} Impressions`)}
        {kpiCard('CPL', metaAds.gesamt.cpl !== null ? eurExakt(metaAds.gesamt.cpl) : '—', `${metaAds.gesamt.leads} Leads aus Meta`)}
        {kpiCard('CPC', eurExakt(metaAds.gesamt.cpc), `${metaAds.gesamt.clicks.toLocaleString('de-DE')} Clicks`)}
        {kpiCard('CTR', prozent(metaAds.gesamt.ctr / 100), `Reichweite: ${metaAds.gesamt.reach.toLocaleString('de-DE')}`)}
      </div>
      {/* ── KPI-Cards Zeile 2: ROAS & Demos ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {kpiCard(
          'ROAS (Laufzeit)',
          metaRoas > 0 ? `${metaRoas.toFixed(1)}x` : '—',
          metaConvertedLtvCent > 0
            ? `${eurCent(metaConvertedLtvCent)} LTV / ${eurExakt(metaAds.gesamt.spend)} Spend`
            : `${metaLeadsConverted.length} Converts, ${metaLeadsOffen.length} offen`
        )}
        {kpiCard(
          'Payback',
          metaPaybackMonate > 0 ? `${metaPaybackMonate} Mon.` : '—',
          metaConvertedMrrCent > 0
            ? `${eurCent(metaConvertedMrrCent)}/mo MRR aus Meta`
            : 'Noch kein MRR aus Meta-Leads'
        )}
        {kpiCard(
          'Kosten/Closing',
          costPerClosing > 0 ? eurExakt(costPerClosing) : '—',
          `${metaClosingLeads.length} Closings aus ${metaLeads.length} Meta-Leads`
        )}
        {kpiCard(
          'Conversion',
          metaLeads.length > 0 ? prozent(metaLeadsConverted.length / metaLeads.length) : '—',
          `${metaLeadsConverted.length}/${metaLeads.length} Meta-Leads → Kunde`
        )}
      </div>

      {/* ── Kampagnen-Tabelle ──────────────────────────────── */}
      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Kampagnen</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Kampagne</th>
              <th style={th}>Spend</th>
              <th style={th}>Impressions</th>
              <th style={th}>Clicks</th>
              <th style={th}>CTR</th>
              <th style={th}>CPC</th>
              <th style={th}>Leads</th>
              <th style={th}>CPL</th>
              <th style={th}>Converts</th>
              <th style={th}>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {metaAds.kampagnen.map((k) => {
              const conv = convertsByKampagne.get(k.campaignId)
              const kampagneRoas = conv ? conv.ltvCent / Math.max(1, Math.round(k.spend * 100)) : 0
              return (
                <tr key={k.campaignId}>
                  <td style={td}>{k.kampagne}</td>
                  <td style={td}>{eurExakt(k.spend)}</td>
                  <td style={td}>{k.impressions.toLocaleString('de-DE')}</td>
                  <td style={td}>{k.clicks.toLocaleString('de-DE')}</td>
                  <td style={td}>{prozent(k.ctr / 100)}</td>
                  <td style={td}>{eurExakt(k.cpc)}</td>
                  <td style={td}>{k.leads}</td>
                  <td style={td}>{k.cpl !== null ? eurExakt(k.cpl) : '—'}</td>
                  <td style={td}>{conv ? conv.leads.length : 0}</td>
                  <td style={{ ...td, fontWeight: 600, color: kampagneRoas >= 5 ? '#166534' : kampagneRoas > 0 ? '#92400E' : '#6B7280' }}>
                    {kampagneRoas > 0 ? `${kampagneRoas.toFixed(1)}x` : '—'}
                  </td>
                </tr>
              )
            })}
            {metaAds.kampagnen.length === 0 && (
              <tr><td style={td} colSpan={10}>Keine Kampagnen im Zeitraum.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── ROAS & Payback ─────────────────────────────────── */}
      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>ROAS & Payback</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {kpiCard(
          'ROAS (Laufzeit)',
          metaRoas > 0 ? `${metaRoas.toFixed(1)}x` : '—',
          metaConvertedLtvCent > 0
            ? `${eurCent(metaConvertedLtvCent)} LTV / ${eurExakt(metaAds.gesamt.spend)} Spend`
            : 'Noch kein Meta-Lead converted'
        )}
        {kpiCard(
          'Payback',
          metaPaybackMonate > 0 ? `${metaPaybackMonate} Mon.` : '—',
          metaConvertedMrrCent > 0
            ? `${eurCent(metaConvertedMrrCent)} MRR aus Meta-Converts`
            : 'Kein MRR aus Meta-Leads bisher'
        )}
        {kpiCard(
          'Meta-Leads',
          `${metaLeads.length} gesamt`,
          `${metaLeadsConverted.length} converted, ${metaLeadsOffen.length} offen, ${metaLeads.filter((l) => l.status === 'VERLOREN').length} verloren`
        )}
        {kpiCard(
          'Potenzial (offene Leads)',
          metaLeadsOffen.length > 0
            ? `${eurCent(metaLeadsOffen.length * 14900)}/mo`
            : '—',
          metaLeadsOffen.length > 0
            ? `bei Growth: ${eurCent(metaLeadsOffen.length * 14900 * 24)} LTV (24 Mo.)`
            : 'Keine offenen Leads'
        )}
      </div>

      {/* Payback Szenario-Tabelle */}
      {metaLeadsOffen.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Szenario</th>
                <th style={th}>MRR</th>
                <th style={th}>LTV (24 Mo.)</th>
                <th style={th}>ROAS</th>
                <th style={th}>Payback</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: '1 Close (Starter €89)', mrrCent: 8900, count: 1 },
                { label: '1 Close (Growth €149)', mrrCent: 14900, count: 1 },
                { label: `${metaLeadsOffen.length} Closes (Starter)`, mrrCent: 8900, count: metaLeadsOffen.length },
                { label: `${metaLeadsOffen.length} Closes (Growth)`, mrrCent: 14900, count: metaLeadsOffen.length },
              ].map((sz) => {
                const totalMrr = sz.mrrCent * sz.count + metaConvertedMrrCent
                const totalLtv = sz.mrrCent * sz.count * 24 + metaConvertedLtvCent
                const spendCent = Math.round(metaAds.gesamt.spend * 100)
                const roas = spendCent > 0 ? totalLtv / spendCent : 0
                const payback = totalMrr > 0 ? Math.ceil(spendCent / totalMrr) : 0
                return (
                  <tr key={sz.label}>
                    <td style={td}>{sz.label}</td>
                    <td style={td}>{eurCent(totalMrr)}</td>
                    <td style={td}>{eurCent(totalLtv)}</td>
                    <td style={{ ...td, fontWeight: 600, color: roas >= 5 ? '#166534' : roas >= 2 ? '#92400E' : '#991B1B' }}>{roas.toFixed(1)}x</td>
                    <td style={td}>{payback > 0 ? `${payback} Mon.` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Meta-Leads Liste ──────────────────────────────────── */}
      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Leads aus Meta Ads</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Name</th>
              <th style={th}>Firma</th>
              <th style={th}>Quelle</th>
              <th style={th}>Kampagne</th>
              <th style={th}>Creative</th>
              <th style={th}>Datum</th>
              <th style={th}>Status</th>
              <th style={th}>Vertrag</th>
            </tr>
          </thead>
          <tbody>
            {metaLeads.length === 0 && (
              <tr><td style={td} colSpan={8}>Keine Leads über Meta Ads.</td></tr>
            )}
            {metaLeads.map((l) => {
              const kampagne = metaAds.kampagnen.find(
                (k) => k.campaignId === l.utm_campaign || k.kampagne.toLowerCase() === (l.utm_campaign || '').toLowerCase()
              )
              const vertrag = l.converted_customer_id
                ? contracts.find((c) => c.customer_id === l.converted_customer_id && c.status === 'AKTIV')
                : null
              const statusColor: Record<string, string> = {
                NEU: '#6B7280',
                KONTAKTIERT: '#2563EB',
                QUALIFIZIERT: '#7C3AED',
                TERMIN: '#D97706',
                GEWONNEN: '#16A34A',
                VERLOREN: '#DC2626',
              }
              return (
                <tr key={l.id}>
                  <td style={td}>{l.name}</td>
                  <td style={td}>{l.firma || '—'}</td>
                  <td style={td}>{l.utm_source === 'fb' ? 'Facebook' : l.utm_source === 'ig' ? 'Instagram' : l.utm_source || '—'}</td>
                  <td style={td}>{kampagne?.kampagne || l.utm_campaign || '—'}</td>
                  <td style={td}>{l.utm_content || '—'}</td>
                  <td style={td}>{new Date(l.created_at).toLocaleDateString('de-DE')}</td>
                  <td style={td}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: statusColor[l.status] || '#6B7280',
                      background: `${statusColor[l.status] || '#6B7280'}14`,
                    }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={td}>
                    {vertrag
                      ? `${vertrag.paket} ${eurCent(vertrag.monatsrate_cent)}/mo`
                      : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Empfehlungen ──────────────────────────────────────── */}
      {empfehlungen.length > 0 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Empfehlungen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
            {empfehlungen.map((e, i) => (
              <div
                key={i}
                style={{
                  padding: '14px 18px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  background: e.typ === 'gut' ? '#F0FDF4' : e.typ === 'warnung' ? '#FEF2F2' : '#EFF6FF',
                  border: `1px solid ${e.typ === 'gut' ? '#BBF7D0' : e.typ === 'warnung' ? '#FECACA' : '#BFDBFE'}`,
                  color: e.typ === 'gut' ? '#166534' : e.typ === 'warnung' ? '#991B1B' : '#1E40AF',
                }}
              >
                <span style={{ fontWeight: 600 }}>
                  {e.typ === 'gut' ? '+ Läuft: ' : e.typ === 'warnung' ? '! Achtung: ' : 'i Tipp: '}
                </span>
                {e.text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
