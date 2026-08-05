/**
 * HD Video Generator — generiert die restlichen Scrub-Story Videos
 * über die Higgsfield Platform API mit Start-Frame-Chaining.
 *
 * Nutzung: node scripts/generate-hd-videos.mjs
 *
 * Voraussetzungen: HIGGSFIELD_API_KEY + HIGGSFIELD_API_SECRET in .env.local
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// .env.local laden
const envFile = readFileSync('.env.local', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n').filter(l => l.includes('=')).map(l => {
    const [k, ...v] = l.split('=')
    return [k.trim(), v.join('=').trim().replace(/^"|"$/g, '')]
  })
)

const API_KEY = env.HIGGSFIELD_API_KEY
const API_SECRET = env.HIGGSFIELD_API_SECRET
const BASE = env.HIGGSFIELD_API_BASE || 'https://platform.higgsfield.ai'
const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': `Key ${API_KEY}:${API_SECRET}`,
}

// Fertige 1080p Videos von der MCP-Generierung
const COMPLETED = {
  pv: [
    'https://d8j0ntlcm91z4.cloudfront.net/user_38LH5KDg2bz6Lb9FXQBmGQ0Ulan/hf_20260802_171012_aae4abe9-9863-4a88-a893-835d1b461850.mp4',
    'https://d8j0ntlcm91z4.cloudfront.net/user_38LH5KDg2bz6Lb9FXQBmGQ0Ulan/hf_20260802_171702_d717faa4-ed9a-4cce-a1da-8516c36baf29.mp4',
  ],
  san: [
    'https://d8j0ntlcm91z4.cloudfront.net/user_38LH5KDg2bz6Lb9FXQBmGQ0Ulan/hf_20260802_171014_dd8c7fcf-724f-4b6d-a3de-8fe64077fdd5.mp4',
  ],
}

// Prompts für fehlende Videos
const REMAINING = {
  pv: [
    'Cyanfarbene Stromströme fließen entlang von Kupferkabeln und Leitungen. Ein moderner Wechselrichter mit leuchtenden LED-Anzeigen. Smart Monitoring Display. Cinematic, 16:9.',
    'Kamera fährt langsam durch ein beleuchtetes Haus bei Dämmerung. Licht geht Raum für Raum an. Küche, Wohnzimmer, Wallbox in der Garage. Warmes Licht. Cinematic, 16:9.',
    'Kamera fährt rückwärts und enthüllt einen modernen Batteriespeicher mit cyanfarbenen LED-Ladeanzeigen neben einem Wechselrichter. Sauberer Keller. Cinematic, 16:9.',
  ],
  san: [
    'Kamerafahrt ins Innere eines Altbaus während der Entkernung. Wände werden aufgestemmt, alte Rohre liegen frei. Staubpartikel in Lichtschächten. Cinematic, 16:9.',
    'Kamerafahrt durch einen Rohbau. Neue Kupferrohre und Elektroleitungen, Wärmedämmung an Wänden. Arbeitsleuchten. Cinematic, 16:9.',
    'Langsame Kamerafahrt durch eine Wohnung während des Innenausbaus. Neue Holzböden, weisse Wände, modernes Badezimmer. Warmes Tageslicht. Cinematic, 16:9.',
    'Kamera fährt rückwärts und enthüllt eine fertig sanierte moderne Wohnung. Glänzende Holzböden, Designer-Küche, Panoramafenster. Goldenes Abendlicht. Cinematic, 16:9.',
  ],
}

function extractLastFrame(videoUrl, outputPath) {
  console.log(`  Extracting last frame from ${videoUrl.split('/').pop()}...`)
  execSync(`curl -sL -o /tmp/vid.mp4 "${videoUrl}" && ffmpeg -sseof -0.1 -i /tmp/vid.mp4 -update 1 -q:v 1 "${outputPath}" -y 2>/dev/null`)
}

async function uploadImage(filePath) {
  const imageData = readFileSync(filePath)
  // Upload als base64 via image_url (data URI)
  const base64 = imageData.toString('base64')
  return `data:image/jpeg;base64,${base64}`
}

async function generateVideo(imageUrl, prompt) {
  console.log(`  Generating video: ${prompt.slice(0, 60)}...`)

  const res = await fetch(`${BASE}/higgsfield-ai/dop/standard`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      duration: 5,
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Video-Job fehlgeschlagen (${res.status}): ${text}`)
  }

  const job = await res.json()
  const requestId = job.request_id || job.id
  console.log(`  Job gestartet: ${requestId}`)

  // Poll bis fertig (max 10 Min)
  const start = Date.now()
  while (Date.now() - start < 600_000) {
    await new Promise(r => setTimeout(r, 5000))

    const statusRes = await fetch(`${BASE}/requests/${requestId}/status`, { headers: HEADERS })
    if (!statusRes.ok) continue

    const status = await statusRes.json()
    if (status.status === 'completed') {
      const videoUrl = status.video?.url
      if (!videoUrl) throw new Error(`Kein Video in Antwort für ${requestId}`)
      console.log(`  ✅ Video fertig: ${videoUrl.split('/').pop()}`)
      return videoUrl
    }
    if (status.status === 'failed' || status.status === 'error') {
      throw new Error(`Video ${requestId} fehlgeschlagen`)
    }
    process.stdout.write('.')
  }
  throw new Error(`Timeout für Video ${requestId}`)
}

async function processChain(name, completedUrls, remainingPrompts) {
  console.log(`\n=== ${name} ===`)
  const allVideos = [...completedUrls]

  let lastVideoUrl = completedUrls[completedUrls.length - 1]

  for (let i = 0; i < remainingPrompts.length; i++) {
    const videoNum = completedUrls.length + i + 1
    console.log(`\n[${name} Video ${videoNum}]`)

    // 1. Letzten Frame extrahieren
    const framePath = `/tmp/${name}-v${videoNum - 1}-last.jpg`
    extractLastFrame(lastVideoUrl, framePath)

    // 2. Frame als Data-URI
    const imageUrl = await uploadImage(framePath)

    // 3. Video generieren
    const videoUrl = await generateVideo(imageUrl, remainingPrompts[i])
    allVideos.push(videoUrl)
    lastVideoUrl = videoUrl
  }

  return allVideos
}

async function main() {
  console.log('HD Video Generator — Higgsfield Platform API')
  console.log(`API Base: ${BASE}`)
  console.log(`PV: ${COMPLETED.pv.length} fertig, ${REMAINING.pv.length} noch`)
  console.log(`Sanierung: ${COMPLETED.san.length} fertig, ${REMAINING.san.length} noch`)

  // Beide Ketten sequentiell (API-Limits)
  const pvVideos = await processChain('PV', COMPLETED.pv, REMAINING.pv)
  const sanVideos = await processChain('SAN', COMPLETED.san, REMAINING.san)

  console.log('\n\n=== ALLE VIDEOS FERTIG ===')
  console.log('\nPV (B&C Direct Sales):')
  pvVideos.forEach((url, i) => console.log(`  V${i + 1}: ${url}`))
  console.log('\nSanierung (Livara Services):')
  sanVideos.forEach((url, i) => console.log(`  V${i + 1}: ${url}`))

  // URLs als JSON speichern
  writeFileSync('/tmp/hd-videos.json', JSON.stringify({ pv: pvVideos, san: sanVideos }, null, 2))
  console.log('\nURLs gespeichert in /tmp/hd-videos.json')
}

main().catch(e => {
  console.error('\nFEHLER:', e.message)
  process.exit(1)
})
