import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Webseitenverlag Deutschland — Professionelle Webseiten ab 99 €/Monat',
    template: '%s | Webseitenverlag Deutschland',
  },
  description: 'Professionelle Webseiten in 24 Stunden online. Keine Startgebühr, ab 99 €/Monat inklusive Hosting, SEO & Support.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    siteName: 'Webseitenverlag Deutschland',
    locale: 'de_DE',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Webseitenverlag Deutschland' }],
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
