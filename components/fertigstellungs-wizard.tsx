'use client'

/**
 * Fertigstellungs-Wizard (§10.1) — geführter Flow Demo → finale Website.
 * Blockiert nie: jeder Schritt ist überspringbar, der Fortschritt bleibt sichtbar.
 */
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronRight, Loader2, Sparkles } from 'lucide-react'

interface WizardSchritt {
  key: string
  titel: string
  beschreibung: string
  pflicht: boolean
}

interface WizardState {
  schritte: WizardSchritt[]
  wizard_status: Record<string, string>
  fortschritt: { bearbeitet: number; gesamt: number }
  offene_pflicht: string[]
  pflichtangaben: Record<string, string> | null
  fertiggestellt_am: string | null
  fakten: { telefon: string; email: string; adresse: string }
}

interface SeoAngebot {
  key: string
  name: string
  nutzen: string[]
  monatCent: number
}

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '12px',
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #D1D5DB',
  borderRadius: '6px',
  fontSize: '13px',
  marginBottom: '8px',
}
const primaryBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  fontWeight: 600,
  background: '#111827',
  color: '#fff',
  border: 'none',
  cursor: 'pointer',
}
const ghostBtn: React.CSSProperties = {
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '13px',
  background: 'transparent',
  color: '#6B7280',
  border: '1px solid #E5E7EB',
  cursor: 'pointer',
}

