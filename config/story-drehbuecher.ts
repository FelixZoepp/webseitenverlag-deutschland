/**
 * Premium-Scroll: 5-Akt-Story-Drehbücher je Branche (MASTER_REVIEW Kap. 3.4).
 * NUR Text — keine Generierung. Die Fabrik nutzt die Akte später als
 * Drehbuch für die Frame-Sequenz (Higgsfield-Video → Canvas-Scrub).
 *
 * Konvention: je Akt ein Name (1–2 Worte, wie „Koch: Zutaten → Vorbereitung →
 * Feuer → Anrichten → Genuss") und genau EIN Satz Erzähltext.
 * Gesundheits-Branchen (HWG): keine Heilversprechen, keine
 * Vorher/Nachher-Behandlungsdarstellung — Story = Praxis-Erlebnis, nicht Befund.
 */

export interface StoryAkt {
  name: string
  satz: string
}

export interface StoryDrehbuch {
  /** branchen_profile.branche_key bzw. Flagship-Key */
  branche_key: string
  /** Kurzformel der Story, z. B. „Zutaten → … → Genuss" */
  formel: string
  akte: readonly [StoryAkt, StoryAkt, StoryAkt, StoryAkt, StoryAkt]
}

export const STORY_DREHBUECHER: readonly StoryDrehbuch[] = [
  // Referenz-Story (Premium-Scroll-Prototyp, Kap. 3.4): Hang-Verwandlung
  {
    branche_key: 'galabau',
    formel: 'Wildwuchs → Plan → Erdarbeiten → Bepflanzung → Gartenabend',
    akte: [
      { name: 'Wildwuchs', satz: 'Ein verwilderter Hang, den seit Jahren niemand mehr betreten will.' },
      { name: 'Plan', satz: 'Auf dem Papier entstehen Terrassen, Wege und ein Platz zum Ankommen.' },
      { name: 'Erdarbeiten', satz: 'Bagger und Hände formen aus dem Hang Stufen, Mauern und Beete.' },
      { name: 'Bepflanzung', satz: 'Stauden, Gräser und junge Bäume ziehen ein und geben dem Garten sein Gesicht.' },
      { name: 'Gartenabend', satz: 'Am Abend sitzen die Besitzer das erste Mal dort, wo vorher nur Gestrüpp war.' },
    ],
  },
  // Handwerk & Bau
  {
    branche_key: 'maler',
    formel: 'Rohbau → Vorbereitung → Grundierung → Anstrich → Einzug',
    akte: [
      { name: 'Rohbau', satz: 'Kahle Wände, Risse und der Geruch von Baustelle.' },
      { name: 'Vorbereitung', satz: 'Abkleben, abdecken, spachteln — die Fläche wird bereit gemacht.' },
      { name: 'Grundierung', satz: 'Die erste Schicht legt sich gleichmäßig über jede Unebenheit.' },
      { name: 'Anstrich', satz: 'Mit jeder Bahn der Rolle bekommt der Raum seine Farbe und Tiefe.' },
      { name: 'Einzug', satz: 'Das Licht fällt auf makellose Wände, und aus der Baustelle ist ein Zuhause geworden.' },
    ],
  },
  {
    branche_key: 'dachdecker',
    formel: 'Altdach → Gerüst → Dämmung → Eindeckung → Abendlicht',
    akte: [
      { name: 'Altdach', satz: 'Verrutschte Ziegel und feuchte Flecken erzählen von zu vielen Wintern.' },
      { name: 'Gerüst', satz: 'Das Gerüst steht, die alte Eindeckung verschwindet Bahn für Bahn.' },
      { name: 'Dämmung', satz: 'Neue Lattung und Dämmung machen aus dem Dachstuhl eine warme Hülle.' },
      { name: 'Eindeckung', satz: 'Ziegel für Ziegel wächst die neue Fläche in sauberen Reihen.' },
      { name: 'Abendlicht', satz: 'In der tiefen Sonne glänzt das fertige Dach — dicht für die nächsten Jahrzehnte.' },
    ],
  },
  // Reinigung & Facility
  {
    branche_key: 'reinigung',
    formel: 'Spuren → Anrücken → System → Detail → Morgenglanz',
    akte: [
      { name: 'Spuren', satz: 'Nach der langen Woche haben Böden, Scheiben und Küchen ihre Spuren.' },
      { name: 'Anrücken', satz: 'Das Objektteam kommt mit Plan, Maschinen und festen Handgriffen.' },
      { name: 'System', satz: 'Zone für Zone verschwinden Schmutz und Staub in klarer Reihenfolge.' },
      { name: 'Detail', satz: 'Kanten, Griffe und Glasflächen bekommen den letzten prüfenden Blick.' },
      { name: 'Morgenglanz', satz: 'Am Morgen öffnet das Büro streifenfrei — als wäre nie jemand hier gewesen.' },
    ],
  },
  {
    branche_key: 'hausmeisterservice',
    formel: 'Vernachlässigt → Rundgang → Reparatur → Pflege → Gepflegt',
    akte: [
      { name: 'Vernachlässigt', satz: 'Eine klemmende Tür, flackerndes Licht, wucherndes Grün — das Objekt braucht eine Hand.' },
      { name: 'Rundgang', satz: 'Beim Rundgang wird jede Kleinigkeit notiert, die sonst niemand sieht.' },
      { name: 'Reparatur', satz: 'Werkzeugkoffer auf: was klemmt, tropft oder wackelt, wird in Ordnung gebracht.' },
      { name: 'Pflege', satz: 'Grünschnitt, Treppenhaus und Außenanlage bekommen ihren festen Rhythmus.' },
      { name: 'Gepflegt', satz: 'Bewohner und Verwaltung merken vor allem eines: es funktioniert einfach alles.' },
    ],
  },
  // Gastro & Genuss
  {
    branche_key: 'restaurant_italienisch',
    formel: 'Zutaten → Vorbereitung → Feuer → Anrichten → Genuss',
    akte: [
      { name: 'Zutaten', satz: 'Tomaten, Basilikum und frische Pasta liegen bereit wie auf dem Markt in Italien.' },
      { name: 'Vorbereitung', satz: 'In der Küche wird geschnitten, geknetet und abgeschmeckt wie zu Hause bei Nonna.' },
      { name: 'Feuer', satz: 'Am Herd zischt das Olivenöl, und der Duft zieht durch das ganze Haus.' },
      { name: 'Anrichten', satz: 'Jeder Teller wird angerichtet, als wäre er der einzige des Abends.' },
      { name: 'Genuss', satz: 'Am Tisch wird es still — für genau diesen ersten Bissen kocht die Familie.' },
    ],
  },
  {
    branche_key: 'cafe',
    formel: 'Backstube → Teig → Ofen → Verzieren → Kaffeetafel',
    akte: [
      { name: 'Backstube', satz: 'Früh am Morgen stehen Mehl, Butter und Eier bereit, wenn die Stadt noch schläft.' },
      { name: 'Teig', satz: 'Aus wenigen Zutaten entsteht ein Teig, der nach Handwerk und Geduld verlangt.' },
      { name: 'Ofen', satz: 'Hinter der Ofenscheibe gehen Tortenböden auf und füllen das Café mit Duft.' },
      { name: 'Verzieren', satz: 'Creme, Früchte und ruhige Hände machen aus dem Boden ein kleines Kunstwerk.' },
      { name: 'Kaffeetafel', satz: 'Zum frisch gebrühten Kaffee kommt das erste Stück auf den Teller — hausgemacht bis zur Gabel.' },
    ],
  },
  // Beauty & Wellness
  {
    branche_key: 'friseur',
    formel: 'Alltag → Beratung → Farbe → Styling → Auftritt',
    akte: [
      { name: 'Alltag', satz: 'Der Zopf vom Morgen und die Frage: was wäre eigentlich möglich?' },
      { name: 'Beratung', satz: 'Im Gespräch entsteht der Look, der wirklich zu Gesicht und Alltag passt.' },
      { name: 'Farbe', satz: 'Strähne für Strähne setzt die Balayage Licht ins Haar.' },
      { name: 'Styling', satz: 'Schnitt und Föhn geben der neuen Form ihren Schwung.' },
      { name: 'Auftritt', satz: 'Der Blick in den Spiegel — und das Lächeln, für das dieser Beruf gemacht ist.' },
    ],
  },
  {
    branche_key: 'kosmetikstudio',
    formel: 'Ankommen → Analyse → Behandlung → Pflege → Strahlen',
    akte: [
      { name: 'Ankommen', satz: 'Die Tür geht zu, der Alltag bleibt draußen — eine Stunde nur für die Haut.' },
      { name: 'Analyse', satz: 'Die Hautanalyse zeigt, was die Haut jetzt wirklich braucht.' },
      { name: 'Behandlung', satz: 'In ruhigen Handgriffen folgt die Behandlung Schritt für Schritt dem Plan.' },
      { name: 'Pflege', satz: 'Abgestimmte Pflege versiegelt das Ergebnis für die Tage danach.' },
      { name: 'Strahlen', satz: 'Entspannt, gepflegt und mit frischem Teint zurück in den Tag.' },
    ],
  },
  // Gesundheit & Praxis (HWG: Praxis-Erlebnis statt Behandlungs-Verwandlung)
  {
    branche_key: 'zahnarzt',
    formel: 'Empfang → Gespräch → Praxis → Prophylaxe → Verabschiedung',
    akte: [
      { name: 'Empfang', satz: 'Ein freundlicher Empfang und kurze Wege nehmen den Praxisbesuch die Schwere.' },
      { name: 'Gespräch', satz: 'Erst wird zugehört und erklärt — verständlich, ohne Fachchinesisch.' },
      { name: 'Praxis', satz: 'Moderne, ruhige Behandlungsräume mit Technik auf aktuellem Stand.' },
      { name: 'Prophylaxe', satz: 'Das Prophylaxe-Team kümmert sich gründlich und mit viel Fingerspitzengefühl.' },
      { name: 'Verabschiedung', satz: 'Mit Termin für die nächste Kontrolle geht es entspannt zurück in den Tag.' },
    ],
  },
  {
    branche_key: 'physiotherapie',
    formel: 'Ankommen → Befund → Übung → Therapie → Alltag',
    akte: [
      { name: 'Ankommen', satz: 'Mit Rezept oder als Selbstzahler — der erste Schritt in die Praxis ist unkompliziert.' },
      { name: 'Befund', satz: 'Im Befundgespräch wird geklärt, wo es hakt und was das Ziel ist.' },
      { name: 'Übung', satz: 'Unter Anleitung entstehen Übungen, die zum eigenen Körper und Alltag passen.' },
      { name: 'Therapie', satz: 'Manuelle Therapie und Training greifen in jeder Einheit ineinander.' },
      { name: 'Alltag', satz: 'Mit einem klaren Übungsplan geht es zurück in Beruf, Sport und Alltag.' },
    ],
  },
  // Auto & Mobilität
  {
    branche_key: 'kfz_werkstatt',
    formel: 'Warnleuchte → Diagnose → Bühne → Endkontrolle → Übergabe',
    akte: [
      { name: 'Warnleuchte', satz: 'Ein Leuchten im Cockpit, ein Geräusch beim Bremsen — das Auto meldet sich.' },
      { name: 'Diagnose', satz: 'Am Tester zeigt sich schwarz auf weiß, was wirklich gemacht werden muss.' },
      { name: 'Bühne', satz: 'Auf der Hebebühne wird repariert — zum vorher genannten Festpreis.' },
      { name: 'Endkontrolle', satz: 'Probefahrt und Endkontrolle stellen sicher, dass alles sitzt.' },
      { name: 'Übergabe', satz: 'Schlüsselübergabe mit klarer Rechnung — und ein Auto, das wieder einfach fährt.' },
    ],
  },
  {
    branche_key: 'autoaufbereitung',
    formel: 'Gebraucht → Innenraum → Politur → Versiegelung → Showroom',
    akte: [
      { name: 'Gebraucht', satz: 'Jahre auf der Straße haben im Lack und im Innenraum ihre Spuren hinterlassen.' },
      { name: 'Innenraum', satz: 'Sitze, Teppiche und Ritzen werden bis in die letzte Ecke gereinigt.' },
      { name: 'Politur', satz: 'Schicht für Schicht holt die Politur die Tiefe zurück in den Lack.' },
      { name: 'Versiegelung', satz: 'Die Keramikversiegelung legt sich wie ein Schutzschild über das Ergebnis.' },
      { name: 'Showroom', satz: 'Am Ende steht da ein Auto, das aussieht, als würde es gerade vom Hof des Händlers rollen.' },
    ],
  },
  // Dienstleistung & Beratung
  {
    branche_key: 'umzugsunternehmen',
    formel: 'Kartons → Plan → Verladen → Transport → Ankommen',
    akte: [
      { name: 'Kartons', satz: 'Ein ganzes Leben in Kisten — und die Frage, wie das alles umziehen soll.' },
      { name: 'Plan', satz: 'Nach der Besichtigung stehen Festpreis, Termin und Halteverbotszone fest.' },
      { name: 'Verladen', satz: 'Das Team verpackt, trägt und verlädt, als hätte es nie etwas anderes getan.' },
      { name: 'Transport', satz: 'Sicher verzurrt geht die gesamte Einrichtung auf die Reise.' },
      { name: 'Ankommen', satz: 'Am Abend steht das Sofa im neuen Wohnzimmer — angekommen, ohne einen Kratzer.' },
    ],
  },
  {
    branche_key: 'fotograf',
    formel: 'Leinwand → Licht → Shooting → Auswahl → Bild',
    akte: [
      { name: 'Leinwand', satz: 'Ein leeres Studio, ein grauer Hintergrund — noch ist alles möglich.' },
      { name: 'Licht', satz: 'Softbox für Softbox entsteht das Licht, das Gesichter ehrlich schmeichelt.' },
      { name: 'Shooting', satz: 'Vor der Kamera fällt die Anspannung ab, und echte Momente entstehen.' },
      { name: 'Auswahl', satz: 'Gemeinsam werden aus hundert Auslösungen die Bilder, die bleiben.' },
      { name: 'Bild', satz: 'Am Ende hängt da ein Porträt, das mehr erzählt als jeder Lebenslauf.' },
    ],
  },
  // Fitness & Coaching
  {
    branche_key: 'fitnessstudio',
    formel: 'Erster Schritt → Plan → Training → Betreuung → Fortschritt',
    akte: [
      { name: 'Erster Schritt', satz: 'Der schwerste Satz ist der erste Schritt durch die Studiotür.' },
      { name: 'Plan', satz: 'Aus dem Eingangsgespräch entsteht ein Trainingsplan statt eines Vertragswerks.' },
      { name: 'Training', satz: 'An Geräten und in Kursen findet jeder sein Tempo — vom Einsteiger bis zum Wettkämpfer.' },
      { name: 'Betreuung', satz: 'Trainer korrigieren, motivieren und passen den Plan an, wenn es leichter wird.' },
      { name: 'Fortschritt', satz: 'Ein paar Wochen später trägt man die Kiste Wasser einhändig — und merkt es erst hinterher.' },
    ],
  },
  {
    branche_key: 'personal_training',
    formel: 'Standort → Ziel → Session → Alltag → Körpergefühl',
    akte: [
      { name: 'Standort', satz: 'Die Erstanalyse zeigt ehrlich, wo Kraft, Haltung und Ausdauer heute stehen.' },
      { name: 'Ziel', satz: 'Gemeinsam wird ein Ziel definiert, das fordert, aber in den Alltag passt.' },
      { name: 'Session', satz: 'Im 1:1-Training zählt jede Wiederholung, weil jemand genau hinschaut.' },
      { name: 'Alltag', satz: 'Ernährung und kleine Routinen tragen das Training in die restliche Woche.' },
      { name: 'Körpergefühl', satz: 'Irgendwann ist es kein Programm mehr, sondern ein neues Körpergefühl.' },
    ],
  },
] as const

export function storyDrehbuch(brancheKey: string): StoryDrehbuch | undefined {
  return STORY_DREHBUECHER.find((s) => s.branche_key === brancheKey)
}
