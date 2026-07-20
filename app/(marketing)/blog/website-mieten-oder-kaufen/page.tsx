import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Website mieten oder kaufen? Ehrlicher Vergleich 2026",
  description: "Website mieten oder kaufen? Wir vergleichen beide Modelle ehrlich: Kosten, Vor- und Nachteile, Break-even-Analyse. Mit konkreten Zahlen für 2026.",
  openGraph: {
    title: "Website mieten oder kaufen? Ehrlicher Vergleich 2026",
    description: "Mieten vs. Kaufen: Was lohnt sich wann? Ehrlicher Vergleich mit Break-even-Analyse.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  { q: "Was bedeutet 'Website mieten'?", a: "Beim Mieten zahlst du einen monatlichen Festbetrag (z. B. 99 Euro/Monat) und erhältst dafür eine professionelle Website inklusive Design, Hosting, Pflege, Updates und Support. Du zahlst keine Einmalgebühr. Bei Kündigung wird die Seite deaktiviert, deine Inhalte kannst du exportieren." },
  { q: "Ab wann lohnt sich Mieten mehr als Kaufen?", a: "Finanziell lohnt sich Mieten besonders in den ersten 3 bis 5 Jahren. Bei einer Agentur-Website für 5.000 Euro plus 100 Euro monatliche Wartung zahlst du im ersten Jahr 6.200 Euro. Im Abo-Modell zahlst du 1.188 Euro – eine Ersparnis von über 5.000 Euro. Der Break-even liegt typischerweise erst nach 4 bis 6 Jahren." },
  { q: "Gehört mir die Website im Abo-Modell?", a: "Nein, die Website gehört dir nicht – vergleichbar mit einem Leasing-Auto. Deine Inhalte (Texte, Bilder) gehören dir und können exportiert werden. Der Vorteil: Du musst dich um nichts kümmern – Technik, Updates und Sicherheit sind im Preis enthalten." },
  { q: "Kann ich eine gemietete Website jederzeit kündigen?", a: "Ja, seriöse Anbieter ermöglichen eine monatliche Kündigung. Es gibt keine langfristige Vertragsbindung. Das minimiert dein finanzielles Risiko – wenn es nicht passt, steigst du einfach aus." },
  { q: "Ist eine gemietete Website genauso gut wie eine gekaufte?", a: "Ja. Die Qualität hängt vom Anbieter ab, nicht vom Zahlungsmodell. Abo-Anbieter haben sogar einen Anreiz, dauerhaft gute Qualität zu liefern – weil du sonst einfach kündigst. Bei einer gekauften Website gibt es diesen Anreiz nach der Bezahlung nicht mehr." },
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
        "headline": "Website mieten oder kaufen? Ehrlicher Vergleich 2026",
        "author": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "publisher": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "datePublished": "2026-05-12",
        "dateModified": "2026-05-12",
        "description": "Website mieten oder kaufen? Ehrlicher Vergleich mit Break-even-Analyse für 2026.",
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
          <Link href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "rgba(37,99,235,0.15)", padding: "4px 12px", borderRadius: 999 }}>
              Kosten & Modelle
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              12. Mai 2026 · 7 Min. Lesezeit
            </span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Website mieten oder kaufen? Ein <span className="accent">ehrlicher Vergleich</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Beide Modelle haben ihre Berechtigung. Hier erfährst du, welches 2026 besser zu dir passt – mit konkreten Zahlen.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              Du brauchst eine professionelle Website. Die Frage ist nicht ob, sondern wie: Einmal kaufen und fertig? Oder monatlich mieten und dich um nichts kümmern? Beide Modelle haben Vor- und Nachteile – und die richtige Antwort hängt von deiner Situation ab.
            </p>
            <p>
              In diesem Artikel vergleichen wir beide Modelle ehrlich, rechnen die tatsächlichen Kosten durch und zeigen dir, wann Mieten und wann Kaufen die bessere Wahl ist.
            </p>

            {/* H2: Was bedeutet kaufen, was mieten? */}
            <h2 style={h2Style}>Was bedeutet &ldquo;Website kaufen&rdquo; vs. &ldquo;Website mieten&rdquo;?</h2>

            <div style={defBox}>
              <strong>Website kaufen:</strong> Du zahlst einmalig 3.000 bis 15.000 Euro an eine Agentur oder einen Freelancer. Die Website gehört dir. Du bist danach selbst für Hosting, Wartung, Updates und Sicherheit verantwortlich – oder zahlst extra dafür.
            </div>
            <div style={defBox}>
              <strong>Website mieten (Abo-Modell):</strong> Du zahlst einen monatlichen Festbetrag (ab 99 Euro/Monat). Im Preis enthalten sind Design, Entwicklung, Hosting, Pflege, Updates und Support. Keine Einmalzahlung, monatlich kündbar.
            </div>
            <p>
              Der Unterschied liegt nicht in der Qualität, sondern im Geschäftsmodell. Denk an den Unterschied zwischen einem Eigenheim und einer Mietwohnung – oder zwischen Auto kaufen und leasen.
            </p>

            {/* H2: Kostenvergleich */}
            <h2 style={h2Style}>Der ehrliche Kostenvergleich</h2>
            <p>
              Lass uns konkret rechnen. Wir nehmen eine typische Business-Website mit 5 bis 7 Seiten als Grundlage:
            </p>

            <h3 style={h3Style}>Variante A: Website kaufen (Agentur)</h3>
            <ul style={ulStyle}>
              <li><strong>Einmalkosten:</strong> 5.000 Euro (Design + Entwicklung)</li>
              <li><strong>Hosting:</strong> 15 Euro/Monat = 180 Euro/Jahr</li>
              <li><strong>Wartungsvertrag:</strong> 100 Euro/Monat = 1.200 Euro/Jahr</li>
              <li><strong>Gesamtkosten Jahr 1:</strong> 6.380 Euro</li>
              <li><strong>Gesamtkosten 3 Jahre:</strong> 8.780 Euro</li>
            </ul>

            <h3 style={h3Style}>Variante B: Website mieten (Abo-Modell)</h3>
            <ul style={ulStyle}>
              <li><strong>Einmalkosten:</strong> 0 Euro</li>
              <li><strong>Monatlicher Beitrag:</strong> 99 Euro/Monat = 1.188 Euro/Jahr</li>
              <li><strong>Hosting, Wartung, Support:</strong> Im Preis enthalten</li>
              <li><strong>Gesamtkosten Jahr 1:</strong> 1.188 Euro</li>
              <li><strong>Gesamtkosten 3 Jahre:</strong> 3.564 Euro</li>
            </ul>

            {/* H2: Vergleichstabelle */}
            <h2 style={h2Style}>Mieten vs. Kaufen: Alle Faktoren im Vergleich</h2>
            <div style={{ overflowX: "auto", marginBottom: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={thStyle}></th>
                    <th style={thStyle}>Kaufen (Agentur)</th>
                    <th style={{ ...thStyle, color: "var(--blue)" }}>Mieten (Abo)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Vorabkosten", "3.000–15.000 Euro", "0 Euro"],
                    ["Monatliche Kosten", "50–200 Euro (Hosting + Wartung)", "Ab 99 Euro (alles inkl.)"],
                    ["Kosten Jahr 1", "5.000–16.000 Euro", "1.188 Euro"],
                    ["Kosten 3 Jahre", "8.000–22.000 Euro", "3.564 Euro"],
                    ["Eigentum", "Ja, die Website gehört dir", "Nein, du mietest sie"],
                    ["Designqualität", "Individuell, hoch", "Individuell, hoch"],
                    ["Updates & Pflege", "Extra oder selbst", "Inklusive"],
                    ["Support", "Je nach Vertrag", "Persönlicher Ansprechpartner"],
                    ["Fertigstellung", "4–12 Wochen", "Wenige Tage"],
                    ["Risiko", "Hoch (Vorabinvestment)", "Minimal (monatl. kündbar)"],
                    ["Flexibilität bei Kündigung", "Website bleibt, aber veraltet", "Seite wird deaktiviert"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row[0]}</td>
                      <td style={tdStyle}>{row[1]}</td>
                      <td style={{ ...tdStyle, color: "var(--blue)", fontWeight: 500 }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* H2: Break-even */}
            <h2 style={h2Style}>Break-even-Analyse: Ab wann lohnt sich Kaufen?</h2>
            <p>
              Die ehrliche Antwort: Rein finanziell lohnt sich Kaufen erst nach vielen Jahren – und nur unter bestimmten Voraussetzungen.
            </p>
            <p>
              Rechnen wir es durch: Eine Agentur-Website kostet 5.000 Euro einmalig plus 100 Euro/Monat Wartung. Das Abo kostet 99 Euro/Monat. Der finanzielle Break-even – also der Punkt, ab dem Kaufen günstiger wird – liegt bei etwa <strong>5 Jahren</strong>.
            </p>
            <p>
              Aber: Nach 3 bis 4 Jahren ist eine Website technisch und optisch veraltet und braucht ein Redesign. Dann startet der Zyklus von vorn. In der Praxis erreichst du den Break-even beim Kaufen also selten.
            </p>
            <div style={defBox}>
              <strong>Wichtig:</strong> Beim Kaufen fallen nach der Übergabe oft unerwartete Kosten an: Plugin-Updates, Sicherheits-Patches, Redesign alle 3-4 Jahre, Anpassungen an neue Geräte und Browser. Diese Kosten werden bei der Break-even-Berechnung häufig vergessen.
            </div>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Lieber mieten statt kaufen?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Professionelle Website ab 99 Euro/Monat. Ohne Vorabkosten, ohne Risiko, monatlich kündbar.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                <span>Kostenloses Erstgespräch buchen →</span>
              </Link>
            </div>

            {/* H2: Wann lohnt sich was? */}
            <h2 style={h2Style}>Wann lohnt sich welches Modell?</h2>

            <p><strong>Kaufen lohnt sich, wenn:</strong></p>
            <ul style={ulStyle}>
              <li>Du ein großes Budget hast und langfristig planst (5+ Jahre ohne Redesign)</li>
              <li>Du ein internes IT-Team hast, das Wartung und Updates übernimmt</li>
              <li>Du sehr spezielle Anforderungen hast (komplexer Shop, individuelle Schnittstellen)</li>
              <li>Dir das Eigentum an der Website wichtiger ist als finanzielle Flexibilität</li>
            </ul>

            <p><strong>Mieten lohnt sich, wenn:</strong></p>
            <ul style={ulStyle}>
              <li>Du kein hohes Einmal-Investment riskieren willst</li>
              <li>Du keine Lust hast, dich um Technik, Updates und Sicherheit zu kümmern</li>
              <li>Du schnell online sein willst – in Tagen statt Monaten</li>
              <li>Du flexibel bleiben willst und nicht an einen Vertrag gebunden sein möchtest</li>
              <li>Du einen festen Ansprechpartner für Änderungen und Fragen brauchst</li>
            </ul>

            {/* H2: Typische Einwände */}
            <h2 style={h2Style}>Typische Einwände gegen das Mietmodell</h2>

            <h3 style={h3Style}>&ldquo;Aber mir gehört die Website nicht!&rdquo;</h3>
            <p>
              Stimmt. Aber gehört dir auch dein Büro? Dein Firmenwagen? Dein Buchhaltungsprogramm? Viele Geschäftsausgaben sind laufende Kosten – und das ist völlig normal. Der Vorteil: Du musst dich um nichts kümmern und hast immer eine aktuelle, gepflegte Website.
            </p>

            <h3 style={h3Style}>&ldquo;Langfristig wird das doch teurer!&rdquo;</h3>
            <p>
              Nur auf dem Papier – und nur, wenn du die versteckten Kosten beim Kaufen ignorierst. Wartung, Updates, Redesign alle paar Jahre: Die tatsächlichen Gesamtkosten einer gekauften Website liegen deutlich höher, als die meisten denken.
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
            <h2 style={h2Style}>Fazit: Mieten ist 2026 das smartere Modell</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Mieten ist finanziell risikoärmer.</strong> Keine Vorabkosten, monatlich kündbar, alles inklusive.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Die Qualität ist vergleichbar.</strong> Der Unterschied liegt im Geschäftsmodell, nicht im Ergebnis.
              </li>
              <li>
                <strong>Der Break-even beim Kaufen wird selten erreicht,</strong> weil Websites alle 3 bis 4 Jahre ein Redesign brauchen.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Website mieten statt kaufen?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
                Lass uns in 15 Minuten klären, ob das Abo-Modell zu deinem Business passt. Ohne Verkaufsdruck.
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
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
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
