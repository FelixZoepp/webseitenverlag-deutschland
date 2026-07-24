'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Save, AlertCircle, CheckCircle2, Eye, EyeOff, Scale } from 'lucide-react'
import {
  IMPRESSUM_PFLICHTFELDER,
  IMPRESSUM_FELD_LABELS,
  fehlendeImpressumFelder,
} from '@/lib/rechtstexte/types'
import type { ImpressumDaten } from '@/lib/rechtstexte/types'

type Tab = 'impressum' | 'datenschutz'

// Bedingte Gruppen mit Checkbox
interface BedingteFeldGruppe {
  label: string
  felder: (keyof ImpressumDaten)[]
}

const BEDINGTE_GRUPPEN: BedingteFeldGruppe[] = [
  {
    label: 'Im Handelsregister eingetragen',
    felder: ['registergericht', 'registernummer'],
  },
  {
    label: 'Umsatzsteuer-ID vorhanden',
    felder: ['ust_id'],
  },
  {
    label: 'Kammerpflichtig / regulierter Beruf',
    felder: ['kammer', 'berufsbezeichnung', 'berufsbezeichnung_staat', 'berufsrechtliche_regelungen'],
  },
  {
    label: 'Erlaubnispflichtige Tätigkeit',
    felder: ['aufsichtsbehoerde'],
  },
  {
    label: 'Journalistisch-redaktionelle Inhalte',
    felder: ['redaktionell_verantwortlich'],
  },
]

const LEERES_IMPRESSUM: ImpressumDaten = {
  firmenname: '',
  strasse: '',
  plz: '',
  ort: '',
  vertretung: '',
  telefon: '',
  email: '',
  registergericht: '',
  registernummer: '',
  ust_id: '',
  kammer: '',
  berufsbezeichnung: '',
  berufsbezeichnung_staat: '',
  berufsrechtliche_regelungen: '',
  aufsichtsbehoerde: '',
  redaktionell_verantwortlich: '',
}

