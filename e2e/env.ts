/**
 * Mini-Loader für .env.local (Phase H4): Playwright läuft außerhalb von Next
 * und lädt Env-Dateien nicht selbst. Kein dotenv nötig — nur simple KEY=VALUE-
 * Zeilen, bereits gesetzte Prozess-Envs gewinnen immer.
 */
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function ladeEnvLocal(): void {
  const pfad = join(__dirname, '..', '.env.local')
  if (!existsSync(pfad)) return

  for (const zeile of readFileSync(pfad, 'utf-8').split('\n')) {
    const t = zeile.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq <= 0) continue
    const key = t.slice(0, eq).trim()
    let wert = t.slice(eq + 1).trim()
    if (
      (wert.startsWith('"') && wert.endsWith('"')) ||
      (wert.startsWith("'") && wert.endsWith("'"))
    ) {
      wert = wert.slice(1, -1)
    }
    if (!(key in process.env)) process.env[key] = wert
  }
}
