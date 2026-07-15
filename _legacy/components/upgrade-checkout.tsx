'use client'

import { useState } from 'react'
import { Site } from '@/types'
import Link from 'next/link'
import { Check, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'

// --- Challenges → Module Mapping ---

interface Challenge {
  id: string
  emoji: string
  label: string
  moduleId: string
}

const CHALLENGES: Challenge[] = [
  { id: 'mitarbeiter', emoji: '👥', label: 'Ich finde zu wenig qualifizierte Mitarbeiter', moduleId: 'karriere-seite' },
  { id: 'bewertungen', emoji: '⭐', label: 'Ich brauche mehr Google-Bewertungen', moduleId: 'bewertungs-maschine' },
  { id: 'erreichbarkeit', emoji: '💬', label: 'Kunden stellen Fragen außerhalb meiner Öffnungszeiten', moduleId: '247-besucher-chatbot' },
  { id: 'kundenbindung', emoji: '📧', label: 'Ich möchte Kunden regelmäßig erreichen', moduleId: 'newsletter-maschine' },
  { id: 'termine', emoji: '📅', label: 'Terminvereinbarung kostet mich zu viel Zeit', moduleId: 'termin-buchung' },
  { id: 'whatsapp', emoji: '📱', label: 'Kunden wollen mich lieber per WhatsApp erreichen', moduleId: 'whatsapp-connector' },
  { id: 'leads', emoji: '🧲', label: 'Ich möchte mehr Kontaktanfragen über die Website', moduleId: 'lead-magnet' },
  { id: 'sprache', emoji: '🌍', label: 'Meine Kunden sprechen verschiedene Sprachen', moduleId: 'mehrsprachigkeit' },
  { id: 'social', emoji: '📸', label: 'Ich möchte meinen Instagram-Feed auf der Website zeigen', moduleId: 'social-feed' },
  { id: 'galerie', emoji: '🖼️', label: 'Ich brauche eine professionelle Bildergalerie', moduleId: 'foto-galerie-pro' },
  { id: 'analytics', emoji: '📊', label: 'Ich will genau wissen, was auf meiner Website passiert', moduleId: 'analytics-pro' },
]

// --- Module Details with impact stories ---

interface ModuleDetail {
  id: string
  name: string
  preisMonatlich: number
  headline: string
  problem: string
  solution: string
  impact: string
  example: { business: string; result: string }
  features: string[]
}

const MODULES: Record<string, ModuleDetail> = {
  'karriere-seite': {
    id: 'karriere-seite', name: 'Karriere-Seite', preisMonatlich: 49,
    headline: 'Qualifizierte Bewerber direkt über deine Website gewinnen',
    problem: 'Fachkräftemangel ist real — Jobportale sind teuer und bringen oft die falschen Kandidaten. Ohne eigene Karriereseite verpasst du Bewerber, die sich direkt bei dir bewerben wollen.',
    solution: 'Eine eigene Karriere-Unterseite mit Stellenanzeigen, Bewerbungsformular und Bewerber-Inbox. Neue Bewerbungen landen direkt in deinem Dashboard.',
    impact: 'Unternehmen mit eigener Karriereseite erhalten im Schnitt 3× mehr qualifizierte Direktbewerbungen als über Jobportale.',
    example: { business: 'Elektro Schneider, München', result: 'Hat innerhalb von 6 Wochen 2 Gesellen eingestellt — komplett über die eigene Website, ohne Indeed oder StepStone.' },
    features: ['Eigene Karriere-Unterseite im Design deiner Website', 'Stellenanzeigen per Chat erstellen und verwalten', 'Bewerbungsformular mit Lebenslauf-Upload', 'E-Mail-Benachrichtigung bei neuen Bewerbungen', 'Bewerber-Inbox im Dashboard'],
  },
  'bewertungs-maschine': {
    id: 'bewertungs-maschine', name: 'Bewertungs-Maschine', preisMonatlich: 39,
    headline: 'Automatisch mehr Google-Bewertungen sammeln',
    problem: 'Zufriedene Kunden vergessen Bewertungen zu schreiben. Nur unzufriedene melden sich. Das verzerrt dein Google-Profil.',
    solution: 'Nach jedem Kundenkontakt wird automatisch eine freundliche E-Mail verschickt, die zur Google-Bewertung einlädt. Unzufriedene Kunden werden vorher abgefangen.',
    impact: 'Betriebe mit dieser Automation steigern ihre Bewertungsanzahl um durchschnittlich 400% in den ersten 3 Monaten.',
    example: { business: 'Friseur Salon Ella, Köln', result: 'Ging von 12 auf 67 Google-Bewertungen in 4 Monaten. Durchschnitt stieg von 4.2 auf 4.8 Sterne.' },
    features: ['Automatische E-Mail-Einladung nach Kundenkontakt', 'Negativ-Filter: Unzufriedene werden intern aufgefangen', 'Timing frei einstellbar (z.B. 3 Tage nach Besuch)', 'Direkt-Link zum Google-Bewertungsformular', 'Dashboard mit Bewertungs-Statistik'],
  },
  '247-besucher-chatbot': {
    id: '247-besucher-chatbot', name: '24/7 Besucher-Chatbot', preisMonatlich: 49,
    headline: 'Dein digitaler Mitarbeiter — rund um die Uhr erreichbar',
    problem: 'Besucher haben Fragen, wenn du nicht erreichbar bist. Jeder unbeantwortete Besucher ist ein potenziell verlorener Kunde.',
    solution: 'Ein KI-Chatbot auf deiner Website beantwortet Fragen sofort, sammelt Kontaktdaten und leitet warme Leads an dich weiter.',
    impact: 'Websites mit Chatbot konvertieren bis zu 45% mehr Besucher in Kontaktanfragen.',
    example: { business: 'Zahnarztpraxis Dr. Berger, Hamburg', result: 'Erhält jetzt 8-12 Terminanfragen pro Woche über den Chatbot — auch nachts und am Wochenende.' },
    features: ['KI-Chatbot mit deinem Firmenwissen trainiert', 'Beantwortet FAQs automatisch', 'Sammelt Name + E-Mail + Anliegen', 'Leads landen im Dashboard', 'Widget im Design deiner Website'],
  },
  'newsletter-maschine': {
    id: 'newsletter-maschine', name: 'Newsletter-Maschine', preisMonatlich: 39,
    headline: 'Deine Kunden regelmäßig erreichen — ohne Aufwand',
    problem: 'Einmal-Kunden kommen oft nicht wieder. Ohne regelmäßigen Kontakt vergessen sie dich.',
    solution: 'Automatische E-Mail-Newsletter halten dich bei deinen Kunden im Kopf. Willkommens-Sequenz für Neukunden inklusive.',
    impact: 'E-Mail-Marketing bringt im Schnitt 42€ Umsatz für jeden investierten Euro.',
    example: { business: 'Blumenladen Rosengarten, Stuttgart', result: 'Verschickt automatisch saisonale Newsletter. 23% der Empfänger bestellen innerhalb einer Woche.' },
    features: ['Automatischer Newsletter-Versand', '5-Mail Willkommens-Sequenz für Neukunden', 'Newsletter aus Blog-Artikeln generiert', 'Subscriber-Verwaltung', 'Abmelde-Link DSGVO-konform'],
  },
  'termin-buchung': {
    id: 'termin-buchung', name: 'Termin-Buchungs-System', preisMonatlich: 49,
    headline: 'Kunden buchen selbst — du sparst Zeit',
    problem: 'Telefon klingelt ständig für Terminanfragen. Hin-und-her per Telefon oder E-Mail kostet dich Stunden pro Woche.',
    solution: 'Online-Terminkalender direkt auf deiner Website. Kunden sehen freie Zeiten und buchen selbst. Automatische Erinnerungen reduzieren No-Shows.',
    impact: 'Online-Buchung spart im Schnitt 5 Stunden pro Woche und reduziert No-Shows um 60%.',
    example: { business: 'Physiotherapie Kraft, Berlin', result: '80% der Termine werden jetzt online gebucht. Rezeptionistin hat wieder Zeit für Patienten vor Ort.' },
    features: ['Online-Terminkalender auf deiner Website', 'Google Calendar Synchronisation', 'Automatische Erinnerungs-E-Mails', 'Verfügbare Tage und Zeiten einstellbar', 'Pufferzeiten zwischen Terminen'],
  },
  'whatsapp-connector': {
    id: 'whatsapp-connector', name: 'WhatsApp-Lead-Connector', preisMonatlich: 29,
    headline: 'Erreichbar dort, wo deine Kunden sind',
    problem: 'Viele Kunden bevorzugen WhatsApp gegenüber E-Mail oder Anruf. Ohne WhatsApp-Button verlierst du diese Anfragen.',
    solution: 'Ein schwebender WhatsApp-Button auf deiner Website. Mit einem Klick starten Besucher eine Konversation mit dir.',
    impact: 'WhatsApp hat eine Öffnungsrate von 98% — vs. 20% bei E-Mails.',
    example: { business: 'Autowerkstatt Müller, Frankfurt', result: 'Erhält jetzt 40% seiner Anfragen über WhatsApp. Kunden schicken direkt Fotos von Schäden mit.' },
    features: ['Schwebender WhatsApp-Button auf der Website', 'Vorlagentexte für schnellen Start', 'Mobil- und Desktop-optimiert', 'Anfragen im Dashboard nachverfolgbar'],
  },
  'lead-magnet': {
    id: 'lead-magnet', name: 'Lead-Magnet-Funnel', preisMonatlich: 49,
    headline: 'Mehr Kontaktanfragen durch intelligentes Pop-up',
    problem: '97% der Website-Besucher verlassen die Seite, ohne Kontakt aufzunehmen. Das sind verpasste Chancen.',
    solution: 'Ein intelligentes Pop-up bietet einen PDF-Ratgeber an. Im Tausch gibt der Besucher seine E-Mail. Danach folgt eine 5-Mail-Sequenz, die Vertrauen aufbaut.',
    impact: 'Lead-Magnets steigern die Konversionsrate um bis zu 300% im Vergleich zu einfachen Kontaktformularen.',
    example: { business: 'Steuerberater Hartmann, Düsseldorf', result: '"7 Steuertipps für Selbstständige" als PDF. 15-20 neue E-Mail-Kontakte pro Monat — davon werden 3-4 zu Mandanten.' },
    features: ['Intelligentes Pop-up (Exit-Intent / nach 30 Sek / nach Scroll)', 'PDF wird per KI erstellt oder manuell hochgeladen', 'E-Mail-Capture mit DSGVO-Einwilligung', '5-Mail Welcome-Sequenz automatisch', 'Conversion-Tracking im Dashboard'],
  },
  'mehrsprachigkeit': {
    id: 'mehrsprachigkeit', name: 'Mehrsprachigkeit', preisMonatlich: 39,
    headline: 'Deine Website in jeder Sprache — automatisch',
    problem: 'Internationale Kunden oder Mitarbeiter verstehen deine Website nicht. Manuelles Übersetzen ist teuer und aufwändig.',
    solution: 'KI-gestützte Übersetzung deiner gesamten Website. Besucher wählen ihre Sprache mit einem Klick.',
    impact: 'Mehrsprachige Websites erreichen bis zu 70% mehr internationale Kunden.',
    example: { business: 'Hotel Bergblick, Garmisch', result: 'Website in DE/EN/NL/IT. Buchungen von internationalen Gästen um 45% gestiegen.' },
    features: ['Automatische KI-Übersetzung aller Inhalte', 'Sprachschalter im Website-Header', 'SEO-Optimierung pro Sprache', 'hreflang-Tags für Google', 'Neue Inhalte werden automatisch mitübersetzt'],
  },
  'social-feed': {
    id: 'social-feed', name: 'Social-Media-Feed', preisMonatlich: 19,
    headline: 'Dein Instagram live auf der Website',
    problem: 'Du postest regelmäßig auf Instagram, aber deine Website sieht immer gleich aus. Besucher merken nicht, wie aktiv du bist.',
    solution: 'Dein Instagram-Feed wird automatisch auf der Website eingebunden. Neue Posts erscheinen sofort.',
    impact: 'Websites mit Social-Feed haben 25% längere Besuchszeiten und wirken deutlich aktueller.',
    example: { business: 'Café Sonnenschein, Leipzig', result: 'Tägliche Food-Fotos erscheinen automatisch auf der Website. Besucher verbringen 40% mehr Zeit auf der Seite.' },
    features: ['Instagram-Feed automatisch eingebunden', 'Neue Posts erscheinen sofort', 'Schickes Grid-Layout', 'Direktlink zum Instagram-Profil'],
  },
  'foto-galerie-pro': {
    id: 'foto-galerie-pro', name: 'Foto-Galerie Pro', preisMonatlich: 29,
    headline: 'Zeige deine Arbeit professionell',
    problem: 'Fotos wirken auf der Website unstrukturiert oder fehlen ganz. Potenzielle Kunden können sich kein Bild von deiner Arbeit machen.',
    solution: 'Professionelle Galerie mit Lightbox, Kategorien und einfachem Upload direkt im Dashboard.',
    impact: 'Handwerksbetriebe mit Projekt-Galerie erhalten 65% mehr Anfragen als ohne.',
    example: { business: 'Maler Meister Böhm, München', result: 'Vorher/Nachher-Galerie mit 40 Projekten. Kunden sagen: "Die Bilder haben mich überzeugt."' },
    features: ['Lightbox-Galerie mit Zoom', 'Kategorien und Filter', 'Drag-&-Drop Bild-Upload im Dashboard', 'Automatische Bildoptimierung', 'Lazy-Loading für schnelle Ladezeiten'],
  },
  'analytics-pro': {
    id: 'analytics-pro', name: 'Analytics Pro', preisMonatlich: 29,
    headline: 'Verstehe genau, was auf deiner Website passiert',
    problem: 'Du weißt nicht, woher deine Besucher kommen und was sie auf der Seite machen. Entscheidungen triffst du im Blindflug.',
    solution: 'Erweiterte Analytics mit Heatmaps, Conversion-Tracking und monatlichem Report direkt ins Postfach.',
    impact: 'Datenbasierte Optimierung steigert die Anfragerate im Schnitt um 35% innerhalb von 3 Monaten.',
    example: { business: 'Anwaltskanzlei Weber, Frankfurt', result: 'Heatmap zeigte: Keiner scrollte zum Kontaktformular. CTA nach oben verschoben → 50% mehr Anfragen.' },
    features: ['Heatmaps: Wo klicken Besucher?', 'Conversion-Tracking: Welche Seiten bringen Anfragen?', 'Monatlicher PDF-Report per E-Mail', 'Besucher-Flow: Wie navigieren Nutzer?'],
  },
}

const CONTRACT_MONTHS = 48
const MWST = 0.19

type Step = 'survey' | 'recommendation' | 'checkout' | 'done'

export default function UpgradeCheckout({
  site,
  preselectedUpsellId,
}: {
  site: Site
  customer: Record<string, unknown>
  preselectedUpsellId: string | null
}) {
  const [step, setStep] = useState<Step>(preselectedUpsellId ? 'recommendation' : 'survey')
  const [, setSelectedChallenge] = useState<string | null>(
    preselectedUpsellId ? (CHALLENGES.find((c) => c.moduleId === preselectedUpsellId)?.id || null) : null
  )
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(preselectedUpsellId)
  const [agbAccepted, setAgbAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedModule = selectedModuleId ? MODULES[selectedModuleId] : null
  const netto = selectedModule ? selectedModule.preisMonatlich : 0
  const mwst = netto * MWST
  const brutto = netto + mwst
  const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  function handleChallengeSelect(challengeId: string) {
    const challenge = CHALLENGES.find((c) => c.id === challengeId)
    if (!challenge) return
    setSelectedChallenge(challengeId)
    setSelectedModuleId(challenge.moduleId)
    setStep('recommendation')
  }

  async function handleOrder() {
    if (!selectedModule || !agbAccepted) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/sites/${site.id}/upsell-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upsellId: selectedModule.id,
          action: 'accept',
          orderDetails: { moduleName: selectedModule.name, nettoMonatlich: netto, bruttoMonatlich: brutto, contractMonths: CONTRACT_MONTHS, orderedAt: new Date().toISOString() },
        }),
      })
      if (!res.ok) throw new Error('Bestellung fehlgeschlagen')
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally { setSubmitting(false) }
  }

  // --- STEP: DONE ---
  if (step === 'done') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: '#fff', borderRadius: '20px', padding: '56px 48px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ecfdf5', display: 'grid', placeItems: 'center', margin: '0 auto 24px' }}>
            <Check style={{ width: '36px', height: '36px', color: '#10b981' }} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.02em' }}>Bestellung eingegangen!</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', lineHeight: 1.7, marginBottom: '32px' }}>
            Wir richten <strong>{selectedModule?.name}</strong> für deine Website ein.<br />Du erhältst eine Bestätigung per E-Mail.
          </p>
          <Link href={`/dashboard/${site.id}`}
            style={{ display: 'inline-block', padding: '14px 36px', background: '#2563eb', color: '#fff', borderRadius: '12px', fontSize: '16px', fontWeight: 700, textDecoration: 'none' }}>
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* --- STEP: SURVEY --- */}
        {step === 'survey' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ fontSize: '14px', color: 'var(--za-gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Erweiterungen</p>
              <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--za-fg)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '16px' }}>
                Was ist aktuell deine größte Herausforderung?
              </h1>
              <p style={{ fontSize: '17px', color: 'var(--za-fg-3)', lineHeight: 1.6 }}>
                Wähle das Thema, das dich am meisten beschäftigt — wir zeigen dir die passende Lösung.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {CHALLENGES.map((c) => (
                <button key={c.id} onClick={() => handleChallengeSelect(c.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '20px 24px', borderRadius: '14px',
                    background: 'rgba(255,255,255,0.7)', border: '1px solid var(--za-border)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    transition: 'all 200ms', fontSize: '16px', color: 'var(--za-fg)', fontWeight: 500,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget).style.borderColor = 'rgba(42,111,219,0.3)'; (e.currentTarget).style.background = 'rgba(42,111,219,0.04)' }}
                  onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--za-border)'; (e.currentTarget).style.background = 'rgba(255,255,255,0.7)' }}>
                  <span style={{ fontSize: '28px', flexShrink: 0 }}>{c.emoji}</span>
                  <span>{c.label}</span>
                  <ArrowRight style={{ width: '18px', height: '18px', marginLeft: 'auto', color: 'var(--za-fg-4)', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP: RECOMMENDATION --- */}
        {step === 'recommendation' && selectedModule && (
          <div>
            <button onClick={() => { setStep('survey'); setSelectedModuleId(null); setSelectedChallenge(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--za-fg-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '32px' }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} /> Andere Herausforderung wählen
            </button>

            {/* Recommendation header */}
            <div style={{ marginBottom: '36px' }}>
              <p style={{ fontSize: '14px', color: 'var(--za-gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Unsere Empfehlung für dich</p>
              <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--za-fg)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '8px' }}>
                {selectedModule.headline}
              </h1>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '999px', background: 'rgba(42,111,219,0.08)', marginTop: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--za-gold)' }}>{selectedModule.preisMonatlich} €</span>
                <span style={{ fontSize: '14px', color: 'var(--za-fg-3)' }}>/ Monat</span>
              </div>
            </div>

            {/* Problem */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--za-danger)', marginBottom: '10px' }}>Das Problem</h3>
              <p style={{ fontSize: '17px', color: 'var(--za-fg)', lineHeight: 1.7 }}>{selectedModule.problem}</p>
            </div>

            {/* Solution */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--za-success)', marginBottom: '10px' }}>Die Lösung</h3>
              <p style={{ fontSize: '17px', color: 'var(--za-fg)', lineHeight: 1.7 }}>{selectedModule.solution}</p>
            </div>

            {/* Impact */}
            <div style={{ background: 'rgba(42,111,219,0.05)', border: '1px solid rgba(42,111,219,0.15)', borderRadius: '14px', padding: '24px', marginBottom: '28px' }}>
              <p style={{ fontSize: '18px', color: 'var(--za-fg)', fontWeight: 600, lineHeight: 1.6 }}>
                📈 {selectedModule.impact}
              </p>
            </div>

            {/* Example */}
            <div style={{ background: 'var(--za-surface)', border: '1px solid var(--za-border)', borderRadius: '14px', padding: '24px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--za-fg-3)', marginBottom: '12px' }}>Beispiel aus der Praxis</h3>
              <p style={{ fontSize: '15px', color: 'var(--za-fg)', fontWeight: 600, marginBottom: '6px' }}>{selectedModule.example.business}</p>
              <p style={{ fontSize: '16px', color: 'var(--za-fg-2)', lineHeight: 1.7 }}>{selectedModule.example.result}</p>
            </div>

            {/* Features */}
            <div style={{ marginBottom: '36px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--za-fg-3)', marginBottom: '14px' }}>Das ist enthalten</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedModule.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '16px', color: 'var(--za-fg)' }}>
                    <Check style={{ width: '20px', height: '20px', color: 'var(--za-success)', flexShrink: 0, marginTop: '2px' }} />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <button onClick={() => setStep('checkout')}
              style={{
                width: '100%', padding: '18px', background: 'var(--za-gold-grad)', color: '#fff',
                border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                boxShadow: '0 8px 24px -4px rgba(42,111,219,0.4)', transition: 'transform 200ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget).style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e) => { (e.currentTarget).style.transform = 'translateY(0)' }}>
              Jetzt {selectedModule.name} buchen <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        )}

        {/* --- STEP: CHECKOUT --- */}
        {step === 'checkout' && selectedModule && (
          <div>
            <button onClick={() => setStep('recommendation')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--za-fg-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '32px' }}>
              <ArrowLeft style={{ width: '16px', height: '16px' }} /> Zurück zur Übersicht
            </button>

            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <p style={{ fontSize: '14px', color: 'var(--za-gold)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Bestellung</p>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--za-fg)', letterSpacing: '-0.02em' }}>{selectedModule.name}</h1>
            </div>

            {/* Summary card */}
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--za-border)', padding: '32px', marginBottom: '24px' }}>
              {/* Features compact */}
              <div style={{ marginBottom: '24px' }}>
                {selectedModule.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', fontSize: '15px', color: 'var(--za-fg)', borderBottom: i < selectedModule.features.length - 1 ? '1px solid var(--za-border)' : 'none' }}>
                    <Check style={{ width: '16px', height: '16px', color: 'var(--za-success)', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>

              {/* Price */}
              <div style={{ borderTop: '2px solid var(--za-border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                  <span style={{ color: 'var(--za-fg-3)' }}>Monatlich netto</span>
                  <span style={{ fontWeight: 600 }}>{fmt(netto)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '15px' }}>
                  <span style={{ color: 'var(--za-fg-3)' }}>zzgl. 19% MwSt.</span>
                  <span style={{ color: 'var(--za-fg-3)' }}>{fmt(mwst)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--za-border)' }}>
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>Gesamtbetrag / Monat</span>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--za-gold)' }}>{fmt(brutto)} €</span>
                </div>
              </div>
            </div>

            {/* Contract info */}
            <div style={{ background: 'var(--za-surface)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', fontSize: '13px', color: 'var(--za-fg-3)', lineHeight: 1.7 }}>
              Mindestvertragslaufzeit: {CONTRACT_MONTHS} Monate. Die Abrechnung erfolgt monatlich im Voraus. Die Kündigungsfrist beträgt 3 Monate vor Ablauf.
            </div>

            {/* Checkbox */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '15px', color: 'var(--za-fg)', marginBottom: '24px', padding: '16px', borderRadius: '12px', border: '1px solid var(--za-border)', background: agbAccepted ? 'rgba(42,111,219,0.04)' : 'transparent' }}>
              <input type="checkbox" checked={agbAccepted} onChange={(e) => setAgbAccepted(e.target.checked)}
                style={{ marginTop: '3px', accentColor: '#2563eb', width: '18px', height: '18px' }} />
              <span>Ich akzeptiere die <a href="#" style={{ color: 'var(--za-gold)', textDecoration: 'underline' }}>Geschäftsbedingungen</a> und die <a href="#" style={{ color: 'var(--za-gold)', textDecoration: 'underline' }}>AVV</a></span>
            </label>

            {/* Order button */}
            <button onClick={handleOrder} disabled={!agbAccepted || submitting}
              style={{
                width: '100%', padding: '18px', borderRadius: '14px', fontSize: '18px', fontWeight: 700,
                border: 'none', cursor: agbAccepted ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: agbAccepted ? '#10b981' : '#d1d5db', color: '#fff',
                transition: 'all 200ms',
              }}>
              {submitting ? (
                <><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} /> Wird bestellt...</>
              ) : (
                <><Check style={{ width: '20px', height: '20px' }} /> Zahlungspflichtig bestellen</>
              )}
            </button>

            {error && (
              <div style={{ marginTop: '16px', padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '14px', color: '#dc2626' }}>
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
