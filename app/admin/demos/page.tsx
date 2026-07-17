'use client'

import { useCallback, useEffect, useState } from 'react'
import { Zap, ExternalLink, Copy, Check, RefreshCw, Trash2, Eye, Loader2, Send, Euro, Pencil, Image } from 'lucide-react'
import { TEMPLATE_CATALOG } from '@/lib/template-catalog'
import { PACKAGES } from '@/lib/packages'
import type { FlagshipConfig } from '@/lib/flagship/types'

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
  kosten_cent?: number | null
  engine?: string | null
}

/** Approved Branchen-Vorlagen aus der Branchen-Fabrik (F5) */
interface FlagshipBranche {
  branche_key: string
  name: string
  quality_status: string
}

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  GENERIERT: { label: 'Generiert', bg: 'rgba(42,111,219,0.10)', fg: '#2a6fdb' },
  VERSENDET: { label: 'Versendet', bg: 'rgba(212,168,40,0.12)', fg: '#a8821e' },
  CONVERTED: { label: 'Converted', bg: 'rgba(46,196,160,0.12)', fg: '#1e8a70' },
  ABGELAUFEN: { label: 'Abgelaufen', bg: 'rgba(0,0,0,0.06)', fg: '#8a877f' },
}

function templateName(id: string): string {
  if (id.startsWith('startseite.')) {
    const [, slug, stil] = id.split('.')
    return `Library · ${slug} · ${stil}`
  }
  if (id.startsWith('flagship:')) {
    return `Flagship · ${id.slice('flagship:'.length)}`
  }
  return TEMPLATE_CATALOG.find((t) => t.id === id)?.name || id
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function DemosPage() {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [flagshipBranchen, setFlagshipBranchen] = useState<FlagshipBranche[]>([])

  // Form
  const [prospectName, setProspectName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [ort, setOrt] = useState('')
  const [notes, setNotes] = useState('')
  const [typoModus, setTypoModus] = useState<'sans_bold_hell' | 'serif_warm_dunkel' | ''>('')
  const [brandfarbe, setBrandfarbe] = useState('')
  const [paket, setPaket] = useState<'starter' | 'business' | 'growth'>('business')
  const [scrollAnimationen, setScrollAnimationen] = useState(false)
  const [wirkung, setWirkung] = useState('')
  const [schriftart, setSchriftart] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  // Row actions
  const [busyId, setBusyId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [paymentMenuId, setPaymentMenuId] = useState<string | null>(null)
  const [copiedPaymentId, setCopiedPaymentId] = useState<string | null>(null)
  const [paymentLinkResult, setPaymentLinkResult] = useState<{ url: string; paket: string } | null>(null)
  const [editDemoId, setEditDemoId] = useState<string | null>(null)
  const [editConfig, setEditConfig] = useState<FlagshipConfig | null>(null)
  const [editBusy, setEditBusy] = useState<string | null>(null)
  const [editMsg, setEditMsg] = useState<string | null>(null)

  async function openEditPanel(demoId: string) {
    if (editDemoId === demoId) { setEditDemoId(null); setEditConfig(null); return }
    setEditDemoId(demoId)
    setEditConfig(null)
    try {
      const res = await fetch(`/api/admin/demos/${demoId}`, { method: 'GET' })
      if (!res.ok) return
      const data = await res.json()
      if (data.demo?.config) setEditConfig(data.demo.config as FlagshipConfig)
    } catch { /* ignore */ }
  }

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

  // Approved Flagship-Vorlagen für die Template-Auswahl (F5)
  useEffect(() => {
    fetch('/api/admin/branchen')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.branchen) {
          setFlagshipBranchen(
            (data.branchen as FlagshipBranche[]).filter((b) => b.quality_status === 'approved')
          )
        }
      })
      .catch(() => {})
  }, [])

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!prospectName.trim() || !templateId || generating) return
    setGenerating(true)
    setError(null)
    setWarning(null)
    try {
      const istLibrary = templateId.startsWith('library:')
      const istFlagship = templateId.startsWith('flagship:')
      let payload: Record<string, unknown>
      if (istFlagship) {
        payload = {
          engine: 'flagship',
          prospectName: prospectName.trim(),
          websiteUrl: websiteUrl.trim(),
          branche: templateId.slice('flagship:'.length),
          ort: ort.trim() || null,
          notes: [notes.trim(), wirkung ? `Wirkung: ${wirkung}` : '', schriftart ? `Schriftart: ${schriftart}` : ''].filter(Boolean).join('\n') || null,
          paket,
          scrollAnimationen,
          ...(typoModus ? { typoModus } : {}),
          ...(brandfarbe ? { brandfarbe } : {}),
          ...(wirkung === 'edel' || wirkung === 'hochwertig' ? { typoModus: typoModus || 'serif_warm_dunkel' } : {}),
        }
      } else if (istLibrary) {
        const [, branche, stil] = templateId.split(':')
        payload = {
          engine: 'library',
          prospectName: prospectName.trim(),
          websiteUrl: websiteUrl.trim(),
          branche,
          stil,
          ort: ort.trim() || null,
          notes: notes.trim() || null,
        }
      } else {
        const selectedTemplate = TEMPLATE_CATALOG.find((t) => t.id === templateId)
        payload = {
          prospectName: prospectName.trim(),
          websiteUrl: websiteUrl.trim(),
          templateId,
          branche: selectedTemplate?.industry || null,
          notes: notes.trim() || null,
        }
      }
      const res = await fetch('/api/admin/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Demo-Generierung fehlgeschlagen')
        return
      }
      setProspectName('')
      setWebsiteUrl('')
      setOrt('')
      setNotes('')
      setTypoModus('')
      setBrandfarbe('')
      setScrollAnimationen(false)
      setWirkung('')
      setSchriftart('')
      setDemos((prev) => [data.demo, ...prev])
      window.open(`/demo/${data.demo.share_token}`, '_blank')

      // Phase 2: Assets im Hintergrund generieren (Hero, Signature, Ergebnis-Paare)
      if (data.needsAssets && data.demo?.id) {
        setWarning('⏳ Bilder werden generiert (~1-2 Min)…')
        try {
          const assetRes = await fetch(`/api/admin/demos/${data.demo.id}/assets`, { method: 'POST' })
          const assetData = await assetRes.json()
          if (assetData.ok) {
            setDemos((prev) => prev.map((d) => d.id === data.demo.id ? { ...d, ...assetData.demo } : d))
            setWarning('✓ Bilder erfolgreich generiert!')

            // Phase 3: Video im Hintergrund (wenn erlaubt)
            if (assetData.videoJob && data.videoJob) {
              setWarning('⏳ Video-Header wird generiert (~2 Min)…')
              fetch(`/api/admin/demos/${data.demo.id}/video`, { method: 'POST' })
                .then((r) => r.json())
                .then((v) => {
                  if (v.ok) {
                    setDemos((prev) => prev.map((d) => d.id === data.demo.id ? { ...d, ...v.demo } : d))
                    setWarning('✓ Bilder + Video erfolgreich generiert!')
                  } else {
                    setError(`Video-Header fehlgeschlagen: ${v.error || 'Unbekannter Fehler'}`)
                  }
                })
                .catch(() => setError('Video-Header Netzwerkfehler'))
            }
          } else {
            setError(`Asset-Generierung fehlgeschlagen: ${assetData.error || 'Unbekannter Fehler'}`)
          }
        } catch {
          setError('Asset-Generierung Netzwerkfehler — Demo wurde ohne Bilder gespeichert.')
        }
      }
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
    setError(null)
    setPaymentLinkResult(null)
    try {
      const res = await fetch(`/api/admin/demos/${demo.id}/payment-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paket }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Payment-Link konnte nicht erstellt werden')
        setPaymentMenuId(null)
        return
      }
      setDemos((prev) => prev.map((d) => (d.id === demo.id ? { ...d, paket, payment_link_url: data.url } : d)))
      try { await navigator.clipboard.writeText(data.url) } catch { /* clipboard kann auf HTTP fehlschlagen */ }
      setPaymentLinkResult({ url: data.url, paket })
    } catch (err) {
      setError(`Payment-Link fehlgeschlagen: ${err instanceof Error ? err.message : 'Netzwerkfehler'}`)
      setPaymentMenuId(null)
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

  async function handleEditSave(demoId: string, edits: Record<string, unknown>) {
    setEditBusy('saving')
    setEditMsg(null)
    try {
      const res = await fetch(`/api/admin/demos/${demoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit', edits }),
      })
      const data = await res.json()
      if (!res.ok) { setEditMsg(`Fehler: ${data.error}`); return }
      setDemos((prev) => prev.map((d) => (d.id === demoId ? { ...d, ...data.demo } : d)))
      setEditMsg('Gespeichert!')
      setTimeout(() => setEditMsg(null), 2000)
    } catch { setEditMsg('Netzwerkfehler') }
    finally { setEditBusy(null) }
  }

  async function handleRegenerateAsset(demoId: string, slot: string) {
    setEditBusy(slot)
    setEditMsg(null)
    try {
      const res = await fetch(`/api/admin/demos/${demoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'regenerate-asset', slot }),
      })
      const data = await res.json()
      if (!res.ok) { setEditMsg(`Fehler: ${data.error}`); return }
      setDemos((prev) => prev.map((d) => (d.id === demoId ? { ...d, ...data.demo } : d)))
      setEditMsg(`${data.regenerated} neu generiert!`)
      setTimeout(() => setEditMsg(null), 3000)
    } catch { setEditMsg('Netzwerkfehler') }
    finally { setEditBusy(null) }
  }

  async function handleGenerateCustomAssets(demoId: string) {
    setBusyId(demoId)
    setError(null)
    setWarning(null)
    try {
      const res = await fetch(`/api/admin/demos/${demoId}/generate-assets`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Asset-Generierung fehlgeschlagen'); return }
      if (data.warnungen?.length) setWarning(data.warnungen.join(' · '))
      else setWarning('Assets generiert! Seite neu laden um sie zu sehen.')
      loadDemos()
    } catch (err) {
      setError(`Asset-Generierung fehlgeschlagen: ${err instanceof Error ? err.message : 'Netzwerkfehler'}`)
    } finally {
      setBusyId(null)
    }
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
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
              <label style={labelStyle}>Ort (für Google-Daten)</label>
              <input type="text" value={ort} onChange={(e) => setOrt(e.target.value)}
                placeholder="z.B. Leipzig" style={inputStyle} disabled={generating} />
            </div>
            <div>
              <label style={labelStyle}>Template *</label>
              <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }} disabled={generating} required>
                <option value="">— Branche wählen —</option>
                {flagshipBranchen.map((b) => (
                  <option key={`flagship:${b.branche_key}`} value={`flagship:${b.branche_key}`}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {templateId.startsWith('flagship:') && (<>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Paket</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['starter', 'business', 'growth'] as const).map((p) => {
                    const info = { starter: { emoji: '🥉', label: 'Starter', preis: '99' }, business: { emoji: '🥈', label: 'Business', preis: '149' }, growth: { emoji: '🥇', label: 'Growth', preis: '249' } }[p]
                    const aktiv = paket === p
                    return (
                      <button key={p} type="button" onClick={() => setPaket(p)} disabled={generating}
                        style={{ flex: 1, padding: '8px 4px', background: aktiv ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.7)', color: aktiv ? '#fff' : 'var(--za-fg-2)', border: aktiv ? 'none' : '1px solid var(--za-border)', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: '1.3' }}>
                        {info.emoji}<br />{info.label}<br /><span style={{ fontSize: '10px', opacity: 0.8 }}>{info.preis} €</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Design-Stil</label>
                <select value={typoModus} onChange={(e) => setTypoModus(e.target.value as typeof typoModus)}
                  style={{ ...inputStyle, cursor: 'pointer' }} disabled={generating}>
                  <option value="">— Vorlage-Standard —</option>
                  <option value="sans_bold_hell">☀️ Hell (modern, direkt)</option>
                  <option value="serif_warm_dunkel">🌙 Dunkel (warm, edel)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Brandfarbe (optional)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="color" value={brandfarbe || '#D4A828'}
                    onChange={(e) => setBrandfarbe(e.target.value)}
                    style={{ width: '38px', height: '38px', border: '1px solid var(--za-border)', borderRadius: '8px', padding: '2px', cursor: 'pointer', background: 'rgba(255,255,255,0.7)' }}
                    disabled={generating} />
                  <input type="text" value={brandfarbe}
                    onChange={(e) => { const v = e.target.value; if (!v || /^#[0-9a-fA-F]{0,6}$/.test(v)) setBrandfarbe(v) }}
                    placeholder="#D4A828" style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }} disabled={generating} />
                  {brandfarbe && (
                    <button type="button" onClick={() => setBrandfarbe('')}
                      style={{ padding: '8px 10px', background: 'none', border: '1px solid var(--za-border)', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--za-fg-3)', fontFamily: 'inherit' }}>
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Wirkung</label>
                <select value={wirkung} onChange={(e) => setWirkung(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }} disabled={generating}>
                  <option value="">— Standard —</option>
                  <option value="modern">Modern & direkt</option>
                  <option value="edel">Edel & hochwertig</option>
                  <option value="warm">Warm & einladend</option>
                  <option value="minimalistisch">Minimalistisch & clean</option>
                  <option value="kraftvoll">Kraftvoll & dynamisch</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={labelStyle}>Schriftart-Stil</label>
                <select value={schriftart} onChange={(e) => setSchriftart(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer' }} disabled={generating}>
                  <option value="">— Aus Vorlage —</option>
                  <option value="sans">Sans-Serif (modern, klar)</option>
                  <option value="serif">Serif (klassisch, edel)</option>
                  <option value="mono">Mono (technisch, markant)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Video-Header</label>
                <select value={paket === 'starter' ? 'nein' : 'ja'} disabled
                  style={{ ...inputStyle, cursor: 'default', opacity: 0.7 }}>
                  <option value="ja">Ja (Business/Growth)</option>
                  <option value="nein">Nein (Starter)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Extras</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: scrollAnimationen ? 'rgba(212,168,40,0.08)' : 'rgba(255,255,255,0.7)', border: `1px solid ${scrollAnimationen ? 'var(--za-gold)' : 'var(--za-border)'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: 'var(--za-fg-2)', transition: '.15s' }}>
                  <input type="checkbox" checked={scrollAnimationen} onChange={(e) => setScrollAnimationen(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--za-gold)' }} disabled={generating} />
                  Scroll-Animationen (Premium)
                </label>
              </div>
            </div>
          </>)}

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
                {templateId.startsWith('flagship:')
                  ? 'Daten werden gesammelt und frische Bilder generiert — dauert ca. 1–3 Minuten.'
                  : 'Website wird gescrapt und Inhalte werden erstellt — dauert ca. 30–60 Sekunden.'}
              </span>
            )}
          </div>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>

      {/* Liste */}
      <div className="panel fade-up" style={{ padding: 0 }}>
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
                <div key={demo.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1, position: 'relative' }}>
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
                      {typeof demo.kosten_cent === 'number' && demo.kosten_cent > 0 && (
                        <span title="Asset-Generierungskosten dieser Demo (DoD: ≤ 1,50 €)"
                          style={{ color: demo.kosten_cent > 150 ? '#b03030' : undefined }}>
                          · {(demo.kosten_cent / 100).toFixed(2).replace('.', ',')} €
                        </span>
                      )}
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
                      <button onClick={() => setPaymentMenuId(paymentMenuId === demo.id ? null : demo.id)} disabled={busy}
                        title={demo.payment_link_url ? `Payment-Link (${demo.paket}) — klicken für neuen Link` : 'Stripe Payment-Link erstellen'}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: copiedPaymentId === demo.id ? 'rgba(46,196,160,0.12)' : 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: copiedPaymentId === demo.id ? '#1e8a70' : 'var(--za-fg-2)', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {copiedPaymentId === demo.id
                          ? <><Check style={{ width: '12px', height: '12px' }} /> Kopiert</>
                          : <><Euro style={{ width: '12px', height: '12px' }} /> {demo.paket ? `Zahlung (${demo.paket})` : 'Zahlung'}</>}
                      </button>
                    )}
                    {demo.status === 'GENERIERT' && !expired && (
                      <button onClick={() => handleStatus(demo, 'VERSENDET')} disabled={busy} title="Als versendet markieren"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--za-fg-3)' }}>
                        <Send style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                    {demo.engine === 'custom' && (
                      <button onClick={() => handleGenerateCustomAssets(demo.id)} disabled={busy} title="Bilder + Video generieren (Higgsfield)"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', color: 'var(--za-fg-2)', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        <Image style={{ width: '12px', height: '12px' }} /> {busy ? 'Generiert…' : 'Assets'}
                      </button>
                    )}
                    {demo.engine === 'flagship' && (
                      <button onClick={() => openEditPanel(demo.id)} disabled={busy} title="Demo bearbeiten"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: editDemoId === demo.id ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.65)', border: editDemoId === demo.id ? 'none' : '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: editDemoId === demo.id ? '#fff' : 'var(--za-fg-3)' }}>
                        <Pencil style={{ width: '13px', height: '13px' }} />
                      </button>
                    )}
                    <button onClick={() => handleRegenerate(demo)} disabled={busy} title="Komplett neu generieren"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: busy ? 'wait' : 'pointer', color: 'var(--za-fg-3)' }}>
                      <RefreshCw style={{ width: '13px', height: '13px', animation: busy ? 'spin 1s linear infinite' : 'none' }} />
                    </button>
                    <button onClick={() => handleDelete(demo)} disabled={busy} title="Löschen"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: '#b03030' }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                  {/* Edit-Panel */}
                  {editDemoId === demo.id && demo.engine === 'flagship' && editConfig && (() => {
                    const cfg = editConfig
                    return (
                      <div style={{ padding: '16px 20px', background: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--za-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-3)' }}>Demo bearbeiten</span>
                          {editMsg && <span style={{ fontSize: '11px', color: editMsg.startsWith('Fehler') ? '#b03030' : '#1e8a70', fontWeight: 600 }}>{editMsg}</span>}
                        </div>
                        {/* Texte */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--za-fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Headline</label>
                            <input defaultValue={cfg.inhalte.hero.headline_zeilen.join(' · ')} id={`edit-headline-${demo.id}`}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '6px', fontFamily: 'inherit', marginTop: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--za-fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Lead-Text</label>
                            <input defaultValue={cfg.inhalte.hero.lead} id={`edit-lead-${demo.id}`}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '6px', fontFamily: 'inherit', marginTop: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--za-fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Firmenname</label>
                            <input defaultValue={cfg.meta.firma} id={`edit-firma-${demo.id}`}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '6px', fontFamily: 'inherit', marginTop: '4px' }} />
                          </div>
                          <div>
                            <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--za-fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ort</label>
                            <input defaultValue={cfg.meta.ort} id={`edit-ort-${demo.id}`}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '6px', fontFamily: 'inherit', marginTop: '4px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                          <button onClick={() => {
                            const headline = (document.getElementById(`edit-headline-${demo.id}`) as HTMLInputElement)?.value || ''
                            const lead = (document.getElementById(`edit-lead-${demo.id}`) as HTMLInputElement)?.value || ''
                            const firma = (document.getElementById(`edit-firma-${demo.id}`) as HTMLInputElement)?.value || ''
                            const ort = (document.getElementById(`edit-ort-${demo.id}`) as HTMLInputElement)?.value || ''
                            handleEditSave(demo.id, {
                              meta: { firma, ort },
                              inhalte: { hero: { headline_zeilen: headline.split(' · ').map((s: string) => s.trim()).filter(Boolean), lead } },
                            })
                          }} disabled={editBusy !== null}
                            style={{ padding: '7px 16px', background: 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {editBusy === 'saving' ? 'Speichert…' : 'Texte speichern'}
                          </button>
                        </div>
                        {/* Asset-Regenerierung */}
                        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--za-fg-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Einzelne Bilder neu generieren</div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button onClick={() => handleRegenerateAsset(demo.id, 'hero')} disabled={editBusy !== null}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--za-border)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: editBusy ? 'wait' : 'pointer', fontFamily: 'inherit', color: 'var(--za-fg-2)' }}>
                            <Image style={{ width: '12px', height: '12px' }} />
                            {editBusy === 'hero' ? 'Generiert…' : 'Hero + Video'}
                          </button>
                          <button onClick={() => handleRegenerateAsset(demo.id, 'signature')} disabled={editBusy !== null}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--za-border)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: editBusy ? 'wait' : 'pointer', fontFamily: 'inherit', color: 'var(--za-fg-2)' }}>
                            <Image style={{ width: '12px', height: '12px' }} />
                            {editBusy === 'signature' ? 'Generiert…' : 'Vorher/Nachher'}
                          </button>
                          {cfg.inhalte.ergebnisse.paare?.map((_, i) => (
                            <button key={i} onClick={() => handleRegenerateAsset(demo.id, `ergebnis-${i}`)} disabled={editBusy !== null}
                              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--za-border)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: editBusy ? 'wait' : 'pointer', fontFamily: 'inherit', color: 'var(--za-fg-2)' }}>
                              <Image style={{ width: '12px', height: '12px' }} />
                              {editBusy === `ergebnis-${i}` ? 'Generiert…' : `Ergebnis ${i + 1}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Payment-Menü als Fixed-Overlay */}
      {paymentMenuId && (() => {
        const demo = demos.find((d) => d.id === paymentMenuId)
        if (!demo) return null
        const busy = busyId === demo.id
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => { setPaymentMenuId(null); setPaymentLinkResult(null) }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
            <div style={{ position: 'relative', background: '#fff', borderRadius: '14px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: '24px', minWidth: '340px', maxWidth: '440px' }}
              onClick={(e) => e.stopPropagation()}>

              {/* Erfolgs-Ansicht: Link wurde erstellt */}
              {paymentLinkResult ? (
                <>
                  <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(46,196,160,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Check style={{ width: '24px', height: '24px', color: '#1e8a70' }} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700 }}>Zahlungslink erstellt</div>
                    <div style={{ fontSize: '12px', color: 'var(--za-fg-3)', marginTop: '4px' }}>{demo.prospect_name} · {PACKAGES.find((p) => p.id === paymentLinkResult.paket)?.name} · {PACKAGES.find((p) => p.id === paymentLinkResult.paket)?.price} €/Mt</div>
                  </div>
                  <div style={{ background: 'var(--za-bg-2, #f5f3ed)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--za-fg-2)', marginBottom: '12px', userSelect: 'all' }}>
                    {paymentLinkResult.url}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={async () => { try { await navigator.clipboard.writeText(paymentLinkResult.url) } catch {} setCopiedPaymentId(demo.id); setTimeout(() => setCopiedPaymentId(null), 2000) }}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {copiedPaymentId === demo.id ? <><Check style={{ width: '13px', height: '13px' }} /> Kopiert</> : <><Copy style={{ width: '13px', height: '13px' }} /> Link kopieren</>}
                    </button>
                    <button onClick={() => { setPaymentMenuId(null); setPaymentLinkResult(null) }}
                      style={{ padding: '10px 16px', background: 'none', border: '1px solid var(--za-border)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--za-fg-3)' }}>
                      Schließen
                    </button>
                  </div>
                </>
              ) : (
                /* Paket-Auswahl */
                <>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Zahlungslink erstellen</div>
                  <div style={{ fontSize: '12px', color: 'var(--za-fg-3)', marginBottom: '16px' }}>{demo.prospect_name}</div>
                  {demo.payment_link_url && (
                    <button onClick={() => { handleCopyPaymentLink(demo); setPaymentMenuId(null) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'rgba(46,196,160,0.08)', border: '1px solid rgba(46,196,160,0.3)', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', color: '#1e8a70', fontFamily: 'inherit', textAlign: 'left', marginBottom: '12px', fontWeight: 600 }}>
                      <Copy style={{ width: '14px', height: '14px' }} /> Bestehenden Link kopieren ({demo.paket})
                    </button>
                  )}
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-4)', marginBottom: '8px' }}>
                    {demo.payment_link_url ? 'Oder neuen Link erstellen' : 'Paket wählen'}
                  </div>
                  {PACKAGES.map((p) => (
                    <button key={p.id} onClick={() => handlePaymentLink(demo, p.id)} disabled={busy}
                      style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', padding: '14px', background: busy ? 'rgba(0,0,0,0.04)' : 'none', border: '1px solid var(--za-border)', borderRadius: '8px', fontSize: '13px', cursor: busy ? 'wait' : 'pointer', color: 'var(--za-fg-1)', fontFamily: 'inherit', textAlign: 'left', marginBottom: '6px', transition: '.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <span style={{ fontWeight: 700 }}>{p.emoji} {p.name}</span>
                        <span style={{ fontWeight: 700, color: 'var(--za-fg-1)' }}>{p.price} €/Mt</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: '1.4' }}>
                        {p.features.slice(0, 4).join(' · ')}
                      </div>
                    </button>
                  ))}
                  <button onClick={() => { setPaymentMenuId(null); setPaymentLinkResult(null) }}
                    style={{ marginTop: '10px', width: '100%', padding: '8px', background: 'none', border: 'none', fontSize: '12px', color: 'var(--za-fg-4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Abbrechen
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })()}
    </>
  )
}
