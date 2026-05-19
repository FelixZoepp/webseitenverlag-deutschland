import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface UpsellItem {
  name: string
  price: number
  status: 'open' | 'pitched' | 'won' | 'lost'
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const supabase = createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*, sites(count)')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })

  const { count: totalSites } = await supabase.from('sites').select('*', { count: 'exact', head: true })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const { count: leadsThisMonth } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)
    .neq('status', 'spam')

  const activeCustomers = (customers || []).filter((c) => c.status !== 'churned')
  const mrr = activeCustomers.reduce((sum, c) => sum + (parseFloat(c.monthly_price) || 0), 0)
  const arr = mrr * 12
  const totalContractValue = activeCustomers.reduce((sum, c) => {
    const years = c.contract_years || 4
    const monthly = parseFloat(c.monthly_price) || 0
    const setup = parseFloat(c.setup_fee) || 0
    return sum + (monthly * 12 * years) + setup
  }, 0)

  // ARR over 4 years
  const arrByYear: { year: number; revenue: number; customers: number }[] = []
  for (let y = 0; y < 4; y++) {
    const yearDate = new Date(now.getFullYear() + y, 0, 1)
    const yearEnd = new Date(now.getFullYear() + y, 11, 31)
    const activeInYear = activeCustomers.filter((c) => {
      if (!c.contract_start) return true
      const start = new Date(c.contract_start)
      const end = c.contract_end ? new Date(c.contract_end) : new Date(start.getFullYear() + (c.contract_years || 4), start.getMonth(), start.getDate())
      return start <= yearEnd && end >= yearDate
    })
    arrByYear.push({ year: now.getFullYear() + y, revenue: activeInYear.reduce((s, c) => s + (parseFloat(c.monthly_price) || 0) * 12, 0), customers: activeInYear.length })
  }

  // Upsells
  const allUpsells: (UpsellItem & { customerName: string })[] = []
  for (const c of activeCustomers) {
    for (const u of (c.upsell_potential || []) as UpsellItem[]) {
      allUpsells.push({ ...u, customerName: c.company_name || c.contact_email })
    }
  }
  const openUpsells = allUpsells.filter((u) => u.status === 'open' || u.status === 'pitched')
  const potentialUpsellMRR = openUpsells.reduce((s, u) => s + u.price, 0)
  const wonUpsellMRR = allUpsells.filter((u) => u.status === 'won').reduce((s, u) => s + u.price, 0)

  // Expiring contracts
  const sixMonths = new Date(now.getFullYear(), now.getMonth() + 6, now.getDate())
  const expiringContracts = activeCustomers.filter((c) => {
    if (!c.contract_end) return false
    const end = new Date(c.contract_end)
    return end <= sixMonths && end >= now
  })

  const { data: recentSites } = await supabase
    .from('sites')
    .select('*, customers!inner(company_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const weekday = now.toLocaleDateString('de-DE', { weekday: 'long' })
  const kw = getWeekNumber(now)

  return (
    <>
      {/* Topbar */}
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">{weekday} · KW {kw}</span>
          <span className="tb-heading">Dashboard</span>
        </div>
        <div style={{ flex: 1 }} />
        <Link href="/admin/customers/new"
          style={{ background: 'var(--za-gold-grad)', color: '#fff', padding: '9px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' as const, textDecoration: 'none', boxShadow: '0 4px 14px -4px rgba(42,111,219,0.50)' }}>
          + Neuer Kunde
        </Link>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <KPI label="MRR" value={fmt(mrr)} unit="€" sub={`${activeCustomers.length} aktive Kunden`} delay={60} />
        <KPI label="ARR" value={fmt(arr)} unit="€" sub="Jährlich wiederkehrend" delay={140} />
        <KPI label="Sites" value={String(totalSites || 0)} sub={`${activeCustomers.length} Kunden`} delay={220} />
        <KPI label="Leads · MTD" value={String(leadsThisMonth || 0)} sub={now.toLocaleDateString('de-DE', { month: 'long' })} delay={300} />
      </div>

      {/* ARR Forecast + Upsells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="panel fade-up" style={{ animationDelay: '360ms' }}>
          <div style={{ marginBottom: '18px' }}>
            <span className="panel-eyebrow">Prognose · 4 Jahre</span>
            <div className="panel-title">ARR-Entwicklung (Vertragslaufzeit)</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {arrByYear.map((y) => {
              const max = Math.max(...arrByYear.map((a) => a.revenue), 1)
              const pct = Math.max((y.revenue / max) * 100, 5)
              return (
                <div key={y.year}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--za-fg)' }}>{y.year}</span>
                    <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 600, color: 'var(--za-fg)' }}>{fmt(y.revenue)} €</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '4px', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>
                    {y.customers} Kunden
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--za-border)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: 'var(--za-fg-3)' }}>Gesamtvertragswert</span>
            <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 700, color: 'var(--za-fg)' }}>{fmt(totalContractValue)} €</span>
          </div>
        </div>

        <div className="panel fade-up" style={{ animationDelay: '420ms' }}>
          <div style={{ marginBottom: '18px' }}>
            <span className="panel-eyebrow">Revenue</span>
            <div className="panel-title">Upsell-Potenzial</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--za-fg-2)' }}>Offene Upsells</span>
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '20px', color: 'var(--za-gold)' }}>{openUpsells.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--za-fg-2)' }}>Potenzial MRR</span>
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '20px', color: 'var(--za-gold)' }}>+{fmt(potentialUpsellMRR)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--za-fg-2)' }}>Gewonnene Upsells</span>
              <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '20px', color: 'var(--za-success)' }}>+{fmt(wonUpsellMRR)} €/m</span>
            </div>
          </div>
          {openUpsells.length > 0 && (
            <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--za-border)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openUpsells.slice(0, 4).map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--za-fg)' }}>{u.name}</span>
                    <span style={{ color: 'var(--za-fg-4)', fontSize: '10px', marginLeft: '6px' }}>{u.customerName}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--za-fg)' }}>{fmt(u.price)} €</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Expiring + Recent Sites */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
        <div className="panel fade-up" style={{ animationDelay: '480ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <span className="panel-eyebrow">Achtung</span>
              <div className="panel-title">Auslaufende Verträge</div>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--za-fg-3)', letterSpacing: '0.2em', textTransform: 'uppercase' as const }}>6 Monate</span>
          </div>
          {expiringContracts.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--za-fg-3)', textAlign: 'center', padding: '24px 0' }}>Keine auslaufenden Verträge</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expiringContracts.map((c) => (
                <Link key={c.id} href={`/admin/customers/${c.id}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'background 240ms' }}>
                  <span style={{ fontWeight: 500, color: 'var(--za-fg)' }}>{c.company_name}</span>
                  <span style={{ color: 'var(--za-danger)', fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em' }}>
                    {c.contract_end ? new Date(c.contract_end).toLocaleDateString('de-DE') : '—'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="panel fade-up" style={{ animationDelay: '540ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <span className="panel-eyebrow">Letzte Sites</span>
              <div className="panel-title">Aktivität</div>
            </div>
            <Link href="/admin/sites" style={{ fontSize: '10px', color: 'var(--za-gold)', letterSpacing: '0.2em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>Alle →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(recentSites || []).map((site) => (
              <Link key={site.id} href={`/dashboard/${site.id}`}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '8px 10px', borderRadius: '8px', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '26px', height: '26px', borderRadius: '6px', display: 'grid', placeItems: 'center', background: 'var(--za-gold-grad)', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '11px', color: '#fff' }}>
                    {((site.customers as Record<string, string>)?.company_name || 'S').charAt(0)}
                  </span>
                  <span style={{ fontWeight: 500, color: 'var(--za-fg)' }}>{site.name}</span>
                </div>
                <span className={site.status === 'published' ? 'status-active' : 'status-draft'}>
                  {site.status === 'published' ? 'Live' : 'Entwurf'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="panel fade-up" style={{ animationDelay: '600ms' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
          <div>
            <span className="panel-eyebrow">Portfolio</span>
            <div className="panel-title">Kunden nach MRR</div>
          </div>
          <Link href="/admin/customers" style={{ fontSize: '10px', color: 'var(--za-gold)', letterSpacing: '0.2em', textTransform: 'uppercase' as const, textDecoration: 'none' }}>Alle Kunden →</Link>
        </div>
        <div style={{ borderRadius: '10px', overflow: 'hidden' }}>
          <table className="glass-table">
            <thead>
              <tr>
                <th>Kunde</th>
                <th>MRR</th>
                <th>Vertrag</th>
                <th>Gesamtwert</th>
                <th>Sites</th>
                <th>Upsells</th>
              </tr>
            </thead>
            <tbody>
              {(customers || [])
                .sort((a, b) => (parseFloat(b.monthly_price) || 0) - (parseFloat(a.monthly_price) || 0))
                .slice(0, 10)
                .map((c) => {
                  const monthly = parseFloat(c.monthly_price) || 0
                  const years = c.contract_years || 4
                  const setup = parseFloat(c.setup_fee) || 0
                  const total = (monthly * 12 * years) + setup
                  const upsells = (c.upsell_potential || []) as UpsellItem[]
                  const openCount = upsells.filter((u) => u.status === 'open' || u.status === 'pitched').length
                  const siteCount = (c.sites as Array<Record<string, number>>)?.[0]?.count || 0

                  return (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '26px', height: '26px', borderRadius: '6px', display: 'grid', placeItems: 'center', background: 'var(--za-gold-grad)', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '11px', color: '#fff', flexShrink: 0 }}>
                            {(c.company_name || '?').charAt(0)}
                          </span>
                          <Link href={`/admin/customers/${c.id}`} style={{ color: 'var(--za-fg)', fontWeight: 500, textDecoration: 'none' }}>
                            {c.company_name || '—'}
                          </Link>
                        </div>
                      </td>
                      <td style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 600, color: 'var(--za-fg)' }}>
                        {monthly > 0 ? `${fmt(monthly)} €` : '—'}
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        {c.contract_start ? `${years}J` : '—'}
                      </td>
                      <td style={{ fontSize: '11px' }}>{total > 0 ? `${fmt(total)} €` : '—'}</td>
                      <td>{siteCount}</td>
                      <td>
                        {openCount > 0 ? (
                          <span style={{ background: 'rgba(42,111,219,0.10)', color: 'var(--za-gold)', fontWeight: 600, fontSize: '10px', padding: '3px 8px', borderRadius: '999px' }}>{openCount} offen</span>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
          {(!customers || customers.length === 0) && (
            <p style={{ padding: '32px', textAlign: 'center', fontSize: '12px', color: 'var(--za-fg-3)' }}>Noch keine Kunden.</p>
          )}
        </div>
      </div>
    </>
  )
}

function KPI({ label, value, unit, sub, delay }: { label: string; value: string; unit?: string; sub: string; delay: number }) {
  return (
    <div className="panel fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', position: 'relative', zIndex: 2 }}>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value" style={{ position: 'relative', zIndex: 2 }}>
        {unit && <span style={{ color: 'var(--za-gold)', fontSize: '22px', marginRight: '2px' }}>{unit}</span>}
        {value}
      </div>
      <div style={{ marginTop: '8px', position: 'relative', zIndex: 2 }}>
        <span style={{ fontSize: '10px', color: 'var(--za-fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' as const }}>{sub}</span>
      </div>
    </div>
  )
}

function getWeekNumber(d: Date): number {
  const oneJan = new Date(d.getFullYear(), 0, 1)
  const days = Math.floor((d.getTime() - oneJan.getTime()) / 86400000)
  return Math.ceil((days + oneJan.getDay() + 1) / 7)
}
