import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website ohne Technikkenntnisse: So funktioniert es wirklich",
  description:
    "Du brauchst kein Technikwissen für eine professionelle Website. Was du wirklich liefern musst: Ein kurzes Gespräch und ein paar Fotos. Den Rest übernehmen wir.",
  openGraph: {
    title: "Website ohne Technikkenntnisse: So funktioniert es wirklich",
    description:
      "Kein Login, kein CMS, kein WordPress. Wir bauen, du bekommst die Anfragen. So einfach ist das Abo-Modell erklärt.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Muss ich die Website selbst pflegen?",
    a: "Nein. Pflege, Updates, Sicherheit und Hosting sind im Abo enthalten. Du musst dich um nichts kümmern. Wenn sich etwas ändert – neues Angebot, neue Öffnungszeiten – sagst du uns Bescheid, wir aktualisieren die Seite.",
  },
  {
    q: "Was passiert, wenn sich etwas auf meiner Website ändern soll?",
    a: "Du schickst uns eine Nachricht – per WhatsApp, E-Mail oder Telefon. Wir setzen die Änderung um, in der Regel innerhalb von 1–2 Werktagen. Du brauchst keinen Zugang zu irgendeinem System, kein Passwort, keinen Login. Einfach kurz Bescheid geben.",
  },
  {
    q: "Brauche ich einen Computer für die Website?",
    a: "Nein. Für die Erstellung brauchst du nichts außer einem Gespräch (telefonisch möglich) und ein paar Fotos (die kannst du mit dem Handy machen). Die fertige Website siehst du dann auf deinem Handy, Tablet oder Computer – aber du musst nichts bedienen oder pflegen.",
  },
  {
    q: "Wer kümmert sich um Updates und Sicherheit?",
    a: "Wir. Software-Updates, Sicherheitspatches, SSL-Zertifikat, Backups – das alles läuft im Hintergrund, ohne dass du etwas davon merkst. Deine Website ist immer aktuell und sicher, ohne dass du irgendetwas tun musst.",
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
            headline: "Website ohne Technikkenntnisse: So funktioniert es wirklich",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-11-03",
            dateModified: "2026-11-03",
            description:
              "Du brauchst kein Technikwissen für eine professionelle Website. Was du wirklich liefern musst: Ein kurzes Gespräch und ein paar Fotos.",
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
            Kostenlose Demo
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
              3. November 2026 · 5 Min. Lesezeit
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
            Website ohne Technikkenntnisse: So funktioniert es{" "}
            <span className="accent">wirklich</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Du fährst auch Auto, ohne es selbst zu bauen. Bei deiner Website ist das genauso.
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
              &ldquo;Ich bin nicht gut mit Technik&rdquo; – das ist wohl der häufigste Grund,
              warum Menschen sich keine Website zutrauen. Und weißt du was? Das ist vollkommen
              in Ordnung. Du musst auch nicht wissen, wie ein Motor funktioniert, um jeden Tag
              Auto zu fahren. Bei deiner Website ist es genauso.
            </p>
            <p>
              In diesem Artikel zeigen wir dir Schritt für Schritt, was du wirklich tun musst –
              und was du überhaupt nicht tun musst. Die Kurzfassung: deutlich weniger,
              als du denkst.
            </p>

            {/* H2: Auto-Vergleich */}
            <h2 style={h2Style}>Du fährst Auto – du baust es nicht</h2>
            <p>
              Stell dir vor, jemand würde dir sagen: &ldquo;Du kannst kein Auto nutzen, du
              weißt nicht, wie man einen Motor zusammenbaut.&rdquo; Das wäre absurd. Du musst
              den Motor nicht bauen – du musst nur fahren.
            </p>
            <p>
              Mit einer Website ist es genauso. Du musst kein HTML kennen, keinen Server
              einrichten, kein WordPress installieren. Du brauchst die Website – nicht das
              Wissen, wie man sie baut. Genau dafür gibt es Profis.
            </p>

            <h3 style={h3Style}>Was &ldquo;Technik&rdquo; bei einer Website wirklich bedeutet</h3>
            <p>
              Viele denken bei &ldquo;Website&rdquo; sofort an Logins, CMS-Systeme, Datenbanken
              und Code. Das stimmt zwar technisch – aber das ist der Teil, den du nie zu sehen
              bekommst. So wie du den Motor deines Autos nie siehst, solange du fährst.
            </p>
            <ul style={ulStyle}>
              <li>Domain einrichten? Wir machen das.</li>
              <li>Hosting konfigurieren? Wir machen das.</li>
              <li>Website designen und coden? Wir machen das.</li>
              <li>SSL-Zertifikat und Sicherheit? Wir machen das.</li>
              <li>Updates und Pflege? Wir machen das.</li>
            </ul>
            <p>
              Und du? Du lieferst zwei Dinge – und das ist alles.
            </p>

            {/* H2: Was du liefern musst */}
            <h2 style={h2Style}>Was du wirklich tun musst: Zwei Dinge</h2>

            <h3 style={h3Style}>1. Ein kurzes Gespräch</h3>
            <p>
              Wir rufen dich an – oder du rufst uns an. Wir fragen dich in 15–20 Minuten,
              was du machst, für wen du arbeitest, was dich von der Konkurrenz unterscheidet
              und was deine typischen Kunden suchen. Das reicht. Kein Fragebogen mit 40
              Feldern, keine Texte schreiben, kein Design-Briefing.
            </p>

            <h3 style={h3Style}>2. Ein paar Fotos</h3>
            <p>
              Handy-Fotos reichen völlig: dein Betrieb von außen, dein Team, typische Arbeiten.
              Du musst keine professionellen Fotos kaufen. Was du hast, reicht als Anfang.
              Wenn du möchtest, können wir auch Stockfotos verwenden.
            </p>
            <p>
              Das ist alles. Kein Login, kein CMS, kein Technikwissen. Nach 3–5 Werktagen
              ist deine Website live – und du bekommst einen Link, den du auf deinem Handy
              anschauen kannst.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Renate, 64, betreibt seit 30 Jahren einen
              Blumenladen in Erfurt. &ldquo;Ich nutze eigentlich nur WhatsApp&rdquo;, sagte
              sie beim ersten Gespräch. In 20 Minuten haben wir alles erfahren, was wir
              wussten. 3 Tage später war ihre Website live. Heute – 4 Monate später –
              kommen wöchentlich 4 neue Kundinnen über Google in ihren Laden. Renate hat
              noch nie einen Login genutzt, noch nie etwas bearbeitet. Die Website läuft
              einfach.
            </div>

            {/* H2: Änderungen */}
            <h2 style={h2Style}>Was passiert, wenn sich etwas ändert?</h2>
            <p>
              Das ist eine häufige Sorge: &ldquo;Und was mache ich, wenn sich die Öffnungszeiten
              ändern? Wenn ich ein neues Angebot habe?&rdquo; Ganz einfach: Du schickst uns
              eine Nachricht.
            </p>
            <ul style={ulStyle}>
              <li>Per WhatsApp: &ldquo;Neue Öffnungszeiten: Mo–Fr 8–18 Uhr&rdquo;</li>
              <li>Per E-Mail: &ldquo;Wir machen jetzt auch Dacharbeiten&rdquo;</li>
              <li>Per Telefon: Kurz anrufen und durchsagen</li>
            </ul>
            <p>
              Wir setzen das um, in der Regel innerhalb von 1–2 Werktagen. Du bekommst eine
              kurze Bestätigung. Das war es. Kein Login, kein System, kein Passwort vergessen.
            </p>

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
                Technik ist unser Job – Kunden gewinnen ist deins
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Sieh dir kostenlos an, wie deine Website aussehen könnte. Kein Technikwissen nötig.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Was im Abo enthalten ist */}
            <h2 style={h2Style}>Was im Abo alles enthalten ist – ohne dass du es merkst</h2>
            <p>
              Im Hintergrund passiert jeden Monat einiges, ohne dass du einen Finger rührst:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Hosting und Server:</strong> Deine Website läuft auf schnellen Servern,
                die wir verwalten. Du merkst davon nichts.
              </li>
              <li>
                <strong>SSL-Zertifikat:</strong> Das kleine Schloss in der Browser-Adresszeile.
                Läuft automatisch und erneuert sich selbst.
              </li>
              <li>
                <strong>Software-Updates:</strong> Sicherheitsupdates werden automatisch
                eingespielt. Keine Lücken, keine Angriffspunkte.
              </li>
              <li>
                <strong>Backups:</strong> Tägliche automatische Sicherungen. Wenn je etwas
                schiefgeht, stellen wir die Website wieder her.
              </li>
              <li>
                <strong>Technischer Support:</strong> Wenn etwas nicht funktioniert – wir
                sind erreichbar und kümmern uns.
              </li>
            </ul>
            <p>
              Das alles läuft für 99 € netto/Monat. Komplett. Keine Extras, keine Überraschungen.
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
            <h2 style={h2Style}>Fazit: Technik ist nicht dein Problem</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Du fährst Auto, du baust es nicht.</strong> Deine Website nutzt du –
                gebaut und gepflegt wird sie von uns.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Zwei Dinge von dir: Gespräch und Fotos.</strong> Das reicht, um in
                3–5 Werktagen online zu sein.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Änderungen per Nachricht.</strong> WhatsApp, E-Mail oder Telefon –
                wir setzen es um.
              </li>
              <li>
                <strong>Alles inklusive.</strong> Hosting, Sicherheit, Updates, Support –
                für 99 € netto/Monat, faire Vertragsbedingungen.
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
                Einfacher geht es nicht
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
                Kurzes Gespräch, ein paar Fotos – und in 3 Tagen bist du online. Ab 99 € netto/Monat,
                transparente Konditionen, kein Technikwissen nötig.
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
              <Link href="/datenschutz">Datenschutz</Link> · <Link href="/agb">AGB</Link>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
