/**
 * Fertigstellungs-Wizard (§10.1) — Schritt-Definitionen + Fortschritt.
 *
 * Der Wizard blockiert NIE: jeder Schritt ist überspringbar/vertagbar,
 * der Blocker-Banner bleibt nur sichtbar, bis alles erledigt ist.
 * Zustand liegt in sites.wizard_status (jsonb, additiv Migration 019).
 */

export type WizardSchrittKey = 'pflichtangaben' | 'logo' | 'fakten' | 'domain' | 'seo_plan'
export type WizardSchrittStatus = 'offen' | 'erledigt' | 'uebersprungen' | 'vertagt'

export interface WizardSchritt {
  key: WizardSchrittKey
  titel: string
  beschreibung: string
  /** Pflicht für "Website fertigstellen"? (überspringbar ≠ pflichtfrei) */
  pflicht: boolean
}

export const WIZARD_SCHRITTE: WizardSchritt[] = [
  {
    key: 'pflichtangaben',
    titel: 'Impressum & Pflichtangaben',
    beschreibung: 'Kurzes Formular — daraus entstehen Impressum und Datenschutzerklärung automatisch.',
    pflicht: true,
  },
  {
    key: 'logo',
    titel: 'Logo & eigene Fotos',
    beschreibung: 'Optional: Logo hochladen und eigene Fotos ergänzen. Ohne Logo wird der Firmenname als Schriftzug gesetzt.',
    pflicht: false,
  },
  {
    key: 'fakten',
    titel: 'Fakten-Check',
    beschreibung: 'Leistungen, Öffnungszeiten und Telefonnummer einmal bestätigen oder korrigieren.',
    pflicht: true,
  },
  {
    key: 'domain',
    titel: 'Eigene Domain',
    beschreibung: 'Wunsch-Domain angeben — die Verbindung übernehmen wir. Bis dahin läuft Ihre Website nahtlos unter unserer Adresse weiter.',
    pflicht: false,
  },
  {
    key: 'seo_plan',
    titel: 'Sichtbarkeit',
    beschreibung: 'Optional: SEO-Plan für mehr Google-Sichtbarkeit — transparent, jederzeit überspringbar.',
    pflicht: false,
  },
]

export type WizardStatus = Partial<Record<WizardSchrittKey, WizardSchrittStatus>>

export function schrittStatus(status: WizardStatus | null | undefined, key: WizardSchrittKey): WizardSchrittStatus {
  return (status && status[key]) || 'offen'
}

/** Anzahl abgehakter Schritte (erledigt/übersprungen/vertagt zählen als bearbeitet). */
export function wizardFortschritt(status: WizardStatus | null | undefined): { bearbeitet: number; gesamt: number } {
  const bearbeitet = WIZARD_SCHRITTE.filter((s) => schrittStatus(status, s.key) !== 'offen').length
  return { bearbeitet, gesamt: WIZARD_SCHRITTE.length }
}

/** Pflicht-Schritte, die noch offen sind — nur die blockieren das Fertigstellen. */
export function offenePflichtSchritte(status: WizardStatus | null | undefined): WizardSchritt[] {
  return WIZARD_SCHRITTE.filter((s) => s.pflicht && schrittStatus(status, s.key) !== 'erledigt')
}
