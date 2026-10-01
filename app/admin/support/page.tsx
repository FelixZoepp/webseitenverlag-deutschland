'use client'

import { useCallback, useEffect, useState } from 'react'
import { MessageCircle, Check, Clock, AlertCircle, Send } from 'lucide-react'

interface SupportMessage {
  id: string
  absender: 'kunde' | 'admin' | 'bot'
  inhalt: string
  created_at: string
}

interface Ticket {
  id: string
  betreff: string
  status: 'offen' | 'in_bearbeitung' | 'geloest' | 'geschlossen'
  prioritaet: string
  kategorie: string | null
  letzter_absender: string
  created_at: string
  updated_at: string
  customers?: { company_name: string; contact_email: string } | null
  support_messages?: SupportMessage[]
}

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string; icon: typeof AlertCircle }> = {
  offen: { label: 'Offen', bg: 'rgba(220,60,60,0.08)', fg: '#b03030', icon: AlertCircle },
  in_bearbeitung: { label: 'In Arbeit', bg: 'rgba(212,168,40,0.10)', fg: '#a8821e', icon: Clock },
  geloest: { label: 'Gelöst', bg: 'rgba(46,196,160,0.10)', fg: '#1e8a70', icon: Check },
  geschlossen: { label: 'Geschlossen', bg: 'rgba(128,128,128,0.10)', fg: '#6b7280', icon: Check },
}

const KAT_LABELS: Record<string, string> = {
  editor: 'Editor', domain: 'Domain', seite_offline: 'Seite offline',
  zahlung: 'Zahlung', kuendigung: 'Kündigung', dsgvo: 'DSGVO', sonstiges: 'Allgemein',
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/support')
      const data = await res.json()
      if (res.ok) setTickets(data.tickets || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAction(ticketId: string, status?: string, antwort?: string) {
    setBusy(true)
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, status, antwort }),
      })
      if (res.ok) {
        setReplyText('')
        await load()
      }
    } finally { setBusy(false) }
  }

  const offen = tickets.filter(t => t.status === 'offen').length
  const inArbeit = tickets.filter(t => t.status === 'in_bearbeitung').length

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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Keine Support-Tickets — alles läuft!
          </div>
        ) : (
          <div>
            {tickets.map(ticket => {
              const st = STATUS_STYLES[ticket.status] || STATUS_STYLES.offen
              const Icon = st.icon
              const msgs = (ticket.support_messages || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              const isExpanded = expandedId === ticket.id
              const kundenName = ticket.customers?.company_name || ticket.customers?.contact_email || '—'
              const isOpen = ticket.status === 'offen' || ticket.status === 'in_bearbeitung'

              return (
                <div key={ticket.id} style={{ borderBottom: '1px solid var(--za-border)' }}>
                  {/* Header */}
                  <button onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                    style={{ width: '100%', textAlign: 'left', padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <MessageCircle style={{ width: '14px', height: '14px', color: 'var(--za-fg-3)', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg)', flex: 1 }}>{ticket.betreff}</span>
                    {ticket.kategorie && (
                      <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99,102,241,0.08)', color: '#6366f1', fontWeight: 600 }}>
                        {KAT_LABELS[ticket.kategorie] || ticket.kategorie}
                      </span>
                    )}
                    <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: st.bg, color: st.fg, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Icon style={{ width: '10px', height: '10px' }} /> {st.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--za-fg-4)', whiteSpace: 'nowrap' }}>
                      {kundenName} &middot; {new Date(ticket.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>

                  {/* Expanded */}
                  {isExpanded && (
                    <div style={{ padding: '0 20px 16px 44px' }}>
                      {/* Messages */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {msgs.map(msg => (
                          <div key={msg.id} style={{
                            padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: '1.6',
                            background: msg.absender === 'admin' ? 'rgba(46,196,160,0.06)' : msg.absender === 'bot' ? 'rgba(99,102,241,0.06)' : 'rgba(0,0,0,0.03)',
                            borderLeft: `3px solid ${msg.absender === 'admin' ? '#059669' : msg.absender === 'bot' ? '#6366f1' : '#d1d5db'}`,
                          }}>
                            <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              {msg.absender === 'admin' ? 'Support' : msg.absender === 'bot' ? 'Bot' : 'Kunde'} &middot; {new Date(msg.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {msg.inhalt}
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      {isOpen && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                          <div style={{ flex: 1 }}>
                            <input value={replyText} onChange={e => setReplyText(e.target.value)}
                              placeholder="Antwort schreiben..."
                              onKeyDown={e => e.key === 'Enter' && replyText.trim() && handleAction(ticket.id, 'geloest', replyText)}
                              style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: '1px solid var(--za-border)', borderRadius: '8px', fontFamily: 'inherit', outline: 'none' }} />
                          </div>
                          <button onClick={() => replyText.trim() && handleAction(ticket.id, 'geloest', replyText)} disabled={busy || !replyText.trim()}
                            style={{ padding: '8px 16px', background: 'var(--za-gold-grad)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Send style={{ width: '12px', height: '12px' }} /> Antworten & lösen
                          </button>
                          {ticket.status === 'offen' && (
                            <button onClick={() => handleAction(ticket.id, 'in_bearbeitung')} disabled={busy}
                              style={{ padding: '8px 12px', background: 'rgba(212,168,40,0.08)', border: '1px solid rgba(212,168,40,0.3)', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: '#a8821e', fontFamily: 'inherit' }}>
                              In Arbeit
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
