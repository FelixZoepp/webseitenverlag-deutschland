/**
 * Pipeline v2 — Datenbeschaffung (Mission §8, Phase D)
 *
 * Kette mit sanfter Degradation (alles env-gesteuert, kein Hardcode):
 *   1. Website-Inhalte:  Firecrawl (FIRECRAWL_API_KEY) → eigener Scraper (Fallback)
 *   2. Strukturdaten:    Google Places (GOOGLE_PLACES_API_KEY) — Adresse, Telefon,
 *                        Öffnungszeiten, echte Bewertungen
 *   3. Manueller Fallback: Admin-Eingaben füllen alle verbleibenden Lücken
 *
 * Ohne API-Keys verhält sich die Kette wie v1 (eigener Scraper + manuelle Daten).
 */

import { erfasseNutzung } from '@/lib/nutzung'
import { scrapeProspectWebsite, type ScrapedProspect } from '@/lib/scrape-prospect'

export interface ProspectBewertung {
  text: string
  name: string
  rating: number
}

/** Normalisierte Datenbasis für die Content-Generierung */
export interface ProspectData {
  firma: string
  ort: string | null
  branche: string | null
  website: string | null
  telefon: string | null
  email: string | null
  adresse: string | null
  gruendungsjahr: string | null
  oeffnungszeiten: string[] | null
  rating: number | null
  reviewCount: number | null
  bewertungen: ProspectBewertung[]
  /** Roh-Text der bestehenden Website (Markdown oder extrahierter Text) */
  websiteText: string | null
  impressumText: string | null
  logoUrl: string | null
  bilder: string[]
  /** Notizen aus dem Quali-Call (manueller Fallback) */
  notizen: string | null
  /** Welche Quellen tatsächlich geliefert haben */
  quellen: ('firecrawl' | 'scraper' | 'places' | 'manuell')[]
}

export interface ManualProspectInput {
  firma: string
  ort?: string | null
  branche?: string | null
  websiteUrl?: string | null
  telefon?: string | null
  email?: string | null
  notizen?: string | null
}

// ------------------------------------------------------------
// Quelle 1a: Firecrawl (optional, FIRECRAWL_API_KEY)
// ------------------------------------------------------------

interface FirecrawlResult {
  markdown: string
  title: string | null
  description: string | null
  ogImage: string | null
}

async function fetchFirecrawl(url: string): Promise<FirecrawlResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      console.warn(`[pipeline] Firecrawl ${res.status} für ${url} — Fallback auf eigenen Scraper`)
      return null
    }
    const json = (await res.json()) as {
      success?: boolean
      data?: { markdown?: string; metadata?: { title?: string; description?: string; ogImage?: string } }
    }
    if (!json.success || !json.data?.markdown) return null
    await erfasseNutzung('firecrawl_scrape', { kontext: 'prospect-pipeline' })
    return {
      markdown: json.data.markdown.slice(0, 12000),
      title: json.data.metadata?.title ?? null,
      description: json.data.metadata?.description ?? null,
      ogImage: json.data.metadata?.ogImage ?? null,
    }
  } catch (e) {
    console.warn('[pipeline] Firecrawl-Fehler — Fallback auf eigenen Scraper:', (e as Error).message)
    return null
  }
}

// ------------------------------------------------------------
// Quelle 2: Google Places (optional, GOOGLE_PLACES_API_KEY)
// ------------------------------------------------------------

interface PlacesResult {
  adresse: string | null
  telefon: string | null
  website: string | null
  rating: number | null
  reviewCount: number | null
  oeffnungszeiten: string[] | null
  bewertungen: ProspectBewertung[]
}

