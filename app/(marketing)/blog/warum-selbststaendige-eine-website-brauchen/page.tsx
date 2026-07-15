import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Warum Selbstständige 2026 eine Website brauchen",
  description: "Warum Social Media allein nicht reicht und Selbstständige 2026 eine eigene Website brauchen. Praxistipps für Glaubwürdigkeit, Google-Sichtbarkeit und Kundengewinnung.",
  openGraph: {
    title: "Warum Selbstständige 2026 eine Website brauchen",
    description: "Social Media reicht nicht. Warum eine eigene Website für Selbstständige unverzichtbar ist.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  { q: "Reicht nicht eine Instagram-Seite statt einer Website?", a: "Nein. Social Media ist eine Ergänzung, kein Ersatz. Du bist auf einer fremden Plattform abhängig von deren Algorithmus, Regeln und Reichweite. Deine Website gehört dir, ist bei Google auffindbar und vermittelt professionelle Glaubwürdigkeit – das kann kein Social-Media-Profil ersetzen." },
  { q: "Brauche ich als Einzelunternehmer wirklich eine Website?", a: "Ja. Kunden googeln dich, bevor sie dich kontaktieren. Ohne Website finden sie entweder nichts oder – noch schlimmer – nur deine Konkurrenz. Eine eigene Website ist deine digitale Visitenkarte und oft der erste Eindruck, den ein potenzieller Kunde von dir bekommt." },
  { q: "Was kostet eine Website für Selbstständige?", a: "Im Abo-Modell ab 99 Euro pro Monat ohne Einmalkosten. Bei einer Agentur zwischen 3.000 und 8.000 Euro einmalig plus laufende Wartungskosten. Für die meisten Selbstständigen ist das Abo-Modell die risikoärmste Variante." },
  { q: "Wie viele Seiten braucht eine Website für Selbstständige?", a: "In der Regel reichen 3 bis 7 Seiten: Startseite, Leistungen (oder Angebot), Über mich, Kontakt und optional Referenzen oder ein Blog. Wichtiger als die Seitenanzahl ist, dass die Inhalte klar und auf deine Zielgruppe zugeschnitten sind." },
  { q: "Wie schnell kann meine Website online sein?", a: "Im Abo-Modell ist deine Website in der Regel innerhalb weniger Tage fertig und online. Bei einer klassischen Agentur dauert ein Webprojekt oft 4 bis 12 Wochen. Je schneller du online bist, desto schneller kommen die ersten Anfragen." },
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
        "headline": "Warum Selbstständige 2026 eine Website brauchen",
        "author": { "@type": "Organization", "name": "Webseitenverlag Deutschland" },
        "publisher": { "@type": "Organization", "name": "Webseitenverlag Deutschland" },
        "datePublished": "2026-05-11",
        "dateModified": "2026-05-11",
        "description": "Warum Social Media allein nicht reicht und Selbstständige eine eigene Website brauchen.",
      })}} />

      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image src="/logo.png" alt="Webseitenverlag Deutschland" width={160} height={50} style={{ height: 40, width: "auto" }} priority />
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/ergebnisse">Ergebnisse</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "rgba(37,99,235,0.15)", padding: "4px 12px", borderRadius: 999 }}>
              Selbstständigkeit
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              11. Mai 2026 · 7 Min. Lesezeit
            </span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Warum Selbstständige 2026 eine <span className="accent">Website brauchen</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Social Media ist kein Ersatz. Warum eine eigene Website für dein Business unverzichtbar ist – und was sie dir bringt.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              &ldquo;Ich habe doch Instagram und LinkedIn – wozu brauche ich noch eine Website?&rdquo; Diese Frage hören wir jede Woche. Die Antwort ist unbequem, aber ehrlich: Weil Social Media dir nicht gehört – und weil Kunden, die dich googeln, eine Website erwarten.
            </p>
            <p>
              In diesem Artikel erfährst du, warum eine eigene Website 2026 für Selbstständige und Freiberufler unverzichtbar ist, was sie dir konkret bringt und wie du mit minimalem Aufwand online sichtbar wirst.
            </p>

            {/* H2: Das Problem mit Social Media */}
            <h2 style={h2Style}>Das Problem mit &ldquo;Ich bin ja auf Social Media&rdquo;</h2>
            <p>
              Social Media ist großartig für Reichweite, Community und Markenaufbau. Aber es hat drei fundamentale Schwächen als einzige Online-Präsenz:
            </p>
            <ul style={ulStyle}>
              <li><strong>Du bist Mieter, nicht Eigentümer.</strong> Instagram, LinkedIn oder Facebook können dein Profil jederzeit einschränken, den Algorithmus ändern oder deinen Account sperren. Du baust auf fremdem Grund.</li>
              <li><strong>Google zeigt keine Instagram-Posts.</strong> Wenn jemand &ldquo;Steuerberater München&rdquo; googelt, erscheinen Websites – keine Social-Media-Profile. Ohne Website bist du bei der wichtigsten Suchmaschine unsichtbar.</li>
              <li><strong>Kein professioneller Eindruck.</strong> Stell dir vor, du willst einen Anwalt beauftragen und findest nur eine Facebook-Seite. Vertrauenerweckend? Eher nicht. Eine eigene Website signalisiert: Hier arbeitet jemand professionell.</li>
            </ul>
            <div style={defBox}>
              <strong>Faustregel:</strong> Social Media ist der Megafon, deine Website ist das Geschäft. Das Megafon bringt Aufmerksamkeit – aber kaufen tun die Leute im Laden.
            </div>

            {/* H2: Die Customer Journey */}
            <h2 style={h2Style}>Wie Kunden dich 2026 wirklich finden</h2>
            <p>
              Die typische Customer Journey eines potenziellen Kunden sieht 2026 so aus:
            </p>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Auslöser:</strong> Der Kunde hat ein Problem oder einen Bedarf (&ldquo;Ich brauche einen Fotografen für unsere Firmenfeier&rdquo;)
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Suche:</strong> Er googelt oder fragt im Bekanntenkreis
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Prüfung:</strong> Er besucht deine Website, liest Referenzen, prüft Leistungen und Preise
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Kontakt:</strong> Wenn der Eindruck stimmt, ruft er an oder schreibt eine Nachricht
              </li>
              <li>
                <strong>Auftrag:</strong> Im persönlichen Gespräch wird der Deal gemacht
              </li>
            </ol>
            <p>
              Ohne Website fällst du bei Schritt 2 und 3 komplett raus. Selbst wenn dich jemand empfiehlt, wird der Empfohlene als Nächstes deine Website besuchen. Gibt es keine, springt er ab – und geht zur Konkurrenz.
            </p>

            {/* H2: Glaubwürdigkeit */}
            <h2 style={h2Style}>Website = Glaubwürdigkeit</h2>
            <p>
              Eine Studie von Verisign zeigt: 84 % der Konsumenten halten ein Unternehmen mit eigener Website für glaubwürdiger als eines, das nur auf Social Media präsent ist. Für Selbstständige ist das besonders relevant, weil du als Einzelperson ohnehin mehr Vertrauen aufbauen musst als ein großes Unternehmen.
            </p>
            <p>
              Deine Website ist der Ort, an dem du kontrollierst, wie du wahrgenommen wirst. Kein Algorithmus entscheidet, was gezeigt wird. Keine Plattform-Regeln schränken dich ein. Du bestimmst:
            </p>
            <ul style={ulStyle}>
              <li>Welche Leistungen du hervorhebst</li>
              <li>Welche Referenzen du zeigst</li>
              <li>Wie du dich und dein Angebot positionierst</li>
              <li>Welche Kontaktmöglichkeiten du anbietest</li>
            </ul>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Deine professionelle Website ab 99 Euro/Monat
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Ohne Einmalkosten, fertig in wenigen Tagen, monatlich kündbar. Lass uns sprechen.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                <span>Kostenloses Erstgespräch buchen →</span>
              </Link>
            </div>

            {/* H2: Google-Sichtbarkeit */}
            <h2 style={h2Style}>Bei Google gefunden werden – ohne Website unmöglich</h2>
            <p>
              Google ist nach wie vor die Anlaufstelle Nummer eins, wenn Menschen nach Dienstleistungen suchen. Und Google zeigt in seinen Ergebnissen bevorzugt Websites – keine Social-Media-Profile.
            </p>
            <p>
              Wenn du als Selbstständiger bei Google sichtbar sein willst, brauchst du:
            </p>
            <ul style={ulStyle}>
              <li><strong>Eine eigene Website</strong> mit relevanten Inhalten zu deinen Leistungen</li>
              <li><strong>Lokale Keywords,</strong> z. B. &ldquo;Steuerberater Hamburg&rdquo; oder &ldquo;Fotograf Berlin Hochzeit&rdquo;</li>
              <li><strong>Ein Google Unternehmensprofil,</strong> das mit deiner Website verknüpft ist</li>
              <li><strong>Aktuelle, hilfreiche Inhalte,</strong> die zeigen, dass du Experte in deinem Bereich bist</li>
            </ul>
            <p>
              Ohne Website hast du bei Google keine Chance. So einfach ist das.
            </p>

            {/* H2: Was eine gute Website für Selbstständige enthält */}
            <h2 style={h2Style}>Was auf deine Website gehört</h2>
            <p>
              Du brauchst keine 20 Seiten. Für die meisten Selbstständigen reichen 4 bis 6 Seiten völlig aus:
            </p>

            <h3 style={h3Style}>Startseite</h3>
            <p>
              Dein Angebot in einem Satz, dein Alleinstellungsmerkmal, ein klarer Call-to-Action (&ldquo;Jetzt Angebot anfragen&rdquo; oder &ldquo;Termin buchen&rdquo;).
            </p>

            <h3 style={h3Style}>Leistungen / Angebot</h3>
            <p>
              Was bietest du an? Für wen? Zu welchem Preis (wenn möglich)? Konkret und verständlich, ohne Buzzwords.
            </p>

            <h3 style={h3Style}>Über mich</h3>
            <p>
              Wer bist du? Was qualifiziert dich? Warum sollte man dir vertrauen? Ein sympathisches Foto und eine ehrliche Beschreibung wirken mehr als jeder Marketingtext.
            </p>

            <h3 style={h3Style}>Referenzen / Kundenstimmen</h3>
            <p>
              Nichts überzeugt so sehr wie zufriedene Kunden. Sammle Testimonials und zeige sie prominent auf deiner Seite.
            </p>

            <h3 style={h3Style}>Kontakt</h3>
            <p>
              Kontaktformular, Telefonnummer, E-Mail-Adresse, ggf. Terminbuchung. Je einfacher der Kontakt, desto mehr Anfragen.
            </p>

            {/* H2: Typische Ausreden */}
            <h2 style={h2Style}>Die 3 häufigsten Ausreden – und warum sie nicht gelten</h2>

            <h3 style={h3Style}>&ldquo;Ich habe kein Budget für eine Website&rdquo;</h3>
            <p>
              Im Abo-Modell kostet eine professionelle Website 99 Euro pro Monat – ohne Einmalkosten. Das ist weniger als ein Geschäftsessen. Und ein einziger neuer Kunde über die Website refinanziert das gesamte Jahresabo.
            </p>

            <h3 style={h3Style}>&ldquo;Ich habe keine Zeit, mich darum zu kümmern&rdquo;</h3>
            <p>
              Genau deshalb gibt es das Abo-Modell. Wir kümmern uns um Design, Technik, Hosting, Updates und Support. Dein Zeitaufwand: ein Erstgespräch und gelegentliche Rückmeldungen zu Inhalten. Das war&apos;s.
            </p>

            <h3 style={h3Style}>&ldquo;Meine Kunden kommen über Empfehlungen&rdquo;</h3>
            <p>
              Super – aber auch empfohlene Kunden googeln dich, bevor sie anrufen. Und was passiert, wenn die Empfehlungen mal nachlassen? Eine Website gibt dir einen zweiten, planbaren Kanal für die Kundengewinnung.
            </p>

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
            <h2 style={h2Style}>Fazit: Deine Website ist 2026 Pflicht, nicht Kür</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Social Media ersetzt keine Website.</strong> Es ergänzt sie. Deine Website ist die Basis, Social Media der Verstärker.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Kunden erwarten eine Website.</strong> Ohne verlierst du Glaubwürdigkeit und potenzielle Aufträge.
              </li>
              <li>
                <strong>Es war noch nie so einfach und günstig</strong> wie 2026, eine professionelle Website zu bekommen. Ab 99 Euro/Monat, fertig in wenigen Tagen, ohne technisches Vorwissen.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Bereit, online sichtbar zu werden?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
                In 15 Minuten besprechen wir deine Website – ohne Verkaufsdruck, ohne Verpflichtung.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "18px 40px", fontSize: 16 }}>
                <span>Kostenloses Erstgespräch buchen →</span>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseitenverlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ═══════════════════════════════════════
   STYLES
   ═══════════════════════════════════════ */
