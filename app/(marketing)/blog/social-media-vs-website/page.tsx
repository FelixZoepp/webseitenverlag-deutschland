import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Social Media vs. Website: Warum Instagram allein nicht reicht",
  description:
    "3.000 Follower, aber kaum Anfragen? Wir erklären, warum Social Media und Website keine Alternativen sind – und was passiert, wenn du nur auf Instagram setzt.",
  openGraph: {
    title: "Social Media vs. Website: Warum Instagram allein nicht reicht",
    description:
      "Algorithmus-Abhängigkeit, kein SEO, sinkende Reichweite: Warum eine eigene Website das Fundament ist, das Social Media nicht ersetzen kann.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Reicht Instagram zur Kundengewinnung?",
    a: "Für manche Branchen kurzfristig – ja. Langfristig und zuverlässig – nein. Instagram-Algorithmen ändern sich ohne Vorwarnung, organische Reichweite sinkt seit Jahren, und du hast keine Kontrolle über die Plattform. Eine Website gehört dir: Du bestimmst, was Besucher sehen, wie sie dich kontaktieren, und du wirst von Google gefunden – unabhängig von Social-Media-Trends.",
  },
  {
    q: "Soll ich Social Media aufgeben?",
    a: "Nein, überhaupt nicht. Social Media und Website ergänzen sich perfekt: Instagram weckt Interesse, deine Website schließt den Deal. Zeig auf Instagram deine Arbeit und verlink in der Bio auf deine Website. Wer wirklich buchen will, sucht danach bei Google – und findet dich dann.",
  },
  {
    q: "Wie arbeiten Website und Social Media zusammen?",
    a: "Website und Social Media sind zwei verschiedene Kanäle mit unterschiedlichen Stärken. Social Media ist gut für Sichtbarkeit und Community – aber wenig geeignet, um gefunden zu werden, wenn jemand aktiv sucht. Google-Suche mit einer Website ist genau das Gegenteil: wenig Community, aber hohe Kaufabsicht. Beides zusammen ist unschlagbar.",
  },
  {
    q: "Was ist mit Google My Business?",
    a: "Google My Business ist wichtig und kostenlos – du solltest es auf jeden Fall nutzen. Aber es ersetzt keine eigene Website. Ein GMB-Eintrag zeigt grundlegende Infos; eine Website gibt Vertrauen, erklärt deine Leistungen, zeigt Referenzen und ermöglicht direkte Anfragen. GMB und Website zusammen maximieren deine Sichtbarkeit bei Google.",
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
            headline: "Social Media vs. Website: Warum Instagram allein nicht reicht",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-09-08",
            dateModified: "2026-09-08",
            description:
              "3.000 Follower, aber kaum Anfragen? Wir erklären, warum Social Media und Website keine Alternativen sind – und was passiert, wenn du nur auf Instagram setzt.",
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
              8. September 2026 · 7 Min. Lesezeit
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
            Social Media vs. Website: Warum Instagram allein{" "}
            <span className="accent">nicht reicht</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Viele Follower, wenige Anfragen – das ist kein Einzelfall. Wir erklären, warum.
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
              &ldquo;Ich habe 3.000 Follower auf Instagram, brauche ich wirklich noch eine
              Website?&rdquo; Diese Frage hören wir oft. Und die ehrliche Antwort ist: Ja.
              Nicht weil Instagram nichts taugt – sondern weil es etwas anderes tut als eine
              Website.
            </p>
            <p>
              Instagram weckt Interesse. Eine Website schließt den Deal. Wer nur auf Social Media
              setzt, baut auf einem Fundament, das ihm nicht gehört. Und das kann teuer werden –
              manchmal über Nacht.
            </p>

            {/* H2: Algorithmus */}
            <h2 style={h2Style}>Das Algorithmus-Problem: Du bist Gast, kein Eigentümer</h2>
            <p>
              Alles, was du auf Instagram veröffentlichst, gehört Instagram – nicht dir. Du kannst
              morgen früh aufwachen und dein Account ist gesperrt, deine Reichweite halbiert oder
              der Algorithmus hat entschieden, dass deine Art von Content gerade weniger bevorzugt
              wird. Das klingt dramatisch, ist aber Realität.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Organische Reichweite sinkt:</strong> 2019 sahen im Schnitt 9 % deiner
                Follower deine Posts. Heute sind es oft unter 3 %.
              </li>
              <li>
                <strong>Algorithmen ändern sich:</strong> Was heute funktioniert, wird von
                Instagram nächsten Monat möglicherweise abgestraft.
              </li>
              <li>
                <strong>Kein Backup:</strong> Wenn dein Account weg ist, ist deine gesamte
                Community weg – ohne Warnung, ohne Wiederkehr.
              </li>
              <li>
                <strong>Kein SEO:</strong> Instagram-Posts erscheinen nicht in Google-Suchergebnissen.
                Wer aktiv nach dir sucht, findet dich nicht.
              </li>
            </ul>

            {/* H2: Kaufabsicht */}
            <h2 style={h2Style}>Instagram vs. Google: Zwei völlig verschiedene Absichten</h2>
            <p>
              Hier liegt der entscheidende Unterschied, den viele übersehen: Wer auf Instagram
              scrollt, ist meistens nicht auf der Suche. Er lässt sich inspirieren, unterhält sich,
              sieht zufällig deinen Post. Das ist wertvoll – aber es ist keine Kaufabsicht.
            </p>
            <p>
              Wer bei Google &ldquo;Kosmetikerin München&rdquo; eingibt, sucht aktiv. Er will
              jemanden buchen – jetzt oder bald. Das ist ein komplett anderer Moment. Und genau
              in diesem Moment brauchst du eine Website, die ihn empfängt und überzeugt.
            </p>

            <h3 style={h3Style}>Was das in der Praxis bedeutet</h3>
            <p>
              Social-Media-Follower und zahlende Kunden sind zwei verschiedene Gruppen. Du kannst
              10.000 Follower haben und kaum Umsatz machen. Du kannst 0 Follower haben und jeden
              Monat 10 Anfragen über Google bekommen. Beides ist real.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Eine Kosmetikerin aus Köln hatte 3.200
              Instagram-Follower und investierte täglich 45 Minuten in Content-Erstellung.
              Trotzdem kamen im Schnitt nur 2 Anfragen pro Monat über die Plattform. Nach dem
              Launch ihrer Website – mit lokalem SEO und einem einfachen Buchungsformular –
              stiegen die Anfragen auf 12 pro Monat. Ihre Instagram-Zeit hat sie seitdem auf
              20 Minuten täglich reduziert. Die Website läuft von allein.
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
                Dein eigenes Fundament – ab 99 €/Monat
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Eine Website, die dir gehört und rund um die Uhr Anfragen sammelt. Zeig uns dein
                Gewerk – wir zeigen dir, wie das aussehen kann.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Zusammenspiel */}
            <h2 style={h2Style}>Das richtige Zusammenspiel: Website als Fundament, Social Media als Verstärker</h2>
            <p>
              Die gute Nachricht: Du musst dich nicht entscheiden. Website und Social Media sind
              kein Entweder-oder, sondern ein Team. Das funktioniert so:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Instagram:</strong> Zeige deine Arbeit, baue Vertrauen auf, wecke Interesse
              </li>
              <li>
                <strong>Website:</strong> Empfange Interessenten, erkläre deine Leistungen,
                ermögliche die Kontaktaufnahme
              </li>
              <li>
                <strong>Google:</strong> Werde gefunden, wenn jemand aktiv sucht – unabhängig
                davon, ob er dich auf Instagram kennt
              </li>
              <li>
                <strong>Google My Business:</strong> Kostenloser Eintrag für lokale Sichtbarkeit
                und Bewertungen – als Ergänzung zur Website
              </li>
            </ul>
            <p>
              Wer alle vier Kanäle nutzt, ist nahezu unverwundbar. Wer nur auf Instagram setzt,
              ist einen Algorithmus-Update entfernt vom Nichts.
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
            <h2 style={h2Style}>Fazit: Social Media ist Miete – eine Website ist Eigentum</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Deine Instagram-Präsenz gehört Instagram, nicht dir.</strong> Algorithmen,
                Reichweiten und Regeln können sich jederzeit ändern – ohne dein Zutun.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Follower sind keine Kunden.</strong> Kaufabsicht entsteht bei Google,
                nicht beim Instagram-Scrollen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Eine Website ist dein Fundament.</strong> Kein Algorithmus kann sie dir
                wegnehmen, kein Update kann sie entwerten.
              </li>
              <li>
                <strong>Beides zusammen ist unschlagbar.</strong> Social Media bringt Sichtbarkeit,
                deine Website bringt Anfragen – und ab 99 Euro/Monat kostet das Fundament weniger,
                als du denkst.
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
                Bau dir dein eigenes Fundament
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
                Wir zeigen dir in 15 Minuten, wie eine professionelle Website für dein Gewerk
                aussehen könnte – kostenlos, unverbindlich, ohne Technik-Stress.
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
