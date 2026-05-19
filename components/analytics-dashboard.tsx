'use client'

import { useState, useEffect, useCallback } from 'react'
import { Site } from '@/types'
import { Eye, Users, TrendingUp, BarChart3, Globe, Loader2, Calendar } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  todayViews: number
  uniqueVisitors: number
  topPages: { path: string; views: number }[]
  topReferrers: { source: string; views: number }[]
  dailyViews: { date: string; views: number }[]
  days: number
}

export default function AnalyticsDashboard({ site }: { site: Site }) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/sites/${site.id}/analytics?days=${days}`)
    if (res.ok) setData(await res.json())
    setLoading(false)
  }, [site.id, days])

  useEffect(() => { load() }, [load])

  const maxDaily = data ? Math.max(...data.dailyViews.map((d) => d.views), 1) : 1

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.4)' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--za-fg)' }}>Analytics</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar style={{ width: '14px', height: '14px', color: 'var(--za-fg-4)' }} />
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', border: '1px solid', cursor: 'pointer', fontFamily: 'inherit', fontWeight: days === d ? 600 : 400, background: days === d ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.6)', color: days === d ? '#fff' : 'var(--za-fg-3)', borderColor: days === d ? 'transparent' : 'var(--za-border)' }}>
              {d}T
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
          <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', color: 'var(--za-fg-4)' }} />
        </div>
      ) : !data ? (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--za-fg-3)' }}>Fehler beim Laden</div>
      ) : (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 24px 64px' }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <KPI icon={<Eye />} label="Seitenaufrufe" value={data.totalViews} sub={`Letzte ${data.days} Tage`} delay={0} />
            <KPI icon={<TrendingUp />} label="Heute" value={data.todayViews} sub="Aufrufe heute" delay={80} />
            <KPI icon={<Users />} label="Besucher" value={data.uniqueVisitors} sub="Unique (ca.)" delay={160} />
          </div>

          {/* Chart */}
          <div className="glass fade-up" style={{ padding: '24px', marginBottom: '16px', animationDelay: '240ms' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <BarChart3 style={{ width: '16px', height: '16px', color: 'var(--za-gold)' }} />
                <span className="za-title" style={{ fontSize: '14px' }}>Aufrufe pro Tag</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '140px' }}>
                {data.dailyViews.map((d, i) => {
                  const pct = Math.max((d.views / maxDaily) * 100, 2)
                  return (
                    <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div title={`${d.date}: ${d.views}`}
                        style={{ width: '100%', maxWidth: '20px', height: `${pct}%`, minHeight: '2px', background: 'var(--za-gold-grad)', borderRadius: '3px 3px 0 0', transition: 'height 300ms', opacity: 0.8 + (i / data.dailyViews.length) * 0.2 }} />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '10px', color: 'var(--za-fg-4)' }}>
                <span>{data.dailyViews[0]?.date ? new Date(data.dailyViews[0].date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) : ''}</span>
                <span>{data.dailyViews[data.dailyViews.length - 1]?.date ? new Date(data.dailyViews[data.dailyViews.length - 1].date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }) : ''}</span>
              </div>
            </div>
          </div>

          {/* Top Pages + Referrers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="glass fade-up" style={{ padding: '24px', animationDelay: '320ms' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="za-eyebrow">Beliebteste Seiten</span>
                {data.topPages.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--za-fg-4)', marginTop: '16px' }}>Noch keine Daten</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                    {data.topPages.map((p) => (
                      <div key={p.path} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--za-fg)', fontWeight: 500, fontFamily: 'monospace' }}>{p.path}</span>
                        <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 600, color: 'var(--za-fg)' }}>{p.views}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="glass fade-up" style={{ padding: '24px', animationDelay: '400ms' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Globe style={{ width: '12px', height: '12px', color: 'var(--za-gold)' }} />
                  <span className="za-eyebrow">Top Quellen</span>
                </div>
                {data.topReferrers.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--za-fg-4)' }}>Noch keine Daten</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {data.topReferrers.map((r) => (
                      <div key={r.source} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                        <span style={{ color: 'var(--za-fg)', fontWeight: 500 }}>{r.source}</span>
                        <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontWeight: 600, color: 'var(--za-fg)' }}>{r.views}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

function KPI({ icon, label, value, sub, delay }: { icon: React.ReactNode; label: string; value: number; sub: string; delay: number }) {
  return (
    <div className="glass fade-up" style={{ padding: '20px', animationDelay: `${delay}ms` }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(42,111,219,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--za-gold)' }}>{icon}</div>
          <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-3)', fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '28px', fontWeight: 700, color: 'var(--za-fg)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {value.toLocaleString('de-DE')}
        </div>
        <span style={{ fontSize: '10px', color: 'var(--za-fg-4)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginTop: '4px' }}>{sub}</span>
      </div>
    </div>
  )
}
