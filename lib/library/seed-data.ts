/**
 * Seed-Daten für die Template-Library (Mission §7, Phase C)
 *
 * 4 Branchen × 2 Stile = 8 Startseiten-Kompositionen auf Basis des
 * 10-Sektionen-Storytelling-Skeletons (§2).
 *
 * Platzhalter-Tokens im Content (füllt die Pipeline in Phase D):
 *   {{firma}}  — Firmenname
 *   {{ort}}    — Standort/Stadt
 *   {{jahr}}   — Gründungsjahr
 *
 * Stil-Logik: Content ist branchenspezifisch, der Stil ('klar' | 'warm')
 * steuert Design-Tokens beim Rendering + Tonalitäts-Overrides in den
 * Kompositionen (Hero/CTA).
 */

import type {
  ContentFieldSchema,
  LibraryPage,
  LibrarySection,
  SectionType,
  StockAsset,
} from './types'

// ------------------------------------------------------------
// Content-Schemas je Sektionstyp (branchenübergreifend identisch)
// ------------------------------------------------------------

const text = (beschreibung: string, maxZeichen?: number): ContentFieldSchema => ({
  typ: 'text',
  beschreibung,
  ...(maxZeichen ? { maxZeichen } : {}),
})

const textarea = (beschreibung: string, maxZeichen?: number): ContentFieldSchema => ({
  typ: 'textarea',
  beschreibung,
  ...(maxZeichen ? { maxZeichen } : {}),
})

export const SECTION_SCHEMAS: Record<SectionType, Record<string, ContentFieldSchema>> = {
  hero: {
    headline: text('WAS bietet der Betrieb — konkret, kein Slogan', 70),
    subheadline: text('FÜR WEN + Ort — ein Satz', 120),
    cta_text: text('Handlungsaufforderung, max. 4 Wörter', 30),
    bild_key: { typ: 'bild', beschreibung: 'stock_assets-Key oder Kunden-Upload (Kategorie hero)' },
  },
  trust_bar: {
    punkte: {
      typ: 'liste',
      beschreibung: '3–4 belegbare Zahlen/Fakten (keine Behauptungen ohne Zahl)',
      itemFelder: {
        wert: text('Zahl/Fakt, z.B. "seit 1998" oder "4,9 ★"', 20),
        label: text('Einordnung, z.B. "in {{ort}}"', 40),
      },
    },
  },
  problem: {
    headline: text('Das Problem des Kunden, aus Kundensicht formuliert', 80),
    punkte: {
      typ: 'liste',
      beschreibung: '3 konkrete Schmerzpunkte',
      itemFelder: { text: text('Schmerzpunkt als kurzer Satz', 120) },
    },
  },
  loesung: {
    headline: text('Die Antwort des Betriebs auf das Problem', 80),
    text: textarea('2–3 Sätze: wie der Betrieb das Problem löst — konkret', 400),
    punkte: {
      typ: 'liste',
      beschreibung: '3 Versprechen mit Substanz (prüfbar, konkret)',
      itemFelder: {
        titel: text('Kurztitel', 40),
        text: text('Ein Satz Substanz', 140),
      },
    },
  },
  leistungen: {
    headline: text('Überschrift Leistungsblock', 60),
    items: {
      typ: 'liste',
      beschreibung: '4–6 Kernleistungen',
      itemFelder: {
        titel: text('Leistung', 50),
        text: text('Was genau, ggf. Preisanker', 160),
      },
    },
  },
  prozess: {
    headline: text('Überschrift Ablauf', 60),
    schritte: {
      typ: 'liste',
      beschreibung: '3–4 Schritte von Anfrage bis Ergebnis',
      itemFelder: {
        titel: text('Schrittname', 40),
        text: text('Was passiert in diesem Schritt', 160),
      },
    },
  },
  referenzen: {
    headline: text('Überschrift Kundenstimmen', 60),
    stimmen: {
      typ: 'liste',
      beschreibung: '3 echte Kundenstimmen (Pipeline: aus Google-Reviews übernehmen)',
      itemFelder: {
        text: textarea('Zitat', 300),
        name: text('Vorname + Initial', 40),
        ort: text('Ort/Stadtteil', 40),
      },
    },
  },
  ueber_uns: {
    headline: text('Überschrift Inhaber/Team — persönlich, kein "Über uns"', 60),
    text: textarea('3–4 Sätze: wer dahintersteht, seit wann, was ihn antreibt', 500),
    bild_key: { typ: 'bild', beschreibung: 'stock_assets-Key oder Kunden-Upload (Kategorie team)' },
  },
  faq: {
    headline: text('Überschrift FAQ', 60),
    fragen: {
      typ: 'liste',
      beschreibung: '4–5 Fragen, die vor der Beauftragung wirklich gestellt werden',
      itemFelder: {
        frage: text('Frage aus Kundensicht', 120),
        antwort: textarea('Klare Antwort, keine Ausflüchte', 400),
      },
    },
  },
  kontakt_cta: {
    headline: text('Letzte Handlungsaufforderung', 70),
    text: textarea('1–2 Sätze: was passiert nach der Anfrage', 250),
    cta_text: text('Button-Text', 30),
  },
}

