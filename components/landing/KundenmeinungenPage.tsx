"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */
const VIDEO_TESTIMONIALS = [
  {
    name: "Andreas Eisele",
    position: "Geschäftsführer Metallbau Andreas Eisele GmbH",
    branche: "Metallbau",
    headline: "+120.000 € Zusatzumsatz in 6 Monaten",
    text: "Andreas hatte vorher kaum digitale Sichtbarkeit. Nach dem Launch seiner neuen Webseite kamen regelmäßig Anfragen für hochpreisige Metallbau-Aufträge rein – ohne dass er einen Cent in Werbung gesteckt hat. Sein Fazit: \"Ich wusste nicht, dass eine Webseite das leisten kann.\"",
    video: "andreas-eisele.mp4",
  },
  {
    name: "Sven Gerhardt",
    position: "Geschäftsführer Gerhardt's Fenster- & Türenservice",
    branche: "Fenster & Türen",
    headline: "250.000 € Auftragsvolumen im ersten Jahr",
    text: "Vorher war Sven bei Google praktisch unsichtbar. Schon in den ersten zwei Tagen nach dem Launch kamen Anfragen rein – im ersten Jahr summierte sich das auf eine Viertelmillion Euro. Sein Punkt: Eine Webseite ist kein Kostenfaktor. Sie ist sein bester Vertriebsmitarbeiter.",
    video: "sven-gerhardt.mp4",
  },
  {
    name: "Benedikt Rathberger",
    position: "Geschäftsführer Kurth & Rathberger GmbH",
    branche: "Bauunternehmen",
    headline: "Vom Empfehlungsgeschäft zum neuen Vertriebskanal",
    text: "Jahrelang lebte das Unternehmen ausschließlich von Mundpropaganda – das Geschäft war komplett abhängig davon, ob jemand jemanden kannte. Nach dem Webseiten-Launch kam plötzlich ein zweiter, planbarer Vertriebskanal dazu. Anfragen kamen jetzt auch von Menschen, die das Unternehmen vorher nie gehört hatten.",
    video: "benedikt-rathberger.mp4",
  },
  {
    name: "Marcel Dispinseri",
    position: "Geschäftsführer MDach GmbH",
    branche: "Dachdecker",
    headline: "Investment im ersten Monat mehrfach drin",
    text: "Marcel war skeptisch – kann eine günstige Webseite wirklich liefern? Schon im ersten Monat war seine Investition mehrfach zurückgespielt. Der Knackpunkt: Es geht nicht um den Preis der Webseite, sondern um das, was sie reinholt. Bei einem typischen Dach-Auftragswert rechnet sich alles bei der ersten Anfrage.",
    video: "marcel-dispinseri.mp4",
  },
  {
    name: "Olaf Matzack",
    position: "Geschäftsführer MAWU GmbH Fliesenverlegung",
    branche: "Fliesenleger",
    headline: "Von null Anfragen zu 25.000 € Auftragsvolumen",
    text: "Olaf hatte sich jahrelang davor gesträubt, eine Webseite machen zu lassen – aus Angst, \"nur eine Nummer im Portfolio\" zu sein. Heute kommen über die Seite Anfragen, die ihm 25.000 € Zusatzumsatz gebracht haben. Seine Kernaussage: Es lag nie am Geld. Es lag daran, ob ihn jemand wirklich verstanden hat.",
    video: "olaf-matzack.mp4",
  },
];

const TEXT_TESTIMONIALS = [
  { quote: "Schon am ersten Tag nach der Optimierung: 5 Anträge übers Kontaktformular und 12 Anrufe. Vorher waren es 1–2 pro Tag, wenn überhaupt.", name: "Ömer Beyhan", firma: "RolLux Berlin" },
  { quote: "In den ersten zwei Tagen kamen mehrere neue Anfragen rein. Vorher war ich in den Suchmaschinen quasi unsichtbar.", name: "Richard Dollan", firma: "Haus- und Gartenservice" },
  { quote: "10 Minuten nachdem die Seite online ging, kam die erste Kundenanfrage. Minimaler Zeitaufwand auf meiner Seite.", name: "René Niemand", firma: "RN Dachdeckerservice Chemnitz" },
  { quote: "Für meine zentralen Keywords ranke ich weit oben – und werde sogar in KI-Suchsystemen zuverlässig gefunden.", name: "Thomas Poss", firma: "Öffentlich bestellter Sachverständiger TGA" },
  { quote: "In 3 Monaten haben wir den Umsatz über die Seite im mittleren 5-stelligen Bereich gesteigert. Begeistert und zufrieden.", name: "Annegret Schulze", firma: "Alu Factory Ostingersleben" },
  { quote: "Wir hatten uns immer gegen eine Webseite gesträubt – aus Angst, nur eine Nummer zu sein. Hier war alles anders.", name: "Wolfgang Kurth", firma: "KURTH + RATHBERGER GmbH" },
  { quote: "Schon nach wenigen Wochen deutlich bessere Sichtbarkeit in Google. Klare Empfehlung für alle, die wirklich Ergebnisse wollen.", name: "Henning Lochner", firma: "a+ Energie Beratung" },
  { quote: "Zügige Umsetzung, organisierte Arbeitsweise, sauberes Design. Uneingeschränkt empfehlenswert.", name: "Steven Dietrich", firma: "Dietrich Dienstleistungen GmbH" },
  { quote: "Kurze und schnelle Kommunikation, super umgesetzt – bekommt schon kurz nach Start tolles Feedback.", name: "Roman Römer", firma: "R.R. Meisterraum GmbH" },
  { quote: "Wir bekommen nur positive Rückmeldungen unserer Kunden zur neuen Webseite. Erstklassige Umsetzung und Betreuung.", name: "Mario Kreipl", firma: "ZIMMERWERK Raumausstattung KG" },
  { quote: "Selbst als wir Termine nicht halten konnten, wurde sofort ein Alternativtermin gefunden. Ganz klare Empfehlung.", name: "Dennis Gerber", firma: "First Medical Service" },
  { quote: "Zeitnahe, präzise, transparente Kommunikation. Klare Weiterempfehlung für alle, die eine hochwertige Webseite suchen.", name: "Andreas Blaschke", firma: "A3-Solar UG" },
];

