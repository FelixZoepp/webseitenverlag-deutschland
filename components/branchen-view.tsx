'use client'

/**
 * F3/F4 Mensch-Gate (BF §4.6): Freigabe-UI der Branchen-Fabrik.
 * Jede Karte zeigt Palette, Akzent-Begründung und Preview-Links —
 * Freigabe per Klick, Feedback landet in guideline_notes und kann
 * direkt eine Regenerier-Runde auslösen. Neue Branchen werden per
 * Freitext angestoßen (Klassifizierung + Auto-Seeding, BF §4).
 */

import { useState } from 'react'
import { CheckCircle2, ExternalLink, Hammer, MessageSquare, RotateCcw, Sparkles } from 'lucide-react'

export interface BranchenZeile {
  branche_key: string
  name: string
  meta_kategorie: string
  meta_kategorie_name: string
  quality_status: 'draft' | 'approved'
  approved_at: string | null
  guideline_notes: string[]
  quelle: 'flagship' | 'claude'
  gates_geprueft_am: string | null
  asset_anzahl: number
  farben: { basis: string; akzent1: string; akzent2: string } | null
  akzent_begruendung: string
  beispiel_firma: string
  funnel_modus: 'anfrage' | 'reservierung'
}

export default function BranchenView({ zeilen }: { zeilen: BranchenZeile[] }) {
  const [rows, setRows] = useState(zeilen)
  const [feedbackKey, setFeedbackKey] = useState<string | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [neueBranche, setNeueBranche] = useState('')
  const [bauLaeuft, setBauLaeuft] = useState<string | null>(null)
  const [bauHinweis, setBauHinweis] = useState<string | null>(null)

  const approvedCount = rows.filter((r) => r.quality_status === 'approved').length

  async function aktion(key: string, action: 'approve' | 'draft' | 'feedback', text?: string, regenerieren?: boolean) {
    setBusy(key)
    setFehler(null)
    try {
      const res = await fetch(`/api/admin/branchen/${key}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, text, regenerieren }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      if (json.regeneriert) { window.location.reload(); return }
      if (json.regenerier_fehler) setFehler(`${key}: Feedback gespeichert, Regenerieren fehlgeschlagen — ${json.regenerier_fehler}`)
      setRows((alt) => alt.map((r) => r.branche_key === key
        ? { ...r, quality_status: json.quality_status, approved_at: json.approved_at, guideline_notes: json.guideline_notes ?? r.guideline_notes }
        : r))
      if (action === 'feedback') { setFeedbackKey(null); setFeedbackText('') }
    } catch (e) {
      setFehler(`${key}: ${(e as Error).message}`)
    } finally {
      setBusy(null)
    }
  }

  async function baueNeueBranche() {
    const eingabe = neueBranche.trim()
    if (!eingabe) return
    setBauLaeuft(eingabe)
    setBauHinweis(null)
    setFehler(null)
    try {
      const res = await fetch('/api/admin/branchen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branche: eingabe }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      setBauHinweis(`„${json.name}“ (${json.branche_key}) ist gebaut und wartet als Draft auf Freigabe.${json.asset_warnung ? ` ⚠ Assets: ${json.asset_warnung}` : ''}`)
      setNeueBranche('')
      window.location.reload()
    } catch (e) {
      setFehler(`Neue Branche „${eingabe}“: ${(e as Error).message}`)
    } finally {
      setBauLaeuft(null)
    }
  }

  return (
    <>
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Branchen-Fabrik</span>
          <span className="tb-heading">Freigabe</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>
          {approvedCount}/{rows.length} freigegeben · ohne Freigabe keine Demo
        </span>
      </div>

      {/* F4: Neue Branche per Freitext bauen (Klassifizierung + Auto-Seeding) */}
      <div className="panel fade-up" style={{ marginBottom: '16px', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Sparkles size={15} style={{ color: 'var(--za-fg-3)', flexShrink: 0 }} />
        <input
          value={neueBranche}
          onChange={(e) => setNeueBranche(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !bauLaeuft) baueNeueBranche() }}
          placeholder="Neue Branche bauen — z. B. Schlüsseldienst, Hundesalon, Fahrradwerkstatt"
          disabled={bauLaeuft !== null}
          style={{ flex: 1, minWidth: '240px', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--za-border)', fontSize: '13px', fontFamily: 'inherit', background: 'rgba(255,255,255,0.7)' }}
        />
        <button onClick={baueNeueBranche} disabled={bauLaeuft !== null || !neueBranche.trim()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'var(--za-gold-grad)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: bauLaeuft !== null || !neueBranche.trim() ? 0.5 : 1 }}>
          <Hammer size={13} /> Bauen
        </button>
      </div>

      {bauLaeuft && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309', fontSize: '13px' }}>
          Branche „{bauLaeuft}“ wird gebaut (~5–15 Min): klassifizieren → Profil & Vorlage generieren → Gates → Assets. Seite offen lassen.
        </div>
      )}

      {bauHinweis && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#059669', fontSize: '13px' }}>
          {bauHinweis}
        </div>
      )}

      {fehler && (
        <div style={{ marginBottom: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', color: '#b91c1c', fontSize: '13px' }}>
          {fehler}
        </div>
      )}

      {rows.length === 0 && (
        <div className="panel" style={{ padding: '24px', fontSize: '13px', color: 'var(--za-fg-3)' }}>
          Noch keine Branchen geseedet. CLI: <code>npm run seed:branchen</code>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {rows.map((r, i) => {
          const approved = r.quality_status === 'approved'
          return (
            <div key={r.branche_key} className="panel fade-up" style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, padding: 0, overflow: 'hidden' }}>
              {/* Palette */}
              <div style={{ display: 'flex', height: '10px' }}>
                {r.farben ? (
                  <>
                    <div style={{ flex: 3, background: r.farben.basis }} />
                    <div style={{ flex: 2, background: r.farben.akzent1 }} />
                    <div style={{ flex: 1, background: r.farben.akzent2 }} />
                  </>
                ) : <div style={{ flex: 1, background: 'var(--za-border)' }} />}
              </div>

              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{r.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--za-fg-4)' }}>{r.branche_key}</span>
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: '999px', background: approved ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: approved ? '#059669' : '#b45309' }}>
                    {approved ? 'Approved' : 'Draft'}
                  </span>
                </div>

                <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--za-fg-3)' }}>
                  {r.meta_kategorie_name} · {r.funnel_modus === 'reservierung' ? 'Reservierung' : 'Anfrage'}
                  {r.quelle === 'flagship' ? ' · Flagship-Parametrisierung' : ''}
                  {r.asset_anzahl > 0 ? ` · ${r.asset_anzahl} Assets (draft)` : ''}
                </div>
                {r.beispiel_firma && (
                  <div style={{ marginTop: '2px', fontSize: '12px', color: 'var(--za-fg-4)' }}>Beispiel: {r.beispiel_firma}</div>
                )}

                {r.akzent_begruendung && (
                  <p style={{ marginTop: '10px', fontSize: '12px', lineHeight: 1.5, color: 'var(--za-fg-2)', fontStyle: 'italic' }}>
                    „{r.akzent_begruendung}“
                  </p>
                )}

                {r.guideline_notes.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--za-fg-3)' }}>
                    <strong>Feedback-Notizen ({r.guideline_notes.length}):</strong>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                      {r.guideline_notes.slice(-3).map((n, j) => <li key={j}>{n}</li>)}
                    </ul>
                  </div>
                )}

                {/* Aktionen */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <a href={`/branchen-preview/${r.branche_key}`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.6)', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                    <ExternalLink size={13} /> Preview
                  </a>
                  <a href={`/branchen-preview/${r.branche_key}/${r.funnel_modus}`} target="_blank" rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.6)', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                    Funnel
                  </a>
                  <div style={{ flex: 1 }} />
                  {approved ? (
                    <button onClick={() => aktion(r.branche_key, 'draft')} disabled={busy === r.branche_key}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)', background: 'transparent', color: 'var(--za-fg-3)', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <RotateCcw size={13} /> Zurückziehen
                    </button>
                  ) : (
                    <>
                      <button onClick={() => { setFeedbackKey(feedbackKey === r.branche_key ? null : r.branche_key); setFeedbackText('') }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)', background: 'transparent', color: 'var(--za-fg-3)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <MessageSquare size={13} /> Feedback
                      </button>
                      <button onClick={() => aktion(r.branche_key, 'approve')} disabled={busy === r.branche_key}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'var(--za-gold-grad)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: busy === r.branche_key ? 0.6 : 1 }}>
                        <CheckCircle2 size={13} /> Freigeben
                      </button>
                    </>
                  )}
                </div>

                {feedbackKey === r.branche_key && (
                  <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3}
                      placeholder="Was soll anders werden? (landet in guideline_notes und fließt ins nächste Seeding ein)"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--za-border)', fontSize: '12px', fontFamily: 'inherit', resize: 'vertical', background: 'rgba(255,255,255,0.7)' }} />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      <button onClick={() => aktion(r.branche_key, 'feedback', feedbackText)}
                        disabled={busy === r.branche_key || !feedbackText.trim()}
                        style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, border: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.6)', color: 'var(--za-fg-2)', cursor: 'pointer', fontFamily: 'inherit', opacity: !feedbackText.trim() ? 0.5 : 1 }}>
                        Nur speichern
                      </button>
                      <button onClick={() => aktion(r.branche_key, 'feedback', feedbackText, true)}
                        disabled={busy === r.branche_key || !feedbackText.trim()}
                        title="Feedback speichern und die Vorlage sofort mit dem Feedback im Prompt neu generieren (~5–15 Min)"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', background: 'var(--za-gold-grad)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', opacity: busy === r.branche_key || !feedbackText.trim() ? 0.5 : 1 }}>
                        <RotateCcw size={13} /> {busy === r.branche_key ? 'Regeneriert …' : 'Feedback & neu generieren'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