const h2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: "clamp(24px, 3vw, 32px)", lineHeight: 1.15,
  marginTop: 56, marginBottom: 20, letterSpacing: "-0.02em",
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
};

const h3Style: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: 21, lineHeight: 1.2,
  marginTop: 32, marginBottom: 12,
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
};

const ulStyle: React.CSSProperties = {
  paddingLeft: 20, marginBottom: 24,
  display: "flex", flexDirection: "column", gap: 8,
};

const defBox: React.CSSProperties = {
  padding: "20px 24px", borderRadius: 16,
  background: "rgba(37,99,235,0.04)", border: "1px solid rgba(37,99,235,0.12)",
  marginBottom: 24, fontSize: 15, lineHeight: 1.65,
};

const ctaBox: React.CSSProperties = {
  padding: "32px", borderRadius: 20,
  background: "var(--cream)", border: "1px solid var(--border)",
  marginTop: 40, marginBottom: 40,
};

const thStyle: React.CSSProperties = {
  padding: "12px 14px", textAlign: "left", fontWeight: 600,
  fontFamily: "var(--font-mono)", fontSize: 12,
  letterSpacing: "0.05em", textTransform: "uppercase",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px", verticalAlign: "top",
};

// Suppress unused variable warnings for shared style constants
void thStyle;
void tdStyle;
