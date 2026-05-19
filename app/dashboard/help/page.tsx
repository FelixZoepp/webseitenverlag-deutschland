import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HelpCenter from '@/components/help-center'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HelpPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase.from('customers').select('*').eq('user_id', user.id).single()
  if (!customer) redirect('/login')

  // Erste Site finden für Zurück-Link
  const { data: sites } = await supabase
    .from('sites').select('id').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(1)

  const backUrl = sites && sites.length > 0 ? `/dashboard/${sites[0].id}` : '/dashboard'
  const customerPackage = customer.package || 'starter'

  return (
    <div style={{ minHeight: '100vh' }}>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E7EB', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)' }}>
        <Link href={backUrl} style={{ fontSize: '14px', color: '#3B82F6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← Zurück zum Editor
        </Link>
      </div>
      <HelpCenter customerPackage={customerPackage} />
    </div>
  )
}
