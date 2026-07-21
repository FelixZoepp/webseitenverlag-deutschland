/**
 * Phase 4 (§5.2) — Aspekt-Prüfung für Kunden-Uploads.
 *
 * Ein Kunden-Bild wird nur Slots zugeordnet, deren Seitenverhältnis es
 * bedienen kann. Passt das Verhältnis nicht, gibt es einen konkreten
 * Auto-Crop-Vorschlag (zentrierter Ausschnitt in Pixeln), den der Kunde
 * bestätigen kann — nie stilles Verzerren.
 */

export interface SlotAspekt {
  /** szene_typ in der Asset-Bank / Slot-Familie im Editor */
  slot: string
  label: string
  /** Ziel-Seitenverhältnis (Breite / Höhe) */
  ratio: number
  /** erlaubte Abweichung (relativ), innerhalb derer KEIN Crop nötig ist */
  toleranz: number
}

/** Slot-Familien mit Ziel-Aspekt — Config statt Hardcode (§0). */
export const SLOT_ASPEKTE: SlotAspekt[] = [
  { slot: 'hero', label: 'Hero-Bild (Querformat)', ratio: 16 / 9, toleranz: 0.2 },
  { slot: 'galerie', label: 'Galerie-Bild', ratio: 4 / 3, toleranz: 0.35 },
  { slot: 'detail', label: 'Detail-/Inhaltsbild', ratio: 4 / 3, toleranz: 0.45 },
  { slot: 'team', label: 'Team-/Porträtbild', ratio: 1, toleranz: 0.35 },
]

export interface CropVorschlag {
  slot: string
  label: string
  /** Zentrierter Ausschnitt in Pixeln (für sharp.extract) */
  crop: { left: number; top: number; width: number; height: number }
}

export interface AspektErgebnis {
  breite: number
  hoehe: number
  /** z. B. "16:9" gerundet */
  aspectRatio: string
  /** Slots, die das Bild OHNE Crop bedienen kann */
  kompatibleSlots: string[]
  /** Für alle anderen Slots: konkreter zentrierter Crop-Vorschlag */
  cropVorschlaege: CropVorschlag[]
}

function kuerzeVerhaeltnis(breite: number, hoehe: number): string {
  const r = breite / hoehe
  const bekannte: [string, number][] = [
    ['16:9', 16 / 9], ['3:2', 3 / 2], ['4:3', 4 / 3], ['1:1', 1],
    ['3:4', 3 / 4], ['2:3', 2 / 3], ['9:16', 9 / 16],
  ]
  for (const [name, wert] of bekannte) {
    if (Math.abs(r - wert) / wert < 0.05) return name
  }
  return `${Math.round(r * 100) / 100}:1`
}

/** Zentrierten Crop auf das Ziel-Verhältnis berechnen (nie hochskalieren). */
export function zentrierterCrop(
  breite: number,
  hoehe: number,
  zielRatio: number
): { left: number; top: number; width: number; height: number } {
  const ist = breite / hoehe
  if (ist > zielRatio) {
    // zu breit → links/rechts beschneiden
    const neueBreite = Math.round(hoehe * zielRatio)
    return { left: Math.floor((breite - neueBreite) / 2), top: 0, width: neueBreite, height: hoehe }
  }
  // zu hoch → oben/unten beschneiden
  const neueHoehe = Math.round(breite / zielRatio)
  return { left: 0, top: Math.floor((hoehe - neueHoehe) / 2), width: breite, height: neueHoehe }
}

/**
 * Prüft ein Bild gegen alle Slot-Familien: kompatible Slots ohne Crop,
 * Auto-Crop-Vorschlag für alle übrigen (§5.2: "Aspect-Check mit
 * Auto-Crop-Vorschlag").
 */
export function pruefeAspekt(breite: number, hoehe: number): AspektErgebnis {
  const ist = breite / hoehe
  const kompatibleSlots: string[] = []
  const cropVorschlaege: CropVorschlag[] = []

  for (const s of SLOT_ASPEKTE) {
    if (Math.abs(ist - s.ratio) / s.ratio <= s.toleranz) {
      kompatibleSlots.push(s.slot)
    } else {
      cropVorschlaege.push({ slot: s.slot, label: s.label, crop: zentrierterCrop(breite, hoehe, s.ratio) })
    }
  }

  return { breite, hoehe, aspectRatio: kuerzeVerhaeltnis(breite, hoehe), kompatibleSlots, cropVorschlaege }
}
