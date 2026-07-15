/**
 * Flagship-Engine: Seed-Configs der beiden kanonischen Referenzen.
 * Inhalte 1:1 aus flagship_reinigung.html (ReiniFix) und
 * flagship_restaurant.html (PANE VINO) — DoD F2: beide Flagships
 * müssen aus der Library reproduzierbar sein.
 *
 * Asset-Slots ohne `datei`: gestalteter Platzhalter greift automatisch.
 */

import type { FlagshipConfig } from './types'

export const flagshipReinigungSeed: FlagshipConfig = {
  engine: 'flagship',
  branche_key: 'reinigung',
  meta_kategorie: 'reinigung_facility',
  meta: {
    firma: 'ReiniFix',
    ort: 'Berlin',
    seo_titel: 'Reinigungsfirma Berlin – ReiniFix | Fenster-, Bau- & Unterhaltsreinigung zum Festpreis',
    seo_beschreibung: 'Ihr Reinigungsdienst in Berlin: Fensterreinigung, Bauendreinigung, Unterhaltsreinigung & mehr. Festpreis in 24 h, versichert, 98 % Termintreue. Jetzt anfragen.',
  },
  design: {
    typo_modus: 'sans_bold_hell',
    typo_signature: 'wisch_highlight',
    tokens: {
      basis: '#F7FAF9',
      panel: '#E7F0EE',
      text: '#0B2E33',
      text_soft: '#33565C',
      akzent1: '#FFD348',
      akzent1_tief: '#F5B800',
      akzent2: '#2EC4B6',
      line: 'rgba(11,46,51,.14)',
    },
    akzent_begruendung: 'Gummihandschuh-Gelb als Branchenanker der Reinigung, Aqua als Wasser-Frische — beides auf kühlem Petrol/Weiß für den Eindruck klinischer Sauberkeit.',
  },
  inhalte: {
    nav: {
      logo_text: 'ReiniFix',
      links: [
        { label: 'Leistungen', anker: '#leistungen' },
        { label: 'Vorher / Nachher', anker: '#ergebnisse' },
        { label: 'Einsatzgebiet', anker: '#lokal' },
        { label: 'FAQ', anker: '#faq' },
      ],
      cta_label: 'Angebot in 24\u00a0h',
    },
    hero: {
      eyebrow: 'Reinigungsfirma für Ostberlin & ganz Berlin',
      headline_zeilen: ['Streifenfrei sauber.', 'Zum [[Festpreis]].'],
      lead: 'Fenster-, Bau- und Unterhaltsreinigung – geliefert von einem versicherten Team aus Lichtenberg. Sie beschreiben den Job, wir nennen den Festpreis. Innerhalb von 24\u00a0Stunden.',
      cta_label: 'Kostenloses Festpreisangebot',
      cta_sekundaer: { label: 'Leistungen ansehen', href: '#leistungen' },
      chips: ['Versichert', '98\u00a0% Termintreue', 'Keine versteckten Kosten'],
      chip_stil: 'check',
      media: { label: 'HERO – Reinigungskraft am Fenster', alt: 'ReiniFix Reinigungskraft bei der Fensterreinigung in einer Berliner Altbauwohnung' },
      stat1: { wert: '98\u00a0%', label: 'Termintreue' },
      stat2: { wert: '24\u00a0h', label: 'bis zum Festpreis' },
    },
    fakten: {
      punkte: [
        { text: 'Haftpflicht & Betriebshaftpflicht', icon: 'shield' },
        { text: 'Termin oft innerhalb einer Woche', icon: 'calendar' },
        { text: 'Angebot in 24\u00a0Stunden', icon: 'clock' },
        { text: 'Festpreis – garantiert', icon: 'badge' },
      ],
    },
    empathie: {
      eyebrow: 'Kennen Sie das?',
      headline: 'Der Bau ist fertig. Der [[Staub]] bleibt.',
      text: 'Nach Umbau, Umzug oder einfach im Alltag: Irgendwann kostet Schmutz mehr Nerven, als Putzen je bringen würde. Genau da übernehmen wir – mit Profi-Equipment, eingespieltem Team und einem Preis, der vorher feststeht.',
      variante: 'situationen',
      situationen: [
        'Bauendreinigung vor der Übergabe – besenrein reicht nicht',
        'Fenster im 3. Stock, außen – ohne Leiter-Abenteuer',
        'Übergabetermin nächste Woche, Wohnung noch im Umzugszustand',
        'Büro oder Praxis, die jede Woche zuverlässig sauber sein muss',
      ],
    },
    signature: {
      variante: 'wisch',
      eyebrow: 'Ein Wisch sagt mehr als tausend Worte',
      headline: 'Scrollen Sie den [[Schmutz]] einfach weg.',
      vorher: { label: 'VORHER – Wohnzimmer nach Renovierung', alt: 'Wohnzimmer vor der Baufeinreinigung' },
      nachher: { label: 'NACHHER – Baufeinreinigung durch ReiniFix', alt: 'Wohnzimmer nach der Baufeinreinigung', hintergrund: 'linear-gradient(160deg,#E7F0EE,#F7FAF9 60%,#CFF2EE)' },
      tag_vorher: 'VORHER',
      tag_nachher: 'NACHHER',
      cap: 'Baufeinreinigung einer 3-Zimmer-Wohnung · Berlin-Lichtenberg',
    },
    leistungen: {
      eyebrow: 'Reinigungsdienst in Berlin – unsere Leistungen',
      headline: 'Sechs Wege zu einem Ergebnis: [[sauber]].',
      stil: 'icons',
      karten: [
        { titel: 'Fensterreinigung', text: 'Scheiben, Rahmen, Dichtungen und Fensterbänke – innen wie außen. Streifenfrei, auch in oberen Etagen.', icon: 'window', link_label: 'Festpreis anfragen' },
        { titel: 'Bauendreinigung', text: 'Nach Neubau oder Sanierung: Schutt raus, Grobschmutz weg – Ihr Objekt wird bezugsfertig übergeben.', icon: 'building', link_label: 'Festpreis anfragen' },
        { titel: 'Baufeinreinigung', text: 'Der letzte Schliff: Klebereste, Staubfilm und Fugenreste verschwinden – bis auf Übergabestandard.', icon: 'sparkle', link_label: 'Festpreis anfragen' },
        { titel: 'Unterhaltsreinigung', text: 'Wohnung, Büro oder Praxis im festen Rhythmus – Sie kommen an, es ist sauber. Jede Woche. Immer.', icon: 'clock', link_label: 'Festpreis anfragen' },
        { titel: 'Umzugsreinigung', text: 'Ein- oder Auszug: Grundreinigung auf Übergabestandard, damit die Kaution bleibt, wo sie hingehört.', icon: 'bucket', link_label: 'Festpreis anfragen' },
        { titel: 'Polsterreinigung', text: 'Sofas, Stühle, Matratzen: Flecken und Gerüche raus – materialschonend und gründlich zugleich.', icon: 'sofa', link_label: 'Festpreis anfragen' },
      ],
    },
    ablauf: {
      eyebrow: 'So läuft die Zusammenarbeit',
      headline: 'In fünf Schritten zum [[Glanz]].',
      schritte: [
        { titel: 'Anfrage', text: 'In zwei Minuten beschrieben, was sauber werden soll – per Formular oder Anruf. Fotos helfen, sind aber kein Muss.', badge: 'Dauert 2 Minuten', icon: 'send' },
        { titel: 'Festpreis', text: 'Sie erhalten ein verbindliches Festpreisangebot – inklusive Anfahrt, Material und Mehrwertsteuer. Was wir nennen, gilt.', badge: 'Innerhalb von 24 Stunden', icon: 'wallet' },
        { titel: 'Termin', text: 'Wir bestätigen Ihren Wunschtermin – je nach Auslastung oft schon innerhalb einer Woche.', badge: '98\u00a0% Termintreue', icon: 'calendar' },
        { titel: 'Reinigung', text: 'Unser Team kommt pünktlich, mit komplettem Profi-Equipment – und arbeitet, bis es glänzt.', badge: 'Equipment inklusive', icon: 'sparkle' },
        { titel: 'Abnahme', text: 'Gemeinsamer Rundgang zum Schluss: Übergeben wird erst, wenn Sie rundum zufrieden sind.', badge: 'Zufriedenheitsgarantie', icon: 'check' },
      ],
    },
    ergebnisse: {
      eyebrow: 'Ergebnisse',
      headline: 'Ziehen Sie selbst den [[Vergleich]].',
      lead: 'Regler greifen und schieben – jedes Bildpaar zeigt denselben Ort, vor und nach unserem Einsatz.',
      variante: 'ba_slider',
      paare: [
        {
          vorher: { label: 'VORHER – Küche', alt: 'Küche vor der Grundreinigung' },
          nachher: { label: 'NACHHER – Küche', alt: 'Küche nach der Grundreinigung', hintergrund: 'linear-gradient(160deg,#E7F0EE,#F7FAF9 60%,#CFF2EE)' },
          caption: 'Küche · Grundreinigung',
        },
        {
          vorher: { label: 'VORHER – Fenster', alt: 'Fenster vor der Reinigung' },
          nachher: { label: 'NACHHER – Fenster', alt: 'Fenster nach der Reinigung', hintergrund: 'linear-gradient(160deg,#E7F0EE,#F7FAF9 60%,#CFF2EE)' },
          caption: 'Fenster · streifenfrei',
        },
      ],
    },
    zahlen: {
      items: [
        { wert: 500, suffix: '+', label: 'Einsätze in Berlin' },
        { wert: 98, suffix: '%', label: 'Termintreue' },
        { wert: 24, suffix: 'h', label: 'bis zum Festpreisangebot' },
        { wert: 6, label: 'Leistungsbereiche' },
      ],
    },
    stimmen: {
      eyebrow: 'Kundenstimmen',
      headline: 'Sauberkeit spricht sich [[herum]].',
      quotes: [
        { text: 'Nach dem Umbau dachten wir, die Fenster kriegt keiner mehr klar. ReiniFix kam, zwei Stunden später sah die Wohnung aus wie neu.', initialen: 'MT', name: 'Markus T.', meta: 'Bauendreinigung · Friedrichshain' },
        { text: 'Festpreis genannt, Festpreis gehalten. Pünktlich, freundlich, gründlich – so stellt man sich das vor.', initialen: 'SK', name: 'Sandra K.', meta: 'Umzugsreinigung · Pankow' },
        { text: 'Unser Büro wird jede Woche gereinigt, seit einem Jahr ohne einen einzigen Ausfall. Absolut zuverlässig.', initialen: 'JM', name: 'Jens M.', meta: 'Unterhaltsreinigung · Lichtenberg' },
      ],
    },
    lokal: {
      eyebrow: 'Einsatzgebiet',
      headline: 'Zuhause in [[Ostberlin]]. Im Einsatz in ganz Berlin.',
      variante: 'bezirke',
      chips: ['Lichtenberg', 'Friedrichshain', 'Prenzlauer Berg', 'Pankow', 'Marzahn-Hellersdorf', 'Treptow-Köpenick', 'Karlshorst', 'Weißensee', 'Hohenschönhausen', 'Mitte'],
      note: '… und nach Absprache im gesamten Berliner Stadtgebiet und Umland.',
    },
    faq: {
      eyebrow: 'Häufige Fragen',
      headline: 'Kurz [[geklärt]].',
      fragen: [
        { frage: 'Was kostet eine Reinigung bei ReiniFix?', antwort: 'Das hängt von Fläche, Verschmutzungsgrad und Leistung ab – deshalb nennen wir Ihnen nach Ihrer Anfrage einen verbindlichen Festpreis inklusive Anfahrt, Material und Mehrwertsteuer. Was wir nennen, gilt. Ohne Nachberechnung.' },
        { frage: 'Was ist der Unterschied zwischen Bauend- und Baufeinreinigung?', antwort: 'Die Bauendreinigung beseitigt den groben Schmutz nach Bauabschluss: Schutt, Staub, Verpackungsreste. Die Baufeinreinigung ist der letzte Schliff – Klebereste, Fingerabdrücke, Fugenreste und feinster Staubfilm verschwinden, bis das Objekt übergabefertig ist.' },
        { frage: 'Wie kurzfristig bekomme ich einen Termin?', antwort: 'Ihr Festpreisangebot erhalten Sie innerhalb von 24 Stunden, der Einsatztermin liegt je nach Auslastung oft innerhalb einer Woche. Bei dringenden Übergabeterminen sagen Sie uns einfach Bescheid – wir finden eine Lösung.' },
        { frage: 'Arbeiten Sie auch für Privatkunden?', antwort: 'Ja. Wir reinigen für Privathaushalte genauso wie für Gewerbe, Hausverwaltungen und Bauträger – vom Einfamilienhaus bis zum Bürogebäude.' },
        { frage: 'Bringt ReiniFix eigenes Material und Equipment mit?', antwort: 'Immer. Professionelle Reinigungsmittel, Maschinen und Zubehör sind im Festpreis enthalten. Sie müssen sich um nichts kümmern.' },
      ],
    },
    conversion: {
      eyebrow: 'Kontakt',
      headline: 'Ihr [[Festpreis]] wartet schon.',
      lead: 'Beschreiben Sie kurz, was sauber werden soll – wir antworten innerhalb von 24 Stunden mit einem verbindlichen Angebot.',
      cta_label: 'Kostenloses Festpreisangebot',
      trust: ['Festpreisangebot innerhalb 24\u00a0h', 'Geschultes & versichertes Team', 'Zufriedenheitsgarantie bei Übergabe'],
    },
    footer: {
      beschreibung: 'Reinigungsfirma Berlin: Fensterreinigung, Bauend- & Baufeinreinigung, Unterhalts-, Umzugs- und Polsterreinigung – zum Festpreis in allen Berliner Bezirken.',
      links: [
        { label: 'Leistungen', anker: '#leistungen' },
        { label: 'Ergebnisse', anker: '#ergebnisse' },
        { label: 'Kontakt', anker: '#kontakt' },
      ],
    },
  },
  funnel: {
    modus: 'anfrage',
    leistungen: ['Fensterreinigung', 'Bauendreinigung', 'Baufeinreinigung', 'Unterhaltsreinigung', 'Umzugsreinigung', 'Polsterreinigung'],
    quali_fragen: [
      { key: 'objekt', frage: 'Um was für ein Objekt geht es?', typ: 'auswahl', optionen: ['Wohnung', 'Haus', 'Büro / Praxis', 'Baustelle / Neubau', 'Sonstiges'], pflicht: true },
      { key: 'flaeche', frage: 'Wie groß ist die Fläche ungefähr (m²)?', typ: 'text' },
      { key: 'wunschtermin', frage: 'Wann soll es losgehen?', typ: 'auswahl', optionen: ['So schnell wie möglich', 'Innerhalb von 2 Wochen', 'Innerhalb eines Monats', 'Ich bin flexibel'] },
    ],
    erfolg_text: 'Ihr Festpreisangebot ist unterwegs – spätestens in 24 Stunden.',
  },
  herkunft: { quellen: ['flagship_reinigung.html'], generator: 'flagship-seed' },
}

