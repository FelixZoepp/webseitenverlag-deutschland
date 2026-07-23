import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website erstellen: Einfach erklärt für Nicht-Techniker",
  description:
    "Kein Technikwissen nötig. Wir erklären, wie eine Website entsteht – was wir übernehmen und was du liefern musst (Spoiler: nicht viel).",
  openGraph: {
    title: "Website erstellen: Einfach erklärt für Nicht-Techniker",
    description:
      "Website-Erstellung ohne Computerkenntnisse – wie das Auto fahren, nicht selbst bauen. Was wir übernehmen, was du brauchst, und wie einfach es wirklich ist.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Brauche ich Computerkenntnisse für eine Website?",
    a: "Nein. Wirklich nicht. Genauso wenig wie du ein Mechaniker sein musst, um Auto zu fahren. Du nutzt das Ergebnis – wir kümmern uns um alles darunter. Technik, Design, Hosting, SSL-Zertifikat, SEO-Grundlagen: Das ist unser Job. Dein Job ist es, uns zu sagen, was du anbietest.",
  },
  {
    q: "Muss ich etwas installieren oder herunterladen?",
    a: "Nein. Absolut nichts. Deine Website läuft in der Cloud – du brauchst keinen Server, keine Software, kein Update. Du öffnest einen Browser, schaust dir die fertige Seite an, sagst uns, wenn du etwas ändern willst – fertig.",
  },
  {
    q: "Was ist Hosting und Domain, und brauche ich das?",
    a: "Hosting ist der Speicherplatz im Internet, auf dem deine Website liegt – wie eine Wohnung für deine Seite. Eine Domain ist deine Adresse, zum Beispiel meinbetrieb.de. Beides ist bei uns inklusive. Du musst nicht wissen, wie das funktioniert – du musst nur wissen, dass es läuft.",
  },
  {
    q: "Kann ich die Website selbst ändern?",
    a: "Du kannst uns Änderungen mitteilen – per E-Mail, WhatsApp oder Telefon – und wir setzen sie um. Kleinere Updates wie neue Öffnungszeiten oder ein geänderter Text sind in der Regel innerhalb von 24 Stunden erledigt. Du brauchst kein eigenes System zu lernen, wenn du das nicht willst.",
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
            headline: "Website erstellen: Einfach erklärt für Nicht-Techniker",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-09-29",
            dateModified: "2026-09-29",
            description:
              "Kein Technikwissen nötig. Wir erklären, wie eine Website entsteht – was wir übernehmen und was du liefern musst (Spoiler: nicht viel).",
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
              29. September 2026 · 6 Min. Lesezeit
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
            Website erstellen: Einfach erklärt für{" "}
            <span className="accent">Nicht-Techniker</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Du fährst Auto, ohne es zu bauen. Eine Website ist genauso.
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
              &ldquo;Ich bin kein Techniker – das ist nichts für mich.&rdquo; Das ist der Einwand,
              der uns am häufigsten begegnet. Und er beruht auf einem Missverständnis, das wir
              gerne korrigieren: Du musst keine Website bauen – du musst eine Website haben.
            </p>
            <p>
              Du fährst auch Auto, ohne Mechaniker zu sein. Du nutzt ein Smartphone, ohne die
              Platinen zu verstehen. Eine Website ist genauso: Du nutzt das Ergebnis – wir
              kümmern uns um alles dahinter. Dieser Artikel erklärt, was eine Website-Erstellung
              mit uns wirklich bedeutet – in einfachen Worten, ohne Fachbegriffe.
            </p>

            {/* H2: Was wir übernehmen */}
            <h2 style={h2Style}>Was wir für dich übernehmen – alles</h2>
            <p>
              Wenn du eine Website mit uns erstellst, musst du dich um nichts Technisches kümmern.
              Wirklich nichts. Hier ist, was wir komplett in die Hand nehmen:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Design:</strong> Wir gestalten deine Website passend zu deinem Betrieb –
                Farben, Schriften, Bilder, Aufbau. Du musst kein Designprogramm kennen.
              </li>
              <li>
                <strong>Texte:</strong> Wir schreiben deine Inhalte auf Basis eines kurzen
                Gesprächs mit dir. Du lieferst die Infos, wir formulieren professionell.
              </li>
              <li>
                <strong>Hosting &amp; Domain:</strong> Beides ist im Abo enthalten. Deine Seite
                läuft auf unseren Servern – sicher, schnell, immer erreichbar.
              </li>
              <li>
                <strong>SSL-Zertifikat:</strong> Das ist das kleine Schloss in der Adresszeile
                des Browsers. Es zeigt an, dass deine Seite sicher ist. Wir richten es ein.
              </li>
              <li>
                <strong>SEO-Grundlagen:</strong> Wir bauen die Seite so, dass Google sie findet
                und versteht. Keine Magie – aber solide Basis.
              </li>
              <li>
                <strong>Laufende Pflege:</strong> Wenn du eine Änderung brauchst, sagst du uns
                Bescheid. Wir setzen es um – innerhalb von 24 Stunden.
              </li>
            </ul>

            {/* H2: Was du lieferst */}
            <h2 style={h2Style}>Was du liefern musst – nicht viel</h2>
            <p>
              Wir brauchen von dir zwei Dinge, um loszulegen. Das war es wirklich.
            </p>

            <h3 style={h3Style}>1. Ein kurzes Gespräch</h3>
            <p>
              In 15 bis 30 Minuten erzählst du uns, was du machst, wen du bedienst und was
              dir wichtig ist. Kein Formular, keine Hausaufgaben. Einfach reden. Daraus erstellen
              wir deinen ersten Entwurf.
            </p>

            <h3 style={h3Style}>2. Ein paar Fotos – wenn du welche hast</h3>
            <p>
              Eigene Bilder deiner Arbeit machen eine Website lebendig. Aber selbst wenn du
              keine professionellen Fotos hast: Wir arbeiten mit Stockfotos, bis du eigene
              lieferst. Keine Verzögerung, kein Technikstress.
            </p>
            <p>
              Das war es. Kein Formular auf 20 Seiten, keine Software zu lernen, keine
              Entscheidungen über Plugins oder Datenbankformate. Das ist unsere Aufgabe.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Werner, 62, Bäckermeister aus Niederbayern,
              hat uns am Anfang gesagt: &ldquo;Ich kann nicht mal richtig E-Mails schreiben.&rdquo;
              Wir haben uns eine Stunde zusammengesetzt, er hat erzählt, was er backt, wer seine
              Kunden sind und warum er seinen Beruf liebt. Vier Tage später war seine Website
              online. Seitdem bekommt er 5 Anfragen pro Woche über das Kontaktformular – für
              Torten, Catering und Großbestellungen. Er hat dafür nicht eine Zeile selbst
              getippt.
            </div>

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
                Wir kümmern uns um alles – du konzentrierst dich aufs Handwerk
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Kein Technikwissen nötig. Ab 99 €/Monat, alles inklusive. Zeig uns, was du machst.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Wie lange dauert es */}
            <h2 style={h2Style}>Wie lange dauert es, bis meine Website online ist?</h2>
            <p>
              In der Regel 3 bis 5 Werktage von unserem ersten Gespräch bis zum Launch. Das klingt
              schnell – und ist es auch. Weil wir viele Websites für ähnliche Branchen gebaut haben
              und wissen, was funktioniert. Du musst nicht wochenlang auf Entwürfe warten.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Tag 1:</strong> Erstgespräch (15–30 Minuten)
              </li>
              <li>
                <strong>Tag 2–3:</strong> Wir erstellen deinen ersten Entwurf
              </li>
              <li>
                <strong>Tag 3–4:</strong> Du schaust drüber, sagst was du ändern willst
              </li>
              <li>
                <strong>Tag 4–5:</strong> Wir setzen dein Feedback um, Website geht live
              </li>
            </ul>

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
            <h2 style={h2Style}>Fazit: Eine Website braucht kein Technikwissen – nur einen kurzen Anruf</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Du fährst Auto, ohne Mechaniker zu sein.</strong> Eine Website ist
                genauso: Du nutzt das Ergebnis, wir bauen und pflegen alles.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Du brauchst nur ein kurzes Gespräch und ein paar Infos.</strong> Den
                Rest übernehmen wir – Texte, Design, Technik, Hosting, SEO.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>In 3–5 Tagen bist du online.</strong> Ohne Wochen des Wartens, ohne
                Technik-Stress, ohne Software zu lernen.
              </li>
              <li>
                <strong>Ab 99 Euro/Monat ist alles inklusive.</strong> Kein Vorschuss, keine
                Einmalzahlung, keine versteckten Kosten.
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
                Ein Gespräch reicht – wir machen den Rest
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
                Keine Technik, keine Vorkenntnisse, kein Risiko. In 15 Minuten siehst du deinen
                ersten Entwurf – kostenlos und unverbindlich.
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
