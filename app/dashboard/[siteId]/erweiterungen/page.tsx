import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ErweiterungenListe from '@/components/erweiterungen-liste'
import { UPSELL_PRODUCTS, PLAN_UPGRADE_PREFIX, NERV_SCHUTZ_TAGE } from '@/config/upsells'
import { naechsterPlan } from '@/config/plans'
import { getPackage, type PackageTier } from '@/lib/packages'

export const dynamic = 'force-dynamic'

/**
 * Portal-Kacheln (§10.4 Kaufweg 2): Upsell-Katalog + Plan-Upgrade.
 * Aktive Module werden markiert, kürzlich abgelehnte (Nerv-Schutz 60 Tage)
 * werden NICHT beworben, sind aber buchbar, wenn der Kunde selbst herkommt.
 */
export default async function ErweiterungenPage({ params }: { params: { siteId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, role, package')
    .eq('user_id', user.id)
    .single()
  if (!customer) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('id, package')
    .eq('id', params.siteId)
    .eq('customer_id', customer.id)
    .single()
  if (!site && customer.role !== 'admin') redirect('/dashboard')

  const tier = ((site?.package as PackageTier) || (customer.package as PackageTier) || 'starter')

  const { data: aktive } = await supabase
    .from('activated_upsells')
    .select('upsell_id')
    .eq('customer_id', customer.id)
    .is('deaktiviert_am', null)
  const aktiveKeys = (aktive || []).map((a: { upsell_id: string }) => a.upsell_id)

  const nervSchutzAb = new Date()
  nervSchutzAb.setDate(nervSchutzAb.getDate() - NERV_SCHUTZ_TAGE)
  const { data: rejections } = await supabase
    .from('upsell_rejections')
    .select('upsell_id')
    .eq('customer_id', customer.id)
    .gte('rejected_at', nervSchutzAb.toISOString())
  const abgelehnteKeys = (rejections || []).map((r: { upsell_id: string }) => r.upsell_id)

  const upgrade = naechsterPlan(tier)
  const upgradeAngebot = upgrade
    ? {
        productKey: `${PLAN_UPGRADE_PREFIX}${upgrade.tier}`,
        name: upgrade.name,
        preisEuro: getPackage(upgrade.tier).price,
        features: getPackage(upgrade.tier).features,
      }
    : null

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <ErweiterungenListe
        siteId={params.siteId}
        produkte={UPSELL_PRODUCTS.map((p) => ({
          key: p.key,
          name: p.name,
          nutzen: [...p.nutzen],
          einmalCent: p.einmalCent,
          monatCent: p.monatCent,
        }))}
        aktiveKeys={aktiveKeys}
        abgelehnteKeys={abgelehnteKeys}
        upgradeAngebot={upgradeAngebot}
      />
    </div>
  )
}
