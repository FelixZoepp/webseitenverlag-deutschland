import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung – Webseiten-Verlag Deutschland",
  description: "Datenschutzerklärung der Content-Leads Solutions UG (haftungsbeschränkt).",
};

export default function DatenschutzPage() {
  return (
    <>
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

      <section className="hero" style={{ padding: "50px 0 60px" }}>
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 48px)", marginBottom: 20, lineHeight: 1.1 }}>
            Datenschutzerklärung
          </h1>
        </div>
      </section>

      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            <h2 style={h2}>1. Datenschutz auf einen Blick</h2>
            <h3 style={h3}>Allgemeine Hinweise</h3>
            <p>
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
              personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene
              Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 style={h3}>Datenerfassung auf dieser Website</h3>
            <p>
              <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
            </p>
            <p>
              Content-Leads Solutions UG (haftungsbeschränkt)<br />
              Geschäftsführer: Felix-Leon Zoepp<br />
              Rhinstraße 137A, 10315 Berlin<br />
              Registergericht: Amtsgericht Charlottenburg (Berlin), HRB 281476 B<br />
              E-Mail: info@webseitenverlag-deutschland.de
            </p>

            <p>
              <strong>Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen — etwa wenn
              Sie ein Kontaktformular ausfüllen oder eine Demo-Seite anfordern. Andere Daten werden
              automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch unsere IT-Systeme
              erfasst. Das sind vor allem technische Daten (z.&nbsp;B. Internetbrowser, Betriebssystem
              oder Uhrzeit des Seitenaufrufs).
            </p>

            <p>
              <strong>Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
              gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
              Wenn Sie eine Demo-Website anfordern, verwenden wir Ihre Firmendaten zur Erstellung
              einer personalisierten Vorschau-Website.
            </p>

            <h2 style={h2}>2. Hosting</h2>
            <p>
              Diese Website wird bei Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA
              gehostet. Vercel ist unter dem EU-US Data Privacy Framework zertifiziert. Details zur
              Datenverarbeitung durch Vercel finden Sie in deren{" "}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>
                Datenschutzerklärung
              </a>.
            </p>

            <h2 style={h2}>3. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3 style={h3}>Datenschutz</h3>
            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
              Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
              Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h3 style={h3}>Hinweis zur verantwortlichen Stelle</h3>
            <p>
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:<br /><br />
              Content-Leads Solutions UG (haftungsbeschränkt)<br />
              Geschäftsführer: Felix-Leon Zoepp<br />
              Rhinstraße 137A, 10315 Berlin<br />
              Registergericht: Amtsgericht Charlottenburg (Berlin), HRB 281476 B<br />
              E-Mail: info@webseitenverlag-deutschland.de
            </p>

            <h3 style={h3}>Speicherdauer</h3>
            <p>
              Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt
              wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die
              Datenverarbeitung entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen
              oder eine Einwilligung zur Datenverarbeitung widerrufen, werden Ihre Daten gelöscht,
              sofern wir keine anderen rechtlich zulässigen Gründe für die Speicherung Ihrer
              personenbezogenen Daten haben.
            </p>

            <h3 style={h3}>Ihre Rechte</h3>
            <p>
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und
              Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein
              Recht, die Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine
              Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese jederzeit für die
              Zukunft widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die
              Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Ferner
              steht Ihnen ein Beschwerderecht bei der zuständigen Aufsichtsbehörde zu.
            </p>

            <h2 style={h2}>4. Datenerfassung auf dieser Website</h2>
            <h3 style={h3}>Server-Log-Dateien</h3>
            <p>
              Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten
              Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
            </p>
            <ul style={ul}>
              <li>Browsertyp und Browserversion</li>
              <li>Verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
              <li>IP-Adresse</li>
            </ul>
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
              Die Erfassung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>

            <h3 style={h3}>Kontaktformular und Demo-Anfrage</h3>
            <p>
              Wenn Sie uns per Kontaktformular oder über das Demo-Anfrage-Formular Anfragen zukommen
              lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen dort angegebenen
              Kontaktdaten (Firma, E-Mail, Telefon, Branche, Ort) zwecks Bearbeitung der Anfrage
              und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht
              ohne Ihre Einwilligung weiter.
            </p>
            <p>
              Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO,
              sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur
              Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen
              beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven
              Bearbeitung der an uns gerichteten Anfragen (Art. 6 Abs. 1 lit. f DSGVO).
            </p>

            <h3 style={h3}>Demo-Seiten</h3>
            <p>
              Wenn Sie eine personalisierte Demo-Website anfordern, verwenden wir die von Ihnen
              angegebenen oder öffentlich verfügbaren Firmendaten (Name, Branche, Ort, Website-Texte,
              Google-Bewertungen) zur Erstellung einer Vorschau-Website. Diese Demo-Seite ist über
              einen individuellen Link zugänglich und wird nach 30 Tagen automatisch deaktiviert,
              sofern kein Vertrag zustande kommt.
            </p>

            <h2 style={h2}>5. Zahlungsabwicklung</h2>
            <p>
              Für die Zahlungsabwicklung nutzen wir den Dienst Stripe (Stripe Payments Europe Ltd.,
              1 Grand Canal Street Lower, Grand Canal Dock, Dublin, D02 H210, Irland). Bei
              Abschluss eines Abonnements werden Ihre Zahlungsdaten direkt von Stripe verarbeitet.
              Wir haben keinen Zugriff auf vollständige Kreditkarten- oder Kontodaten. Details
              finden Sie in der{" "}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener" style={{ color: "var(--blue)" }}>
                Datenschutzerklärung von Stripe
              </a>.
            </p>

            <h2 style={h2}>6. Änderung dieser Datenschutzerklärung</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den
              aktuellen rechtlichen Anforderungen entspricht oder um Änderungen unserer Leistungen
              in der Datenschutzerklärung umzusetzen. Für Ihren erneuten Besuch gilt dann die neue
              Datenschutzerklärung.
            </p>

            <p style={{ marginTop: 48, color: "var(--ink-soft)", fontSize: 14 }}>
              Stand: Juli 2026
            </p>
          </div>
        </div>
      </article>

      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link> · <Link href="/agb">AGB</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}

const h2: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: "clamp(22px, 3vw, 28px)", lineHeight: 1.2,
  marginTop: 48, marginBottom: 16, letterSpacing: "-0.02em",
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
};

const h3: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontWeight: 600,
  fontSize: 19, lineHeight: 1.2,
  marginTop: 28, marginBottom: 10,
  fontVariationSettings: '"opsz" 24, "SOFT" 50',
};

const ul: React.CSSProperties = {
  paddingLeft: 20, marginBottom: 24,
  display: "flex", flexDirection: "column", gap: 6,
};
