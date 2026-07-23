import type { MetadataRoute } from 'next'

// B-02: robots.txt der Plattform-Domain. Demos, Admin, Dashboard, API und
// Kundenseiten-Proxy sind für Crawler tabu (Demos tragen zusätzlich
// noindex-Meta + X-Robots-Tag, dreifache Absicherung).
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/demo/', '/admin/', '/dashboard/', '/api/', '/kundenseite/', '/branchen-preview/'],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
