"use client";

import Image from "next/image";

const CASES = [
  {
    name: "Grünwerk GaLaBau",
    branche: "Garten- & Landschaftsbau, Berlin",
    quote: "Wir hatten vorher eine veraltete Webseite, die uns keine einzige Anfrage gebracht hat. Seit der neuen Seite kommen regelmäßig qualifizierte Anfragen über Google. Innerhalb von 3 Monaten haben wir unsere Auslastung von 60% auf 95% gesteigert.",
    results: [
      { label: "Anfragen pro Woche", before: "0–1", after: "8–12" },
      { label: "Google-Ranking", before: "Nicht auffindbar", after: "Top 3 lokal" },
      { label: "Auslastung", before: "60%", after: "95%" },
    ],
  },
  {
    name: "Elektro Schuster",
    branche: "Elektroinstallation, Düsseldorf",
    quote: "Als Einzelunternehmer hatte ich nie Zeit, mich um eine Webseite zu kümmern. Die 99 € netto im Monat waren mein Testlauf. Nach dem ersten Monat kamen 5 neue Anfragen pro Woche. Das hat sich 50-fach bezahlt gemacht.",
    results: [
      { label: "Neue Anfragen/Woche", before: "0", after: "5+" },
      { label: "Umsatzsteigerung", before: "—", after: "+40%" },
      { label: "Online-Sichtbarkeit", before: "Keine", after: "Seite 1 Google" },
    ],
  },
  {
    name: "Praxis Dr. Weber",
    branche: "Physiotherapie, Hamburg",
    quote: "Ich hatte Angst vor den Kosten einer professionellen Webseite. 99 € netto im Monat war für mich der perfekte Einstieg. Nach 4 Wochen war mein Kalender voller als je zuvor. Jetzt haben wir eine Warteliste.",
    results: [
      { label: "Terminbuchungen/Woche", before: "3–4", after: "12–15" },
      { label: "Auslastung", before: "65%", after: "100% + Warteliste" },
      { label: "Google-Bewertungen", before: "8", after: "47" },
    ],
  },
  {
    name: "Malerbetrieb Hoffmann",
    branche: "Maler & Lackierer, München",
    quote: "Mein Sohn hatte mir eine WordPress-Seite gebaut. Sah nicht schlecht aus, aber bei Google war ich unsichtbar. Seit der neuen Seite finden mich Kunden aus dem ganzen Landkreis. Allein die Anfragen aus dem Internet haben uns 3 neue Mitarbeiter finanziert.",
    results: [
      { label: "Anfragen/Monat", before: "2–3", after: "20+" },
      { label: "Google-Position", before: "Seite 5+", after: "Top 3" },
      { label: "Teamwachstum", before: "4 Mitarbeiter", after: "7 Mitarbeiter" },
    ],
  },
  {
    name: "Steuerberatung Krause",
    branche: "Steuerberater, Köln",
    quote: "Als Steuerberater dachte ich, meine Mandanten kommen nur über Empfehlungen. Falsch gedacht. Seit wir online sichtbar sind, gewinnen wir jeden Monat 3–4 neue Mandanten, die uns über Google gefunden haben.",
    results: [
      { label: "Neue Mandanten/Monat", before: "0–1 online", after: "3–4 online" },
      { label: "Website-Besucher/Monat", before: "~50", after: "~800" },
      { label: "ROI", before: "—", after: "32x" },
    ],
  },
  {
    name: "Coaching Sabine Lang",
    branche: "Business Coaching, Frankfurt",
    quote: "Ich hatte 3 Angebote von Agenturen – alle über 4.000€. Als Einzelunternehmerin war das einfach zu viel Risiko. Mit 99 € netto/Monat konnte ich es ausprobieren. Heute kommen 60% meiner Klienten über meine Webseite.",
    results: [
      { label: "Klienten über Website", before: "0%", after: "60%" },
      { label: "Sichtbarkeit", before: "Nur Social Media", after: "Google + Social" },
      { label: "Monatl. Mehrumsatz", before: "—", after: "+4.500€" },
    ],
  },
];

export default function ErgebnissePage() {
  return (
    <>
      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <a href="/" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </a>
          <div className="nav-links">
            <a href="/">Startseite</a>
            <a href="/#rechner">ROI-Rechner</a>
            <a href="/#faq">FAQ</a>
          </div>
          <a href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "60px 0 80px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 800 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Kundenergebnisse & Fallstudien</span>
          <h1 className="display large" style={{ fontSize: "clamp(36px, 5vw, 60px)", marginBottom: 20 }}>
            Echte Unternehmer. <span className="accent">Echte Ergebnisse.</span>
          </h1>
          <p style={{ fontSize: 19, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 620, margin: "0 auto" }}>
            Keine Stock-Fotos, keine erfundenen Zahlen. Das sind die Geschichten von Selbstständigen und Unternehmen, die mit einer professionellen Webseite ihre Sichtbarkeit und ihren Umsatz gesteigert haben.
          </p>
        </div>
      </section>

      {/* Cases */}
      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {CASES.map((c, i) => (
              <div key={i} style={{
                borderRadius: 24, overflow: "hidden",
                border: "1px solid var(--border)", background: "var(--cream)",
              }}>
                {/* Header */}
                <div style={{
                  padding: "28px 36px",
                  background: i % 2 === 0 ? "var(--gray-900)" : "var(--accent-grad)",
                  color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <h2 style={{
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28,
                      fontVariationSettings: '"opsz" 144, "SOFT" 50', marginBottom: 4,
                    }}>
                      {c.name}
                    </h2>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.6)", letterSpacing: "0.05em" }}>
                      {c.branche}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} viewBox="0 0 24 24" fill="rgba(255,255,255,0.9)" style={{ width: 18, height: 18 }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "36px" }}>
                  {/* Quote */}
                  <div style={{ position: "relative", marginBottom: 32 }}>
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: 64, color: "var(--blue)",
                      opacity: 0.15, position: "absolute", top: -20, left: -8, lineHeight: 1,
                    }}>&ldquo;</span>
                    <p style={{
                      fontSize: 17, lineHeight: 1.7, color: "var(--ink-soft)",
                      fontStyle: "italic", paddingLeft: 24,
                    }}>
                      {c.quote}
                    </p>
                  </div>

                  {/* Results Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {c.results.map((r, j) => (
                      <div key={j} style={{
                        padding: "20px", borderRadius: 16,
                        border: "1px solid var(--border)", background: "var(--bg)",
                        textAlign: "center" as const,
                      }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--ink-soft)", marginBottom: 12 }}>
                          {r.label}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#f87171", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 2 }}>Vorher</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink-soft)" }}>{r.before}</div>
                          </div>
                          <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" style={{ width: 18, height: 18, flexShrink: 0 }}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                          <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#4ade80", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 2 }}>Nachher</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{r.after}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "96px 0" }}>
        <div className="container">
          <div className="cta-section" style={{ textAlign: "center" }}>
            <span className="eyebrow" style={{ color: "var(--blue)", display: "block", marginBottom: 16 }}>Dein Ergebnis ist das nächste</span>
            <h2 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", marginBottom: 16 }}>
              Bereit, die gleichen <span className="accent">Ergebnisse</span> zu erzielen?
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 17, maxWidth: 560, margin: "0 auto 36px" }}>
              15 Minuten. Kostenlos. Unverbindlich. Wir zeigen dir, was für dein Business möglich ist.
            </p>
            <a href="/entwurf" className="btn btn-primary" style={{ fontSize: 18, padding: "22px 48px" }}>
              <span>Kostenloses Erstgespräch buchen →</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
