/**
 * Floskel-Blacklist (Mission §2 Quality-Gate)
 *
 * Generische Website-Phrasen, die auf keiner generierten Seite landen dürfen.
 * Wird geprüft: beim Library-Seeding (scripts/seed-library.ts --check) und
 * ab Phase D in der Generierungs-Pipeline (Texte vor dem Speichern prüfen).
 */

export const FLOSKEL_BLACKLIST: string[] = [
  'Willkommen bei',
  'Willkommen auf unserer',
  'Herzlich willkommen',
  'Ihr zuverlässiger Partner',
  'Ihr kompetenter Partner',
  'Ihr starker Partner',
  'Ihr Partner für',
  'Qualität aus einer Hand',
  'alles aus einer Hand',
  'Wir über uns',
  'Ihre Zufriedenheit ist unser',
  'der Kunde ist König',
  'Kundenzufriedenheit steht bei uns',
  'seit vielen Jahren erfolgreich',
  'langjährige Erfahrung', // ohne konkrete Zahl wertlos — "seit 1998" ist erlaubt
  'kompetent und zuverlässig',
  'schnell und zuverlässig',
  'freundlich und kompetent',
  'Wir freuen uns auf Ihren Besuch',
  'Überzeugen Sie sich selbst',
  'Lassen Sie sich überraschen',
  'maßgeschneiderte Lösungen',
  'individuelle Lösungen für',
  'rundum sorglos',
  'Rundum-sorglos-Paket',
  'Tradition und Moderne',
  'Tradition trifft Moderne',
  'Bei uns sind Sie richtig',
  'Sie haben Fragen?',
  'Zögern Sie nicht',
  'gerne beraten wir Sie',
  'Wir beraten Sie gerne',
]

/**
 * Findet Floskeln in einem Text (case-insensitiv).
 * @returns Liste der gefundenen Blacklist-Einträge (leer = sauber)
 */
export function findeFloskeln(text: string): string[] {
  const lower = text.toLowerCase()
  return FLOSKEL_BLACKLIST.filter((floskel) => lower.includes(floskel.toLowerCase()))
}

/**
 * Prüft ein beliebig verschachteltes Content-Objekt (jsonb) auf Floskeln.
 * @returns Fundstellen als { pfad, floskel }
 */
export function pruefeContentAufFloskeln(
  content: unknown,
  pfad = ''
): { pfad: string; floskel: string }[] {
  const funde: { pfad: string; floskel: string }[] = []
  if (typeof content === 'string') {
    for (const floskel of findeFloskeln(content)) {
      funde.push({ pfad: pfad || '(root)', floskel })
    }
  } else if (Array.isArray(content)) {
    content.forEach((item, i) => {
      funde.push(...pruefeContentAufFloskeln(item, `${pfad}[${i}]`))
    })
  } else if (content && typeof content === 'object') {
    for (const [k, v] of Object.entries(content as Record<string, unknown>)) {
      funde.push(...pruefeContentAufFloskeln(v, pfad ? `${pfad}.${k}` : k))
    }
  }
  return funde
}
