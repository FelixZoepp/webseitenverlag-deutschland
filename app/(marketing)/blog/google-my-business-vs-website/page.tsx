import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Google Unternehmensprofil vs. eigene Website: Was du wirklich brauchst",
  description:
    "Reicht ein Google-Unternehmensprofil aus? Wir erklären, warum das Profil allein nicht genug ist – und wie beides zusammen das Maximum rausholt.",
  openGraph: {
    title: "Google Unternehmensprofil vs. eigene Website: Was du wirklich brauchst",
    description:
      "Ein Google-Profil ist die Visitenkarte. Eine Website ist dein Verkäufer. Ohne Website verlierst du 3× mehr Anfragen als nötig.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Reicht ein Google-Unternehmensprofil allein aus?",
    a: "Für Basispräsenz ja – aber nicht um wirklich online Kunden zu gewinnen. Das Profil zeigt dich auf Google Maps und im lokalen Pack. Für Longtail-Suchanfragen wie 'Klempner kommt auch sonntags' oder 'Elektriker für Altbau' brauchst du aber eigene Inhalte – also eine Website mit Texten, die genau diese Fragen beantworten.",
  },
  {
    q: "Was bringt eine Website zusätzlich zum Google-Profil?",
    a: "Mehr Vertrauen, mehr Inhalte, mehr Keywords. Auf deiner Website kannst du erklären, was du machst, Referenzprojekte zeigen, Preise kommunizieren und Kontaktformulare anbieten. Das Google-Profil zeigt nur: Du existierst. Deine Website erklärt: Warum du die beste Wahl bist.",
  },
  {
    q: "Wie verlinke ich mein Google-Profil mit meiner Website?",
    a: "Im Google Unternehmensprofil trägst du einfach deine Website-URL ein. Das ist wichtig: Google verwendet diesen Link als Signal für Relevanz und Glaubwürdigkeit. Umgekehrt solltest du auf deiner Website eine Google-Profil-Verlinkung einbauen (z.B. 'Auf Google bewerten'). Das verstärkt beide Signale gegenseitig.",
  },
  {
    q: "Was ist mit Google Ads – ist das eine Alternative zur Website?",
    a: "Nein – Google Ads leitet Besucher auf eine Seite. Ohne eigene Website hast du entweder keine Landingpage oder nutzt eine generierte Google-Seite, die deutlich schlechter konvertiert. Ads ohne Website ist wie Werbung für ein Geschäft ohne Eingang. Du brauchst beides: Ads für schnelle Sichtbarkeit, Website für nachhaltiges Vertrauen.",
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
            headline:
              "Google Unternehmensprofil vs. eigene Website: Was du wirklich brauchst",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-10-20",
            dateModified: "2026-10-20",
            description:
              "Reicht ein Google-Unternehmensprofil aus? Wir erklären, warum das Profil allein nicht genug ist.",
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
              20. Oktober 2026 · 6 Min. Lesezeit
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
            Google Unternehmensprofil vs. eigene Website: Was du{" "}
            <span className="accent">wirklich brauchst</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Das Google-Profil ist deine Visitenkarte. Deine Website ist dein Verkäufer.
            Du brauchst beides.
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
              &ldquo;Ich hab doch mein Google-Profil, das reicht doch&rdquo; – das hören wir
              oft, und es ist verständlich. Ein Google-Unternehmensprofil ist schnell erstellt,
              kostenlos und zeigt dich auf Google Maps. Aber es ist kein Ersatz für eine
              eigene Website. Und der Unterschied macht sich in echten Anfragen bemerkbar.
            </p>
            <p>
              In diesem Artikel erklären wir dir genau, was das Profil kann, wo es aufhört –
              und warum beides zusammen der einzige Weg ist, online wirklich sichtbar zu werden.
            </p>

            {/* H2: Was das Profil kann */}
            <h2 style={h2Style}>Was das Google-Unternehmensprofil wirklich leistet</h2>
            <p>
              Das Google-Unternehmensprofil ist ein mächtiges Werkzeug – wenn man versteht,
              wofür es gedacht ist. Es zeigt dich an, wenn jemand nach deinem Unternehmensnamen
              sucht oder nach lokalem Bedarf mit offensichtlichen Keywords.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Sichtbarkeit auf Google Maps:</strong> Wenn jemand &ldquo;Elektriker
                in meiner Nähe&rdquo; sucht, erscheinst du im lokalen Pack – die drei Einträge
                unter der Karte.
              </li>
              <li>
                <strong>Bewertungen anzeigen:</strong> Kundenrezensionen stärken dein Vertrauen
                und beeinflussen die Klickrate erheblich.
              </li>
              <li>
                <strong>Öffnungszeiten, Telefon, Fotos:</strong> Basis-Informationen, die
                potenzielle Kunden sofort sehen.
              </li>
              <li>
                <strong>Direkter Anruf-Button:</strong> Mobile Nutzer können dich mit einem
                Klick anrufen.
              </li>
            </ul>
            <p>
              Das ist alles solide. Aber hier endet das Profil auch. Denn sobald jemand
              mehr wissen will – oder eine spezifischere Frage hat – schaut er weiter.
              Und dann braucht er eine Website.
            </p>

            {/* H2: Was das Profil nicht kann */}
            <h2 style={h2Style}>Wo das Profil aufhört und die Website anfängt</h2>
            <p>
              Das Google-Profil hat kein SEO-Gewicht für Longtail-Suchanfragen. Was bedeutet
              das konkret?
            </p>

            <h3 style={h3Style}>Longtail-Suchen: Dort entscheidet sich das Geschäft</h3>
            <p>
              Die meisten kaufbereiten Kunden suchen nicht &ldquo;Elektriker&rdquo;. Sie suchen:
            </p>
            <ul style={ulStyle}>
              <li>&ldquo;Elektriker für Altbau Sanierung München&rdquo;</li>
              <li>&ldquo;Heizung reparieren lassen schnell&rdquo;</li>
              <li>&ldquo;Zahnarzt Angstpatienten Hamburg&rdquo;</li>
              <li>&ldquo;Steuerberater Freiberufler Online&rdquo;</li>
            </ul>
            <p>
              Für diese Anfragen braucht Google Inhalte – Texte, die genau diese Begriffe
              enthalten und die Frage beantworten. Ein Google-Profil hat keinen Raum dafür.
              Deine Website hat ihn.
            </p>

            <h3 style={h3Style}>Vertrauen aufbauen braucht mehr als einen Eintrag</h3>
            <p>
              Wenn jemand dein Profil auf Google Maps sieht, ist das ein erster Eindruck.
              Was passiert dann? Er klickt auf deine Website – um mehr zu sehen. Referenzen,
              Fotos, Leistungen, Preise, Persönlichkeit. Wenn dieser Klick nirgendwo hinführt
              oder zu einer schwachen Seite, ist der potenzielle Kunde weg.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Zahnarzt aus Frankfurt hatte ein gepflegtes
              Google-Profil mit 5 Bewertungen, aber keine eigene Website. Im Monat kamen etwa
              3–4 Anfragen über das Profil. Nach dem Launch einer professionellen Website –
              mit Leistungsübersicht, Teamfotos, Angstpatienten-Seite und Buchungsformular –
              stiegen die Online-Anfragen auf 12–15 pro Monat. Profil und Website zusammen
              brachten 3× mehr als das Profil allein.
            </div>

            {/* H2: Zusammenspiel */}
            <h2 style={h2Style}>Profil + Website = die optimale Kombination</h2>
            <p>
              Das ist kein Entweder-oder. Das Profil und die Website ergänzen sich
              gegenseitig – und stärken sich sogar gegenseitig in den Google-Rankings.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Das Profil bringt dich auf Maps:</strong> Lokale Sichtbarkeit für
                generische Suchanfragen in deiner Nähe.
              </li>
              <li>
                <strong>Die Website bringt dich in die organischen Suchergebnisse:</strong>{" "}
                Für spezifische, kaufbereite Suchanfragen.
              </li>
              <li>
                <strong>Die Website-URL im Profil stärkt dein SEO:</strong> Google wertet
                eine verlinkte, professionelle Website als Vertrauenssignal.
              </li>
              <li>
                <strong>Google-Bewertungen auf der Website:</strong> Du kannst Bewertungen
                einbinden und so das Vertrauen der Besucher erhöhen.
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
                Profil + Website = 3× mehr Anfragen
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Sieh, wie deine professionelle Website aussehen könnte – kostenlos und unverbindlich.
              </p>
              <Link
                href="/entwurf"
                className="btn btn-primary"
                style={{ padding: "14px 32px", fontSize: 15 }}
              >
                <span>Kostenlosen Entwurf ansehen →</span>
              </Link>
            </div>

            {/* H2: Praktische Tipps */}
            <h2 style={h2Style}>So nutzt du beides richtig</h2>
            <p>
              Wenn du bereits ein Google-Profil hast – gut. Hier sind die nächsten Schritte,
              um das Maximale herauszuholen:
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Profil vollständig ausfüllen:</strong> Öffnungszeiten, Beschreibung,
                Fotos, Leistungen – je vollständiger, desto besser für das Ranking.
              </li>
              <li>
                <strong>Bewertungen aktiv anfragen:</strong> Nach jedem Auftrag kurz per
                WhatsApp oder E-Mail fragen. Ein direkter Link macht es einfacher.
              </li>
              <li>
                <strong>Profil mit Website verlinken:</strong> Die URL in das Profil eintragen
                – und auf der Website einen &ldquo;Google-Bewertung hinterlassen&rdquo;-Button.
              </li>
              <li>
                <strong>Website mit lokalen Inhalten füllen:</strong> Texte, die deine Stadt,
                deinen Stadtteil und deine spezifischen Leistungen erwähnen – das rankt.
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
            <h2 style={h2Style}>Fazit: Das Profil öffnet die Tür – die Website schließt den Deal</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Das Profil allein reicht nicht.</strong> Es bringt dich auf die Karte,
                aber nicht in die organischen Suchergebnisse für spezifische Anfragen.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Die Website erklärt, wer du bist.</strong> Leistungen, Referenzen,
                Vertrauen – das lässt sich nur auf einer eigenen Seite kommunizieren.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Beides zusammen ist unschlagbar.</strong> Profil für lokale Sichtbarkeit,
                Website für Tiefe und Überzeugungskraft.
              </li>
              <li>
                <strong>Starte jetzt.</strong> Lass dir einen kostenlosen Entwurf zeigen –
                das Profil hast du schon.
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
                Das Profil hast du – jetzt fehlt die Website
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
                Wir zeigen dir in 15 Minuten, wie deine professionelle Website aussehen könnte.
                Ab 99 €/Monat, alles inklusive, monatlich kündbar.
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
