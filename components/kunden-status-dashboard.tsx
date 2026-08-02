'use client'

import { useState } from 'react'
import { Check, Upload, Phone, Sparkles, Loader2, Eye, Rocket, MessageCircle, Monitor, Smartphone } from 'lucide-react'

interface Props {
  siteId: string
  siteName: string
  customerName: string
  onboardingStatus: string
  buildStatus: string
  onboardingTermin: string | null
  hasBilder: boolean
  previewAvailable: boolean
  feedbackRunde?: number
  feedbackMaxRunden?: number
  feedbackAutoFreigabeAm?: string | null
}

export default function KundenStatusDashboard({
  siteId, siteName, customerName, onboardingStatus, buildStatus,
  onboardingTermin, hasBilder, previewAvailable,
  feedbackRunde = 0, feedbackMaxRunden = 3, feedbackAutoFreigabeAm,
}: Props) {
  const [freigabeLoading, setFreigabeLoading] = useState(false)
  const [freigegeben, setFreigegeben] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSending, setFeedbackSending] = useState(false)
  const [feedbackResult, setFeedbackResult] = useState<string | null>(null)
  const [aktuelleRunde, setAktuelleRunde] = useState(feedbackRunde)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const rundenAufgebraucht = aktuelleRunde >= feedbackMaxRunden

  const firstName = customerName.split(' ')[0] || customerName

  const steps = [
    {
      nr: 1,
      titel: 'Material hochladen',
      beschreibung: 'Logo, Bilder und Fotos für Ihre Webseite',
      dauer: '10-15 Minuten',
      done: hasBilder || onboardingStatus === 'MATERIAL_HOCHGELADEN' || onboardingStatus === 'CALL_DURCHGEFUEHRT' || onboardingStatus === 'WEBSEITE_FERTIG' || onboardingStatus === 'FREIGEGEBEN',
      href: `/dashboard/${siteId}/bilder`,
      ctaText: 'Bilder hochladen',
      icon: Upload,
    },
    {
      nr: 2,
      titel: 'Onboarding-Gespräch',
      beschreibung: onboardingTermin
        ? `Termin: ${new Date(onboardingTermin).toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
        : 'Termin wird noch vereinbart',
      dauer: '30 Minuten',
      done: onboardingStatus === 'CALL_DURCHGEFUEHRT' || onboardingStatus === 'WEBSEITE_FERTIG' || onboardingStatus === 'FREIGEGEBEN',
      href: null,
      ctaText: onboardingTermin ? 'Termin steht' : 'Termin wird gebucht',
      icon: Phone,
    },
    {
      nr: 3,
      titel: 'Ihre Webseite',
      beschreibung: buildStatus === 'FERTIG'
        ? 'Ihre Webseite ist fertig!'
        : buildStatus === 'IN_BEARBEITUNG'
        ? 'KI baut gerade Ihre Webseite...'
        : 'Wird nach dem Gespräch automatisch erstellt',
      dauer: 'Innerhalb 24h nach Gespräch',
      done: buildStatus === 'FERTIG' || onboardingStatus === 'FREIGEGEBEN',
      href: previewAvailable ? `/dashboard/${siteId}?view=preview` : null,
      ctaText: previewAvailable ? 'Webseite ansehen' : 'Wird gebaut',
      icon: Sparkles,
    },
  ]

  async function handleFreigabe() {
    if (!confirm('Webseite freigeben und live schalten?')) return
    setFreigabeLoading(true)
    const res = await fetch('/api/customer/freigeben', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    })
    setFreigabeLoading(false)
    if (res.ok) {
      setFreigegeben(true)
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #1E4A82, #C9A24E)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', fontSize: '28px',
        }}>
          {buildStatus === 'FERTIG' ? '🎉' : '🚀'}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
          {buildStatus === 'FERTIG' ? `${firstName}, Ihre Webseite ist fertig!` : `Willkommen, ${firstName}!`}
        </h1>
        <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.6 }}>
          {buildStatus === 'FERTIG'
            ? `Schauen Sie sich die Vorschau an und geben Sie die Webseite frei.`
            : `Wir bauen Ihre Webseite für ${siteName}. Hier sehen Sie den aktuellen Stand.`}
        </p>
      </div>

      {/* Schritte */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {steps.map((step) => (
          <div key={step.nr} style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '20px', borderRadius: '14px',
            border: `1px solid ${step.done ? '#BBF7D0' : '#E5E7EB'}`,
            background: step.done ? '#F0FDF4' : '#FFFFFF',
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
              background: step.done ? '#DCFCE7' : '#F3F4F6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {step.done
                ? <Check style={{ width: '20px', height: '20px', color: '#16A34A' }} />
                : <step.icon style={{ width: '20px', height: '20px', color: '#9CA3AF' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: step.done ? '#6B7280' : '#111827' }}>
                {step.done ? <s>{step.titel}</s> : step.titel}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>{step.beschreibung}</p>
            </div>
            {!step.done && step.href && (
              <a href={step.href} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, background: '#1E4A82', color: '#fff',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}>
                {step.ctaText}
              </a>
            )}
            {step.done && step.nr === 3 && previewAvailable && (
              <a href={`/dashboard/${siteId}`} style={{
                padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, background: '#1E4A82', color: '#fff',
                textDecoration: 'none', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Eye style={{ width: '14px', height: '14px' }} /> Ansehen & Bearbeiten
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Preview + Feedback wenn Webseite fertig */}
      {buildStatus === 'FERTIG' && !freigegeben && onboardingStatus !== 'FREIGEGEBEN' && (
        <>
          {/* Preview mit Desktop/Mobile Toggle */}
          {previewAvailable && (
            <div style={{
              borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden',
              marginBottom: '16px', background: '#fff',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 16px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Vorschau</span>
                <div style={{ display: 'flex', borderRadius: '6px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <button onClick={() => setPreviewDevice('desktop')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                    fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    background: previewDevice === 'desktop' ? '#1E4A82' : '#fff',
                    color: previewDevice === 'desktop' ? '#fff' : '#6B7280',
                  }}>
                    <Monitor style={{ width: '13px', height: '13px' }} /> Desktop
                  </button>
                  <button onClick={() => setPreviewDevice('mobile')} style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                    fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer',
                    borderLeft: '1px solid #E5E7EB',
                    background: previewDevice === 'mobile' ? '#1E4A82' : '#fff',
                    color: previewDevice === 'mobile' ? '#fff' : '#6B7280',
                  }}>
                    <Smartphone style={{ width: '13px', height: '13px' }} /> Mobil
                  </button>
                </div>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'center',
                background: previewDevice === 'mobile' ? '#F3F4F6' : '#fff',
              }}>
                <iframe
                  src={`/api/sites/${siteId}/preview`}
                  title="Vorschau"
                  style={{
                    width: previewDevice === 'mobile' ? '390px' : '100%',
                    height: previewDevice === 'mobile' ? '700px' : '500px',
                    border: 'none', display: 'block', background: '#fff',
                    borderRadius: previewDevice === 'mobile' ? '16px' : '0',
                    transition: 'width 0.3s',
                  }}
                />
              </div>
            </div>
          )}

          {/* Feedback-Panel mit Rundenzähler */}
          <div style={{
            padding: '24px', borderRadius: '14px',
            border: '1px solid #E0E7FF', background: '#EEF2FF', marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle style={{ width: '18px', height: '18px', color: '#4F46E5' }} />
                Feedback & Änderungswünsche
              </p>
              <span style={{
                fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px',
                background: rundenAufgebraucht ? '#FEF2F2' : '#F0FDF4',
                color: rundenAufgebraucht ? '#DC2626' : '#16A34A',
              }}>
                Runde {aktuelleRunde} von {feedbackMaxRunden}
              </span>
            </div>

            {!rundenAufgebraucht ? (
              <>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  Beschreiben Sie Ihre Änderungswünsche — unsere KI setzt sie automatisch um.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px',
                    border: '1px solid #C7D2FE', fontSize: '14px', resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                  placeholder="z.B. Die Headline soll 'Ihr Experte für Photovoltaik' heißen, die Farbe des Buttons soll grüner sein..."
                />
                <button
                  onClick={handleFeedback}
                  disabled={feedbackSending || !feedbackText.trim()}
                  style={{
                    marginTop: '12px', padding: '10px 20px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: 600, background: '#4F46E5', color: '#fff',
                    border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: '6px', opacity: feedbackSending || !feedbackText.trim() ? 0.5 : 1,
                  }}
                >
                  {feedbackSending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> KI überarbeitet...</>
                    : <><MessageCircle style={{ width: '16px', height: '16px' }} /> Feedback absenden</>}
                </button>
              </>
            ) : (
              <p style={{ fontSize: '13px', color: '#6B7280' }}>
                Alle {feedbackMaxRunden} inklusiven Feedback-Runden sind aufgebraucht.
                Bitte geben Sie die Webseite frei oder kontaktieren Sie uns für eine zusätzliche Runde.
              </p>
            )}

            {feedbackResult && (
              <div style={{
                marginTop: '12px', padding: '12px', borderRadius: '8px',
                background: '#fff', border: '1px solid #C7D2FE', fontSize: '13px', color: '#374151',
              }}>
                {feedbackResult}
              </div>
            )}
          </div>

          {/* Freigabe-Button */}
          <div style={{
            padding: '24px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
            border: '1px solid #BBF7D0', textAlign: 'center',
          }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
              Alles perfekt?
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
              {feedbackAutoFreigabeAm
                ? `Ohne Rückmeldung wird die Seite am ${new Date(feedbackAutoFreigabeAm).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })} automatisch freigeschaltet.`
                : 'Sie können die Webseite im Editor noch anpassen oder direkt freigeben.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <a href={`/dashboard/${siteId}`} style={{
                padding: '10px 20px', borderRadius: '8px', fontSize: '14px',
                fontWeight: 600, border: '1px solid #D1D5DB', color: '#374151',
                textDecoration: 'none', background: '#fff',
              }}>
                Erst bearbeiten
              </a>
              <button onClick={handleFreigabe} disabled={freigabeLoading} style={{
                padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
                fontWeight: 600, background: '#16A34A', color: '#fff',
                border: 'none', cursor: 'pointer', display: 'flex',
                alignItems: 'center', gap: '6px',
              }}>
                {freigabeLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird freigeschaltet...</>
                  : <><Rocket style={{ width: '16px', height: '16px' }} /> Webseite freigeben</>}
              </button>
            </div>
          </div>
        </>
      )}

      {freigegeben && (
        <div style={{ textAlign: 'center', padding: '24px', background: '#F0FDF4', borderRadius: '14px', border: '1px solid #BBF7D0' }}>
          <Check style={{ width: '32px', height: '32px', color: '#16A34A', margin: '0 auto 8px' }} />
          <p style={{ fontSize: '16px', fontWeight: 700, color: '#16A34A' }}>Webseite freigeschaltet!</p>
        </div>
      )}

      {/* Support */}
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#9CA3AF', marginTop: '32px' }}>
        Fragen? <a href="mailto:felix@zoeppmedia.de" style={{ color: '#1E4A82' }}>felix@zoeppmedia.de</a>
      </p>
    </div>
  )

  async function handleFeedback() {
    if (!feedbackText.trim()) return
    setFeedbackSending(true)
    setFeedbackResult(null)

    try {
      const res = await fetch('/api/customer/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId, feedback: feedbackText.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setAktuelleRunde(data.runde)
      setFeedbackText('')
      setFeedbackResult(
        data.angewendet
          ? `Ihre Änderungen wurden umgesetzt (Runde ${data.runde} von ${data.maxRunden}). Schauen Sie sich die Vorschau an!`
          : `Wir haben Ihr Feedback erhalten (Runde ${data.runde} von ${data.maxRunden}). ${data.response?.slice(0, 200) || ''}`
      )
    } catch (err: unknown) {
      setFeedbackResult(err instanceof Error ? err.message : 'Fehler beim Senden')
    } finally {
      setFeedbackSending(false)
    }
  }
}
