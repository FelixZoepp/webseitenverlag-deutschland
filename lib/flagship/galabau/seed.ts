/**
 * Auftrag T1.4 — Flagship-Texte (GrünWerk Wiesbaden) als Slot-Defaults.
 *
 * Alle Texte VERBATIM aus GalabauLanding.dc.html — sie sind zugleich die
 * Referenzlänge für die Zeichenlimits (copy-slots.ts: Limit = Länge + 15%).
 */

import type { GalabauConfig } from './types'

export const galabauLandingSeed: GalabauConfig = {
  engine: 'flagship',
  komposition: 'galabau-landing-v1',
  branche_key: 'galabau',
  frozen: true,
  meta: {
    firma: 'GrünWerk Garten- & Landschaftsbau',
    ort: 'Wiesbaden',
    telefon: '0611 000000',
    email: 'info@gruenwerk-wiesbaden.de',
    gegruendet: '2009',
    seo_titel: 'GrünWerk Garten- & Landschaftsbau – Wiesbaden',
    seo_beschreibung:
      'Planung, Pflasterarbeiten und Pflege aus einer Hand – für private Gärten und Außenanlagen in Wiesbaden, Mainz und dem Rheingau.',
  },
  inhalte: {
    header: {
      logo_text: 'Grün',
      logo_bold: 'Werk',
      links: [
        { label: 'Leistungen', anker: '#leistungen' },
        { label: 'Referenzen', anker: '#referenzen' },
        { label: 'Team', anker: '#team' },
        { label: 'FAQ', anker: '#faq' },
        { label: 'Kontakt', anker: '#kontakt' },
      ],
      cta_label: 'Rückruf anfordern',
    },
    hero: {
      badge: 'Meisterbetrieb im Garten- & Landschaftsbau',
      h1: 'Ihr Garten. Nur besser.',
      lead:
        'Planung, Pflasterarbeiten und Pflege aus einer Hand – für private Gärten und Außenanlagen in Wiesbaden, Mainz und dem Rheingau. Festpreis nach Besichtigung, Termin innerhalb einer Woche.',
      cta_primaer: 'Kostenlose Besichtigung sichern',
      cta_sekundaer: 'Leistungen ansehen',
      media: { label: 'Hero: Gartenanlage am Abend' },
      review: {
        text:
          '„GrünWerk hat unseren Hang in zwei Wochen in eine Terrassenlandschaft verwandelt. Sauber, pünktlich, Festpreis gehalten."',
        name: 'Familie K., Wiesbaden-Sonnenberg',
      },
    },
    ueber: {
      pill: 'Über GrünWerk',
      zitat:
        '„Seit 2009 bauen wir Gärten, die im dritten Sommer besser aussehen als am Abnahmetag — weil wir pflanzen, was hierher gehört, und bauen, was hält."',
      name: 'Thomas Berger',
      rolle: 'Inhaber & Landschaftsgärtnermeister',
      media: { label: 'Detail: Hände bei der Pflanzarbeit' },
    },
    leistungen: {
      pill: 'Leistungen',
      h2: 'Was wir für Sie bauen',
      lead: 'Von der ersten Skizze bis zur jährlichen Pflege – alles aus einer Hand.',
      karten: [
        {
          kategorie: 'Planung',
          name: 'Gartenplanung',
          titel: 'Vom Aufmaß zum 3D-Entwurf',
          text:
            'Wir planen Ihren Garten am Bestand: Licht, Boden, Blickachsen. Sie sehen vorab, was entsteht – inklusive Pflanzplan und Festpreisangebot.',
          media: { label: 'Leistung: Gartenplanung' },
        },
        {
          kategorie: 'Bau',
          name: 'Pflaster- & Terrassenbau',
          titel: 'Wege, Terrassen, Einfahrten',
          text:
            'Naturstein, Betonstein oder Keramik – frostsicher gegründet, millimetergenau verlegt, mit sauberen Rändern.',
          media: { label: 'Leistung: Pflaster- & Terrassenbau' },
        },
        {
          kategorie: 'Pflege',
          name: 'Gartenpflege',
          titel: 'Ganzjährig gepflegt',
          text:
            'Schnitt, Rasen, Beete, Laub: Wir halten Ihre Anlage in Form – auf Wunsch im planbaren Jahresvertrag.',
          media: { label: 'Leistung: Gartenpflege' },
        },
        {
          kategorie: 'Technik',
          name: 'Bewässerung',
          titel: 'Automatisch versorgt',
          text: 'Smarte Tropf- und Sprühbewässerung, die Wasser spart und im Urlaub übernimmt.',
          media: { label: 'Leistung: Bewässerung' },
        },
        {
          kategorie: 'Bau',
          name: 'Zaun- & Sichtschutzbau',
          titel: 'Privatsphäre mit System',
          text: 'Zäune, Gabionen und Sichtschutz – gerade gesetzt, sauber betoniert, langlebig.',
          media: { label: 'Leistung: Zaun- & Sichtschutzbau' },
        },
      ],
    },
    warum: {
      h2: 'Warum GrünWerk',
      lead: 'Woran Sie den Unterschied sehen.',
      karten: [
        {
          titel: 'Meister-Handwerk',
          text: 'Landschaftsgärtnermeister auf jeder Baustelle – keine Subunternehmer-Kette.',
          media: { label: 'Warum: Meister-Handwerk' },
        },
        {
          titel: 'Heimische Pflanzen',
          text: 'Wir pflanzen, was in Rheingau-Klima und -Boden wirklich wächst.',
          media: { label: 'Warum: Heimische Pflanzen' },
        },
        {
          titel: 'Festpreis-Garantie',
          text: 'Angebot nach Besichtigung. Der Preis, der draufsteht, ist der Preis, den Sie zahlen.',
          media: { label: 'Warum: Festpreis-Garantie' },
        },
      ],
    },
    referenzen: {
      pill: 'Referenzen',
      h2: 'Sehen Sie selbst.',
      lead: 'Ziehen Sie den Regler – echte Projekte aus Wiesbaden und Umgebung.',
      ba_nachher: { label: 'Nachher: fertiger Garten' },
      ba_vorher: { label: 'Vorher: Baustelle' },
      tag_vorher: 'VORHER',
      tag_nachher: 'NACHHER',
      caption: 'Hanggarten mit Natursteinterrassen · Wiesbaden-Sonnenberg · Bauzeit 3 Wochen',
      kpis: [
        { zahl: 480, suffix: '+', label: 'Projekte' },
        { zahl: 15, label: 'Jahre' },
        { zahl: 4.9, dezimal: true, suffix: '★', label: 'Google (86 Bewertungen)' },
        { zahl: 12, label: 'Mitarbeiter' },
      ],
    },
    team: {
      pill: 'Unser Team',
      h2: 'Die Menschen hinter GrünWerk',
      mitglieder: [
        { name: 'Thomas Berger', rolle: 'Inhaber & Meister', media: { label: 'Team: Thomas Berger' } },
        { name: 'Sandra Berger', rolle: 'Planung & Angebote', media: { label: 'Team: Sandra Berger' } },
        { name: 'Miguel Costa', rolle: 'Vorarbeiter Pflasterbau', media: { label: 'Team: Miguel Costa' } },
      ],
    },
    cta_band: {
      pill: 'Von Nachbarn empfohlen',
      h2: 'Über 480 Gärten in Wiesbaden und dem Rheingau tragen unsere Handschrift.',
      cta_label: 'Jetzt Besichtigung anfragen',
      avatare: [
        { label: 'Avatar 1' },
        { label: 'Avatar 2' },
        { label: 'Avatar 3' },
        { label: 'Avatar 4' },
      ],
    },
    faq: {
      h2: 'Häufige Fragen',
      paare: [
        {
          frage: 'Was kostet ein neuer Garten?',
          antwort:
            'Das hängt vom Umfang ab. Nach der kostenlosen Besichtigung erhalten Sie ein schriftliches Festpreisangebot – die meisten Projekte liegen zwischen 8.000 und 60.000 €.',
        },
        {
          frage: 'Wie lange dauert ein Projekt?',
          antwort:
            'Eine Terrasse dauert etwa 1–2 Wochen, ein kompletter Garten 3–6 Wochen – den genauen Zeitplan bekommen Sie mit dem Angebot.',
        },
        {
          frage: 'Übernehmt ihr auch nur die Pflege?',
          antwort:
            'Ja – auch ohne vorherigen Umbau. Viele Kunden starten mit einem Pflegevertrag und lassen später umbauen.',
        },
        {
          frage: 'Arbeitet ihr mit Festpreisen?',
          antwort:
            'Ja. Nach der Besichtigung erhalten Sie ein schriftliches Festpreisangebot – der Preis, der draufsteht, ist der Preis, den Sie zahlen.',
        },
        {
          frage: 'Welche Region deckt ihr ab?',
          antwort: 'Wiesbaden, Mainz und den Rheingau – bis etwa 40 km um unseren Betriebshof.',
        },
        {
          frage: 'Bekomme ich einen Pflanzplan?',
          antwort: 'Ja – mit Pflegehinweisen fürs erste Jahr, damit alles anwächst wie geplant.',
        },
      ],
    },
    kontakt: {
      pill: 'Kontakt',
      h2: 'Kostenlose Besichtigung anfragen',
      lead: 'Erzählen Sie uns kurz von Ihrem Projekt – wir melden uns innerhalb von 24 Stunden.',
      cta_label: 'Anfrage senden',
      media: { label: 'Kontakt: Team vor Ort' },
    },
    footer: {
      beschreibung:
        'Garten- & Landschaftsbau für Wiesbaden, Mainz und den Rheingau – seit 2009 in Familienhand.',
    },
  },
  funnel: {
    modus: 'anfrage',
    leistungen: [
      'Gartenplanung',
      'Pflaster- & Terrassenbau',
      'Gartenpflege',
      'Bewässerung',
      'Zaun- & Sichtschutzbau',
    ],
    erfolg_text: 'Danke! Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
  },
  herkunft: { generator: 'seed:galabau-landing-v1', quellen: ['GalabauLanding.dc.html'] },
}
