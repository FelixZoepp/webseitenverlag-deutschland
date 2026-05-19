import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeadsView from '@/components/leads-view'

export const dynamic = 'force-dynamic'

export default async function LeadsPage({
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

  return <LeadsView site={site} />
}
