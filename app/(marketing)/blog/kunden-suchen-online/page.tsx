import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Kunden suchen online – auch nach dir (die Zahlen beweisen es)",
  description:
    "93 % aller Kaufentscheidungen beginnen mit einer Google-Suche. Wir zeigen, wie oft Kunden in deiner Branche suchen – und warum du dabei sein musst.",
  openGraph: {
    title: "Kunden suchen online – auch nach dir (die Zahlen beweisen es)",
    description:
      "Lokale Suchen, steigende In-der-Nähe-Anfragen, Branchenzahlen: Warum das Argument 'meine Kunden suchen nicht online' falsch ist.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Suchen Kunden online nach meiner Branche?",
    a: "Mit sehr hoher Wahrscheinlichkeit ja. Über 90 % aller Kaufentscheidungen – auch für lokale Handwerker und Dienstleister – beginnen mit einer Online-Suche. Selbst traditionelle Branchen wie Schreiner, Dachdecker oder Raumausstatter werden heute zuerst gegoogelt. Deine Kunden sind online. Die Frage ist nur, ob sie dich finden.",
  },
  {
    q: "Wie finde ich heraus, wie oft nach mir gesucht wird?",
    a: "Der einfachste Weg: Google deinen eigenen Beruf plus deinen Ort. Was erscheint? Und wer erscheint dort? Das gibt dir ein erstes Bild. Für genaue Suchvolumen nutzen wir Tools wie den Google Keyword Planner oder Ahrefs. Wenn du wissen willst, wie viele Menschen pro Monat in deiner Region nach dir suchen, sprich uns an – wir schauen es kostenlos für dich nach.",
  },
  {
    q: "Was ist, wenn ich in einem kleinen Ort bin?",
    a: "Dann ist die Konkurrenz oft geringer – und du kannst leichter auf Seite 1 kommen. Auch 50 Suchanfragen pro Monat können in einer kleinen Region bedeuten, dass du 3–5 neue Kunden pro Monat gewinnst. Entscheidend ist nicht das absolute Volumen, sondern ob du sichtbar bist, wenn jemand sucht.",
  },
  {
    q: "Reicht ein Google-Eintrag (Google My Business)?",
    a: "Google My Business ist ein wichtiger erster Schritt und absolut kostenlos – du solltest ihn auf jeden Fall einrichten. Aber er ersetzt keine Website. Ein GMB-Eintrag zeigt Öffnungszeiten, Bewertungen und Adresse. Eine Website erklärt deine Leistungen, zeigt Referenzen, baut Vertrauen auf und ermöglicht direkte Kontaktaufnahme. Beides zusammen ist die stärkste Kombination.",
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
            headline: "Kunden suchen online – auch nach dir (die Zahlen beweisen es)",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-09-15",
            dateModified: "2026-09-15",
            description:
              "93 % aller Kaufentscheidungen beginnen mit einer Google-Suche. Wir zeigen, wie oft Kunden in deiner Branche suchen – und warum du dabei sein musst.",
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
              15. September 2026 · 6 Min. Lesezeit
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
            Kunden suchen online – auch nach dir{" "}
            <span className="accent">(die Zahlen beweisen es)</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            &ldquo;Meine Kunden suchen nicht online&rdquo; – der teuerste Irrtum im Handwerk.
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
              &ldquo;Meine Kunden kommen alle über Empfehlung – die suchen nicht im Internet.&rdquo;
              Diesen Satz hören wir regelmäßig. Und wir verstehen, warum er sich so anfühlt.
              Aber die Daten erzählen eine andere Geschichte.
            </p>
            <p>
              93 Prozent aller Kaufentscheidungen beginnen mit einer Online-Suche. Nicht nur bei
              großen Anschaffungen – auch wenn jemand einen Elektriker, Friseur oder Landschaftsgärtner
              braucht. Wer heute einen Handwerker sucht, googelt ihn. Auch wenn er ihn danach über
              eine Empfehlung beauftragt, hat er ihn vorher online gecheckt.
            </p>

            {/* H2: Zahlen */}
            <h2 style={h2Style}>Die Zahlen, die dich überzeugen werden</h2>
            <p>
              Statt Theorie lass uns konkret werden. Hier sind echte Suchanfragen pro Monat für
              typische Handwerker-Begriffe in mittelgroßen deutschen Städten:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>&ldquo;Elektriker [Stadt]&rdquo;</strong> – 480 Suchanfragen/Monat
                in einer Stadt mit 80.000 Einwohnern
              </li>
              <li>
                <strong>&ldquo;Dachdecker [Stadt]&rdquo;</strong> – 320 Suchanfragen/Monat
              </li>
              <li>
                <strong>&ldquo;Friseur in meiner Nähe&rdquo;</strong> – mehrere Tausend täglich
                deutschlandweit
              </li>
              <li>
                <strong>&ldquo;Malerbetrieb [Stadt]&rdquo;</strong> – 210 Suchanfragen/Monat
              </li>
              <li>
                <strong>&ldquo;Umzugsunternehmen [Stadt]&rdquo;</strong> – 590 Suchanfragen/Monat
              </li>
            </ul>
            <p>
              Das sind keine abstrakten Klickzahlen. Das sind 480 echte Menschen, die einen
              Elektriker suchen. In einer einzigen mittelgroßen Stadt. In einem einzigen Monat.
              Wenn du keine Website hast, siehst du keinen davon.
            </p>

            {/* H2: In meiner Nähe */}
            <h2 style={h2Style}>&ldquo;In meiner Nähe&rdquo;: lokale Suche wächst rasant</h2>
            <p>
              Seit 2019 sind Suchanfragen mit dem Zusatz &ldquo;in meiner Nähe&rdquo; oder
              &ldquo;in [Stadt]&rdquo; um über 900 Prozent gestiegen. Das liegt daran, dass
              immer mehr Menschen ihr Smartphone nutzen, um lokale Anbieter zu finden – spontan,
              unterwegs, mit sofortiger Kaufabsicht.
            </p>
            <p>
              Wer bei einer solchen Suche auftaucht, hat einen riesigen Vorteil: Der Suchende ist
              bereit, jetzt zu kaufen. Er fragt nicht mehr, ob er jemanden braucht – er sucht
              nur noch, wen er beauftragt.
            </p>

            <h3 style={h3Style}>Was passiert, wenn du nicht auftauchst?</h3>
            <p>
              Jemand anderes bekommt den Auftrag. Nicht weil er besser ist als du. Nicht weil er
              günstiger ist. Sondern weil er eine Website hat und du nicht. Das ist die bittere,
              aber einfache Wahrheit.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Für den Begriff &ldquo;Elektriker Darmstadt&rdquo;
              gibt es 480 Suchanfragen pro Monat. Das entspricht 480 potenziellen Kunden, die aktiv
              suchen. Einer unserer Kunden – ein Elektriker-Betrieb mit 3 Mitarbeitern – erhält
              seit dem Launch seiner Website durchschnittlich 8–12 Anfragen pro Monat allein über
              Google. Vorher: null. Der einzige Unterschied ist eine professionelle Website mit
              lokalem SEO.
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
                Werde sichtbar – ab 99 € netto/Monat
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Lass uns nachschauen, wie oft in deiner Region nach deiner Branche gesucht wird.
                Kostenlos und unverbindlich.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Empfehlungen */}
            <h2 style={h2Style}>Auch Empfehlungskunden googeln dich zuerst</h2>
            <p>
              Hier ist etwas, das viele überrascht: Selbst wenn ein Kunde über eine Empfehlung
              zu dir kommt, googelt er dich trotzdem. Er sucht nach deinem Namen, schaut ob du
              eine Website hast, liest Bewertungen. Das ist heute das Erste, was Menschen tun,
              bevor sie jemanden kontaktieren – auch wenn ihnen der Name schon genannt wurde.
            </p>
            <p>
              Eine Website ist also nicht nur für neue Kunden wichtig. Sie ist auch der erste
              Vertrauensbeweis für Empfehlungskunden. Wer keine Website hat, verliert auch dort
              – still und unsichtbar.
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
            <h2 style={h2Style}>Fazit: Deine Kunden suchen online – ob du willst oder nicht</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>93 % aller Kaufentscheidungen beginnen mit Google.</strong> Das gilt auch
                für Handwerk, Dienstleistungen und lokale Branchen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Lokale Suchen explodieren.</strong> &ldquo;In meiner Nähe&rdquo;-Suchen
                sind seit 2019 um über 900 % gestiegen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Empfehlungskunden googeln dich trotzdem.</strong> Eine Website ist
                Vertrauensbeweis – auch für Kunden, die schon von dir gehört haben.
              </li>
              <li>
                <strong>Wer nicht gefunden wird, verliert.</strong> Nicht an den Besseren –
                sondern an den Sichtbareren.
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
                Lass dich finden – von den Kunden, die gerade suchen
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
                Wir zeigen dir kostenlos, wie deine Website aussehen könnte und wie viele Menschen
                in deiner Region nach dir suchen.
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
