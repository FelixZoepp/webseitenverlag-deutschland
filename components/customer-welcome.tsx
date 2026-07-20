'use client'

import { useState } from 'react'
import { MessageSquare, Edit3, Upload, BarChart3, Mail, ArrowRight, ArrowLeft, Sparkles, Check, HelpCircle, ChevronRight } from 'lucide-react'

interface WelcomeProps {
  customerName: string
  customerId: string
  onComplete: () => void
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Willkommen bei deinem Website-Dashboard!',
    subtitle: 'In wenigen Schritten zeigen wir dir, wie du deine Website ganz einfach verwalten kannst — ohne Programmierkenntnisse.',
    icon: <Sparkles style={{ width: '48px', height: '48px', color: 'var(--za-gold)' }} />,
  },
  {
    id: 'chatbot',
    title: 'Dein KI-Assistent',
    subtitle: 'Bearbeite deine Website per Chat. Sag einfach, was du ändern willst.',
    icon: <MessageSquare style={{ width: '48px', height: '48px', color: 'var(--za-gold)' }} />,
    examples: [
      { text: '"Ändere die Überschrift zu: Ihr Experte für Gartenpflege"', label: 'Texte ändern' },
      { text: '"Füge einen neuen Service hinzu: Winterdienst"', label: 'Inhalte erweitern' },
      { text: '"Ändere die Hauptfarbe zu einem dunklen Grün"', label: 'Design anpassen' },
      { text: '"Aktualisiere die Telefonnummer auf 0800 999888"', label: 'Kontaktdaten' },
    ],
  },
  {
    id: 'editor',
    title: 'Manueller Editor',
    subtitle: 'Alternativ zum Chatbot kannst du alle Felder auch direkt im manuellen Editor bearbeiten.',
    icon: <Edit3 style={{ width: '48px', height: '48px', color: 'var(--za-gold)' }} />,
    features: [
      { icon: <Edit3 />, title: 'Texte & Bilder', desc: 'Alle Inhalte direkt bearbeiten — Headlines, Texte, Bilder, Kontaktdaten' },
      { icon: <Upload />, title: 'Veröffentlichen', desc: 'Mit einem Klick deine Änderungen live schalten' },
      { icon: <BarChart3 />, title: 'Analytics', desc: 'Sieh wie viele Besucher deine Website hat' },
      { icon: <Mail />, title: 'Anfragen', desc: 'Alle Kontaktanfragen direkt im Dashboard empfangen und beantworten' },
    ],
  },
  {
    id: 'tips',
    title: 'Tipps für den Start',
    subtitle: 'So holst du das Beste aus deiner Website heraus.',
    icon: <HelpCircle style={{ width: '48px', height: '48px', color: 'var(--za-gold)' }} />,
    tips: [
      { emoji: '📸', title: 'Eigene Bilder hinzufügen', desc: 'Professionelle Fotos von deinem Unternehmen machen deine Seite authentischer. Sag dem Chatbot einfach die Bild-URL.' },
      { emoji: '⭐', title: 'Bewertungen aktualisieren', desc: 'Neue Google-Bewertungen? Teile sie dem Chatbot mit — er fügt sie sofort auf der Seite ein.' },
      { emoji: '📞', title: 'Kontaktdaten prüfen', desc: 'Stelle sicher, dass Telefonnummer, E-Mail und Adresse stimmen.' },
      { emoji: '📊', title: 'Anfragen checken', desc: 'Schau regelmäßig in den Anfragen-Bereich — dort landen alle Nachrichten von deiner Website.' },
    ],
  },
  {
    id: 'ready',
    title: 'Alles klar — du bist startklar!',
    subtitle: 'Dein Dashboard ist bereit. Bei Fragen findest du jederzeit Hilfe im Hilfebereich.',
    icon: <Check style={{ width: '48px', height: '48px', color: 'var(--za-success)' }} />,
  },
]

