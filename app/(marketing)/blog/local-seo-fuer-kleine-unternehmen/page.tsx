import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Local SEO für kleine Unternehmen – Der komplette Guide",
  description: "Local SEO für kleine Unternehmen: Wie du bei Google Maps und in der lokalen Suche ganz oben landest. Praxisguide mit konkreten Schritten für 2026.",
  openGraph: {
    title: "Local SEO für kleine Unternehmen – Der komplette Guide",
    description: "So wirst du als lokales Unternehmen bei Google gefunden. Praxisguide mit konkreten Schritten.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  { q: "Was ist Local SEO?", a: "Local SEO (lokale Suchmaschinenoptimierung) umfasst alle Maßnahmen, die dafür sorgen, dass dein Unternehmen bei ortsbezogenen Google-Suchen gefunden wird. Zum Beispiel wenn jemand 'Friseur in der Nähe' oder 'Steuerberater Hamburg' googelt. Local SEO bringt dich in die Google-Kartenansicht und die lokalen Suchergebnisse." },
  { q: "Wie wichtig ist ein Google Unternehmensprofil?", a: "Sehr wichtig. Das Google Unternehmensprofil (früher Google My Business) ist der wichtigste Faktor für Local SEO. Es sorgt dafür, dass du in der Google-Kartenansicht erscheinst, die bei lokalen Suchen ganz oben angezeigt wird. Ohne Profil bist du dort unsichtbar." },
  { q: "Wie bekomme ich mehr Google-Bewertungen?", a: "Bitte zufriedene Kunden aktiv um eine Bewertung. Am besten direkt nach Abschluss eines Auftrags. Schicke ihnen den direkten Link zu deinem Google-Profil per E-Mail, SMS oder WhatsApp. Je einfacher du es machst, desto mehr Bewertungen bekommst du." },
  { q: "Wie lange dauert es, bis Local SEO wirkt?", a: "Erste Verbesserungen siehst du oft nach 4 bis 8 Wochen. Deutliche Ergebnisse – also regelmäßige Anfragen über Google – dauern in der Regel 3 bis 6 Monate. Local SEO ist eine langfristige Strategie, kein Sprint." },
  { q: "Kann ich Local SEO selbst machen?", a: "Die Grundlagen schon: Google Unternehmensprofil einrichten, Bewertungen sammeln, lokale Keywords auf der Website verwenden. Für fortgeschrittene Maßnahmen wie technische SEO-Optimierung und strukturierte Daten lohnt sich professionelle Hilfe – die ist im Abo-Modell von Webseiten-Verlag Deutschland inklusive." },
];

