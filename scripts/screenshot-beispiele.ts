// scripts/screenshot-beispiele.ts
// Erstellt Screenshots der 4 Demo-Seiten als WebP nach public/beispiele/.
// Einmaliger Lauf: npx tsx scripts/screenshot-beispiele.ts
// Erfordert: npx playwright install chromium

import { chromium } from 'playwright'
import { join } from 'path'

const DEMOS = [
  { name: 'galabau', url: 'https://webseitenverlag-deutschland.vercel.app/demo/VQDzw4LlCT82KT4_X3xU3rL1Rwq3k21A' },
  { name: 'solar', url: 'https://sonnenstrom-journey.higgsfield.app' },
  { name: 'dachdecker', url: 'https://dachmeister.higgsfield.app' },
  { name: 'garten', url: 'https://garden-scroll.higgsfield.app' },
]

const DIST = join(__dirname, '..', 'public', 'beispiele')

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })

  for (const demo of DEMOS) {
    const page = await context.newPage()
    console.log(`Screenshot: ${demo.name} (${demo.url})`)
    await page.goto(demo.url, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    await page.screenshot({
      path: join(DIST, `${demo.name}.webp`),
      type: 'png',
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    })
    await page.close()
    console.log(`  → ${demo.name}.webp`)
  }

  await browser.close()
  console.log(`\n4 Screenshots → ${DIST}`)
}

main().catch((e) => {
  console.error('Screenshot-Fehler:', e)
  process.exit(1)
})