export default function FertigstellungsWizard({ siteId, seoAngebot }: { siteId: string; seoAngebot: SeoAngebot }) {
  const [state, setState] = useState<WizardState | null>(null)
  const [aktiv, setAktiv] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)
  const [qaHinweise, setQaHinweise] = useState<string[]>([])
  const [form, setForm] = useState<Record<string, string>>({})

  const laden = useCallback(async () => {
    const res = await fetch(`/api/sites/${siteId}/wizard`)
    if (res.ok) {
      const data: WizardState = await res.json()
      setState(data)
      setForm((f) => ({
        ...data.pflichtangaben,
        telefon: data.fakten.telefon,
        fakten_email: data.fakten.email,
        adresse: data.fakten.adresse,
        ...f,
      }))
    }
  }, [siteId])

  useEffect(() => {
    laden()
  }, [laden])

  async function patch(body: Record<string, unknown>) {
    setBusy(true)
    setFehler(null)
    const res = await fetch(`/api/sites/${siteId}/wizard`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setBusy(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setFehler(data.error || 'Speichern fehlgeschlagen')
      return false
    }
    setAktiv(null)
    await laden()
    return true
  }

  async function fertigstellen() {
    setBusy(true)
    setFehler(null)
    setQaHinweise([])
    const res = await fetch(`/api/sites/${siteId}/fertigstellen`, { method: 'POST' })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setQaHinweise(data.hinweise || [data.error || 'Fertigstellen fehlgeschlagen'])
      return
    }
    await laden()
  }

  async function seoBuchen() {
    setBusy(true)
    setFehler(null)
    const res = await fetch(`/api/sites/${siteId}/upsell-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_key: seoAngebot.key, quelle: 'wizard' }),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (res.ok && data.url) {
      window.location.href = data.url
    } else {
      setFehler(data.error || 'Buchung derzeit nicht möglich')
    }
  }

  if (!state) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: '#6B7280' }}>
        <Loader2 className="animate-spin" style={{ width: 20, height: 20, margin: '0 auto' }} />
      </div>
    )
  }

  const status = (key: string) => state.wizard_status[key] || 'offen'
  const fertig = !!state.fertiggestellt_am

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        Website fertigstellen
      </h1>
      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
        {state.fortschritt.bearbeitet} von {state.fortschritt.gesamt} Schritten bearbeitet — Sie können jederzeit
        pausieren, nichts blockiert Ihre Website.
      </p>

      {fehler && (
        <div style={{ ...card, background: '#FEF2F2', borderColor: '#FECACA', color: '#B91C1C', fontSize: '13px' }}>
          {fehler}
        </div>
      )}

      {state.schritte.map((s, i) => {
        const st = status(s.key)
        const offen = aktiv === s.key
        return (
          <div key={s.key} style={card}>
            <button
              onClick={() => setAktiv(offen ? null : s.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                padding: 0,
              }}
            >
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: st === 'erledigt' ? '#DCFCE7' : '#F3F4F6',
                  color: st === 'erledigt' ? '#16A34A' : '#6B7280',
                  flexShrink: 0,
                }}
              >
                {st === 'erledigt' ? <Check style={{ width: 14, height: 14 }} /> : i + 1}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827', display: 'block' }}>
                  {s.titel}
                  {!s.pflicht && <span style={{ fontWeight: 400, color: '#9CA3AF' }}> · optional</span>}
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{s.beschreibung}</span>
              </span>
              <ChevronRight
                style={{ width: 16, height: 16, color: '#9CA3AF', transform: offen ? 'rotate(90deg)' : 'none' }}
              />
            </button>

            {offen && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #F3F4F6' }}>
                {s.key === 'pflichtangaben' && (
                  <PflichtangabenForm form={form} setForm={setForm} busy={busy} onSave={(daten) => patch({ schritt: 'pflichtangaben', daten })} />
                )}

                {s.key === 'logo' && (
                  <div>
                    <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
                      Logo und eigene Fotos laden Sie unter{' '}
                      <Link href={`/dashboard/${siteId}/bilder`} style={{ color: '#2563EB' }}>
                        Bilder
                      </Link>{' '}
                      hoch. Kein Logo? Kein Problem — wir setzen Ihren Firmennamen als Schriftzug.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={primaryBtn} disabled={busy} onClick={() => patch({ schritt: 'logo', status: 'erledigt' })}>
                        Erledigt
                      </button>
                      <button style={ghostBtn} disabled={busy} onClick={() => patch({ schritt: 'logo', status: 'uebersprungen' })}>
                        Überspringen
                      </button>
                    </div>
                  </div>
                )}

                {s.key === 'fakten' && (
                  <div>
                    <input style={inputStyle} placeholder="Telefonnummer *" value={form.telefon || ''} onChange={(e) => setForm({ ...form, telefon: e.target.value })} />
                    <input style={inputStyle} placeholder="E-Mail-Adresse *" value={form.fakten_email || ''} onChange={(e) => setForm({ ...form, fakten_email: e.target.value })} />
                    <input style={inputStyle} placeholder="Adresse" value={form.adresse || ''} onChange={(e) => setForm({ ...form, adresse: e.target.value })} />
                    <textarea style={{ ...inputStyle, minHeight: '60px' }} placeholder="Öffnungszeiten (z.B. Mo–Fr 8–17 Uhr)" value={form.oeffnungszeiten || ''} onChange={(e) => setForm({ ...form, oeffnungszeiten: e.target.value })} />
                    <button
                      style={primaryBtn}
                      disabled={busy}
                      onClick={() =>
                        patch({
                          schritt: 'fakten',
                          daten: {
                            telefon: form.telefon || '',
                            email: form.fakten_email || '',
                            adresse: form.adresse || undefined,
                            oeffnungszeiten: form.oeffnungszeiten || undefined,
                          },
                        })
                      }
                    >
                      Bestätigen
                    </button>
                  </div>
                )}

                {s.key === 'domain' && (
                  <div>
                    <input style={inputStyle} placeholder="Wunsch-Domain (z.B. mueller-sanitaer.de)" value={form.wunsch_domain || ''} onChange={(e) => setForm({ ...form, wunsch_domain: e.target.value })} />
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                      Die Verbindung übernehmen wir für Sie. Bis dahin bleibt Ihre Website unter der aktuellen Adresse
                      erreichbar — es geht nichts verloren.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={primaryBtn} disabled={busy} onClick={() => patch({ schritt: 'domain', status: 'erledigt', wunsch_domain: form.wunsch_domain || undefined })}>
                        Speichern
                      </button>
                      <button style={ghostBtn} disabled={busy} onClick={() => patch({ schritt: 'domain', status: 'vertagt' })}>
                        Später
                      </button>
                    </div>
                  </div>
                )}

                {s.key === 'seo_plan' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Sparkles style={{ width: 14, height: 14, color: '#D97706' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{seoAngebot.name}</span>
                    </div>
                    <ul style={{ fontSize: '13px', color: '#374151', paddingLeft: '18px', marginBottom: '8px' }}>
                      {seoAngebot.nutzen.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                    <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                      {(seoAngebot.monatCent / 100).toFixed(0)} €/Monat · monatlich kündbar · Preis inkl. aller Leistungen
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={primaryBtn} disabled={busy} onClick={seoBuchen}>
                        Jetzt buchen
                      </button>
                      <button style={ghostBtn} disabled={busy} onClick={() => patch({ schritt: 'seo_plan', status: 'uebersprungen' })}>
                        Kein Interesse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Schritt 6: Fertigstellen */}
      <div style={{ ...card, background: fertig ? '#F0FDF4' : '#fff', borderColor: fertig ? '#BBF7D0' : '#E5E7EB' }}>
        {fertig ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', fontSize: '14px', fontWeight: 600 }}>
            <Check style={{ width: 16, height: 16 }} />
            Ihre Website ist fertiggestellt und für Google freigegeben.
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
              Zum Schluss prüfen wir Ihre Website automatisch (Links, Bilder, Formular) und schalten sie für
              Suchmaschinen frei.
            </p>
            {qaHinweise.length > 0 && (
              <ul style={{ fontSize: '13px', color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 10px 10px 26px', marginBottom: '12px' }}>
                {qaHinweise.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            )}
            <button style={{ ...primaryBtn, background: '#16A34A' }} disabled={busy} onClick={fertigstellen}>
              {busy ? 'Wird geprüft…' : 'Website fertigstellen'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function PflichtangabenForm({
  form,
  setForm,
  busy,
  onSave,
}: {
  form: Record<string, string>
  setForm: (f: Record<string, string>) => void
  busy: boolean
  onSave: (daten: Record<string, string>) => void
}) {
  const felder: { key: string; label: string; pflicht?: boolean }[] = [
    { key: 'firmenname', label: 'Firmenname *', pflicht: true },
    { key: 'rechtsform', label: 'Rechtsform (z.B. GmbH, e.K.)' },
    { key: 'inhaber', label: 'Inhaber / Vertretungsberechtigter *', pflicht: true },
    { key: 'strasse', label: 'Straße und Hausnummer *', pflicht: true },
    { key: 'plz', label: 'PLZ *', pflicht: true },
    { key: 'ort', label: 'Ort *', pflicht: true },
    { key: 'telefon', label: 'Telefon *', pflicht: true },
    { key: 'email', label: 'E-Mail *', pflicht: true },
    { key: 'ust_id', label: 'USt-IdNr. (falls vorhanden)' },
    { key: 'handelsregister', label: 'Registereintrag (falls vorhanden)' },
    { key: 'aufsichtsbehoerde', label: 'Aufsichtsbehörde (falls zutreffend)' },
    { key: 'kammer', label: 'Kammer (falls zutreffend)' },
  ]
  return (
    <div>
      <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
        Aus diesen Angaben erstellen wir automatisch Impressum und Datenschutzerklärung.
      </p>
      {felder.map((f) => (
        <input
          key={f.key}
          style={inputStyle}
          placeholder={f.label}
          value={form[f.key] || ''}
          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
        />
      ))}
      <button
        style={primaryBtn}
        disabled={busy}
        onClick={() => {
          const daten: Record<string, string> = {}
          for (const f of felder) daten[f.key] = form[f.key] || ''
          onSave(daten)
        }}
      >
        Speichern & Rechtstexte erstellen
      </button>
    </div>
  )
}
