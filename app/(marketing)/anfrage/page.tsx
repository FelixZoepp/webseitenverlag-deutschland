import type { Metadata } from 'next'
import FunnelPage from '@/components/landing/FunnelPage'

export const metadata: Metadata = {
  title: 'Kostenlosen Website-Entwurf anfordern – Webseiten-Verlag Deutschland',
  description:
    'In 2 Minuten anfragen: Professionelle Website ab 99 € netto/Monat, in 24 Stunden online. Kostenloser Entwurf, keine Startgebühr.',
  // Ads-Funnel: nicht in den Google-Index (vermeidet Duplicate-Content zur Landing)
  robots: { index: false, follow: false },
}

export default function AnfragePage() {
  return <FunnelPage />
}
