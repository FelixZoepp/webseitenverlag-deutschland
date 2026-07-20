'use client'

import { useState } from 'react'
import { MessageSquare, Edit3, Upload, BarChart3, Mail, Search, ChevronDown, ChevronRight, Sparkles, Rocket, FileText, Globe, Users, TrendingUp, Star } from 'lucide-react'
import { PackageTier } from '@/lib/packages'

type Section = 'guides' | 'faq' | 'upsells'

const GUIDES = [
  {
    icon: <MessageSquare />,
    title: 'Website per Chat bearbeiten',
    steps: [
      'Öffne deine Website im Editor',
      'Wähle den Tab "Chatbot" (links)',
      'Beschreibe deine gewünschte Änderung — z.B. "Ändere die Headline zu: Ihr Partner für Dacharbeiten"',
      'Die KI versteht natürliche Sprache und setzt die Änderung sofort um',
      'Prüfe die Vorschau rechts',
      'Klicke auf "Veröffentlichen" wenn alles passt',
    ],
  },
  {
    icon: <Edit3 />,
    title: 'Manuell bearbeiten',
    steps: [
      'Öffne den Tab "Manuell" im Editor',
      'Alle Felder (Texte, Farben, Kontaktdaten) sind direkt editierbar',
      'Änderungen werden automatisch als Entwurf gespeichert',
      'Klicke "Veröffentlichen" um die Änderungen live zu schalten',
    ],
  },
  {
    icon: <Upload />,
    title: 'Website veröffentlichen',
    steps: [
      'Nimm deine Änderungen im Editor vor (Chat oder Manuell)',
      'Prüfe die Vorschau — so wird deine Website aussehen',
      'Klicke oben rechts auf "Veröffentlichen"',
      'Die Website wird auf deiner Domain aktualisiert',
      'Bei Fehlern: Geh auf "Verlauf" und mache einen Rollback auf eine frühere Version',
    ],
  },
  {
    icon: <Mail />,
    title: 'Kontaktanfragen verwalten',
    steps: [
      'Klicke im Editor auf "Anfragen" (oben rechts)',
      'Neue Anfragen sind blau markiert',
      'Klicke auf eine Anfrage um Details zu sehen',
      'Antworte direkt per E-Mail über den "Antworten"-Button',
      'Markiere erledigte Anfragen als "Archiviert"',
      'Du bekommst auch E-Mail-Benachrichtigungen bei neuen Anfragen',
    ],
  },
  {
    icon: <BarChart3 />,
    title: 'Analytics verstehen',
    steps: [
      'Klicke im Editor auf "Analytics"',
      'Seitenaufrufe zeigen wie oft deine Website besucht wird',
      'Besucher (Unique) = geschätzte Anzahl verschiedener Personen',
      'Top Seiten zeigt welche Unterseiten am beliebtesten sind',
      'Top Quellen zeigt woher deine Besucher kommen (Google, Social Media, etc.)',
      'Nutze den Zeitraum-Filter (7/30/90 Tage) für verschiedene Ansichten',
    ],
  },
]

const FAQ = [
  { q: 'Wie ändere ich Texte auf meiner Website?', a: 'Am einfachsten über den Chatbot: Schreib z.B. "Ändere den Slogan zu: Qualität seit 2005". Alternativ kannst du im Tab "Manuell" jedes Feld direkt bearbeiten.' },
  { q: 'Wie lange dauert es bis Änderungen online sind?', a: 'Nach dem Klick auf "Veröffentlichen" ist die Änderung in der Regel innerhalb von 30–60 Sekunden live.' },
  { q: 'Kann ich Änderungen rückgängig machen?', a: 'Ja! Im Tab "Verlauf" siehst du alle Versionen deiner Website. Klicke auf "Rollback" bei einer früheren Version, um diese wiederherzustellen.' },
  { q: 'Wie füge ich neue Bilder hinzu?', a: 'Momentan kannst du Bild-URLs im Chatbot angeben, z.B. "Setze das Hero-Bild auf https://...". Wir arbeiten an einem Bild-Upload direkt im Dashboard.' },
  { q: 'Bekomme ich eine Nachricht wenn jemand das Kontaktformular ausfüllt?', a: 'Ja, du bekommst automatisch eine E-Mail bei jeder neuen Anfrage. Du kannst die E-Mail-Adresse und Benachrichtigungen unter Anfragen → Einstellungen anpassen.' },
  { q: 'Was bedeutet "Entwurf" und "Live"?', a: '"Entwurf" bedeutet, dass du Änderungen gemacht hast, die noch nicht veröffentlicht sind. "Live" bedeutet, die aktuelle Version ist online. Änderungen werden erst mit "Veröffentlichen" live geschaltet.' },
  { q: 'Kann ich neue Seiten hinzufügen?', a: 'Wenn du ein Business- oder Growth-Paket hast, kannst du über die Seitenleiste im Editor neue Unterseiten erstellen (Über uns, Leistungen, Kontakt, etc.).' },
  { q: 'Was ist mit Impressum und Datenschutz?', a: 'Beide Seiten werden automatisch bei der Erstellung angelegt. Du kannst die Angaben im Editor bearbeiten. Achte darauf, dass alle Pflichtangaben korrekt sind.' },
  { q: 'Wie erreiche ich den Support?', a: 'Schreib uns einfach eine E-Mail an support@webseitenverlag.de oder ruf an. Wir helfen dir gerne weiter.' },
]

