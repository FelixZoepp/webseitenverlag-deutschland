import type { Metadata } from 'next'
import './marketing.css'

// Apple-System-Font-Stack (siehe --font-ui in marketing.css) —
// kein Font-Download nötig, bestes LCP

export const metadata: Metadata = {
  title: 'Webseitenverlag Deutschland — Professionelle Webseiten ab 99 €/Monat',
  description:
    'Professionelle Webseiten in 24 Stunden online. Keine Startgebühr, ab 99 €/Monat all-inclusive: Hosting, SEO, KI-Editor & Support.',
  keywords: [
    'Webseite erstellen lassen',
    'Webdesign günstig',
    'Homepage erstellen',
    'Webseite mieten',
    'Webdesign Deutschland',
    'Webseitenverlag',
  ],
  openGraph: {
    title: 'Webseitenverlag Deutschland — Professionelle Webseiten ab 99 €/Monat',
    description: 'In 24 h online. Keine Startgebühr. Ab 99 €/Monat all-inclusive.',
    type: 'website',
    locale: 'de_DE',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Webseitenverlag Deutschland' }],
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-root">{children}</div>
  )
}
