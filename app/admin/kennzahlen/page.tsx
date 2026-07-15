/**
 * /admin/kennzahlen (Mission §12, Phase H)
 *
 * Funnel je UTM-Kampagne (Leads → Termine → Gewonnen → MRR), ARPU,
 * Upsell-Quote je Produkt, Churn, MRR-Entwicklung (12 Monate).
 *
 * Hinweise:
 *  - "Show"-Stufe (erschienen zum Termin) wird nicht separat getrackt —
 *    Termine kommen aus leads.status TERMIN/GEWONNEN.
 *  - Meta-Ads-Adspend-Import ist bewusst offen (API-Key → WARTELISTE);
 *    kein eigenes Ads-Reporting-Dashboard (§14).
 */
import { createClient } from '@/lib/supabase/server'
import { UPSELL_PRODUCTS, PLAN_UPGRADE_PREFIX } from '@/config/upsells'

export const dynamic = 'force-dynamic'

const eur = (cent: number) =>
  (cent / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

const prozent = (anteil: number) =>
  `${(anteil * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`

interface LeadRow {
  utm_campaign: string | null
  utm_source: string | null
  status: string
  converted_customer_id: string | null
}

interface ContractRow {
  customer_id: string
  paket: string
  monatsrate_cent: number
  status: string
  beginn: string
  ende: string | null
  gekuendigt_am: string | null
}

export default async function KennzahlenPage() {
  const supabase = createClient()

  const [{ data: leadsData }, { data: contractsData }, { data: ordersData }, { data: altUpsellsData }] =
    await Promise.all([
      supabase.from('leads').select('utm_campaign, utm_source, status, converted_customer_id'),
      supabase.from('contracts').select('customer_id, paket, monatsrate_cent, status, beginn, ende, gekuendigt_am'),
      supabase.from('upsell_orders').select('product_key, status, monat_cent, einmal_cent, customer_id'),
      supabase.from('activated_upsells').select('upsell_id, preis_pro_monat_cent, deaktiviert_am'),
    ])

  const leads = (leadsData ?? []) as LeadRow[]
  const contracts = (contractsData ?? []) as ContractRow[]
  const orders = ordersData ?? []
  const altUpsells = altUpsellsData ?? []

  // ── MRR & ARPU ──────────────────────────────────────────────
  // Quelle der Wahrheit für MRR sind contracts: Hauptverträge (paket = Tier)
  // plus je Buchung ein eigener Upsell-Vertrag (paket = 'upsell:<key>').
  // upsell_orders sind Kauf-Events (keine zweite MRR-Quelle, sonst Doppelzählung);
  // activated_upsells zählt nur für Alt-Module aus dem abgelösten Flow
  // (neue Produkt-Keys stehen dort ebenfalls, sind aber schon im Vertrag).
  const aktiveContracts = contracts.filter((c) => c.status === 'AKTIV')
  const aktiveHauptContracts = aktiveContracts.filter((c) => !c.paket.startsWith('upsell:'))
  const basisMrrCent = aktiveHauptContracts.reduce((s, c) => s + c.monatsrate_cent, 0)
  const upsellMrrNeuCent = aktiveContracts
    .filter((c) => c.paket.startsWith('upsell:'))
    .reduce((s, c) => s + c.monatsrate_cent, 0)
  const neueProduktKeys = new Set(UPSELL_PRODUCTS.map((p) => p.key))
  const upsellMrrAltCent = altUpsells
    .filter((u) => !u.deaktiviert_am && !neueProduktKeys.has(u.upsell_id as string))
    .reduce((s, u) => s + ((u.preis_pro_monat_cent as number) ?? 0), 0)
  const mrrCent = basisMrrCent + upsellMrrNeuCent + upsellMrrAltCent
  const arpuCent = aktiveHauptContracts.length > 0 ? Math.round(mrrCent / aktiveHauptContracts.length) : 0

  // ── Churn ───────────────────────────────────────────────────
  const beendetOderGekuendigt = contracts.filter((c) => c.status !== 'AKTIV').length
  const churnQuote = contracts.length > 0 ? beendetOderGekuendigt / contracts.length : 0
  const vor90Tagen = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  const kuendigungen90 = contracts.filter(
    (c) => c.gekuendigt_am && new Date(c.gekuendigt_am) >= vor90Tagen
  ).length

  // ── Funnel je UTM-Kampagne ──────────────────────────────────
  const mrrJeKunde = new Map<string, number>()
  for (const c of aktiveContracts) {
    mrrJeKunde.set(c.customer_id, (mrrJeKunde.get(c.customer_id) ?? 0) + c.monatsrate_cent)
  }

  interface FunnelZeile {
    kampagne: string
    quelle: string
    leads: number
    termine: number
    gewonnen: number
    mrrCent: number
  }
  const funnelMap = new Map<string, FunnelZeile>()
  for (const lead of leads) {
    const kampagne = lead.utm_campaign || '(ohne Kampagne)'
    const key = `${kampagne}|${lead.utm_source || ''}`
    const zeile =
      funnelMap.get(key) ??
      ({ kampagne, quelle: lead.utm_source || '—', leads: 0, termine: 0, gewonnen: 0, mrrCent: 0 } as FunnelZeile)
    zeile.leads++
    if (['TERMIN', 'GEWONNEN'].includes(lead.status)) zeile.termine++
    if (lead.status === 'GEWONNEN') {
      zeile.gewonnen++
      if (lead.converted_customer_id) {
        zeile.mrrCent += mrrJeKunde.get(lead.converted_customer_id) ?? 0
      }
    }
    funnelMap.set(key, zeile)
  }
  const funnel = Array.from(funnelMap.values()).sort((a, b) => b.leads - a.leads)

  // ── Upsell-Quote je Produkt ─────────────────────────────────
  const kundenMitVertrag = new Set(aktiveHauptContracts.map((c) => c.customer_id)).size
  const upsellZeilen = UPSELL_PRODUCTS.map((p) => {
    const gekauft = orders.filter(
      (o) => o.product_key === p.key && ['BEZAHLT', 'PROVISIONIERT'].includes(o.status as string)
    )
    return {
      key: p.key,
      name: p.name,
      kaeufe: gekauft.length,
      quote: kundenMitVertrag > 0 ? gekauft.length / kundenMitVertrag : 0,
      umsatzCent: gekauft.reduce(
        (s, o) => s + ((o.einmal_cent as number) ?? 0) + ((o.monat_cent as number) ?? 0),
        0
      ),
    }
  })
  const planUpgrades = orders.filter(
    (o) =>
      String(o.product_key).startsWith(PLAN_UPGRADE_PREFIX) &&
      ['BEZAHLT', 'PROVISIONIERT'].includes(o.status as string)
  ).length

  // ── MRR-Entwicklung (12 Monate, nur Basis-Verträge) ─────────
  const monate: { label: string; mrrCent: number }[] = []
  const jetzt = new Date()
  for (let i = 11; i >= 0; i--) {
    const start = new Date(jetzt.getFullYear(), jetzt.getMonth() - i, 1)
    const ende = new Date(jetzt.getFullYear(), jetzt.getMonth() - i + 1, 0)
    const summe = contracts
      .filter((c) => new Date(c.beginn) <= ende && (!c.ende || new Date(c.ende) >= start))
      .reduce((s, c) => s + c.monatsrate_cent, 0)
    monate.push({
      label: start.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
      mrrCent: summe,
    })
  }
  const maxMonatCent = Math.max(1, ...monate.map((m) => m.mrrCent))

  // ── Render ──────────────────────────────────────────────────
  const kpiCard = (label: string, wert: string, detail?: string) => (
    <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{wert}</div>
      {detail && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{detail}</div>}
    </div>
  )

  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: '#6B7280', borderBottom: '1px solid #E5E7EB', fontWeight: 600 }
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: '14px', color: '#111827', borderBottom: '1px solid #F3F4F6' }

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>Kennzahlen</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
        Funnel, MRR, Upsells und Churn — live aus Leads, Verträgen und Bestellungen.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {kpiCard('MRR', eur(mrrCent), `Basis ${eur(basisMrrCent)} + Upsells ${eur(upsellMrrNeuCent + upsellMrrAltCent)}`)}
        {kpiCard('ARPU', eur(arpuCent), `${aktiveHauptContracts.length} aktive Hauptverträge`)}
        {kpiCard('Churn', prozent(churnQuote), `${beendetOderGekuendigt}/${contracts.length} Verträge, ${kuendigungen90} Kündigungen in 90 Tagen`)}
        {kpiCard('Leads gesamt', String(leads.length), `${leads.filter((l) => l.status === 'GEWONNEN').length} gewonnen`)}
      </div>

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Funnel je UTM-Kampagne</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Kampagne</th>
              <th style={th}>Quelle</th>
              <th style={th}>Leads</th>
              <th style={th}>Termine</th>
              <th style={th}>Gewonnen</th>
              <th style={th}>Close-Rate</th>
              <th style={th}>MRR</th>
            </tr>
          </thead>
          <tbody>
            {funnel.length === 0 && (
              <tr><td style={td} colSpan={7}>Noch keine Leads erfasst.</td></tr>
            )}
            {funnel.map((z) => (
              <tr key={`${z.kampagne}|${z.quelle}`}>
                <td style={td}>{z.kampagne}</td>
                <td style={td}>{z.quelle}</td>
                <td style={td}>{z.leads}</td>
                <td style={td}>{z.termine}</td>
                <td style={td}>{z.gewonnen}</td>
                <td style={td}>{prozent(z.leads > 0 ? z.gewonnen / z.leads : 0)}</td>
                <td style={td}>{eur(z.mrrCent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '32px' }}>
        Show-Stufe wird nicht separat getrackt; Adspend-Import (Meta) folgt mit API-Zugang (WARTELISTE).
      </p>

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Upsell-Quote je Produkt</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Produkt</th>
              <th style={th}>Käufe</th>
              <th style={th}>Quote (von {kundenMitVertrag} Kunden)</th>
              <th style={th}>Umsatz (einmalig + 1. Monat)</th>
            </tr>
          </thead>
          <tbody>
            {upsellZeilen.map((z) => (
              <tr key={z.key}>
                <td style={td}>{z.name}</td>
                <td style={td}>{z.kaeufe}</td>
                <td style={td}>{prozent(z.quote)}</td>
                <td style={td}>{eur(z.umsatzCent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '32px' }}>
        Dazu {planUpgrades} Plan-Upgrades über den neuen Kaufweg.
      </p>

      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>MRR-Entwicklung (12 Monate, Basis-Verträge)</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-end', gap: '8px', height: '180px' }}>
        {monate.map((m) => (
          <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>{m.mrrCent > 0 ? eur(m.mrrCent) : ''}</div>
            <div
              style={{
                width: '100%',
                maxWidth: '48px',
                height: `${Math.max(2, Math.round((m.mrrCent / maxMonatCent) * 100))}px`,
                background: '#111827',
                borderRadius: '4px 4px 0 0',
              }}
            />
            <div style={{ fontSize: '11px', color: '#9CA3AF' }}>{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
