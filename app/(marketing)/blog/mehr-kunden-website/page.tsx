import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Genug Kunden? Warum eine Website trotzdem sinnvoll ist",
  description:
    "Volle Auftragsbücher bedeuten nicht, dass eine Website keinen Wert hätte. Wir zeigen, wie sie bessere Kunden, höhere Preise und mehr Unabhängigkeit bringt.",
  openGraph: {
    title: "Genug Kunden? Warum eine Website trotzdem sinnvoll ist",
    description:
      "Wer ausgelastet ist, denkt nicht an Marketing. Aber eine Website bringt nicht nur mehr Kunden – sie bringt bessere Kunden und macht deinen Betrieb wertvoller.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Warum brauche ich eine Website, wenn ich ausgelastet bin?",
    a: "Weil Auslastung nicht das gleiche ist wie Profitabilität. Eine Website zieht nicht einfach mehr Kunden an – sie zieht die richtigen Kunden an. Kunden, die bereit sind, mehr zu zahlen, größere Projekte zu beauftragen und dich weiterzuempfehlen. Wer nur über Mund-zu-Mund ausgelastet ist, hat oft viele kleine Aufträge. Eine gute Website bringt größere.",
  },
  {
    q: "Kann ich über eine Website bessere Aufträge bekommen?",
    a: "Ja, und das ist einer der am meisten unterschätzten Vorteile. Eine professionelle Website signalisiert Qualität noch bevor du den ersten Satz gesagt hast. Kunden, die sich vorab informieren und dann kontaktieren, haben oft ein höheres Budget und sind weniger preissensitiv als Laufkundschaft oder Empfehlungskunden ohne Erwartungen.",
  },
  {
    q: "Was bringt eine Website beim Firmenverkauf?",
    a: "Enorm viel. Ein Betrieb mit einer professionellen Online-Präsenz, stabilen Anfragen über Google und dokumentierten Kundenstimmen ist deutlich wertvoller als einer ohne. Käufer und Nachfolger bewerten digitale Sichtbarkeit als festen Bestandteil des Unternehmenswertes. Eine Website ist also nicht nur Akquise-Tool – sie ist Kapital.",
  },
  {
    q: "Wie filtere ich Kunden über die Website?",
    a: "Indem du klar kommunizierst, für wen du da bist – und für wen nicht. Preisrahmen angeben, Projektgröße nennen, Referenzen zeigen: All das signalisiert potenziellen Kunden, ob sie zu dir passen. Das spart dir Zeit bei der Erstberatung und reduziert die Anzahl der Anfragen, die nie zu Aufträgen werden.",
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
            headline: "Genug Kunden? Warum eine Website trotzdem sinnvoll ist",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-09-22",
            dateModified: "2026-09-22",
            description:
              "Volle Auftragsbücher bedeuten nicht, dass eine Website keinen Wert hätte. Wir zeigen, wie sie bessere Kunden, höhere Preise und mehr Unabhängigkeit bringt.",
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
              22. September 2026 · 6 Min. Lesezeit
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
            Genug Kunden? Warum eine Website{" "}
            <span className="accent">trotzdem</span> sinnvoll ist
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Es geht nicht darum, mehr Kunden zu bekommen – sondern bessere.
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
              &ldquo;Ich habe genug Kunden – wozu brauche ich eine Website?&rdquo; Eine
              berechtigte Frage. Und auf den ersten Blick ist die Logik absolut nachvollziehbar:
              Wenn das Auftragsbuch voll ist, warum noch investieren?
            </p>
            <p>
              Aber &ldquo;ausgelastet&rdquo; und &ldquo;optimal aufgestellt&rdquo; sind zwei
              verschiedene Dinge. Eine Website bringt nicht nur mehr Kunden – sie bringt bessere
              Kunden, höhere Aufträge und macht deinen Betrieb langfristig wertvoller. Auch wenn
              du morgen nicht mehr einen einzigen neuen Kunden bräuchtest.
            </p>

            {/* H2: Bessere Kunden */}
            <h2 style={h2Style}>Mehr Kunden ist nicht das Ziel – bessere Kunden schon</h2>
            <p>
              Wer seinen Kundenstamm hauptsächlich über Mundpropaganda aufbaut, hat wenig
              Kontrolle darüber, wer reinkommt. Du bekommst die Kunden, die deine Kunden
              empfehlen. Das ist oft gut – aber nicht immer optimal.
            </p>
            <p>
              Eine professionelle Website dagegen filtert passiv: Wer sich die Zeit nimmt, deine
              Website zu lesen, Referenzen anzusehen und dann eine Anfrage zu stellen, ist
              häufig ernster, budgetbewusster und klarer in seinen Vorstellungen. Das bedeutet
              weniger Hin-und-Her, weniger Nachverhandlungen, höhere Abschlussquoten.
            </p>

            <h3 style={h3Style}>Warum Professionalität den Preis beeinflusst</h3>
            <p>
              Stell dir vor, ein Kunde googelt dich und findet eine sauber gestaltete Website mit
              Referenzen, Leistungsübersicht und echten Kundenstimmen. Bevor er dich anruft,
              ist ein Teil seines Vertrauens bereits aufgebaut. Er kommt nicht mit dem Preisdruck
              des Erstverdächts – er kommt mit der Bereitschaft, für Qualität zu zahlen.
            </p>

            {/* H2: Preise */}
            <h2 style={h2Style}>Stärkere Preisverhandlungen durch Sichtbarkeit</h2>
            <p>
              Hier ist ein psychologischer Effekt, der oft unterschätzt wird: Wer eine Website
              hat, wirkt etablierter. Wer etablierter wirkt, hat mehr Verhandlungsmacht. Das klingt
              simpel, ist aber in der Praxis spürbar.
            </p>
            <p>
              Kunden, die über Google auf dich stoßen und eine professionelle Website sehen,
              zweifeln weniger am Preis als Kunden, die nur eine Telefonnummer bekommen. Die
              Website ist dein stiller Verkäufer – er arbeitet schon, bevor du abgehoben hast.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Tischler aus dem Münchner Umland hatte
              volle Auftragsbücher – fast ausschließlich über Weiterempfehlungen. Nach dem Launch
              seiner Website änderte sich die Art der Anfragen: Statt viele kleine Aufträge kamen
              gezielt größere Projekte – Kücheneinbauten, Maßmöbel, Renovierungen. Sein
              Durchschnittsauftrag stieg innerhalb von 6 Monaten um 40 %. Gesamtvolumen gleich –
              aber weniger Aufwand, mehr Ertrag.
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
                Nicht mehr Kunden – bessere Kunden. Ab 99 € netto/Monat.
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Zeig uns dein Gewerk. Wir zeigen dir, wie eine Website deine Auftragsqualität
                verändern kann.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Unabhängigkeit */}
            <h2 style={h2Style}>Unabhängigkeit: Was passiert, wenn eine Empfehlung wegfällt?</h2>
            <p>
              Wer ausschließlich über Empfehlungen arbeitet, ist von einzelnen Quellen abhängig.
              Wenn dein größter Auftraggeber aufhört, oder dein bester Empfehler die Stadt
              verlässt, bricht die Auslastung ein. Das ist ein unternehmerisches Risiko, das
              viele unterschätzen.
            </p>
            <p>
              Eine Website schafft einen zweiten, unabhängigen Kanal. Selbst wenn du ihn nie
              voll ausschöpfen musst – er ist da. Als Absicherung. Als Option. Als Hebel, falls
              du irgendwann wachsen oder die Nische wechseln willst.
            </p>

            <h3 style={h3Style}>Und wenn du den Betrieb mal verkaufen willst?</h3>
            <p>
              Ein Betrieb mit funktionierendem Online-Auftritt, messbaren Anfragen über Google
              und dokumentierten Kundenstimmen ist deutlich mehr wert als einer ohne. Käufer
              und Nachfolger schauen sich digitale Sichtbarkeit als Asset an. Eine Website ist
              also auch Kapital – langfristiger als jeder einzelne Auftrag.
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
            <h2 style={h2Style}>Fazit: Auslastung ist gut – Qualität ist besser</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Eine Website bringt nicht nur mehr Kunden – sie bringt bessere.</strong>{" "}
                Wer über Google kommt, hat eine höhere Kaufabsicht und ist weniger preissensitiv.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Professionelle Außenwirkung stärkt deine Preisverhandlungen.</strong>{" "}
                Kunden, die deine Website gesehen haben, zweifeln weniger am Preis.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Ein zweiter Kanal schützt dich vor Abhängigkeit.</strong> Empfehlungen
                sind wertvoll – aber eine Website ist eine Versicherung.
              </li>
              <li>
                <strong>Eine Website ist auch Kapital.</strong> Sie erhöht den Wert deines
                Betriebs – heute und wenn du ihn eines Tages übergibst.
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
                Mehr Qualität, weniger Stress – lass uns reden
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
                Wir zeigen dir in 15 Minuten, wie eine Website deine Auftragsqualität verändern
                kann – kostenlos, unverbindlich, ohne Technik-Stress.
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