interface Upsell {
  icon: React.ReactNode
  title: string
  description: string
  price: string
  features: string[]
  highlight?: boolean
  availableFrom?: PackageTier
}

const UPSELLS: Upsell[] = [
  {
    icon: <Users />,
    title: 'Karriereseite',
    description: 'Professionelle Karriere-Unterseite mit Stellenanzeigen — perfekt um qualifizierte Bewerber direkt über deine Website zu gewinnen.',
    price: 'ab 29 €/Mt',
    features: ['Eigene Karriere-Unterseite', 'Stellenanzeigen einfach per Chat verwalten', 'Bewerber-Formular mit E-Mail-Benachrichtigung', 'Mobile-optimiert'],
    highlight: true,
  },
  {
    icon: <FileText />,
    title: 'SEO-Artikel (monatlich)',
    description: 'Regelmäßige Blog-Artikel zu deiner Branche und Region — von der KI geschrieben und optimiert für Google.',
    price: 'ab 49 €/Mt',
    features: ['4 Artikel pro Monat (1.500–2.000 Wörter)', 'SEO-optimiert für deine Region', 'Automatisch veröffentlicht', 'Mit Bildern und Meta-Tags'],
    availableFrom: 'business',
  },
  {
    icon: <Globe />,
    title: 'Zusätzliche Landing-Pages',
    description: 'Programmatische Landing-Pages für Nachbarorte und Stadtteile — mehr Sichtbarkeit bei lokalen Google-Suchen.',
    price: 'ab 39 €/Mt',
    features: ['Landing-Pages für 5–10 Orte', 'Automatisch generierte Inhalte', 'Lokale Keywords und Meta-Tags', 'Interne Verlinkung'],
    availableFrom: 'business',
  },
  {
    icon: <Star />,
    title: 'Google Bewertungs-Widget',
    description: 'Zeige echte Google-Bewertungen direkt auf deiner Website — automatisch synchronisiert.',
    price: 'ab 19 €/Mt',
    features: ['Automatischer Import aus Google Business', 'Schickes Widget-Design', 'Neue Bewertungen erscheinen automatisch', 'Vertrauens-Boost für Besucher'],
  },
  {
    icon: <TrendingUp />,
    title: 'Paket-Upgrade',
    description: 'Steige auf ein größeres Paket um und nutze mehr Features: Mehr Seiten, erweitertes SEO, Performance-Reports.',
    price: 'Preis je nach Paket',
    features: ['Mehr Unterseiten', 'Erweitertes lokales SEO', 'Schema.org & strukturierte Daten', 'Monatlicher Performance-Report'],
  },
]

