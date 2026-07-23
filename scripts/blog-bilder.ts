import { chromium } from 'playwright'
import { join } from 'path'
import { BLOG_ARTIKEL } from '../lib/blog/artikel'

const DIST = join(__dirname, '..', 'public', 'blog')

const FARBEN: Record<string, { bg: string; accent: string }> = {
  'Kosten & Preise':     { bg: '#1E3A5F', accent: '#4DA6FF' },
  'Handwerk & Web':      { bg: '#2D4A22', accent: '#7BC96A' },
  'Kosten & Modelle':    { bg: '#4A2D22', accent: '#E89B6A' },
  'Selbstständigkeit':   { bg: '#3A1E5F', accent: '#B07AE8' },
  'SEO & Sichtbarkeit':  { bg: '#1E4A4A', accent: '#5FC9C9' },
  'Einwände & Mythen':   { bg: '#5F1E2E', accent: '#E0354B' },
}

function bildHtml(a: typeof BLOG_ARTIKEL[0]): string {
  const f = FARBEN[a.kategorie] ?? { bg: '#2A2C2F', accent: '#E0354B' }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${f.bg};color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;justify-content:center;padding:80px 100px}
.kat{font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:${f.accent};margin-bottom:24px}
.titel{font-size:52px;font-weight:700;line-height:1.15;letter-spacing:-0.02em;max-width:900px}
.footer{position:absolute;bottom:60px;left:100px;font-size:18px;font-weight:500;opacity:0.6}
</style></head><body>
<div class="kat">${a.kategorie}</div>
<div class="titel">${a.titel}</div>
<div class="footer">Webseiten-Verlag Deutschland</div>
</body></html>`
}

async function main() {
  const { mkdirSync } = await import('fs')
  mkdirSync(DIST, { recursive: true })
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } })
  for (const a of BLOG_ARTIKEL) {
    const page = await ctx.newPage()
    await page.setContent(bildHtml(a), { waitUntil: 'domcontentloaded' })
    await page.screenshot({ path: join(DIST, `${a.slug}.png`), type: 'png' })
    await page.close()
    console.log(`OK   ${a.slug}`)
  }
  await browser.close()
  console.log(`\n${BLOG_ARTIKEL.length} Bilder → ${DIST}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