// ------------------------------------------------------------
// Branchen-Content (Floskel-frei, §2)
// ------------------------------------------------------------

type BranchenContent = Record<SectionType, Record<string, unknown>>

const HANDWERK: BranchenContent = {
  hero: {
    headline: 'Meisterbetrieb für Sanitär, Heizung und Bad in {{ort}}',
    subheadline: 'Feste Ansprechpartner, verbindliche Termine und Festpreis vor Arbeitsbeginn — für Eigentümer und Verwaltungen in {{ort}} und Umgebung.',
    cta_text: 'Termin anfragen',
    bild_key: 'handwerk.hero.1',
  },
  trust_bar: {
    punkte: [
      { wert: 'seit {{jahr}}', label: 'Meisterbetrieb in {{ort}}' },
      { wert: '4,9 ★', label: 'Google-Bewertungen' },
      { wert: '24 h', label: 'Notdienst erreichbar' },
      { wert: 'Festpreis', label: 'vor Arbeitsbeginn' },
    ],
  },
  problem: {
    headline: 'Handwerker-Suche kostet Nerven: keine Rückrufe, vage Preise, geplatzte Termine',
    punkte: [
      { text: 'Anfragen bleiben tagelang unbeantwortet — das Problem wird derweil größer.' },
      { text: 'Kostenvoranschläge sind unverbindlich und am Ende deutlich teurer.' },
      { text: 'Termine platzen ohne Ansage, der Urlaubstag ist trotzdem weg.' },
    ],
  },
  loesung: {
    headline: 'So arbeiten wir: Antwort in 24 h, Festpreis, Termin der hält',
    text: 'Jede Anfrage bekommt innerhalb eines Werktags eine Antwort mit Terminvorschlag. Nach der Besichtigung gibt es einen Festpreis — der gilt. Am vereinbarten Tag steht das Team vor der Tür, sonst rufen wir vorher an.',
    punkte: [
      { titel: 'Antwort in 24 h', text: 'Werktags melden wir uns innerhalb eines Tages zurück — verbindlich.' },
      { titel: 'Festpreis-Garantie', text: 'Der Preis aus dem Angebot ist der Preis auf der Rechnung.' },
      { titel: 'Saubere Baustelle', text: 'Abdecken, Staubschutz, besenrein bei Übergabe — Standard, kein Extra.' },
    ],
  },
  leistungen: {
    headline: 'Unsere Leistungen',
    items: [
      { titel: 'Badsanierung', text: 'Komplettbad aus einer Planung: Demontage bis Endmontage, inkl. Fliesen und Elektrik-Koordination.' },
      { titel: 'Heizungstausch', text: 'Wärmepumpe oder Gas-Brennwert — mit Förderberatung und Anmeldung beim Netzbetreiber.' },
      { titel: 'Rohr- & Leitungsbau', text: 'Trinkwasser- und Abwasserleitungen, Neubau und Sanierung im Bestand.' },
      { titel: 'Notdienst', text: 'Rohrbruch, Heizungsausfall, Wasserschaden — 24 h erreichbar, Anfahrt in {{ort}} unter 60 Minuten.' },
      { titel: 'Wartung', text: 'Jährliche Heizungswartung mit Protokoll — planbar per Wartungsvertrag.' },
    ],
  },
  prozess: {
    headline: 'Von der Anfrage zum fertigen Ergebnis',
    schritte: [
      { titel: 'Anfrage', text: 'Kurz schildern, was ansteht — per Formular oder Anruf.' },
      { titel: 'Besichtigung', text: 'Wir schauen uns die Lage vor Ort an und klären alle offenen Punkte.' },
      { titel: 'Festpreis-Angebot', text: 'Schriftliches Angebot mit festen Positionen — keine Nachträge ohne Absprache.' },
      { titel: 'Ausführung', text: 'Umsetzung zum vereinbarten Termin, Abnahme gemeinsam mit Ihnen.' },
    ],
  },
  referenzen: {
    headline: 'Was Kunden nach dem Projekt sagen',
    stimmen: [
      { text: 'Bad komplett saniert in zwölf Arbeitstagen — Zeitplan und Preis haben exakt gestimmt.', name: 'Familie K.', ort: '{{ort}}' },
      { text: 'Heizungsausfall am Sonntag, um 9 Uhr angerufen, um 11 Uhr lief die Anlage wieder.', name: 'M. Berger', ort: '{{ort}}' },
      { text: 'Endlich ein Betrieb, der zurückruft. Angebot nach zwei Tagen, Ausführung sauber.', name: 'S. Winter', ort: '{{ort}}' },
    ],
  },
  ueber_uns: {
    headline: 'Der Betrieb hinter der Arbeit',
    text: '{{firma}} ist seit {{jahr}} in {{ort}} zu Hause — heute mit einem festen Team aus Meistern, Gesellen und Azubis. Wer bei uns anruft, spricht mit jemandem, der die Baustelle kennt. Und wer uns beauftragt, bekommt den Namen des Monteurs vor dem Termin.',
    bild_key: 'handwerk.team.1',
  },
  faq: {
    headline: 'Häufige Fragen',
    fragen: [
      { frage: 'Was kostet eine Badsanierung?', antwort: 'Je nach Größe und Ausstattung ab ca. 12.000 €. Nach der Besichtigung bekommen Sie einen Festpreis — der gilt.' },
      { frage: 'Wie schnell bekomme ich einen Termin?', antwort: 'Besichtigungen meist innerhalb einer Woche, Notdienst am selben Tag.' },
      { frage: 'Arbeitet ihr auch für Hausverwaltungen?', antwort: 'Ja — mit Rahmenvereinbarung, festen Reaktionszeiten und Sammelabrechnung.' },
      { frage: 'Gibt es Förderung für den Heizungstausch?', antwort: 'Für Wärmepumpen aktuell bis zu 70 % Zuschuss. Wir rechnen das im Angebot konkret vor und übernehmen den Antrag.' },
    ],
  },
  kontakt_cta: {
    headline: 'Projekt anstehen? Jetzt Termin sichern.',
    text: 'Anfrage schicken — Sie erhalten innerhalb eines Werktags eine Antwort mit Terminvorschlag.',
    cta_text: 'Anfrage senden',
  },
}

