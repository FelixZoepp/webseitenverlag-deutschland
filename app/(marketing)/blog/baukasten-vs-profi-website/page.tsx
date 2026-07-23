import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox, thStyle, tdStyle } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Jimdo, Wix & Co. vs. professionelle Website: Der ehrliche Vergleich",
  description:
    "Baukasten oder Profi-Website? Wir vergleichen ehrlich: Design, SEO, Performance, Support und Kosten – damit du die richtige Entscheidung triffst.",
  openGraph: {
    title: "Jimdo, Wix & Co. vs. professionelle Website: Der ehrliche Vergleich",
    description:
      "8 Sekunden Ladezeit statt 1,5 Sekunden – das ist der Unterschied zwischen Seite 4 und Seite 1 bei Google. Was Baukasten-Websites wirklich kosten.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Ist Jimdo oder Wix grundsätzlich schlecht?",
    a: "Nicht für jeden Zweck. Für ein Hobby-Projekt, eine persönliche Portfolio-Seite oder eine temporäre Landingpage können Baukästen vollkommen ausreichen. Für ein Gewerbe, das Kunden gewinnen und bei Google gefunden werden will, stoßen sie jedoch schnell an ihre Grenzen – vor allem bei Ladezeiten, SEO-Kontrolle und professionellem Erscheinungsbild.",
  },
  {
    q: "Was kostet eine professionelle Website im Vergleich zum Baukasten?",
    a: "Ein Baukasten kostet 15–30 Euro/Monat, dazu kommen oft Extras für eigene Domain, E-Mail oder mehr Speicher. Eine professionelle Website im Abo gibt es ab 99 € netto/Monat – inklusive Design, Hosting, Pflege und Support. Der Unterschied: Beim Baukasten investierst du zusätzlich viele Stunden deiner eigenen Zeit. Bei der Profi-Website nicht.",
  },
  {
    q: "Kann ich von Wix oder Jimdo zu einer professionellen Website wechseln?",
    a: "Ja, problemlos. Du behältst deine Domain (sie wird nur auf den neuen Server umgezogen), Texte und Bilder können übernommen werden. Der Wechsel dauert in der Regel 3–5 Werktage. Du verlierst dabei keine Inhalte – nur die schlechten Ladezeiten.",
  },
  {
    q: "Was ist der größte Nachteil von Website-Baukästen?",
    a: "Die Ladezeit. Baukasten-Websites laden im Schnitt 5–9 Sekunden – Google empfiehlt unter 2,5 Sekunden. Jede zusätzliche Sekunde Ladezeit kostet nachweislich Besucher und Rankings. Hinzu kommen aufgeblähter Code, schlechte Core Web Vitals und eingeschränkte SEO-Kontrolle.",
  },
];

