/**
 * Template-Fabrik B2 — Seed der Komposition „maler-landing-v1".
 *
 * Alle Texte aus dem freigegebenen Steckbrief (branchen/maler/STECKBRIEF.md,
 * Freigabe Felix 2026-07-21). Sie sind zugleich die Referenzlänge für die
 * Zeichenlimits (copy-slots.ts: Limit = Länge + 15 %).
 * meta.firma/ort/telefon VERBATIM — nie LLM-formuliert.
 * frozen:true seit der B5-Optik-Freigabe (Felix 2026-07-22, „gib alle frei").
 */

import type { MalerConfig } from './types'

export const malerLandingSeed: MalerConfig = {
  engine: 'flagship',
  komposition: 'maler-landing-v1',
  branche_key: 'maler',
  frozen: true,
  meta: {
    firma: 'Voss Maler & Lackierer Meisterbetrieb',
    ort: 'Osnabrück',
    telefon: '0541 000000',
    email: 'info@maler-voss.de',
    gegruendet: '2004',
    seo_titel: 'Voss Maler & Lackierer Meisterbetrieb – Osnabrück',
    seo_beschreibung:
      'Innenanstrich, Fassade, Lackier- und Tapezierarbeiten für Osnabrück, Belm und Georgsmarienhütte. Meisterbetrieb seit 2004, Festpreis nach Aufmaß.',
  },
  inhalte: {
    header: {
      logo_text: 'Voss',
      logo_bold: 'Maler',
      links: [
        { label: 'Leistungen', anker: '#leistungen' },
        { label: 'Referenzen', anker: '#referenzen' },
        { label: 'Team', anker: '#team' },
        { label: 'FAQ', anker: '#faq' },
        { label: 'Kontakt', anker: '#kontakt' },
      ],
      cta_label: 'Aufmaß anfragen',
    },
    hero: {
      badge: 'Meisterbetrieb für Maler- & Lackierarbeiten',
      h1: 'Frische Wände. Saubere Arbeit.',
      lead:
        'Innenanstrich, Fassade, Lack und Spachteltechnik für Osnabrück, Belm und Georgsmarienhütte. Festpreis nach Aufmaß, abgedeckte Böden, besenreine Übergabe.',
      cta_primaer: 'Kostenloses Aufmaß sichern',
      cta_sekundaer: 'Leistungen ansehen',
      media: { label: 'Hero: Frisch gestrichener Wohnraum im Abendlicht' },
      review: {
        text:
          '„Voss hat unser komplettes Erdgeschoss in vier Tagen gestrichen — abgeklebt, abgedeckt, besenrein übergeben. Der Festpreis stand."',
        name: 'Familie B., Osnabrück-Westerberg',
      },
    },
    wand: {
      pill: 'Unsere Handschrift',
      h2: 'Von Altweiß zu Ihrer Wunschfarbe.',
      text:
        'Eine Rolle, eine Bahn, ein sauberer Abschluss — so entsteht jede Wand bei uns. Musterflächen streichen wir vorab, damit Sie den Ton im echten Licht Ihres Raumes sehen.',
      tag_von: 'Altweiß',
      tag_zu: 'Salbei',
    },
    ueber: {
      pill: 'Über Voss',
      zitat:
        '„Mein Vater hat mir beigebracht: Die Baustelle verlässt man sauberer, als man sie vorgefunden hat. Daran messen uns unsere Kunden — und daran halten wir uns."',
      name: 'Jörn Voss',
      rolle: 'Inhaber & Malermeister',
      media: { label: 'Detail: Hand mit Rolle an der Wand' },
    },
    leistungen: {
      pill: 'Leistungen',
      h2: 'Was wir für Sie streichen',
      lead: 'Vom Wohnzimmer bis zur Fassade – alles aus Meisterhand.',
      karten: [
        {
          kategorie: 'Wohnräume',
          name: 'Innenanstrich',
          titel: 'Farbe, die Räume verändert.',
          text:
            'Wände und Decken streichen wir staubarm, mit sauberen Kanten und abgedeckten Böden. Nach zwei Tagen sieht Ihr Wohnzimmer aus wie neu bezogen — ohne Renovierungschaos.',
          media: { label: 'Leistung: Innenanstrich' },
        },
        {
          kategorie: 'Außen',
          name: 'Fassadenanstrich',
          titel: 'Der erste Eindruck Ihres Hauses.',
          text:
            'Fassaden reinigen, grundieren und streichen wir mit witterungsbeständigen Silikonharzfarben. Gerüst, Abdeckung und Nachbarschafts-Info organisieren wir komplett mit.',
          media: { label: 'Leistung: Fassadenanstrich' },
        },
        {
          kategorie: 'Türen & Holz',
          name: 'Lackierarbeiten',
          titel: 'Alte Türen, neuer Glanz.',
          text:
            'Türen, Zargen, Heizkörper und Fensterrahmen lackieren wir spritz- oder streichlackiert im eigenen Betrieb oder vor Ort. Alte Substanz bleibt erhalten — das spart den teuren Austausch.',
          media: { label: 'Leistung: Lackierarbeiten' },
        },
        {
          kategorie: 'Wandgestaltung',
          name: 'Tapezierarbeiten',
          titel: 'Von Raufaser bis Designtapete.',
          text:
            'Wir entfernen Alttapeten, spachteln Untergründe glatt und tapezieren passgenau — auch Muster- und Vliestapeten mit Ansatz. Beratung zu Material und Muster gibt es beim Aufmaß dazu.',
          media: { label: 'Leistung: Tapezierarbeiten' },
        },
        {
          kategorie: 'Premium',
          name: 'Spachteltechnik',
          titel: 'Wände wie aus einem Guss.',
          text:
            'Kalk-, Beton- und Marmorspachtel für fugenlose, lebendige Oberflächen in Bad, Küche und Wohnraum. Jede Wand ist Handarbeit und ein Unikat — Musterflächen zeigen wir vorab.',
          media: { label: 'Leistung: Spachteltechnik' },
        },
      ],
    },
    warum: {
      h2: 'Warum Voss',
      lead: 'Woran Sie den Unterschied sehen.',
      karten: [
        {
          titel: 'Meisterbetrieb seit 2004',
          text:
            'Malermeister auf jeder Baustelle — Ausbildungsbetrieb der Handwerkskammer Osnabrück-Emsland-Grafschaft Bentheim.',
          media: { label: 'Warum: Meisterbetrieb' },
        },
        {
          titel: 'Sauberkeit ist Vertragsbestandteil',
          text:
            'Böden, Möbel und Treppenhäuser werden vollflächig abgedeckt; die Endreinigung ist im Angebot ausgewiesen, nicht „nach Aufwand".',
          media: { label: 'Warum: Sauberkeit' },
        },
        {
          titel: 'Festpreis nach Aufmaß',
          text:
            'Wir messen vor Ort, das Angebot gilt verbindlich; Mehrkosten nur nach vorheriger Absprache in Textform.',
          media: { label: 'Warum: Festpreis' },
        },
      ],
    },
    referenzen: {
      pill: 'Referenzen',
      h2: 'Sehen Sie selbst.',
      lead: 'Ziehen Sie den Regler – echte Projekte aus Osnabrück und Umgebung.',
      ba_nachher: { label: 'Nachher: frisch gestrichenes, helles Zimmer' },
      ba_vorher: { label: 'Vorher: vergilbtes, abgewohntes Zimmer' },
      tag_vorher: 'VORHER',
      tag_nachher: 'NACHHER',
      caption: 'Komplettrenovierung Wohnzimmer · Osnabrück-Westerberg · 2 Arbeitstage',
      kpis: [
        { zahl: 20, suffix: '+', label: 'Jahre Meisterbetrieb' },
        { zahl: 900, suffix: '+', label: 'Projekte in und um Osnabrück' },
        { zahl: 4.9, dezimal: true, suffix: '★', label: 'Durchschnittsbewertung' },
        { zahl: 100, suffix: '%', label: 'Festpreis nach Aufmaß' },
      ],
    },
    galerie: {
      pill: 'Galerie',
      h2: 'Frisch gestrichene Projekte',
      lead: 'Innenräume, Fassaden, Lack und Spachteltechnik – ein Blick auf fertige Arbeiten.',
      bilder: [
        { media: { label: 'Galerie: Wohnzimmer in Salbei' }, kategorie: 'Innen' },
        { media: { label: 'Galerie: Helles Schlafzimmer' }, kategorie: 'Innen' },
        { media: { label: 'Galerie: Frische Putzfassade' }, kategorie: 'Fassade' },
        { media: { label: 'Galerie: Lackierte Altbautür' }, kategorie: 'Lack' },
        { media: { label: 'Galerie: Kalkspachtel im Bad' }, kategorie: 'Spachteltechnik' },
        { media: { label: 'Galerie: Betonspachtel-Wand' }, kategorie: 'Spachteltechnik' },
      ],
    },
    team: {
      pill: 'Unser Team',
      h2: 'Die Menschen hinter Voss',
      mitglieder: [
        { name: 'Jörn Voss', rolle: 'Inhaber & Malermeister', media: { label: 'Team: Jörn Voss' } },
        { name: 'Heinrich Voss', rolle: 'Seniorchef & Lackierermeister', media: { label: 'Team: Heinrich Voss' } },
        { name: 'Lena Schröder', rolle: 'Büro & Terminplanung', media: { label: 'Team: Lena Schröder' } },
      ],
    },
    cta_band: {
      pill: 'Von Nachbarn empfohlen',
      h2: 'Über 900 Projekte in Osnabrück, Belm und Georgsmarienhütte tragen unsere Handschrift.',
      cta_label: 'Jetzt Aufmaß anfragen',
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
          frage: 'Was kostet ein Innenanstrich?',
          antwort:
            'Je nach Untergrund und Farbe meist 8–15 €/m² Wandfläche. Ein normales Wohnzimmer (ca. 60 m² Wand/Decke) liegt damit grob bei 600–1.100 € — genau wird es nach dem kostenlosen Aufmaß.',
        },
        {
          frage: 'Was kostet ein Fassadenanstrich?',
          antwort:
            'Inklusive Reinigung und Grundierung meist 25–45 €/m² Fassadenfläche, plus Gerüst. Ein Einfamilienhaus liegt je nach Zustand oft zwischen 4.000 und 9.000 €.',
        },
        {
          frage: 'Lohnt sich Türen lackieren statt austauschen?',
          antwort:
            'Meist ja: Eine Tür inkl. Zarge lackieren kostet je nach Zustand 150–350 €, eine neue Innentür mit Einbau schnell das Doppelte. Bei stark beschädigten Türen sagen wir ehrlich, wenn Austausch günstiger ist.',
        },
        {
          frage: 'Wie lange dauert das Streichen einer Wohnung?',
          antwort:
            'Eine 3-Zimmer-Wohnung schaffen wir in der Regel in 3–5 Arbeitstagen inklusive Trocknungszeiten — bewohnbar bleibt sie währenddessen fast immer.',
        },
        {
          frage: 'Muss ich die Möbel ausräumen?',
          antwort:
            'Nein. Wir rücken Möbel in die Raummitte und decken alles staubdicht ab. Nur sehr volle Räume bitten wir vorab etwas zu leeren.',
        },
        {
          frage: 'Arbeitet ihr auch mit schadstoffarmen Farben?',
          antwort:
            'Ja, standardmäßig ELF-Farben (emissionsarm, lösemittel- und weichmacherfrei); für Allergiker und Kinderzimmer auch Silikat- und Kalkfarben — Mehrpreis meist 1–3 €/m².',
        },
      ],
    },
    kontakt: {
      pill: 'Kontakt',
      h2: 'Kostenloses Aufmaß anfragen',
      lead: 'Erzählen Sie uns kurz von Ihrem Projekt – wir melden uns innerhalb von 24 Stunden.',
      cta_label: 'Anfrage senden',
      media: { label: 'Kontakt: Malermeister beim Aufmaß' },
    },
    footer: {
      beschreibung:
        'Maler- & Lackierarbeiten für Osnabrück, Belm und Georgsmarienhütte — Meisterbetrieb in zweiter Generation seit 2004.',
    },
    module: {
      whatsapp: true,
      rueckruf: true,
      datei_anhang: true,
      einzugsgebiet: {
        h2: 'Unser Einzugsgebiet',
        lead: 'Kurze Wege, verlässliche Termine — wir arbeiten dort, wo wir zuhause sind.',
        orte: ['Osnabrück', 'Belm', 'Georgsmarienhütte'],
      },
      // reviews bewusst NICHT gesetzt: nur echte Google-Reviews, nie erfunden
    },
    leistung_details: [
      {
        slug: 'innenanstrich',
        intro:
          'Wände und Decken streichen wir staubarm und mit sauberen Kanten — Möbel bleiben im Raum, Böden werden vollflächig abgedeckt. Das Ergebnis: frische Räume ohne Renovierungschaos.',
        faq: [
          {
            frage: 'Was kostet ein Innenanstrich?',
            antwort:
              'Je nach Untergrund und Farbe meist 8–15 €/m² Wandfläche. Ein normales Wohnzimmer liegt grob bei 600–1.100 € — genau wird es nach dem kostenlosen Aufmaß.',
          },
          {
            frage: 'Muss ich die Möbel ausräumen?',
            antwort:
              'Nein. Wir rücken Möbel in die Raummitte und decken alles staubdicht ab. Nur sehr volle Räume bitten wir vorab etwas zu leeren.',
          },
          {
            frage: 'Welche Farben verwendet ihr?',
            antwort:
              'Standardmäßig ELF-Farben (emissionsarm, lösemittel- und weichmacherfrei); für Allergiker und Kinderzimmer auch Silikat- und Kalkfarben.',
          },
        ],
        cta_label: 'Innenanstrich anfragen',
      },
      {
        slug: 'fassadenanstrich',
        intro:
          'Vom Gerüst über Reinigung und Grundierung bis zum Anstrich mit witterungsbeständigen Silikonharzfarben — wir organisieren den kompletten Fassadenanstrich inklusive Nachbarschafts-Info.',
        faq: [
          {
            frage: 'Was kostet ein Fassadenanstrich?',
            antwort:
              'Inklusive Reinigung und Grundierung meist 25–45 €/m² Fassadenfläche, plus Gerüst. Ein Einfamilienhaus liegt je nach Zustand oft zwischen 4.000 und 9.000 €.',
          },
          {
            frage: 'Wann ist die beste Jahreszeit für den Fassadenanstrich?',
            antwort:
              'Frühjahr bis Herbst bei trockener Witterung und über 5 °C — wir planen Puffer für Regentage ein, der Festpreis bleibt davon unberührt.',
          },
        ],
        cta_label: 'Fassadenanstrich anfragen',
      },
      {
        slug: 'lackierarbeiten',
        intro:
          'Türen, Zargen, Heizkörper und Fensterrahmen lackieren wir spritz- oder streichlackiert — im eigenen Betrieb oder vor Ort. Alte Substanz bleibt erhalten, das spart den teuren Austausch.',
        faq: [
          {
            frage: 'Lohnt sich Türen lackieren statt austauschen?',
            antwort:
              'Meist ja: Eine Tür inkl. Zarge lackieren kostet 150–350 €, eine neue Innentür mit Einbau schnell das Doppelte. Bei stark beschädigten Türen sagen wir ehrlich, wenn Austausch günstiger ist.',
          },
          {
            frage: 'Wie lange kann ich die Tür nicht benutzen?',
            antwort:
              'Vor Ort lackierte Türen sind meist nach einem Tag wieder nutzbar; im Betrieb spritzlackierte Türen hängen wir nach 3–5 Tagen fertig getrocknet wieder ein.',
          },
        ],
        cta_label: 'Lackierarbeiten anfragen',
      },
      {
        slug: 'tapezierarbeiten',
        intro:
          'Alttapeten entfernen, Untergründe glatt spachteln, passgenau tapezieren — auch Muster- und Vliestapeten mit Ansatz. Beratung zu Material und Muster gibt es beim Aufmaß dazu.',
        faq: [
          {
            frage: 'Entfernt ihr auch alte Tapeten?',
            antwort:
              'Ja, das Entfernen von Alttapeten und das Spachteln des Untergrunds gehören zum Angebot — beides weisen wir im Festpreis separat aus.',
          },
          {
            frage: 'Raufaser oder Vlies — was empfehlt ihr?',
            antwort:
              'Raufaser ist robust und günstig, Vlies lässt sich später trocken abziehen und ist ideal für glatte, moderne Wandbilder. Wir zeigen Ihnen Muster beim Aufmaß.',
          },
        ],
        cta_label: 'Tapezierarbeiten anfragen',
      },
      {
        slug: 'spachteltechnik',
        intro:
          'Kalk-, Beton- und Marmorspachtel für fugenlose, lebendige Oberflächen in Bad, Küche und Wohnraum. Jede Wand ist Handarbeit und ein Unikat — Musterflächen zeigen wir vorab.',
        faq: [
          {
            frage: 'Ist Spachteltechnik fürs Bad geeignet?',
            antwort:
              'Ja — Kalkspachtel ist von Natur aus schimmelhemmend und mit passender Versiegelung auch im Spritzwasserbereich einsetzbar. Für Duschen beraten wir zur richtigen Versiegelung.',
          },
          {
            frage: 'Was kostet Spachteltechnik?',
            antwort:
              'Je nach Technik und Fläche deutlich mehr als ein Anstrich — den genauen Preis nennen wir nach Musterfläche und Aufmaß im verbindlichen Festpreisangebot.',
          },
        ],
        cta_label: 'Spachteltechnik anfragen',
      },
    ],
  },
  funnel: {
    modus: 'anfrage',
    leistungen: [
      'Innenanstrich',
      'Fassadenanstrich',
      'Lackierarbeiten',
      'Tapezierarbeiten',
      'Spachteltechnik',
    ],
    erfolg_text: 'Danke! Wir melden uns innerhalb von 24 Stunden bei Ihnen.',
  },
  herkunft: { generator: 'seed:maler-landing-v1', quellen: ['branchen/maler/STECKBRIEF.md'] },
}
