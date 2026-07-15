import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FertigstellungsWizard from '@/components/fertigstellungs-wizard'
import { getUpsellProduct } from '@/config/upsells'

export const dynamic = 'force-dynamic'

export default async function FertigstellenPage({ params }: { params: { siteId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, role')
    .eq('user_id', user.id)
    .single()
  if (!customer) redirect('/login')

  const { data: site } = await supabase
    .from('sites')
    .select('id')
    .eq('id', params.siteId)
    .eq('customer_id', customer.id)
    .single()
  if (!site && customer.role !== 'admin') redirect('/dashboard')

  const seo = getUpsellProduct('seo-unterseiten-abo')!

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <FertigstellungsWizard
        siteId={params.siteId}
        seoAngebot={{ key: seo.key, name: seo.name, nutzen: [...seo.nutzen], monatCent: seo.monatCent }}
      />
    </div>
  )
}
