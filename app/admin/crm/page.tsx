'use client'

/**
 * Admin-CRM: Vertriebs-Pipeline als Kanban-Board.
 * Stages: Neuer Lead → Erstgespräch → Closing Terminiert → Closing No Show → Closed | Verloren.
 * Karte anklicken → Detail-Panel mit allen Daten, Stage-Wechsel und Notizen-Log.
 */

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, X, Loader2, Phone, Mail, Globe, StickyNote } from 'lucide-react'
import { anzeigeName } from '@/lib/crm/anzeige-name'

type CrmStage = 'neuer_lead' | 'erstgespraech' | 'closing_terminiert' | 'closing_no_show' | 'closed' | 'verloren'

interface CrmLead {
  id: string
  name: string | null
  firma: string | null
  email: string | null
  telefon: string | null
  website: string | null
  branche: string | null
  nachricht: string | null
  quelle: string | null
  utm_source: string | null
  utm_campaign: string | null
  crm_stage: CrmStage
  demo_id: string | null
  created_at: string
  notizen_anzahl: number
  letzte_notiz: string | null
  letzte_notiz_autor: string | null
}

interface Notiz {
  id: string
  text: string
  created_at: string
  autor: string | null
}

const STAGES: { key: CrmStage; label: string; accent: string }[] = [
  { key: 'neuer_lead', label: 'Neuer Lead', accent: '#2563eb' },
  { key: 'erstgespraech', label: 'Erstgespräch', accent: '#a8821e' },
  { key: 'closing_terminiert', label: 'Closing Terminiert', accent: '#7c3aed' },
  { key: 'closing_no_show', label: 'Closing No Show', accent: '#b45309' },
  { key: 'closed', label: 'Closed', accent: '#1e8a70' },
  { key: 'verloren', label: 'Verloren', accent: '#B3261E' },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function CrmPage() {
  const [leads, setLeads] = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aktiv, setAktiv] = useState<CrmLead | null>(null)
  const [notizen, setNotizen] = useState<Notiz[]>([])
  const [notizenLaden, setNotizenLaden] = useState(false)
  const [neueNotiz, setNeueNotiz] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragLeadId, setDragLeadId] = useState<string | null>(null)
  const [dropStage, setDropStage] = useState<CrmStage | null>(null)

  const laden = useCallback(async () => {
    const res = await fetch('/api/admin/crm')
    if (res.ok) {
      const data = await res.json()
      setLeads(data.leads ?? [])
    } else {
      setError('Leads konnten nicht geladen werden.')
    }
    setLoading(false)
  }, [])

  useEffect(() => { laden() }, [laden])

  const notizenLadenFn = useCallback(async (leadId: string) => {
    setNotizenLaden(true)
    const res = await fetch(`/api/admin/leads/${leadId}/notizen`)
    if (res.ok) {
      const data = await res.json()
      setNotizen(data.notizen ?? [])
    }
    setNotizenLaden(false)
  }, [])

  function oeffnen(lead: CrmLead) {
    setAktiv(lead)
    setNotizen([])
    setNeueNotiz('')
    notizenLadenFn(lead.id)
  }

  async function stageWechseln(lead: CrmLead, stage: CrmStage) {
    if (lead.crm_stage === stage) return
    const vorher = lead.crm_stage
    setBusy(true)
    setError(null)
    // Optimistisch: Karte wechselt sofort die Spalte, bei Fehler Rollback.
    setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, crm_stage: stage } : l)))
    setAktiv((prev) => (prev && prev.id === lead.id ? { ...prev, crm_stage: stage } : prev))
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crm_stage: stage }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Stage-Wechsel fehlgeschlagen.')
      }
    } catch (e) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? { ...l, crm_stage: vorher } : l)))
      setAktiv((prev) => (prev && prev.id === lead.id ? { ...prev, crm_stage: vorher } : prev))
      setError(e instanceof Error ? e.message : 'Netzwerkfehler beim Stage-Wechsel.')
    } finally {
      setBusy(false)
    }
  }

  async function notizSpeichern() {
    if (!aktiv || !neueNotiz.trim()) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/leads/${aktiv.id}/notizen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: neueNotiz.trim() }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error || 'Notiz konnte nicht gespeichert werden.')
        return
      }
      if (data?.notiz) {
        setNotizen((prev) => [data.notiz, ...prev])
        setLeads((prev) => prev.map((l) => (l.id === aktiv.id ? { ...l, notizen_anzahl: l.notizen_anzahl + 1, letzte_notiz: data.notiz.text, letzte_notiz_autor: data.notiz.autor ?? null } : l)))
      }
      setNeueNotiz('')
    } catch {
      setError('Netzwerkfehler beim Speichern der Notiz.')
    } finally {
      setBusy(false)
    }
  }

  function handleDrop(stageKey: CrmStage) {
    const id = dragLeadId
    setDragLeadId(null)
    setDropStage(null)
    if (!id) return
    if (busy) return
    const lead = leads.find((l) => l.id === id)
    if (!lead || lead.crm_stage === stageKey) return
    stageWechseln(lead, stageKey)
  }

  return (
    <div className="fade-up">
      <div className="topbar">
        <div>
          <div className="tb-eyebrow">Closer</div>
          <div className="tb-heading">CRM-Pipeline</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
          <button onClick={() => { setLoading(true); laden() }} className="sb-item" style={{ cursor: 'pointer', background: 'transparent' }}>
            <RefreshCw size={14} /> Aktualisieren
          </button>
        </div>
      </div>

      {error && (
        <div className="panel" style={{ padding: '14px 18px', marginBottom: '16px', borderColor: 'rgba(179,38,30,0.35)' }}>
          <span style={{ fontSize: '12px', color: '#B3261E' }}>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-3)', fontSize: '12px' }}>Lade Pipeline…</div>
      ) : (
        <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '12px', alignItems: 'flex-start' }}>
          {STAGES.map((stage) => {
            const spalte = leads.filter((l) => l.crm_stage === stage.key)
            return (
              <div
                key={stage.key}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (dropStage !== stage.key) setDropStage(stage.key) }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropStage((prev) => (prev === stage.key ? null : prev)) }}
                onDrop={(e) => { e.preventDefault(); handleDrop(stage.key) }}
                style={{
                  minWidth: '250px', width: '250px', flexShrink: 0,
                  borderRadius: '10px',
                  outline: dropStage === stage.key ? `2px dashed ${stage.accent}` : '2px dashed transparent',
                  outlineOffset: '2px',
                  transition: 'outline-color 120ms',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px 10px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: stage.accent }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--za-fg-2)' }}>{stage.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--za-fg-3)' }}>{spalte.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {spalte.length === 0 && (
                    <div className="panel" style={{ padding: '14px', fontSize: '11px', color: 'var(--za-fg-4)', textAlign: 'center' }}>Leer</div>
                  )}
                  {spalte.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => oeffnen(lead)}
                      draggable={!busy}
                      onDragStart={(e) => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; setDragLeadId(lead.id) }}
                      onDragEnd={() => { setDragLeadId(null); setDropStage(null) }}
                      className="panel"
                      style={{ padding: '12px 14px', textAlign: 'left', cursor: busy ? 'default' : 'grab', width: '100%', borderLeft: `3px solid ${stage.accent}`, opacity: dragLeadId === lead.id ? 0.4 : 1 }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--za-fg)' }}>{lead.firma || lead.name || 'Ohne Namen'}</div>
                      {lead.firma && lead.name && (
                        <div style={{ fontSize: '11px', color: 'var(--za-fg-2)', marginTop: '2px' }}>{lead.name}</div>
                      )}
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {lead.branche && <span>{lead.branche}</span>}
                        {lead.telefon && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Phone size={10} /> {lead.telefon}</span>}
                        <span>{formatDate(lead.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                        {lead.quelle && (
                          <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '999px', background: 'rgba(37,99,235,0.10)', color: '#2563eb' }}>
                            {lead.quelle}
                          </span>
                        )}
                        {lead.notizen_anzahl > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: 'var(--za-fg-3)' }}>
                            <StickyNote size={10} /> {lead.notizen_anzahl}
                          </span>
                        )}
                      </div>
                      {lead.letzte_notiz && (
                        <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic' }}>
                          {anzeigeName(lead.letzte_notiz_autor) ? `${anzeigeName(lead.letzte_notiz_autor)}: ` : ''}„{lead.letzte_notiz}”
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detail-Panel */}
      {aktiv && (
        <div
          onClick={() => setAktiv(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="panel"
            style={{ width: 'min(460px, 100%)', height: '100%', overflowY: 'auto', borderRadius: 0, padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--za-obsidian, #111)' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--za-fg)' }}>{aktiv.firma || aktiv.name || 'Ohne Namen'}</div>
                {aktiv.firma && aktiv.name && <div style={{ fontSize: '12px', color: 'var(--za-fg-2)' }}>{aktiv.name}</div>}
                <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', marginTop: '4px' }}>Eingegangen: {formatDate(aktiv.created_at)}</div>
              </div>
              <button onClick={() => setAktiv(null)} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--za-fg-2)', cursor: 'pointer' }} aria-label="Schließen">
                <X size={18} />
              </button>
            </div>

            {/* Stage-Wechsel */}
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-3)', marginBottom: '6px' }}>Pipeline-Stage</div>
              <select
                value={aktiv.crm_stage}
                disabled={busy}
                onChange={(e) => stageWechseln(aktiv, e.target.value as CrmStage)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--za-fg)', fontSize: '13px' }}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Kontaktdaten */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--za-fg-2)' }}>
              {aktiv.email && (
                <a href={`mailto:${aktiv.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                  <Mail size={13} /> {aktiv.email}
                </a>
              )}
              {aktiv.telefon && (
                <a href={`tel:${aktiv.telefon}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                  <Phone size={13} /> {aktiv.telefon}
                </a>
              )}
              {aktiv.website && (
                <a href={aktiv.website.startsWith('http') ? aktiv.website : `https://${aktiv.website}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--za-fg-2)', textDecoration: 'none' }}>
                  <Globe size={13} /> {aktiv.website}
                </a>
              )}
              {aktiv.branche && <span>Branche: {aktiv.branche}</span>}
              {aktiv.quelle && <span>Quelle: {aktiv.quelle}{aktiv.utm_source ? ` · ${aktiv.utm_source}` : ''}{aktiv.utm_campaign ? ` · ${aktiv.utm_campaign}` : ''}</span>}
            </div>

            {/* Funnel-Antworten / Nachricht */}
            {aktiv.nachricht && (
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-3)', marginBottom: '6px' }}>Anfrage-Details</div>
                <div style={{ fontSize: '12px', color: 'var(--za-fg-2)', whiteSpace: 'pre-wrap', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
                  {aktiv.nachricht}
                </div>
              </div>
            )}

            {/* Notizen */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--za-fg-3)' }}>Notizen</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  value={neueNotiz}
                  onChange={(e) => setNeueNotiz(e.target.value)}
                  placeholder="Neue Notiz — z. B. Gesprächsergebnis, nächster Schritt…"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'var(--za-fg)', fontSize: '12px', resize: 'vertical' }}
                />
                <button
                  onClick={notizSpeichern}
                  disabled={busy || !neueNotiz.trim()}
                  style={{ alignSelf: 'flex-end', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--za-gold-grad)', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: busy || !neueNotiz.trim() ? 'default' : 'pointer', opacity: busy || !neueNotiz.trim() ? 0.5 : 1 }}
                >
                  {busy ? <Loader2 size={12} className="animate-spin" /> : <StickyNote size={12} />}
                  Notiz speichern
                </button>
              </div>
              {notizenLaden ? (
                <div style={{ fontSize: '11px', color: 'var(--za-fg-3)' }}>Lade Notizen…</div>
              ) : notizen.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--za-fg-4)' }}>Noch keine Notizen.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {notizen.map((n) => (
                    <div key={n.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--za-fg)', whiteSpace: 'pre-wrap' }}>{n.text}</div>
                      <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '4px' }}>
                        {[anzeigeName(n.autor), formatDate(n.created_at)].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