const GASTRONOMIE: BranchenContent = {
  hero: {
    headline: 'Frische Küche und ehrliche Gastfreundschaft mitten in {{ort}}',
    subheadline: 'Saisonale Karte, Zutaten von Höfen aus der Region — mittags wie abends, mit und ohne Reservierung.',
    cta_text: 'Tisch reservieren',
    bild_key: 'gastro.hero.1',
  },
  trust_bar: {
    punkte: [
      { wert: 'seit {{jahr}}', label: 'in {{ort}}' },
      { wert: '4,8 ★', label: 'über 400 Bewertungen' },
      { wert: 'saisonal', label: 'Karte wechselt monatlich' },
      { wert: 'regional', label: 'Zutaten aus dem Umland' },
    ],
  },
  problem: {
    headline: 'Essen gehen soll ein Abend sein — kein Kompromiss',
    punkte: [
      { text: 'Austauschbare Karten, auf denen seit Jahren dasselbe steht.' },
      { text: 'Tiefkühlware zum Frische-Preis.' },
      { text: 'Volle Läden, gehetzter Service, keine freien Tische ohne Wochen Vorlauf.' },
    ],
  },
  loesung: {
    headline: 'Unsere Antwort: kleine Karte, echte Küche, Platz zum Bleiben',
    text: 'Wir kochen lieber zwölf Gerichte richtig als vierzig halbherzig. Die Karte wechselt mit der Saison, das Fleisch kommt vom Metzger in {{ort}}, das Gemüse von zwei Höfen aus dem Umland. Reservieren geht online in 30 Sekunden.',
    punkte: [
      { titel: 'Kleine Karte', text: 'Zwölf Gerichte, jeden Monat neu — alles frisch zubereitet.' },
      { titel: 'Regionale Partner', text: 'Metzger, Bäcker und zwei Gemüsehöfe aus dem Umkreis von 30 km.' },
      { titel: 'Online reservieren', text: 'Tisch in 30 Sekunden gebucht, Bestätigung sofort aufs Handy.' },
    ],
  },
  leistungen: {
    headline: 'Küche & Angebote',
    items: [
      { titel: 'Mittagstisch', text: 'Mo–Fr wechselnde Gerichte ab 9,80 € — in 45 Minuten wieder am Schreibtisch.' },
      { titel: 'Abendkarte', text: 'Saisonale Küche mit vegetarischen und veganen Optionen.' },
      { titel: 'Feiern & Gruppen', text: 'Separater Raum für 12–40 Personen, Menüvorschläge ab 32 € p. P.' },
      { titel: 'Catering', text: 'Buffets und Fingerfood für Firmen in {{ort}} — Lieferung und Aufbau inklusive.' },
    ],
  },
  prozess: {
    headline: 'So einfach ist ein Abend bei uns',
    schritte: [
      { titel: 'Reservieren', text: 'Online Tisch wählen — Datum, Uhrzeit, Personenzahl, fertig.' },
      { titel: 'Ankommen', text: 'Ihr Tisch steht bereit, die Tageskarte liegt auf.' },
      { titel: 'Genießen', text: 'Küche bis 21:30 Uhr, niemand schiebt Sie zum Nachtisch raus.' },
    ],
  },
  referenzen: {
    headline: 'Das sagen unsere Gäste',
    stimmen: [
      { text: 'Das Schnitzel ist der Grund, warum meine Eltern jetzt öfter zu Besuch kommen.', name: 'J. Hartmann', ort: '{{ort}}' },
      { text: 'Firmenessen mit 25 Leuten — eigener Raum, eigenes Menü, alles hat funktioniert.', name: 'C. Vogt', ort: '{{ort}}' },
      { text: 'Karte klein, aber jedes Gericht sitzt. Genau so soll das sein.', name: 'R. Albrecht', ort: '{{ort}}' },
    ],
  },
  ueber_uns: {
    headline: 'Wer hier am Herd steht',
    text: '{{firma}} gibt es seit {{jahr}}. In der Küche steht der Inhaber selbst — gelernt in der klassischen Küche, zurückgekommen nach {{ort}}, um hier das eigene Ding zu machen: gute Produkte, kurze Wege, keine Show.',
    bild_key: 'gastro.team.1',
  },
  faq: {
    headline: 'Gut zu wissen',
    fragen: [
      { frage: 'Braucht man eine Reservierung?', antwort: 'Am Wochenende empfehlenswert. Unter der Woche gibt es fast immer spontan einen Tisch.' },
      { frage: 'Gibt es vegane Gerichte?', antwort: 'Mindestens zwei Hauptgerichte pro Karte, auf Wunsch passen wir weitere an.' },
      { frage: 'Kann man bei euch feiern?', antwort: 'Ja — der Nebenraum fasst bis zu 40 Personen. Menüvorschläge schicken wir nach kurzer Anfrage.' },
      { frage: 'Wo parkt man am besten?', antwort: 'Parkhaus am Markt, 3 Minuten zu Fuß. Abends ab 19 Uhr auch direkt vor der Tür.' },
    ],
  },
  kontakt_cta: {
    headline: 'Der nächste gute Abend ist einen Klick entfernt',
    text: 'Tisch online reservieren oder kurz anrufen — Bestätigung kommt sofort.',
    cta_text: 'Jetzt reservieren',
  },
}

