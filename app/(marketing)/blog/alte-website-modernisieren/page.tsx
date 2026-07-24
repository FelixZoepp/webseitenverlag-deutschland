import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Alte Website modernisieren: Lohnt sich das oder besser neu?",
  description: "Du hast schon eine Website – aber wann ist es Zeit für einen Relaunch? Diese Zeichen sagen dir, ob deine alte Seite mehr schadet als nützt.",
  openGraph: {
    title: "Alte Website modernisieren: Lohnt sich das oder besser neu?",
    description: "Eine veraltete Website kann aktiv Kunden abschrecken. Diese Anzeichen verraten, ob deine bestehende Seite dir hilft oder im Weg steht.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Woran erkenne ich, dass meine Website veraltet ist?",
    a: "Die deutlichsten Zeichen: Die Seite sieht auf dem Handy schlecht aus (nicht responsiv), lädt länger als 3 Sekunden, hat kein SSL-Zertifikat (kein https://), wurde seit über 2 Jahren nicht aktualisiert oder wirkt optisch wie aus den 2010ern. Wenn mehrere Punkte zutreffen, solltest du handeln.",
  },
  {
    q: "Was kostet eine Modernisierung?",
    a: "Das hängt stark ab, wie weit du gehen willst. Ein einfacher Relaunch (neues Design, gleiche Inhalte) kostet bei einer Agentur 1.500 bis 4.000 Euro. Ein kompletter Neustart mit neuem CMS, SEO-Optimierung und frischen Inhalten liegt bei 3.000 bis 8.000 Euro. Im Abo-Modell startest du direkt mit einer modernen Seite ab 99 € netto/Monat.",
  },
  {
    q: "Verliere ich mein Google-Ranking beim Neustart?",
    a: "Wenn du die URLs beibehältst oder korrekte Weiterleitungen (301-Redirects) einrichtest, nicht. Kurze Schwankungen nach einem Relaunch sind normal und legen sich meistens innerhalb von 4 bis 8 Wochen. Eine moderne, schnelle, mobile-freundliche Website wird danach in der Regel besser ranken als die alte.",
  },
  {
    q: "Kann ich meine Domain behalten?",
    a: "Ja, immer. Deine Domain gehört dir und kann auf jede neue Website zeigen. Beim Wechsel des Anbieters werden nur die DNS-Einstellungen geändert – das dauert typischerweise 24 bis 48 Stunden.",
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
            headline: "Alte Website modernisieren: Lohnt sich das oder besser neu?",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-08-04",
            dateModified: "2026-08-04",
            description:
              "Du hast schon eine Website – aber wann ist es Zeit für einen Relaunch? Diese Zeichen sagen dir, ob deine alte Seite mehr schadet als nützt.",
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
              4. August 2026 · 7 Min. Lesezeit
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
            Alte Website modernisieren: Lohnt sich das oder besser{" "}
            <span className="accent">neu</span>?
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Eine bestehende Website ist nicht automatisch eine gute Website. Wann deine alte
            Seite mehr Schaden anrichtet als Nutzen bringt.
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
              &ldquo;Ich hab schon eine Website&rdquo; – das klingt nach einem guten Argument.
              Aber eine alte, veraltete Website kann dir aktiv schaden: Sie schreckt Besucher ab,
              rankt schlecht bei Google und macht einen unprofessionellen Eindruck. Die Frage ist
              nicht ob du eine Website hast, sondern ob sie noch für dich arbeitet.
            </p>
            <p>
              In diesem Artikel zeigen wir dir, woran du erkennst, ob deine Website veraltet ist,
              was das konkret kostet – und wann ein Neustart mehr Sinn ergibt als Flickschusterei.
            </p>

            {/* H2: Zeichen */}
            <h2 style={h2Style}>5 Zeichen, dass deine Website dich Kunden kostet</h2>

            <h3 style={h3Style}>1. Sie funktioniert auf dem Handy nicht richtig</h3>
            <p>
              Über 60 % des Web-Traffics kommt heute vom Smartphone. Wenn deine Website auf dem
              Handy nicht gut aussieht – Text zu klein, Buttons zu eng, horizontal scrollen nötig –
              verlässt die Mehrzahl deiner Besucher die Seite innerhalb von Sekunden. Google
              bestraft das zusätzlich mit schlechteren Rankings.
            </p>

            <h3 style={h3Style}>2. Sie lädt langsam</h3>
            <p>
              Google hat es gemessen: Jede Sekunde zusätzliche Ladezeit kostet dich 20 % der
              Besucher. Eine Website, die länger als 3 Sekunden lädt, verliert die meisten
              Besucher, bevor sie auch nur eine Zeile gelesen haben. Teste deine Seite unter
              pagespeed.web.dev – wenn die Punktzahl unter 60 liegt, ist Handeln angesagt.
            </p>

            <h3 style={h3Style}>3. Du wirst bei Google nicht gefunden</h3>
            <p>
              Ältere Websites fehlt oft die technische Grundlage für gutes SEO: keine
              Meta-Beschreibungen, fehlende Struktur, veraltetes CMS, kein https. Das bedeutet:
              Deine Konkurrenten erscheinen bei lokalen Suchen – du nicht.
            </p>

            <h3 style={h3Style}>4. Das Design wirkt wie aus dem letzten Jahrzehnt</h3>
            <p>
              Menschen urteilen in Millisekunden über eine Website. Eine veraltete Optik signalisiert:
              Dieser Betrieb ist vielleicht auch sonst nicht mehr auf dem neuesten Stand. Das
              Vertrauen ist weg, bevor dein Angebot überhaupt gelesen wurde.
            </p>

            <h3 style={h3Style}>5. Du kannst nichts selbst aktualisieren</h3>
            <p>
              Wenn du für jede Änderung jemanden anrufen musst – und dieser Jemand sich Wochen
              Zeit lässt oder schon gar nicht mehr erreichbar ist – dann ist deine Website ein
              starres System aus der Vergangenheit.
            </p>

            {/* Praxis-Beispiel */}
            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Steuerberater aus München hatte seit 2018
              eine Jimdo-Seite. Sie war nie wirklich gepflegt worden und sah auf dem Handy
              katastrophal aus. Anfragen über die Website: null. Nach einem Neustart mit
              modernem Design und lokalem SEO: 6 qualifizierte Anfragen im ersten Monat.
            </div>

            {/* H2: Modernisieren oder neu */}
            <h2 style={h2Style}>Modernisieren oder neu starten – was ist besser?</h2>
            <p>
              Das hängt vom Zustand deiner aktuellen Website ab. Als Faustregel gilt:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Modernisieren sinnvoll</strong> wenn: das Grunddesign noch stimmt, die
                Inhalte aktuell sind und nur Technik und Performance verbessert werden müssen
              </li>
              <li>
                <strong>Neustart sinnvoller</strong> wenn: die Seite auf einem alten Baukasten
                läuft, keine SEO-Grundlagen hat, seit Jahren nicht aktualisiert wurde oder auf
                mobilen Geräten unbenutzbar ist
              </li>
            </ul>
            <p>
              In der Praxis ist ein kompletter Neustart oft günstiger als ein aufwändiges
              Modernisierungsprojekt – vor allem wenn du von einem Baukasten wie Jimdo, Wix oder
              einem alten WordPress auf etwas Modernes wechselst.
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
                Wir schauen uns deine aktuelle Website an – kostenlos
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                In einem kurzen Gespräch analysieren wir, wo deine Website steht – und zeigen dir,
                wie ein Neustart aussehen könnte. Kein Verkaufsdruck.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Domain behalten */}
            <h2 style={h2Style}>Was du beim Wechsel behalten kannst</h2>
            <p>
              Ein häufiger Einwand: &ldquo;Aber ich hab mein Google-Ranking aufgebaut – das will
              ich nicht verlieren.&rdquo; Das ist berechtigt, aber lösbar.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Deine Domain bleibt:</strong> Du behältst dieselbe Webadresse. Beim
                Wechsel des Anbieters wird nur die Zieladresse geändert.
              </li>
              <li>
                <strong>Weiterleitungen sichern das Ranking:</strong> Mit sogenannten
                301-Redirects leitest du alte URLs auf neue weiter. Google überträgt dabei
                den Großteil der Rankingkraft.
              </li>
              <li>
                <strong>Moderne Seiten ranken besser:</strong> Eine schnelle, mobile-optimierte
                Website gewinnt bei Google nach einem Relaunch oft deutlich an Sichtbarkeit –
                selbst wenn es kurzfristig kleine Schwankungen gibt.
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
            <h2 style={h2Style}>Fazit: Eine schlechte Website ist schlimmer als keine</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Veraltete Websites kosten aktiv Kunden.</strong> Schlechte
                Mobil-Darstellung, langsame Ladezeiten und veraltetes Design schrecken
                Besucher ab – und Google gleich mit.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Ein Neustart ist oft günstiger als Flicken.</strong> Vor allem beim
                Wechsel von alten Baukästen lohnt sich ein kompletter Neustart mehr als
                ein teures Modernisierungsprojekt.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Domain und Ranking können übertragen werden.</strong> Mit den
                richtigen Weiterleitungen verlierst du nichts – und gewinnst oft sogar.
              </li>
              <li>
                <strong>Ab 99 € netto/Monat startest du sofort modern.</strong> Ohne
                Einmalkosten, ohne Risiko, mit professionellem Ergebnis.
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
                Zeit für einen frischen Start?
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
                Wir schauen uns deine aktuelle Website an und zeigen dir, was möglich wäre –
                ohne Verpflichtung, ohne Kosten.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "18px 40px", fontSize: 16 }}
              >
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
