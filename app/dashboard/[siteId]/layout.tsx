import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerSidebar from '@/components/customer-sidebar'

export const dynamic = 'force-dynamic'

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { siteId: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase.from('customers').select('*').eq('user_id', user.id).single()
  if (!customer) redirect('/login')

  const isAdmin = customer.role === 'admin'

  const { data: site } = await supabase
    .from('sites').select('*').eq('id', params.siteId).eq('customer_id', customer.id).single()

  if (!site) redirect('/dashboard')

  // Onboarding-Kunden: kein Sidebar, nur der Content
  const onboardingDone = customer.onboarding_completed === true
  const siteIsLive = site.status === 'published'
  const showSidebar = isAdmin || onboardingDone || siteIsLive

  if (!showSidebar) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <main style={{ minWidth: 0, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    )
  }

  // Unread leads count
  const { count: unreadLeads } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('site_id', params.siteId)
    .eq('status', 'new')

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <CustomerSidebar
        siteId={params.siteId}
        siteName={site.name as string}
        siteStatus={site.status as string}
        siteDomain={(site.domain as string) || ''}
        sitePackage={(site.package as string) || 'starter'}
        customerName={(customer.company_name as string) || (customer.contact_email as string) || ''}
        isAdmin={isAdmin}
        unreadLeads={unreadLeads || 0}
      />
      <main style={{ minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
