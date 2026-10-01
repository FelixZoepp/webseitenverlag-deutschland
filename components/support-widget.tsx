'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Ticket, ArrowLeft } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type View = 'chat' | 'ticket-form' | 'ticket-sent'

export default function SupportWidget({ siteId }: { siteId?: string }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>('chat')
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hallo! Wie kann ich Ihnen helfen? Ich kenne mich mit Ihrer Website, dem Dashboard und technischen Fragen aus.' },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [ticketBetreff, setTicketBetreff] = useState('')
  const [ticketNachricht, setTicketNachricht] = useState('')
  const [ticketKategorie, setTicketKategorie] = useState('sonstiges')
  const [ticketSending, setTicketSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const sendMessage = useCallback(async () => {
    const msg = input.trim()
    if (!msg || sending) return
    setInput('')
    const userMsg: Message = { role: 'user', content: msg }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setSending(true)

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: newMessages.slice(-10) }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.' }])
    } finally {
      setSending(false)
    }
  }, [input, sending, messages])

  const createTicket = async () => {
    if (!ticketBetreff.trim() || !ticketNachricht.trim() || ticketSending) return
    setTicketSending(true)
    try {
      await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betreff: ticketBetreff.trim(),
          nachricht: ticketNachricht.trim(),
          kategorie: ticketKategorie,
          site_id: siteId || null,
        }),
      })
      setView('ticket-sent')
    } catch {
      alert('Fehler beim Erstellen des Tickets')
    } finally {
      setTicketSending(false)
    }
  }

  const resetTicket = () => {
    setTicketBetreff('')
    setTicketNachricht('')
    setTicketKategorie('sonstiges')
    setView('chat')
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} aria-label="Support öffnen" style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        width: 52, height: 52, borderRadius: '50%',
        background: 'var(--za-gold-grad, linear-gradient(135deg, #e0354b, #ff6b6b))',
        color: '#fff', border: 'none', cursor: 'pointer',
        display: 'grid', placeItems: 'center',
        boxShadow: '0 4px 20px -4px rgba(224,53,75,0.5)',
        transition: 'transform 200ms',
      }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
        <MessageCircle size={22} />
      </button>
    )
  }

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      width: 380, maxWidth: 'calc(100vw - 32px)', height: 520, maxHeight: 'calc(100vh - 48px)',
      borderRadius: 16, overflow: 'hidden',
      background: '#fff', border: '1px solid #e5e7eb',
      boxShadow: '0 20px 60px -12px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #1f2937, #374151)', color: '#fff', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {view !== 'chat' && (
            <button onClick={resetTicket} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              {view === 'chat' ? 'Support' : view === 'ticket-form' ? 'Ticket erstellen' : 'Ticket erstellt'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              {view === 'chat' ? 'Wie können wir helfen?' : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {view === 'chat' && (
            <button onClick={() => setView('ticket-form')} title="Ticket erstellen"
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Ticket size={13} /> Ticket
            </button>
          )}
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 2, display: 'flex' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Chat View */}
      {view === 'chat' && (
        <>
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? '#1f2937' : '#f3f4f6',
                  color: m.role === 'user' ? '#fff' : '#1f2937',
                  borderBottomRightRadius: m.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: m.role === 'assistant' ? 4 : 12,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: 12, background: '#f3f4f6', fontSize: 13, color: '#9ca3af' }}>
                  Tippt...
                </div>
              </div>
            )}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, flexShrink: 0 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Frage stellen..."
              disabled={sending}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e7eb',
                fontSize: 13, outline: 'none', fontFamily: 'inherit',
                background: sending ? '#f9fafb' : '#fff',
              }}
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()} style={{
              width: 40, height: 40, borderRadius: 10, border: 'none', cursor: 'pointer',
              background: input.trim() ? '#1f2937' : '#e5e7eb',
              color: input.trim() ? '#fff' : '#9ca3af',
              display: 'grid', placeItems: 'center', transition: 'background 200ms',
            }}>
              <Send size={16} />
            </button>
          </div>
        </>
      )}

      {/* Ticket Form */}
      {view === 'ticket-form' && (
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
            Beschreiben Sie Ihr Anliegen und wir melden uns schnellstmöglich bei Ihnen.
          </p>
          <div>
            <label style={labelStyle}>Kategorie</label>
            <select value={ticketKategorie} onChange={e => setTicketKategorie(e.target.value)} style={inputStyle}>
              <option value="sonstiges">Allgemeine Frage</option>
              <option value="editor">Website bearbeiten</option>
              <option value="domain">Domain / DNS</option>
              <option value="seite_offline">Seite offline</option>
              <option value="zahlung">Zahlung / Rechnung</option>
              <option value="kuendigung">Kündigung / Vertrag</option>
              <option value="dsgvo">DSGVO / Datenschutz</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Betreff</label>
            <input value={ticketBetreff} onChange={e => setTicketBetreff(e.target.value)}
              placeholder="Kurze Beschreibung"
              style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nachricht</label>
            <textarea value={ticketNachricht} onChange={e => setTicketNachricht(e.target.value)}
              placeholder="Beschreiben Sie Ihr Anliegen möglichst genau..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <button onClick={createTicket} disabled={ticketSending || !ticketBetreff.trim() || !ticketNachricht.trim()} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: ticketBetreff.trim() && ticketNachricht.trim() ? '#1f2937' : '#e5e7eb',
            color: ticketBetreff.trim() && ticketNachricht.trim() ? '#fff' : '#9ca3af',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            {ticketSending ? 'Wird erstellt...' : 'Ticket absenden'}
          </button>
        </div>
      )}

      {/* Ticket Sent */}
      {view === 'ticket-sent' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5',
            display: 'grid', placeItems: 'center', marginBottom: 20,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" width="28" height="28">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4 12 14.01l-3-3" />
            </svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Ticket erstellt!</h3>
          <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>
            Wir haben Ihre Anfrage erhalten und melden uns schnellstmöglich bei Ihnen.
          </p>
          <button onClick={resetTicket} style={{
            padding: '10px 24px', borderRadius: 10, border: '1px solid #e5e7eb',
            background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            Zurück zum Chat
          </button>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb',
  fontSize: 14, outline: 'none', fontFamily: 'inherit', background: '#fff',
}
