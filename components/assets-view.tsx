'use client'

/**
 * MVP-Finish §3.5 — Freigabe-UI der Asset-Bank (Client).
 *
 * Grid + Filter (Branche/Szene/Status), Großansicht per Klick,
 * Approve/Reject/Regenerate, Alt-Text-Feld (vorbefüllt, korrigierbar).
 * Paare (pair_id) werden als EINE Karte mit beiden Hälften gezeigt —
 * Freigabe/Ablehnung wirkt server-seitig immer auf beide.
 * STUB-Assets (quelle='ai_mock') sind markiert und nicht approvebar.
 */

import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw, X, XCircle } from 'lucide-react'

export interface AssetZeile {
  id: string
  url: string
  branchen: string[]
  style_tags: string[]
  szene_typ: string
  pair_id: string | null
  quelle: string
  aspect_ratio: string | null
  alt_text_de: string | null
  breite: number | null
  hoehe: number | null
  kosten_cent: number
  quality_status: 'draft' | 'approved' | 'rejected'
  created_at: string
}

/** Karte: Einzel-Asset oder Paar (nachher+vorher) */
interface Karte {
  key: string
  assets: AssetZeile[] // 1 (einzeln) oder 2 (Paar, nachher zuerst)
  istPaar: boolean
}

const STATUS_FARBEN: Record<string, { bg: string; fg: string; label: string }> = {
  draft: { bg: 'rgba(245,158,11,0.12)', fg: '#b45309', label: 'Draft' },
  approved: { bg: 'rgba(16,185,129,0.12)', fg: '#059669', label: 'Approved' },
  rejected: { bg: 'rgba(220,38,38,0.12)', fg: '#b91c1c', label: 'Rejected' },
}

const btn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
  borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)',
  background: 'rgba(255,255,255,0.6)', color: 'var(--za-fg-2)', cursor: 'pointer', fontFamily: 'inherit',
}

