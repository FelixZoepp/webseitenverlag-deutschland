'use client'

import { useState } from 'react'
import { Check, Upload, Phone, Sparkles, Loader2, Eye, Rocket } from 'lucide-react'

interface Props {
  siteId: string
  siteName: string
  customerName: string
  onboardingStatus: string
  buildStatus: string
  onboardingTermin: string | null
  hasBilder: boolean
  previewAvailable: boolean
}

export default function KundenStatusDashboard({
  siteId, siteName, customerName, onboardingStatus, buildStatus,
  onboardingTermin, hasBilder, previewAvailable,
}: Props) {
  const [freigabeLoading, setFreigabeLoading] = useState(false)
  const [freigegeben, setFreigegeben] = useState(false)

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

      {/* Freigabe-Button wenn Webseite fertig */}
      {buildStatus === 'FERTIG' && !freigegeben && onboardingStatus !== 'FREIGEGEBEN' && (
        <div style={{
          padding: '24px', borderRadius: '14px',
          background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
          border: '1px solid #BBF7D0', textAlign: 'center',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            Alles perfekt?
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
            Sie können die Webseite im Editor noch anpassen oder direkt freigeben.
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
}
