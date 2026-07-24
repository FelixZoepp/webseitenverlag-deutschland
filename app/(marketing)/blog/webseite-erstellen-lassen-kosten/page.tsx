import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox, thStyle, tdStyle } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Webseite erstellen lassen Kosten 2026 – Ehrlicher Vergleich",
  description: "Was kostet eine professionelle Webseite wirklich? Ehrlicher Vergleich: Agentur (5.000€+) vs. Abo-Modell (99 € netto/Monat). Mit Rechner und Entscheidungshilfe.",
  openGraph: {
    title: "Webseite erstellen lassen: Was kostet das wirklich?",
    description: "Ehrlicher Kostenvergleich 2026: Agentur vs. Baukasten vs. Abo-Modell. Mit konkreten Zahlen.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  { q: "Was kostet es, eine Webseite erstellen zu lassen?", a: "Eine professionelle Webseite kostet bei einer Agentur zwischen 3.000 und 15.000 Euro einmalig, bei einem Freelancer 1.000 bis 5.000 Euro. Im Abo-Modell zahlst du ab 99 € netto pro Monat ohne Einmalkosten – inklusive Design, Hosting, Pflege und Support." },
  { q: "Lohnt sich ein Webseiten-Abo?", a: "Ein Webseiten-Abo lohnt sich besonders für Selbstständige und kleine Unternehmen, die kein hohes Einmal-Investment riskieren wollen. Du erhältst eine professionelle Webseite ohne Vorabkosten. Die Mindestlaufzeit beträgt 24 Monate mit 3 Monaten Kündigungsfrist – SEO-Ergebnisse brauchen 3–6 Monate, nach einem Jahr sehen unsere Kunden den ROI. Bereits ein neuer Kundenauftrag refinanziert oft das gesamte Jahresabo." },
  { q: "Was ist im Abo-Preis von 99 € netto/Monat enthalten?", a: "Im Abo sind enthalten: individuelles Webdesign, Entwicklung, Hosting auf deutschen Servern, SSL-Zertifikat, Domain, SEO-Grundoptimierung, DSGVO-konforme Rechtstexte, regelmäßige Updates, technische Wartung und persönlicher Support." },
  { q: "Gehört mir die Webseite, wenn ich das Abo kündige?", a: "Im Abo-Modell mietest du die Webseite. Bei Kündigung wird die Seite deaktiviert. Deine Inhalte (Texte, Bilder) gehören dir und können exportiert werden. Das ist vergleichbar mit einem Mietvertrag für ein Büro – du nutzt es, solange du zahlst." },
  { q: "Ist eine 99 € netto-Webseite genauso gut wie eine für 5.000€?", a: "Ja, die Qualität ist vergleichbar. Der Unterschied liegt im Geschäftsmodell, nicht in der Qualität. Statt einer hohen Einmalzahlung verteilt das Abo-Modell die Kosten auf monatliche Raten und inkludiert gleichzeitig laufende Leistungen wie Pflege und Updates, die bei Agenturen extra kosten." },
  { q: "Wie schnell ist meine Webseite im Abo-Modell fertig?", a: "Im Abo-Modell ist deine Webseite in der Regel innerhalb weniger Tage fertig und online. Bei klassischen Agenturen dauert ein Webprojekt oft 4 bis 12 Wochen." },
];