const FRISEUR: BranchenContent = {
  hero: {
    headline: 'Haarschnitte, die im Alltag funktionieren — Salon in {{ort}}',
    subheadline: 'Beratung vor der Schere, ehrliche Empfehlung statt Produktverkauf, Online-Termin in unter einer Minute.',
    cta_text: 'Termin buchen',
    bild_key: 'friseur.hero.1',
  },
  trust_bar: {
    punkte: [
      { wert: 'seit {{jahr}}', label: 'Salon in {{ort}}' },
      { wert: '4,9 ★', label: 'über 300 Bewertungen' },
      { wert: 'online', label: 'Termin rund um die Uhr buchbar' },
      { wert: '0 €', label: 'Beratungsgespräch vorab' },
    ],
  },
  problem: {
    headline: 'Kennen Sie das? Nach dem Friseur sieht es zwei Tage gut aus — dann nie wieder',
    punkte: [
      { text: 'Der Schnitt funktioniert nur mit 20 Minuten Styling am Morgen.' },
      { text: 'Statt Beratung gibt es ein Verkaufsgespräch für die Produktlinie.' },
      { text: 'Termine nur telefonisch — und das Telefon ist ständig besetzt.' },
    ],
  },
  loesung: {
    headline: 'Unser Ansatz: erst verstehen, dann schneiden',
    text: 'Jeder Termin beginnt mit fünf Minuten Beratung: Haarstruktur, Alltag, wie viel Zeit Sie morgens wirklich haben. Danach schneiden wir so, dass es auch nach dem eigenen Waschen fällt — nicht nur nach dem Föhnen im Salon.',
    punkte: [
      { titel: 'Alltagstauglich', text: 'Schnitte, die ohne Styling-Marathon funktionieren.' },
      { titel: 'Ehrliche Beratung', text: 'Wenn eine Behandlung nichts bringt, sagen wir das — vor dem Termin.' },
      { titel: 'Online buchen', text: 'Wunschtermin und Stylist rund um die Uhr online wählen.' },
    ],
  },
  leistungen: {
    headline: 'Leistungen & Preise',
    items: [
      { titel: 'Schnitt Damen', text: 'Beratung, Waschen, Schnitt, Föhnen — ab 52 €.' },
      { titel: 'Schnitt Herren', text: 'Beratung, Schnitt, Styling — ab 34 €.' },
      { titel: 'Farbe & Balayage', text: 'Strähnen, Komplettfärbung, Balayage — ab 85 €, Preis nach Haarlänge vorab fix.' },
      { titel: 'Pflege-Behandlung', text: 'Aufbau-Behandlung für strapaziertes Haar — ab 25 € als Zusatz.' },
      { titel: 'Hochstecken & Event', text: 'Frisuren für Hochzeit und Anlass — mit Probetermin.' },
    ],
  },
  prozess: {
    headline: 'Ihr Termin bei uns',
    schritte: [
      { titel: 'Online buchen', text: 'Leistung, Stylist und Uhrzeit wählen — Bestätigung sofort.' },
      { titel: 'Beratung', text: 'Fünf Minuten über Haar, Alltag und Wunsch sprechen — vor der ersten Schere.' },
      { titel: 'Schnitt & Finish', text: 'Schneiden, stylen, und Sie bekommen die 2-Minuten-Anleitung für zu Hause.' },
    ],
  },
  referenzen: {
    headline: 'Kundinnen und Kunden über uns',
    stimmen: [
      { text: 'Zum ersten Mal ein Schnitt, der auch nach drei Wochen noch in Form ist.', name: 'L. Sommer', ort: '{{ort}}' },
      { text: 'Ich wurde beraten statt überredet. Die Balayage sieht nach Monaten noch gut aus.', name: 'A. Krüger', ort: '{{ort}}' },
      { text: 'Termin um 18:30 nach der Arbeit, online gebucht, pünktlich drangekommen.', name: 'D. Steiner', ort: '{{ort}}' },
    ],
  },
  ueber_uns: {
    headline: 'Das Team hinter dem Stuhl',
    text: '{{firma}} wurde {{jahr}} in {{ort}} eröffnet — heute arbeiten hier vier Stylistinnen und Stylisten mit regelmäßigen Schulungen in Schnitt- und Farbtechnik. Wir nehmen uns pro Termin bewusst mehr Zeit, dafür sitzt das Ergebnis.',
    bild_key: 'friseur.team.1',
  },
  faq: {
    headline: 'Häufige Fragen',
    fragen: [
      { frage: 'Was kostet ein Damenhaarschnitt?', antwort: 'Ab 52 € inklusive Beratung, Waschen und Föhnen. Den genauen Preis nennen wir vor Beginn — keine Überraschungen an der Kasse.' },
      { frage: 'Wie weit im Voraus muss ich buchen?', antwort: 'Unter der Woche reichen meist 2–3 Tage, samstags etwa eine Woche.' },
      { frage: 'Kann ich einen bestimmten Stylisten wählen?', antwort: 'Ja, bei der Online-Buchung wählen Sie Ihren Wunsch-Stylisten direkt aus.' },
      { frage: 'Was, wenn ich absagen muss?', antwort: 'Bis 24 Stunden vorher kostenlos — online mit einem Klick.' },
    ],
  },
  kontakt_cta: {
    headline: 'Ihr nächster Termin — in einer Minute gebucht',
    text: 'Wunschtermin online wählen, Bestätigung kommt sofort. Bis 24 h vorher kostenlos stornierbar.',
    cta_text: 'Termin buchen',
  },
}

