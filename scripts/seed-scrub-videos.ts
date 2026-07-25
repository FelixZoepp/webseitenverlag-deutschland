/**
 * Scrub-Video Seeding-Script: 5 Videos pro Branche via Higgsfield
 * (Start-Frame-Chaining), GOP-Encoding mit ffmpeg, Upload nach Supabase Storage.
 *
 *   npm run seed:scrub                               # alle Branchen
 *   npx tsx scripts/seed-scrub-videos.ts --nur dachdecker
 *   npx tsx scripts/seed-scrub-videos.ts --nur maler,friseur
 *   npx tsx scripts/seed-scrub-videos.ts --nur dachdecker --nur-szenen
 *
 * Ablauf pro Branche (~15 min):
 *   1. Scrub-Szenen generieren (Claude)
 *   2. Entry Still generieren (Higgsfield)
 *   3. 5 Videos sequentiell generieren (Frame-Chaining)
 *   4. Alle 5 Videos encoden (Desktop GOP 8, Mobile GOP 4, Poster)
 *   5. Upload nach Supabase Storage (asset-bank/scrub/{branche}/)
 *   6. URLs in branchen_profile.profil.scrub_assets speichern
 *
 * Voraussetzungen: .env.local mit NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, HIGGSFIELD_API_KEY + SECRET.
 * ffmpeg muss installiert sein (/opt/homebrew/bin/ffmpeg).
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync, readdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { execSync } from 'child_process'

// .env.local laden (Scripts laufen ausserhalb von Next.js)
const envPfad = join(process.cwd(), '.env.local')
if (existsSync(envPfad)) {
  for (const zeile of readFileSync(envPfad, 'utf8').split('\n')) {
    const m = zeile.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

import { START_BRANCHEN, type StartBranche } from '../lib/seeding/branchen-start'
import { generiereScrubSzenen, type ScrubMultiSzene } from '../lib/seeding/generiere-scrub-szenen'
import { HiggsfieldProvider } from '../lib/assets/higgsfield'
import { createAdminClient } from '../lib/supabase/admin'

// ------------------------------------------------------------
// Konstanten
// ------------------------------------------------------------

const FFMPEG = '/opt/homebrew/bin/ffmpeg'
const BUCKET = 'asset-bank'

// ------------------------------------------------------------
// Hilfsfunktionen
// ------------------------------------------------------------

function arg(name: string): string | null {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : null
}

/** Erstellt ein Temp-Verzeichnis fuer eine Branche */
function erstelleTempDir(brancheKey: string): string {
  const dir = join(tmpdir(), `scrub-seed-${brancheKey}-${randomUUID().slice(0, 8)}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Raeumt ein Temp-Verzeichnis auf */
function raeumeAuf(dir: string): void {
  try {
    const dateien = readdirSync(dir)
    for (const datei of dateien) {
      try { unlinkSync(join(dir, datei)) } catch { /* ignore */ }
    }
    // Verzeichnis selbst loeschen
    try { execSync(`rmdir "${dir}"`) } catch { /* ignore */ }
  } catch {
    console.warn(`  [cleanup] Temp-Dir konnte nicht geloescht werden: ${dir}`)
  }
}

/** Laedt ein Bild/Video von einer URL herunter und speichert es lokal */
async function ladeDateiHerunter(url: string, zielPfad: string): Promise<void> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Download fehlgeschlagen (${res.status}): ${url}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    writeFileSync(zielPfad, buffer)
  } finally {
    clearTimeout(timeout)
  }
}

/** Laedt eine lokale Datei nach Supabase Storage hoch und gibt die public URL zurueck */
async function ladeNachSupabase(
  admin: ReturnType<typeof createAdminClient>,
  lokalerPfad: string,
  storagePfad: string,
  contentType: string
): Promise<string> {
  const datei = readFileSync(lokalerPfad)
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(storagePfad, datei, { contentType, upsert: true })
  if (error) throw new Error(`Supabase-Upload fehlgeschlagen (${storagePfad}): ${error.message}`)

  const { data } = admin.storage.from(BUCKET).getPublicUrl(storagePfad)
  return data.publicUrl
}

/** Extrahiert den letzten Frame eines Videos mit ffmpeg */
function extrahiereLetztenFrame(videoPfad: string, ausgabePfad: string): void {
  execSync(
    `"${FFMPEG}" -sseof -0.1 -i "${videoPfad}" -update 1 -q:v 1 -y "${ausgabePfad}"`,
    { stdio: 'pipe' }
  )
}

/** Extrahiert den ersten Frame eines Videos als Poster */
function extrahierePoster(videoPfad: string, ausgabePfad: string): void {
  execSync(
    `"${FFMPEG}" -i "${videoPfad}" -vframes 1 -q:v 3 -y "${ausgabePfad}"`,
    { stdio: 'pipe' }
  )
}

/** Encoded ein Video fuer Desktop (GOP 8, 1080p) */
function encodeDesktop(eingabe: string, ausgabe: string): void {
  execSync(
    `"${FFMPEG}" -i "${eingabe}" -c:v libx264 -preset slower -crf 18 -profile:v high -pix_fmt yuv420p -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart -vf "scale=1920:-2:flags=lanczos" -an -y "${ausgabe}"`,
    { stdio: 'pipe' }
  )
}

/** Encoded ein Video fuer Mobile (GOP 4, 720p) */
function encodeMobile(eingabe: string, ausgabe: string): void {
  execSync(
    `"${FFMPEG}" -i "${eingabe}" -c:v libx264 -preset slower -crf 20 -profile:v high -pix_fmt yuv420p -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart -vf "scale=1280:-2:flags=lanczos" -an -y "${ausgabe}"`,
    { stdio: 'pipe' }
  )
}

// ------------------------------------------------------------
// Typen fuer scrub_assets
// ------------------------------------------------------------

interface ScrubClipAsset {
  desktop: string
  mobile: string
  poster: string
}

interface ScrubAssets {
  entryStill: string
  clips: ScrubClipAsset[]
}

// ------------------------------------------------------------
// Hauptablauf pro Branche
// ------------------------------------------------------------

async function seedeBranche(branche: StartBranche): Promise<void> {
  const admin = createAdminClient()
  const higgsfield = new HiggsfieldProvider()
  const tempDir = erstelleTempDir(branche.branche_key)

  try {
    // ----------------------------------------------------------
    // Schritt 1: Scrub-Szenen generieren (Claude)
    // ----------------------------------------------------------
    console.log(`\n  Schritt 1/6: Scrub-Szenen generieren (Claude)...`)
    const szenen = await generiereScrubSzenen(
      branche.branche_key,
      branche.name,
      branche.beschreibung
    )
    console.log(`  -> ${szenen.length} Szenen generiert`)

    // Szenen in branchen_profile.profil speichern
    const { data: profilRow, error: fetchErr } = await admin
      .from('branchen_profile')
      .select('profil')
      .eq('branche_key', branche.branche_key)
      .single()
    if (fetchErr) throw new Error(`branchen_profile nicht gefunden: ${fetchErr.message}`)

    const profil = (profilRow.profil ?? {}) as Record<string, unknown>
    profil.scrub_szenen = szenen

    const { error: updateErr1 } = await admin
      .from('branchen_profile')
      .update({ profil, updated_at: new Date().toISOString() })
      .eq('branche_key', branche.branche_key)
    if (updateErr1) throw new Error(`scrub_szenen speichern fehlgeschlagen: ${updateErr1.message}`)
    console.log(`  -> scrub_szenen in DB gespeichert`)

    // Nur Szenen generieren, wenn --nur-szenen Flag gesetzt
    if (process.argv.includes('--nur-szenen')) {
      console.log(`  -> --nur-szenen: ueberspringe Video-Generierung`)
      return
    }

    // ----------------------------------------------------------
    // Schritt 2: Entry Still generieren (Higgsfield)
    // ----------------------------------------------------------
    console.log(`  Schritt 2/6: Entry Still generieren (Higgsfield)...`)
    const entryPrompt = szenen[0].videoPrompt
      .replace(/5-second video|5s video|video/gi, 'photograph')
      .replace(/subtle motion|movement|flowing/gi, 'frozen moment')
    const entryStill = await higgsfield.generateImage({
      prompt: entryPrompt,
      aspect: '16:9',
    })

    // Entry Still herunterladen
    const entryStillLokal = join(tempDir, 'entry-still.jpg')
    await ladeDateiHerunter(entryStill.url, entryStillLokal)
    console.log(`  -> Entry Still heruntergeladen`)

    // Entry Still nach Supabase hochladen (Higgsfield braucht public URLs)
    const entryStillStoragePfad = `scrub/${branche.branche_key}/entry-still.jpg`
    const entryStillUrl = await ladeNachSupabase(
      admin, entryStillLokal, entryStillStoragePfad, 'image/jpeg'
    )
    console.log(`  -> Entry Still hochgeladen: ${entryStillStoragePfad}`)

    // ----------------------------------------------------------
    // Schritt 3: 5 Videos sequentiell generieren (Frame-Chaining)
    // ----------------------------------------------------------
    console.log(`  Schritt 3/6: 5 Videos generieren (Frame-Chaining)...`)
    let aktuellesStartBildUrl = entryStillUrl
    const rawVideoPfade: string[] = []

    for (let i = 0; i < szenen.length; i++) {
      const szene = szenen[i]
      console.log(`    Szene ${i + 1}/5: Video generieren...`)

      // Video generieren
      const video = await higgsfield.generateVideo({
        imageUrl: aktuellesStartBildUrl,
        prompt: szene.videoPrompt,
        durationSeconds: 5,
      })
      console.log(`    Szene ${i + 1}/5: Video generiert (Job ${video.jobId})`)

      // Video herunterladen
      const rawPfad = join(tempDir, `raw-scene-${i + 1}.mp4`)
      await ladeDateiHerunter(video.url, rawPfad)
      rawVideoPfade.push(rawPfad)
      console.log(`    Szene ${i + 1}/5: Video heruntergeladen`)

      // Letzten Frame extrahieren fuer naechstes Video (ausser beim letzten)
      if (i < szenen.length - 1) {
        const lastFramePfad = join(tempDir, `last-frame-${i + 1}.jpg`)
        extrahiereLetztenFrame(rawPfad, lastFramePfad)

        // Letzten Frame nach Supabase hochladen (Higgsfield braucht public URL)
        const lastFrameStoragePfad = `scrub/${branche.branche_key}/chain/last-frame-${i + 1}.jpg`
        aktuellesStartBildUrl = await ladeNachSupabase(
          admin, lastFramePfad, lastFrameStoragePfad, 'image/jpeg'
        )
        console.log(`    Szene ${i + 1}/5: Last-Frame hochgeladen fuer Chaining`)
      }
    }

    // ----------------------------------------------------------
    // Schritt 4: Alle 5 Videos encoden
    // ----------------------------------------------------------
    console.log(`  Schritt 4/6: Videos encoden...`)
    const encodedDateien: Array<{ desktop: string; mobile: string; poster: string }> = []

    for (let i = 0; i < rawVideoPfade.length; i++) {
      const rawPfad = rawVideoPfade[i]
      const desktopPfad = join(tempDir, `scene-${i + 1}-desktop.mp4`)
      const mobilePfad = join(tempDir, `scene-${i + 1}-mobile.mp4`)
      const posterPfad = join(tempDir, `scene-${i + 1}-poster.jpg`)

      console.log(`    Szene ${i + 1}/5: Encoding Desktop (GOP 8, 1080p)...`)
      encodeDesktop(rawPfad, desktopPfad)

      console.log(`    Szene ${i + 1}/5: Encoding Mobile (GOP 4, 720p)...`)
      encodeMobile(rawPfad, mobilePfad)

      console.log(`    Szene ${i + 1}/5: Poster extrahieren...`)
      extrahierePoster(rawPfad, posterPfad)

      encodedDateien.push({ desktop: desktopPfad, mobile: mobilePfad, poster: posterPfad })
    }

    // ----------------------------------------------------------
    // Schritt 5: Upload nach Supabase Storage
    // ----------------------------------------------------------
    console.log(`  Schritt 5/6: Upload nach Supabase Storage...`)
    const clips: ScrubClipAsset[] = []

    for (let i = 0; i < encodedDateien.length; i++) {
      const d = encodedDateien[i]
      const prefix = `scrub/${branche.branche_key}`

      console.log(`    Szene ${i + 1}/5: Upload Desktop...`)
      const desktopUrl = await ladeNachSupabase(
        admin, d.desktop, `${prefix}/scene-${i + 1}.mp4`, 'video/mp4'
      )

      console.log(`    Szene ${i + 1}/5: Upload Mobile...`)
      const mobileUrl = await ladeNachSupabase(
        admin, d.mobile, `${prefix}/scene-${i + 1}-mobile.mp4`, 'video/mp4'
      )

      console.log(`    Szene ${i + 1}/5: Upload Poster...`)
      const posterUrl = await ladeNachSupabase(
        admin, d.poster, `${prefix}/scene-${i + 1}-poster.jpg`, 'image/jpeg'
      )

      clips.push({ desktop: desktopUrl, mobile: mobileUrl, poster: posterUrl })
    }

    // ----------------------------------------------------------
    // Schritt 6: URLs in DB speichern
    // ----------------------------------------------------------
    console.log(`  Schritt 6/6: URLs in DB speichern...`)

    const scrubAssets: ScrubAssets = { entryStill: entryStillUrl, clips }

    // Profil erneut laden (koennte sich inzwischen geaendert haben)
    const { data: aktuellesRow, error: fetchErr2 } = await admin
      .from('branchen_profile')
      .select('profil')
      .eq('branche_key', branche.branche_key)
      .single()
    if (fetchErr2) throw new Error(`branchen_profile erneut laden fehlgeschlagen: ${fetchErr2.message}`)

    const aktuellesProfil = (aktuellesRow.profil ?? {}) as Record<string, unknown>
    aktuellesProfil.scrub_assets = scrubAssets

    const { error: updateErr2 } = await admin
      .from('branchen_profile')
      .update({ profil: aktuellesProfil, updated_at: new Date().toISOString() })
      .eq('branche_key', branche.branche_key)
    if (updateErr2) throw new Error(`scrub_assets speichern fehlgeschlagen: ${updateErr2.message}`)

    console.log(`  -> scrub_assets gespeichert (${clips.length} Clips)`)
  } finally {
    raeumeAuf(tempDir)
  }
}

// ------------------------------------------------------------
// CLI
// ------------------------------------------------------------

async function main() {
  // ffmpeg pruefen
  if (!existsSync(FFMPEG)) {
    console.error(`FEHLER: ffmpeg nicht gefunden unter ${FFMPEG}`)
    console.error('Installieren: brew install ffmpeg')
    process.exit(1)
  }

  // Env-Vars pruefen
  const fehlend: string[] = []
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) fehlend.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) fehlend.push('SUPABASE_SERVICE_ROLE_KEY')
  if (!process.env.ANTHROPIC_API_KEY) fehlend.push('ANTHROPIC_API_KEY')
  if (!process.argv.includes('--nur-szenen')) {
    if (!process.env.HIGGSFIELD_API_KEY) fehlend.push('HIGGSFIELD_API_KEY')
    if (!process.env.HIGGSFIELD_API_SECRET) fehlend.push('HIGGSFIELD_API_SECRET')
  }
  if (fehlend.length > 0) {
    console.error(`FEHLER: Fehlende Env-Vars: ${fehlend.join(', ')}`)
    process.exit(1)
  }

  // Branchen-Filter
  const nur = arg('nur')?.split(',').map((s) => s.trim())
  const auswahl = nur
    ? START_BRANCHEN.filter((b) => nur.includes(b.branche_key))
    : [...START_BRANCHEN]

  if (nur && auswahl.length !== nur.length) {
    const bekannt = new Set(auswahl.map((b) => b.branche_key))
    console.error(`Unbekannte Branchen-Keys: ${nur.filter((k) => !bekannt.has(k)).join(', ')}`)
    process.exit(1)
  }

  const nurSzenen = process.argv.includes('--nur-szenen')
  console.log(`Scrub-Video Seeding — ${auswahl.length} Branchen${nurSzenen ? ' (nur Szenen)' : ''}`)
  console.log(`${'='.repeat(60)}`)

  let ok = 0
  let fehlerZaehler = 0

  for (const branche of auswahl) {
    const start = Date.now()
    console.log(`\n-> ${branche.branche_key} (${branche.name})`)

    try {
      await seedeBranche(branche)
      const dauer = ((Date.now() - start) / 1000).toFixed(1)
      console.log(`  OK (${dauer}s)`)
      ok++
    } catch (e) {
      const dauer = ((Date.now() - start) / 1000).toFixed(1)
      console.error(`  FEHLER (${dauer}s): ${(e as Error).message}`)
      fehlerZaehler++
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Ergebnis: ${ok}/${auswahl.length} Branchen erfolgreich, ${fehlerZaehler} Fehler`)

  if (fehlerZaehler > 0) process.exit(1)
}

main().catch((e) => {
  console.error('Scrub-Video Seeding abgebrochen:', e)
  process.exit(1)
})
