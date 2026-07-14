'use client'

import { useCallback, useEffect, useState } from 'react'
import { Zap, ExternalLink, Copy, Check, RefreshCw, Trash2, Eye, Loader2, Send, Euro } from 'lucide-react'
import { TEMPLATE_CATALOG, CATALOG_INDUSTRIES } from '@/lib/template-catalog'
import { PACKAGES } from '@/lib/packages'

interface Demo {
  id: string
  prospect_name: string
  prospect_website: string | null
  branche: string | null
  template_id: string
  share_token: string
  status: string
  notes: string | null
  view_count: number
  last_viewed_at: string | null
  expires_at: string
  created_at: string
  paket?: string | null
  payment_link_url?: string | null
}

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  GENERIERT: { label: 'Generiert', bg: 'rgba(42,111,219,0.10)', fg: '#2a6fdb' },
  VERSENDET: { label: 'Versendet', bg: 'rgba(212,168,40,0.12)', fg: '#a8821e' },
  CONVERTED: { label: 'Converted', bg: 'rgba(46,196,160,0.12)', fg: '#1e8a70' },
  ABGELAUFEN: { label: 'Abgelaufen', bg: 'rgba(0,0,0,0.06)', fg: '#8a877f' },
}

function templateName(id: string): string {
  return TEMPLATE_CATALOG.find((t) => t.id === id)?.name || id
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)

  // Form
  const [prospectName, setProspectName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [notes, setNotes] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  // Row actions
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [paymentMenuId, setPaymentMenuId] = useState<string | null>(null)
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null)

  const loadDemos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/demos')
      const data = await res.json()
      if (res.ok) setDemos(data.demos || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDemos() }, [loadDemos])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!prospectName.trim() || !templateId || generating) return
    setGenerating(true)
    setError(null)
    setWarning(null)
    try {
      const selectedTemplate = TEMPLATE_CATALOG.find((t) => t.id === templateId)
      const res = await fetch('/api/admin/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prospectName: prospectName.trim(),
          websiteUrl: websiteUrl.trim(),
          templateId,
          branche: selectedTemplate?.industry || null,
          notes: notes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Demo-Generierung fehlgeschlagen')
        return
      }
      if (data.warning) setWarning(data.warning)
      setProspectName('')
      setWebsiteUrl('')
      setNotes('')
      setDemos((prev) => [data.demo, ...prev])
      window.open(`/demo/${data.demo.share_token}`, '_blank')
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy(demo: Demo) {
    const url = `${window.location.origin}/demo/${demo.share_token}`
    await navigator.clipboard.writeText(url)
    setCopiedId(demo.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleRegenerate(demo: Demo) {
    if (busyId) return
    setBusyId(demo.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate' }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Neu-Generierung fehlgeschlagen')
        return
      }
      setDemos((prev) => prev.map((d) => (d.id === demo.id ? { ...d, ...data.demo } : d)))
      if (data.warning) setWarning(data.warning)
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleStatus(demo: Demo, status: string) {
    if (busyId) return
    setBusyId(demo.id)
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', status }),
      })
      const data = await res.json()
      if (res.ok) setDemos((prev) => prev.map((d) => (d.id === demo.id ? { ...d, ...data.demo } : d)))
    } finally {
      setBusyId(null)
    }
  }

  async function handlePaymentLink(demo: Demo, paket: string) {
    if (busyId) return
    setBusyId(demo.id)
    setPaymentMenuId(null)
    setError(null)
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paket }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Payment-Link konnte nicht erstellt werden')
        return
      }
      await navigator.clipboard.writeText(data.url)
      setDemos((prev) => prev.map((d) => (d.id === demo.id ? { ...d, paket, payment_link_url: data.url } : d)))
      setCopiedPaymentId(demo.id)
      setTimeout(() => setCopiedPaymentId(null), 2500)
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleCopyPaymentLink(demo: Demo) {
    if (!demo.payment_link_url) return
    await navigator.clipboard.writeText(demo.payment_link_url)
    setCopiedPaymentId(demo.id)
    setTimeout(() => setCopiedPaymentId(null), 2500)
  }

  async function handleDelete(demo: Demo) {
    if (busyId) return
    if (!window.confirm(`Demo für "${demo.prospect_name}" wirklich löschen?`)) return
    setBusyId(demo.id)
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}`, { method: 'DELETE' })
      if (res.ok) setDemos((prev) => prev.filter((d) => d.id !== demo.id))
    } finally {
      setBusyId(null)
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '9px 12px', fontSize: '13px', border: '1px solid var(--za-border)', borderRadius: '8px',
    background: 'rgba(255,255,255,0.7)', fontFamily: 'inherit', outline: 'none', width: '100%',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--za-fg-3)', marginBottom: '6px', display: 'block',
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Closer</span>
          <span className="tb-heading">Demo-Maschine</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>{demos.length} Demos</span>
      </div>

      {/* Generator */}
      <div className="panel fade-up" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Zap style={{ width: '16px', height: '16px', color: 'var(--za-gold)' }} />
          <span className="panel-title">Neue Demo generieren</span>
        </div>

        <form onSubmit={handleGenerate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={labelStyle}>Firmenname *</label>
              <input type="text" value={prospectName} onChange={(e) => setProspectName(e.target.value)}
                placeholder="z.B. Friseursalon Schmidt" style={inputStyle} disabled={generating} required />
            </div>
            <div>
              <label style={labelStyle}>Website des Prospects</label>
              <input type="text" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="z.B. friseur-schmidt.de (wird gescrapt)" style={inputStyle} disabled={generating} />
            </div>
            <div>
              <label style={labelStyle}>Template *</label>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }} disabled={generating} required>
                <option value="">— Template wählen —</option>
                {CATALOG_INDUSTRIES.map((ind) => (
                  <optgroup key={ind} label={ind}>
                    {TEMPLATE_CATALOG.filter((t) => t.industry === ind).map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Notizen aus dem Quali-Call (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              placeholder="z.B. Inhaber heißt Marco, 15 Jahre am Standort, will mehr Online-Termine..."
              style={{ ...inputStyle, resize: 'vertical' }} disabled={generating} />
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(220,60,60,0.08)', color: '#b03030', fontSize: '12px', marginBottom: '14px' }}>
              {error}
            </div>
          )}
          {warning && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(212,168,40,0.10)', color: '#a8821e', fontSize: '12px', marginBottom: '14px' }}>
              {warning}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button type="submit" disabled={generating || !prospectName.trim() || !templateId}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: generating ? 'rgba(0,0,0,0.15)' : 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: generating ? 'wait' : 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: generating ? 'none' : '0 3px 10px -3px rgba(42,111,219,0.50)' }}>
              {generating
                ? <><Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} /> Demo wird generiert…</>
                : <><Zap style={{ width: '14px', height: '14px' }} /> Demo generieren</>}
            </button>
            {generating && (
              <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>
                Website wird gescrapt und Inhalte werden erstellt — dauert ca. 30–60 Sekunden.
              </span>
            )}
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>

      {/* Liste */}
      <div className="panel fade-up" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)' }}>
          <span className="panel-title">Alle Demos</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : demos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Noch keine Demos — generiere oben die erste.
          </div>
        ) : (
          <div>
            {demos.map((demo) => {
              const st = STATUS_STYLES[demo.status] || STATUS_STYLES.GENERIERT
              const expired = new Date(demo.expires_at) < new Date()
              const busy = busyId === demo.id
              return (
                <div key={demo.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg-1)' }}>{demo.prospect_name}</span>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: expired ? STATUS_STYLES.ABGELAUFEN.bg : st.bg, color: expired ? STATUS_STYLES.ABGELAUFEN.fg : st.fg, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {expired ? 'Abgelaufen' : st.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>{templateName(demo.template_id)}</span>
                      {demo.prospect_website && <span>· {demo.prospect_website.replace(/^https?:\/\//, '')}</span>}
                      <span>· {formatDate(demo.created_at)}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        · <Eye style={{ width: '11px', height: '11px' }} /> {demo.view_count}
                        {demo.last_viewed_at && ` (zuletzt ${formatDate(demo.last_viewed_at)})`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <a href={`/demo/${demo.share_token}`} target="_blank" rel="noopener noreferrer" title="Demo öffnen"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'var(--za-gold-grad)', color: '#fff', borderRadius: '7px', fontSize: '10px', fontWeight: 600, textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      <ExternalLink style={{ width: '12px', height: '12px' }} /> Öffnen
                    </a>
                    <button onClick={() => handleCopy(demo)} title="Demo-Link kopieren"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: copiedId === demo.id ? '#1e8a70' : 'var(--za-fg-2)', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {copiedId === demo.id ? <><Check style={{ width: '12px', height: '12px' }} /> Kopiert</> : <><Copy style={{ width: '12px', height: '12px' }} /> Link</>}
                    </button>
                    {demo.status !== 'CONVERTED' && (
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setPaymentMenuId(paymentMenuId === demo.id ? null : demo.id)} disabled={busy}
                          title={demo.payment_link_url ? `Payment-Link (${demo.paket}) — klicken für neuen Link` : 'Stripe Payment-Link erstellen'}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: copiedPaymentId === demo.id ? 'rgba(46,196,160,0.12)' : 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: copiedPaymentId === demo.id ? '#1e8a70' : 'var(--za-fg-2)', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {copiedPaymentId === demo.id
                            ? <><Check style={{ width: '12px', height: '12px' }} /> Kopiert</>
                            : <><Euro style={{ width: '12px', height: '12px' }} /> {demo.paket ? `Zahlung (${demo.paket})` : 'Zahlung'}</>}
                        </button>
                        {paymentMenuId === demo.id && (
                          <div style={{ position: 'absolute', top: '36px', right: 0, zIndex: 50, background: '#fff', border: '1px solid var(--za-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '6px', minWidth: '220px' }}>
                            {demo.payment_link_url && (
                              <button onClick={() => { handleCopyPaymentLink(demo); setPaymentMenuId(null) }}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', color: 'var(--za-fg-2)', fontFamily: 'inherit', textAlign: 'left' }}>
                                <Copy style={{ width: '12px', height: '12px' }} /> Bestehenden Link kopieren
                              </button>
                            )}
                            <div style={{ padding: '6px 12px 4px', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-4)' }}>
                              {demo.payment_link_url ? 'Neuen Link erstellen' : 'Paket wählen'}
                            </div>
                            {PACKAGES.map((p) => (
                              <button key={p.id} onClick={() => handlePaymentLink(demo, p.id)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 12px', background: 'none', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer', color: 'var(--za-fg-1)', fontFamily: 'inherit', textAlign: 'left' }}>
                                <span>{p.emoji} {p.name}</span>
                                <span style={{ color: 'var(--za-fg-3)', fontSize: '11px' }}>{p.price} €/Mt</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {demo.status === 'GENERIERT' && !expired && (
                      <button onClick={() => handleStatus(demo, 'VERSENDET')} disabled={busy} title="Als versendet markieren"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--za-fg-3)' }}>
                        <Send style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                    <button onClick={() => handleRegenerate(demo)} disabled={busy} title="Neu generieren"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: busy ? 'wait' : 'pointer', color: 'var(--za-fg-3)' }}>
                      <RefreshCw style={{ width: '13px', height: '13px', animation: busy ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    <button onClick={() => handleDelete(demo)} disabled={busy} title="Löschen"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: '#b03030' }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