export default function BlogArticle() {
  return (
    <>
      {/* FAQ Schema */}
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a },
        })),
      })}} />

      <Script id="article-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Webseite erstellen lassen: Was kostet das wirklich? (Ehrlicher Vergleich 2026)",
        "author": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "publisher": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "datePublished": "2026-05-14",
        "dateModified": "2026-05-14",
        "description": "Ehrlicher Kostenvergleich 2026: Agentur vs. Baukasten vs. Abo-Modell für professionelle Webseiten.",
      })}} />

      {/* Nav */}
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/ergebnisse">Ergebnisse</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">Kostenlose Demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "rgba(37,99,235,0.15)", padding: "4px 12px", borderRadius: 999 }}>
              Kosten & Preise
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              14. Mai 2026 · 8 Min. Lesezeit
            </span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Webseite erstellen lassen: Was kostet das <span className="accent">wirklich</span>?
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Ein ehrlicher Kostenvergleich 2026 – Agentur, Baukasten oder Abo-Modell. Mit konkreten Zahlen und Entscheidungshilfe.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              Du sitzt abends am Schreibtisch. Vor dir liegt ein Angebot: 4.800€ für eine Webseite. Fünf Seiten, ein Kontaktformular, ein bisschen SEO.
              Dein erster Gedanke: <em>&ldquo;Muss das wirklich so teuer sein?&rdquo;</em>
            </p>
            <p>
              Die kurze Antwort: Nein. Aber das hängt davon ab, welchen Weg du gehst.
            </p>
            <p>
              In diesem Artikel bekommst du einen ehrlichen Überblick, was eine professionelle Webseite 2026 wirklich kostet – ob du sie bei einer Agentur in Auftrag gibst, selbst im Baukasten bastelst oder im Abo-Modell mietest. Mit konkreten Zahlen, ohne Marketing-Blabla.
            </p>

            {/* H2: Was kostet eine Webseite 2026? */}
            <h2 style={h2Style}>Was kostet eine professionelle Webseite 2026?</h2>
            <div style={defBox}>
              <strong>Kurz-Antwort:</strong> Eine professionelle Business-Webseite kostet 2026 zwischen 0€ (Baukasten-Einstieg) und 20.000€+ (Agentur mit Individualentwicklung). Die meisten kleinen Unternehmen zahlen zwischen 2.500€ und 8.000€ einmalig – oder ab 99 € netto/Monat im Abo-Modell.
            </div>
            <p>
              Die Preisspanne ist riesig, weil &ldquo;Webseite&rdquo; alles bedeuten kann: von der einfachen Visitenkarte bis zum komplexen Online-Shop.
              Für die meisten Selbstständigen, Handwerker und lokalen Unternehmen geht es aber um dasselbe: eine saubere, schnelle Seite mit 3–7 Unterseiten, die bei Google gefunden wird und Anfragen bringt.
            </p>

            {/* H2: Die drei Wege */}
            <h2 style={h2Style}>Drei Wege zur Webseite – und was sie wirklich kosten</h2>

            <h3 style={h3Style}>1. Agentur oder Freelancer (Einmalzahlung)</h3>
            <p>
              Der klassische Weg: Du beauftragst eine Agentur oder einen Freelancer, zahlst einmalig und bekommst nach 4–12 Wochen deine fertige Webseite.
            </p>
            <ul style={ulStyle}>
              <li><strong>Freelancer:</strong> 1.000–5.000€ einmalig</li>
              <li><strong>Agentur:</strong> 3.000–15.000€ einmalig</li>
              <li><strong>Dazu kommen laufende Kosten:</strong> Hosting (5–30€/Monat), Wartung (50–200€/Monat), SSL, Domain, Updates</li>
            </ul>
            <p>
              Was viele nicht bedenken: Nach der Fertigstellung bist du für Technik, Updates und Sicherheit selbst verantwortlich – oder zahlst extra dafür. Ein typischer Wartungsvertrag bei einer Agentur kostet 50–150€/Monat zusätzlich.
            </p>

            <h3 style={h3Style}>2. Website-Baukasten (Jimdo, Wix, Squarespace)</h3>
            <p>
              Du baust selbst. Kosten: 10–30€ pro Monat für den Baukasten, plus deine Arbeitszeit.
            </p>
            <ul style={ulStyle}>
              <li><strong>Vorteil:</strong> Günstig, sofort verfügbar</li>
              <li><strong>Nachteil:</strong> Sieht oft unprofessionell aus, eingeschränkte SEO-Möglichkeiten, du bist dein eigener Webdesigner und das sieht man</li>
            </ul>

            <h3 style={h3Style}>3. Webseiten-Abo (Mieten statt kaufen)</h3>
            <div style={defBox}>
              <strong>Was ist ein Webseiten-Abo?</strong> Ein Webseiten-Abo ist ein Modell, bei dem du eine professionell gestaltete Webseite für einen festen monatlichen Betrag mietest. Im Preis enthalten sind Design, Entwicklung, Hosting, Pflege, Updates und Support. Du zahlst keine Einmalgebühr. Die Mindestlaufzeit beträgt 24 Monate mit einer Kündigungsfrist von 3 Monaten zum Vertragsende.
            </div>
            <p>
              Das Abo-Modell ist relativ neu und löst genau das Problem, das viele Selbstständige haben: Du bekommst eine Agentur-Qualität-Webseite, aber ohne das finanzielle Risiko einer hohen Vorabinvestition.
            </p>
            <ul style={ulStyle}>
              <li><strong>Kosten:</strong> Ab 99 € netto/Monat, alles inklusive</li>
              <li><strong>Keine Einmalzahlung,</strong> keine versteckten Kosten</li>
              <li><strong>Fertig in wenigen Tagen</strong> statt Wochen oder Monaten</li>
              <li><strong>Pflege, Updates und Support</strong> sind im Preis enthalten</li>
            </ul>

            {/* H2: Vergleichstabelle */}
            <h2 style={h2Style}>Kostenvergleich: Agentur vs. Baukasten vs. Abo-Modell</h2>
            <div style={{ overflowX: "auto", marginBottom: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={thStyle}></th>
                    <th style={thStyle}>Agentur</th>
                    <th style={thStyle}>Baukasten</th>
                    <th style={{ ...thStyle, color: "var(--blue)" }}>Abo-Modell</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Vorabkosten", "3.000–15.000€", "0€", "0€"],
                    ["Monatliche Kosten", "50–200€ (Hosting + Wartung)", "10–30€", "Ab 99 € netto (alles inkl.)"],
                    ["Design-Qualität", "Individuell, hoch", "Template-basiert", "Individuell, hoch"],
                    ["SEO-Optimierung", "Meist Aufpreis", "Eingeschränkt", "Inklusive"],
                    ["Fertigstellung", "4–12 Wochen", "Sofort (Selbstbau)", "Wenige Tage"],
                    ["Updates & Pflege", "Extra (50–150€/Monat)", "Selbst", "Inklusive"],
                    ["Support", "Je nach Vertrag", "E-Mail/Chat", "Persönlicher Ansprechpartner"],
                    ["Flexibilität", "Änderungen kosten extra", "Selbst anpassen", "Änderungen inklusive"],
                    ["Gesamtkosten 3 Jahre", "5.800–21.000€+", "360–1.080€", "3.564€"],
                    ["Risiko", "Hoch (Vorabinvestment)", "Niedrig", "Kalkulierbar (24 Mon. Laufzeit)"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row[0]}</td>
                      <td style={tdStyle}>{row[1]}</td>
                      <td style={tdStyle}>{row[2]}</td>
                      <td style={{ ...tdStyle, color: "var(--blue)", fontWeight: 500 }}>{row[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* H2: Warum 99 € netto nicht billig bedeutet */}
            <h2 style={h2Style}>Warum 99 € netto/Monat nicht bedeutet, dass die Qualität schlechter ist</h2>
            <p>
              Das ist die häufigste Frage – und die berechtigtste. Wenn Agenturen 5.000€ verlangen, warum geht es bei uns für 99 € netto/Monat?
            </p>
            <p>
              Die Antwort ist simpel: <strong>Es ist ein anderes Geschäftsmodell, nicht eine schlechtere Leistung.</strong>
            </p>
            <p>
              Stell dir vor, du kaufst ein Auto für 40.000€ bar – oder least es für 399€/Monat. Ist das Leasing-Auto schlechter? Nein. Es ist dasselbe Auto, nur anders finanziert. Genau so funktioniert das Webseiten-Abo.
            </p>
            <p>
              Anstatt einmalig einen großen Betrag zu kassieren und dann weiterzuziehen, bauen Abo-Anbieter auf eine langfristige Beziehung. Die Qualität muss stimmen, weil du sonst einfach kündigst.
            </p>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Klingt interessant?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                In 15 Minuten klären wir, ob das Abo-Modell für dich passt – ohne Verkaufsdruck.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                <span>Kostenlose Demo ansehen →</span>
              </Link>
            </div>

            {/* H2: Versteckte Kosten */}
            <h2 style={h2Style}>Die versteckten Kosten, über die niemand spricht</h2>
            <p>
              Was in den meisten Agentur-Angeboten <strong>nicht</strong> drinsteht:
            </p>
            <ul style={ulStyle}>
              <li><strong>Texterstellung:</strong> Professionelle Texte für 5–10 Seiten kosten 2.000–5.000€ extra</li>
              <li><strong>Bildmaterial:</strong> Stockfotos oder Fotoshooting: 500–2.000€</li>
              <li><strong>DSGVO-Rechtstexte:</strong> Impressum, Datenschutz vom Anwalt: 300–800€</li>
              <li><strong>Wartungsvertrag:</strong> 50–150€/Monat für Updates und Sicherheit</li>
              <li><strong>Änderungen nach Launch:</strong> Jede Anpassung wird nach Stundensatz (80–150€/h) berechnet</li>
              <li><strong>Barrierefreiheit (BFSG 2025):</strong> Nachträgliche Anpassungen kosten 1.000–3.000€</li>
            </ul>
            <p>
              Im Abo-Modell? All das ist im Preis enthalten. Keine Überraschungen.
            </p>

            {/* H2: Für wen lohnt sich was? */}
            <h2 style={h2Style}>Für wen lohnt sich welches Modell?</h2>

            <p><strong>Agentur ist sinnvoll, wenn:</strong></p>
            <ul style={ulStyle}>
              <li>Du ein großes Budget hast (10.000€+) und ein komplexes Projekt brauchst</li>
              <li>Du einen Online-Shop mit individuellen Funktionen benötigst</li>
              <li>Du ein eigenes IT-Team hast, das die Webseite danach betreut</li>
            </ul>

            <p><strong>Baukasten ist sinnvoll, wenn:</strong></p>
            <ul style={ulStyle}>
              <li>Du ein Hobby-Projekt oder einen privaten Blog startest</li>
              <li>Du technisch fit bist und gerne selbst gestaltest</li>
              <li>Professionelles Auftreten für dich (noch) nicht geschäftskritisch ist</li>
            </ul>

            <p><strong>Das Abo-Modell ist sinnvoll, wenn:</strong></p>
            <ul style={ulStyle}>
              <li>Du eine professionelle Webseite brauchst, aber kein 5.000€-Risiko eingehen willst</li>
              <li>Du keine Zeit oder Lust hast, dich um Technik, Updates und Hosting zu kümmern</li>
              <li>Du schnell online sein willst – in Tagen, nicht Monaten</li>
              <li>Du einen festen Ansprechpartner für Änderungen und Fragen brauchst</li>
            </ul>

            {/* H2: Rechnet sich das? */}
            <h2 style={h2Style}>Rechnet sich eine Webseite überhaupt?</h2>
            <p>
              Ein konkretes Beispiel: Ein Elektriker in Düsseldorf hat einen durchschnittlichen Auftragswert von 2.500€.
              Über seine neue Webseite bekommt er 3 Anfragen pro Monat, wovon er eine in einen Auftrag umwandelt.
            </p>
            <p>
              Das bedeutet: <strong>2.500€ Mehrumsatz pro Monat – bei 99 € netto Investition.</strong> Ein ROI von 25x. Und das ist konservativ gerechnet.
            </p>
            <p>
              <Link href="/#rechner" style={{ color: "var(--blue)", fontWeight: 600 }}>
                → Berechne deinen eigenen ROI mit unserem Rechner
              </Link>
            </p>

            {/* H2: FAQ */}
            <h2 style={h2Style}>Häufig gestellte Fragen</h2>
            {faqData.map((f, i) => (
              <div key={i} style={{ marginBottom: 28 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                  {f.q}
                </h3>
                <p style={{ color: "var(--ink-soft)" }}>{f.a}</p>
              </div>
            ))}

            {/* Fazit */}
            <h2 style={h2Style}>Fazit: Was du jetzt wissen musst</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Eine professionelle Webseite muss 2026 nicht mehr tausende Euro kosten.</strong> Das Abo-Modell macht Agentur-Qualität für 99 € netto/Monat zugänglich – ohne Risiko, ohne Vorabkosten.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Die Qualität hängt nicht vom Preismodell ab,</strong> sondern vom Anbieter. 99 € netto/Monat ist kein &ldquo;Billig-Angebot&rdquo; – es ist ein anderes Geschäftsmodell.
              </li>
              <li>
                <strong>Eine Webseite ist keine Ausgabe, sondern eine Investition.</strong> Bereits ein einziger neuer Kundenauftrag über deine Webseite refinanziert oft das gesamte Jahresabo.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Bereit für den nächsten Schritt?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
                In 15 Minuten klären wir, ob das Abo-Modell für dein Business passt – ohne Verkaufsdruck, ohne Verpflichtung.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "18px 40px", fontSize: 16 }}>
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
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}