export default function CustomerWelcome({ customerName, customerId, onComplete }: WelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const step = STEPS[currentStep]
  const isLast = currentStep === STEPS.length - 1
  const isFirst = currentStep === 0

  async function handleComplete() {
    await fetch(`/api/customer/onboarding-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    })
    onComplete()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(23,24,26,0.4)', backdropFilter: 'blur(12px)' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '600px', margin: '0 16px', maxHeight: '90vh', overflow: 'auto' }}>
        {/* Progress dots */}
        <div style={{ padding: '20px 28px 0', display: 'flex', justifyContent: 'center', gap: '8px', position: 'relative', zIndex: 2 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === currentStep ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i <= currentStep ? 'var(--za-gold-grad)' : 'var(--za-border)',
              transition: 'all 300ms',
            }} />
          ))}
        </div>

        <div style={{ padding: '28px 32px 32px', position: 'relative', zIndex: 2 }}>
          {/* Icon + Title */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ marginBottom: '16px' }}>{step.icon}</div>
            <h2 className="za-heading" style={{ fontSize: '22px', marginBottom: '10px' }}>
              {step.id === 'welcome' ? `Hallo${customerName ? `, ${customerName}` : ''}!` : ''} {step.title}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--za-fg-3)', lineHeight: 1.6, maxWidth: '460px', margin: '0 auto' }}>
              {step.subtitle}
            </p>
          </div>

          {/* Chatbot examples */}
          {step.id === 'chatbot' && step.examples && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
              {step.examples.map((ex, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 16px', borderRadius: '12px',
                  background: 'rgba(224,53,75,0.06)', border: '1px solid rgba(224,53,75,0.12)',
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'var(--za-gold-grad)', display: 'grid', placeItems: 'center',
                    fontSize: '12px', color: '#fff', fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--za-fg)', fontStyle: 'italic', marginBottom: '2px' }}>{ex.text}</p>
                    <span style={{ fontSize: '10px', color: 'var(--za-fg-4)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{ex.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Editor features */}
          {step.id === 'editor' && step.features && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
              {step.features.map((f, i) => (
                <div key={i} style={{
                  padding: '16px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.6)', border: '1px solid var(--za-border)',
                }}>
                  <div style={{ width: '14px', height: '14px', color: 'var(--za-gold)', marginBottom: '8px' }}>{f.icon}</div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg)', marginBottom: '4px' }}>{f.title}</p>
                  <p style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          {step.id === 'tips' && step.tips && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
              {step.tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '12px', padding: '12px 16px',
                  borderRadius: '12px', background: 'rgba(255,255,255,0.6)', border: '1px solid var(--za-border)',
                }}>
                  <span style={{ fontSize: '20px', flexShrink: 0 }}>{tip.emoji}</span>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--za-fg)', marginBottom: '2px' }}>{tip.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--za-fg-3)', lineHeight: 1.5 }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Ready - upsell teaser */}
          {step.id === 'ready' && (
            <div style={{
              padding: '16px 20px', borderRadius: '12px', marginBottom: '8px',
              background: 'linear-gradient(135deg, rgba(224,53,75,0.08), rgba(58,13,20,0.04))',
              border: '1px solid rgba(224,53,75,0.18)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles style={{ width: '14px', height: '14px', color: 'var(--za-gold)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--za-gold)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Tipp</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--za-fg)', lineHeight: 1.6 }}>
                Du möchtest mehr aus deiner Website herausholen? Im <strong>Hilfebereich</strong> findest du Erweiterungsmöglichkeiten wie eine Karriereseite, SEO-Artikel oder zusätzliche Landingpages.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            {!isFirst ? (
              <button onClick={() => setCurrentStep((s) => s - 1)} className="glass-btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', fontSize: '12px' }}>
                <ArrowLeft style={{ width: '14px', height: '14px' }} /> Zurück
              </button>
            ) : (
              <button onClick={handleComplete} style={{ fontSize: '12px', color: 'var(--za-fg-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Überspringen
              </button>
            )}

            {isLast ? (
              <button onClick={handleComplete} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 24px' }}>
                Los geht&apos;s! <ChevronRight style={{ width: '14px', height: '14px' }} />
              </button>
            ) : (
              <button onClick={() => setCurrentStep((s) => s + 1)} className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px' }}>
                Weiter <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
