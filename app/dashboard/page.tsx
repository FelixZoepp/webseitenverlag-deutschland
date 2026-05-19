import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let { data: customer } = await supabase.from('customers').select('*').eq('user_id', user.id).single()

  if (!customer) {
    const { data: nc } = await supabase.from('customers').insert({ user_id: user.id, contact_email: user.email }).select().single()
    customer = nc
  }

  if (!customer) redirect('/login')

  const isAdmin = customer.role === 'admin'

  // Admin → direkt zum Admin-Dashboard
  if (isAdmin) redirect('/admin')

  // Kunde → direkt zum ersten Projekt
  const { data: sites } = await supabase
    .from('sites').select('id').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(1)

  if (sites && sites.length > 0) {
    redirect(`/dashboard/${sites[0].id}`)
  }

  // Kunde ohne Site → Warteschirm
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '48px', textAlign: 'center', maxWidth: '420px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--za-gold-grad)', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <span style={{ fontSize: '20px' }}>🏗️</span>
        </div>
        <h1 className="za-heading" style={{ marginBottom: '8px', position: 'relative', zIndex: 2 }}>Deine Website wird eingerichtet</h1>
        <p style={{ fontSize: '13px', color: 'var(--za-fg-3)', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
          Dein Ansprechpartner richtet deine Website gerade ein. Du wirst benachrichtigt sobald sie fertig ist.
        </p>
        <p style={{ fontSize: '11px', color: 'var(--za-fg-4)', marginTop: '16px', position: 'relative', zIndex: 2 }}>
          Bei Fragen: <a href="mailto:support@webseitenverlag.de" style={{ color: 'var(--za-gold)', textDecoration: 'none' }}>support@webseitenverlag.de</a>
        </p>
      </div>
    </div>
  )
}
