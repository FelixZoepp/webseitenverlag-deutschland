/**
 * Orts-Konsistenz (MVP_FINISH_PROMPT §4.3):
 * Top-200 deutsche Städte als Blockliste. Auf einer generierten Seite darf
 * KEINE fremde Stadt auftauchen — nur die Kundenstadt (und deren Bestandteile).
 *
 * Matching-Regeln:
 *  - Wortgrenzen (Unicode): "Halle" matcht nicht in "Hallenbad".
 *  - Kundenstadt + alle ihre Namensbestandteile sind erlaubt
 *    ("Frankfurt am Main" erlaubt "Frankfurt"; "Halle (Saale)" erlaubt "Halle").
 *  - Mehrdeutige Namensteile, die auch normale deutsche Wörter sind
 *    ("oder", "essen", "halle", …), matchen nur case-sensitiv — sonst würde
 *    jede Konjunktion "oder" als Frankfurt (Oder) gewertet.
 */

/** Top-200 deutsche Städte nach Einwohnern (Stand: Destatis, gerundet) */
export const TOP_200_STAEDTE: string[] = [
  'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt am Main', 'Stuttgart',
  'Düsseldorf', 'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden',
  'Hannover', 'Nürnberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld',
  'Bonn', 'Münster', 'Mannheim', 'Karlsruhe', 'Augsburg', 'Wiesbaden',
  'Mönchengladbach', 'Gelsenkirchen', 'Aachen', 'Braunschweig', 'Chemnitz',
  'Kiel', 'Halle (Saale)', 'Magdeburg', 'Freiburg im Breisgau', 'Krefeld',
  'Mainz', 'Lübeck', 'Erfurt', 'Oberhausen', 'Rostock', 'Kassel',
  'Hagen', 'Potsdam', 'Saarbrücken', 'Hamm', 'Ludwigshafen am Rhein',
  'Mülheim an der Ruhr', 'Oldenburg', 'Osnabrück', 'Leverkusen', 'Darmstadt',
  'Heidelberg', 'Solingen', 'Regensburg', 'Herne', 'Paderborn', 'Neuss',
  'Ingolstadt', 'Offenbach am Main', 'Fürth', 'Ulm', 'Heilbronn', 'Pforzheim',
  'Würzburg', 'Wolfsburg', 'Göttingen', 'Bottrop', 'Reutlingen', 'Koblenz',
  'Erlangen', 'Bremerhaven', 'Remscheid', 'Bergisch Gladbach', 'Recklinghausen',
  'Trier', 'Jena', 'Moers', 'Salzgitter', 'Siegen', 'Gütersloh', 'Hildesheim',
  'Hanau', 'Kaiserslautern', 'Cottbus', 'Schwerin', 'Witten', 'Gera',
  'Ludwigsburg', 'Esslingen am Neckar', 'Iserlohn', 'Düren', 'Tübingen',
  'Zwickau', 'Flensburg', 'Gießen', 'Ratingen', 'Lünen', 'Villingen-Schwenningen',
  'Konstanz', 'Marl', 'Worms', 'Velbert', 'Minden', 'Neumünster', 'Dessau-Roßlau',
  'Norderstedt', 'Delmenhorst', 'Bamberg', 'Viersen', 'Marburg', 'Rheine',
  'Lüneburg', 'Wilhelmshaven', 'Gladbeck', 'Troisdorf', 'Dorsten', 'Detmold',
  'Bayreuth', 'Castrop-Rauxel', 'Landshut', 'Brandenburg an der Havel',
  'Arnsberg', 'Aschaffenburg', 'Bocholt', 'Celle', 'Lüdenscheid', 'Kempten',
  'Fulda', 'Aalen', 'Dinslaken', 'Lippstadt', 'Herford', 'Kerpen', 'Weimar',
  'Neuwied', 'Dormagen', 'Sindelfingen', 'Plauen', 'Rosenheim', 'Grevenbroich',
  'Neubrandenburg', 'Herten', 'Schwäbisch Gmünd', 'Bergheim', 'Friedrichshafen',
  'Garbsen', 'Hürth', 'Offenburg', 'Wesel', 'Greifswald', 'Göppingen',
  'Stralsund', 'Unna', 'Euskirchen', 'Langenfeld', 'Frankfurt (Oder)',
  'Hameln', 'Görlitz', 'Meerbusch', 'Sankt Augustin', 'Baden-Baden',
  'Bad Salzuflen', 'Waiblingen', 'Hattingen', 'Bad Homburg vor der Höhe',
  'Pulheim', 'Lingen', 'Eschweiler', 'Langenhagen', 'Nordhorn', 'Neustadt an der Weinstraße',
  'Ahlen', 'Wolfenbüttel', 'Frechen', 'Passau', 'Bad Oeynhausen', 'Ibbenbüren',
  'Gummersbach', 'Kleve', 'Speyer', 'Emden', 'Erftstadt', 'Rastatt',
  'Löhne', 'Peine', 'Elmshorn', 'Cuxhaven', 'Goslar', 'Rheda-Wiedenbrück',
  'Bad Kreuznach', 'Heidenheim an der Brenz', 'Hilden', 'Sankt Ingbert',
  'Bergkamen', 'Frankenthal', 'Schweinfurt', 'Böblingen', 'Stolberg',
  'Bünde', 'Neu-Ulm', 'Gotha', 'Freising', 'Hof', 'Straubing', 'Leonberg',
  'Memmingen', 'Dachau', 'Eisenach', 'Landau in der Pfalz',
]

