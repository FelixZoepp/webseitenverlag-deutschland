import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website ohne Zeitaufwand: Wie das Abo-Modell dir Arbeit abnimmt",
  description: "Keine Zeit für eine Website? Mit dem richtigen Anbieter brauchst du kaum eigene Zeit – wir erklären wie.",
  openGraph: {
    title: "Website ohne Zeitaufwand: Wie das Abo-Modell dir Arbeit abnimmt",
    description: "Wer eine Website selbst baut oder pflegt, braucht Zeit. Wer die richtige Lösung wählt, nicht. Wie eine professionelle Website ohne eigenen Aufwand funktioniert.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Wie viel Zeit muss ich investieren?",
    a: "Für die Demo-Anfrage und Erstabstimmung ca. 30 Minuten. Für die Freigabe des Entwurfs nochmal 15 bis 30 Minuten. Das war's. Danach läuft die Website, und du musst nichts tun – außer die Anfragen entgegennehmen.",
  },
  {
    q: "Wer pflegt die Website?",
    a: "Wir. Technische Updates, Sicherheits-Patches, Backups – alles wird von uns im Hintergrund erledigt. Wenn du Inhalte ändern willst, schickst du uns eine kurze Nachricht. Änderungen werden in der Regel innerhalb von 24 bis 48 Stunden umgesetzt.",
  },
  {
    q: "Was muss ich an Inhalten liefern?",
    a: "Weniger als du denkst. Vorab sammeln wir alle Infos, die wir brauchen: Leistungen, Einsatzgebiet, ein paar Eckdaten zu deinem Betrieb. Fotos, wenn du welche hast – wenn nicht, haben wir professionelle Stockfotos als Platzhalter. Texte schreiben wir auf Basis deiner Angaben.",
  },
  {
    q: "Wie schnell ist die Website fertig?",
    a: "Typischerweise 5 bis 7 Werktage nach Ihrer Demo-Anfrage. Du siehst einen Entwurf, gibst Feedback, wir setzen es um. In der Regel ist die Website nach maximal zwei Feedback-Runden live.",
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
            headline: "Website ohne Zeitaufwand: Wie das Abo-Modell dir Arbeit abnimmt",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-08-25",
            dateModified: "2026-08-25",
            description:
              "Keine Zeit für eine Website? Mit dem richtigen Anbieter brauchst du kaum eigene Zeit – wir erklären wie.",
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
              25. August 2026 · 5 Min. Lesezeit
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
            Website ohne Zeitaufwand: Wie das Abo-Modell dir{" "}
            <span className="accent">Arbeit abnimmt</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            &ldquo;Keine Zeit&rdquo; ist der häufigste Einwand – und der am einfachsten zu
            widerlegende. Hier ist warum.
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
              Du bist den ganzen Tag auf der Baustelle, im Behandlungsraum oder beim Kunden.
              Abends bist du müde. Die Website kommt seit Monaten auf die To-Do-Liste – und
              kommt nie dran. Das ist keine Faulheit, das ist Alltag. Aber der Einwand
              &ldquo;keine Zeit&rdquo; setzt eine Annahme voraus, die falsch ist: dass du
              die Website selbst machen müsstest.
            </p>
            <p>
              Das Abo-Modell funktioniert anders. Wir bauen, wir pflegen, wir kümmern uns.
              Du gibst uns 30 Minuten – und bekommst eine fertige Website, die für dich
              arbeitet, während du deinen Job machst.
            </p>

            {/* H2: Was wirklich Zeit kostet */}
            <h2 style={h2Style}>Was wirklich Zeit kostet – und was nicht</h2>
            <p>
              Hier liegt das Missverständnis. Die meisten Selbstständigen denken an den Aufwand,
              den sie aus anderen Kontexten kennen:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Baukasten selbst bauen:</strong> 10 bis 20 Stunden für ein halbwegs
                professionelles Ergebnis – und dann nochmal Stunden für Pflege, Updates,
                Fehlersuche
              </li>
              <li>
                <strong>Agentur koordinieren:</strong> Briefings schreiben, Entwürfe kommentieren,
                Korrekturrunden durchlaufen, Texte liefern – leicht 5 bis 15 Stunden eigene
                Arbeit
              </li>
              <li>
                <strong>Abo-Modell mit Full-Service:</strong> 30 Minuten Demo-Gespräch,
                15 Minuten Entwurf-Feedback. Das war es.
              </li>
            </ul>
            <p>
              Das ist kein Trick. Das ist das Modell. Wir haben den Prozess so aufgebaut,
              dass wir mit minimaler Information von dir eine fertige, professionelle Website
              erstellen können.
            </p>

            {/* Praxis-Beispiel */}
            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Physiotherapeut aus Köln wollte seit
              zwei Jahren eine Website – kam nie dazu. Im Gespräch hat er 30 Minuten
              erzählt, was er macht und wen er behandelt. 5 Tage später war die Website live.
              Eigenaufwand gesamt: 45 Minuten. Erste Anfrage über die Website: 11 Tage
              nach Launch.
            </div>

            {/* H2: Was wir übernehmen */}
            <h2 style={h2Style}>Was wir komplett übernehmen</h2>

            <h3 style={h3Style}>Design und Struktur</h3>
            <p>
              Wir entwerfen eine Website, die zu deinem Betrieb und deiner Zielgruppe passt.
              Du siehst den Entwurf, gibst Feedback – und wir setzen es um. Kein
              Design-Kurs nötig, kein Farblehre-Wissen nötig.
            </p>

            <h3 style={h3Style}>Texte und Inhalte</h3>
            <p>
              Auf Basis deiner Angaben schreiben wir alle Texte für
              deine Website. Leistungsbeschreibungen, Über-uns-Seite, Kontaktseite. Du liest
              drüber, sagst ob es passt – und wir sind fertig.
            </p>

            <h3 style={h3Style}>Technik, Hosting, SSL</h3>
            <p>
              Domain-Konfiguration, Hosting-Setup, SSL-Zertifikat, Ladezeit-Optimierung –
              alles läuft bei uns im Hintergrund. Du musst nicht wissen, was ein
              DNS-Eintrag ist.
            </p>

            <h3 style={h3Style}>Pflege und Updates</h3>
            <p>
              Nach dem Launch kümmern wir uns um technische Updates, Sicherheits-Patches
              und Backups. Wenn du Preise ändern oder neue Leistungen hinzufügen willst,
              schreibst du uns kurz – und wir erledigen es.
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
                30 Minuten – mehr brauchst du nicht
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Ein kurzes Gespräch, und wir wissen alles, was wir brauchen. Den Rest
                erledigen wir.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Jetzt kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Kein Technik-Wissen nötig */}
            <h2 style={h2Style}>Kein Technik-Wissen nötig – wirklich</h2>
            <p>
              Das sagen viele Anbieter, aber meinen damit: &ldquo;Du brauchst nur wenig
              Technik-Wissen.&rdquo; Wir meinen es wörtlich. Du musst nicht wissen:
            </p>
            <ul style={ulStyle}>
              <li>Was WordPress ist oder wie man es bedient</li>
              <li>Was SEO bedeutet oder wie man Keywords recherchiert</li>
              <li>Wie man eine Domain registriert oder einen Hosting-Account anlegt</li>
              <li>Was responsive Design ist oder wie man es umsetzt</li>
            </ul>
            <p>
              Du weißt, was du machst und für wen. Das reicht. Den Rest übersetzen wir
              in eine Website.
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
            <h2 style={h2Style}>Fazit: Keine Zeit ist keine Ausrede mehr</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>30 Minuten reichen.</strong> Die Demo-Anfrage ist alles, was du
                wirklich selbst tun musst. Den Rest übernehmen wir.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Kein Technik-Wissen erforderlich.</strong> Du erklärst uns dein
                Handwerk – wir übersetzen das in eine professionelle Website.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Fertig in 5 bis 7 Tagen.</strong> Nicht in Monaten, nicht nach
                dem dritten Briefing-Dokument. Schnell und unkompliziert.
              </li>
              <li>
                <strong>Danach: Null Aufwand.</strong> Wir pflegen, du profitierst.
                Die Website arbeitet für dich – 24 Stunden am Tag, auch wenn du schläfst.
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
                Bereit? 30 Minuten reichen.
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
                Erzähl uns kurz, was du machst und wo du tätig bist. In wenigen Tagen
                hast du eine fertige, professionelle Website – ohne Technikstress.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "18px 40px", fontSize: 16 }}
              >
                <span>Jetzt kostenlose Demo ansehen →</span>
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
