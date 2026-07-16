/**
 * Scrapt die bestehende Website eines Prospects für die Demo-Generierung.
 * Extrahiert Texte, Kontaktdaten, Bilder und Logo — dient als Kontext für Claude.
 */

export interface ScrapedProspect {
  url: string
  title: string | null
  metaDescription: string | null
  ogImage: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  textContent: string
  impressumText: string | null
  images: string[]
}

const FETCH_TIMEOUT_MS = 10000
const MAX_HTML_BYTES = 500_000
const MAX_TEXT_CHARS = 8000
const MAX_IMPRESSUM_CHARS = 3000
const MAX_IMAGES = 12

const USER_AGENT = 'Mozilla/5.0 (compatible; WVD-DemoBot/1.0; +https://webseitenverlag-deutschland.de)'

export function normalizeProspectUrl(input: string): string {
  const trimmed = input.trim()
  if (!/^https?:\/\//i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

function isBlockedHost(hostname: string): boolean {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true
  // Private/Loopback-IPs blockieren (SSRF-Schutz)
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true
  if (h === '[::1]' || h.startsWith('fd') || h.startsWith('fe80')) return true
  return false
}

async function fetchHtml(url: string): Promise<string | null> {
  const parsed = new URL(url)
  if (!['http:', 'https:'].includes(parsed.protocol)) return null
  if (isBlockedHost(parsed.hostname)) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.5',
      },
    })
    if (!res.ok) return null
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) return null
    const text = await res.text()
    return text.slice(0, MAX_HTML_BYTES)
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function extractMeta(html: string, attr: 'name' | 'property', key: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]) return decodeEntities(m[1].trim())
  }
  return null
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&uuml;/g, 'ü').replace(/&Uuml;/g, 'Ü')
    .replace(/&ouml;/g, 'ö').replace(/&Ouml;/g, 'Ö')
    .replace(/&auml;/g, 'ä').replace(/&Auml;/g, 'Ä')
    .replace(/&szlig;/g, 'ß')
}

function extractText(html: string): string {
  const withoutBlocks = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
  const withBreaks = withoutBlocks
    .replace(/<\/(p|div|section|article|li|h[1-6]|tr|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
  const stripped = withBreaks.replace(/<[^>]+>/g, ' ')
  return decodeEntities(stripped)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*/g, '\n')
    .trim()
    .slice(0, MAX_TEXT_CHARS)
}

function absolutize(src: string, baseUrl: string): string | null {
  try {
    const abs = new URL(src, baseUrl)
    if (!['http:', 'https:'].includes(abs.protocol)) return null
    return abs.toString()
  } catch {
    return null
  }
}

function extractImages(html: string, baseUrl: string): { images: string[]; logoUrl: string | null } {
  const imgTags = Array.from(html.matchAll(/<img[^>]*>/gi)).map((m) => m[0])
  const images: string[] = []
  let logoUrl: string | null = null

  for (const tag of imgTags) {
    const srcMatch = tag.match(/\ssrc=["']([^"']+)["']/i)
    if (!srcMatch) continue
    const src = srcMatch[1]
    if (src.startsWith('data:')) continue
    const abs = absolutize(src, baseUrl)
    if (!abs) continue

    const lower = `${tag.toLowerCase()} ${abs.toLowerCase()}`
    const isLogo = lower.includes('logo')
    const isSvg = /\.svg(\?|$)/i.test(abs)
    const isJunk = /sprite|icon|pixel|tracking|badge|placeholder|captcha|avatar-default/.test(abs.toLowerCase())

    if (isLogo && !logoUrl) {
      logoUrl = abs  // Logo-SVGs sind erlaubt
      continue
    }
    if (isJunk || isSvg) continue  // Nicht-Logo SVGs und Junk weiter filtern
    if (!images.includes(abs)) images.push(abs)
    if (images.length >= MAX_IMAGES) break
  }

  // Fallback: <link rel="icon/apple-touch-icon"> als Logo
  if (!logoUrl) {
    const patterns = [
      /<link[^>]+rel=["'](?:icon|apple-touch-icon|shortcut\s+icon)["'][^>]+href=["']([^"']+)["']/i,
      /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:icon|apple-touch-icon|shortcut\s+icon)["']/i,
    ]
    for (const pattern of patterns) {
      const match = html.match(pattern)
      if (match?.[1]) {
        const abs = absolutize(match[1], baseUrl)
        if (abs) {
          logoUrl = abs
          break
        }
      }
    }
  }

  return { images, logoUrl }
}

function extractContact(html: string, text: string): { phone: string | null; email: string | null } {
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i)
  const mailMatch = html.match(/href=["']mailto:([^"'?]+)/i)

  let phone = telMatch ? decodeURIComponent(telMatch[1]).trim() : null
  if (!phone) {
    const textPhone = text.match(/(?:tel(?:efon)?\.?:?\s*)((?:\+49|0)[\d\s\/\-()]{7,20})/i)
    phone = textPhone ? textPhone[1].trim() : null
  }

  let email = mailMatch ? mailMatch[1].trim() : null
  if (!email) {
    const textMail = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    email = textMail ? textMail[0] : null
  }

  return { phone, email }
}

function findImpressumUrl(html: string, baseUrl: string): string | null {
  const linkMatch = html.match(/<a[^>]+href=["']([^"']*impressum[^"']*)["']/i)
  if (!linkMatch) return null
  return absolutize(linkMatch[1], baseUrl)
}

export async function scrapeProspectWebsite(rawUrl: string): Promise<ScrapedProspect | null> {
  const url = normalizeProspectUrl(rawUrl)
  const html = await fetchHtml(url)
  if (!html) return null

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? decodeEntities(titleMatch[1].replace(/\s+/g, ' ').trim()) : null
  const metaDescription = extractMeta(html, 'name', 'description')
  const ogImageRaw = extractMeta(html, 'property', 'og:image')
  const ogImage = ogImageRaw ? absolutize(ogImageRaw, url) : null

  const textContent = extractText(html)
  const { images, logoUrl } = extractImages(html, url)
  const { phone, email } = extractContact(html, textContent)

  // Impressum separat laden (Inhaber, Adresse, Rechtsform)
  let impressumText: string | null = null
  const impressumUrl = findImpressumUrl(html, url)
  if (impressumUrl) {
    const impressumHtml = await fetchHtml(impressumUrl)
    if (impressumHtml) {
      impressumText = extractText(impressumHtml).slice(0, MAX_IMPRESSUM_CHARS)
    }
  }

  return {
    url,
    title,
    metaDescription,
    ogImage,
    logoUrl,
    phone,
    email,
    textContent,
    impressumText,
    images: ogImage && !images.includes(ogImage) ? [ogImage, ...images].slice(0, MAX_IMAGES) : images,
  }
}