const GESUNDHEIT: BranchenContent = {
  hero: {
    headline: 'Hausärztliche Versorgung mit Zeit für das Gespräch — Praxis in {{ort}}',
    subheadline: 'Alle Kassen und Privat. Termine online buchbar, Akutsprechstunde jeden Vormittag ohne Voranmeldung.',
    cta_text: 'Termin vereinbaren',
    bild_key: 'gesundheit.hero.1',
  },
  trust_bar: {
    punkte: [
      { wert: 'seit {{jahr}}', label: 'Praxis in {{ort}}' },
      { wert: 'alle Kassen', label: 'gesetzlich & privat' },
      { wert: 'täglich', label: 'Akutsprechstunde 8–10 Uhr' },
      { wert: 'online', label: 'Termin & Rezept digital' },
    ],
  },
  problem: {
    headline: 'Arzttermine sollten kein Hindernislauf sein',
    punkte: [
      { text: 'Wochenlanges Warten auf einen Termin — auch wenn es akut ist.' },
      { text: 'Drei Minuten Sprechzeit, die Hälfte der Fragen bleibt offen.' },
      { text: 'Für jedes Folgerezept ein neuer Anruf in der Warteschleife.' },
    ],
  },
  loesung: {
    headline: 'Unsere Praxis ist anders organisiert',
    text: 'Akute Fälle sehen wir noch am selben Vormittag — dafür gibt es die tägliche Akutsprechstunde. Geplante Termine buchen Sie online und werden im 15-Minuten-Takt einbestellt, damit Wartezimmer-Marathons entfallen. Folgerezepte bestellen Sie digital und holen sie ohne Wartezeit ab.',
    punkte: [
      { titel: 'Akut = heute', text: 'Akutsprechstunde Mo–Fr 8–10 Uhr, ohne Voranmeldung.' },
      { titel: '15-Minuten-Takt', text: 'Geplante Termine mit echter Sprechzeit statt Fließband.' },
      { titel: 'Digital entlastet', text: 'Rezepte und Überweisungen online bestellen, Abholung am Empfang.' },
    ],
  },
  leistungen: {
    headline: 'Unser Leistungsspektrum',
    items: [
      { titel: 'Hausärztliche Versorgung', text: 'Diagnostik und Behandlung akuter und chronischer Erkrankungen.' },
      { titel: 'Vorsorge & Check-up', text: 'Gesundheits-Check-up ab 35, Hautkrebs-Screening, Impfberatung.' },
      { titel: 'Chronikerprogramme (DMP)', text: 'Strukturierte Begleitung bei Diabetes, KHK, Asthma und COPD.' },
      { titel: 'Labor & EKG', text: 'Blutabnahme täglich bis 11 Uhr, Ruhe- und Langzeit-EKG in der Praxis.' },
      { titel: 'Hausbesuche', text: 'Für immobile Patientinnen und Patienten im Stadtgebiet {{ort}}.' },
    ],
  },
  prozess: {
    headline: 'So kommen Sie zu Ihrem Termin',
    schritte: [
      { titel: 'Termin wählen', text: 'Online buchen oder anrufen — akut: einfach zur Akutsprechstunde kommen.' },
      { titel: 'Ankommen', text: 'Versichertenkarte ans Terminal, Platz nehmen — Aufruf im 15-Minuten-Takt.' },
      { titel: 'Sprechzeit', text: 'Untersuchung und Besprechung ohne Zeitdruck, nächste Schritte klar vereinbart.' },
    ],
  },
  referenzen: {
    headline: 'Erfahrungen unserer Patienten',
    stimmen: [
      { text: 'Morgens mit Fieber in die Akutsprechstunde, um 9:30 Uhr mit Diagnose und Rezept wieder draußen.', name: 'P. Neumann', ort: '{{ort}}' },
      { text: 'Zum ersten Mal eine Ärztin, die zuhört, bis alle Fragen beantwortet sind.', name: 'H. Schuster', ort: '{{ort}}' },
      { text: 'Rezept online bestellt, am nächsten Tag ohne Wartezeit abgeholt. So einfach kann das sein.', name: 'B. Lorenz', ort: '{{ort}}' },
    ],
  },
  ueber_uns: {
    headline: 'Ihr Praxisteam',
    text: 'Die Praxis {{firma}} besteht seit {{jahr}} in {{ort}}. Heute kümmern sich zwei Ärztinnen und fünf Medizinische Fachangestellte um unsere Patientinnen und Patienten — mit dem Anspruch, Medizin und Organisation gleich ernst zu nehmen: Wer krank ist, braucht Hilfe und keine Warteschleife.',
    bild_key: 'gesundheit.team.1',
  },
  faq: {
    headline: 'Häufige Fragen',
    fragen: [
      { frage: 'Nehmen Sie neue Patienten auf?', antwort: 'Ja, aktuell nehmen wir neue Patientinnen und Patienten aller Kassen auf. Bringen Sie zum ersten Termin Versichertenkarte und Medikamentenliste mit.' },
      { frage: 'Wie funktioniert die Akutsprechstunde?', antwort: 'Mo–Fr 8–10 Uhr einfach vorbeikommen — keine Anmeldung nötig. Behandlung in Reihenfolge des Eintreffens, dringende Fälle zuerst.' },
      { frage: 'Kann ich Rezepte online bestellen?', antwort: 'Ja, über das Formular auf dieser Seite. Bestellungen bis 12 Uhr liegen am nächsten Werktag zur Abholung bereit.' },
      { frage: 'Machen Sie Hausbesuche?', antwort: 'Ja, für immobile Patienten im Stadtgebiet — Terminvergabe über den Empfang.' },
    ],
  },
  kontakt_cta: {
    headline: 'Termin vereinbaren — online oder telefonisch',
    text: 'Online-Termine rund um die Uhr buchbar. Akut? Kommen Sie werktags zwischen 8 und 10 Uhr direkt vorbei.',
    cta_text: 'Termin buchen',
  },
}

