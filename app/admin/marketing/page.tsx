/**
 * /admin/marketing — Meta Ads × Sales
 *
 * Zieht Kampagnen-Kennzahlen live aus der Meta Marketing API und verknüpft sie
 * über utm_campaign mit der CRM-Pipeline (Leads → Erstgespräch → Closing →
 * Closed) und den Verträgen. Daraus: CPL, Closing-Rate, CAC, CLV, LTV:CAC und
 * ROAS je Kampagne — die Basis für Skalierungs-Entscheidungen.
 *
 * Organische Leads (ohne Ads-Attribution) fließen NICHT in CAC/ROAS ein,
 * sie werden nur nachrichtlich ausgewiesen.
 */
import { createClient } from '@/lib/supabase/server'
import { ladeMetaDaten, MetaKampagne } from '@/lib/meta-ads'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const prozent = (anteil: number) =>
  `${(anteil * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })} %`

const faktor = (x: number) => `${x.toLocaleString('de-DE', { maximumFractionDigits: 1 })}×`

interface LeadRow {
  utm_campaign: string | null
  utm_source: string | null
  utm_medium: string | null
  quelle: string
  crm_stage: string
  verloren_grund: string | null
  converted_customer_id: string | null
}

/** Lead kam aus bezahlter Werbung? (quelle=ads oder Paid-UTMs) */
function istAdsLead(l: LeadRow): boolean {
  if (l.quelle === 'ads') return true
  if (l.utm_medium && /cpc|ppc|paid/i.test(l.utm_medium)) return true
  if (l.utm_source && /^(fb|facebook|ig|instagram|meta)$/i.test(l.utm_source.trim())) return true
  return false
}

const ERSTGESPRAECH_PLUS = ['erstgespraech', 'closing_terminiert', 'closing_no_show', 'closed']
const CLOSING_PLUS = ['closing_terminiert', 'closing_no_show', 'closed']

interface SalesJeKampagne {
  leads: number
  erstgespraeche: number
  closings: number
  gewonnen: number
  mrrCent: number
  clvCent: number
}

const leereSales = (): SalesJeKampagne => ({ leads: 0, erstgespraeche: 0, closings: 0, gewonnen: 0, mrrCent: 0, clvCent: 0 })

const ZEITRAEUME = [7, 14, 30, 90]