/** Zerlegt einen Stadtnamen in erlaubte Bestandteile (inkl. Volltext) */
export function stadtBestandteile(stadt: string): string[] {
  const teile = new Set<string>()
  const bereinigt = stadt.trim()
  if (!bereinigt) return []
  teile.add(bereinigt.toLowerCase())
  // Bestandteile: "Frankfurt am Main" → Frankfurt, Main; "Halle (Saale)" → Halle, Saale
  for (const wort of bereinigt.split(/[\s()\-–/]+/)) {
    const w = wort.trim().toLowerCase()
    // Füllwörter nicht als eigenständige Erlaubnis werten
    if (w.length >= 3 && !['am', 'an', 'der', 'die', 'das', 'im', 'bei', 'vor', 'auf'].includes(w)) {
      teile.add(w)
    }
  }
  return Array.from(teile)
}

/** Escape für RegExp-Sonderzeichen im Stadtnamen */
function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Stadtnamen(-teile), die auch normale deutsche Wörter sind. Diese matchen
 * nur case-sensitiv (großgeschrieben), damit z. B. die Konjunktion "oder"
 * nicht als Frankfurt (Oder) und "im hof" nicht als Hof gewertet wird.
 */
const MEHRDEUTIGE_WOERTER = new Set(['oder', 'essen', 'halle', 'hof', 'löhne', 'bünde'])

/**
 * Findet fremde Städte aus der Top-200-Blockliste in einem Text.
 * Die Kundenstadt (und ihre Namensbestandteile) ist ausgenommen.
 *
 * @returns eindeutige Liste gefundener fremder Städte (leer = konsistent)
 */
export function findeFremdeStaedte(text: string, kundenstadt: string): string[] {
  const erlaubt = new Set(stadtBestandteile(kundenstadt))
  const funde = new Set<string>()

  for (const stadt of TOP_200_STAEDTE) {
    // Jeder Bestandteil der Blocklisten-Stadt, der auch Bestandteil der
    // Kundenstadt ist, macht die Stadt unproblematisch (Frankfurt am Main ↔ Frankfurt (Oder))
    const bestandteile = stadtBestandteile(stadt)
    if (bestandteile.some((b) => erlaubt.has(b))) continue

    // Kernname (erster Bestandteil nach dem Volltext) reicht fürs Matching:
    // "Halle (Saale)" soll auch als "Halle" gefunden werden.
    const kandidaten = Array.from(new Set<string>([stadt, ...bestandteile.filter((b) => b.length >= 4)]))
    for (const kandidat of kandidaten) {
      // Mehrdeutige Wörter nur case-sensitiv (großgeschrieben) matchen
      const mehrdeutig = MEHRDEUTIGE_WOERTER.has(kandidat.toLowerCase())
      const muster = mehrdeutig
        ? kandidat.charAt(0).toUpperCase() + kandidat.slice(1).toLowerCase()
        : kandidat
      const re = new RegExp(
        `(?<![\\p{L}\\p{N}-])${escapeRegex(muster)}(?![\\p{L}\\p{N}-])`,
        mehrdeutig ? 'u' : 'iu'
      )
      if (re.test(text)) {
        funde.add(stadt)
        break
      }
    }
  }

  return Array.from(funde)
}
