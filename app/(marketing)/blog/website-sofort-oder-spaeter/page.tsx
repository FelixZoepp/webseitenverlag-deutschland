import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website jetzt oder später? Warum Warten dich Kunden kostet",
  description:
    "Jeder Monat ohne Website ist ein Monat, in dem deine Konkurrenz den SEO-Vorsprung ausbaut. Wir rechnen vor, was dich das Warten wirklich kostet.",
  openGraph: {
    title: "Website jetzt oder später? Warum Warten dich Kunden kostet",
    description:
      "Opportunity Cost, SEO-Anlaufzeit, Konkurrenz auf Seite 1 – warum 'später' der teuerste Aufschub ist, den du dir leisten kannst.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Wann ist der beste Zeitpunkt für eine Website?",
    a: "Gestern. Und wenn gestern nicht möglich ist, dann heute. SEO braucht Zeit – jeder Monat, den du wartest, ist ein Monat, in dem deine Konkurrenz einen weiteren Vorsprung aufbaut. Es gibt keinen 'richtigen' Moment: Der beste Zeitpunkt ist immer so früh wie möglich.",
  },
  {
    q: "Wie lange dauert es, bis Google mich findet?",
    a: "In der Regel 3 bis 6 Monate, bis eine neue Website in den Suchergebnissen nennenswert sichtbar wird. Deshalb zählt jeder Monat: Wer heute startet, erntet im Frühjahr. Wer im Herbst startet, wartet bis zum nächsten Jahr.",
  },
  {
    q: "Kann ich erstmal klein starten?",
    a: "Ja, und genau das empfehlen wir. Eine einfache, professionelle Website mit Leistungen, Kontakt und ein paar Kundenrezensionen reicht völlig aus, um zu starten. Du brauchst keine 20 Unterseiten und keinen Online-Shop – du brauchst eine Seite, auf der potenzielle Kunden ankommen und eine Anfrage stellen können.",
  },
  {
    q: "Was verpasse ich jeden Monat ohne Website?",
    a: "Das hängt von deiner Branche und Region ab, ist aber oft erschreckend konkret: In mittelgroßen Städten suchen zwischen 200 und 1.000 Menschen pro Monat nach Handwerkern oder Dienstleistern in deiner Nische. Ohne Website siehst du diese Menschen nicht – und sie sehen dich nicht.",
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
            headline: "Website jetzt oder später? Warum Warten dich Kunden kostet",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-09-01",
            dateModified: "2026-09-01",
            description:
              "Jeder Monat ohne Website ist ein Monat, in dem deine Konkurrenz den SEO-Vorsprung ausbaut. Wir rechnen vor, was dich das Warten wirklich kostet.",
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
              1. September 2026 · 5 Min. Lesezeit
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
            Website jetzt oder später? Warum Warten dich{" "}
            <span className="accent">Kunden kostet</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Der Aufschub fühlt sich harmlos an. Die Rechnung dahinter ist es nicht.
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
              &ldquo;Ich mache das, wenn die ruhige Zeit kommt&rdquo; – diesen Satz kennen wir.
              Und wir verstehen ihn. Aber die ruhige Zeit kommt meistens nicht. Und selbst wenn
              sie kommt, ist der Schaden schon entstanden.
            </p>
            <p>
              Das Tückische an einer fehlenden Website ist, dass du die Kosten nicht siehst. Du
              weißt nicht, welche Anfragen du nicht bekommen hast. Du siehst nicht, wie viele
              Menschen deine Konkurrenz gefunden haben, weil die eine Seite bei Google hat und du
              nicht. In diesem Artikel machen wir diese unsichtbaren Kosten sichtbar.
            </p>

            {/* H2: Opportunity Cost */}
            <h2 style={h2Style}>Was dich Warten wirklich kostet: die stille Rechnung</h2>
            <p>
              Stell dir vor, in deiner Stadt suchen jeden Monat 300 Menschen nach einem Handwerker
              oder Dienstleister in deiner Branche. Das klingt nach einer groben Schätzung – ist
              es aber nicht. Das sind echte Suchanfragen bei Google, die wir für fast jede
              Branche und Region nachschlagen können.
            </p>
            <p>
              Von diesen 300 Menschen klicken vielleicht 30 auf das erste oder zweite Ergebnis.
              Davon fragen vielleicht 5 bis 8 an. Das ergibt – konservativ – 60 bis 96 verpasste
              Anfragen pro Jahr. Nur wegen einer fehlenden Website.
            </p>

            <h3 style={h3Style}>Was bedeutet das in Euro?</h3>
            <p>
              Nehmen wir an, dein durchschnittlicher Auftragswert liegt bei 500 Euro. Das ergibt
              30.000 bis 48.000 Euro an Umsatz, der dir pro Jahr entgeht – still, unsichtbar, ohne
              dass du jemals einen einzigen dieser Menschen getroffen hast.
            </p>
            <p>
              Gegenüber diesen Zahlen wirken 99 € netto/Monat für eine Website wie das, was sie sind:
              keine Ausgabe, sondern ein Investment mit klarem Rückfluss.
            </p>

            {/* H2: SEO */}
            <h2 style={h2Style}>SEO braucht Zeit – und die läuft gerade gegen dich</h2>
            <p>
              Viele denken, eine Website sei wie ein Flyer: Du erstellst sie, und dann wirkt sie
              sofort. Das stimmt leider nicht ganz. Google braucht Zeit, um eine neue Website zu
              entdecken, zu bewerten und in den Suchergebnissen zu platzieren.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Monat 1–2:</strong> Google indexiert die Seite, erste Signale werden
                gesammelt
              </li>
              <li>
                <strong>Monat 3–4:</strong> Erste Rankings erscheinen, meist noch auf Seite 2 oder 3
              </li>
              <li>
                <strong>Monat 5–6:</strong> Solide Platzierungen auf Seite 1 sind realistisch –
                wenn die Website gut gebaut ist
              </li>
            </ul>
            <p>
              Das heißt: Wer heute startet, kann im Frühjahr ernsthaft Anfragen über Google
              bekommen. Wer wartet, wartet auch auf den Erfolg.
            </p>

            {/* H2: Konkurrenz */}
            <h2 style={h2Style}>Deine Konkurrenz schläft nicht – sie baut gerade SEO-Kapital auf</h2>
            <p>
              Während du wartest, tut dein Mitbewerber etwas: Er hat eine Website. Jeder Tag,
              an dem seine Seite online ist, baut Google-Vertrauen auf. Backlinks, Klickdaten,
              Verweildauer – alles Signale, die ihn in den Rankings stärken. Und wenn du dann
              irgendwann startest, startest du gegen eine Seite an, die bereits 12 Monate Vorsprung
              hat.
            </p>
            <p>
              Das ist kein Drama, wenn du früh anfängst. Aber es ist eine reale Hürde, wenn du
              lange wartest.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Gartenbauer aus dem Rhein-Main-Gebiet hat
              6 Monate gezögert, weil er &ldquo;erstmal die Saison abwarten&rdquo; wollte. In
              dieser Zeit hat ein Konkurrent eine Website mit lokalem SEO aufgebaut und Seite 1
              für &ldquo;Gartenbau [Stadt]&rdquo; erobert. Als unser Kunde schließlich startete,
              dauerte es weitere 5 Monate, bis er auf vergleichbare Positionen kam. Kosten des
              Wartens: rund 11 Monate Sichtbarkeit und geschätzte 40 entgangene Aufträge.
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
                Starte jetzt – nicht wenn die ruhige Zeit kommt
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Wir zeigen dir kostenlos, wie deine Website aussehen könnte. In 15 Minuten. Ohne
                Verpflichtung.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

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
            <h2 style={h2Style}>Fazit: Warten ist keine Pause – es ist eine Entscheidung</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Jeder Monat ohne Website hat eine Rechnung.</strong> Die Anfragen, die
                du nicht bekommst, sind real – du siehst sie nur nicht.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>SEO braucht 3–6 Monate Anlaufzeit.</strong> Wer später startet, erntet
                später. Wer jetzt startet, erntet früher.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Deine Konkurrenz baut gerade Vorsprung auf.</strong> Jeder Tag, an dem
                ihre Seite online ist und deine nicht, ist ein Tag für Google, ihnen zu vertrauen.
              </li>
              <li>
                <strong>Klein starten ist besser als gar nicht starten.</strong> Eine einfache,
                professionelle Seite heute schlägt eine perfekte Seite in zwei Jahren.
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
                Starte heute – nicht irgendwann
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
                Wir zeigen dir in 15 Minuten, wie deine Website aussehen könnte – kostenlos,
                unverbindlich und ohne Technik-Stress.
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