export default async function MarketingPage({ searchParams }: { searchParams: { tage?: string } }) {
  const tage = ZEITRAEUME.includes(Number(searchParams.tage)) ? Number(searchParams.tage) : 30

  const supabase = createClient()
  const von = new Date(Date.now() - (tage - 1) * 24 * 60 * 60 * 1000)

  const [meta, { data: leadsData }, { data: contractsData }, eventsRes] = await Promise.all([
    ladeMetaDaten(tage),
    supabase
      .from('leads')
      .select('utm_campaign, utm_source, utm_medium, quelle, crm_stage, verloren_grund, converted_customer_id')
      .gte('created_at', von.toISOString()),
    supabase.from('contracts').select('customer_id, monatsrate_cent, laufzeit_monate, status'),
    supabase.from('lead_stage_events').select('zu_stage').gte('created_at', von.toISOString()),
  ])

  const alleLeads = (leadsData ?? []) as LeadRow[]
  const contracts = contractsData ?? []
  // Migration 038 evtl. noch nicht angewendet → Protokoll-Strip einfach ausblenden
  const events = (eventsRes.error ? [] : eventsRes.data ?? []) as { zu_stage: string }[]

  const adsLeads = alleLeads.filter(istAdsLead)
  const organischeLeads = alleLeads.length - adsLeads.length

  const waehrung = meta.ok ? meta.daten.konto.currency : 'EUR'
  const geld = (cent: number, nachkomma = 0) =>
    (cent / 100).toLocaleString('de-DE', { style: 'currency', currency: waehrung, maximumFractionDigits: nachkomma })

  // MRR + CLV je Kunde aus aktiven Verträgen.
  // CLV = Monatsrate × Vertragslaufzeit (z. B. 89 € × 24 Monate = 2.136 €),
  // liest die Vertragszeile — Konditions-Änderungen sind automatisch drin.
  const mrrJeKunde = new Map<string, number>()
  const clvJeKunde = new Map<string, number>()
  for (const c of contracts) {
    if (c.status !== 'AKTIV') continue
    const kunde = c.customer_id as string
    const rate = c.monatsrate_cent as number
    const laufzeit = (c.laufzeit_monate as number) || 24
    mrrJeKunde.set(kunde, (mrrJeKunde.get(kunde) ?? 0) + rate)
    clvJeKunde.set(kunde, (clvJeKunde.get(kunde) ?? 0) + rate * laufzeit)
  }

  // Sales-Kennzahlen je utm_campaign (nur Ads-Leads, Kleinschreibung normalisiert)
  const norm = (s: string) => s.trim().toLowerCase()
  const salesMap = new Map<string, SalesJeKampagne>()
  const zaehle = (ziel: SalesJeKampagne, lead: LeadRow) => {
    ziel.leads++
    if (ERSTGESPRAECH_PLUS.includes(lead.crm_stage)) ziel.erstgespraeche++
    if (CLOSING_PLUS.includes(lead.crm_stage)) ziel.closings++
    if (lead.crm_stage === 'closed') {
      ziel.gewonnen++
      if (lead.converted_customer_id) {
        ziel.mrrCent += mrrJeKunde.get(lead.converted_customer_id) ?? 0
        ziel.clvCent += clvJeKunde.get(lead.converted_customer_id) ?? 0
      }
    }
  }
  for (const lead of adsLeads) {
    const key = lead.utm_campaign ? norm(lead.utm_campaign) : '(ohne kampagne)'
    const zeile = salesMap.get(key) ?? leereSales()
    zaehle(zeile, lead)
    salesMap.set(key, zeile)
  }

  // Meta-Kampagnen mit Sales verknüpfen
  const kampagnen = meta.ok ? meta.daten.kampagnen : []
  const zugeordnet = new Set<string>()
  const zeilen = kampagnen.map((k) => {
    const sales = salesMap.get(norm(k.kampagne))
    if (sales) zugeordnet.add(norm(k.kampagne))
    return { ...k, sales: sales ?? leereSales() }
  })
  const ohneMetaKampagne = Array.from(salesMap.entries()).filter(([key]) => !zugeordnet.has(key))

  // Gesamt-KPIs (Ads-Leads gesamt, nicht nur gematchte)
  const sum = (fn: (k: MetaKampagne) => number) => kampagnen.reduce((s, k) => s + fn(k), 0)
  const spendCent = sum((k) => k.spendCent)
  const impressions = sum((k) => k.impressions)
  const linkKlicks = sum((k) => k.linkKlicks)
  const metaLeads = sum((k) => k.metaLeads)

  const gesamt = leereSales()
  for (const lead of adsLeads) zaehle(gesamt, lead)

  const cplCent = gesamt.leads > 0 ? Math.round(spendCent / gesamt.leads) : 0
  const cacCent = gesamt.gewonnen > 0 ? Math.round(spendCent / gesamt.gewonnen) : 0
  const closingRate = gesamt.leads > 0 ? gesamt.gewonnen / gesamt.leads : 0
  const leadsProKunde = closingRate > 0 ? 1 / closingRate : 0
  const avgClvCent = gesamt.gewonnen > 0 ? Math.round(gesamt.clvCent / gesamt.gewonnen) : 0
  const ltvCac = cacCent > 0 && avgClvCent > 0 ? avgClvCent / cacCent : 0
  const roas = spendCent > 0 && gesamt.clvCent > 0 ? gesamt.clvCent / spendCent : 0
  const paybackMonate = gesamt.mrrCent > 0 ? spendCent / gesamt.mrrCent : 0

  // Verlust-Gründe (Ads-Leads)
  const verlorenMap = new Map<string, number>()
  for (const lead of adsLeads) {
    if (lead.crm_stage !== 'verloren') continue
    const grund = lead.verloren_grund?.trim() || '(kein Grund erfasst)'
    verlorenMap.set(grund, (verlorenMap.get(grund) ?? 0) + 1)
  }
  const verlorenGruende = Array.from(verlorenMap.entries()).sort((a, b) => b[1] - a[1])

  // Aktivität laut Verlaufsprotokoll (Stage-Wechsel IM Zeitraum, alle Leads)
  const eventCount = (stage: string) => events.filter((e) => e.zu_stage === stage).length

  const maxTagCent = meta.ok ? Math.max(1, ...meta.daten.tage.map((t) => t.spendCent)) : 1

  // ── Render ──────────────────────────────────────────────────
  const kpiCard = (label: string, wert: string, detail?: string) => (
    <div key={label} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{wert}</div>
      {detail && <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>{detail}</div>}
    </div>
  )

  const th: React.CSSProperties = { textAlign: 'left', padding: '10px 10px', fontSize: '12px', color: '#6B7280', borderBottom: '1px solid #E5E7EB', fontWeight: 600, whiteSpace: 'nowrap' }
  const td: React.CSSProperties = { padding: '10px 10px', fontSize: '13px', color: '#111827', borderBottom: '1px solid #F3F4F6', whiteSpace: 'nowrap' }

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
        Meta Ads live aus der Marketing API × CRM-Pipeline × Verträge. Nur Ads-Leads —
        {organischeLeads > 0 ? ` ${organischeLeads} organische Leads im Zeitraum bleiben außen vor.` : ' organische Leads bleiben außen vor.'}
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

      {/* Zeile 1: Ads-Rohdaten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {kpiCard('Ad-Spend', geld(spendCent), `${tage} Tage`)}
        {kpiCard('Impressionen', impressions.toLocaleString('de-DE'), linkKlicks > 0 ? `${linkKlicks.toLocaleString('de-DE')} Link-Klicks (CTR ${prozent(impressions > 0 ? linkKlicks / impressions : 0)})` : undefined)}
        {kpiCard('Meta-Leads', String(metaLeads), metaLeads > 0 ? `CPL laut Meta ${geld(Math.round(spendCent / metaLeads), 2)}` : 'laut Meta-Attribution')}
        {kpiCard('Ads-Leads in DB', String(gesamt.leads), gesamt.leads > 0 ? `CPL echt ${geld(cplCent, 2)}` : `im Zeitraum (${tage} Tage)`)}
      </div>

      {/* Zeile 2: Funnel & Closing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
        {kpiCard('Erstgespräche', String(gesamt.erstgespraeche), gesamt.leads > 0 ? `${prozent(gesamt.erstgespraeche / gesamt.leads)} der Ads-Leads` : undefined)}
        {kpiCard('Closings terminiert', String(gesamt.closings), gesamt.erstgespraeche > 0 ? `${prozent(gesamt.closings / gesamt.erstgespraeche)} nach Erstgespräch` : undefined)}
        {kpiCard('Gewonnen', String(gesamt.gewonnen), `Closing-Rate ${prozent(closingRate)}`)}
        {kpiCard('Leads pro Kunde', leadsProKunde > 0 ? leadsProKunde.toLocaleString('de-DE', { maximumFractionDigits: 1 }) : '—', leadsProKunde > 0 && cplCent > 0 ? `≈ ${geld(Math.round(leadsProKunde * cplCent))} Spend pro Kunde` : 'noch kein Abschluss im Zeitraum')}
      </div>

      {/* Zeile 3: Unit Economics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {kpiCard('CAC', cacCent > 0 ? geld(cacCent) : '—', 'Spend ÷ gewonnene Kunden')}
        {kpiCard('Ø CLV je Neukunde', avgClvCent > 0 ? geld(avgClvCent) : '—', 'Monatsrate × Vertragslaufzeit')}
        {kpiCard('LTV : CAC', ltvCac > 0 ? faktor(ltvCac) : '—', ltvCac >= 3 ? 'gesund (≥ 3×) → skalieren' : ltvCac > 0 ? 'unter 3× — Vorsicht beim Skalieren' : undefined)}
        {kpiCard('ROAS', roas > 0 ? faktor(roas) : '—', paybackMonate > 0 ? `CLV ÷ Spend · Payback ${paybackMonate.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mon.` : 'CLV ÷ Spend')}
      </div>

      {/* Aktivität im Zeitraum (Verlaufsprotokoll) */}
      {events.length > 0 && (
        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '-20px', marginBottom: '28px' }}>
          Aktivität im Zeitraum (Verlaufsprotokoll, alle Leads): {eventCount('erstgespraech')} Erstgespräche vereinbart ·{' '}
          {eventCount('closing_terminiert')} Closings terminiert · {eventCount('closed')} Abschlüsse · {eventCount('verloren')} verloren.
          Das Protokoll füllt sich mit jedem Stage-Wechsel ab jetzt.
        </p>
      )}

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
              <th style={th}>CTR</th>
              <th style={th}>CPC</th>
              <th style={th} title="Leads laut Meta-Attribution">Meta-L.</th>
              <th style={th} title="Ads-Leads in der eigenen Datenbank">Leads</th>
              <th style={th}>CPL</th>
              <th style={th} title="Erstgespräch oder weiter">Erstg.</th>
              <th style={th}>Gewonnen</th>
              <th style={th}>CAC</th>
              <th style={th}>MRR</th>
              <th style={th} title="Monatsrate × Vertragslaufzeit der gewonnenen Kunden">CLV</th>
              <th style={th} title="CLV ÷ Spend">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.length === 0 && (
              <tr><td style={td} colSpan={13}>{meta.ok ? `Keine Kampagnen-Daten im Zeitraum (${tage} Tage).` : 'Keine Meta-Daten — Verbindung oben prüfen.'}</td></tr>
            )}
            {zeilen.map((z) => {
              const zRoas = z.spendCent > 0 && z.sales.clvCent > 0 ? z.sales.clvCent / z.spendCent : 0
              return (
                <tr key={z.kampagne}>
                  <td style={{ ...td, whiteSpace: 'normal', minWidth: '160px', fontWeight: 600 }}>{z.kampagne}</td>
                  <td style={td}>{geld(z.spendCent, 2)}</td>
                  <td style={td}>{prozent(z.ctr)}</td>
                  <td style={td}>{z.cpcCent > 0 ? geld(z.cpcCent, 2) : '—'}</td>
                  <td style={td}>{z.metaLeads}</td>
                  <td style={td}>{z.sales.leads}</td>
                  <td style={td}>{z.sales.leads > 0 ? geld(Math.round(z.spendCent / z.sales.leads), 2) : '—'}</td>
                  <td style={td}>{z.sales.erstgespraeche}</td>
                  <td style={td}>{z.sales.gewonnen}{z.sales.leads > 0 && z.sales.gewonnen > 0 ? ` (${prozent(z.sales.gewonnen / z.sales.leads)})` : ''}</td>
                  <td style={td}>{z.sales.gewonnen > 0 ? geld(Math.round(z.spendCent / z.sales.gewonnen)) : '—'}</td>
                  <td style={td}>{geld(z.sales.mrrCent)}</td>
                  <td style={td}>{geld(z.sales.clvCent)}</td>
                  <td style={{ ...td, fontWeight: zRoas >= 3 ? 700 : 400, color: zRoas === 0 ? '#111827' : zRoas >= 3 ? '#15803D' : '#B45309' }}>{zRoas > 0 ? faktor(zRoas) : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '32px' }}>
        Zuordnung über <code>utm_campaign</code> = Meta-Kampagnenname (Groß-/Kleinschreibung egal) — in den Anzeigen
        <code> utm_campaign={'{{campaign.name}}'}&utm_source=fb&utm_medium=cpc</code> setzen. Als Ads-Lead zählt:
        Quelle „ads&ldquo;, UTM-Medium cpc/paid oder UTM-Source fb/ig/meta. CLV = Monatsrate × Vertragslaufzeit,
        MRR und CLV setzen den Kauf über den Stripe-Checkout voraus (verknüpft den Lead automatisch mit dem Vertrag).
      </p>

      {/* Leads ohne Meta-Kampagne + Verlust-Gründe */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {ohneMetaKampagne.length > 0 && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Ads-Leads ohne passende Meta-Kampagne</h2>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>utm_campaign</th>
                    <th style={th}>Leads</th>
                    <th style={th}>Gewonnen</th>
                    <th style={th}>CLV</th>
                  </tr>
                </thead>
                <tbody>
                  {ohneMetaKampagne
                    .sort((a, b) => b[1].leads - a[1].leads)
                    .map(([key, v]) => (
                      <tr key={key}>
                        <td style={td}>{key}</td>
                        <td style={td}>{v.leads}</td>
                        <td style={td}>{v.gewonnen}</td>
                        <td style={td}>{geld(v.clvCent)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              utm_campaign passt zu keiner aktiven Meta-Kampagne im Zeitraum — z.&nbsp;B. pausierte oder umbenannte Kampagnen.
            </p>
          </div>
        )}

        {verlorenGruende.length > 0 && (
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Verlust-Gründe (Ads-Leads)</h2>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', overflow: 'hidden', marginBottom: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Grund</th>
                    <th style={th}>Leads</th>
                  </tr>
                </thead>
                <tbody>
                  {verlorenGruende.map(([grund, anzahl]) => (
                    <tr key={grund}>
                      <td style={{ ...td, whiteSpace: 'normal' }}>{grund}</td>
                      <td style={td}>{anzahl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>
              Wird im CRM beim Verschieben auf „Verloren&ldquo; abgefragt.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
