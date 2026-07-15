import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import './admin.css'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('role, company_name')
    .eq('user_id', user.id)
    .single()

  if (!customer || customer.role !== 'admin') redirect('/dashboard')

  // Get unread lead count
  const { count: unreadLeads } = await supabase
    .from('form_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  return (
    <div style={{ background: 'var(--za-obsidian)', minHeight: '100vh' }}>
      {/* Aurora background */}
      <div className="aurora" aria-hidden="true"><div className="blob3" /></div>

      {/* Google Fonts for serif */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="admin-layout" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '240px 1fr', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sb-brand">
            <img src="/logo.png" alt="WD" style={{ height: '32px', width: 'auto' }} />
            <span className="sb-word" style={{ fontSize: '10px' }}>Admin</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="sb-section-label">Cockpit</div>
            <Link href="/admin" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>
              Overview
            </Link>
            <Link href="/admin/customers" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Kunden & Verträge
            </Link>
            <Link href="/admin/sites" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Sites
              {(unreadLeads || 0) > 0 && <span className="sb-badge">{unreadLeads}</span>}
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="sb-section-label">Abrechnung</div>
            <Link href="/admin/rechnungsposten" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Offene Posten
            </Link>
            <Link href="/admin/vertraege" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l2 2 4-4"/></svg>
              Verträge (24/24/3)
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="sb-section-label">Closer</div>
            <Link href="/admin/demos" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Demo-Maschine
            </Link>
            <Link href="/admin/potenzial-rechner" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
              Potenzial-Rechner
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="sb-section-label">Tools</div>
            <Link href="/admin/templates" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              Templates
            </Link>
            <Link href="/dashboard/onboarding" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
              Neue Site
            </Link>
            <Link href="/dashboard" className="sb-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="16" height="16"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
              Kunden-Ansicht
            </Link>
          </div>

          <div className="sb-user">
            <div className="sb-user-avatar">{(customer.company_name || 'A').charAt(0)}</div>
            <div>
              <div className="sb-user-name">{customer.company_name || user.email}</div>
              <div className="sb-user-role">Administrator</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ padding: '24px 32px 64px', minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  )
}