const BRANCHEN_CONTENT: Record<string, BranchenContent> = {
  Handwerk: HANDWERK,
  Gastronomie: GASTRONOMIE,
  Friseur: FRISEUR,
  Gesundheit: GESUNDHEIT,
}

const BRANCHE_SLUG: Record<string, string> = {
  Handwerk: 'handwerk',
  Gastronomie: 'gastro',
  Friseur: 'friseur',
  Gesundheit: 'gesundheit',
}

// ------------------------------------------------------------
// section_library-Einträge: 10 Typen × 4 Branchen = 40 Bausteine
// (stil = null: der Stil steuert Design-Tokens + Overrides, nicht den Baustein)
// ------------------------------------------------------------

const SECTION_NAMES: Record<SectionType, string> = {
  hero: 'Hero',
  trust_bar: 'Trust-Leiste',
  problem: 'Problem',
  loesung: 'Lösung',
  leistungen: 'Leistungen',
  prozess: 'Ablauf',
  referenzen: 'Kundenstimmen',
  ueber_uns: 'Über den Betrieb',
  faq: 'FAQ',
  kontakt_cta: 'Kontakt-CTA',
}

const SECTION_ORDER: SectionType[] = [
  'hero', 'trust_bar', 'problem', 'loesung', 'leistungen',
  'prozess', 'referenzen', 'ueber_uns', 'faq', 'kontakt_cta',
]

