import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website zu teuer? Warum das Abo-Modell alles ändert",
  description: "Viele Selbstständige glauben, eine professionelle Website sei zu teuer. Wir zeigen, wann sie sich rechnet – mit echten Zahlen.",
  openGraph: {
    title: "Website zu teuer? Warum das Abo-Modell alles ändert",
    description: "Ein Neukunde pro Monat reicht meist, um die Kosten zu decken. Warum 'zu teuer' der häufigste und teuerste Denkfehler beim Thema Website ist.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Was kostet eine Website wirklich?",
    a: "Das kommt auf den Weg an. Eine Agentur berechnet für eine professionelle Website zwischen 3.000 und 8.000 Euro einmalig – plus 50 bis 150 Euro/Monat für Wartung und Hosting. Im Abo-Modell bekommst du die gleiche Qualität ab 99 € netto/Monat ohne Einmalkosten.",
  },
  {
    q: "Gibt es versteckte Kosten beim Abo?",
    a: "Bei seriösen Anbietern nicht. Hosting, SSL-Zertifikat, Pflege und technischer Support sind im Abo enthalten. Frag vor Vertragsabschluss konkret nach: Was kostet ein Textupdate? Was, wenn ich neue Fotos hochladen will? Das zeigt schnell, ob der Anbieter transparent ist.",
  },
  {
    q: "Kann ich jederzeit kündigen?",
    a: "Bei uns ja. Das Abo läuft monatlich, ohne Mindestlaufzeit. Das ist übrigens der entscheidende Unterschied zur Agentur: Du gehst kein finanzielles Risiko ein. Wenn die Website nicht liefert, was sie soll, hörst du auf – fertig.",
  },
  {
    q: "Warum ist die Agentur so teuer?",
    a: "Agenturen arbeiten mit individuellem Design, haben höhere Personalkosten und kalkulieren Risiken ein. Das ist nicht per se falsch – aber für die meisten kleinen Betriebe schlicht überdimensioniert. Du brauchst keine preisgekrönte Designagentur. Du brauchst eine Website, die Kunden bringt.",
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
            headline: "Website zu teuer? Warum das Abo-Modell alles ändert",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-07-28",
            dateModified: "2026-07-28",
            description:
              "Viele Selbstständige glauben, eine professionelle Website sei zu teuer. Wir zeigen, wann sie sich rechnet – mit echten Zahlen.",
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
              28. Juli 2026 · 6 Min. Lesezeit
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
            Website zu teuer? Warum das{" "}
            <span className="accent">Abo-Modell</span> alles ändert
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Der häufigste Einwand gegen eine Website – und warum er meistens auf einem Rechenfehler
            beruht.
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
              &ldquo;Das ist mir zu teuer&rdquo; – dieser Satz fällt fast in jedem Gespräch über
              eine neue Website. Und meistens stimmt er nicht. Nicht weil Websites billig wären,
              sondern weil der Vergleich fehlt: Zu teuer im Verhältnis zu was?
            </p>
            <p>
              Wenn du eine Agentur im Kopf hast, die 5.000 Euro für eine Website verlangt, dann
              ist der Einwand verständlich. Aber das ist nicht das einzige Modell. In diesem
              Artikel rechnen wir durch, was eine Website wirklich kostet – und wann sie sich
              ab dem ersten Monat rechnet.
            </p>

            {/* H2: Vergleich */}
            <h2 style={h2Style}>Agentur vs. Abo: Was du wirklich zahlst</h2>
            <p>
              Die meisten Selbstständigen kennen nur zwei Optionen: selbst bauen (Wix, Jimdo) oder
              eine Agentur beauftragen. Beide haben ihre Tücken.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Baukasten selbst:</strong> 15–30 Euro/Monat, klingt günstig. Aber du
                verbringst Stunden mit Design, Technik und SEO – und das Ergebnis sieht es oft
                auch an.
              </li>
              <li>
                <strong>Agentur:</strong> 3.000 bis 8.000 Euro einmalig, plus 50–150 Euro/Monat
                Wartung. Hohes Risiko, lange Vorlaufzeit, kein Ergebnis garantiert.
              </li>
              <li>
                <strong>Abo-Modell:</strong> Ab 99 € netto/Monat, alles inklusive – Design, Hosting,
                Pflege, Support. Kein Risiko, kein Technikwissen nötig.
              </li>
            </ul>
            <p>
              Der entscheidende Unterschied: Beim Abo-Modell zahlst du erst, wenn du die Website
              hast – und hörst auf zu zahlen, wenn du nicht zufrieden bist. Bei der Agentur bist
              du mit 5.000 Euro dabei, bevor du eine einzige Zeile siehst.
            </p>

            {/* H2: ROI */}
            <h2 style={h2Style}>Die ehrliche ROI-Rechnung</h2>
            <p>
              99 € netto im Monat klingen nach einer festen Ausgabe. Aber stell dir die Frage anders:
              Wie viel Umsatz muss die Website bringen, damit sie sich rechnet?
            </p>

            <h3 style={h3Style}>Beispiel: Elektriker, 99 € netto/Monat</h3>
            <p>
              Ein typischer Auftrag für einen Elektriker – Unterverteilung tauschen, Steckdosen
              installieren, Beleuchtung nachrüsten – liegt zwischen 600 und 1.400 Euro.
              Nehmen wir konservativ 800 Euro an.
            </p>
            <p>
              Das bedeutet: <strong>Ein einziger Neukunde pro Monat über die Website</strong> reicht,
              um das Abo achtfach zu refinanzieren. Nicht im Jahr. Im Monat.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Elektriker aus dem Raum Stuttgart zahlt
              99 € netto/Monat für seine Website. Im ersten Monat nach Launch kamen 3 Anfragen über
              das Kontaktformular – alle wurden zu Aufträgen. Gesamtumsatz: 4.200 Euro.
              Der ROI im ersten Monat: über 4.100 %.
            </div>

            {/* H2: Break-even */}
            <h2 style={h2Style}>Break-even nach dem ersten Auftrag</h2>
            <p>
              Das Abo-Modell hat einen weiteren Vorteil, der oft übersehen wird: Es gibt keinen
              Moment, in dem du &ldquo;in Vorleistung&rdquo; gehst. Du zahlst nicht 5.000 Euro
              und wartest dann, ob die Website irgendwann Kunden bringt.
            </p>
            <p>
              Stattdessen: Website live, erster Monat läuft, erste Anfragen kommen. Spätestens
              nach dem ersten Auftrag hast du mehr eingenommen als ausgegeben. Das ist kein
              Marketing-Versprechen – das ist Mathematik.
            </p>

            <h3 style={h3Style}>Was passiert, wenn keine Kunden kommen?</h3>
            <p>
              Dann kündigst du. Monatlich, ohne Mindestlaufzeit. Das ist das Sicherheitsnetz des
              Abo-Modells. Du riskierst maximal einen Monatsbeitrag – nicht tausende Euro wie bei
              einer Agentur, die nichts liefert.
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
                Kostet 99 € netto/Monat – bringt ab dem ersten Kunden mehr zurück
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Zeig uns dein Gewerk, wir zeigen dir, wie deine Website aussehen könnte. Kostenlos
                und unverbindlich.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Vergleich Offline */}
            <h2 style={h2Style}>Was kostet dich Offline-Akquise im Vergleich?</h2>
            <p>
              Damit der Vergleich fair ist: Lass uns schauen, was du heute für Neukundengewinnung
              ausgibst – oder ausgeben müsstest, wenn du aktiv akquirieren würdest.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Flyer & Postwurfsendung:</strong> 300–800 Euro pro Kampagne, einmalige
                Wirkung, kein nachhaltiger Effekt
              </li>
              <li>
                <strong>Google Ads:</strong> 200–500 Euro/Monat für spürbares Volumen, komplexe
                Einrichtung, endet sobald das Budget weg ist
              </li>
              <li>
                <strong>Branchenbuch-Einträge:</strong> 50–200 Euro/Monat, kaum noch jemand
                schaut dort nach
              </li>
              <li>
                <strong>Website im Abo:</strong> 99 € netto/Monat, 24/7 sichtbar, wächst mit
                der Zeit, bringt auch nach Jahren noch Anfragen
              </li>
            </ul>
            <p>
              Eine Website ist keine Ausgabe wie ein Flyer. Sie ist ein Vertriebsmitarbeiter,
              der rund um die Uhr für dich arbeitet – ohne Urlaub, ohne Krankentage, ohne
              Gehaltserhöhung.
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
            <h2 style={h2Style}>Fazit: Nicht zu teuer – falscher Vergleich</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>99 € netto/Monat sind kein Kostenpunkt, sondern ein Investment.</strong>{" "}
                Ein einziger Neukunde reicht, um das Abo für viele Monate zu finanzieren.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Das Abo-Modell eliminiert das Risiko.</strong> Kein Vorschuss,
                keine Bindung, keine 5.000 Euro auf der Hoffnung, dass es klappt.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Der echte Preis ist: keine Website haben.</strong> Jeden Monat ohne
                Website verlierst du Kunden, die deine Konkurrenz gewinnt – still und
                unsichtbar.
              </li>
              <li>
                <strong>Probier es aus.</strong> Lass dir einen kostenlosen Entwurf zeigen,
                dann entscheidest du in aller Ruhe.
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
                Überzeug dich selbst – kostenlos
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
                Wir zeigen dir in 15 Minuten, wie deine Website aussehen könnte. Ohne Druck,
                ohne Verpflichtung, ohne versteckte Kosten.
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
