'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Search, Eye, Check, X, CheckCircle2, Clock } from 'lucide-react'

interface SeoSeite {
  id: string
  monat: string
  keyword: string
  slug: string
  status: 'WARTET_AUF_FREIGABE' | 'FREIGEGEBEN' | 'ABGELEHNT'
  seo_check: Record<string, unknown> | null
  freigegeben_am: string | null
  created_at: string
}

const STATUS_LABEL: Record<SeoSeite['status'], { text: string; bg: string; fg: string }> = {
  WARTET_AUF_FREIGABE: { text: 'Wartet auf Freigabe', bg: '#FFFBEB', fg: '#B45309' },
  FREIGEGEBEN: { text: 'Online', bg: '#F0FDF4', fg: '#16A34A' },
  ABGELEHNT: { text: 'Abgelehnt', bg: '#F3F4F6', fg: '#6B7280' },
}

export default function SeoPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [seiten, setSeiten] = useState<SeoSeite[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const laden = useCallback(async () => {
    try {
      const r = await fetch(`/api/sites/${siteId}/seo`)
      if (r.ok) {
        const data = await r.json()
        setSeiten(data.seiten || [])
      }
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => { laden() }, [laden])

  const aktion = async (lpId: string, was: 'freigeben' | 'ablehnen') => {
    setBusy(lpId)
    try {
      await fetch(`/api/sites/${siteId}/seo/${lpId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aktion: was }),
      })
      await laden()
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} /></div>
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>SEO-Seiten</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
        Jeden Monat eine neue Keyword-Seite — Sie schauen kurz drüber und schalten mit einem Klick frei.
      </p>

      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {seiten.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <Search style={{ width: '32px', height: '32px', color: '#D1D5DB', margin: '0 auto 12px' }} />
            <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
              Noch keine SEO-Seiten — die erste Seite wird am Monatsanfang automatisch erstellt.
            </p>
          </div>
        ) : (
          seiten.map((s) => {
            const label = STATUS_LABEL[s.status]
            const check = s.seo_check || {}
            return (
              <div key={s.id} style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {s.status === 'FREIGEGEBEN'
                      ? <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                      : <Clock style={{ width: '18px', height: '18px', color: s.status === 'ABGELEHNT' ? '#9CA3AF' : '#B45309' }} />}
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{s.keyword}</p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF' }}>
                        {new Date(s.monat).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })} · /{s.slug}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: label.bg, color: label.fg, fontWeight: 600 }}>{label.text}</span>
                    <a
                      href={`/api/sites/${siteId}/seo/${s.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', background: '#fff', fontSize: '12px', color: '#374151', textDecoration: 'none' }}
                    >
                      <Eye style={{ width: '12px', height: '12px' }} /> Vorschau
                    </a>
                    {s.status === 'WARTET_AUF_FREIGABE' && (
                      <>
                        <button
                          onClick={() => aktion(s.id, 'freigeben')}
                          disabled={busy === s.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#16A34A', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {busy === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check style={{ width: '12px', height: '12px' }} />}
                          Freigeben
                        </button>
                        <button
                          onClick={() => aktion(s.id, 'ablehnen')}
                          disabled={busy === s.id}
                          title="Ablehnen"
                          style={{ padding: '6px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', color: '#9CA3AF' }}
                        >
                          <X style={{ width: '13px', height: '13px' }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {Boolean(check.titel_ok !== undefined) && (
                  <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px', paddingLeft: '28px' }}>
                    Technischer Check: Titel {check.titel_ok ? '✓' : '✗'} · Beschreibung {check.beschreibung_ok ? '✓' : '✗'} · Keyword in H1 {check.h1_enthaelt_keyword ? '✓' : '✗'} · {String(check.groesse_kb ?? '?')} KB
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
