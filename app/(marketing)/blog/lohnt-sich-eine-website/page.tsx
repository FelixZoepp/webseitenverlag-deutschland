import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Lohnt sich eine Website? Ehrliche Antwort mit Zahlen",
  description: "Bringt eine Website wirklich Kunden? Wir liefern keine Marketing-Versprechen, sondern ehrliche Zahlen – für wen es sich lohnt und für wen nicht.",
  openGraph: {
    title: "Lohnt sich eine Website? Ehrliche Antwort mit Zahlen",
    description: "Statt Versprechen liefern wir Zahlen: Wann eine Website sich lohnt, wann nicht – und was du tun musst, damit sie tatsächlich Anfragen bringt.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Ab wann rechnet sich eine Website?",
    a: "Im Abo-Modell ab 99 € netto/Monat rechnet sich eine Website oft schon mit einem einzigen neuen Kunden pro Monat. Bei einem durchschnittlichen Auftragswert von 500 Euro ist der ROI sofort positiv. Für die meisten lokalen Dienstleister gilt: Wer in einer Stadt mit mehr als 20.000 Einwohnern arbeitet, kann realistische Anfragen über seine Website erwarten.",
  },
  {
    q: "Wie viele Kunden bringt eine Website?",
    a: "Das hängt von Branche, Standort und Suchvolumen ab. Ein Elektriker in einer Großstadt mit 500+ monatlichen Suchanfragen kann bei guter SEO-Optimierung mit 3 bis 8 Anfragen pro Monat rechnen. Ein Spezialist in einer kleinen Nische vielleicht mit 1 bis 2. Entscheidend ist: Selbst 1 Anfrage pro Monat kann die Website-Kosten mehrfach decken.",
  },
  {
    q: "Funktioniert das auch in kleinen Städten?",
    a: "Ja – oft sogar besser. In kleinen Städten ist die Konkurrenz online geringer. Wenn du als Handwerker in einem 15.000-Einwohner-Ort die einzige professionelle Website in deiner Branche hast, rankst du bei Google automatisch ganz oben. Die Zahl der Anfragen ist kleiner, aber die Abschlussquote ist höher, weil Alternativen fehlen.",
  },
  {
    q: "Was ist wenn ich in einer Nische arbeite?",
    a: "Nischen sind oft besonders profitabel für Websites. Wer zum Beispiel auf Industriereinigung, Treppenlift-Montage oder Denkmalschutz-Sanierung spezialisiert ist, hat wenig Konkurrenz online – und Kunden, die gezielt suchen und hohe Auftragswerte mitbringen. Eine Nischen-Website muss nicht viel Traffic haben, um sich zu rechnen.",
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
            headline: "Lohnt sich eine Website? Ehrliche Antwort mit Zahlen",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-08-18",
            dateModified: "2026-08-18",
            description:
              "Bringt eine Website wirklich Kunden? Wir liefern keine Marketing-Versprechen, sondern ehrliche Zahlen – für wen es sich lohnt und für wen nicht.",
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
              18. August 2026 · 7 Min. Lesezeit
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
            Lohnt sich eine Website? Ehrliche Antwort mit{" "}
            <span className="accent">Zahlen</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Keine Marketing-Versprechen. Nur Zahlen, Formeln und ehrliche Einschätzungen –
            damit du selbst entscheiden kannst.
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
              &ldquo;Eine Website bringt mir doch nichts&rdquo; – das ist der ehrlichste aller
              Einwände. Keine Angst vor Kosten, keine Ausrede mit dem Neffen. Nur die echte
              Frage: Lohnt sich das überhaupt? Diese Frage verdient eine ehrliche Antwort.
              Mit Zahlen, nicht mit Versprechen.
            </p>
            <p>
              Spoiler: Für die meisten lokalen Dienstleister und Handwerker lautet die Antwort
              ja – oft deutlicher als gedacht. Aber es gibt Ausnahmen. Die schauen wir uns
              ebenfalls an.
            </p>

            {/* H2: Die ROI-Formel */}
            <h2 style={h2Style}>Die ROI-Formel für deine Website</h2>
            <p>
              Ob sich eine Website lohnt, lässt sich berechnen. Die Formel ist simpel:
            </p>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 15,
                padding: "16px 20px",
                background: "rgba(37,99,235,0.05)",
                border: "1px solid rgba(37,99,235,0.15)",
                borderRadius: 12,
                marginBottom: 24,
              }}
            >
              Suchvolumen × CTR × Konversionsrate × Auftragswert = monatlicher Mehrwert
            </p>
            <p>
              Klingt abstrakt? Ein konkretes Beispiel macht es greifbar.
            </p>

            {/* Praxis-Beispiel */}
            <div style={defBox}>
              <strong>Praxis-Beispiel Maler in Hannover:</strong>
              <br />
              Monatliche Suchanfragen für &ldquo;Maler Hannover&rdquo;: ca. 320
              <br />
              Klickrate auf Position 3–5 in Google: ~6 % = 19 Klicks
              <br />
              Konversionsrate Website → Anfrage: ~16 % = 3 Anfragen
              <br />
              Abschlussquote Anfrage → Auftrag: ~33 % = 1 Auftrag
              <br />
              Durchschnittlicher Auftragswert: 2.400 Euro
              <br />
              <br />
              <strong>Ergebnis: 2.400 Euro Mehrumsatz pro Monat bei 99 € netto Kosten.</strong>
            </div>

            {/* H2: Vergleich mit Offline */}
            <h2 style={h2Style}>Vergleich: Website vs. Offline-Akquise</h2>
            <p>
              Stellen wir die Website dagegen, was sie ersetzen oder ergänzen würde:
            </p>

            <h3 style={h3Style}>Option 1: Nur auf Empfehlungen setzen</h3>
            <p>
              Empfehlungen kosten nichts – aber sie sind nicht steuerbar. Du weißt nicht,
              wann die nächste kommt. Du kannst sie nicht hochskalieren. Und wenn ein guter
              Empfehler wegfällt, fällt auch dein Kundenstrom weg. Das ist kein Geschäftsmodell,
              das ist Abhängigkeit.
            </p>

            <h3 style={h3Style}>Option 2: Flyer, Printanzeigen, Branchenbuch</h3>
            <p>
              Diese Kanäle kosten zwischen 200 und 800 Euro pro Kampagne – mit einmaliger
              Wirkung und keiner Messbarkeit. Eine Website kostet 99 € netto/Monat und arbeitet
              rund um die Uhr, wird mit der Zeit stärker und lässt sich mit Google Analytics
              komplett auswerten.
            </p>

            <h3 style={h3Style}>Option 3: Google Ads</h3>
            <p>
              Google Ads funktioniert – aber es ist teuer (200–600 Euro/Monat für spürbare
              Ergebnisse) und hört sofort auf zu wirken, wenn du das Budget stoppst.
              Eine organisch gut positionierte Website bringt auch nach Monaten noch Anfragen,
              ohne zusätzliche Kosten.
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
                Wie viel könnte eine Website für dich bringen?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Wir schauen gemeinsam, wie groß das Potenzial in deiner Branche und Stadt ist –
                kostenlos, ohne Verpflichtung.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Wann rechnet es sich NICHT */}
            <h2 style={h2Style}>Wann rechnet sich eine Website nicht?</h2>
            <p>
              Ehrlichkeit bedeutet auch das zu sagen: Es gibt Fälle, in denen eine Website
              weniger bringt.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Wenn das Suchvolumen in der Nische zu gering ist:</strong> Bei extrem
                spezialisierten B2B-Dienstleistungen, bei denen Kunden nicht googeln, sondern
                über Netzwerke und Ausschreibungen kommen.
              </li>
              <li>
                <strong>Wenn die Website schlecht gemacht ist:</strong> Eine technisch schlechte,
                SEO-freie oder unübersichtliche Website bringt wenig – egal wie viel Geld
                du dafür ausgegeben hast.
              </li>
              <li>
                <strong>Wenn du komplett ausgelastet bist und keine Kapazität hast:</strong>{" "}
                Dann ist der richtige Zeitpunkt vielleicht gerade nicht jetzt – aber dann ist
                er in 3 Monaten.
              </li>
            </ul>
            <p>
              Für die große Mehrheit lokaler Handwerker, Dienstleister und Selbstständiger
              gilt: Das Potenzial ist da. Die Frage ist nur, ob es genutzt wird.
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
            <h2 style={h2Style}>Fazit: Die Zahlen sprechen für sich</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Für die meisten lokalen Dienstleister lohnt es sich – deutlich.</strong>{" "}
                Die ROI-Formel zeigt: Selbst bei konservativen Annahmen überwiegt der Nutzen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Eine Website ist kein Kostenpunkt, sondern ein Kanal.</strong>{" "}
                Sie ersetzt keine Empfehlungen, aber sie ergänzt sie mit einem planbaren,
                steuerbaren Kundenstrom.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Das Risiko ist begrenzt.</strong> Im Abo-Modell bei 99 € netto/Monat
                weißt du nach dem ersten Monat, ob Anfragen kommen – und kannst dann
                entscheiden.
              </li>
              <li>
                <strong>Abwarten kostet auch.</strong> Jeder Monat ohne Website ist ein Monat,
                in dem Konkurrenten die Kunden holen, die eigentlich zu dir könnten.
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
                Lass die Zahlen für dich sprechen
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
                In einem kurzen Gespräch schauen wir gemeinsam, wie viel Potenzial in
                deiner Branche und Stadt steckt. Kostenlos und ohne Druck.
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
