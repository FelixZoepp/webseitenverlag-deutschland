import type { MetadataRoute } from 'next'
import { veroeffentlichteArtikel } from '@/lib/blog/artikel'

// B-02: Sitemap der Plattform-Domain. Nur öffentliche Marketing-Seiten —
// Demos (/demo/*) und Kundenseiten bleiben bewusst draußen (noindex bzw.
// eigene Domains mit eigener Sitemap).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

export const revalidate = 3600

export default function sitemap(): MetadataRoute.Sitemap {
  const statisch: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_URL}/anfrage`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${APP_URL}/ergebnisse`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_URL}/kundenmeinungen`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${APP_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
  ]
  const blog: MetadataRoute.Sitemap = veroeffentlichteArtikel().map((a) => ({
    url: `${APP_URL}/blog/${a.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: a.datum,
  }))
  return [...statisch, ...blog]
}
