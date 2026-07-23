/**
 * Blog-Artikel-Registry (zentrale Quelle für alle Blog-Inhalte).
 *
 * - Sitemap (app/sitemap.ts) liest aus veroeffentlichteArtikel()
 * - Blog-Listing liest aus veroeffentlichteArtikel()
 * - Test: scripts/test-blog.ts
 * - QA-Regel: R-BLOG-REGISTRY
 */

export interface BlogArtikel {
  slug: string
  titel: string
  description: string
  excerpt: string
  datum: string       // ISO 8601: YYYY-MM-DD
  lesezeit: string
  kategorie: string
  bild: string        // Pfad relativ zu /public, z. B. '/blog/foo.webp'
  einwand?: string    // Nur bei Einwand-Artikeln gesetzt
}

export const BLOG_ARTIKEL: BlogArtikel[] = [
  // ─────────────────────────────────────────────────────────
  // Bestehende Artikel (Seiten bereits vorhanden)
  // ─────────────────────────────────────────────────────────
  {
    slug: 'webseite-erstellen-lassen-kosten',
    titel: 'Webseite erstellen lassen: Was kostet das wirklich? (Ehrlicher Vergleich 2026)',
    description: 'Was kostet eine Webseite beim Profi? Wir vergleichen Agentur, Freelancer und Abo-Modell – ehrlich, ohne Verkaufstricks.',
    excerpt: 'Agentur, Freelancer oder Abo-Modell? Was eine professionelle Webseite wirklich kostet – und welches Modell für kleine Unternehmen am meisten Sinn ergibt.',
    datum: '2026-05-14',
    lesezeit: '8 Min.',
    kategorie: 'Kosten & Preise',
    bild: '/blog/webseite-erstellen-lassen-kosten.webp',
  },
  {
    slug: 'website-fuer-handwerker',
    titel: 'Website für Handwerker: So gewinnst du Kunden online',
    description: 'Warum Handwerker 2026 eine Website brauchen, was sie enthalten muss und wie du lokal bei Google gefunden wirst. Praxisguide mit konkreten Tipps.',
    excerpt: 'Über 80 % der Kunden suchen heute online nach Handwerkern. Ohne Website verlierst du jeden Tag Aufträge an die Konkurrenz – das ändert sich mit diesem Guide.',
    datum: '2026-05-13',
    lesezeit: '7 Min.',
    kategorie: 'Handwerk & Web',
    bild: '/blog/website-fuer-handwerker.webp',
  },
  {
    slug: 'website-mieten-oder-kaufen',
    titel: 'Website mieten oder kaufen? Ehrlicher Vergleich 2026',
    description: 'Website kaufen oder mieten – welches Modell rechnet sich für kleine Unternehmen? Ein ehrlicher Vergleich mit konkreten Zahlen.',
    excerpt: 'Einmalkosten vs. monatliche Gebühr: Welches Modell sich für wen rechnet – und warum die meisten Selbstständigen mit dem Abo-Modell besser fahren.',
    datum: '2026-05-12',
    lesezeit: '7 Min.',
    kategorie: 'Kosten & Modelle',
    bild: '/blog/website-mieten-oder-kaufen.webp',
  },
  {
    slug: 'warum-selbststaendige-eine-website-brauchen',
    titel: 'Warum Selbstständige 2026 eine Website brauchen',
    description: 'Als Selbstständiger ohne Website bist du für die meisten potenziellen Kunden unsichtbar. Warum das 2026 wichtiger ist denn je.',
    excerpt: 'Empfehlungen und Social Media reichen nicht mehr. Warum eine eigene Website 2026 für Selbstständige die Basis für planbares Wachstum ist.',
    datum: '2026-05-11',
    lesezeit: '7 Min.',
    kategorie: 'Selbstständigkeit',
    bild: '/blog/warum-selbststaendige-eine-website-brauchen.webp',
  },
  {
    slug: 'local-seo-fuer-kleine-unternehmen',
    titel: 'Local SEO für kleine Unternehmen – Der komplette Guide',
    description: 'Wie kleine Unternehmen mit Local SEO bei Google gefunden werden. Der komplette Guide für 2026 – von Google My Business bis zu lokalen Keywords.',
    excerpt: 'Google My Business, lokale Keywords, Bewertungen: Mit diesen drei Hebeln wirst du als lokales Unternehmen bei Google sichtbar – ohne Agentur-Budget.',
    datum: '2026-05-10',
    lesezeit: '8 Min.',
    kategorie: 'SEO & Sichtbarkeit',
    bild: '/blog/local-seo-fuer-kleine-unternehmen.webp',
  },

  // ─────────────────────────────────────────────────────────
  // Einwand-Artikel (wöchentlich ab 2026-07-28)
  // ─────────────────────────────────────────────────────────
  {
    slug: 'website-zu-teuer',
    titel: 'Website zu teuer? So rechnet sich eine Webseite schon ab dem ersten Monat',
    description: 'Viele Selbstständige glauben, eine professionelle Website sei zu teuer. Wir zeigen, wann sie sich rechnet – mit echten Zahlen.',
    excerpt: 'Ein Neukunde pro Monat über die Website reicht meist, um die Kosten zu decken. Warum "zu teuer" der häufigste und teuerste Denkfehler beim Thema Website ist.',
    datum: '2026-07-28',
    lesezeit: '6 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-zu-teuer.webp',
    einwand: 'Zu teuer',
  },
  {
    slug: 'alte-website-modernisieren',
    titel: 'Alte Website: Wann ein Relaunch mehr bringt als Weitermachen',
    description: 'Du hast schon eine Website – aber wann ist es Zeit für einen Relaunch? Diese Zeichen sagen dir, ob deine alte Seite mehr schadet als nützt.',
    excerpt: 'Eine veraltete Website kann aktiv Kunden abschrecken. Diese Anzeichen verraten, ob deine bestehende Seite dir hilft oder im Weg steht.',
    datum: '2026-08-04',
    lesezeit: '6 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/alte-website-modernisieren.webp',
    einwand: 'Hab schon eine Website',
  },
  {
    slug: 'website-vom-bekannten',
    titel: 'Website vom Neffen: Was du dabei wirklich riskierst',
    description: 'Den Neffen oder einen Bekannten mit der Website beauftragen klingt günstig. Was dabei schiefgehen kann – und warum professionelle Alternativen oft billiger sind.',
    excerpt: 'Günstig ist nicht gratis: Warum Websites von Bekannten oft teurer werden als gedacht – und was du stattdessen besser machst.',
    datum: '2026-08-11',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-vom-bekannten.webp',
    einwand: 'Mein Neffe macht das',
  },
  {
    slug: 'lohnt-sich-eine-website',
    titel: 'Lohnt sich eine Website wirklich? Ehrliche Antwort mit Zahlen',
    description: 'Bringt eine Website wirklich Kunden? Wir liefern keine Marketing-Versprechen, sondern ehrliche Zahlen – für wen es sich lohnt und für wen nicht.',
    excerpt: 'Statt Versprechen liefern wir Zahlen: Wann eine Website sich lohnt, wann nicht – und was du tun musst, damit sie tatsächlich Anfragen bringt.',
    datum: '2026-08-18',
    lesezeit: '7 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/lohnt-sich-eine-website.webp',
    einwand: 'Bringt mir nichts',
  },
  {
    slug: 'website-ohne-zeitaufwand',
    titel: 'Website ohne Zeitaufwand: So geht es wirklich',
    description: 'Keine Zeit für eine Website? Mit dem richtigen Anbieter brauchst du kaum eigene Zeit – wir erklären wie.',
    excerpt: 'Wer eine Website selbst baut oder pflegt, braucht Zeit. Wer die richtige Lösung wählt, nicht. Wie eine professionelle Website ohne eigenen Aufwand funktioniert.',
    datum: '2026-08-25',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-ohne-zeitaufwand.webp',
    einwand: 'Keine Zeit',
  },
  {
    slug: 'website-sofort-oder-spaeter',
    titel: 'Website jetzt oder später? Was das Warten wirklich kostet',
    description: 'Viele Selbstständige schieben die eigene Website auf. Was das Warten konkret kostet – und warum der beste Zeitpunkt immer "jetzt" ist.',
    excerpt: 'Jeder Monat ohne Website ist ein Monat, in dem Konkurrenten Kunden gewinnen, die eigentlich zu dir könnten. Was das Warten in Euro kostet.',
    datum: '2026-09-01',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-sofort-oder-spaeter.webp',
    einwand: 'Erst später',
  },
  {
    slug: 'social-media-vs-website',
    titel: 'Social Media statt Website? Warum das eine schlechte Idee ist',
    description: 'Reicht Instagram oder Facebook für dein Unternehmen? Warum Social Media eine Website nicht ersetzen kann – und was du verlierst, wenn du es trotzdem versuchst.',
    excerpt: 'Social Media bringt Reichweite, aber kein Google-Ranking, keine eigene Adresse, keine Unabhängigkeit. Warum du beides brauchst – und was Priorität hat.',
    datum: '2026-09-08',
    lesezeit: '6 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/social-media-vs-website.webp',
    einwand: 'Social Media reicht',
  },
  {
    slug: 'kunden-suchen-online',
    titel: 'Niemand sucht online nach mir? Warum das ein Irrtum ist',
    description: 'Glaubst du, deine Kunden suchen nicht im Internet? Die Zahlen sagen etwas anderes – und wir zeigen, wie viele Anfragen du gerade verpasst.',
    excerpt: 'Die meisten Selbstständigen unterschätzen, wie viele ihrer potenziellen Kunden täglich bei Google suchen. Hier sind die echten Zahlen für deine Branche.',
    datum: '2026-09-15',
    lesezeit: '6 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/kunden-suchen-online.webp',
    einwand: 'Niemand sucht nach mir',
  },
  {
    slug: 'mehr-kunden-website',
    titel: 'Genug Kunden? Warum eine Website trotzdem sinnvoll ist',
    description: 'Dein Auftragskalender ist voll – wozu dann eine Website? Wir erklären, warum gut ausgelastete Selbstständige trotzdem eine Website brauchen.',
    excerpt: 'Wer heute ausgelastet ist, muss für morgen vorsorgen. Eine Website sichert deinen Kundenstrom – auch wenn Empfehlungen gerade gut laufen.',
    datum: '2026-09-22',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/mehr-kunden-website.webp',
    einwand: 'Hab genug Kunden',
  },
  {
    slug: 'website-einfach-erklaert',
    titel: 'Website einfach erklärt: Was du wirklich wissen musst (und was nicht)',
    description: 'Eine Website klingt technisch und kompliziert? Wir erklären, wie eine professionelle Website ohne Technikwissen funktioniert.',
    excerpt: 'Du musst kein Technik-Experte sein, um eine professionelle Website zu haben. Was du wirklich wissen musst – und was komplett jemand anderes übernimmt.',
    datum: '2026-09-29',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-einfach-erklaert.webp',
    einwand: 'Zu kompliziert',
  },
  {
    slug: 'website-agentur-abzocke',
    titel: 'Von der Web-Agentur enttäuscht? So machst du es beim nächsten Mal besser',
    description: 'Schlechte Erfahrungen mit Web-Agenturen sind häufig. Wir erklären, warum es schiefläuft – und wie du dich beim nächsten Mal absicherst.',
    excerpt: 'Überhöhte Preise, verspätete Lieferung, schlechter Support – wer das erlebt hat, ist vorsichtig. Wie du erkennst, ob ein Anbieter seriös ist.',
    datum: '2026-10-06',
    lesezeit: '7 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-agentur-abzocke.webp',
    einwand: 'Schon mal abgezockt worden',
  },
  {
    slug: 'baukasten-vs-profi-website',
    titel: 'Website-Baukasten vs. professionelle Website: Was du wirklich bekommst',
    description: 'Wix, Jimdo, Squarespace – reicht ein Baukasten für dein Unternehmen? Ein ehrlicher Vergleich ohne Werbung.',
    excerpt: 'Baukästen sind günstig und schnell. Aber was kosten sie in Sachen SEO, Glaubwürdigkeit und Zeitaufwand? Ein nüchterner Vergleich mit echten Zahlen.',
    datum: '2026-10-13',
    lesezeit: '6 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/baukasten-vs-profi-website.webp',
    einwand: 'Baukasten reicht',
  },
  {
    slug: 'google-my-business-vs-website',
    titel: 'Google My Business statt Website? Was du dabei verlierst',
    description: 'Ein Google Unternehmensprofil ist kostenlos und reicht doch nicht. Warum GMB eine Website ergänzt, aber nicht ersetzt.',
    excerpt: 'Google My Business ist ein guter Start – aber kein Ersatz für eine eigene Website. Was du ohne eigene Seite an Sichtbarkeit und Kontrolle verlierst.',
    datum: '2026-10-20',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/google-my-business-vs-website.webp',
    einwand: 'Google My Business reicht',
  },
  {
    slug: 'website-fuer-aeltere-unternehmer',
    titel: 'Kurz vor der Rente: Lohnt sich eine Website noch?',
    description: 'Noch 5–10 Jahre bis zur Rente – zahlt sich eine Website überhaupt noch aus? Wir rechnen es durch.',
    excerpt: 'Auch wer in wenigen Jahren aufhören will, kann von einer guten Website profitieren – sei es für mehr Aufträge jetzt oder einen höheren Verkaufspreis später.',
    datum: '2026-10-27',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-fuer-aeltere-unternehmer.webp',
    einwand: 'Kurz vor der Rente',
  },
  {
    slug: 'website-ohne-technik',
    titel: 'Website ohne Technik: So geht es auch für Nicht-Techniker',
    description: 'Keine Ahnung von Technik? Kein Problem. Wie eine professionelle Website funktioniert, ohne dass du auch nur eine Zeile Code verstehst.',
    excerpt: 'Du musst keine Technik verstehen, um online erfolgreich zu sein. Was du tun musst – und was komplett vom Profi übernommen wird.',
    datum: '2026-11-03',
    lesezeit: '5 Min.',
    kategorie: 'Einwände & Mythen',
    bild: '/blog/website-ohne-technik.webp',
    einwand: 'Nicht technikaffin',
  },
]

/**
 * Gibt alle Artikel zurück, deren Datum <= heute liegt (ISO-String-Vergleich).
 * Artikel werden nach Datum absteigend sortiert (neueste zuerst).
 */
export function veroeffentlichteArtikel(): BlogArtikel[] {
  const heute = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
  return BLOG_ARTIKEL
    .filter((a) => a.datum <= heute)
    .sort((a, b) => b.datum.localeCompare(a.datum))
}

/**
 * Findet einen Artikel anhand seines Slugs. Gibt undefined zurück, wenn nicht gefunden.
 */
export function findeArtikel(slug: string): BlogArtikel | undefined {
  return BLOG_ARTIKEL.find((a) => a.slug === slug)
}
