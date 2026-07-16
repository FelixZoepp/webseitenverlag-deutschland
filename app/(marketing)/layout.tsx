import type { Metadata } from 'next'
import { Fraunces, Inter_Tight, JetBrains_Mono } from 'next/font/google'
import './marketing.css'

// Selbst gehostet via next/font (kein Fremd-CDN)
// Nur die tatsächlich genutzten Gewichte (600/700) statt Variable-Font mit
// opsz+SOFT-Achsen — spart ~100 KB Font-Download und beschleunigt das LCP
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-fraunces',
})
const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-tight',
})
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-jetbrains',
})

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
    <div className={`${fraunces.variable} ${interTight.variable} ${jetbrains.variable} marketing-root`}>
      {children}
    </div>
  )
}
