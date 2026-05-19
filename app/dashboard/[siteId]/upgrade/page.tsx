import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UpgradeCheckout from '@/components/upgrade-checkout'

export const dynamic = 'force-dynamic'

export default async function UpgradePage({
  params,
  searchParams,
}: {
  params: { siteId: string }
  searchParams: { upsell?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase.from('customers').select('*').eq('user_id', user.id).single()
  if (!customer) redirect('/login')

  const { data: site } = await supabase.from('sites').select('*').eq('id', params.siteId).eq('customer_id', customer.id).single()
  if (!site) redirect('/dashboard')

  return (
    <UpgradeCheckout
      site={site}
      customer={customer}
      preselectedUpsellId={searchParams.upsell || null}
    />
  )
}