export const SEED_SECTIONS: LibrarySection[] = Object.entries(BRANCHEN_CONTENT).flatMap(
  ([branche, content]) =>
    SECTION_ORDER.map((typ, i) => ({
      key: `${typ}.${BRANCHE_SLUG[branche]}`,
      section_type: typ,
      branche,
      stil: null,
      name: `${SECTION_NAMES[typ]} — ${branche}`,
      content_schema: SECTION_SCHEMAS[typ],
      default_content: content[typ],
      sort_hint: i + 1,
    }))
)

// ------------------------------------------------------------
// library_pages: 4 Branchen × 2 Stile = 8 Startseiten-Kompositionen
// Stil-Overrides differenzieren die Tonalität von Hero & CTA.
// ------------------------------------------------------------

/** Tonalitäts-Overrides je Branche für den Stil 'warm' (klar = Defaults) */
const WARM_OVERRIDES: Record<string, Partial<Record<SectionType, Record<string, unknown>>>> = {
  Handwerk: {
    hero: {
      headline: 'Ein Handwerksbetrieb, auf den in {{ort}} Verlass ist',
      subheadline: 'Seit {{jahr}} für Familien, Eigentümer und Verwaltungen im Einsatz — mit festen Ansprechpartnern und Preisen, die halten.',
    },
    kontakt_cta: {
      headline: 'Erzählen Sie uns, was ansteht',
      text: 'Schreiben Sie kurz, worum es geht — wir melden uns innerhalb eines Werktags mit einem Terminvorschlag.',
    },
  },
  Gastronomie: {
    hero: {
      headline: 'Ihr Stammplatz in {{ort}} wartet schon',
      subheadline: 'Saisonale Küche, Zutaten aus der Region und ein Team, das sich Ihre Lieblingsgerichte merkt.',
    },
    kontakt_cta: {
      headline: 'Wir halten Ihnen einen Tisch frei',
      text: 'Kurz reservieren — und der Abend gehört Ihnen. Bestätigung kommt sofort aufs Handy.',
    },
  },
  Friseur: {
    hero: {
      headline: 'Der Salon in {{ort}}, in dem Sie sich nichts andrehen lassen müssen',
      subheadline: 'Beratung auf Augenhöhe, Schnitte für Ihren Alltag — und ein Kaffee, während die Farbe einwirkt.',
    },
    kontakt_cta: {
      headline: 'Gönnen Sie Ihrem Haar einen festen Termin',
      text: 'Online buchen dauert eine Minute — und bis 24 Stunden vorher können Sie kostenlos umbuchen.',
    },
  },
  Gesundheit: {
    hero: {
      headline: 'Eine Hausarztpraxis, in der Sie kein Fall, sondern ein Mensch sind',
      subheadline: 'Zeit für das Gespräch, tägliche Akutsprechstunde und ein Team, das Sie beim Namen kennt — mitten in {{ort}}.',
    },
    kontakt_cta: {
      headline: 'Wir sind für Sie da — heute noch, wenn es sein muss',
      text: 'Termine online oder telefonisch. Akut? Kommen Sie werktags zwischen 8 und 10 Uhr einfach vorbei.',
    },
  },
}

export const SEED_PAGES: LibraryPage[] = Object.keys(BRANCHEN_CONTENT).flatMap((branche) => {
  const slug = BRANCHE_SLUG[branche]
  const basisSections = SECTION_ORDER.map((typ) => ({ section_key: `${typ}.${slug}` }))
  const warmOverrides = WARM_OVERRIDES[branche] || {}
  return [
    {
      key: `startseite.${slug}.klar`,
      name: `Startseite ${branche} — Klar`,
      branche,
      stil: 'klar' as const,
      seitentyp: 'startseite' as const,
      beschreibung: `Nüchtern-moderne Startseite für ${branche}: direkte Ansprache, Fakten vor Emotion.`,
      sections: basisSections,
    },
    {
      key: `startseite.${slug}.warm`,
      name: `Startseite ${branche} — Warm`,
      branche,
      stil: 'warm' as const,
      seitentyp: 'startseite' as const,
      beschreibung: `Persönlich-herzliche Startseite für ${branche}: Nähe und Vertrauen vor Nüchternheit.`,
      sections: SECTION_ORDER.map((typ) => {
        const overrides = warmOverrides[typ]
        return overrides
          ? { section_key: `${typ}.${slug}`, overrides }
          : { section_key: `${typ}.${slug}` }
      }),
    },
  ]
})