export default function AssetsView({ zeilen }: { zeilen: AssetZeile[] }) {
  const [rows, setRows] = useState(zeilen)
  const [filterBranche, setFilterBranche] = useState('')
  const [filterSzene, setFilterSzene] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [gross, setGross] = useState<Karte | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [hinweis, setHinweis] = useState<string | null>(null)
  const [altEntwurf, setAltEntwurf] = useState<Record<string, string>>({})

  const branchen = useMemo(() => Array.from(new Set(rows.flatMap((r) => r.branchen))).sort(), [rows])
  const szenen = useMemo(() => Array.from(new Set(rows.map((r) => r.szene_typ).filter(Boolean))).sort(), [rows])

  const karten = useMemo<Karte[]>(() => {
    const gefiltert = rows.filter((r) =>
      (!filterBranche || r.branchen.includes(filterBranche)) &&
      (!filterSzene || r.szene_typ === filterSzene) &&
      (!filterStatus || r.quality_status === filterStatus)
    )
    const paarGruppen = new Map<string, AssetZeile[]>()
    const einzel: AssetZeile[] = []
    for (const r of gefiltert) {
      if (r.pair_id) {
        const g = paarGruppen.get(r.pair_id) ?? []
        g.push(r)
        paarGruppen.set(r.pair_id, g)
      } else {
        einzel.push(r)
      }
    }
    const karten: Karte[] = []
    paarGruppen.forEach((gruppe, pairId) => {
      // nachher zuerst (BF §2.2)
      gruppe.sort((a: AssetZeile, b: AssetZeile) => (a.szene_typ === 'nachher' ? -1 : b.szene_typ === 'nachher' ? 1 : 0))
      karten.push({ key: `paar-${pairId}`, assets: gruppe, istPaar: true })
    })
    for (const r of einzel) karten.push({ key: r.id, assets: [r], istPaar: false })
    karten.sort((a, b) => (b.assets[0].created_at > a.assets[0].created_at ? 1 : -1))
    return karten
  }, [rows, filterBranche, filterSzene, filterStatus])

  const approvedCount = rows.filter((r) => r.quality_status === 'approved').length
  const paarCount = new Set(rows.filter((r) => r.pair_id && r.quality_status === 'approved').map((r) => r.pair_id)).size

  async function aktion(assetId: string, action: 'approve' | 'reject' | 'draft' | 'alt' | 'regenerate', text?: string) {
    setBusy(assetId)
    setFehler(null)
    setHinweis(null)
    try {
      const res = await fetch(`/api/admin/assets/${assetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      if (action === 'alt') {
        setRows((alt) => alt.map((r) => (r.id === assetId ? { ...r, alt_text_de: json.alt_text_de } : r)))
        setHinweis('Alt-Text gespeichert.')
      } else if (action === 'regenerate') {
        setHinweis(`Regeneriert: ${json.ids.length} neues Asset${json.ids.length > 1 ? 's (Paar)' : ''} als Draft — Seite neu laden zum Prüfen.`)
      } else {
        const ids: string[] = json.ids
        setRows((alt) => alt.map((r) => (ids.includes(r.id) ? { ...r, quality_status: json.quality_status } : r)))
        setGross(null)
      }
    } catch (e) {
      setFehler((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  function karteAktionen(k: Karte) {
    const a = k.assets[0]
    const status = a.quality_status
    const istStub = k.assets.some((x) => x.quelle === 'ai_mock')
    const laeuft = busy === a.id
    return (
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {status !== 'approved' && (
          <button onClick={() => aktion(a.id, 'approve')} disabled={laeuft || istStub}
            title={istStub ? 'STUB-Asset (Mock) — nie approvebar' : k.istPaar ? 'Beide Paar-Hälften freigeben' : 'Freigeben'}
            style={{ ...btn, border: 'none', background: 'var(--za-gold-grad)', color: '#fff', fontWeight: 700, opacity: laeuft || istStub ? 0.5 : 1 }}>
            <CheckCircle2 size={13} /> Freigeben{k.istPaar ? ' (Paar)' : ''}
          </button>
        )}
        {status !== 'rejected' && (
          <button onClick={() => aktion(a.id, 'reject')} disabled={laeuft} style={{ ...btn, color: '#b91c1c', opacity: laeuft ? 0.5 : 1 }}>
            <XCircle size={13} /> Ablehnen
          </button>
        )}
        {status !== 'draft' && (
          <button onClick={() => aktion(a.id, 'draft')} disabled={laeuft} style={{ ...btn, opacity: laeuft ? 0.5 : 1 }}>
            Zurück auf Draft
          </button>
        )}
        <button onClick={() => aktion(a.id, 'regenerate')} disabled={laeuft}
          title="Neuer Call mit gespeichertem Prompt und neuem Seed (Paar wird als Paar regeneriert)"
          style={{ ...btn, opacity: laeuft ? 0.5 : 1 }}>
          <RotateCcw size={13} /> {laeuft ? 'Läuft …' : 'Regenerieren'}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Asset-Bank</span>
          <span className="tb-heading">Freigabe</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>
          {approvedCount}/{rows.length} approved · {paarCount} Paare approved · nur approved wird ausgespielt
        </span>
      </div>

      {/* Filter */}
      <div className="panel fade-up" style={{ marginBottom: '16px', padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { wert: filterBranche, set: setFilterBranche, optionen: branchen, label: 'Alle Branchen' },
          { wert: filterSzene, set: setFilterSzene, optionen: szenen, label: 'Alle Szenen' },
          { wert: filterStatus, set: setFilterStatus, optionen: ['draft', 'approved', 'rejected'], label: 'Alle Status' },
        ].map((f, i) => (
          <select key={i} value={f.wert} onChange={(e) => f.set(e.target.value)}
            style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--za-border)', fontSize: '12px', fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)' }}>
            <option value="">{f.label}</option>
            {f.optionen.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        <span style={{ fontSize: '12px', color: 'var(--za-fg-4)' }}>{karten.length} Karten</span>
      </div>

      {fehler && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#b91c1c', fontSize: '13px' }}>
          {fehler}
        </div>
      )}
      {hinweis && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', fontSize: '13px' }}>
          {hinweis}
        </div>
      )}

      {rows.length === 0 && (
        <div className="panel" style={{ padding: '24px', fontSize: '13px', color: 'var(--za-fg-3)' }}>
          Asset-Bank ist leer. CLI: <code>npx tsx scripts/seed-assets.ts --branche maler --count 30</code>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {karten.map((k, i) => {
          const a = k.assets[0]
          const st = STATUS_FARBEN[a.quality_status]
          const istStub = k.assets.some((x) => x.quelle === 'ai_mock')
          return (
            <div key={k.key} className="panel fade-up" style={{ animationDelay: `${Math.min(i * 20, 300)}ms`, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', cursor: 'zoom-in' }} onClick={() => setGross(k)}>
                {k.assets.map((x) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={x.id} src={x.url} alt={x.alt_text_de ?? ''} loading="lazy"
                    style={{ width: k.istPaar ? '50%' : '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }} />
                ))}
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>
                    {k.istPaar ? 'Paar: nachher + vorher' : a.szene_typ}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--za-fg-4)' }}>{a.branchen.join(', ')}</span>
                  <div style={{ flex: 1 }} />
                  {istStub && (
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: 'rgba(220,38,38,0.12)', color: '#b91c1c' }}>
                      STUB
                    </span>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '999px', background: st.bg, color: st.fg }}>
                    {st.label}
                  </span>
                </div>
                <div style={{ marginTop: '3px', fontSize: '11px', color: 'var(--za-fg-4)' }}>
                  {a.aspect_ratio ?? '–'} · {a.breite ?? '?'}×{a.hoehe ?? '?'} · {a.quelle} · {a.kosten_cent}ct
                  {a.style_tags.length > 0 ? ` · ${a.style_tags.join(', ')}` : ''}
                </div>
                <div style={{ marginTop: '10px' }}>{karteAktionen(k)}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Großansicht */}
      {gross && (
        <div onClick={() => setGross(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,15,20,0.82)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '14px', maxWidth: '1100px', width: '100%', maxHeight: '92vh', overflow: 'auto', padding: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <strong style={{ fontSize: '14px' }}>
                {gross.istPaar ? 'Paar: nachher + vorher' : gross.assets[0].szene_typ} · {gross.assets[0].branchen.join(', ')}
              </strong>
              <div style={{ flex: 1 }} />
              {karteAktionen(gross)}
              <button onClick={() => setGross(null)} style={{ ...btn, padding: '7px 9px' }}><X size={14} /></button>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {gross.assets.map((x) => (
                <div key={x.id} style={{ flex: '1 1 420px', minWidth: 0 }}>
                  {gross.istPaar && (
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--za-fg-3)', marginBottom: '6px' }}>
                      {x.szene_typ}
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={x.url} alt={x.alt_text_de ?? ''} style={{ width: '100%', borderRadius: '10px', display: 'block' }} />
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <input
                      value={altEntwurf[x.id] ?? x.alt_text_de ?? ''}
                      onChange={(e) => setAltEntwurf((alt) => ({ ...alt, [x.id]: e.target.value }))}
                      placeholder="Deutscher Alt-Text …"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--za-border)', fontSize: '12px', fontFamily: 'inherit' }} />
                    <button onClick={() => aktion(x.id, 'alt', altEntwurf[x.id] ?? x.alt_text_de ?? '')}
                      disabled={busy === x.id || !(altEntwurf[x.id] ?? x.alt_text_de ?? '').trim()}
                      style={{ ...btn, opacity: busy === x.id ? 0.5 : 1 }}>
                      Speichern
                    </button>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--za-fg-4)', wordBreak: 'break-all' }}>
                    {x.id} · {x.aspect_ratio ?? '–'} · {x.breite ?? '?'}×{x.hoehe ?? '?'} · {x.quelle}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