export default function BlogArticle() {
  return (
    <>
      {/* FAQ Schema */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <Script
        id="article-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Jimdo, Wix & Co. vs. professionelle Website: Der ehrliche Vergleich",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-10-13",
            dateModified: "2026-10-13",
            description:
              "Baukasten oder Profi-Website? Wir vergleichen ehrlich: Design, SEO, Performance, Support und Kosten.",
          }),
        }}
      />

      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image
              src="/logo.svg"
              alt="Webseiten-Verlag Deutschland"
              width={36}
              height={36}
              priority
            />
            Webseiten-Verlag <span>Deutschland</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/ergebnisse">Ergebnisse</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">
            Kostenloses Erstgespräch
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginBottom: 20,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--blue)",
                background: "rgba(37,99,235,0.15)",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              Einwände &amp; Mythen
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              13. Oktober 2026 · 8 Min. Lesezeit
            </span>
          </div>
          <h1
            className="display"
            style={{
              fontSize: "clamp(32px, 4.5vw, 48px)",
              marginBottom: 20,
              lineHeight: 1.1,
            }}
          >
            Jimdo, Wix &amp; Co. vs. professionelle Website: Der ehrliche{" "}
            <span className="accent">Vergleich</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Was Baukasten-Websites wirklich kosten – nicht in Euro, sondern in verlorenen Kunden.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div
            className="blog-content"
            style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}
          >
            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              &ldquo;Ich hab mir das selbst mit Wix gebaut, das reicht doch&rdquo; – das klingt
              vernünftig und sparsam. Und manchmal stimmt es sogar. Aber meistens bezahlt man
              den Preis nicht in Euro, sondern in Kunden, die man nie zu sehen bekommt.
            </p>
            <p>
              Wir wollen hier keinen Baukasten schlechtreden, der für manche Zwecke durchaus
              funktioniert. Aber für ein Gewerbe, das online Kunden gewinnen will, lohnt sich
              ein ehrlicher Vergleich. Also machen wir ihn.
            </p>

            {/* H2: Vergleichstabelle */}
            <h2 style={h2Style}>Der direkte Vergleich auf einen Blick</h2>
            <p>
              Schauen wir uns die wichtigsten Kriterien Seite an Seite an:
            </p>

            <div
              style={{
                overflowX: "auto",
                marginBottom: 32,
                borderRadius: 12,
                border: "1px solid var(--border)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)" }}>
                    <th style={thStyle}>Kriterium</th>
                    <th style={thStyle}>Baukasten (Wix/Jimdo)</th>
                    <th style={thStyle}>Profi-Website</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Design", "Templates, eingeschränkt anpassbar", "Individuell, branchenspezifisch"],
                    ["Ladezeit", "Ø 5–9 Sekunden", "Ø 1–2,5 Sekunden"],
                    ["SEO-Kontrolle", "Begrenzt, vorgefertigte Felder", "Vollständige Kontrolle"],
                    ["Core Web Vitals", "Oft mangelhaft", "Optimiert"],
                    ["Support", "Helpdesk / Community", "Persönlicher Ansprechpartner"],
                    ["Pflege", "Selbst erledigen", "Im Preis enthalten"],
                    ["Monatliche Kosten", "15–30 € + Extras", "Ab 99 € netto all-inclusive"],
                    ["Zeitaufwand für dich", "Hoch (Stunden/Monat)", "Minimal"],
                    ["Geeignet für", "Hobby, Landingpage", "Gewerbe, Kundengewinnung"],
                  ].map(([k, b, p], i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: i % 2 === 0 ? "transparent" : "rgba(37,99,235,0.02)",
                      }}
                    >
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{k}</td>
                      <td style={tdStyle}>{b}</td>
                      <td style={{ ...tdStyle, color: "var(--blue)", fontWeight: 500 }}>{p}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* H2: Ladezeit */}
            <h2 style={h2Style}>Warum Ladezeit dein Google-Ranking ruiniert</h2>
            <p>
              Das ist kein technisches Detail – das ist bares Geld. Google bewertet die Ladezeit
              deiner Website als direkten Ranking-Faktor. Und die Zahlen sind brutal:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Unter 2,5 Sekunden:</strong> Google ist zufrieden, gute Chance auf
                vordere Positionen.
              </li>
              <li>
                <strong>3–5 Sekunden:</strong> Sichtbarer Rankingverlust, höhere Absprungrate.
              </li>
              <li>
                <strong>Über 5 Sekunden:</strong> Laut Google-Studien springen 90 % der Besucher
                ab, bevor die Seite geladen ist.
              </li>
            </ul>
            <p>
              Baukasten-Websites laden im Schnitt 5–9 Sekunden, weil sie aufgeblähten Code,
              ungekomprimierte Bilder und gemeinsam genutzte Server haben. Dafür sind sie
              günstig – und dafür bezahlt Google sie mit schlechten Rankings.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Fotograf aus München hatte seine Seite
              selbst mit Wix gebaut. Ladezeit: 8,3 Sekunden. Google Maps: Seite 4 unter
              &ldquo;Fotograf München&rdquo;. Kaum Anfragen über die Website. Nach dem Wechsel
              zu einer professionellen Seite: 1,5 Sekunden Ladezeit, Seite 1 für drei lokale
              Keywords, und 4–6 Anfragen pro Woche statt 1–2 pro Monat.
            </div>

            {/* H2: Wann Baukasten OK */}
            <h2 style={h2Style}>Wann ein Baukasten wirklich ausreicht</h2>
            <p>
              Wir wollen ehrlich sein: Es gibt Fälle, in denen ein Baukasten vollkommen
              in Ordnung ist.
            </p>

            <h3 style={h3Style}>Baukasten ist OK wenn…</h3>
            <ul style={ulStyle}>
              <li>Du ein Hobbyproject hast, das keine Kunden gewinnen muss</li>
              <li>Du eine temporäre Landingpage für eine einmalige Veranstaltung baust</li>
              <li>Du als Student oder Einsteiger erste Erfahrungen sammelst</li>
              <li>Deine Zielkunden nicht über Google zu dir kommen (z.B. rein Empfehlungsgeschäft)</li>
            </ul>

            <h3 style={h3Style}>Baukasten reicht nicht wenn…</h3>
            <ul style={ulStyle}>
              <li>Du neue Kunden über Google gewinnen willst</li>
              <li>Deine Konkurrenz professionelle Websites hat</li>
              <li>Du ein Gewerbe betreibst, bei dem der erste Eindruck zählt</li>
              <li>Du keine Zeit hast, dich selbst um Design, Technik und Inhalte zu kümmern</li>
              <li>Du lokal oder regional sichtbar sein willst</li>
            </ul>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 22,
                  fontWeight: 600,
                  marginBottom: 8,
                  fontVariationSettings: '"opsz" 24, "SOFT" 50',
                }}
              >
                1,5 Sekunden statt 8 – der Unterschied zwischen Seite 1 und Seite 4
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Sieh, wie deine professionelle Website aussehen könnte. Kostenlos und unverbindlich.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Versteckte Kosten */}
            <h2 style={h2Style}>Die versteckten Kosten des Baukastens</h2>
            <p>
              &ldquo;Jimdo kostet nur 15 Euro im Monat&rdquo; – stimmt, aber das ist nicht die
              ganze Wahrheit. Rechne mal durch, was ein Baukasten wirklich kostet:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Deine Zeit:</strong> Erstsetup 10–20 Stunden, laufend 2–5 Stunden/Monat.
                Wenn deine Stunde 50 Euro wert ist: Das sind schnell 100–250 Euro/Monat allein
                für deine Zeit.
              </li>
              <li>
                <strong>Entgangene Kunden:</strong> Jeder Monat auf Seite 4 statt Seite 1 ist
                ein Monat ohne Anfragen. Was ist ein Neukunde bei dir wert?
              </li>
              <li>
                <strong>Extras:</strong> Eigene Domain, professionelle E-Mail, mehr Speicher –
                die meisten Basis-Tarife verlangen Aufpreise für Selbstverständlichkeiten.
              </li>
            </ul>
            <p>
              Wenn du das alles addierst, ist der Preisunterschied zu 99 € netto/Monat für eine
              professionelle Website oft kleiner als gedacht – und der Qualitätsunterschied riesig.
            </p>

            {/* FAQ */}
            <h2 style={h2Style}>Häufig gestellte Fragen</h2>
            {faqData.map((f, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 19,
                    fontWeight: 600,
                    marginBottom: 8,
                    fontVariationSettings: '"opsz" 24, "SOFT" 50',
                  }}
                >
                  {f.q}
                </h3>
                <p style={{ color: "var(--ink-soft)" }}>{f.a}</p>
              </div>
            ))}

            {/* Fazit */}
            <h2 style={h2Style}>Fazit: Nicht der Preis entscheidet, sondern das Ergebnis</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Für Gewerbe ist Baukasten keine echte Option.</strong> Schlechte
                Ladezeiten, eingeschränktes SEO und unprofessionelles Design kosten mehr
                als sie sparen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Deine Zeit hat einen Wert.</strong> Stunden mit Wix verbringen,
                statt Aufträge abzuarbeiten, ist kein Sparen – das ist ein Tauschhandel
                zu deinen Ungunsten.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Der Wechsel ist einfach.</strong> Domain mitnehmen, Inhalte übertragen,
                fertig. In 3–5 Werktagen ist deine professionelle Seite live.
              </li>
              <li>
                <strong>Lass dich überzeugen – kostenlos.</strong> Sieh deinen Entwurf,
                bevor du entscheidest.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 24,
                  fontWeight: 600,
                  marginBottom: 12,
                  fontVariationSettings: '"opsz" 24, "SOFT" 50',
                }}
              >
                Raus aus dem Baukasten – rein in die Ergebnisse
              </h3>
              <p
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 16,
                  marginBottom: 20,
                  maxWidth: 480,
                  margin: "0 auto 20px",
                }}
              >
                Wir zeigen dir in 15 Minuten, wie deine professionelle Website aussehen könnte.
                Ab 99 € netto/Monat, transparente Konditionen, kein Technikwissen nötig.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "18px 40px", fontSize: 16 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
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
            <span>
              <Link href="/impressum">Impressum</Link> ·{" "}
              <Link href="/datenschutz">Datenschutz</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