// ------------------------------------------------------------
// stock_assets: Platzhalter aus dem Bestand (bereits in template-configs
// verwendete Unsplash-URLs). Echte lizenzierte Assets: siehe WARTELISTE.
// ------------------------------------------------------------

const U = (id: string, w = 1400) => `https://images.unsplash.com/${id}?w=${w}&q=80`

export const SEED_ASSETS: StockAsset[] = [
  // Handwerk
  { key: 'handwerk.hero.1', url: U('photo-1504307651254-35680f356dfd'), alt_text: 'Handwerker bei der Arbeit auf der Baustelle', branche: 'Handwerk', kategorie: 'hero', quelle: 'unsplash' },
  { key: 'handwerk.arbeit.1', url: U('photo-1581578731548-c64695cc6952', 800), alt_text: 'Fachkraft bei Detailarbeit', branche: 'Handwerk', kategorie: 'arbeit', quelle: 'unsplash' },
  { key: 'handwerk.arbeit.2', url: U('photo-1558618666-fcd25c85cd64', 800), alt_text: 'Werkzeug und Material im Einsatz', branche: 'Handwerk', kategorie: 'arbeit', quelle: 'unsplash' },
  { key: 'handwerk.team.1', url: U('photo-1600607687939-ce8a6c25118c', 800), alt_text: 'Fertiggestelltes Projekt', branche: 'Handwerk', kategorie: 'team', quelle: 'unsplash' },
  // Gastronomie
  { key: 'gastro.hero.1', url: U('photo-1517248135467-4c7edcad34c4'), alt_text: 'Gastraum mit gedeckten Tischen', branche: 'Gastronomie', kategorie: 'hero', quelle: 'unsplash' },
  { key: 'gastro.ambiente.1', url: U('photo-1414235077428-338989a2e8c0', 800), alt_text: 'Abendstimmung im Restaurant', branche: 'Gastronomie', kategorie: 'ambiente', quelle: 'unsplash' },
  { key: 'gastro.detail.1', url: U('photo-1476224203421-9ac39bcb3327', 800), alt_text: 'Frisch angerichtetes Gericht', branche: 'Gastronomie', kategorie: 'detail', quelle: 'unsplash' },
  { key: 'gastro.team.1', url: U('photo-1555396273-367ea4eb4db5', 800), alt_text: 'Team im Gastraum', branche: 'Gastronomie', kategorie: 'team', quelle: 'unsplash' },
  // Gesundheit
  { key: 'gesundheit.hero.1', url: U('photo-1631217868264-e5b90bb7e133'), alt_text: 'Moderne Praxisräume', branche: 'Gesundheit', kategorie: 'hero', quelle: 'unsplash' },
  { key: 'gesundheit.detail.1', url: U('photo-1579684385127-1ef15d508118', 800), alt_text: 'Untersuchung in der Praxis', branche: 'Gesundheit', kategorie: 'detail', quelle: 'unsplash' },
  { key: 'gesundheit.team.1', url: U('photo-1589829545856-d10d557cf95f', 800), alt_text: 'Ärztin im Behandlungszimmer', branche: 'Gesundheit', kategorie: 'team', quelle: 'unsplash' },
  // Universell
  { key: 'universal.hero.1', url: U('photo-1497366216548-37526070297c'), alt_text: 'Moderner Empfangsbereich', branche: null, kategorie: 'hero', quelle: 'unsplash' },
  { key: 'universal.team.1', url: U('photo-1521737711867-e3b97375f902', 800), alt_text: 'Team im Gespräch', branche: null, kategorie: 'team', quelle: 'unsplash' },
  // Friseur: keine Bestands-URLs — Platzhalter universell, echte Assets siehe WARTELISTE
  { key: 'friseur.hero.1', url: U('photo-1497366216548-37526070297c'), alt_text: 'Salon-Innenraum (Platzhalter)', branche: 'Friseur', kategorie: 'hero', quelle: 'unsplash' },
  { key: 'friseur.team.1', url: U('photo-1521737711867-e3b97375f902', 800), alt_text: 'Team im Salon (Platzhalter)', branche: 'Friseur', kategorie: 'team', quelle: 'unsplash' },
]
