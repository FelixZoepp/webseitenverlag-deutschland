import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen – Webseiten-Verlag Deutschland",
  description: "AGB der Content-Leads Solutions UG (haftungsbeschränkt), Marke Webseiten-Verlag Deutschland.",
};

export default function AgbPage() {
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
            Allgemeine Geschäftsbedingungen
          </h1>
        </div>
      </section>

      <article style={{ padding: "64px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="blog-content" style={{ fontSize: 17, lineHeight: 1.75, color: "var(--ink)" }}>

            <h2 style={h2}>§1 Geltungsbereich und Vertragspartner</h2>
            <p>
              (1) Diese Allgemeinen Geschäftsbedingungen gelten für sämtliche Verträge zwischen der Content-Leads Solutions UG (haftungsbeschränkt), Rhinstraße 137A, 10315 Berlin, eingetragen im Handelsregister des Amtsgerichts Charlottenburg (Berlin) unter HRB 281476 B, vertreten durch den Geschäftsführer Felix-Leon Zoepp (nachfolgend &bdquo;Anbieter&ldquo;), und ihren Kunden (nachfolgend &bdquo;Kunde&ldquo;) über die Erstellung, Bereitstellung, den Betrieb und die Pflege von Webseiten unter der Marke &bdquo;Webseiten-Verlag Deutschland&ldquo;.
            </p>
            <p>
              (2) Der Anbieter schließt Verträge ausschließlich mit Unternehmern im Sinne des § 14 BGB, juristischen Personen des öffentlichen Rechts und öffentlich-rechtlichen Sondervermögen. Verträge mit Verbrauchern im Sinne des § 13 BGB werden nicht geschlossen.
            </p>
            <p>
              (3) Der Kunde versichert mit Vertragsschluss ausdrücklich, in Ausübung seiner gewerblichen oder selbstständigen beruflichen Tätigkeit zu handeln, und bestätigt dies im Bestellprozess gesondert. Handelt der Kunde entgegen dieser Versicherung als Verbraucher, ist der Anbieter zur Kündigung mit sofortiger Wirkung berechtigt.
            </p>
            <p>
              (4) Diese AGB gelten ausschließlich. Abweichende, entgegenstehende oder ergänzende Bedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich in Textform zu.
            </p>
            <p>
              (5) Diese AGB gelten auch für künftige Verträge mit dem Kunden über gleichartige Leistungen, ohne dass es eines erneuten Hinweises bedarf.
            </p>

            <h2 style={h2}>§2 Vertragsgegenstand und Leistungsumfang</h2>
            <p>
              (1) Gegenstand des Vertrages ist die Erstellung sowie die anschließende Bereitstellung, das Hosting, der Betrieb und die technische Pflege einer Webseite für den Kunden gegen ein laufendes monatliches Entgelt. Der konkrete Leistungsumfang ergibt sich aus dem gebuchten Paket beziehungsweise dem individuellen Angebot.
            </p>
            <p>
              (2) Sofern nicht abweichend vereinbart, umfasst die Leistung: Konzeption und Gestaltung der Webseite auf Basis der vom Kunden gelieferten Informationen, Bereitstellung auf der vom Anbieter betriebenen Infrastruktur, Bereitstellung eines Zugangs zum Bearbeitungssystem des Anbieters einschließlich des KI-gestützten Editors, Bereitstellung eines TLS-Zertifikats, technische Wartung und Sicherheitsupdates, technische Grundoptimierung für Suchmaschinen sowie Support in Textform.
            </p>
            <p>
              (3) Nicht Gegenstand des Vertrages sind insbesondere: die Registrierung, Verwaltung, Verlängerung und Bezahlung von Domains, die Bereitstellung, Migration oder Betreuung von E-Mail-Postfächern sowie jede Änderung an MX- oder sonstigen E-Mail-bezogenen DNS-Einträgen, die Erstellung individueller Software, redaktionelle Inhaltsproduktion sowie die Schaltung und Betreuung bezahlter Werbung. Diese Leistungen können gesondert beauftragt und vergütet werden.
            </p>
            <p>
              (4) Der Vertrag ist ein Dienst- beziehungsweise Mietvertrag über die fortlaufende Bereitstellung und den Betrieb einer Webseite. Es handelt sich ausdrücklich nicht um einen Werkvertrag über die Herstellung und Übereignung einer Webseite.
            </p>
            <p>
              (5) Der Anbieter schuldet die Erbringung der vereinbarten Leistungen, nicht jedoch einen bestimmten wirtschaftlichen Erfolg. Insbesondere schuldet der Anbieter nicht: eine bestimmte Platzierung in Suchmaschinen, eine bestimmte Anzahl von Besuchern, Anfragen, Leads oder Aufträgen, eine bestimmte Umsatzsteigerung oder die Erreichung eines bestimmten Return on Investment. Angaben in Werbematerialien, Rechenbeispielen und Kalkulationshilfen (z. B. ROI-Rechner) sind unverbindliche Schätzungen und stellen keine Zusicherung im Rechtssinne dar.
            </p>
            <p>
              (6) Der Anbieter ist berechtigt, die eingesetzte Technologie, die Infrastruktur und die Gestaltung des Bearbeitungssystems weiterzuentwickeln und zu verändern, soweit der geschuldete Leistungsumfang hierdurch nicht wesentlich beeinträchtigt wird.
            </p>
            <p>
              (7) Der Anbieter ist berechtigt, zur Leistungserbringung Subunternehmer und Drittanbieter einzusetzen, insbesondere Infrastruktur- und Hosting-Anbieter, Registrare, Content-Delivery-Netzwerke, Zahlungsdienstleister und Anbieter KI-gestützter Systeme.
            </p>

            <h2 style={h2}>§3 Vertragsschluss</h2>
            <p>
              (1) Die Darstellung der Leistungen auf der Webseite des Anbieters stellt kein bindendes Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots.
            </p>
            <p>
              (2) Der Vertrag kommt durch Auftragserteilung des Kunden und deren Annahme durch den Anbieter zustande. Die Annahme kann durch Auftragsbestätigung in Textform oder durch Beginn der Leistungserbringung erfolgen.
            </p>
            <p>
              (3) Der Kunde bestätigt im Bestellprozess ausdrücklich die Geltung dieser AGB in der jeweils angegebenen Fassung sowie die Kenntnisnahme der Vertragslaufzeit, der Verlängerungsregelung und der Kündigungsfrist. Der Anbieter dokumentiert Zeitpunkt und Fassung der Zustimmung.
            </p>
            <p>
              (4) Mündliche Nebenabreden bestehen nicht. Änderungen und Ergänzungen des Vertrages bedürfen der Textform.
            </p>
            <p>
              (5) Ein Widerrufsrecht besteht nicht, da der Anbieter ausschließlich Verträge mit Unternehmern schließt.
            </p>

            <h2 style={h2}>§4 Mitwirkungspflichten des Kunden</h2>
            <p>
              (1) Der Kunde stellt dem Anbieter unverzüglich nach Vertragsschluss sämtliche für die Erstellung der Webseite erforderlichen Informationen, Texte, Bilder, Logos und Kontaktdaten vollständig und in geeigneter Form zur Verfügung.
            </p>
            <p>
              (2) Der Kunde benennt einen Ansprechpartner mit Entscheidungsbefugnis und stellt dessen Erreichbarkeit sicher.
            </p>
            <p>
              (3) Der Kunde ist verpflichtet, die zur Erreichbarkeit der Webseite erforderlichen DNS-Einträge bei seinem Domain-Anbieter nach Anweisung des Anbieters zu setzen oder setzen zu lassen. Der Anbieter nimmt keine Änderungen an E-Mail-bezogenen DNS-Einträgen vor und ist für Beeinträchtigungen des E-Mail-Verkehrs des Kunden nicht verantwortlich.
            </p>
            <p>
              (4) Der Kunde prüft die ihm vorgelegten Entwürfe unverzüglich und erteilt seine Freigabe oder benennt konkrete Änderungswünsche in Textform. Erfolgt innerhalb von zehn Werktagen nach Vorlage keine Rückmeldung, gilt der Entwurf als freigegeben.
            </p>
            <p>
              (5) Kommt der Kunde seinen Mitwirkungspflichten nicht, nicht rechtzeitig oder nicht vollständig nach, verschiebt sich der Zeitpunkt der Bereitstellung entsprechend. Der Vergütungsanspruch des Anbieters bleibt unberührt; die Zahlungspflicht beginnt spätestens einen Monat nach Vertragsschluss, unabhängig davon, ob die Webseite bereits veröffentlicht werden konnte. Die Vertragslaufzeit verlängert sich durch vom Kunden zu vertretende Verzögerungen nicht.
            </p>
            <p>
              (6) Der Kunde hält die ihm überlassenen Zugangsdaten geheim und schützt sie vor dem Zugriff Dritter. Er haftet für sämtliche Handlungen, die über seinen Zugang vorgenommen werden.
            </p>

            <h2 style={h2}>§5 Bearbeitungssystem und Änderungen durch den Kunden</h2>
            <p>
              (1) Der Kunde kann die Inhalte seiner Webseite während der Vertragslaufzeit über das vom Anbieter bereitgestellte, KI-gestützte Bearbeitungssystem selbst anpassen und veröffentlichen. Die Nutzung ist im monatlichen Entgelt enthalten.
            </p>
            <p>
              (2) Änderungen, die der Kunde über das Bearbeitungssystem vornimmt und veröffentlicht, sind eigene Inhalte und eigene Handlungen des Kunden. Der Kunde ist verpflichtet, das Ergebnis jeder Änderung vor und nach der Veröffentlichung zu prüfen. Der Anbieter haftet nicht für Inhalt, Gestaltung, Richtigkeit oder Rechtmäßigkeit der vom Kunden veranlassten Änderungen und ebenso wenig dafür, dass das System eine Eingabe des Kunden abweichend von dessen Absicht umsetzt.
            </p>
            <p>
              (3) Der Anbieter protokolliert Veröffentlichungsvorgänge mit Zeitpunkt und auslösendem Zugang und stellt eine Funktion zur Wiederherstellung eines vorherigen Standes bereit.
            </p>
            <p>
              (4) Rechtlich relevante Pflichtangaben, insbesondere Impressum, Datenschutzerklärung und Cookie-Hinweise, sind der Bearbeitung durch das System entzogen. Änderungen hieran sind beim Anbieter in Textform zu beauftragen.
            </p>
            <p>
              (5) Nicht im monatlichen Entgelt enthalten sind Zusatzmodule und Zusatzleistungen, insbesondere weitere Unterseiten, zusätzliche Funktionen sowie Leistungen, die außerhalb des Bearbeitungssystems zu erbringen sind. Diese werden nach der jeweils gültigen Preisliste des Anbieters vergütet. Der Anbieter teilt dem Kunden den Preis vor Ausführung mit; die Beauftragung erfolgt in Textform.
            </p>
            <p>
              (6) Ein Anspruch des Kunden auf ein vollständiges Redesign innerhalb der Vertragslaufzeit besteht nicht.
            </p>

            <h2 style={h2}>§6 Vergütung, Fälligkeit und Zahlungsverzug</h2>
            <p>
              (1) Die Höhe der monatlichen Vergütung ergibt sich aus dem gebuchten Paket beziehungsweise dem Angebot. Sämtliche Preise verstehen sich netto zuzüglich der gesetzlichen Umsatzsteuer.
            </p>
            <p>
              (2) Die monatliche Vergütung ist im Voraus zum ersten Werktag eines Monats fällig. Die erste Zahlung wird mit Vertragsschluss fällig.
            </p>
            <p>
              (3) Die Zahlung erfolgt per SEPA-Lastschrift oder Überweisung; der Anbieter kann Zahlungsdienstleister einbinden. Bei Erteilung eines SEPA-Lastschriftmandats verkürzt sich die Frist zur Vorabankündigung auf einen Tag.
            </p>
            <p>
              (4) Kosten, die dem Anbieter durch eine vom Kunden zu vertretende Rücklastschrift entstehen, hat der Kunde zu erstatten.
            </p>
            <p>
              (5) Bei Zahlungsverzug kann der Anbieter Verzugszinsen in Höhe von neun Prozentpunkten über dem Basiszinssatz sowie die Pauschale nach § 288 Abs. 5 BGB verlangen.
            </p>
            <p>
              (6) Befindet sich der Kunde mit einer monatlichen Zahlung ganz oder teilweise länger als 30 Tage in Verzug, wird die gesamte bis zum nächsten ordentlichen Beendigungstermin geschuldete Restvergütung sofort zur Zahlung fällig.
            </p>
            <p>
              (7) Bei Zahlungsverzug ist der Anbieter nach vorheriger Ankündigung berechtigt, die Webseite vorübergehend zu deaktivieren.
            </p>
            <p>
              (8) Die Aufrechnung durch den Kunden ist ausgeschlossen, es sei denn, die Gegenforderung ist unbestritten oder rechtskräftig festgestellt.
            </p>

            <h2 style={h2}>§7 Laufzeit, Verlängerung und Kündigung</h2>
            <p>
              (1) Die Mindestvertragslaufzeit beträgt 24 Monate, beginnend mit dem Vertragsschluss, sofern im Angebot nichts anderes vereinbart ist.
            </p>
            <p>
              (2) Der Vertrag verlängert sich nach Ablauf der Mindestlaufzeit automatisch um jeweils weitere 12 Monate, sofern er nicht spätestens drei Monate vor Ablauf der jeweiligen Laufzeit in Textform gekündigt wird.
            </p>
            <p>
              (3) Die Kündigung bedarf der Textform. Sie kann per E-Mail an kuendigung@webseitenverlag-deutschland.de oder über die Kündigungsfunktion im Kundenkonto erklärt werden.
            </p>
            <p>
              (4) Das ordentliche Kündigungsrecht des Kunden innerhalb der laufenden Vertragslaufzeit ist ausgeschlossen. Das Recht beider Parteien zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
            <p>
              (5) Zusatzmodule werden für die Restlaufzeit des Hauptvertrages gebucht und enden automatisch mit diesem.
            </p>

            <h2 style={h2}>§8 Nutzungsrechte und Inhalte des Kunden</h2>
            <p>
              (1) Der Kunde räumt dem Anbieter für die Dauer des Vertrages das nicht exklusive Recht ein, die vom Kunden bereitgestellten Inhalte (Texte, Bilder, Logos, Marken) zur Erfüllung der Vertragspflichten zu verwenden, zu vervielfältigen, zu bearbeiten und öffentlich zugänglich zu machen.
            </p>
            <p>
              (2) Der Kunde versichert, dass er über sämtliche erforderlichen Rechte an den von ihm bereitgestellten Inhalten verfügt und dass deren Nutzung keine Rechte Dritter verletzt. Er stellt den Anbieter von sämtlichen Ansprüchen Dritter frei, die aus einer Verletzung dieser Pflicht entstehen.
            </p>
            <p>
              (3) Die im Rahmen des Vertrages vom Anbieter erstellten Designs, Texte, Layouts und technischen Komponenten verbleiben urheberrechtlich beim Anbieter beziehungsweise den jeweiligen Drittlizenzgebern. Mit Beendigung des Vertrages erlischt jedes Nutzungsrecht des Kunden hieran. Ein Anspruch auf Herausgabe von Quellcode, Designdateien oder sonstigen Produktionsmitteln besteht nicht.
            </p>
            <p>
              (4) Die Webseite wird auf der Infrastruktur des Anbieters betrieben. Ein Anspruch auf Übertragung der Webseite auf eine fremde Infrastruktur besteht nicht.
            </p>

            <h2 style={h2}>§9 Verfügbarkeit, Wartung und Datensicherung</h2>
            <p>
              (1) Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit der Webseite. Eine bestimmte Verfügbarkeit wird nicht garantiert. Geplante Wartungsarbeiten werden nach Möglichkeit in nachfrageschwachen Zeiten durchgeführt.
            </p>
            <p>
              (2) Der Anbieter führt regelmäßige Datensicherungen durch. Die Datensicherung dient der Systemwiederherstellung; ein Anspruch des Kunden auf Herausgabe von Sicherungsdaten besteht nicht.
            </p>
            <p>
              (3) Störungen können dem Anbieter per E-Mail an support@webseitenverlag-deutschland.de gemeldet werden. Der Anbieter bemüht sich um eine Bearbeitung innerhalb von 48 Stunden an Werktagen.
            </p>

            <h2 style={h2}>§10 Haftung</h2>
            <p>
              (1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, für vorsätzliche oder grob fahrlässige Pflichtverletzungen sowie für Ansprüche nach dem Produkthaftungsgesetz.
            </p>
            <p>
              (2) Bei einfacher Fahrlässigkeit haftet der Anbieter nur für die Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den vorhersehbaren, typischerweise eintretenden Schaden begrenzt, höchstens jedoch auf die in den letzten zwölf Monaten vor dem Schadenseintritt vom Kunden gezahlte Vergütung.
            </p>
            <p>
              (3) Im Übrigen ist die Haftung des Anbieters ausgeschlossen. Insbesondere haftet der Anbieter nicht für: entgangenen Gewinn, mittelbare Schäden oder Folgeschäden, Schäden aus dem Verlust oder der Nichtauffindbarkeit der Webseite in Suchmaschinen, Schäden aus der Handlung oder Unterlassung von Subunternehmern und Drittanbietern, Schäden aus einer Verletzung von Mitwirkungspflichten des Kunden, Schäden aus Änderungen, die der Kunde über das Bearbeitungssystem vorgenommen hat, sowie Schäden aus höherer Gewalt.
            </p>
            <p>
              (4) Der Anbieter ist nicht verantwortlich für die Rechtmäßigkeit der vom Kunden bereitgestellten Inhalte. Der Kunde ist insbesondere selbst verantwortlich für die Vollständigkeit und Richtigkeit des Impressums, der Datenschutzerklärung, von Preisangaben, Wettbewerbsrecht, Heilmittelwerberecht, Fernabsatzrecht und sonstigen branchenspezifischen Anforderungen. Soweit der Anbieter Rechtstexte bereitstellt, handelt es sich um unverbindliche Muster ohne Rechtsberatungscharakter.
            </p>

            <h2 style={h2}>§11 Datenschutz</h2>
            <p>
              (1) Soweit der Anbieter im Rahmen der Vertragserfüllung personenbezogene Daten im Auftrag des Kunden verarbeitet, schließen die Parteien einen gesonderten Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
            </p>
            <p>
              (2) Im Übrigen verarbeitet der Anbieter personenbezogene Daten des Kunden ausschließlich zur Vertragsdurchführung und im Rahmen seiner gesetzlichen Pflichten. Näheres ergibt sich aus der Datenschutzerklärung des Anbieters.
            </p>

            <h2 style={h2}>§12 Änderungen der AGB</h2>
            <p>
              (1) Der Anbieter ist berechtigt, diese AGB mit einer Ankündigungsfrist von sechs Wochen zu ändern. Die Änderung wird dem Kunden in Textform mitgeteilt.
            </p>
            <p>
              (2) Widerspricht der Kunde der Änderung nicht innerhalb von vier Wochen nach Zugang der Mitteilung, gilt die Änderung als angenommen. Auf diese Folge wird der Anbieter in der Ankündigung gesondert hinweisen.
            </p>
            <p>
              (3) Widerspricht der Kunde der Änderung fristgerecht, gilt der Vertrag zu den bisherigen Bedingungen fort; der Anbieter ist in diesem Fall berechtigt, den Vertrag mit einer Frist von vier Wochen zu kündigen.
            </p>

            <h2 style={h2}>§13 Geheimhaltung</h2>
            <p>
              (1) Beide Parteien verpflichten sich, alle im Rahmen der Vertragsbeziehung erlangten vertraulichen Informationen der jeweils anderen Partei vertraulich zu behandeln und nicht an Dritte weiterzugeben, sofern dies nicht zur Vertragserfüllung erforderlich ist oder die andere Partei ausdrücklich zugestimmt hat.
            </p>
            <p>
              (2) Diese Pflicht gilt nicht für Informationen, die allgemein bekannt sind oder ohne Verletzung dieser Vereinbarung bekannt werden, die dem Empfänger bereits vor der Offenlegung bekannt waren, oder die der Empfänger auf legalem Wege von einem Dritten erhalten hat.
            </p>

            <h2 style={h2}>§14 Aufrechnung und Zurückbehaltungsrecht</h2>
            <p>
              (1) Der Kunde ist zur Aufrechnung nur berechtigt, wenn seine Gegenforderung rechtskräftig festgestellt, unbestritten oder entscheidungsreif ist.
            </p>
            <p>
              (2) Der Kunde kann ein Zurückbehaltungsrecht nur ausüben, wenn sein Gegenanspruch auf demselben Vertragsverhältnis beruht.
            </p>

            <h2 style={h2}>§15 Abtretung</h2>
            <p>
              (1) Der Anbieter ist berechtigt, Forderungen aus diesem Vertrag an Dritte abzutreten.
            </p>
            <p>
              (2) Der Kunde ist zur Abtretung von Rechten und Pflichten aus diesem Vertrag ohne vorherige schriftliche Zustimmung des Anbieters nicht berechtigt.
            </p>

            <h2 style={h2}>§16 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
            </p>
            <p>
              (2) Erfüllungsort und ausschließlicher Gerichtsstand für alle Streitigkeiten aus oder im Zusammenhang mit diesem Vertrag ist Berlin, soweit der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist.
            </p>
            <p>
              (3) Änderungen und Ergänzungen dieses Vertrages bedürfen der Textform. Dies gilt auch für die Aufhebung des Textformerfordernisses.
            </p>
            <p>
              (4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Die unwirksame Bestimmung ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
            </p>

            <h2 style={h2}>§17 Kontakt und Kündigung</h2>
            <p>
              (1) Für allgemeine Anfragen: info@webseitenverlag-deutschland.de
            </p>
            <p>
              (2) Für Kündigungen: kuendigung@webseitenverlag-deutschland.de oder über die Kündigungsfunktion im Kundenkonto unter mein.webseitenverlag-deutschland.de
            </p>
            <p>
              (3) Postanschrift: Content-Leads Solutions UG (haftungsbeschränkt), Rhinstraße 137A, 10315 Berlin
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
