import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website-Agentur Abzocke? Wie du seriöse Anbieter erkennst",
  description:
    "Viele Unternehmer wurden von Webagenturen enttäuscht. Wir zeigen dir die wichtigsten Red Flags – und warum das Abo-Modell dich schützt.",
  openGraph: {
    title: "Website-Agentur Abzocke? Wie du seriöse Anbieter erkennst",
    description:
      "Keine Referenzen, kein Vertrag, kein Support – so erkennst du unseriöse Webagenturen. Und so schützt du dich davor.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  {
    q: "Woran erkenne ich eine unseriöse Webagentur?",
    a: "Typische Red Flags: Die Agentur hat selbst keine ansprechende Website, kann keine konkreten Referenzen nennen, macht Zeitdruck ('Angebot nur bis Ende der Woche'), verlangt den vollen Betrag im Voraus und erklärt nicht klar, wer die Website nach Abschluss besitzt. Auch übertriebene Versprechen wie 'Garantiert auf Platz 1 bei Google' sind ein Warnsignal.",
  },
  {
    q: "Was tun, wenn ich schon gezahlt habe und unzufrieden bin?",
    a: "Zunächst: Schriftlich dokumentieren, was geliefert wurde und was nicht. Dann eine schriftliche Nachfrist setzen (mind. 2 Wochen). Wenn das nichts bringt: Verbraucherschutzzentrale einschalten, und im schlimmsten Fall rechtliche Schritte. Wichtig: Bewahre alle Kommunikation auf – E-Mails, Angebote, Rechnungen.",
  },
  {
    q: "Warum ist ein Abo-Modell sicherer als ein Einmalauftrag?",
    a: "Beim Abo-Modell zahlst du einen festen monatlichen Betrag mit klaren, transparenten Konditionen – Mindestlaufzeit 24 Monate, 3 Monate Kündigungsfrist. Der Anbieter hat einen dauerhaften Anreiz, guten Service zu liefern – weil du nach der Mindestlaufzeit kündigen kannst. Bei einem Einmalauftrag hat die Agentur das Geld, sobald du gezahlt hast. Der Anreiz ist dann weg. Das Abo-Modell zwingt zur Qualität.",
  },
  {
    q: "Gehört mir die Website, wenn ich ein Abo abschließe?",
    a: "Das ist eine wichtige Frage – und du solltest sie vor Vertragsabschluss klären. Bei seriösen Abo-Anbietern bekommst du bei Kündigung zumindest alle Inhalte (Texte, Bilder) ausgehändigt. Frag konkret: 'Was passiert mit meiner Domain und meinen Inhalten, wenn ich kündige?' Die Antwort sagt viel über die Seriosität des Anbieters.",
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
            headline: "Website-Agentur Abzocke? Wie du seriöse Anbieter erkennst",
            author: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            publisher: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
            datePublished: "2026-10-06",
            dateModified: "2026-10-06",
            description:
              "Viele Unternehmer wurden von Webagenturen enttäuscht. Wir zeigen dir die wichtigsten Red Flags – und warum das Abo-Modell dich schützt.",
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
              6. Oktober 2026 · 7 Min. Lesezeit
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
            Website-Agentur Abzocke? Wie du seriöse Anbieter{" "}
            <span className="accent">erkennst</span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
            }}
          >
            Der Markt für Webseiten ist leider voll von schlechten Anbietern. So schützt du dich.
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
              &ldquo;Ich wurde schon einmal von einer Agentur abgezockt&rdquo; – das hören wir
              regelmäßig. Und leider ist das kein Einzelfall. Der Webdesign-Markt ist unreguliert,
              die Preise sind intransparent, und viele Unternehmer wissen nicht, worauf sie achten
              müssen. Das wollen wir ändern.
            </p>
            <p>
              In diesem Artikel zeigen wir dir konkret, woran du unseriöse Anbieter erkennst –
              und welche Merkmale für einen guten, vertrauenswürdigen Partner sprechen. Am Ende
              verstehst du auch, warum das Abo-Modell strukturell viel besser schützt als der
              klassische Einmalauftrag.
            </p>

            {/* H2: Red Flags */}
            <h2 style={h2Style}>Red Flags: Diese Warnsignale sollten dich aufschrecken</h2>
            <p>
              Nicht jede schlechte Agentur ist kriminell. Aber es gibt klare Muster, die auf
              Probleme hindeuten – lange bevor du einen Cent überwiesen hast.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Keine eigene ansprechende Website:</strong> Ein Webdesigner, dessen eigene
                Seite veraltet oder unprofessionell wirkt, wird dasselbe für dich bauen.
              </li>
              <li>
                <strong>Keine konkreten Referenzen:</strong> &ldquo;Wir haben schon über 200
                Projekte gemacht&rdquo; ist nichts wert ohne Links oder Kundennamen. Seriöse
                Anbieter zeigen stolz, was sie gebaut haben.
              </li>
              <li>
                <strong>Künstlicher Zeitdruck:</strong> &ldquo;Das Angebot gilt nur bis Freitag&rdquo;
                ist ein klassisches Druckmittel. Gute Anbieter brauchen solche Tricks nicht.
              </li>
              <li>
                <strong>Vorauszahlung des Gesamtbetrags:</strong> 5.000 Euro im Voraus überweisen,
                bevor auch nur ein Entwurf existiert? Niemals.
              </li>
              <li>
                <strong>Unklare Eigentumsfrage:</strong> Wem gehört die Domain? Wem gehört der
                Code? Wer hat Zugriff auf Hosting und CMS? Wenn die Antworten vage sind, ist
                das ein ernstes Warnsignal.
              </li>
              <li>
                <strong>Garantien bei Google-Rankings:</strong> Kein seriöser Anbieter kann
                &ldquo;Platz 1 bei Google&rdquo; versprechen. Wer das tut, lügt dich an.
              </li>
            </ul>

            {/* H2: Green Flags */}
            <h2 style={h2Style}>Green Flags: So erkennst du einen guten Anbieter</h2>
            <p>
              Zum Glück ist das Gegenteil genauso klar erkennbar. Seriöse Webdienstleister haben
              bestimmte Eigenschaften gemeinsam.
            </p>

            <h3 style={h3Style}>Transparenz bei Preisen und Leistungen</h3>
            <p>
              Ein guter Anbieter sagt dir genau, was im Preis enthalten ist und was extra kostet.
              Hosting inklusive? SSL-Zertifikat? Was kostet ein Textupdate? Diese Fragen solltest
              du stellen – und die Antworten sollten klar und schriftlich sein.
            </p>

            <h3 style={h3Style}>Transparente Vertragsbedingungen</h3>
            <p>
              Das ist vielleicht das wichtigste Signal. Ein seriöser Anbieter legt seine
              Konditionen offen: Wie lang ist die Mindestlaufzeit? Welche Kündigungsfrist gilt?
              Was kostet eine Verlängerung? Klare Antworten auf diese Fragen – ohne Ausweichen,
              ohne Kleingedrucktes – sind ein Zeichen für einen fairen Partner. Wer seine
              Konditionen versteckt oder erst auf Nachfrage nennt, hat etwas zu verbergen.
            </p>

            <h3 style={h3Style}>Referenzen und Portfolio</h3>
            <p>
              Frag nach drei Websites, die der Anbieter in den letzten zwölf Monaten gebaut hat.
              Ruf notfalls einen der Kunden an. Ein seriöser Anbieter unterstützt das.
            </p>

            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Dachdecker aus dem Raum Hannover bezahlte
              4.500 Euro an eine lokale Webagentur. Nach einem Jahr war die Agentur nicht mehr
              erreichbar – Telefon abgestellt, E-Mails blieben unbeantwortet. Die Website lief
              noch, aber Updates waren unmöglich. Das Schlimmste: Die Domain und das Hosting
              liefen auf den Accounts der Agentur. Er hatte keine Website – er hatte eine Miete
              gezahlt, ohne Mietvertrag. Heute zahlt er 99 € netto/Monat, hat alle Zugänge selbst
              in der Hand und weiß genau, welche Konditionen gelten: Mindestlaufzeit 24 Monate,
              3 Monate Kündigungsfrist, alle Preise netto. Keine Überraschungen.
            </div>

            {/* H2: Abo als Schutz */}
            <h2 style={h2Style}>Warum das Abo-Modell strukturell sicherer ist</h2>
            <p>
              Das klassische Agentur-Modell hat ein fundamentales Problem: Nach dem Einmalauftrag
              hat die Agentur ihr Geld. Dein Anreiz als Kunde endet damit als Druckmittel – du
              hast nichts mehr in der Hand. Beim Abo-Modell ist das anders.
            </p>
            <ul style={ulStyle}>
              <li>
                <strong>Anreiz zur Qualität bleibt bestehen:</strong> Wir liefern dauerhaft
                guten Service, weil unsere Konditionen das erfordern und weil du nach der
                Mindestlaufzeit von 24 Monaten kündigen kannst. Diesen Anreiz hat eine Agentur
                nach dem Einmalauftrag nicht mehr.
              </li>
              <li>
                <strong>Kein finanzielles Klumpenrisiko:</strong> 99 € netto/Monat sind ein
                überschaubares Risiko. 4.500 Euro auf einmal – nicht.
              </li>
              <li>
                <strong>Kontinuierliche Betreuung:</strong> Im Abo ist Pflege, Hosting und
                technischer Support enthalten. Du musst dich um nichts kümmern.
              </li>
              <li>
                <strong>Klar geregelte Eigentumsrechte:</strong> Frag vor Abschluss nach deiner
                Domain und deinen Inhalten bei Kündigung. Die Antwort zeigt sofort, wie seriös
                der Anbieter ist.
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
                Kein Vorschuss, feste Preise, transparente Konditionen
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Sieh dir an, wie deine Website aussehen könnte – bevor du irgendetwas zahlst.
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

            {/* H2: Checkliste */}
            <h2 style={h2Style}>Deine Checkliste vor dem Vertragsabschluss</h2>
            <p>
              Bevor du mit einem Webanbieter – Agentur oder Abo – einen Vertrag unterschreibst,
              stell diese Fragen:
            </p>
            <ul style={ulStyle}>
              <li>Wem gehört die Domain nach Vertragsende?</li>
              <li>Wer hat Zugriff auf Hosting und CMS?</li>
              <li>Was passiert mit meinen Inhalten, wenn ich kündige?</li>
              <li>Kann ich Referenzprojekte sehen und Kunden kontaktieren?</li>
              <li>Was kostet ein Textupdate? Was kostet ein neues Foto?</li>
              <li>Wie lange ist die Vertragslaufzeit, und wie ist die Kündigungsfrist?</li>
              <li>Gibt es einen festen Ansprechpartner und wie erreiche ich ihn?</li>
            </ul>
            <p>
              Wer auf diese Fragen ausweicht, unsichere Antworten gibt oder Druck macht,
              ist kein Partner, dem du deine Website anvertrauen solltest.
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
            <h2 style={h2Style}>Fazit: Nicht alle Anbieter sind gleich</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Red Flags ernst nehmen.</strong> Kein Portfolio, kein transparenter
                Preis, kein klarer Vertrag – das sind keine Kleinigkeiten, sondern Warnsignale.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Vor dem Unterzeichnen fragen.</strong> Wem gehört was? Was passiert
                bei Kündigung? Die Antworten sagen mehr als jedes Hochglanz-Angebot.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Das Abo-Modell schützt strukturell.</strong> Transparente Konditionen,
                feste Preise ohne versteckte Aufschläge und dauerhafte Betreuung sind das
                Qualitätssignal – nicht Versprechen, sondern überprüfbare Fakten.
              </li>
              <li>
                <strong>Starte ohne Risiko.</strong> Lass dir einen kostenlosen Entwurf zeigen,
                bevor du irgendetwas unterschreibst.
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
                Überzeug dich zuerst – dann entscheidest du
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
                Wir zeigen dir deinen Website-Entwurf kostenlos und unverbindlich. Kein Druck,
                kein Vorschuss, faire Vertragsbedingungen ab 99 € netto/Monat.
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
