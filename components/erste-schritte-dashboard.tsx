'use client'

/**
 * Erste-Schritte-Dashboard (Get started):
 * Zeigt die live geschaltete Webseite groß in der Vorschau und daneben die
 * nächsten Schritte (Bilder, Domain, Blog/SEO, Angaben) mit Erledigt-Status.
 * Standard-Ansicht für Kunden nach dem Livegang; Editor über ?view=editor.
 */

import { Check, Globe, Image as ImageIcon, Newspaper, ClipboardList, Pencil, ExternalLink, Rocket } from 'lucide-react'

interface Props {
  siteId: string
  siteName: string
  customerName: string
  domainStatus: 'KEINE' | 'AUSSTEHEND' | 'AKTIV'
  domainHostname: string | null
  seoFreigegeben: number
  seoOffen: number
  hasBilder: boolean
  wizardBearbeitet: number
  wizardGesamt: number
  wizardFertig: boolean
}

export default function ErsteSchritteDashboard({
  siteId, siteName, customerName, domainStatus, domainHostname,
  seoFreigegeben, seoOffen, hasBilder, wizardBearbeitet, wizardGesamt, wizardFertig,
}: Props) {
  const firstName = customerName.split(' ')[0] || customerName

  const steps = [
    {
      key: 'live',
      titel: 'Webseite ist live',
      beschreibung: `${siteName} ist veröffentlicht und erreichbar.`,
      done: true,
      href: null as string | null,
      ctaText: '',
      icon: Rocket,
    },
    {
      key: 'bilder',
      titel: 'Eigene Bilder hochladen',
      beschreibung: hasBilder
        ? 'Bilder sind hochgeladen und zugeordnet.'
        : 'Logo und Fotos hochladen — die KI ordnet sie automatisch zu.',
      done: hasBilder,
      href: `/dashboard/${siteId}/bilder`,
      ctaText: 'Bilder hochladen',
      icon: ImageIcon,
    },
    {
      key: 'domain',
      titel: 'Eigene Domain verbinden',
      beschreibung: domainStatus === 'AKTIV'
        ? `${domainHostname} ist aktiv.`
        : domainStatus === 'AUSSTEHEND'
        ? `${domainHostname}: DNS-Umstellung läuft noch.`
        : 'Vorhandene Domain verbinden oder neue Domain registrieren.',
      done: domainStatus === 'AKTIV',
      href: `/dashboard/${siteId}/domain`,
      ctaText: domainStatus === 'AUSSTEHEND' ? 'Status prüfen' : 'Domain einrichten',
      icon: Globe,
    },
    {
      key: 'blog',
      titel: 'Ersten Blog-Beitrag freigeben',
      beschreibung: seoFreigegeben > 0
        ? `${seoFreigegeben} ${seoFreigegeben === 1 ? 'Beitrag' : 'Beiträge'} veröffentlicht.`
        : seoOffen > 0
        ? `${seoOffen} ${seoOffen === 1 ? 'Entwurf wartet' : 'Entwürfe warten'} auf Ihre Freigabe.`
        : 'Jeden Monat schreiben wir einen SEO-Beitrag — Sie geben ihn nur frei.',
      done: seoFreigegeben > 0,
      href: `/dashboard/${siteId}/seo`,
      ctaText: seoOffen > 0 ? 'Jetzt freigeben' : 'Beiträge ansehen',
      icon: Newspaper,
    },
    {
      key: 'angaben',
      titel: 'Angaben vervollständigen',
      beschreibung: wizardFertig
        ? 'Alle Angaben sind vollständig.'
        : `${wizardBearbeitet} von ${wizardGesamt} Abschnitten bearbeitet (Kontakt, Impressum, Öffnungszeiten …).`,
      done: wizardFertig,
      href: `/dashboard/${siteId}/fertigstellen`,
      ctaText: 'Vervollständigen',
      icon: ClipboardList,
    },
  ]

  const erledigt = steps.filter((s) => s.done).length

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
            Willkommen zurück, {firstName}!
          </h1>
          <p style={{ fontSize: '15px', color: '#6B7280' }}>
            Ihre Webseite ist live. {erledigt} von {steps.length} Schritten erledigt.
          </p>
        </div>
        <a
          href={`/dashboard/${siteId}?view=editor`}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px', fontSize: '14px',
            fontWeight: 600, background: '#1E4A82', color: '#fff', textDecoration: 'none',
          }}
        >
          <Pencil style={{ width: '15px', height: '15px' }} /> Webseite bearbeiten
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '24px', alignItems: 'start' }} className="es-grid">
        {/* Vorschau */}
        <div style={{
          borderRadius: '16px', border: '1px solid #E5E7EB', background: '#fff',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F87171' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FBBF24' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34D399' }} />
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
                {domainStatus === 'AKTIV' && domainHostname ? domainHostname : siteName}
              </span>
            </div>
            <a
              href={`/api/sites/${siteId}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px',
                fontWeight: 600, color: '#1E4A82', textDecoration: 'none',
              }}
            >
              In neuem Tab öffnen <ExternalLink style={{ width: '13px', height: '13px' }} />
            </a>
          </div>
          <iframe
            src={`/api/sites/${siteId}/preview`}
            title="Vorschau Ihrer Webseite"
            style={{ width: '100%', height: '640px', border: 'none', display: 'block', background: '#fff' }}
          />
        </div>

        {/* Get-started-Schritte */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Erste Schritte
          </p>
          {steps.map((step) => (
            <div key={step.key} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px', borderRadius: '14px',
              border: `1px solid ${step.done ? '#BBF7D0' : '#E5E7EB'}`,
              background: step.done ? '#F0FDF4' : '#FFFFFF',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: step.done ? '#DCFCE7' : '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {step.done
                  ? <Check style={{ width: '18px', height: '18px', color: '#16A34A' }} />
                  : <step.icon style={{ width: '18px', height: '18px', color: '#9CA3AF' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: step.done ? '#6B7280' : '#111827' }}>
                  {step.titel}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px', lineHeight: 1.5 }}>
                  {step.beschreibung}
                </p>
              </div>
              {!step.done && step.href && (
                <a href={step.href} style={{
                  padding: '7px 14px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: 600, background: '#1E4A82', color: '#fff',
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {step.ctaText}
                </a>
              )}
            </div>
          ))}

          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px', textAlign: 'center' }}>
            Fragen? <a href="mailto:felix@zoeppmedia.de" style={{ color: '#1E4A82' }}>felix@zoeppmedia.de</a>
          </p>
        </div>
      </div>

      {/* Mobil: einspaltig */}
      <style>{`
        @media (max-width: 1023px) {
          .es-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
