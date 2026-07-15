'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileSignature, AlertTriangle, Check, X, Loader2, Ban } from 'lucide-react'
import { konditionenKurz } from '@/config/vertraege'

interface Vertrag {
  id: string
  paket: string
  monatsrate_cent: number
  beginn: string
  ende: string
  status: string
  gekuendigt_am: string | null
  kuendigung_zum: string | null
  mahnstufe: number
  zahlung_ueberfaellig_seit: string | null
  letzte_zahlung_am: string | null
  laufzeit_monate: number
  verlaengerung_monate: number
  kuendigungsfrist_monate: number
  stripe_subscription_id: string | null
  created_at: string
  customers: { id: string; company_name: string | null; contact_email: string | null } | null
}

interface Aufgabe {
  id: string
  typ: string
  status: string
  titel: string
  beschreibung: string | null
  customer_id: string | null
  contract_id: string | null
  quelle: string | null
  faellig_am: string | null
  created_at: string
}

const STATUS_STYLES: Record<string, { label: string; bg: string; fg: string }> = {
  AKTIV: { label: 'Aktiv', bg: 'rgba(46,196,160,0.12)', fg: '#1e8a70' },
  GEKUENDIGT: { label: 'Gekündigt', bg: 'rgba(212,168,40,0.12)', fg: '#a8821e' },
  BEENDET: { label: 'Beendet', bg: 'rgba(0,0,0,0.06)', fg: '#8a877f' },
}

const MAHNSTUFEN: Record<number, { label: string; fg: string }> = {
  0: { label: '—', fg: 'var(--za-fg-4)' },
  1: { label: 'Stufe 1 · Erinnerung', fg: '#a8821e' },
  2: { label: 'Stufe 2 · Mahnung', fg: '#c0641e' },
  3: { label: 'Stufe 3 · Gesperrt', fg: '#b03030' },
}

const TASK_TYP_LABEL: Record<string, string> = {
  MAIL_FEHLGESCHLAGEN: 'Mail fehlgeschlagen',
  DUNNING_ESKALIERT: 'Mahnwesen eskaliert',
  KUENDIGUNG: 'Kündigung',
  PROVISIONING_LUECKE: 'Provisioning-Lücke',
  SONSTIGES: 'Sonstiges',
}