export default function RechtstextePage() {
  const params = useParams()
  const siteId = params.siteId as string

  const [tab, setTab] = useState<Tab>('impressum')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [impressum, setImpressum] = useState<ImpressumDaten>(LEERES_IMPRESSUM)
  const [ergaenzung, setErgaenzung] = useState('')
  const [datenschutzVorschau, setDatenschutzVorschau] = useState('')
  const [templateVersion, setTemplateVersion] = useState<string | null>(null)
  const [aktuelleVersion, setAktuelleVersion] = useState<string | null>(null)

  // Welche bedingten Gruppen sind aktiv (Checkbox)
  const [aktiveGruppen, setAktiveGruppen] = useState<Set<number>>(new Set())

  // Validierung
  const [versuchteAbsendung, setVersuchteAbsendung] = useState(false)
  const fehlend = fehlendeImpressumFelder(impressum)

  const laden = useCallback(async () => {
    try {
      const r = await fetch(`/api/sites/${siteId}/rechtstexte`)
      if (r.ok) {
        const data = await r.json()
        if (data.impressum) {
          setImpressum({ ...LEERES_IMPRESSUM, ...data.impressum })
          // Bedingte Gruppen aktivieren basierend auf vorhandenen Daten
          const aktiv = new Set<number>()
          BEDINGTE_GRUPPEN.forEach((gruppe, idx) => {
            const hatDaten = gruppe.felder.some((f) => {
              const val = (data.impressum as Record<string, string>)[f]
              return val && val.trim() !== ''
            })
            if (hatDaten) aktiv.add(idx)
          })
          setAktiveGruppen(aktiv)
        }
        setErgaenzung(data.ergaenzung || '')
        setDatenschutzVorschau(data.datenschutz_vorschau || '')
        setTemplateVersion(data.template_version)
        setAktuelleVersion(data.aktuelle_template_version)
      }
    } finally {
      setLoading(false)
    }
  }, [siteId])

  useEffect(() => { laden() }, [laden])
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const speichern = async () => {
    setVersuchteAbsendung(true)
    if (fehlend.length > 0) {
      setToast({ type: 'error', message: `Pflichtfelder fehlen: ${fehlend.join(', ')}` })
      setTab('impressum')
      return
    }

    setSaving(true)
    try {
      const r = await fetch(`/api/sites/${siteId}/rechtstexte`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ impressum, ergaenzung }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Speichern fehlgeschlagen')

      setDatenschutzVorschau(data.datenschutz_vorschau || '')
      setTemplateVersion(data.template_version)
      setToast({ type: 'success', message: 'Rechtstexte gespeichert und sofort live.' })
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Fehler' })
    } finally {
      setSaving(false)
    }
  }

  const updateFeld = (feld: keyof ImpressumDaten, wert: string) => {
    setImpressum((prev) => ({ ...prev, [feld]: wert }))
  }

  const toggleGruppe = (idx: number) => {
    setAktiveGruppen((prev) => {
      const neu = new Set(prev)
      if (neu.has(idx)) {
        neu.delete(idx)
        // Felder leeren
        const gruppe = BEDINGTE_GRUPPEN[idx]
        setImpressum((prev) => {
          const update = { ...prev }
          gruppe.felder.forEach((f) => { update[f] = '' })
          return update
        })
      } else {
        neu.add(idx)
      }
      return neu
    })
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '16px', right: '16px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 20px', borderRadius: '10px',
          background: toast.type === 'success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${toast.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
          color: toast.type === 'success' ? '#16A34A' : '#DC2626',
          fontSize: '13px', fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        }}>
          {toast.type === 'success'
            ? <CheckCircle2 style={{ width: '16px', height: '16px' }} />
            : <AlertCircle style={{ width: '16px', height: '16px' }} />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Scale style={{ width: '22px', height: '22px', color: '#111827' }} />
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>Rechtstexte</h1>
        </div>
        <button
          onClick={speichern}
          disabled={saving}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', borderRadius: '10px', border: 'none',
            background: '#111827', color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save style={{ width: '14px', height: '14px' }} />}
          Speichern & Live schalten
        </button>
      </div>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>
        Impressum und Datenschutzerklärung Ihrer Website.
      </p>

      {/* Disclaimer */}
      <div style={{
        padding: '14px 18px', borderRadius: '10px', marginBottom: '24px',
        background: '#FFFBEB', border: '1px solid #FDE68A',
        fontSize: '12px', color: '#92400E', lineHeight: '1.6',
      }}>
        <strong>Hinweis:</strong> Für die Richtigkeit und Vollständigkeit dieser Angaben sind Sie verantwortlich.
        Die bereitgestellten Vorlagen sind unverbindliche Muster und ersetzen keine Rechtsberatung.
        Wir empfehlen eine anwaltliche Prüfung.
      </div>

      {/* Template-Version Hinweis */}
      {templateVersion && aktuelleVersion && templateVersion !== aktuelleVersion && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', marginBottom: '20px',
          background: '#EFF6FF', border: '1px solid #BFDBFE',
          fontSize: '12px', color: '#1D4ED8', lineHeight: '1.5',
        }}>
          Eine aktualisierte Vorlage (v{aktuelleVersion}) ist verfügbar.
          Beim nächsten Speichern werden Ihre Rechtstexte mit der neuen Vorlage generiert.
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #E5E7EB' }}>
        {([
          { key: 'impressum' as Tab, label: 'Impressum' },
          { key: 'datenschutz' as Tab, label: 'Datenschutz' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: 600,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t.key ? '#111827' : '#9CA3AF',
              borderBottom: tab === t.key ? '2px solid #111827' : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {t.label}
            {t.key === 'impressum' && fehlend.length > 0 && versuchteAbsendung && (
              <span style={{
                marginLeft: '6px', fontSize: '10px',
                background: '#FEF2F2', color: '#DC2626',
                padding: '1px 6px', borderRadius: '999px', fontWeight: 700,
              }}>
                {fehlend.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Impressum Tab */}
      {tab === 'impressum' && (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
          {/* Pflichtfelder */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Pflichtangaben
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {IMPRESSUM_PFLICHTFELDER.map((feld) => {
                const istLeer = versuchteAbsendung && (!impressum[feld] || impressum[feld]!.trim() === '')
                return (
                  <div key={feld}>
                    <label style={{
                      display: 'block', fontSize: '12px', fontWeight: 600,
                      color: istLeer ? '#DC2626' : '#374151',
                      marginBottom: '4px',
                    }}>
                      {IMPRESSUM_FELD_LABELS[feld]} <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type={feld === 'email' ? 'email' : 'text'}
                      value={impressum[feld] || ''}
                      onChange={(e) => updateFeld(feld, e.target.value)}
                      placeholder={IMPRESSUM_FELD_LABELS[feld]}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: '8px',
                        border: `1px solid ${istLeer ? '#FCA5A5' : '#D1D5DB'}`,
                        fontSize: '14px', color: '#111827',
                        background: istLeer ? '#FEF2F2' : '#fff',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    {istLeer && (
                      <p style={{ fontSize: '11px', color: '#DC2626', marginTop: '3px' }}>
                        Dieses Feld ist erforderlich.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bedingte Felder */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
              Optionale Angaben
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
              Aktivieren Sie nur die Bereiche, die auf Ihr Unternehmen zutreffen.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {BEDINGTE_GRUPPEN.map((gruppe, idx) => {
                const aktiv = aktiveGruppen.has(idx)
                return (
                  <div key={idx} style={{
                    border: '1px solid #E5E7EB', borderRadius: '10px',
                    overflow: 'hidden',
                    background: aktiv ? '#FAFAFA' : '#fff',
                  }}>
                    <button
                      onClick={() => toggleGruppe(idx)}
                      style={{
                        width: '100%', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '13px', fontWeight: 600, color: '#374151',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                        border: aktiv ? 'none' : '2px solid #D1D5DB',
                        background: aktiv ? '#111827' : '#fff',
                        display: 'grid', placeItems: 'center',
                      }}>
                        {aktiv && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {aktiv ? <EyeOff style={{ width: '14px', height: '14px', color: '#9CA3AF' }} /> : <Eye style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />}
                      {gruppe.label}
                    </button>
                    {aktiv && (
                      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {gruppe.felder.map((feld) => (
                          <div key={feld}>
                            <label style={{
                              display: 'block', fontSize: '11px', fontWeight: 500,
                              color: '#6B7280', marginBottom: '3px',
                            }}>
                              {IMPRESSUM_FELD_LABELS[feld]}
                            </label>
                            <input
                              type="text"
                              value={impressum[feld] || ''}
                              onChange={(e) => updateFeld(feld, e.target.value)}
                              placeholder={IMPRESSUM_FELD_LABELS[feld]}
                              style={{
                                width: '100%', padding: '8px 12px', borderRadius: '8px',
                                border: '1px solid #D1D5DB', fontSize: '13px',
                                color: '#111827', background: '#fff',
                                outline: 'none', boxSizing: 'border-box',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Datenschutz Tab */}
      {tab === 'datenschutz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vorschau */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Datenschutzerklärung (automatisch generiert)
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>
              Die Datenschutzerklärung wird aus Ihren Impressum-Daten und den aktiven Features Ihrer Website automatisch zusammengestellt.
              Änderungen am Impressum aktualisieren auch die Datenschutzerklärung.
            </p>
            {datenschutzVorschau ? (
              <div
                style={{
                  padding: '20px', borderRadius: '8px',
                  background: '#F9FAFB', border: '1px solid #E5E7EB',
                  fontSize: '13px', color: '#374151', lineHeight: '1.7',
                  maxHeight: '500px', overflowY: 'auto',
                }}
                dangerouslySetInnerHTML={{ __html: datenschutzVorschau }}
              />
            ) : (
              <div style={{
                padding: '40px 20px', textAlign: 'center',
                background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB',
              }}>
                <AlertCircle style={{ width: '24px', height: '24px', color: '#D1D5DB', margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                  Füllen Sie zuerst die Impressum-Pflichtfelder aus, um eine Vorschau zu sehen.
                </p>
              </div>
            )}
          </div>

          {/* Ergaenzende Hinweise */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Ergänzende Hinweise
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
              Optional: Eigene Ergänzungen zur Datenschutzerklärung (z. B. spezifische Verarbeitungstätigkeiten).
              Maximal 2.000 Zeichen.
            </p>
            <textarea
              value={ergaenzung}
              onChange={(e) => setErgaenzung(e.target.value.slice(0, 2000))}
              rows={6}
              placeholder="Optionale Ergänzungen zur Datenschutzerklärung..."
              style={{
                width: '100%', padding: '12px 14px', borderRadius: '8px',
                border: '1px solid #D1D5DB', fontSize: '14px',
                color: '#111827', background: '#fff', resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
                fontFamily: 'inherit', lineHeight: '1.6',
              }}
            />
            <p style={{ fontSize: '11px', color: ergaenzung.length > 1800 ? '#DC2626' : '#9CA3AF', marginTop: '4px' }}>
              {ergaenzung.length}/2.000 Zeichen
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
