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

            <h2 style={h2}>&sect;1 Geltungsbereich und Vertragspartner</h2>
            <p>
              (1) Diese Allgemeinen Gesch&auml;ftsbedingungen gelten f&uuml;r s&auml;mtliche Vertr&auml;ge zwischen der Content-Leads Solutions UG (haftungsbeschr&auml;nkt), Rhinstra&szlig;e 137A, 10315 Berlin, eingetragen im Handelsregister des Amtsgerichts Charlottenburg (Berlin) unter HRB 281476 B, vertreten durch den Gesch&auml;ftsf&uuml;hrer Felix-Leon Zoepp (nachfolgend &bdquo;Anbieter&ldquo;), und ihren Kunden (nachfolgend &bdquo;Kunde&ldquo;) &uuml;ber die Erstellung, Bereitstellung, den Betrieb und die Pflege von Webseiten unter der Marke &bdquo;Webseiten-Verlag Deutschland&ldquo;.
            </p>
            <p>
              (2) Der Anbieter schlie&szlig;t Vertr&auml;ge ausschlie&szlig;lich mit Unternehmern im Sinne des &sect;&nbsp;14 BGB, juristischen Personen des &ouml;ffentlichen Rechts und &ouml;ffentlich-rechtlichen Sonderverm&ouml;gen. Vertr&auml;ge mit Verbrauchern im Sinne des &sect;&nbsp;13 BGB werden nicht geschlossen.
            </p>
            <p>
              (3) Der Kunde versichert mit Vertragsschluss ausdr&uuml;cklich, in Aus&uuml;bung seiner gewerblichen oder selbstst&auml;ndigen beruflichen T&auml;tigkeit zu handeln, und best&auml;tigt dies im Bestellprozess gesondert. Handelt der Kunde entgegen dieser Versicherung als Verbraucher, ist der Anbieter zur K&uuml;ndigung mit sofortiger Wirkung berechtigt.
            </p>
            <p>
              (4) Diese AGB gelten ausschlie&szlig;lich. Abweichende, entgegenstehende oder erg&auml;nzende Bedingungen des Kunden werden nicht Vertragsbestandteil, es sei denn, der Anbieter stimmt ihrer Geltung ausdr&uuml;cklich in Textform zu.
            </p>
            <p>
              (5) Diese AGB gelten auch f&uuml;r k&uuml;nftige Vertr&auml;ge mit dem Kunden &uuml;ber gleichartige Leistungen, ohne dass es eines erneuten Hinweises bedarf.
            </p>

            <h2 style={h2}>&sect;2 Vertragsgegenstand und Leistungsumfang</h2>
            <p>
              (1) Gegenstand des Vertrages ist die Erstellung sowie die anschlie&szlig;ende Bereitstellung, das Hosting, der Betrieb und die technische Pflege einer Webseite f&uuml;r den Kunden gegen ein laufendes monatliches Entgelt. Der konkrete Leistungsumfang ergibt sich aus dem gebuchten Paket beziehungsweise dem individuellen Angebot.
            </p>
            <p>
              (2) Sofern nicht abweichend vereinbart, umfasst die Leistung: Konzeption und Gestaltung der Webseite auf Basis der vom Kunden gelieferten Informationen, Bereitstellung auf der vom Anbieter betriebenen Infrastruktur, Bereitstellung eines Zugangs zum Bearbeitungssystem des Anbieters einschlie&szlig;lich des KI-gest&uuml;tzten Editors, Bereitstellung eines TLS-Zertifikats, technische Wartung und Sicherheitsupdates, technische Grundoptimierung f&uuml;r Suchmaschinen sowie Support in Textform.
            </p>
            <p>
              (3) Der Vertrag ist ein Dienst- beziehungsweise Mietvertrag &uuml;ber die fortlaufende Bereitstellung und den Betrieb einer Webseite. Es handelt sich ausdr&uuml;cklich nicht um einen Werkvertrag &uuml;ber die Herstellung und &Uuml;bereignung einer Webseite.
            </p>
            <p>
              (4) Der Anbieter schuldet die Erbringung der vereinbarten Leistungen, nicht jedoch einen bestimmten wirtschaftlichen Erfolg. Insbesondere schuldet der Anbieter keine bestimmte Platzierung in Suchmaschinen, keine bestimmte Anzahl von Besuchern, Anfragen oder Auftr&auml;gen und keinen bestimmten Umsatz des Kunden.
            </p>
            <p>
              (5) Nicht Gegenstand des Vertrages sind, soweit nicht ausdr&uuml;cklich abweichend vereinbart: die Registrierung und Verwaltung der Domain, die Bereitstellung und der Betrieb von E-Mail-Postf&auml;chern, die Erstellung von Texten, Bildern oder Videos durch den Anbieter, redaktionelle Betreuung, laufende Suchmaschinenoptimierung sowie die rechtliche Pr&uuml;fung der Webseiteninhalte.
            </p>
            <p>
              (6) Der Anbieter ist berechtigt, zur Erbringung der Leistungen Dritte als Erf&uuml;llungsgehilfen einzusetzen.
            </p>

            <h2 style={h2}>&sect;3 Vertragsschluss</h2>
            <p>
              (1) Die Darstellung der Leistungen auf der Webseite des Anbieters stellt kein bindendes Angebot dar, sondern eine Aufforderung zur Abgabe eines Angebots.
            </p>
            <p>
              (2) Der Vertrag kommt durch Auftragserteilung des Kunden und deren Annahme durch den Anbieter zustande. Die Annahme kann durch Auftragsbest&auml;tigung in Textform oder durch Beginn der Leistungserbringung erfolgen.
            </p>
            <p>
              (3) Der Kunde best&auml;tigt im Bestellprozess ausdr&uuml;cklich die Geltung dieser AGB in der jeweils angegebenen Fassung sowie die Kenntnisnahme der Vertragslaufzeit, der Verl&auml;ngerungsregelung und der K&uuml;ndigungsfrist. Der Anbieter dokumentiert Zeitpunkt und Fassung der Zustimmung.
            </p>
            <p>
              (4) M&uuml;ndliche Nebenabreden bestehen nicht. &Auml;nderungen und Erg&auml;nzungen des Vertrages bed&uuml;rfen der Textform.
            </p>
            <p>
              (5) Ein Widerrufsrecht besteht nicht, da der Anbieter ausschlie&szlig;lich Vertr&auml;ge mit Unternehmern schlie&szlig;t.
            </p>

            <h2 style={h2}>&sect;4 Mitwirkungspflichten des Kunden</h2>
            <p>
              (1) Der Kunde stellt dem Anbieter unverz&uuml;glich nach Vertragsschluss s&auml;mtliche f&uuml;r die Erstellung der Webseite erforderlichen Informationen, Texte, Bilder, Logos und Kontaktdaten vollst&auml;ndig und in geeigneter Form zur Verf&uuml;gung.
            </p>
            <p>
              (2) Der Kunde benennt einen Ansprechpartner mit Entscheidungsbefugnis und stellt dessen Erreichbarkeit sicher.
            </p>
            <p>
              (3) Der Kunde ist verpflichtet, die zur Erreichbarkeit der Webseite erforderlichen DNS-Eintr&auml;ge bei seinem Domain-Anbieter nach Anweisung des Anbieters zu setzen oder setzen zu lassen. Der Anbieter nimmt keine &Auml;nderungen an E-Mail-bezogenen DNS-Eintr&auml;gen vor und ist f&uuml;r Beeintr&auml;chtigungen des E-Mail-Verkehrs des Kunden nicht verantwortlich.
            </p>
            <p>
              (4) Der Kunde pr&uuml;ft die ihm vorgelegten Entw&uuml;rfe unverz&uuml;glich und erteilt seine Freigabe oder benennt konkrete &Auml;nderungsw&uuml;nsche in Textform. Erfolgt innerhalb von sieben Werktagen nach Fristsetzung keine R&uuml;ckmeldung, gilt der Entwurf als freigegeben.
            </p>
            <p>
              (5) Kommt der Kunde seinen Mitwirkungspflichten nicht, nicht rechtzeitig oder nicht vollst&auml;ndig nach, verschiebt sich der Zeitpunkt der Bereitstellung entsprechend. Der Verg&uuml;tungsanspruch des Anbieters bleibt unber&uuml;hrt; die Zahlungspflicht beginnt sp&auml;testens einen Monat nach Vertragsschluss, unabh&auml;ngig davon, ob die Webseite bereits ver&ouml;ffentlicht werden konnte. Die Vertragslaufzeit verl&auml;ngert sich durch vom Kunden zu vertretende Verz&ouml;gerungen nicht.
            </p>
            <p>
              (6) Der Kunde h&auml;lt die ihm &uuml;berlassenen Zugangsdaten geheim und sch&uuml;tzt sie vor dem Zugriff Dritter. Er haftet f&uuml;r s&auml;mtliche Handlungen, die &uuml;ber seinen Zugang vorgenommen werden.
            </p>

            <h2 style={h2}>&sect;5 Bearbeitungssystem und &Auml;nderungen durch den Kunden</h2>
            <p>
              (1) Der Kunde kann die Inhalte seiner Webseite w&auml;hrend der Vertragslaufzeit &uuml;ber das vom Anbieter bereitgestellte, KI-gest&uuml;tzte Bearbeitungssystem selbst anpassen und ver&ouml;ffentlichen. Die Nutzung ist im monatlichen Entgelt enthalten.
            </p>
            <p>
              (2) &Auml;nderungen, die der Kunde &uuml;ber das Bearbeitungssystem vornimmt und ver&ouml;ffentlicht, sind eigene Inhalte und eigene Handlungen des Kunden. Der Kunde ist verpflichtet, das Ergebnis jeder &Auml;nderung vor und nach der Ver&ouml;ffentlichung zu pr&uuml;fen. Der Anbieter haftet nicht f&uuml;r Inhalt, Gestaltung, Richtigkeit oder Rechtm&auml;&szlig;igkeit der vom Kunden veranlassten &Auml;nderungen und ebenso wenig daf&uuml;r, dass das System eine Eingabe des Kunden abweichend von dessen Absicht umsetzt.
            </p>
            <p>
              (3) Der Anbieter protokolliert Ver&ouml;ffentlichungsvorg&auml;nge mit Zeitpunkt und ausl&ouml;sendem Zugang und stellt eine Funktion zur Wiederherstellung eines vorherigen Standes bereit.
            </p>
            <p>
              (4) Rechtlich relevante Pflichtangaben, insbesondere Impressum, Datenschutzerkl&auml;rung und Cookie-Hinweise, sind der Bearbeitung durch das System entzogen. &Auml;nderungen hieran sind beim Anbieter in Textform zu beauftragen.
            </p>
            <p>
              (5) Leistungen, die &uuml;ber die Nutzung des Bearbeitungssystems hinausgehen &ndash; insbesondere strukturelle &Uuml;berarbeitungen, zus&auml;tzliche Unterseiten, Neugestaltungen, Programmierarbeiten und die Anbindung von Drittsystemen &ndash; sind gesondert zu verg&uuml;ten. Der Anbieter weist vor Ausf&uuml;hrung auf die Verg&uuml;tungspflicht hin.
            </p>
            <p>
              (6) Ein Anspruch des Kunden auf ein vollst&auml;ndiges Redesign innerhalb der Vertragslaufzeit besteht nicht.
            </p>

            <h2 style={h2}>&sect;6 Verg&uuml;tung, F&auml;lligkeit und Zahlungsverzug</h2>
            <p>
              (1) Die H&ouml;he der monatlichen Verg&uuml;tung ergibt sich aus dem gebuchten Paket beziehungsweise dem Angebot. S&auml;mtliche Preise verstehen sich netto zuz&uuml;glich der gesetzlichen Umsatzsteuer.
            </p>
            <p>
              (2) Die monatliche Verg&uuml;tung ist im Voraus zum ersten Werktag eines Monats f&auml;llig. Die erste Zahlung wird mit Vertragsschluss f&auml;llig.
            </p>
            <p>
              (3) Die Zahlung erfolgt per SEPA-Lastschrift oder &Uuml;berweisung; der Anbieter kann Zahlungsdienstleister einbinden. Bei Erteilung eines SEPA-Lastschriftmandats verk&uuml;rzt sich die Frist zur Vorabank&uuml;ndigung auf einen Tag.
            </p>
            <p>
              (4) Kosten, die dem Anbieter durch eine vom Kunden zu vertretende R&uuml;cklastschrift entstehen, hat der Kunde zu erstatten.
            </p>
            <p>
              (5) Bei Zahlungsverzug kann der Anbieter Verzugszinsen in H&ouml;he von neun Prozentpunkten &uuml;ber dem Basiszinssatz sowie die Pauschale nach &sect;&nbsp;288 Abs.&nbsp;5 BGB verlangen.
            </p>
            <p>
              (6) Ist der Kunde mit einer f&auml;lligen Zahlung ganz oder teilweise l&auml;nger als 14 Tage in Verzug, ist der Anbieter berechtigt, die Webseite nach vorheriger Ank&uuml;ndigung in Textform bis zum vollst&auml;ndigen Ausgleich vom Netz zu nehmen und den Zugang zum Bearbeitungssystem zu sperren. Der Verg&uuml;tungsanspruch bleibt f&uuml;r die Dauer der Sperrung bestehen; die Vertragslaufzeit verl&auml;ngert sich hierdurch nicht. Bei einem Verzug mit zwei aufeinanderfolgenden Monatsraten oder einem Betrag, der zwei Monatsraten erreicht, wird die gesamte bis zum n&auml;chsten ordentlichen Beendigungstermin offene Restverg&uuml;tung sofort zur Zahlung f&auml;llig; ersparte Aufwendungen sind in Abzug zu bringen.
            </p>
            <p>
              (7) Aufrechnungs- und Zur&uuml;ckbehaltungsrechte stehen dem Kunden nur zu, soweit seine Gegenforderung unbestritten oder rechtskr&auml;ftig festgestellt ist.
            </p>
            <p>
              (8) Der Anbieter ist berechtigt, Forderungen aus diesem Vertrag an Dritte abzutreten.
            </p>

            <h2 style={h2}>&sect;7 Vertragslaufzeit, Verl&auml;ngerung und K&uuml;ndigung</h2>
            <p>
              (1) Der Vertrag hat eine Mindestlaufzeit von 24 Monaten, beginnend mit dem Vertragsschluss. Der Zeitpunkt der Ver&ouml;ffentlichung der Webseite ist f&uuml;r den Beginn der Laufzeit ohne Bedeutung.
            </p>
            <p>
              (2) Der Vertrag verl&auml;ngert sich jeweils um weitere 12 Monate, sofern er nicht mit einer Frist von drei Monaten zum Ende der jeweiligen Laufzeit gek&uuml;ndigt wird. Dies gilt entsprechend f&uuml;r jeden weiteren Verl&auml;ngerungszeitraum.
            </p>
            <p>
              (3) Die K&uuml;ndigung bedarf der Textform (z.&nbsp;B. E-Mail an kuendigung@webseitenverlag-deutschland.de). Der Anbieter best&auml;tigt den Eingang der K&uuml;ndigung sowie den Zeitpunkt ihrer Wirksamkeit in Textform.
            </p>
            <p>
              (4) Geht eine K&uuml;ndigung nach Ablauf der K&uuml;ndigungsfrist ein, wird sie zum n&auml;chstm&ouml;glichen Beendigungstermin wirksam; der Vertrag verl&auml;ngert sich zun&auml;chst um den in Absatz 2 genannten Zeitraum.
            </p>
            <p>
              (5) Das ordentliche K&uuml;ndigungsrecht des Kunden innerhalb der laufenden Vertragslaufzeit ist ausgeschlossen. Das Recht beider Parteien zur au&szlig;erordentlichen K&uuml;ndigung aus wichtigem Grund bleibt unber&uuml;hrt.
            </p>
            <p>
              (6) Ein wichtiger Grund f&uuml;r den Anbieter liegt insbesondere vor bei Zahlungsverzug gem&auml;&szlig; &sect;6 Absatz 6, bei wiederholtem Versto&szlig; gegen &sect;11 sowie bei Einstellung der Zahlungen oder Er&ouml;ffnung eines Insolvenzverfahrens &uuml;ber das Verm&ouml;gen des Kunden.
            </p>
            <p>
              (7) K&uuml;ndigt der Anbieter aus einem vom Kunden zu vertretenden wichtigen Grund, bleibt der Verg&uuml;tungsanspruch bis zum regul&auml;ren Beendigungstermin unber&uuml;hrt; &sect;6 Absatz 6 Satz 2 und 3 gelten entsprechend.
            </p>

            <h2 style={h2}>&sect;8 Bereitstellung, Wartung und Support</h2>
            <p>
              (1) Der Anbieter stellt die Webseite des Kunden auf einer von ihm ausgew&auml;hlten Infrastruktur bereit. Er ist bem&uuml;ht, eine hohe Verf&uuml;gbarkeit zu gew&auml;hrleisten, schuldet jedoch keine bestimmte Verf&uuml;gbarkeit und gibt keine Verf&uuml;gbarkeitsgarantie ab.
            </p>
            <p>
              (2) Der Anbieter ist berechtigt, Wartungsarbeiten durchzuf&uuml;hren und die Erreichbarkeit hierf&uuml;r vor&uuml;bergehend einzuschr&auml;nken. Planbare Wartungsarbeiten werden nach M&ouml;glichkeit au&szlig;erhalb der &uuml;blichen Gesch&auml;ftszeiten durchgef&uuml;hrt.
            </p>
            <p>
              (3) Der Anbieter ist berechtigt, die eingesetzte Technik, Infrastruktur und Softwarekomponenten zu &auml;ndern, soweit dies f&uuml;r den Kunden zumutbar ist und der vereinbarte Leistungsumfang nicht wesentlich beeintr&auml;chtigt wird.
            </p>
            <p>
              (4) Der Anbieter erstellt regelm&auml;&szlig;ige Sicherungskopien der Webseite. Ein Anspruch des Kunden auf Herausgabe der Sicherungskopien in einem bestimmten Format besteht nicht.
            </p>
            <p>
              (5) Der Support erfolgt in Textform an die vom Anbieter benannte Adresse zu den &uuml;blichen Gesch&auml;ftszeiten. Eine bestimmte Reaktionszeit wird nur zugesagt, soweit dies ausdr&uuml;cklich vereinbart ist.
            </p>

            <h2 style={h2}>&sect;9 Domains, DNS und E-Mail</h2>
            <p>
              (1) Die Domain wird vom Kunden gehalten. Der Kunde ist Domaininhaber und Vertragspartner seines Domain-Anbieters; die Kosten der Domain tr&auml;gt der Kunde.
            </p>
            <p>
              (2) Der Kunde ist f&uuml;r die Verwaltung seiner Domain und die Richtigkeit der DNS-Eintr&auml;ge verantwortlich. Er setzt die zur Erreichbarkeit der Webseite erforderlichen Eintr&auml;ge nach Anweisung des Anbieters.
            </p>
            <p>
              (3) E-Mail-Postf&auml;cher und E-Mail-Zustellung sind nicht Gegenstand des Vertrages. Der Anbieter nimmt keine &Auml;nderungen an E-Mail-bezogenen DNS-Eintr&auml;gen (insbesondere MX-, SPF-, DKIM- und DMARC-Eintr&auml;gen) vor und haftet nicht f&uuml;r Beeintr&auml;chtigungen des E-Mail-Verkehrs des Kunden.
            </p>
            <p>
              (4) Registriert der Anbieter ausnahmsweise im Auftrag des Kunden eine Domain, wird der Kunde als Domaininhaber eingetragen, soweit dies technisch m&ouml;glich ist. Der Anbieter wird lediglich als administrativer und technischer Ansprechpartner t&auml;tig.
            </p>
            <p>
              (5) Der Kunde stellt sicher, dass die von ihm gew&auml;hlte Domain keine Rechte Dritter verletzt.
            </p>

            <h2 style={h2}>&sect;10 Nutzungsrechte, Vertragsende und &Uuml;bernahme</h2>
            <p>
              (1) Der Anbieter r&auml;umt dem Kunden f&uuml;r die Dauer des Vertrages ein einfaches, nicht &uuml;bertragbares und nicht unterlizenzierbares Recht zur Nutzung der bereitgestellten Webseite sowie des Bearbeitungssystems ein.
            </p>
            <p>
              (2) Die Einr&auml;umung von Nutzungsrechten steht unter der aufschiebenden Bedingung der vollst&auml;ndigen Zahlung der jeweils f&auml;lligen Verg&uuml;tung.
            </p>
            <p>
              (3) Mit Beendigung des Vertrages endet das Nutzungsrecht des Kunden. Der Anbieter ist berechtigt, die Webseite abzuschalten. Ein Anspruch des Kunden auf Herausgabe, &Uuml;bertragung oder Weiternutzung der Webseite, des Quellcodes oder des Designs besteht vorbehaltlich Absatz 5 nicht.
            </p>
            <p>
              (4) An den vom Kunden gelieferten oder selbst eingestellten Inhalten erwirbt der Anbieter keine Rechte. Auf Anforderung stellt der Anbieter dem Kunden diese Inhalte bei Vertragsende in einem g&auml;ngigen Format zur Verf&uuml;gung.
            </p>
            <p>
              (5) Der Kunde kann die &Uuml;bernahme seines Webauftritts nur nach wirksamer K&uuml;ndigung und nur zum Zeitpunkt des regul&auml;ren Vertragsendes verlangen; weitere Voraussetzung ist der vollst&auml;ndige Ausgleich s&auml;mtlicher Forderungen. Gegen Zahlung einer einmaligen Abl&ouml;se in H&ouml;he von 999&nbsp;&euro; netto erh&auml;lt der Kunde eine statische Ausleitung seines Webauftritts sowie ein einfaches, nicht ausschlie&szlig;liches, zeitlich und r&auml;umlich unbeschr&auml;nktes und &uuml;bertragbares Recht zur Nutzung dieses konkreten Webauftritts. Rechte am zugrunde liegenden System, an Templates, am Bearbeitungssystem und am KI-Editor werden nicht einger&auml;umt; ein Anspruch auf ausschlie&szlig;liche Rechte besteht nicht.
            </p>
            <p>
              (6) Nicht Gegenstand der &Uuml;bernahme sind insbesondere: das Bearbeitungssystem und der KI-Editor, weiteres Hosting, Support, Wartung und Sicherheitsupdates sowie Rechte an Inhalten Dritter. Der Kunde ist verpflichtet, vor der Weiterverwendung eigenst&auml;ndig zu pr&uuml;fen, ob f&uuml;r eingesetzte Bilder, Schriften oder sonstige Materialien Dritter &uuml;bertragbare Lizenzen bestehen; erforderlichenfalls hat er diese selbst zu erwerben.
            </p>
            <p>
              (7) Die &Uuml;bernahme wird in einem &Uuml;bergabeprotokoll dokumentiert. Mit der &Uuml;bergabe endet die Verantwortung des Anbieters f&uuml;r Betrieb, Verf&uuml;gbarkeit, Sicherheit und Rechtskonformit&auml;t des Webauftritts.
            </p>
            <p>
              (8) Der Anbieter l&ouml;scht die Daten des Kunden 30 Tage nach Vertragsende, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Der Kunde ist f&uuml;r die rechtzeitige Sicherung seiner Inhalte selbst verantwortlich.
            </p>

            <h2 style={h2}>&sect;11 Inhalte des Kunden, Rechtsfreiheit und Freistellung</h2>
            <p>
              (1) Der Kunde ist f&uuml;r s&auml;mtliche von ihm gelieferten oder &uuml;ber das Bearbeitungssystem eingestellten Inhalte allein verantwortlich.
            </p>
            <p>
              (2) Der Kunde versichert, dass diese Inhalte frei von Rechten Dritter sind, insbesondere keine Urheber-, Marken-, Pers&ouml;nlichkeits-, Wettbewerbs- oder sonstigen Schutzrechte verletzen, und dass er &uuml;ber s&auml;mtliche f&uuml;r die Ver&ouml;ffentlichung erforderlichen Nutzungsrechte verf&uuml;gt.
            </p>
            <p>
              (3) Der Kunde verpflichtet sich, keine rechtswidrigen, irref&uuml;hrenden, jugendgef&auml;hrdenden oder gegen gesetzliche Vorschriften &ndash; insbesondere das Wettbewerbs-, Heilmittelwerbe- oder Preisangabenrecht &ndash; versto&szlig;enden Inhalte einzustellen.
            </p>
            <p>
              (4) Der Kunde stellt den Anbieter von s&auml;mtlichen Anspr&uuml;chen Dritter frei, die aufgrund der von ihm gelieferten oder eingestellten Inhalte gegen den Anbieter geltend gemacht werden, einschlie&szlig;lich der Kosten einer angemessenen Rechtsverteidigung.
            </p>
            <p>
              (5) Der Kunde ist f&uuml;r das Vorhandensein und die Richtigkeit der gesetzlich vorgeschriebenen Pflichtangaben, insbesondere Impressum und Datenschutzerkl&auml;rung, verantwortlich. Der Anbieter stellt hierf&uuml;r lediglich technische Vorlagen bereit und schuldet keine rechtliche Pr&uuml;fung.
            </p>
            <p>
              (6) Der Anbieter ist berechtigt, Inhalte vor&uuml;bergehend zu sperren oder zu entfernen, wenn ein begr&uuml;ndeter Verdacht auf eine Rechtsverletzung besteht. Er informiert den Kunden hier&uuml;ber unverz&uuml;glich in Textform.
            </p>

            <h2 style={h2}>&sect;12 M&auml;ngel und St&ouml;rungsbeseitigung</h2>
            <p>
              (1) Der Kunde zeigt St&ouml;rungen unverz&uuml;glich in Textform an und beschreibt sie so genau, dass eine Nachvollziehung m&ouml;glich ist.
            </p>
            <p>
              (2) Der Anbieter beseitigt St&ouml;rungen, die er zu vertreten hat, innerhalb angemessener Frist.
            </p>
            <p>
              (3) Unerhebliche Beeintr&auml;chtigungen der Gebrauchstauglichkeit begr&uuml;nden keine M&auml;ngelansprüche. Eine Minderung durch Abzug vom laufenden Entgelt ist ausgeschlossen; ein etwaiger Minderungsanspruch ist gesondert geltend zu machen.
            </p>
            <p>
              (4) Kein Mangel liegt vor, wenn eine Beeintr&auml;chtigung auf &Auml;nderungen beruht, die der Kunde &uuml;ber das Bearbeitungssystem selbst vorgenommen hat, auf der Domain- oder DNS-Verwaltung des Kunden, auf St&ouml;rungen von Diensten Dritter oder auf gestalterischen Erwartungen des Kunden, die nicht ausdr&uuml;cklich vereinbart wurden.
            </p>

            <h2 style={h2}>&sect;13 Haftung</h2>
            <p>
              (1) Der Anbieter haftet unbeschr&auml;nkt bei Vorsatz und grober Fahrl&auml;ssigkeit, bei der Verletzung von Leben, K&ouml;rper oder Gesundheit, im Rahmen einer ausdr&uuml;cklich &uuml;bernommenen Garantie sowie nach dem Produkthaftungsgesetz.
            </p>
            <p>
              (2) Bei einfacher Fahrl&auml;ssigkeit haftet der Anbieter nur bei Verletzung einer wesentlichen Vertragspflicht (Kardinalpflicht), also einer Pflicht, deren Erf&uuml;llung die ordnungsgem&auml;&szlig;e Durchf&uuml;hrung des Vertrages &uuml;berhaupt erst erm&ouml;glicht und auf deren Einhaltung der Kunde regelm&auml;&szlig;ig vertrauen darf. In diesem Fall ist die Haftung auf den bei Vertragsschluss typischerweise vorhersehbaren Schaden begrenzt.
            </p>
            <p>
              (3) Die Haftung nach Absatz 2 ist der H&ouml;he nach auf die Deckungssumme der vom Anbieter unterhaltenen Berufshaftpflichtversicherung begrenzt, mindestens jedoch auf 300.000&nbsp;&euro; je Schadensfall.
            </p>
            <p>
              (4) Im &Uuml;brigen ist die Haftung bei einfacher Fahrl&auml;ssigkeit ausgeschlossen.
            </p>
            <p>
              (5) Der Anbieter haftet nicht f&uuml;r Inhalte, Gestaltungen und Ver&ouml;ffentlichungen, die der Kunde &uuml;ber das Bearbeitungssystem selbst veranlasst hat (&sect;5), und ebenso wenig daf&uuml;r, dass das System eine Eingabe des Kunden abweichend von dessen Absicht umsetzt.
            </p>
            <p>
              (6) Der Anbieter haftet nicht f&uuml;r die vom Kunden gelieferten Inhalte und die daran bestehenden Rechte Dritter (&sect;11).
            </p>
            <p>
              (7) Der Anbieter haftet nicht f&uuml;r Ausf&auml;lle und St&ouml;rungen, die auf h&ouml;herer Gewalt, auf Ausf&auml;llen von Vorleistern oder auf Umst&auml;nden beruhen, die er nicht zu vertreten hat.
            </p>
            <p>
              (8) Der Anbieter haftet nicht f&uuml;r Beeintr&auml;chtigungen, die auf der Domain- oder DNS-Verwaltung des Kunden beruhen, sowie nicht f&uuml;r St&ouml;rungen des E-Mail-Verkehrs des Kunden (&sect;9).
            </p>
            <p>
              (9) F&uuml;r den Verlust von Daten haftet der Anbieter nur in H&ouml;he des Aufwandes, der bei ordnungsgem&auml;&szlig;er und regelm&auml;&szlig;iger Datensicherung durch den Kunden zur Wiederherstellung erforderlich gew&auml;re.
            </p>
            <p>
              (10) Die vorstehenden Haftungsbeschr&auml;nkungen gelten auch zugunsten der gesetzlichen Vertreter, Mitarbeiter sowie Erf&uuml;llungs- und Verrichtungsgehilfen des Anbieters und f&uuml;r Anspr&uuml;che aus unerlaubter Handlung.
            </p>
            <p>
              (11) Anspr&uuml;che des Kunden auf Schadensersatz verj&auml;hren innerhalb von zw&ouml;lf Monaten ab dem gesetzlichen Verj&auml;hrungsbeginn. Dies gilt nicht f&uuml;r Anspr&uuml;che nach Absatz 1 sowie f&uuml;r Anspr&uuml;che aus vors&auml;tzlicher oder grob fahrl&auml;ssiger Pflichtverletzung.
            </p>

            <h2 style={h2}>&sect;14 Datenschutz und Auftragsverarbeitung</h2>
            <p>
              (1) Beide Parteien beachten die geltenden datenschutzrechtlichen Vorschriften, insbesondere die DSGVO und das BDSG.
            </p>
            <p>
              (2) Soweit der Anbieter personenbezogene Daten im Auftrag des Kunden verarbeitet &ndash; insbesondere im Rahmen von Hosting sowie bei der Verarbeitung von &uuml;ber Kontaktformulare eingehenden Daten &ndash; schlie&szlig;en die Parteien einen Vertrag zur Auftragsverarbeitung gem&auml;&szlig; Art.&nbsp;28 DSGVO. Dieser ist Bestandteil des Vertrages.
            </p>
            <p>
              (3) Der Kunde erteilt dem Anbieter eine allgemeine Genehmigung zum Einsatz von Unterauftragsverarbeitern. Die eingesetzten Unterauftragsverarbeiter sind im Vertrag zur Auftragsverarbeitung benannt; hierzu z&auml;hlen insbesondere Anbieter von Infrastruktur- und Hostingleistungen mit Sitz au&szlig;erhalb der Europ&auml;ischen Union. Die &Uuml;bermittlung erfolgt auf Grundlage der Standardvertragsklauseln beziehungsweise eines anerkannten Angemessenheitsbeschlusses. Der Anbieter informiert den Kunden in Textform &uuml;ber beabsichtigte &Auml;nderungen; der Kunde kann aus datenschutzrechtlichen Gr&uuml;nden widersprechen.
            </p>
            <p>
              (4) Der Kunde ist f&uuml;r die auf seiner Webseite eingesetzten Funktionen und eingebundenen Dienste Dritter datenschutzrechtlich Verantwortlicher im Sinne des Art.&nbsp;4 Nr.&nbsp;7 DSGVO. Er ist verpflichtet, die Datenschutzerkl&auml;rung seiner Webseite aktuell zu halten und die eingesetzten Dienste sowie Drittland&uuml;bermittlungen dort auszuweisen.
            </p>
            <p>
              (5) Der Kunde willigt widerruflich ein, dass der Anbieter ihn im Rahmen des Vertragsverh&auml;ltnisses per E-Mail und Telefon kontaktiert.
            </p>

            <h2 style={h2}>&sect;15 Preisanpassung</h2>
            <p>
              (1) Der Anbieter ist berechtigt, die monatliche Verg&uuml;tung fr&uuml;hestens nach Ablauf der Mindestvertragslaufzeit mit einer Ank&uuml;ndigungsfrist von zwei Monaten in Textform anzupassen, soweit sich die Kosten der Leistungserbringung, insbesondere Infrastruktur-, Lizenz- und Personalkosten, ver&auml;ndert haben.
            </p>
            <p>
              (2) &Uuml;bersteigt die Erh&ouml;hung f&uuml;nf Prozent der bisherigen monatlichen Verg&uuml;tung, steht dem Kunden ein Sonderk&uuml;ndigungsrecht zum Zeitpunkt des Wirksamwerdens der Erh&ouml;hung zu. Die K&uuml;ndigung ist innerhalb von vier Wochen nach Zugang der Ank&uuml;ndigung in Textform zu erkl&auml;ren.
            </p>
            <p>
              (3) Kosten&uuml;bernahmen zugunsten des Kunden, die auf gestiegenen Fremdkosten beruhen, sind nicht geschuldet.
            </p>

            <h2 style={h2}>&sect;16 Schlussbestimmungen</h2>
            <p>
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.
            </p>
            <p>
              (2) Ausschlie&szlig;licher Gerichtsstand f&uuml;r alle Streitigkeiten aus und im Zusammenhang mit diesem Vertrag ist Berlin, soweit der Kunde Kaufmann, juristische Person des &ouml;ffentlichen Rechts oder &ouml;ffentlich-rechtliches Sonderverm&ouml;gen ist. Der Anbieter ist berechtigt, auch am allgemeinen Gerichtsstand des Kunden zu klagen.
            </p>
            <p>
              (3) Erf&uuml;llungsort ist der Sitz des Anbieters.
            </p>
            <p>
              (4) Der Anbieter ist berechtigt, den Kunden unter Nennung des Namens und des Logos sowie unter Abbildung des erstellten Webauftritts als Referenz zu benennen. Der Kunde kann dem jederzeit in Textform widersprechen.
            </p>
            <p>
              (5) Der Anbieter ist berechtigt, seine Rechte und Pflichten aus diesem Vertrag ganz oder teilweise auf ein verbundenes Unternehmen oder einen Rechtsnachfolger zu &uuml;bertragen. Der Kunde wird hier&uuml;ber in Textform informiert.
            </p>
            <p>
              (6) Individuelle Vereinbarungen zwischen den Parteien haben Vorrang vor diesen AGB. Abweichungen bed&uuml;rfen der Textform.
            </p>
            <p>
              (7) Sollten einzelne Bestimmungen dieser AGB ganz oder teilweise unwirksam sein oder werden, bleibt die Wirksamkeit der &uuml;brigen Bestimmungen unber&uuml;hrt.
            </p>

            <p style={{ marginTop: 48, color: "var(--ink-soft)", fontSize: 14 }}>
              Fassung 1.1 &ndash; Stand: August 2026 &ndash; Content-Leads Solutions UG (haftungsbeschr&auml;nkt)
            </p>
          </div>
        </div>
      </article>

      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>&copy; 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> &middot; <Link href="/datenschutz">Datenschutz</Link> &middot; <Link href="/agb">AGB</Link></span>
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
