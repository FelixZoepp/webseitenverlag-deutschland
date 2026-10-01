import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BewertungenView from '@/components/bewertungen-view'

export const dynamic = 'force-dynamic'

export default async function BewertungenPage({
  params,
}: {
  params: { siteId: string }
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!customer) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('*')
    .eq('id', params.siteId)
    .eq('customer_id', customer.id)
    .single()

  if (!site) redirect('/dashboard')

  const { data: requests } = await supabase
    .from('review_requests')
    .select('*')
    .eq('site_id', site.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <BewertungenView site={site} requests={requests || []} />
}
