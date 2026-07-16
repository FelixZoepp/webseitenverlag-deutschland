'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, Check, Clock, AlertCircle } from 'lucide-react'

interface Ticket {
  id: string
  betreff: string
  nachricht: string
  status: 'offen' | 'in_bearbeitung' | 'erledigt'
  prioritaet: string
  quelle: string
  antwort: string | null
  created_at: string
  customers?: { name: string; email: string } | null
}

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string; icon: typeof AlertCircle }> = {
  offen: { label: 'Offen', bg: 'rgba(220,60,60,0.08)', fg: '#b03030', icon: AlertCircle },
  in_bearbeitung: { label: 'In Arbeit', bg: 'rgba(212,168,40,0.10)', fg: '#a8821e', icon: Clock },
  erledigt: { label: 'Erledigt', bg: 'rgba(46,196,160,0.10)', fg: '#1e8a70', icon: Check },
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [antwortId, setAntwortId] = useState<string | null>(null)
  const [antwortText, setAntwortText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/support')
      const data = await res.json()
      if (res.ok) setTickets(data.tickets || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function updateStatus(id: string, status: string, antwort?: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, antwort }),
      })
      const data = await res.json()
      if (res.ok) {
        setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...data.ticket } : t)))
        setAntwortId(null)
        setAntwortText('')
      }
    } finally { setBusy(false) }
  }

  const offen = tickets.filter((t) => t.status === 'offen').length
  const inArbeit = tickets.filter((t) => t.status === 'in_bearbeitung').length

  return (
    <>
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Support</span>
          <span className="tb-heading">Ticket-Queue</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
          {offen > 0 && <span style={{ color: '#b03030', fontWeight: 600 }}>{offen} offen</span>}
          {inArbeit > 0 && <span style={{ color: '#a8821e', fontWeight: 600 }}>{inArbeit} in Arbeit</span>}
          <span style={{ color: 'var(--za-fg-3)' }}>{tickets.length} gesamt</span>
        </div>
      </div>

      <div className="panel fade-up" style={{ padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)' }}>
          <span className="panel-title">Alle Tickets</span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Keine Support-Tickets — alles läuft!
          </div>
        ) : (
          <div>
            {tickets.map((ticket) => {
              const st = STATUS_STYLES[ticket.status] || STATUS_STYLES.offen
              const Icon = st.icon
              return (
                <div key={ticket.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--za-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <MessageCircle style={{ width: '14px', height: '14px', color: 'var(--za-fg-3)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{ticket.betreff}</span>
                    <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: st.bg, color: st.fg, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon style={{ width: '10px', height: '10px' }} /> {st.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginLeft: 'auto' }}>
                      {ticket.customers?.name || '—'} · {ticket.quelle} · {new Date(ticket.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--za-fg-2)', margin: '0 0 8px 24px', lineHeight: '1.5' }}>{ticket.nachricht}</p>
                  {ticket.antwort && (
                    <div style={{ margin: '0 0 8px 24px', padding: '8px 12px', background: 'rgba(46,196,160,0.06)', borderRadius: '6px', fontSize: '12px', color: '#1e8a70' }}>
                      Antwort: {ticket.antwort}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', marginLeft: '24px' }}>
                    {ticket.status === 'offen' && (
                      <button onClick={() => updateStatus(ticket.id, 'in_bearbeitung')} disabled={busy}
                        style={{ padding: '5px 12px', background: 'rgba(212,168,40,0.08)', border: '1px solid rgba(212,168,40,0.3)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#a8821e', fontFamily: 'inherit' }}>
                        In Arbeit nehmen
                      </button>
                    )}
                    {ticket.status !== 'erledigt' && (
                      <>
                        <button onClick={() => setAntwortId(antwortId === ticket.id ? null : ticket.id)}
                          style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.7)', border: '1px solid var(--za-border)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: 'var(--za-fg-2)', fontFamily: 'inherit' }}>
                          Antworten & erledigen
                        </button>
                        {antwortId === ticket.id && (
                          <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                            <input value={antwortText} onChange={(e) => setAntwortText(e.target.value)}
                              placeholder="Antwort eingeben…" style={{ flex: 1, padding: '5px 10px', fontSize: '11px', border: '1px solid var(--za-border)', borderRadius: '6px', fontFamily: 'inherit' }} />
                            <button onClick={() => updateStatus(ticket.id, 'erledigt', antwortText)} disabled={busy || !antwortText.trim()}
                              style={{ padding: '5px 12px', background: 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                              Erledigen
                            </button>
                          </div>
                        )}
                      </>
                    )}
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
