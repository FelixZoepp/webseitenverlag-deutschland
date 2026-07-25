import type { Metadata } from 'next'
import './marketing.css'

// Apple-System-Font-Stack (siehe --font-ui in marketing.css) —
// kein Font-Download nötig, bestes LCP

export const metadata: Metadata = {
  title: 'Webseiten-Verlag Deutschland — Professionelle Webseiten ab 99 € netto/Monat',
  description:
    'Professionelle Webseiten in 24 Stunden online. Keine Startgebühr, ab 99 € netto/Monat all-inclusive: Hosting, SEO, KI-Editor & Support.',
  keywords: [
    'Webseite erstellen lassen',
    'Webdesign günstig',
    'Homepage erstellen',
    'Webseite mieten',
    'Webdesign Deutschland',
    'Webseiten-Verlag',
  ],
  openGraph: {
    title: 'Webseiten-Verlag Deutschland — Professionelle Webseiten ab 99 € netto/Monat',
    description: 'In 24 h online. Keine Startgebühr. Ab 99 €/Monat all-inclusive.',
    type: 'website',
    locale: 'de_DE',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Webseiten-Verlag Deutschland' }],
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="marketing-root">
      {children}
      {/* Facebook Pixel */}
      <script
        dangerouslySetInnerHTML={{
          __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','27917831847833468');fbq('track','PageView');`,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=27917831847833468&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </div>
  )
}
