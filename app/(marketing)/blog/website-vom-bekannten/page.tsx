import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website vom Neffen? Was du vorher wissen solltest",
  description: "Den Neffen oder einen Bekannten mit der Website beauftragen klingt günstig. Was dabei schiefgehen kann – und warum professionelle Alternativen oft billiger sind.",
  openGraph: {
    title: "Website vom Neffen? Was du vorher wissen solltest",
    description: "Günstig ist nicht gratis: Warum Websites von Bekannten oft teurer werden als gedacht – und was du stattdessen besser machst.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Was ist das Problem an einer Website vom Bekannten?",
    a: "Das Hauptproblem ist nicht das Handwerk, sondern die Verlässlichkeit. Ein Bekannter oder Verwandter hat andere Prioritäten als ein Profi: sein Hauptjob, seine Familie, sein Leben. Wenn er keine Zeit hat oder das Interesse verliert, bist du auf dich gestellt – ohne Vertrag, ohne Anspruch, oft ohne Passwörter.",
  },
  {
    q: "Was kostet ein Profi wirklich mehr?",
    a: "Im Abo-Modell gar nicht so viel mehr, wie viele denken. Der Neffe baut die Seite vielleicht umsonst oder für ein symbolisches Entgelt – aber dann zahlst du anderweitig: mit deiner Zeit, mit Energie für die Koordination, und irgendwann mit der Agenturrechnung für den Notfall-Neustart. Ein professionelles Abo ab 99 € netto/Monat ist oft günstiger als der Gesamtpreis der Bastellösung.",
  },
  {
    q: "Was wenn ich schon eine vom Bekannten habe?",
    a: "Dann wäre der erste Schritt, die Zugangsdaten zu sichern: Domain-Registrar, Hosting-Account, CMS-Login. Falls du die nicht hast, hol sie dir jetzt – solange das Verhältnis noch gut ist. Dann bewertest du nüchtern, ob die Seite tut, was sie tun soll. Tut sie es nicht, ist ein Neustart oft unkomplizierter als du denkst.",
  },
  {
    q: "Worauf muss ich bei einem Anbieter achten?",
    a: "Drei Dinge: Erstens Transparenz über Kosten – keine versteckten Gebühren für normale Updates. Zweitens Erreichbarkeit – gibt es einen Support, den du erreichen kannst? Drittens Flexibilität – kannst du kündigen, wenn's nicht passt? Ein seriöser Anbieter beantwortet alle drei Fragen ohne Ausweichen.",
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
            headline: "Website vom Neffen? Was du vorher wissen solltest",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-08-11",
            dateModified: "2026-08-11",
            description:
              "Den Neffen oder einen Bekannten mit der Website beauftragen klingt günstig. Was dabei schiefgehen kann – und warum professionelle Alternativen oft billiger sind.",
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
              11. August 2026 · 6 Min. Lesezeit
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
            Website vom Neffen? Was du vorher{" "}
            <span className="accent">wissen</span> solltest
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Es klingt praktisch und günstig. Aber die echten Kosten zeigen sich erst später –
            und dann oft auf einen Schlag.
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
              Der Neffe studiert Informatik. Der Sohn bastelt gerne an Websites. Die Freundin
              einer Freundin macht das &ldquo;nebenbei&rdquo;. Das klingt nach einer cleveren
              Lösung – billig, nah, unkompliziert. Meistens ist es das zunächst auch. Bis es
              nicht mehr so ist.
            </p>
            <p>
              Dieser Artikel ist kein Angriff auf Neffen, Söhne oder Bekannte. Er ist eine
              ehrliche Auflistung von Dingen, die du vorher wissen solltest – damit du eine
              bewusste Entscheidung treffen kannst.
            </p>

            {/* H2: Das eigentliche Risiko */}
            <h2 style={h2Style}>Das eigentliche Risiko: Nicht das Können, sondern die Verlässlichkeit</h2>
            <p>
              Viele Bekannte und Verwandte können durchaus gute Websites bauen. Das ist nicht das
              Problem. Das Problem ist: Sie sind keine Dienstleister. Sie haben keine SLA,
              keinen Support-Vertrag, keine finanzielle Abhängigkeit davon, dass deine Website
              funktioniert.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Verfügbarkeit:</strong> Dein Neffe hat Prüfungen, Urlaub, einen neuen
                Job. Wenn deine Website down ist, kann das Tage dauern, bis jemand schaut.
              </li>
              <li>
                <strong>Priorität:</strong> Du bist nicht sein Kunde. Du bist ein Gefallen. Das
                ist ein grundlegend anderes Verhältnis – auch wenn er es gut meint.
              </li>
              <li>
                <strong>Langfristigkeit:</strong> Was passiert in 2 Jahren, wenn das Interesse
                weg ist? Wenn er ins Ausland geht? Wenn ihr euch streitet?
              </li>
              <li>
                <strong>Zugangsdaten:</strong> Wer hat die Passwörter für Domain, Hosting, CMS?
                Wenn das alles bei ihm liegt, bist du abhängig – auch wenn du nicht willst.
              </li>
            </ul>

            {/* Praxis-Beispiel */}
            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Eine Friseurin aus Hamburg ließ ihre Website
              vom Sohn bauen. Die Seite war in Ordnung – aber nach 6 Monaten zog er für das
              Studium weg. Seitdem: keine Aktualisierungen, veraltete Preise, falsche
              Öffnungszeiten. Zwei Kundinnen haben angerufen und nachgefragt, ob der Salon
              noch existiert. Nach dem Neustart mit einem professionellen Anbieter wurde alles
              sofort korrigiert – und die erste Google-Anfrage kam im selben Monat.
            </div>

            {/* H2: Professionalität */}
            <h2 style={h2Style}>Was Professionalität bei einer Website wirklich bedeutet</h2>
            <p>
              Es geht nicht darum, ob die Website schön aussieht. Es geht darum, ob sie ihren
              Job macht: Kunden informieren, Vertrauen aufbauen, Anfragen generieren.
            </p>

            <h3 style={h3Style}>SEO: Wird sie bei Google gefunden?</h3>
            <p>
              Eine Website, die niemand findet, existiert für den Kunden nicht. SEO-Grundlagen –
              Seitentitel, Meta-Beschreibungen, lokale Keywords, Ladezeit – werden von Laien
              oft komplett vergessen. Der Neffe baut dir etwas Hübsches, das niemand sieht.
            </p>

            <h3 style={h3Style}>Mobile: Sieht sie auf dem Handy gut aus?</h3>
            <p>
              Heute kommen über 60 % aller Websitebesuche vom Smartphone. Wer nicht responsiv
              baut, verliert die Mehrheit der Besucher, bevor sie überhaupt lesen.
            </p>

            <h3 style={h3Style}>Rechtliches: Impressum, Datenschutz, DSGVO</h3>
            <p>
              Fehlende oder fehlerhafte Pflichtangaben auf einer deutschen Website können
              teuer werden. Abmahnungen sind in Deutschland kein seltenes Phänomen. Ein
              professioneller Anbieter kennt die Anforderungen.
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
                Professionell muss nicht teuer sein
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Ab 99 € netto/Monat bekommst du eine Website, die tut, was sie soll – mit Support,
                der antwortet, und einem Vertrag, der schützt.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Was wenn ich schon eine habe */}
            <h2 style={h2Style}>Du hast schon eine Website vom Bekannten – was jetzt?</h2>
            <p>
              Wenn du bereits in dieser Situation bist, ist das kein Grund zur Panik. Aber
              es gibt einige Dinge, die du sofort tun solltest:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Zugangsdaten sichern:</strong> Domain-Registrar-Login, Hosting-Zugänge,
                CMS-Passwörter. Solange das Verhältnis gut ist, ist es einfach, das zu klären.
              </li>
              <li>
                <strong>Website nüchtern bewerten:</strong> Wird sie bei Google gefunden?
                Kommen Anfragen? Sieht sie auf dem Handy gut aus? Wenn die Antwort auf alle
                drei Fragen nein ist, weißt du, wo du stehst.
              </li>
              <li>
                <strong>Neustart planen:</strong> Ein Neustart muss kein Drama sein. Mit dem
                richtigen Anbieter ist deine Domain in 48 Stunden auf eine neue Website
                umgeleitet.
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
            <h2 style={h2Style}>Fazit: Gefallen ist kein Vertrag</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Das Risiko liegt nicht im Können, sondern in der Verlässlichkeit.</strong>{" "}
                Kein Vertrag, keine Haftung, keine garantierte Verfügbarkeit.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Zugangsdaten sind kritisch.</strong> Sorg dafür, dass du immer selbst
                Zugang zu Domain, Hosting und CMS hast – egal, wer die Website gebaut hat.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Professionalität bedeutet Verlässlichkeit, nicht nur schönes Design.</strong>{" "}
                SEO, Ladezeit, Mobiloptimierung und Rechtssicherheit sind keine Extras.
              </li>
              <li>
                <strong>Die Alternative ist erschwinglich.</strong> Ab 99 € netto/Monat bekommst
                du professionellen Support, einen Ansprechpartner und eine Website, die Ergebnisse
                liefert – ohne Familiendrama.
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
                Mach es richtig – ohne Kompromisse
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
                Zeig uns, was du brauchst. In 15 Minuten weißt du, wie eine professionelle
                Website für dich aussehen könnte.
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