const FAQ_DATA = [
  { q: "Sind das echte Kunden?", a: "Ja. Alle gezeigten Personen sind echte Geschäftsführer, die unser Webseiten-Abo nutzen. Die Originalbewertungen findest du zusätzlich auch auf Trustpilot." },
  { q: "Wie lange dauert es bis zu den ersten Anfragen?", a: "Viele Kunden berichten von Anfragen schon in den ersten 1–7 Tagen nach Launch. Wie schnell es bei dir geht, hängt von Branche, Region und Wettbewerb ab – das klären wir im Erstgespräch." },
  { q: "Funktioniert das nur für Handwerk?", a: "Nein. Unsere Kunden kommen aus Handwerk, Beratung, Dienstleistung, Sachverständigenwesen und Solartechnik. Das Modell funktioniert überall, wo lokale oder Fach-Sucher nach einem Anbieter googeln." },
  { q: "Was kostet das genau?", a: "99 € netto im Monat. Darin enthalten: Webdesign, Hosting, Pflege, Updates, technischer Support. Kein Einmalpreis, keine versteckten Kosten." },
  { q: "Gehört mir die Webseite?", a: "Du nutzt die Webseite im Abo-Modell. Im Erstgespräch erklären wir dir transparent, wie das funktioniert und welche Optionen du hast." },
  { q: "Was ist, wenn ich keine Anfragen bekomme?", a: "Wir gestalten Webseiten so, dass sie sucherorientiert und konversionsstark sind – das ist Teil unseres Modells. Im Erstgespräch zeigen wir dir ehrlich, ob dein Markt das hergibt, bevor wir starten." },
];

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Webseiten-Erstellung im Abo (99 € netto/Monat)",
  provider: { "@type": "Organization", name: "Webseiten-Verlag Deutschland" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "5.0", reviewCount: "17" },
  review: [
    ...VIDEO_TESTIMONIALS.map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewBody: t.text,
      reviewRating: { "@type": "Rating", ratingValue: "5" },
    })),
    ...TEXT_TESTIMONIALS.slice(0, 6).map((t) => ({
      "@type": "Review",
      author: { "@type": "Person", name: t.name },
      reviewBody: t.quote,
      reviewRating: { "@type": "Rating", ratingValue: "5" },
    })),
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
export default function KundenmeinungenPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <>
      <Script id="review-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />

      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/kundenmeinungen">Kundenmeinungen</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</Link>
        </div>
      </nav>

      {/* ════════ 1. HERO ════════ */}
      <section className="hero" style={{ padding: "70px 0 90px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 820 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Echte Ergebnisse, echte Unternehmer</span>
          <h1 className="display large" style={{ fontSize: "clamp(34px, 5vw, 60px)", marginBottom: 24 }}>
            Sie haben nicht 5.000&thinsp;€ investiert.{" "}
            <span className="accent">Trotzdem laufen ihre Aufträge.</span>
          </h1>
          <p style={{ fontSize: 19, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 660, margin: "0 auto 36px" }}>
            Das sagen Handwerker, Berater und Selbstständige, die statt 5.000&thinsp;€ einmalig einfach 99&thinsp;€ im Monat investiert haben – und schon in den ersten Tagen Anfragen bekamen.
          </p>
          <Link href="/entwurf" className="btn btn-primary" style={{ fontSize: 17, padding: "20px 44px" }}>
            <span>Kostenloses Erstgespräch sichern →</span>
          </Link>
        </div>
      </section>

      {/* ════════ 2. STATS BAR ════════ */}
      <section style={{ background: "var(--cream)", borderBottom: "1px solid var(--border)", padding: "0" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
            {[
              { value: "120.000 €+", label: "Umsatz in 6 Monaten" },
              { value: "250.000 €+", label: "Auftragsvolumen im 1. Jahr" },
              { value: "10 Minuten", label: "bis zur ersten Anfrage" },
              { value: "99 € netto", label: "pro Monat. Mehr nicht." },
            ].map((s, i) => (
              <div key={i} style={{ padding: "36px 24px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(24px, 3vw, 36px)", color: "var(--blue)", lineHeight: 1, marginBottom: 8, letterSpacing: "-0.04em", fontVariationSettings: '"opsz" 144, "SOFT" 100' }}>
                  {s.value}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 3. VIDEO TESTIMONIALS ════════ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div className="section-head">
            <span className="eyebrow">Im Video erzählt</span>
            <h2 className="display">Die <span className="accent">echten Ergebnisse</span>.</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {VIDEO_TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
                borderRadius: 24, overflow: "hidden",
                border: "1px solid var(--border)", background: "var(--cream)",
              }}>
                {/* Video placeholder */}
                <div style={{
                  background: "linear-gradient(135deg, var(--ink), #1e293b)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 280, position: "relative",
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "rgba(224,53,75,0.9)", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "transform 0.22s var(--ease-out)",
                    boxShadow: "var(--shadow-accent)",
                  }}>
                    <svg viewBox="0 0 24 24" fill="#fff" style={{ width: 28, height: 28, marginLeft: 3 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div style={{
                    position: "absolute", bottom: 16, left: 16,
                    fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.05em",
                  }}>
                    Video: {t.name}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    color: "var(--red-500)", background: "var(--red-050)",
                    padding: "4px 10px", borderRadius: 999, alignSelf: "flex-start",
                    marginBottom: 16,
                  }}>
                    {t.branche}
                  </span>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontWeight: 700,
                    fontSize: 24, lineHeight: 1.2, marginBottom: 8,
                    letterSpacing: "-0.02em", color: "var(--ink)",
                    fontVariationSettings: '"opsz" 24, "SOFT" 50',
                  }}>
                    {t.headline}
                  </h3>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-soft)", marginBottom: 16 }}>
                    {t.name} · {t.position}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)" }}>
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 4. MID CTA ════════ */}
      <section style={{ padding: "80px 0", background: "var(--cream)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 640 }}>
          <h3 style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: "clamp(24px, 3vw, 32px)", marginBottom: 12,
            fontVariationSettings: '"opsz" 24, "SOFT" 50',
          }}>
            Diese Zahlen für dein Unternehmen realistisch machen?
          </h3>
          <p style={{ color: "var(--ink-soft)", fontSize: 17, lineHeight: 1.6, marginBottom: 28 }}>
            15 Minuten Erstgespräch. Kein Verkaufsdruck. Klare Antwort, ob das Modell für dich passt.
          </p>
          <Link href="/entwurf" className="btn btn-primary" style={{ fontSize: 16, padding: "18px 40px" }}>
            <span>Termin sichern →</span>
          </Link>
        </div>
      </section>

      {/* ════════ 5. TEXT TESTIMONIALS ════════ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div className="section-head">
            <span className="eyebrow">Stimmen unserer Kunden</span>
            <h2 className="display">Was unsere Kunden <span className="accent">schreiben</span>.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TEXT_TESTIMONIALS.map((t, i) => (
              <div key={i} style={{
                padding: "28px 24px", borderRadius: 20,
                border: "1px solid var(--border)", background: "var(--cream)",
                display: "flex", flexDirection: "column",
              }}>
                {/* Stars */}
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" fill="var(--red-500)" style={{ width: 14, height: 14 }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", fontStyle: "italic", flex: 1, marginBottom: 20 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-soft)" }}>{t.firma}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ 6. FINAL CTA ════════ */}
      <section style={{ padding: "96px 0" }}>
        <div className="container">
          <div className="cta-section" style={{ textAlign: "center" }}>
            <h2 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", marginBottom: 16 }}>
              Bereit für deine <span className="accent">ersten Anfragen</span>?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.6, maxWidth: 580, margin: "0 auto 32px" }}>
              Du hast jetzt gelesen, was bei anderen funktioniert hat. Die gleiche Maschine kannst du in deinem Unternehmen haben – ab 99&thinsp;€ im Monat, ohne 5.000&thinsp;€ Vorabinvestition.
            </p>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, marginBottom: 32 }}>
              {[
                "Kein Risiko durch hohe Einmalzahlung",
                "Alles inklusive: Design, Hosting, Pflege, Updates",
                "Anfragen oft schon in den ersten Tagen",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--green-500)" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                  </svg>
                  {item}
                </div>
              ))}
            </div>
            <Link href="/entwurf" className="btn btn-primary" style={{ fontSize: 18, padding: "22px 48px" }}>
              <span>Jetzt kostenloses Erstgespräch buchen →</span>
            </Link>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-tertiary)", marginTop: 16 }}>
              15 Minuten · Unverbindlich · Kein Verkaufsdruck
            </div>
          </div>
        </div>
      </section>

      {/* ════════ 7. FAQ ════════ */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="section-head">
            <span className="eyebrow">Häufige Fragen</span>
            <h2 className="display">Fragen zu unseren <span className="accent">Kundenergebnissen</span>.</h2>
          </div>
          {FAQ_DATA.map((faq, i) => (
            <div key={i} className="faq-item">
              <button className={`faq-question${faqOpen === i ? " open" : ""}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {faq.q}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {faqOpen === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}
