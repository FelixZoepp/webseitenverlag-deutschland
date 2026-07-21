/**
 * Premium-Komposition „scrub-story-v1" — PV-Seed „Solarflow" (Musterbetrieb).
 *
 * Szenen-Copy 1:1 aus dem Guide „Scroll-Scrub PV Website" (Kapitel Beispiel-
 * Szenen). Farbpalette = Guide-Werte (bg #07090c, Sonnengelb #f5ff5a,
 * Cyan #00e5ff). Meta-Felder (Firma/Ort/Telefon) sind Musterdaten und werden
 * bei echten Kunden VERBATIM aus business_profiles ersetzt — nie LLM.
 *
 * frames ist im Seed absichtlich NICHT gesetzt: ohne generierte Assets rendert
 * die Komposition den statischen Poster-Modus. Die Frame-Sequenz (240 Bilder)
 * entsteht erst aus den 5 Higgsfield-Clips (rezepte/REZEPTE_SCRUB_PV.md).
 */

import type { ScrubConfig } from './types'

export const scrubStorySeed: ScrubConfig = {
  engine: 'flagship',
  komposition: 'scrub-story-v1',
  branche_key: 'pv',
  meta: {
    firma: 'Solarflow',
    ort: 'Osnabrück',
    telefon: '0541 000000',
    email: 'info@solarflow-energie.de',
    gegruendet: '2015',
    seo_titel: 'Solarflow — Dein Solarstrom',
    seo_beschreibung:
      'Photovoltaik aus Osnabrück: Von der Sonne über Module, Wechselrichter und Speicher bis zu deinem Zuhause — eine Anlage, ein Kreislauf, ein Ansprechpartner.',
  },
  design: {
    basis: '#07090c',
    text: '#f0f4f8',
    text_soft: '#7a8a9a',
    akzent1: '#f5ff5a',
    akzent2: '#00e5ff',
  },
  inhalte: {
    header: { logo_text: 'Solarflow', cta_label: 'Angebot anfordern' },
    hinweis: 'Scrollen zum Entdecken',
    szenen: [
      {
        label: 'Sonne',
        kicker: 'Schritt 01 — Die Energiequelle',
        titel: 'Die Sonne. Unbegrenzt. Kostenlos.',
        text: 'Jede Stunde erreicht die Erde mehr Sonnenenergie, als die gesamte Weltbevölkerung in einem Jahr verbraucht.',
        tags: ['100% erneuerbar', 'Kostenlos'],
        scroll: 1.6,
        align: 'left',
        poster: {
          label: 'PV Szene 1 — Abendhaus mit Solardach',
          alt: 'Modernes Haus mit Photovoltaik-Dach in der Abenddämmerung, Sonne hinter dem First',
        },
      },
      {
        label: 'Module',
        kicker: 'Schritt 02 — Die Ernte',
        titel: 'Hocheffiziente Module, die leuchten.',
        text: 'Bis zu 23 % Wirkungsgrad: Jede Zelle wandelt Licht direkt in Strom — leise, wartungsarm, Jahrzehnte lang.',
        tags: ['23% Wirkungsgrad', '25 Jahre Garantie'],
        scroll: 1.4,
        align: 'right',
        poster: {
          label: 'PV Szene 2 — Modul-Nahaufnahme',
          alt: 'Extreme Nahaufnahme goldglühender Solarzellen',
        },
      },
      {
        label: 'Strom',
        kicker: 'Schritt 03 — Die Umwandlung',
        titel: 'Von Gleichstrom zu Haushaltsstrom.',
        text: 'Der Wechselrichter macht aus Sonnenstrom nutzbaren Haushaltsstrom — mit bis zu 98 % Effizienz, überwacht in Echtzeit.',
        tags: ['98% Effizienz', 'Smart Monitoring'],
        scroll: 1.3,
        align: 'left',
        poster: {
          label: 'PV Szene 3 — Stromfluss durch Kabel',
          alt: 'Cyanfarbene Stromströme fließen entlang von Kupferkabeln',
        },
      },
      {
        label: 'Haus',
        kicker: 'Schritt 04 — Dein Zuhause',
        titel: 'Dein Haus. Erleuchtet.',
        text: 'Kühlschrank, Herd, Licht, Wallbox: Dein eigener Strom versorgt alles, was zu Hause läuft — Raum für Raum.',
        tags: ['Autark bis 70%', 'Wallbox ready'],
        scroll: 1.4,
        align: 'right',
        poster: {
          label: 'PV Szene 4 — Haus erwacht',
          alt: 'Haus in der Dämmerung, Fenster leuchten warm auf',
        },
      },
      {
        label: 'Speicher',
        kicker: 'Schritt 05 — Die Sicherheit',
        titel: 'Speicher, der für die Nacht bleibt.',
        text: 'Überschüssiger Strom wandert in den Speicher — und versorgt dein Zuhause, wenn die Sonne längst untergegangen ist.',
        tags: ['Bis 15 kWh', '10 Jahre Garantie'],
        scroll: 1.8,
        align: 'left',
        poster: {
          label: 'PV Szene 5 — Batteriespeicher',
          alt: 'Batteriespeicher mit cyanfarbenen LED-Ladeanzeigen neben Wechselrichter',
        },
        aktionen: [
          { label: 'Angebot anfordern', href: '#kontakt', variante: 'primaer' },
          { label: 'Mehr erfahren', href: '#kontakt', variante: 'sekundaer' },
        ],
      },
    ],
    kontakt: {
      pill: 'Kostenlos & unverbindlich',
      h2: 'Dein Dach. Dein Strom. Dein Angebot.',
      lead: 'Schick uns kurz deine Daten — wir melden uns innerhalb von 24 Stunden mit einer ersten Einschätzung für dein Dach.',
      cta_label: 'Angebot anfordern',
    },
    footer: {
      beschreibung:
        'Solarflow plant, installiert und wartet Photovoltaik-Anlagen mit Speicher — vom ersten Dach-Check bis zur fertigen Anlage.',
      links: [
        { label: 'Impressum', anker: '#impressum' },
        { label: 'Datenschutz', anker: '#datenschutz' },
      ],
    },
  },
  funnel: {
    modus: 'anfrage',
    leistungen: ['Photovoltaik-Anlage', 'Batteriespeicher', 'Wallbox', 'Wartung & Service'],
    erfolg_text: 'Danke! Wir melden uns innerhalb von 24 Stunden.',
  },
  herkunft: { generator: 'scrub-story-v1/seed' },
}
