'use client'

/**
 * Video-Leiste (Baustein C §C.3) — Admin-UI für Growth-Video-Header.
 *
 * Ablauf: deutscher Freitext → „Prompt verfeinern" (Claude, video-guidelines)
 * → Original vs. verfeinerter Prompt (editierbar) → „Video generieren"
 * → Draft in der Leiste (Loop-Vorschau) → Freigeben/Ablehnen → Zuweisen.
 * Regenerate nutzt den gespeicherten Prompt mit neuem Seed.
 */
import { useCallback, useEffect, useState } from 'react'

interface VideoAsset {
  id: string
  quality_status: 'draft' | 'approved' | 'rejected'
  gen_prompt: string | null
  gen_seed: string | null
  gen_job_id: string | null
  kosten_cent: number | null
  varianten: { video_url?: string; poster_url?: string; groesse_bytes?: number; stub?: boolean } | null
  created_at: string
}

const STATUS_LABEL: Record<VideoAsset['quality_status'], string> = {
  draft: 'Entwurf',
  approved: 'Freigegeben',
  rejected: 'Abgelehnt',
}

export default function VideoLeistePage({ params }: { params: { siteId: string } }) {
  const api = `/api/admin/sites/${params.siteId}/video`
  const [videos, setVideos] = useState<VideoAsset[]>([])
  const [beschreibung, setBeschreibung] = useState('')
  const [original, setOriginal] = useState<string | null>(null)
  const [refined, setRefined] = useState('')
  const [laden, setLaden] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)

  const ladeListe = useCallback(async () => {
    const res = await fetch(api)
    const data = await res.json()
    if (data.ok) setVideos(data.videos)
  }, [api])

  useEffect(() => {
    ladeListe()
  }, [ladeListe])

  async function aktion(body: Record<string, string>, label: string) {
    setLaden(label)
    setMeldung(null)
    try {
      const res = await fetch(api, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setMeldung(data.error || 'Fehler')
        return null
      }
      if (data.warnung) setMeldung(data.warnung)
      return data
    } catch {
      setMeldung('Netzwerkfehler — bitte erneut versuchen.')
      return null
    } finally {
      setLaden(null)
    }
  }

  async function verfeinern() {
    const data = await aktion({ aktion: 'refine', beschreibung }, 'refine')
    if (data) {
      setOriginal(data.original)
      setRefined(data.refined)
    }
  }

  async function generieren() {
    const data = await aktion({ aktion: 'generate', prompt: refined }, 'generate')
    if (data) {
      setMeldung(data.stub ? 'Stub-Draft angelegt (keine Video-Generierung verfügbar).' : 'Video generiert — bitte prüfen und freigeben.')
      await ladeListe()
    }
  }

  async function einfacheAktion(a: 'regenerate' | 'approve' | 'reject' | 'assign', assetId: string) {
    const data = await aktion({ aktion: a, assetId }, `${a}:${assetId}`)
    if (data) {
      if (a === 'assign') setMeldung('Video der Site zugewiesen (Draft-Config, mit Poster-Fallback).')
      await ladeListe()
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', display: 'grid', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Video-Leiste (Growth)</h1>
        <p style={{ color: '#666', fontSize: 14 }}>
          Beschreibung auf Deutsch → verfeinerter Prompt nach Video-Guidelines → Generierung → Freigabe → Zuweisung.
          Nur freigegebene Videos sind zuweisbar; das Poster-Bild bleibt immer als Fallback.
        </p>
      </div>

      {meldung && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#fff4f4', border: '1px solid #f3c2c2', fontSize: 14 }}>
          {meldung}
        </div>
      )}

      <section style={{ display: 'grid', gap: 12, padding: 20, border: '1px solid #eee', borderRadius: 14 }}>
        <label style={{ fontWeight: 600, fontSize: 14 }}>1. Was soll im Video passieren? (deutsch)</label>
        <textarea
          value={beschreibung}
          onChange={(e) => setBeschreibung(e.target.value)}
          rows={3}
          placeholder="z. B. Frische Farbe rollt über eine Wand, warmes Licht, ruhig und hochwertig"
          style={{ padding: 12, borderRadius: 10, border: '1px solid #ddd', fontSize: 14, fontFamily: 'inherit' }}
        />
        <button
          onClick={verfeinern}
          disabled={laden !== null || beschreibung.trim().length < 5}
          style={{ justifySelf: 'start', padding: '10px 18px', borderRadius: 10, border: 'none', background: '#e11d2e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
        >
          {laden === 'refine' ? 'Verfeinere …' : 'Prompt verfeinern'}
        </button>

        {original !== null && (
          <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Original (deutsch)</div>
              <div style={{ padding: 12, borderRadius: 10, background: '#fafafa', fontSize: 14 }}>{original}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Verfeinerter Prompt (editierbar)</div>
              <textarea
                value={refined}
                onChange={(e) => setRefined(e.target.value)}
                rows={6}
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd', fontSize: 13, fontFamily: 'monospace' }}
              />
            </div>
            <button
              onClick={generieren}
              disabled={laden !== null || refined.trim().length < 10}
              style={{ justifySelf: 'start', padding: '10px 18px', borderRadius: 10, border: 'none', background: '#111', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              {laden === 'generate' ? 'Generiere … (kann Minuten dauern)' : '2. Video generieren'}
            </button>
          </div>
        )}
      </section>

      <section style={{ display: 'grid', gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Entwürfe & Freigaben</h2>
        {videos.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>Noch keine Videos für diese Site.</p>}
        {videos.map((v) => {
          const mb = v.varianten?.groesse_bytes ? (v.varianten.groesse_bytes / 1024 / 1024).toFixed(2) : null
          return (
            <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, padding: 16, border: '1px solid #eee', borderRadius: 14 }}>
              <div>
                {v.varianten?.video_url ? (
                  // Loop-Vorschau der Freigabe-UI (§C.3)
                  <video
                    src={v.varianten.video_url}
                    poster={v.varianten.poster_url || undefined}
                    muted
                    loop
                    autoPlay
                    playsInline
                    style={{ width: '100%', borderRadius: 10, background: '#000' }}
                  />
                ) : v.varianten?.poster_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.varianten.poster_url} alt="Poster" style={{ width: '100%', borderRadius: 10 }} />
                ) : (
                  <div style={{ aspectRatio: '16/9', display: 'grid', placeItems: 'center', background: '#f4f4f4', borderRadius: 10, color: '#999', fontSize: 13 }}>
                    Stub — kein Video
                  </div>
                )}
              </div>
              <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
                  <span style={{ padding: '2px 10px', borderRadius: 999, background: v.quality_status === 'approved' ? '#e8f7ee' : v.quality_status === 'rejected' ? '#fdeaea' : '#f4f4f4', fontWeight: 600 }}>
                    {STATUS_LABEL[v.quality_status]}
                  </span>
                  <span style={{ color: '#888' }}>Seed {v.gen_seed || '–'}</span>
                  {mb && <span style={{ color: Number(mb) > 3 ? '#c00' : '#888' }}>{mb} MB</span>}
                  {v.kosten_cent ? <span style={{ color: '#888' }}>{(v.kosten_cent / 100).toFixed(2)} €</span> : null}
                </div>
                <div style={{ fontSize: 12, color: '#666', fontFamily: 'monospace', maxHeight: 72, overflow: 'auto' }}>{v.gen_prompt}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {v.quality_status === 'draft' && (
                    <>
                      <button onClick={() => einfacheAktion('approve', v.id)} disabled={laden !== null} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Freigeben</button>
                      <button onClick={() => einfacheAktion('reject', v.id)} disabled={laden !== null} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>Ablehnen</button>
                    </>
                  )}
                  {v.quality_status === 'approved' && (
                    <button onClick={() => einfacheAktion('assign', v.id)} disabled={laden !== null} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: '#e11d2e', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Der Site zuweisen</button>
                  )}
                  <button onClick={() => einfacheAktion('regenerate', v.id)} disabled={laden !== null} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer' }}>
                    Neu generieren (neuer Seed)
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