function formatDatum(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatEuro(cent: number): string {
  return `${(cent / 100).toLocaleString('de-DE', { minimumFractionDigits: 0 })} €`
}

export default function VertraegePage() {
  const [contracts, setContracts] = useState<Vertrag[]>([])
  const [tasks, setTasks] = useState<Aufgabe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const laden = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/contracts')
      const data = await res.json()
      if (res.ok) {
        setContracts(data.contracts || [])
        setTasks(data.tasks || [])
      } else {
        setError(data.error || 'Fehler beim Laden')
      }
    } catch {
      setError('Netzwerkfehler — bitte neu laden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { laden() }, [laden])

  async function handleTaskStatus(task: Aufgabe, status: 'ERLEDIGT' | 'VERWORFEN') {
    if (busyId) return
    setBusyId(task.id)
    try {
      const res = await fetch(`/api/admin/manual-tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== task.id))
    } finally {
      setBusyId(null)
    }
  }

  async function handleKuendigen(contract: Vertrag) {
    if (busyId) return
    const firma = contract.customers?.company_name || 'diesen Kunden'
    if (!window.confirm(`Vertrag für "${firma}" kündigen? Das wirksame Vertragsende wird nach der ${contract.laufzeit_monate}/${contract.verlaengerung_monate}/${contract.kuendigungsfrist_monate}-Regel berechnet.`)) return
    setBusyId(contract.id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/contracts/${contract.id}/kuendigen`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Kündigung fehlgeschlagen')
        return
      }
      await laden()
      if (data.stripe_hinweis) {
        setError(`Vertrag gekündigt zum ${formatDatum(data.kuendigung_zum)} — aber Stripe-Abo konnte nicht terminiert werden: ${data.stripe_hinweis}`)
      }
    } catch {
      setError('Netzwerkfehler — bitte erneut versuchen.')
    } finally {
      setBusyId(null)
    }
  }

  const firmaVonTask = (task: Aufgabe): string | null => {
    if (task.contract_id) {
      const c = contracts.find((v) => v.id === task.contract_id)
      if (c?.customers?.company_name) return c.customers.company_name
    }
    if (task.customer_id) {
      const c = contracts.find((v) => v.customers?.id === task.customer_id)
      if (c?.customers?.company_name) return c.customers.company_name
    }
    return null
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Abrechnung</span>
          <span className="tb-heading">Verträge ({konditionenKurz()})</span>
        </div>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: '12px', color: 'var(--za-fg-3)' }}>
          {contracts.filter((c) => c.status === 'AKTIV').length} aktiv · {tasks.length} offene Aufgaben
        </span>
      </div>

      {error && (
        <div className="fade-up" style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(220,60,60,0.08)', color: '#b03030', fontSize: '12px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Offene Aufgaben */}
      <div className="panel fade-up" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle style={{ width: '15px', height: '15px', color: tasks.length > 0 ? '#a8821e' : 'var(--za-fg-4)' }} />
          <span className="panel-title">Manuelle Aufgaben (Zero-Fulfillment-Ausnahmen)</span>
        </div>
        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : tasks.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Keine offenen Aufgaben — die Maschine läuft. ✔
          </div>
        ) : (
          <div>
            {tasks.map((task) => {
              const busy = busyId === task.id
              const firma = firmaVonTask(task)
              return (
                <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(212,168,40,0.12)', color: '#a8821e', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {TASK_TYP_LABEL[task.typ] || task.typ}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg-1)' }}>{task.titel}</span>
                      {firma && <span style={{ fontSize: '11px', color: 'var(--za-fg-3)' }}>· {firma}</span>}
                    </div>
                    {task.beschreibung && (
                      <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: 1.5 }}>{task.beschreibung}</div>
                    )}
                    <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginTop: '4px' }}>
                      {formatDatum(task.created_at)}{task.quelle ? ` · Quelle: ${task.quelle}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleTaskStatus(task, 'ERLEDIGT')} disabled={busy} title="Als erledigt markieren"
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(46,196,160,0.12)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: 'pointer', color: '#1e8a70', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {busy ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Check style={{ width: '12px', height: '12px' }} />} Erledigt
                    </button>
                    <button onClick={() => handleTaskStatus(task, 'VERWORFEN')} disabled={busy} title="Verwerfen"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', cursor: 'pointer', color: 'var(--za-fg-3)' }}>
                      <X style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Verträge */}
      <div className="panel fade-up" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--za-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileSignature style={{ width: '15px', height: '15px', color: 'var(--za-gold)' }} />
          <span className="panel-title">Alle Verträge</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>Lädt…</div>
        ) : contracts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--za-fg-4)', fontSize: '13px' }}>
            Noch keine Verträge — entstehen automatisch beim Checkout.
          </div>
        ) : (
          <div>
            {contracts.map((contract) => {
              const st = STATUS_STYLES[contract.status] || STATUS_STYLES.AKTIV
              const mahn = MAHNSTUFEN[contract.mahnstufe] || MAHNSTUFEN[0]
              const busy = busyId === contract.id
              return (
                <div key={contract.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--za-border)', opacity: busy ? 0.6 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg-1)' }}>
                        {contract.customers?.company_name || 'Unbekannter Kunde'}
                      </span>
                      <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '999px', background: st.bg, color: st.fg, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {st.label}
                      </span>
                      {contract.mahnstufe > 0 && (
                        <span style={{ fontSize: '10px', fontWeight: 600, color: mahn.fg }}>{mahn.label}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--za-fg-3)', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span>{contract.paket} · {formatEuro(contract.monatsrate_cent)}/Monat</span>
                      <span>· Laufzeit {formatDatum(contract.beginn)} – {formatDatum(contract.ende)}</span>
                      <span>· {contract.laufzeit_monate}/{contract.verlaengerung_monate}/{contract.kuendigungsfrist_monate}</span>
                      {contract.status === 'GEKUENDIGT' && contract.kuendigung_zum && (
                        <span style={{ color: '#a8821e' }}>· wirksam zum {formatDatum(contract.kuendigung_zum)}</span>
                      )}
                      {contract.zahlung_ueberfaellig_seit && (
                        <span style={{ color: '#b03030' }}>· überfällig seit {formatDatum(contract.zahlung_ueberfaellig_seit)}</span>
                      )}
                      {contract.letzte_zahlung_am && !contract.zahlung_ueberfaellig_seit && (
                        <span>· letzte Zahlung {formatDatum(contract.letzte_zahlung_am)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {contract.status === 'AKTIV' && (
                      <button onClick={() => handleKuendigen(contract)} disabled={busy} title="Vertrag kündigen (Frist wird berechnet)"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: 'rgba(255,255,255,0.65)', border: '1px solid var(--za-border)', borderRadius: '7px', fontSize: '10px', fontWeight: 600, cursor: busy ? 'wait' : 'pointer', color: '#b03030', fontFamily: 'inherit', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {busy ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <Ban style={{ width: '12px', height: '12px' }} />} Kündigen
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </>
  )
}