export default function HelpCenter({ customerPackage }: { customerPackage: string }) {
  const [section, setSection] = useState<Section>('guides')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFaq = searchQuery.trim()
    ? FAQ.filter((f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase()))
    : FAQ

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: 'guides', label: 'Anleitungen', icon: <Rocket style={{ width: '14px', height: '14px' }} /> },
    { key: 'faq', label: 'Häufige Fragen', icon: <MessageSquare style={{ width: '14px', height: '14px' }} /> },
    { key: 'upsells', label: 'Erweiterungen', icon: <Sparkles style={{ width: '14px', height: '14px' }} /> },
  ]

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.4)' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--za-fg)' }}>Hilfe & Erweiterungen</span>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Section tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {sections.map((s) => (
            <button key={s.key} onClick={() => setSection(s.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '12px', fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: '1px solid',
                background: section === s.key ? 'var(--za-gold-grad)' : 'rgba(255,255,255,0.6)',
                color: section === s.key ? '#fff' : 'var(--za-fg-3)',
                borderColor: section === s.key ? 'transparent' : 'var(--za-border)',
                boxShadow: section === s.key ? '0 4px 14px -4px rgba(224,53,75,0.45)' : 'none',
                transition: 'all 240ms',
              }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        {/* Guides */}
        {section === 'guides' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {GUIDES.map((guide, gi) => (
              <GuideCard key={gi} guide={guide} index={gi} />
            ))}
          </div>
        )}

        {/* FAQ */}
        {section === 'faq' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '12px', width: '16px', height: '16px', color: 'var(--za-fg-4)' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Frage suchen..."
                className="glass-input" style={{ paddingLeft: '40px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredFaq.map((faq, i) => (
                <div key={i} className="glass" style={{ overflow: 'hidden' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '16px 20px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      position: 'relative', zIndex: 2,
                    }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--za-fg)', paddingRight: '16px' }}>{faq.q}</span>
                    {openFaq === i
                      ? <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--za-fg-4)', flexShrink: 0 }} />
                      : <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--za-fg-4)', flexShrink: 0 }} />
                    }
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 20px 16px', position: 'relative', zIndex: 2 }}>
                      <p style={{ fontSize: '13px', color: 'var(--za-fg-2)', lineHeight: 1.7 }}>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredFaq.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--za-fg-4)', fontSize: '13px' }}>
                  Keine passenden Fragen gefunden.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upsells */}
        {section === 'upsells' && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 className="za-heading" style={{ fontSize: '20px', marginBottom: '8px' }}>Mehr aus deiner Website herausholen</h2>
              <p style={{ fontSize: '13px', color: 'var(--za-fg-3)', lineHeight: 1.6 }}>
                Erweitere deine Website mit zusätzlichen Features. Sprich uns einfach an — wir richten alles für dich ein.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {UPSELLS.map((upsell, i) => (
                <div key={i} className="glass fade-up" style={{
                  padding: '24px', animationDelay: `${i * 80}ms`,
                  border: upsell.highlight ? '1px solid rgba(224,53,75,0.3)' : undefined,
                }}>
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    {upsell.highlight && (
                      <span style={{
                        display: 'inline-block', fontSize: '9px', fontWeight: 700,
                        letterSpacing: '0.2em', textTransform: 'uppercase',
                        color: '#fff', background: 'var(--za-gold-grad)',
                        padding: '2px 8px', borderRadius: '999px', marginBottom: '12px',
                      }}>Beliebt</span>
                    )}
                    <div style={{ width: '16px', height: '16px', color: 'var(--za-gold)', marginBottom: '12px' }}>{upsell.icon}</div>
                    <h3 style={{ fontFamily: 'var(--za-font-display)', fontSize: '16px', color: 'var(--za-fg)', marginBottom: '6px' }}>{upsell.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--za-fg-3)', lineHeight: 1.6, marginBottom: '12px' }}>{upsell.description}</p>

                    <div style={{
                      padding: '8px 12px', borderRadius: '8px', marginBottom: '14px',
                      background: 'rgba(224,53,75,0.06)', display: 'inline-block',
                    }}>
                      <span style={{ fontFamily: 'var(--za-font-display)', fontSize: '15px', fontWeight: 700, color: 'var(--za-gold)' }}>{upsell.price}</span>
                    </div>

                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                      {upsell.features.map((f, fi) => (
                        <li key={fi} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'var(--za-fg-2)' }}>
                          <span style={{ color: 'var(--za-success)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    {upsell.availableFrom && customerPackage === 'starter' ? (
                      <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', fontStyle: 'italic' }}>
                        Verfügbar ab {upsell.availableFrom === 'business' ? '🥈 Business' : '🥇 Growth'}-Paket
                      </div>
                    ) : (
                      <a href="mailto:support@webseitenverlag.de?subject=Interesse an: ${upsell.title}"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                          fontSize: '11px', fontWeight: 600, color: 'var(--za-gold)',
                          textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                        Jetzt anfragen <ChevronRight style={{ width: '12px', height: '12px' }} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="glass fade-up" style={{ padding: '28px', textAlign: 'center', marginTop: '24px', animationDelay: '500ms' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <Sparkles style={{ width: '24px', height: '24px', color: 'var(--za-gold)', margin: '0 auto 12px' }} />
                <h3 className="za-heading" style={{ fontSize: '18px', marginBottom: '8px' }}>Individuelle Wünsche?</h3>
                <p style={{ fontSize: '13px', color: 'var(--za-fg-3)', maxWidth: '400px', margin: '0 auto 16px', lineHeight: 1.6 }}>
                  Du hast eine besondere Anforderung? Wir finden eine Lösung — sprich uns einfach an.
                </p>
                <a href="mailto:support@webseitenverlag.de" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                  <Mail style={{ width: '14px', height: '14px' }} /> Kontakt aufnehmen
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function GuideCard({ guide, index }: { guide: typeof GUIDES[0]; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="glass fade-up" style={{ animationDelay: `${index * 80}ms`, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)}
        style={{
          width: '100%', textAlign: 'left', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: '14px',
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          position: 'relative', zIndex: 2,
        }}>
        <div style={{ width: '16px', height: '16px', color: 'var(--za-gold)', flexShrink: 0 }}>{guide.icon}</div>
        <span style={{ flex: 1, fontSize: '15px', fontWeight: 600, color: 'var(--za-fg)' }}>{guide.title}</span>
        {open
          ? <ChevronDown style={{ width: '16px', height: '16px', color: 'var(--za-fg-4)' }} />
          : <ChevronRight style={{ width: '16px', height: '16px', color: 'var(--za-fg-4)' }} />
        }
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px 54px', position: 'relative', zIndex: 2 }}>
          <ol style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: 0, padding: 0, listStyle: 'none' }}>
            {guide.steps.map((step, si) => (
              <li key={si} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--za-fg-2)', lineHeight: 1.6 }}>
                <span style={{
                  width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                  background: 'var(--za-gold-grad)', display: 'grid', placeItems: 'center',
                  fontSize: '10px', color: '#fff', fontWeight: 700,
                }}>{si + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}
