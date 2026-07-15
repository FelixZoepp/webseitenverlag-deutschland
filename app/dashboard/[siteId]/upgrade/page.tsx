import { redirect } from 'next/navigation'

/**
 * Alte Upgrade-Seite (Phase G §11): Der frühere Modul-Katalog
 * (components/upgrade-checkout.tsx, jetzt _legacy) ist durch den
 * Upsell-Katalog unter /erweiterungen ersetzt. Alte Links leiten weiter.
 */
export default function UpgradePage({ params }: { params: { siteId: string } }) {
  redirect(`/dashboard/${params.siteId}/erweiterungen`)
}