export const flagshipRestaurantSeed: FlagshipConfig = {
  engine: 'flagship',
  branche_key: 'restaurant_italienisch',
  meta_kategorie: 'gastro_genuss',
  meta: {
    firma: 'PANE VINO',
    ort: 'Berlin-Friedrichshagen',
    telefon: '030 – 6409 3555',
    adresse: 'Bölschestraße 26 · 12587 Berlin-Friedrichshagen',
    gegruendet: '2000',
    seo_titel: 'Italienisches Restaurant Berlin Friedrichshagen – PANE VINO | Ristorante & Café',
    seo_beschreibung: 'PANE VINO – Ihr italienisches Restaurant in Berlin Friedrichshagen seit 2000. Frische Pasta, Fisch, Fleisch & mediterrane Klassiker. Jetzt Tisch reservieren: 030 6409 3555.',
  },
  design: {
    typo_modus: 'serif_warm_dunkel',
    typo_signature: 'gold_unterstrich',
    tokens: {
      basis: '#171210',
      panel: '#211915',
      text: '#F3E9DC',
      text_soft: 'rgba(243,233,220,.68)',
      akzent1: '#B4454F',
      akzent1_tief: '#8E2F3B',
      akzent2: '#D9A441',
      line: 'rgba(243,233,220,.14)',
    },
    akzent_begruendung: 'Chianti-Rot als Weinfarbe des Hauses, Kerzengold sparsam als Lichtakzent — auf warmem Espresso-Schwarz für die Abendstimmung eines Ristorante.',
    radius: '16px',
    breite: '1140px',
  },
  inhalte: {
    nav: {
      logo_text: 'PANE',
      logo_bold: 'VINO',
      links: [
        { label: 'Küche', anker: '#leistungen' },
        { label: 'Impressionen', anker: '#ergebnisse' },
        { label: 'Besuch', anker: '#lokal' },
        { label: 'FAQ', anker: '#faq' },
      ],
      cta_label: 'Tisch reservieren',
    },
    hero: {
      eyebrow: 'Ristorante & Café · Berlin Friedrichshagen · seit 2000',
      headline_zeilen: ['Ein Abend wie in [[Italien]].', 'Mitten in Friedrichshagen.'],
      lead: 'Frische Pasta, Fisch und mediterrane Klassiker – hausgemacht, mit Herz serviert. Seit über 25 Jahren Ihr italienisches Restaurant an der Bölschestraße.',
      cta_label: 'Tisch reservieren',
      cta_sekundaer: { label: '030\u00a0–\u00a06409\u00a03555', href: 'tel:+493064093555' },
      chips: ['Täglich 12 – 23 Uhr', 'Hausgemachte Pasta', 'Bölschestraße 26'],
      chip_stil: 'dot',
      media: { label: 'HERO – Ristorante bei Kerzenlicht', alt: 'PANE VINO – italienisches Restaurant in Berlin Friedrichshagen bei Kerzenlicht' },
      stat1: { wert: 'seit 2000', label: 'in Friedrichshagen' },
      stat2: { wert: 'Cucina fresca', label: 'täglich hausgemacht' },
    },
    fakten: {
      punkte: [
        { text: '[[25+]] Jahre am Müggelsee-Kiez' },
        { text: 'Frische Pasta · [[hausgemacht]]' },
        { text: 'Fisch & Fleisch [[mediterran]]' },
        { text: 'Reservierung: [[030 – 6409 3555]]' },
      ],
    },
    empathie: {
      eyebrow: 'Benvenuti',
      headline: 'Moderne Küche auf [[italienische]] Art.',
      text: 'Im PANE VINO treffen kreative Ideen auf traditionelle italienische Rezepte. Was auf den Tisch kommt, ist frisch, mediterran und mit Sorgfalt zubereitet – vom Antipasto bis zum Dolce.',
      variante: 'zitat',
      zitat: {
        text: 'Der Duft von frischer Pasta, ein Glas Wein, gutes Gespräch – mehr braucht ein guter Abend nicht.',
        cite: '— IHR PANE-VINO-TEAM',
      },
    },
    signature: {
      variante: 'decken',
      eyebrow: 'Scrollen Sie – wir decken schon mal ein',
      headline: 'Ihr Tisch ist gleich [[gedeckt]].',
      vorher: { label: 'VOR DEM SERVICE – eingedeckter Tisch, noch leer', alt: 'Eingedeckter Tisch im PANE VINO vor dem Service' },
      nachher: { label: 'BUON APPETITO – serviertes Abendessen', alt: 'Serviertes italienisches Abendessen mit Pasta und Wein im PANE VINO', hintergrund: 'linear-gradient(155deg,#3A2018,#57352B 60%,#7A4A33)' },
      tag_vorher: 'VOR DEM SERVICE',
      tag_nachher: 'BUON APPETITO',
      cap: 'Abendservice im PANE VINO · Bölschestraße 26, Friedrichshagen',
    },
    leistungen: {
      eyebrow: 'Italienisches Restaurant in Friedrichshagen – unsere Küche',
      headline: 'Vom Antipasto bis zum [[Dolce]].',
      stil: 'nummern',
      karten: [
        { no: 'I · Antipasti', titel: 'Mediterrane Vorspeisen', text: 'Der italienische Auftakt: Klassiker aus Meer und Garten, frisch angerichtet – perfekt zum Teilen.' },
        { no: 'II · Pasta', titel: 'Frische, hausgemachte Pasta', text: 'Täglich frisch zubereitet, von traditionellen Rezepten bis zu kreativen Empfehlungen des Küchenchefs.' },
        { no: 'III · Pesce', titel: 'Fisch, mediterran', text: 'Frischer Fisch, schonend zubereitet, mit den Aromen des Mittelmeers – leicht und voller Geschmack.' },
        { no: 'IV · Carne', titel: 'Fleischgerichte', text: 'Kräftige Klassiker der italienischen Küche – auf den Punkt gebracht und großzügig angerichtet.' },
        { no: 'V · Dolci', titel: 'Süßer Abschluss', text: 'Hausgemachte Desserts und ein Espresso, wie er sein muss – der Schlusspunkt eines guten Abends.' },
        { no: 'VI · Vini', titel: 'Italienische Weine', text: 'Eine Auswahl, die zur Küche passt – vom offenen Hauswein bis zur besonderen Flasche für den Anlass.' },
      ],
      hinweis: {
        text: 'Aktuelle Empfehlungen des Küchenchefs wechseln regelmäßig – lassen Sie sich am Tisch überraschen oder',
        link_label: 'reservieren Sie gleich Ihren Tisch',
        link_anker: '#kontakt',
      },
    },
    ergebnisse: {
      eyebrow: 'Impressionen',
      headline: 'So schmeckt der [[Abend]].',
      variante: 'galerie',
      bilder: [
        { media: { label: 'Frische Tagliatelle', alt: 'Frische hausgemachte Pasta im PANE VINO Berlin Friedrichshagen' }, caption: 'Pasta fresca' },
        { media: { label: 'Impression 1', alt: 'Impressionen aus dem PANE VINO Berlin Friedrichshagen' }, caption: 'Aus dem PANE VINO' },
        { media: { label: 'Gegrillter Branzino', alt: 'Mediterraner Fisch im italienischen Restaurant PANE VINO' }, caption: 'Pesce alla griglia' },
        { media: { label: 'Impression 2', alt: 'Einblicke ins PANE VINO Ristorante in Friedrichshagen' }, caption: 'Bölschestraße 26' },
        { media: { label: 'Tiramisù', alt: 'Hausgemachtes Tiramisu im PANE VINO Friedrichshagen' }, caption: 'Dolce della casa' },
        { media: { label: 'Impression 3', alt: 'Atmosphäre im PANE VINO an der Bölschestraße' }, caption: 'Echte Impressionen' },
      ],
    },
    zahlen: {
      items: [
        { wert: 25, suffix: '+', label: 'Jahre in Friedrichshagen' },
        { wert: '12–23', label: 'Uhr für Sie geöffnet' },
        { wert: 'Nr. 26', label: 'Bölschestraße, 12587 Berlin' },
        { wert: 2000, start: 1975, label: 'gegründet – und geblieben' },
      ],
    },
    stimmen: {
      eyebrow: 'Gästestimmen',
      headline: 'Man kommt wieder. [[Versprochen]].',
      quotes: [
        { text: 'Zum Jahrestag war der Tisch ungefragt mit Rosenblättern geschmückt – hausgemachtes Essen, schneller Service, wunderbare Atmosphäre. Wir kommen wieder.', initialen: 'EH', name: 'Eric H.', meta: 'Jahrestag im PANE VINO' },
        { text: 'Samstagabend, volles Lokal – und trotzdem lief alles perfekt. So aufmerksam wurden wir lange nicht bedient.', initialen: 'AF', name: 'Anton F.', meta: 'Erster Besuch, nicht der letzte' },
        { text: 'Ein gepflegtes, charmantes Lokal mit ausgezeichneter Küche – und einem Service, der sich rührend um unsere Gesellschaft gekümmert hat.', initialen: 'SL', name: 'Sergio L.', meta: 'Pranzo mit der Familie' },
      ],
    },
    lokal: {
      eyebrow: 'Ihr Besuch',
      headline: 'Sie finden uns an der [[Bölschestraße]].',
      lead: 'Mitten im schönsten Kiez von Friedrichshagen, wenige Minuten vom Müggelsee – ideal für den Abend zu zweit, das Familienessen oder die Feier mit Freunden.',
      variante: 'info',
      infos: [
        { titel: 'Adresse', text: 'Bölschestraße 26 · 12587 Berlin-Friedrichshagen', icon: 'pin' },
        { titel: 'Öffnungszeiten', text: 'Täglich 12:00 – 23:00 Uhr', icon: 'clock' },
        { titel: 'Reservierung', text: '030 – 6409 3555 oder über das Formular', icon: 'phone', telefon_link: '+493064093555' },
      ],
    },
    faq: {
      eyebrow: 'Gut zu wissen',
      headline: 'Kurz [[beantwortet]].',
      fragen: [
        { frage: 'Wie reserviere ich einen Tisch?', antwort: 'Am schnellsten telefonisch unter 030 – 6409 3555 oder direkt über die Reservierungsseite. Wir bestätigen Ihnen Ihren Tisch umgehend.' },
        { frage: 'Kann ich bei Ihnen Anlässe und Feiern ausrichten?', antwort: 'Sehr gern – vom Jahrestag zu zweit bis zur Familienfeier. Sagen Sie uns bei der Reservierung, worum es geht, und wir bereiten Ihren Tisch entsprechend vor.' },
        { frage: 'Wo finde ich die aktuelle Speisekarte?', antwort: 'Die vollständige Karte inklusive der aktuellen Empfehlungen unseres Küchenchefs erhalten Sie bei uns im Haus – oder Sie lassen sich einfach am Tisch beraten.' },
        { frage: 'Wann haben Sie geöffnet?', antwort: 'Wir sind täglich von 12:00 bis 23:00 Uhr für Sie da – mittags als Café und Ristorante, abends für das ganze italienische Programm.' },
      ],
    },
    conversion: {
      eyebrow: 'Reservierung',
      headline: 'Ihr Tisch [[wartet]].',
      lead: 'Sagen Sie uns wann und mit wie vielen Personen – wir kümmern uns um den Rest. Bei besonderen Anlässen gern eine kurze Notiz dazu.',
      telefon: '030 – 6409 3555',
      cta_label: 'Tisch reservieren',
      trust: ['Bestätigung schnellstmöglich', 'Auch für Feiern & besondere Anlässe', 'Täglich 12 – 23 Uhr'],
    },
    footer: {
      beschreibung: 'Italienisches Restaurant & Café in Berlin Friedrichshagen – frische Pasta, Fisch, Fleisch und mediterrane Klassiker. Seit 2000 an der Bölschestraße.',
      links: [
        { label: 'Küche', anker: '#leistungen' },
        { label: 'Reservieren', anker: '#kontakt' },
      ],
    },
  },
  funnel: {
    modus: 'reservierung',
    erfolg_text: 'Ihre Anfrage ist bei uns – wir bestätigen Ihren Tisch schnellstmöglich.',
  },
  herkunft: { quellen: ['flagship_restaurant.html'], generator: 'flagship-seed' },
}

export const FLAGSHIP_SEEDS: Record<string, FlagshipConfig> = {
  reinigung: flagshipReinigungSeed,
  restaurant_italienisch: flagshipRestaurantSeed,
}
