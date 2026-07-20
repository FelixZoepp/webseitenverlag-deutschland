import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Webseiten-Verlag Deutschland — Professionelle Webseiten ab 99 €/Monat',
    template: '%s | Webseiten-Verlag Deutschland',
  },
  description: 'Professionelle Webseiten in 24 Stunden online. Keine Startgebühr, ab 99 €/Monat inklusive Hosting, SEO & Support.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    siteName: 'Webseiten-Verlag Deutschland',
    locale: 'de_DE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Webseiten-Verlag Deutschland' }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