export default function BlogArticle() {
  return (
    <>
      {/* FAQ Schema */}
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      })}} />

      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Local SEO für kleine Unternehmen – Der komplette Guide",
        "author": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "publisher": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "datePublished": "2026-05-10",
        "dateModified": "2026-05-10",
        "description": "Wie kleine Unternehmen mit Local SEO bei Google gefunden werden.",
      })}} />

      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/ergebnisse">Ergebnisse</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">Kostenlose Demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "rgba(37,99,235,0.15)", padding: "4px 12px", borderRadius: 999 }}>
              SEO & Sichtbarkeit
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              10. Mai 2026 · 8 Min. Lesezeit
            </span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Local SEO für kleine Unternehmen: Der <span className="accent">komplette Guide</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Wie du als lokales Unternehmen bei Google gefunden wirst – Schritt für Schritt, ohne Vorkenntnisse.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              46 % aller Google-Suchen haben einen lokalen Bezug. &ldquo;Zahnarzt in der Nähe&rdquo;, &ldquo;Bäckerei Hamburg Altona&rdquo;, &ldquo;Schlüsseldienst Köln&rdquo; – jeden Tag suchen Millionen Menschen nach lokalen Unternehmen. Die Frage ist: Finden sie dabei dich oder deine Konkurrenz?
            </p>
            <p>
              In diesem Guide erfährst du Schritt für Schritt, wie du mit Local SEO bei Google sichtbar wirst – auch ohne SEO-Vorkenntnisse und auch ohne großes Budget.
            </p>

            {/* H2: Was ist Local SEO? */}
            <h2 style={h2Style}>Was ist Local SEO und warum ist es wichtig?</h2>
            <div style={defBox}>
              <strong>Definition:</strong> Local SEO (lokale Suchmaschinenoptimierung) umfasst alle Maßnahmen, die dafür sorgen, dass dein Unternehmen bei ortsbezogenen Suchanfragen bei Google erscheint – in der Kartenansicht (Google Maps) und in den organischen Suchergebnissen.
            </div>
            <p>
              Warum ist das wichtig? Weil lokale Suchen kaufbereite Kunden bringen. Wer &ldquo;Elektriker Düsseldorf&rdquo; googelt, sucht nicht aus Langeweile – er hat ein konkretes Problem und will es jetzt lösen. Und 78 % der lokalen mobilen Suchen führen innerhalb von 24 Stunden zu einem Besuch oder Kauf.
            </p>
            <p>
              Für kleine Unternehmen ist Local SEO der effektivste und günstigste Weg, neue Kunden zu gewinnen. Du brauchst kein riesiges Marketingbudget – du brauchst nur die richtigen Grundlagen.
            </p>

            {/* H2: Google Unternehmensprofil */}
            <h2 style={h2Style}>Schritt 1: Google Unternehmensprofil einrichten und optimieren</h2>
            <p>
              Das Google Unternehmensprofil (früher Google My Business) ist das wichtigste Werkzeug für Local SEO. Es ist kostenlos und entscheidet darüber, ob du in der Google-Kartenansicht erscheinst – dem sogenannten &ldquo;Local Pack&rdquo;, das bei lokalen Suchen ganz oben angezeigt wird.
            </p>

            <h3 style={h3Style}>So richtest du es ein</h3>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 8 }}>Gehe zu <strong>business.google.com</strong> und melde dich mit deinem Google-Konto an</li>
              <li style={{ marginBottom: 8 }}>Trage deinen Firmennamen, Adresse, Telefonnummer und Kategorie ein</li>
              <li style={{ marginBottom: 8 }}>Verifiziere dein Unternehmen (meist per Postkarte mit Code)</li>
              <li>Fülle alle Felder aus: Öffnungszeiten, Beschreibung, Fotos, Leistungen</li>
            </ol>

            <h3 style={h3Style}>So optimierst du es</h3>
            <ul style={ulStyle}>
              <li><strong>Fotos:</strong> Lade mindestens 10 hochwertige Fotos hoch – von deinem Geschäft, deinem Team, deinen Produkten oder Projekten</li>
              <li><strong>Beiträge:</strong> Veröffentliche regelmäßig Updates (Angebote, News, Tipps) – das zeigt Google, dass dein Profil aktiv ist</li>
              <li><strong>Kategorien:</strong> Wähle eine Hauptkategorie und 2 bis 3 Nebenkategorien, die dein Angebot genau beschreiben</li>
              <li><strong>Beschreibung:</strong> Nutze die 750 Zeichen, um klar zu beschreiben, was du anbietest und wo du tätig bist</li>
            </ul>

            {/* H2: Google-Bewertungen */}
            <h2 style={h2Style}>Schritt 2: Google-Bewertungen systematisch aufbauen</h2>
            <p>
              Bewertungen sind der zweitwichtigste Rankingfaktor für Local SEO. Je mehr positive Bewertungen du hast, desto höher wirst du bei Google angezeigt – und desto eher klicken potenzielle Kunden auf dein Profil.
            </p>
            <ul style={ulStyle}>
              <li><strong>Bitte aktiv um Bewertungen.</strong> Die meisten zufriedenen Kunden bewerten dich gerne – sie denken nur nicht von allein daran. Frag direkt nach Projektabschluss</li>
              <li><strong>Mach es einfach.</strong> Schicke den direkten Bewertungslink per WhatsApp, E-Mail oder SMS. Je weniger Klicks nötig sind, desto mehr Bewertungen bekommst du</li>
              <li><strong>Antworte auf jede Bewertung.</strong> Positiv oder negativ – eine professionelle Antwort zeigt Wertschätzung und signalisiert Google, dass du aktiv bist</li>
              <li><strong>Kaufe keine Bewertungen.</strong> Google erkennt Fake-Bewertungen und straft dich ab. Echte Bewertungen von echten Kunden sind das Einzige, was langfristig zählt</li>
            </ul>
            <div style={defBox}>
              <strong>Tipp:</strong> Erstelle einen QR-Code mit deinem Google-Bewertungslink und drucke ihn auf Visitenkarten, Rechnungen oder einen Aufsteller im Geschäft. So machst du es deinen Kunden maximal einfach.
            </div>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Website mit Local-SEO-Optimierung?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Unsere Websites sind von Anfang an für lokale Google-Suchen optimiert. Ab 99 € netto/Monat, ohne Einmalkosten.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Lokale Keywords */}
            <h2 style={h2Style}>Schritt 3: Lokale Keywords auf deiner Website verwenden</h2>
            <p>
              Keywords sind die Suchbegriffe, die deine potenziellen Kunden bei Google eingeben. Für Local SEO sind das Kombinationen aus deiner Dienstleistung und deinem Standort:
            </p>
            <ul style={ulStyle}>
              <li>&ldquo;Friseur München Schwabing&rdquo;</li>
              <li>&ldquo;Steuerberater Hamburg Altona&rdquo;</li>
              <li>&ldquo;Dachdecker Köln Ehrenfeld&rdquo;</li>
              <li>&ldquo;Physiotherapie in der Nähe&rdquo;</li>
            </ul>
            <p>
              Diese Keywords gehören an die richtigen Stellen auf deiner Website:
            </p>
            <ul style={ulStyle}>
              <li><strong>Seitentitel (Title Tag):</strong> &ldquo;Friseur München Schwabing – Salon [Name]&rdquo;</li>
              <li><strong>Überschriften (H1, H2):</strong> &ldquo;Ihr Friseur in München Schwabing&rdquo;</li>
              <li><strong>Fließtext:</strong> Natürlich eingebaut, nicht gekünstelt. Google erkennt Keyword-Stuffing und straft es ab</li>
              <li><strong>Meta-Beschreibung:</strong> Der Text, der bei Google unter deinem Link angezeigt wird</li>
              <li><strong>Bildnamen und Alt-Texte:</strong> &ldquo;friseur-muenchen-schwabing-salon.jpg&rdquo; statt &ldquo;IMG_4523.jpg&rdquo;</li>
            </ul>

            {/* H2: Mobile Optimierung */}
            <h2 style={h2Style}>Schritt 4: Mobile Optimierung – Pflicht, nicht Kür</h2>
            <p>
              Über 60 % der lokalen Suchen kommen von Smartphones. Wenn deine Website auf dem Handy nicht gut funktioniert, verlierst du die Mehrheit deiner potenziellen Kunden.
            </p>
            <p>
              Was &ldquo;mobile optimiert&rdquo; bedeutet:
            </p>
            <ul style={ulStyle}>
              <li><strong>Responsive Design:</strong> Die Website passt sich automatisch an jede Bildschirmgröße an</li>
              <li><strong>Schnelle Ladezeit:</strong> Unter 3 Sekunden. Jede Sekunde länger kostet dich Besucher</li>
              <li><strong>Klickbare Telefonnummer:</strong> Ein Tipp auf die Nummer und der Kunde ruft direkt an</li>
              <li><strong>Große, gut lesbare Schrift:</strong> Kein Zoomen nötig</li>
              <li><strong>Einfache Navigation:</strong> Maximal 3 Klicks bis zum Kontaktformular</li>
            </ul>
            <p>
              Google bewertet deine Website seit 2021 primär nach der mobilen Version (Mobile-First-Indexierung). Eine nicht-mobile Website wird bei Google abgestraft – unabhängig davon, wie gut die Desktop-Version aussieht.
            </p>

            {/* H2: NAP-Konsistenz */}
            <h2 style={h2Style}>Schritt 5: NAP-Konsistenz – dein Name muss überall gleich sein</h2>
            <div style={defBox}>
              <strong>NAP steht für:</strong> Name, Address, Phone (Name, Adresse, Telefonnummer). Diese drei Angaben müssen überall im Internet exakt gleich sein – auf deiner Website, im Google-Profil, in Branchenverzeichnissen und auf Social Media.
            </div>
            <p>
              Warum? Google gleicht deine Daten aus verschiedenen Quellen ab. Wenn dein Firmenname auf der Website &ldquo;Müller Elektrotechnik GmbH&rdquo; heißt, im Google-Profil aber &ldquo;Elektro Müller&rdquo; und im Branchenbuch &ldquo;Müller Elektro GmbH&rdquo;, verwirrt das Google. Die Folge: schlechteres Ranking.
            </p>
            <p>
              Trage dein Unternehmen in die wichtigsten Branchenverzeichnisse ein – immer mit den exakt gleichen Daten:
            </p>
            <ul style={ulStyle}>
              <li>Google Unternehmensprofil</li>
              <li>Gelbe Seiten / Das Örtliche</li>
              <li>Yelp</li>
              <li>Branchenspezifische Verzeichnisse (z. B. MyHammer für Handwerker)</li>
              <li>Facebook, Instagram (Geschäftsprofile)</li>
            </ul>

            {/* H2: Häufige Fehler */}
            <h2 style={h2Style}>Die 5 häufigsten Local-SEO-Fehler</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Kein Google Unternehmensprofil.</strong> Der häufigste und teuerste Fehler. Richte es ein – es ist kostenlos und dauert 15 Minuten.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Keine Bewertungen sammeln.</strong> Viele Unternehmen haben 0 bis 2 Bewertungen. Bereits 10 echte Bewertungen machen einen großen Unterschied.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Keine lokalen Keywords.</strong> Wenn auf deiner Website nirgends dein Standort steht, weiß Google nicht, wo du bist.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Website nicht mobilfreundlich.</strong> Über 60 % der lokalen Suchen kommen vom Smartphone. Keine mobile Website = keine lokalen Kunden.
              </li>
              <li>
                <strong>Inkonsistente Unternehmensdaten.</strong> Name, Adresse und Telefonnummer müssen überall gleich sein.
              </li>
            </ol>

            {/* H2: FAQ */}
            <h2 style={h2Style}>Häufig gestellte Fragen</h2>
            {faqData.map((f, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                  {f.q}
                </h3>
                <p style={{ color: "var(--ink-soft)" }}>{f.a}</p>
              </div>
            ))}

            {/* Fazit */}
            <h2 style={h2Style}>Fazit: Local SEO ist kein Hexenwerk</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Richte dein Google Unternehmensprofil ein.</strong> Das ist die Basis und kostet nichts.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Sammle aktiv Google-Bewertungen.</strong> Sie sind der stärkste Vertrauensfaktor und verbessern dein Ranking.
              </li>
              <li>
                <strong>Habe eine schnelle, mobilfreundliche Website mit lokalen Keywords.</strong> Im Abo-Modell bekommst du das ab 99 € netto/Monat – inklusive SEO-Optimierung.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Website mit eingebauter Local-SEO-Power?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
                Unsere Websites sind von Tag eins für lokale Sichtbarkeit optimiert. Lass uns in 15 Minuten besprechen, wie das für dein Business aussieht.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "18px 40px", fontSize: 16 }}>
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}

