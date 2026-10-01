'use client'

import { useState } from 'react'

interface ReviewRequest {
  id: string
  empfaenger_email: string
  empfaenger_name: string | null
  status: string
  gesendet_am: string | null
  geklickt_am: string | null
  feedback_text: string | null
  created_at: string
}

interface Site {
  id: string
  name: string
  review_autopilot: {
    enabled: boolean
    delay_days: number
    google_review_url: string
    absender_name: string
    betreff: string
    nachricht: string
  } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  geplant: { label: 'Geplant', color: '#6b7280' },
  gesendet: { label: 'Gesendet', color: '#2563eb' },
  zufrieden: { label: 'Zufrieden', color: '#059669' },
  unzufrieden: { label: 'Feedback', color: '#dc2626' },
  fehler: { label: 'Fehler', color: '#dc2626' },
}

export default function BewertungenView({ site, requests }: { site: Site; requests: ReviewRequest[] }) {
  const config = site.review_autopilot
  const [enabled, setEnabled] = useState(config?.enabled ?? false)
  const [delayDays, setDelayDays] = useState(config?.delay_days ?? 14)
  const [googleUrl, setGoogleUrl] = useState(config?.google_review_url ?? '')
  const [absenderName, setAbsenderName] = useState(config?.absender_name ?? site.name ?? '')
  const [betreff, setBetreff] = useState(config?.betreff ?? 'Waren Sie zufrieden mit uns?')
  const [nachricht, setNachricht] = useState(
    config?.nachricht ?? 'Vielen Dank für Ihr Vertrauen. Wir würden uns sehr über eine kurze Bewertung freuen.'
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const zufrieden = requests.filter(r => r.status === 'zufrieden').length
  const unzufrieden = requests.filter(r => r.status === 'unzufrieden').length
  const gesendet = requests.filter(r => ['gesendet', 'zufrieden', 'unzufrieden'].includes(r.status)).length

  async function speichern() {
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`/api/sites/${site.id}/review-autopilot`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          delay_days: delayDays,
          google_review_url: googleUrl,
          absender_name: absenderName,
          betreff,
          nachricht,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Bewertungs-Autopilot</h1>
      <p style={{ color: '#6b7280', marginBottom: 32, fontSize: 15 }}>
        Automatische Zufriedenheits-Mails an Ihre Kontakte — zufriedene Kunden bewerten Sie auf Google, unzufriedene geben internes Feedback.
      </p>

      {/* Stats */}
      {gesendet > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>{gesendet}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Gesendet</div>
          </div>
          <div style={{ background: '#ecfdf5', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#059669' }}>{zufrieden}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Zufrieden</div>
          </div>
          <div style={{ background: '#fef2f2', borderRadius: 12, padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>{unzufrieden}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>Feedback</div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Einstellungen</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: '#059669' }}
            />
            <span style={{ fontSize: 14, fontWeight: 500 }}>Aktiv</span>
          </label>
        </div>

        <div style={{ display: 'grid', gap: 20 }}>
          <div>
            <label style={labelStyle}>Google-Bewertungslink</label>
            <input
              type="url"
              value={googleUrl}
              onChange={e => setGoogleUrl(e.target.value)}
              placeholder="https://search.google.com/local/writereview?placeid=..."
              style={inputStyle}
            />
            <p style={hintStyle}>
              Finden Sie Ihren Link: Google Maps &rarr; Ihr Unternehmen &rarr; &bdquo;Rezension schreiben&ldquo; &rarr; Link kopieren
            </p>
          </div>

          <div>
            <label style={labelStyle}>Verzögerung nach Kontaktanfrage</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="number"
                min={1}
                max={90}
                value={delayDays}
                onChange={e => setDelayDays(Number(e.target.value))}
                style={{ ...inputStyle, width: 80 }}
              />
              <span style={{ fontSize: 14, color: '#6b7280' }}>Tage</span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Absendername</label>
            <input
              type="text"
              value={absenderName}
              onChange={e => setAbsenderName(e.target.value)}
              placeholder="Ihr Firmenname"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>E-Mail Betreff</label>
            <input
              type="text"
              value={betreff}
              onChange={e => setBetreff(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Nachricht</label>
            <textarea
              value={nachricht}
              onChange={e => setNachricht(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={speichern} disabled={saving} style={btnStyle}>
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </button>
          {saved && <span style={{ fontSize: 14, color: '#059669' }}>Gespeichert!</span>}
        </div>
      </div>

      {/* Requests Table */}
      {requests.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Versendete Anfragen</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  <th style={thStyle}>Empfänger</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Gesendet</th>
                  <th style={thStyle}>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => {
                  const s = STATUS_LABELS[r.status] || { label: r.status, color: '#6b7280' }
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 500 }}>{r.empfaenger_name || '—'}</div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>{r.empfaenger_email}</div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          background: s.color + '15',
                          color: s.color,
                        }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>
                        {r.gesendet_am ? new Date(r.gesendet_am).toLocaleDateString('de-DE') : '—'}
                      </td>
                      <td style={{ ...tdStyle, fontSize: 13, color: '#374151', maxWidth: 200 }}>
                        {r.feedback_text ? (
                          <span title={r.feedback_text}>
                            {r.feedback_text.length > 60 ? r.feedback_text.slice(0, 60) + '...' : r.feedback_text}
                          </span>
                        ) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  fontSize: 15,
  outline: 'none',
  fontFamily: 'inherit',
}

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  marginTop: 6,
}

const btnStyle: React.CSSProperties = {
  background: '#1f2937',
  color: '#fff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#6b7280',
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
}