async function fetchPlaces(firma: string, ort: string | null): Promise<PlacesResult | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null
  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({
        textQuery: ort ? `${firma} ${ort}` : firma,
        languageCode: 'de',
        regionCode: 'DE',
      }),
      signal: AbortSignal.timeout(10000),
    })
    if (!searchRes.ok) {
      console.warn(`[pipeline] Places-Suche ${searchRes.status} — überspringe Places`)
      return null
    }
    const search = (await searchRes.json()) as { places?: { id: string }[] }
    const placeId = search.places?.[0]?.id
    if (!placeId) return null

    const detailRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask':
          'formattedAddress,nationalPhoneNumber,websiteUri,rating,userRatingCount,regularOpeningHours.weekdayDescriptions,reviews',
      },
      signal: AbortSignal.timeout(10000),
    })
    if (!detailRes.ok) return null
    await erfasseNutzung('places_lookup', { kontext: 'prospect-pipeline' })
    const detail = (await detailRes.json()) as {
      formattedAddress?: string
      nationalPhoneNumber?: string
      websiteUri?: string
      rating?: number
      userRatingCount?: number
      regularOpeningHours?: { weekdayDescriptions?: string[] }
      reviews?: {
        rating?: number
        text?: { text?: string }
        authorAttribution?: { displayName?: string }
      }[]
    }
    return {
      adresse: detail.formattedAddress ?? null,
      telefon: detail.nationalPhoneNumber ?? null,
      website: detail.websiteUri ?? null,
      rating: detail.rating ?? null,
      reviewCount: detail.userRatingCount ?? null,
      oeffnungszeiten: detail.regularOpeningHours?.weekdayDescriptions ?? null,
      bewertungen: (detail.reviews ?? [])
        .filter((r) => r.text?.text && (r.rating ?? 0) >= 4)
        .slice(0, 5)
        .map((r) => ({
          text: r.text!.text!.slice(0, 400),
          name: r.authorAttribution?.displayName ?? 'Google-Nutzer',
          rating: r.rating ?? 5,
        })),
    }
  } catch (e) {
    console.warn('[pipeline] Places-Fehler — überspringe Places:', (e as Error).message)
    return null
  }
}

// ------------------------------------------------------------
// Kette
// ------------------------------------------------------------

/** Ort heuristisch aus Adresse ziehen ("Musterstr. 1, 10115 Berlin" → "Berlin") */
function ortAusAdresse(adresse: string | null): string | null {
  if (!adresse) return null
  const match = adresse.match(/\d{5}\s+([^,]+)/)
  return match ? match[1].trim() : null
}

export async function collectProspectData(input: ManualProspectInput): Promise<ProspectData> {
  const quellen: ProspectData['quellen'] = []

  // 1. Website-Inhalte: Firecrawl → eigener Scraper
  let firecrawl: FirecrawlResult | null = null
  let scraped: ScrapedProspect | null = null
  if (input.websiteUrl) {
    firecrawl = await fetchFirecrawl(input.websiteUrl)
    if (firecrawl) {
      quellen.push('firecrawl')
    } else {
      scraped = await scrapeProspectWebsite(input.websiteUrl)
      if (scraped) quellen.push('scraper')
    }
  }

  // 2. Strukturdaten & echte Bewertungen: Google Places
  const places = await fetchPlaces(input.firma, input.ort ?? null)
  if (places) quellen.push('places')

  // 3. Manueller Fallback: Admin-Eingaben füllen Lücken
  quellen.push('manuell')

  return {
    firma: input.firma,
    ort: input.ort ?? ortAusAdresse(places?.adresse ?? null),
    branche: input.branche ?? null,
    website: input.websiteUrl ?? places?.website ?? null,
    telefon: input.telefon ?? places?.telefon ?? scraped?.phone ?? null,
    email: input.email ?? scraped?.email ?? null,
    adresse: places?.adresse ?? null,
    gruendungsjahr: null, // füllt ggf. die Content-Generierung aus dem Website-Text
    oeffnungszeiten: places?.oeffnungszeiten ?? null,
    rating: places?.rating ?? null,
    reviewCount: places?.reviewCount ?? null,
    bewertungen: places?.bewertungen ?? [],
    websiteText: firecrawl?.markdown ?? scraped?.textContent ?? null,
    impressumText: scraped?.impressumText ?? null,
    logoUrl: scraped?.logoUrl ?? null,
    bilder: [
      ...(firecrawl?.ogImage ? [firecrawl.ogImage] : []),
      ...(scraped?.ogImage ? [scraped.ogImage] : []),
      ...(scraped?.images ?? []),
    ].slice(0, 12),
    notizen: input.notizen ?? null,
    quellen,
  }
}
