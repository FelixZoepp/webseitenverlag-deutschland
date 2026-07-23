import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Kurz vor der Rente – lohnt sich eine Website noch?",
  description:
    "Wer in 5–10 Jahren aufhören will, fragt sich: Lohnt sich eine Website überhaupt noch? Die Antwort überrascht – auch beim Firmenverkauf.",
  openGraph: {
    title: "Kurz vor der Rente – lohnt sich eine Website noch?",
    description:
      "Eine Website kann deinen Firmenwert um Zehntausende Euro steigern, die letzten Jahre deutlich angenehmer machen – und geht bei Übergabe nahtlos auf den Nachfolger über.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Lohnt sich eine Website noch, wenn ich in ein paar Jahren aufhöre?",
    a: "Ja – oft sogar besonders dann. Eine professionelle Website erhöht deinen Firmenwert beim Verkauf, bringt in den letzten Jahren bessere und zahlungskräftigere Kunden, und gibt dir mehr Kontrolle darüber, welche Aufträge du annimmst. Die Investition von 99 Euro/Monat rentiert sich in der Regel schon nach wenigen Wochen.",
  },
  {
    q: "Hilft eine Website wirklich beim Firmenverkauf?",
    a: "Absolut. Potenzielle Käufer bewerten ein Unternehmen nach seinem Kundenstamm, Umsatz und Markenpräsenz. Eine professionelle, gut positionierte Website zeigt: Hier gibt es eine funktionierende Kundengewinnung. Das erhöht den Wert direkt – und macht das Unternehmen für Käufer attraktiver, weil das Marketing bereits läuft.",
  },
  {
    q: "Kann ein Nachfolger die Website übernehmen?",
    a: "Ja, das ist eines der stärksten Argumente. Domain, Website-Inhalte und SEO-Rankings gehen bei Unternehmensübergabe einfach mit über. Der Nachfolger startet nicht bei null, sondern mit einer eingeführten Online-Präsenz. Das spart dem Käufer Zeit und Geld – und erhöht damit deinen Verkaufspreis.",
  },
  {
    q: "Gibt es kurze Vertragslaufzeiten für ältere Unternehmer?",
    a: "Bei uns läuft alles monatlich. Keine Mindestlaufzeit, keine Kündigungsfristen. Du kannst jederzeit aufhören – auch wenn du morgen entscheidest, das Geschäft zu übergeben. Du gehst kein Risiko ein.",
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
            headline: "Kurz vor der Rente – lohnt sich eine Website noch?",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-10-27",
            dateModified: "2026-10-27",
            description:
              "Wer in 5–10 Jahren aufhören will, fragt sich: Lohnt sich eine Website überhaupt noch?",
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
              27. Oktober 2026 · 5 Min. Lesezeit
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
            Kurz vor der Rente – lohnt sich eine Website{" "}
            <span className="accent">noch</span>?
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Überraschende Antwort: Gerade jetzt kann eine Website mehr bringen als zu
            jedem anderen Zeitpunkt in deiner Karriere.
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
              &ldquo;Ich höre in fünf Jahren auf – wozu jetzt noch eine Website?&rdquo; Das
              ist ein ehrlicher Gedanke. Und auf den ersten Blick klingt er vernünftig. Aber
              er übersieht drei Dinge, die gerade am Ende einer Unternehmerkarriere enormen
              Unterschied machen können.
            </p>
            <p>
              Lass uns die Frage von drei Seiten beleuchten: Was bringt dir eine Website
              in den letzten Berufsjahren? Was passiert, wenn du das Unternehmen verkaufst?
              Und was, wenn du einen Nachfolger suchst?
            </p>

            {/* H2: Bessere letzte Jahre */}
            <h2 style={h2Style}>Bessere letzte Jahre: Mehr Premium, weniger Stress</h2>
            <p>
              Wer kurz vor der Rente steht, will in der Regel keine stressigen Niedrigpreisaufträge
              mehr. Man kennt sein Handwerk, hat Erfahrung, verdient mehr. Das Problem:
              Ohne Online-Präsenz kommen Kunden oft über Empfehlung – und die fragen nicht
              nach Preisen, sondern nach Verfügbarkeit.
            </p>
            <p>
              Eine professionelle Website positioniert dich als Experte. Sie zeigt Referenzen,
              kommuniziert Qualität und filtert automatisch: Kunden, die über Google zu dir
              kommen und deine Seite überzeugend finden, sind oft bereit, mehr zu zahlen.
              Du arbeitest weniger, verdienst besser – und das in deinen letzten Jahren,
              in denen das besonders zählt.
            </p>

            <h3 style={h3Style}>Selektiver werden durch Sichtbarkeit</h3>
            <p>
              Wenn du online gut positioniert bist, kommen mehr Anfragen – und du kannst
              wählen, welche du annimmst. Die stressigen Kunden? Kein Termin frei.
              Die guten Aufträge? Sehr gerne. Das ist eine Freiheit, die du dir mit einer
              Website kaufst.
            </p>

            {/* H2: Firmenwert */}
            <h2 style={h2Style}>Firmenverkauf: Eine Website erhöht den Wert konkret</h2>
            <p>
              Das ist das Argument, das die meisten überrascht. Wenn du dein Unternehmen
              verkaufen willst – egal ob an einen Nachfolger oder extern –, dann ist
              eine professionelle, gut positionierte Website bares Geld wert.
            </p>
            <p>
              Warum? Weil ein Käufer nicht nur deinen Kundenstamm kauft, sondern auch
              deine Kundengewinnung. Eine Website, die monatlich Anfragen bringt, ist
              ein funktionierendes Vertriebssystem. Das ist mehr wert als ein Haufen
              Visitenkarten und ein Telefonbucheintrag.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Klempner aus dem Raum Dortmund,
              57 Jahre alt, wollte in fünf Jahren das Geschäft übergeben. Er ließ eine
              professionelle Website erstellen – 99 Euro/Monat. Zwei Jahre später, beim
              Gespräch mit einem möglichen Käufer, kam der Website-Traffic als konkreter
              Punkt auf den Tisch: 40–60 Anfragen pro Monat, davon 15–20 Abschlüsse.
              Das Ergebnis: Der Käufer zahlte 15.000 Euro mehr als ursprünglich verhandelt,
              weil er ein funktionierendes Online-Marketing mitbekam.
            </div>

            {/* H2: Nachfolger */}
            <h2 style={h2Style}>Der Nachfolger-Vorteil: Einfache Übergabe</h2>
            <p>
              Ob Kind, Mitarbeiter oder externer Käufer – wer dein Unternehmen übernimmt,
              übernimmt auch deine Website. Domain, SEO-Rankings, Bewertungen, Inhalte.
              Das geht nicht verloren, das wird mitgegeben.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Der Nachfolger startet nicht bei null:</strong> Er übernimmt eine
                Website, die bereits bei Google rankt und Anfragen bringt.
              </li>
              <li>
                <strong>Weniger Einarbeitungszeit für Marketing:</strong> Der neue Inhaber
                muss sich nicht sofort um Online-Sichtbarkeit kümmern – die läuft bereits.
              </li>
              <li>
                <strong>Höherer Übergabewert:</strong> Funktionierendes Marketing ist ein
                konkreter Vermögenswert, der sich im Kaufpreis niederschlägt.
              </li>
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
                Für die letzten Jahre – und für einen guten Abschluss
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Sieh dir kostenfrei an, wie deine Website aussehen könnte. Monatlich kündbar,
                kein Risiko.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Keine Bindung */}
            <h2 style={h2Style}>Keine langen Verträge – das passt zur Situation</h2>
            <p>
              &ldquo;Ich will mich nicht auf Jahre binden&rdquo; – das ist ein völlig
              verständlicher Einwand. Und genau deshalb ist das Abo-Modell ideal.
            </p>
            <p>
              Ab 99 Euro/Monat, monatlich kündbar. Kein Jahresvertrag, keine Mindestlaufzeit.
              Du kannst morgen kündigen, wenn du das Geschäft übergibst – und bis dahin
              profitierst du von mehr Anfragen, besseren Kunden und einem höheren Unternehmenswert.
              Das ist kein Risiko. Das ist eine monatliche Option, die du ziehen kannst.
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
            <h2 style={h2Style}>Fazit: Gerade jetzt lohnt es sich</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Bessere letzte Berufsjahre.</strong> Mehr Anfragen bedeuten mehr
                Auswahl – du nimmst nur noch die Aufträge, die du wirklich willst.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Höherer Verkaufspreis.</strong> Eine professionelle Website mit
                funktionierendem SEO ist ein konkreter Vermögenswert, den Käufer bezahlen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Einfache Übergabe.</strong> Domain, Rankings und Anfragen gehen nahtlos
                zum Nachfolger – er startet mit Rückenwind.
              </li>
              <li>
                <strong>Kein Risiko, keine Bindung.</strong> Monatlich kündbar, 99 €/Monat.
                Kündige, wenn du aufhörst – vorher profitierst du.
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
                Starte jetzt – und profitiere bis zum Schluss
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
                Wir zeigen dir kostenlos, wie deine Website aussehen könnte. Monatlich kündbar,
                ab 99 €/Monat, kein Technikwissen nötig.
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
