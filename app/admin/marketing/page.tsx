/**
 * /admin/marketing — Meta Ads × Sales
 *
 * Zieht Kampagnen-Kennzahlen live aus der Meta Marketing API und verknüpft sie
 * über utm_campaign mit den eigenen Sales-Daten (Leads → Termine → Gewonnen → MRR).
 * Damit sind CPL, CAC und Payback je Kampagne direkt vergleichbar — Basis für
 * Skalierungs-Entscheidungen.
 */
import { createClient } from '@/lib/supabase/server'
import { ladeMetaDaten, MetaKampagne } from '@/lib/meta-ads'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const prozent = (anteil: number) =>
  `${(anteil * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`

interface LeadRow {
  utm_campaign: string | null
  status: string
  converted_customer_id: string | null
}

interface SalesJeKampagne {
  leads: number
  termine: number
  gewonnen: number
  mrrCent: number
}

const ZEITRAEUME = [7, 14, 30, 90]

export default async function MarketingPage({ searchParams }: { searchParams: { tage?: string } }) {
  const tage = ZEITRAEUME.includes(Number(searchParams.tage)) ? Number(searchParams.tage) : 30

  const supabase = createClient()
  const von = new Date(Date.now() - (tage - 1) * 24 * 60 * 60 * 1000)

  const [meta, { data: leadsData }, { data: contractsData }] = await Promise.all([
    ladeMetaDaten(tage),
    supabase
      .from('leads')
      .select('utm_campaign, status, converted_customer_id')
      .gte('created_at', von.toISOString()),
    supabase.from('contracts').select('customer_id, monatsrate_cent, status'),
  ])

  const leads = (leadsData ?? []) as LeadRow[]
  const contracts = contractsData ?? []

  const waehrung = meta.ok ? meta.daten.konto.currency : 'EUR'
  const geld = (cent: number, nachkomma = 0) =>
    (cent / 100).toLocaleString('de-DE', { style: 'currency', currency: waehrung, maximumFractionDigits: nachkomma })

  // MRR je Kunde (aktive Verträge, Basis + Upsell)
  const mrrJeKunde = new Map<string, number>()
  for (const c of contracts) {
    if (c.status !== 'AKTIV') continue
    mrrJeKunde.set(c.customer_id as string, (mrrJeKunde.get(c.customer_id as string) ?? 0) + (c.monatsrate_cent as number))
  }

  // Sales-Kennzahlen je utm_campaign (normalisiert auf Kleinschreibung)
  const salesMap = new Map<string, SalesJeKampagne>()
  const norm = (s: string) => s.trim().toLowerCase()
  for (const lead of leads) {
    const key = lead.utm_campaign ? norm(lead.utm_campaign) : '(ohne kampagne)'
    const zeile = salesMap.get(key) ?? { leads: 0, termine: 0, gewonnen: 0, mrrCent: 0 }
    zeile.leads++
    if (['TERMIN', 'GEWONNEN'].includes(lead.status)) zeile.termine++
    if (lead.status === 'GEWONNEN') {
      zeile.gewonnen++
      if (lead.converted_customer_id) zeile.mrrCent += mrrJeKunde.get(lead.converted_customer_id) ?? 0
    }
    salesMap.set(key, zeile)
  }

  // Meta-Kampagnen mit Sales verknüpfen
  const kampagnen = meta.ok ? meta.daten.kampagnen : []
  const zugeordnet = new Set<string>()
  const zeilen = kampagnen.map((k) => {
    const sales = salesMap.get(norm(k.kampagne))
    if (sales) zugeordnet.add(norm(k.kampagne))
    return { ...k, sales: sales ?? { leads: 0, termine: 0, gewonnen: 0, mrrCent: 0 } }
  })
  const ohneMetaKampagne = Array.from(salesMap.entries()).filter(([key]) => !zugeordnet.has(key))

  // Gesamt-KPIs
  const sum = (fn: (k: MetaKampagne) => number) => kampagnen.reduce((s, k) => s + fn(k), 0)
  const spendCent = sum((k) => k.spendCent)
  const impressions = sum((k) => k.impressions)
  const linkKlicks = sum((k) => k.linkKlicks)
  const metaLeads = sum((k) => k.metaLeads)
  const dbLeads = leads.length
  const gewonnen = leads.filter((l) => l.status === 'GEWONNEN').length
  const gewonneneMrrCent = zeilen.reduce((s, z) => s + z.sales.mrrCent, 0)
    + ohneMetaKampagne.reduce((s, [, v]) => s + v.mrrCent, 0)
  const cplCent = dbLeads > 0 ? Math.round(spendCent / dbLeads) : 0
  const cacCent = gewonnen > 0 ? Math.round(spendCent / gewonnen) : 0
  const paybackMonate = gewonneneMrrCent > 0 ? spendCent / gewonneneMrrCent : 0

  const maxTagCent = meta.ok ? Math.max(1, ...meta.daten.tage.map((t) => t.spendCent)) : 1

  // ── Render ──────────────────────────────────────────────────
  const kpiCard = (label: string, wert: string, detail?: string) => (
    <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{wert}</div>
      {detail && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{detail}</div>}
    </div>
  )

  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: '12px', color: '#6B7280', borderBottom: '1px solid #E5E7EB', fontWeight: 600, whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '10px 12px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }

  return (
    <div style={{ padding: '32px', maxWidth: '1240px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>Marketing</h1>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ZEITRAEUME.map((t) => (
            <Link
              key={t}
              href={`/admin/marketing?tage=${t}`}
              style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none',
                background: t === tage ? '#111827' : '#fff',
                color: t === tage ? '#fff' : '#374151',
                border: '1px solid #E5E7EB', fontWeight: 600,
              }}
            >
              {t} Tage
            </Link>
          ))}
        </div>
      </div>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '28px' }}>
        Meta Ads live aus der Marketing API, verknüpft mit Leads und Verträgen über <code>utm_campaign</code>.
        {meta.ok && (
          <> Konto: <strong>{meta.daten.konto.name}</strong> ({meta.daten.konto.id}, {meta.daten.konto.currency})</>
        )}
      </p>

      {!meta.ok && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>Meta-Verbindung fehlgeschlagen</div>
          <div style={{ fontSize: '14px', color: '#7F1D1D', marginBottom: '10px' }}>{meta.fehler}</div>
          <div style={{ fontSize: '13px', color: '#7F1D1D' }}>
            Erwartete Env-Vars in Vercel: <code>META_ACCESS_TOKEN</code> (Pflicht, Berechtigung <code>ads_read</code>) und
            optional <code>META_AD_ACCOUNT_ID</code> (z.&nbsp;B. <code>act_1234567890</code>). Nach dem Setzen neu deployen.
            Die Sales-Kennzahlen unten funktionieren unabhängig davon.
          </div>
        </div>
      )}

      {meta.ok && meta.daten.konto.weitereKonten.length > 0 && (
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '-20px', marginBottom: '28px' }}>
          Token sieht weitere Konten: {meta.daten.konto.weitereKonten.join(', ')} — festlegen über <code>META_AD_ACCOUNT_ID</code>.
        </p>
      )}

      {/* KPI-Zeile 1: Ads */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {kpiCard('Ad-Spend', geld(spendCent), `${tage} Tage`)}
        {kpiCard('Impressionen', impressions.toLocaleString('de-DE'), linkKlicks > 0 ? `${linkKlicks.toLocaleString('de-DE')} Link-Klicks (CTR ${prozent(impressions > 0 ? linkKlicks / impressions : 0)})` : undefined)}
        {kpiCard('Meta-Leads', String(metaLeads), metaLeads > 0 ? `CPL laut Meta ${geld(Math.round(spendCent / metaLeads), 2)}` : 'laut Meta-Attribution')}
        {kpiCard('Leads in DB', String(dbLeads), dbLeads > 0 ? `CPL echt ${geld(cplCent, 2)}` : `im Zeitraum (${tage} Tage)`)}
      </div>

      {/* KPI-Zeile 2: Sales-Verknüpfung */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {kpiCard('Termine', String(leads.filter((l) => ['TERMIN', 'GEWONNEN'].includes(l.status)).length), dbLeads > 0 ? `${prozent(leads.filter((l) => ['TERMIN', 'GEWONNEN'].includes(l.status)).length / dbLeads)} der Leads` : undefined)}
        {kpiCard('Gewonnen', String(gewonnen), gewonnen > 0 ? `CAC ${geld(cacCent)}` : 'noch kein Abschluss im Zeitraum')}
        {kpiCard('Gewonnene MRR', geld(gewonneneMrrCent), 'aus Leads dieses Zeitraums')}
        {kpiCard('Payback', paybackMonate > 0 ? `${paybackMonate.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mon.` : '—', 'Spend ÷ gewonnene MRR')}
      </div>

      {/* Tages-Spend */}
      {meta.ok && meta.daten.tage.length > 0 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Spend pro Tag</h2>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'flex-end', gap: '3px', height: '160px', marginBottom: '32px' }}>
            {meta.daten.tage.map((t) => (
              <div key={t.datum} title={`${new Date(t.datum).toLocaleDateString('de-DE')}: ${geld(t.spendCent, 2)}, ${t.metaLeads} Leads`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', maxWidth: '32px', height: `${Math.max(2, Math.round((t.spendCent / maxTagCent) * 100))}px`, background: '#1D4ED8', borderRadius: '3px 3px 0 0' }} />
                {meta.daten.tage.length <= 31 && (
                  <div style={{ fontSize: '9px', color: '#9CA3AF' }}>{new Date(t.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Kampagnen-Tabelle */}
      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Kampagnen: Ads × Sales</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflowX: 'auto', marginBottom: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Kampagne</th>
              <th style={th}>Spend</th>
              <th style={th}>Impr.</th>
              <th style={th}>Klicks</th>
              <th style={th}>CTR</th>
              <th style={th}>CPC</th>
              <th style={th}>Meta-Leads</th>
              <th style={th}>DB-Leads</th>
              <th style={th}>CPL</th>
              <th style={th}>Termine</th>
              <th style={th}>Gewonnen</th>
              <th style={th}>CAC</th>
              <th style={th}>MRR</th>
              <th style={th}>Payback</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.length === 0 && (
              <tr><td style={td} colSpan={14}>{meta.ok ? `Keine Kampagnen-Daten im Zeitraum (${tage} Tage).` : 'Keine Meta-Daten — Verbindung oben prüfen.'}</td></tr>
            )}
            {zeilen.map((z) => {
              const payback = z.sales.mrrCent > 0 ? z.spendCent / z.sales.mrrCent : 0
              return (
                <tr key={z.kampagne}>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: '160px', fontWeight: 600 }}>{z.kampagne}</td>
                  <td style={td}>{geld(z.spendCent, 2)}</td>
                  <td style={td}>{z.impressions.toLocaleString('de-DE')}</td>
                  <td style={td}>{z.linkKlicks.toLocaleString('de-DE')}</td>
                  <td style={td}>{prozent(z.ctr)}</td>
                  <td style={td}>{z.cpcCent > 0 ? geld(z.cpcCent, 2) : '—'}</td>
                  <td style={td}>{z.metaLeads}</td>
                  <td style={td}>{z.sales.leads}</td>
                  <td style={td}>{z.sales.leads > 0 ? geld(Math.round(z.spendCent / z.sales.leads), 2) : '—'}</td>
                  <td style={td}>{z.sales.termine}</td>
                  <td style={td}>{z.sales.gewonnen}</td>
                  <td style={td}>{z.sales.gewonnen > 0 ? geld(Math.round(z.spendCent / z.sales.gewonnen)) : '—'}</td>
                  <td style={td}>{geld(z.sales.mrrCent)}</td>
                  <td style={td}>{payback > 0 ? `${payback.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mon.` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '32px' }}>
        Zuordnung über <code>utm_campaign</code> = Meta-Kampagnenname (Groß-/Kleinschreibung egal). In den Anzeigen als
        URL-Parameter <code>utm_campaign={'{{campaign.name}}'}</code> setzen, damit die Spalten DB-Leads bis Payback gefüllt werden.
        CPL = Spend ÷ Leads, CAC = Spend ÷ Gewonnene, Payback = Monate bis die MRR den Spend eingespielt hat.
      </p>

      {/* Leads ohne Meta-Kampagne */}
      {ohneMetaKampagne.length > 0 && (
        <>
          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Leads ohne passende Meta-Kampagne</h2>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={th}>utm_campaign</th>
                  <th style={th}>Leads</th>
                  <th style={th}>Termine</th>
                  <th style={th}>Gewonnen</th>
                  <th style={th}>MRR</th>
                </tr>
              </thead>
              <tbody>
                {ohneMetaKampagne
                  .sort((a, b) => b[1].leads - a[1].leads)
                  .map(([key, v]) => (
                    <tr key={key}>
                      <td style={td}>{key}</td>
                      <td style={td}>{v.leads}</td>
                      <td style={td}>{v.termine}</td>
                      <td style={td}>{v.gewonnen}</td>
                      <td style={td}>{geld(v.mrrCent)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
            Diese Leads haben kein oder ein unbekanntes <code>utm_campaign</code> — z.&nbsp;B. organisch, direkt oder manuell angelegt.
          </p>
        </>
      )}
    </div>
  )
}
