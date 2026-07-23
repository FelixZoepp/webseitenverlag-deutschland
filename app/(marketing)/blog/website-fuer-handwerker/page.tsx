import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { h2Style, h3Style, ulStyle, defBox, ctaBox, thStyle, tdStyle } from "@/lib/blog/styles";

export const metadata: Metadata = {
  title: "Website für Handwerker 2026 – So gewinnst du Kunden online",
  description: "Warum Handwerker 2026 eine Website brauchen, was sie enthalten muss und wie du lokal bei Google gefunden wirst. Praxisguide mit konkreten Tipps.",
  openGraph: {
    title: "Website für Handwerker 2026 – So gewinnst du Kunden online",
    description: "Praxisguide: Was eine Handwerker-Website können muss, was sie kostet und wie du damit Kunden gewinnst.",
    type: "article",
    locale: "de_DE",
  },
};

const faqData = [
  { q: "Brauche ich als Handwerker wirklich eine eigene Website?", a: "Ja. Über 80 % der Kunden suchen heute online nach Handwerkern in ihrer Region. Ohne Website bist du für diese Kunden unsichtbar – selbst wenn du über Empfehlungen gut ausgelastet bist. Eine Website sichert dir langfristig einen stabilen Auftragseingang." },
  { q: "Was kostet eine Website für Handwerker?", a: "Eine professionelle Handwerker-Website kostet bei einer Agentur zwischen 3.000 und 8.000 Euro einmalig. Im Abo-Modell bekommst du eine gleichwertige Seite ab 99 Euro pro Monat – ohne Einmalkosten, inklusive Hosting, Pflege und Support." },
  { q: "Was muss auf einer Handwerker-Website stehen?", a: "Die wichtigsten Elemente sind: deine Leistungen mit konkreten Beschreibungen, dein Einsatzgebiet, Referenzfotos von abgeschlossenen Projekten, Kundenbewertungen, eine klare Kontaktmöglichkeit (Telefon + Formular) und ein Google-Maps-Ausschnitt mit deinem Standort." },
  { q: "Wie werde ich als Handwerker bei Google gefunden?", a: "Drei Schritte: Erstens ein Google Unternehmensprofil anlegen und pflegen. Zweitens eine Website mit lokalen Keywords wie 'Elektriker München' oder 'Dachdecker Köln'. Drittens regelmäßig Google-Bewertungen von zufriedenen Kunden sammeln." },
  { q: "Wie schnell bekomme ich über eine Website neue Aufträge?", a: "Die ersten Anfragen kommen oft innerhalb von 2 bis 4 Wochen nach dem Launch, wenn die Seite suchmaschinenoptimiert ist. Nach 3 bis 6 Monaten steigt die Sichtbarkeit bei Google deutlich und die Anfragen werden regelmäßiger." },
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
        "headline": "Website für Handwerker 2026 – So gewinnst du Kunden online",
        "author": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "publisher": { "@type": "Organization", "name": "Webseiten-Verlag Deutschland" },
        "datePublished": "2026-05-13",
        "dateModified": "2026-05-13",
        "description": "Warum Handwerker 2026 eine Website brauchen und wie sie damit Kunden gewinnen.",
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
          <Link href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 20, alignItems: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue)", background: "rgba(37,99,235,0.15)", padding: "4px 12px", borderRadius: 999 }}>
              Handwerk & Web
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
              13. Mai 2026 · 7 Min. Lesezeit
            </span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Website für Handwerker: So gewinnst du <span className="accent">Kunden online</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Warum eine eigene Website 2026 kein Luxus mehr ist – und wie du damit planbar neue Aufträge bekommst.
          </p>
        </div>
      </section>

      {/* Article */}
      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            {/* INTRO */}
            <p style={{ fontSize: 19, fontWeight: 500, marginBottom: 32 }}>
              Du bist Handwerker, dein Terminkalender ist voll und neue Kunden kommen über Empfehlung. Wozu also eine Website?
              Ganz einfach: Weil Empfehlungen allein kein planbares Geschäft sind – und weil deine potenziellen Kunden heute zuerst googeln, bevor sie anrufen.
            </p>
            <p>
              In diesem Artikel erfährst du, warum eine eigene Website für Handwerksbetriebe 2026 unverzichtbar ist, was sie enthalten muss und wie du damit lokal bei Google sichtbar wirst. Ohne Tech-Sprache, ohne Agentur-Verkaufsgespräch.
            </p>

            {/* H2: Warum Handwerker eine Website brauchen */}
            <h2 style={h2Style}>Warum Handwerker 2026 eine Website brauchen</h2>
            <p>
              Die Zahlen sprechen für sich: Laut Bitkom suchen über 80 % der Deutschen online nach lokalen Dienstleistern. Wenn jemand in deiner Stadt einen Elektriker, Maler oder Dachdecker sucht, tippt er es bei Google ein. Wer dort nicht auftaucht, existiert für diesen Kunden nicht.
            </p>
            <ul style={ulStyle}>
              <li><strong>Sichtbarkeit:</strong> Ohne Website bist du bei Google unsichtbar – selbst wenn du der beste Handwerker der Stadt bist</li>
              <li><strong>Vertrauen:</strong> Kunden prüfen dich online, bevor sie anrufen. Keine Website = kein Vertrauen</li>
              <li><strong>Planbarkeit:</strong> Empfehlungen sind super, aber nicht steuerbar. Eine Website bringt dir konstant neue Anfragen</li>
              <li><strong>Wettbewerb:</strong> Deine Mitbewerber sind bereits online. Wer nicht mitzieht, verliert Marktanteile</li>
            </ul>
            <div style={defBox}>
              <strong>Praxis-Beispiel:</strong> Ein Malermeister in Hannover bekommt über seine Website durchschnittlich 8 Anfragen pro Monat. Davon werden 3 zu Aufträgen mit einem Schnitt von 1.800 Euro. Das sind 5.400 Euro Mehrumsatz – jeden Monat.
            </div>

            {/* H2: Was auf eine Handwerker-Website gehört */}
            <h2 style={h2Style}>Was auf eine gute Handwerker-Website gehört</h2>
            <p>
              Eine Handwerker-Website muss kein Designkunstwerk sein. Sie muss drei Dinge tun: Vertrauen aufbauen, Leistungen klar darstellen und es dem Kunden leicht machen, dich zu kontaktieren.
            </p>

            <h3 style={h3Style}>1. Startseite mit klarer Botschaft</h3>
            <p>
              Innerhalb von 3 Sekunden muss klar sein: Was machst du, wo machst du es und wie erreicht man dich. Keine langen Texte, keine Spielereien. Oben ein Satz wie &ldquo;Ihr Elektriker in München – schnell, zuverlässig, fair&rdquo; und direkt darunter eine Telefonnummer oder ein Kontakt-Button.
            </p>

            <h3 style={h3Style}>2. Leistungsseiten mit konkreten Beschreibungen</h3>
            <p>
              Nicht einfach &ldquo;Wir bieten Elektroinstallationen an&rdquo;. Sondern: &ldquo;Wir installieren Steckdosen, Schalter und Unterverteilungen in Neubauten und Altbauten im Raum München. Festpreisangebote innerhalb von 24 Stunden.&rdquo; Google liebt konkrete, hilfreiche Inhalte – und deine Kunden auch.
            </p>

            <h3 style={h3Style}>3. Referenzen und Fotos</h3>
            <p>
              Vorher-Nachher-Bilder von Projekten sind Gold wert. Sie zeigen, was du kannst, und schaffen sofort Vertrauen. Dazu Kundenbewertungen – entweder direkt auf der Seite oder als Verweis auf dein Google-Profil.
            </p>

            <h3 style={h3Style}>4. Kontaktmöglichkeit auf jeder Seite</h3>
            <p>
              Telefonnummer im Header, Kontaktformular auf jeder Seite, am besten mit einer WhatsApp-Option. Mach es dem Kunden so einfach wie möglich, dich zu erreichen. Jeder zusätzliche Klick kostet dich Anfragen.
            </p>

            <h3 style={h3Style}>5. Google Maps und Einsatzgebiet</h3>
            <p>
              Zeig klar, wo du arbeitest. Eine eingebettete Google-Karte und ein Text wie &ldquo;Wir sind im Umkreis von 30 km um Köln für Sie im Einsatz&rdquo; helfen sowohl den Kunden als auch Google, dich den richtigen Suchanfragen zuzuordnen.
            </p>

            {/* H2: Vergleichstabelle */}
            <h2 style={h2Style}>Mit Website vs. ohne Website: Der Vergleich</h2>
            <div style={{ overflowX: "auto", marginBottom: 40 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)" }}>
                    <th style={thStyle}></th>
                    <th style={thStyle}>Ohne Website</th>
                    <th style={{ ...thStyle, color: "var(--blue)" }}>Mit Website</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Auffindbarkeit bei Google", "Nicht vorhanden", "Sichtbar bei lokalen Suchen"],
                    ["Kundengewinnung", "Nur über Empfehlungen", "Empfehlungen + Google + Social Media"],
                    ["Vertrauensaufbau", "Erst beim persönlichen Kontakt", "Schon vor dem ersten Anruf"],
                    ["Erreichbarkeit", "Nur während Arbeitszeit", "24/7 – Anfragen kommen auch nachts"],
                    ["Professionalität", "Schwer zu zeigen", "Referenzen, Fotos, Bewertungen"],
                    ["Kosten pro Neukunde", "Unkontrollierbar", "Messbar und optimierbar"],
                    ["Planbarkeit", "Abhängig vom Zufall", "Stetig wachsender Anfragenstrom"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row[0]}</td>
                      <td style={tdStyle}>{row[1]}</td>
                      <td style={{ ...tdStyle, color: "var(--blue)", fontWeight: 500 }}>{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* H2: Lokal bei Google gefunden werden */}
            <h2 style={h2Style}>So wirst du als Handwerker lokal bei Google gefunden</h2>
            <p>
              Eine Website allein reicht nicht. Du musst Google auch zeigen, dass du ein lokaler Anbieter bist. Drei Schritte sind entscheidend:
            </p>

            <h3 style={h3Style}>Schritt 1: Google Unternehmensprofil einrichten</h3>
            <p>
              Das ist kostenlos und dauert 15 Minuten. Dein Google-Profil erscheint bei lokalen Suchen direkt in der Kartenansicht – noch über den normalen Suchergebnissen. Trag deine Adresse, Öffnungszeiten, Telefonnummer und Fotos ein. Und bitte Kunden aktiv um Google-Bewertungen.
            </p>

            <h3 style={h3Style}>Schritt 2: Lokale Keywords auf deiner Website</h3>
            <p>
              Verwende auf deiner Website Begriffe, die deine Kunden tatsächlich googeln: &ldquo;Dachdecker Düsseldorf&rdquo;, &ldquo;Bad sanieren Essen&rdquo;, &ldquo;Heizung installieren Bochum&rdquo;. Diese Keywords gehören in Überschriften, Seitentitel und Texte.
            </p>

            <h3 style={h3Style}>Schritt 3: Konsistente Daten überall</h3>
            <p>
              Dein Firmenname, deine Adresse und Telefonnummer müssen überall gleich sein – auf der Website, bei Google, in Branchenverzeichnissen. Abweichungen verwirren Google und kosten dich Sichtbarkeit.
            </p>

            {/* CTA Mid-Article */}
            <div style={ctaBox}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 600, marginBottom: 8, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Website für deinen Handwerksbetrieb?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, marginBottom: 16 }}>
                Professionelle Handwerker-Website ab 99 Euro/Monat. Ohne Einmalkosten, fertig in wenigen Tagen.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
                <span>Kostenloses Erstgespräch buchen →</span>
              </Link>
            </div>

            {/* H2: Was kostet eine Handwerker-Website? */}
            <h2 style={h2Style}>Was kostet eine Handwerker-Website?</h2>
            <p>
              Die Kosten hängen vom Weg ab, den du wählst:
            </p>
            <ul style={ulStyle}>
              <li><strong>Selbst bauen (Baukasten):</strong> 10–30 Euro/Monat, aber viel eigene Zeit und oft unprofessionelles Ergebnis</li>
              <li><strong>Agentur beauftragen:</strong> 3.000–8.000 Euro einmalig, plus 50–150 Euro/Monat für Wartung</li>
              <li><strong>Abo-Modell:</strong> Ab 99 Euro/Monat, alles inklusive – Design, Hosting, Pflege, Support. Keine Vorabkosten</li>
            </ul>
            <p>
              Für die meisten Handwerksbetriebe ist das Abo-Modell der sinnvollste Weg: Du bekommst Agentur-Qualität, ohne tausende Euro zu riskieren. Und wenn es nicht passt, kündigst du einfach.
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
            <h2 style={h2Style}>Fazit: Deine Website ist dein bester Mitarbeiter</h2>
            <ol style={{ ...ulStyle, paddingLeft: 24 }}>
              <li style={{ marginBottom: 12 }}>
                <strong>Eine Website ist keine Ausgabe, sondern eine Investition.</strong> Bereits ein einziger neuer Auftrag über deine Website kann das gesamte Jahresabo refinanzieren.
              </li>
              <li style={{ marginBottom: 12 }}>
                <strong>Deine Kunden suchen online.</strong> Wer bei Google nicht sichtbar ist, verliert jeden Tag potenzielle Aufträge an die Konkurrenz.
              </li>
              <li>
                <strong>Es muss nicht teuer sein.</strong> Mit dem Abo-Modell bekommst du eine professionelle Handwerker-Website ab 99 Euro/Monat – ohne Risiko, ohne technisches Vorwissen.
              </li>
            </ol>

            {/* Final CTA */}
            <div style={{ ...ctaBox, textAlign: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 600, marginBottom: 12, fontVariationSettings: '"opsz" 24, "SOFT" 50' }}>
                Bereit für deine Handwerker-Website?
              </h3>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
                In 15 Minuten besprechen wir, wie deine Website aussehen soll – ohne Verkaufsdruck, ohne Verpflichtung.
              </p>
              <Link href="/entwurf" className="btn btn-primary" style={{ padding: "18px 40px", fontSize: 16 }}>
                <span>Kostenloses Erstgespräch buchen →</span>
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

