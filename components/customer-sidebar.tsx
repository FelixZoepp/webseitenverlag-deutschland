'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, BarChart3, Mail, Zap, FileText, HelpCircle, Settings, LogOut, Globe, ExternalLink, Image, Receipt } from 'lucide-react'

interface Props {
  siteId: string
  siteName: string
  siteStatus: string
  siteDomain: string
  sitePackage: string
  customerName: string
  isAdmin: boolean
  unreadLeads: number
}

export default function CustomerSidebar({ siteId, siteName, siteStatus, siteDomain, sitePackage, customerName, isAdmin, unreadLeads }: Props) {
  const pathname = usePathname()
  const base = `/dashboard/${siteId}`

  const isActive = (path: string) => {
    if (path === base) return pathname === base
    return pathname.startsWith(path)
  }

  const packageLabel = sitePackage === 'growth' ? '🥇 Growth' : sitePackage === 'business' ? '🥈 Business' : '🥉 Starter'

  const navItems = [
    { href: base, label: 'Editor', icon: <MessageSquare className="w-4 h-4" />, badge: null },
    { href: `${base}/analytics`, label: 'Analytics', icon: <BarChart3 className="w-4 h-4" />, badge: null },
    { href: `${base}/leads`, label: 'Anfragen', icon: <Mail className="w-4 h-4" />, badge: unreadLeads > 0 ? unreadLeads : null },
    { href: `${base}/bilder`, label: 'Bilder', icon: <Image className="w-4 h-4" />, badge: null },
    { href: `${base}/rechnungen`, label: 'Rechnungen', icon: <Receipt className="w-4 h-4" />, badge: null },
    { href: `${base}/upgrade`, label: 'Erweiterungen', icon: <Zap className="w-4 h-4" />, badge: null },
  ]

  const bottomItems = [
    { href: '/dashboard/help', label: 'Hilfe & FAQ', icon: <HelpCircle className="w-4 h-4" /> },
  ]

  return (
    <aside className="customer-sidebar" style={{
      position: 'sticky', top: 0, height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'rgba(255,255,255,0.62)',
      backdropFilter: 'blur(24px) saturate(140%)',
      WebkitBackdropFilter: 'blur(24px) saturate(140%)',
      borderRight: '1px solid var(--za-border)',
      padding: '20px 14px',
      gap: '8px',
    }}>
      {/* Site info */}
      <div style={{ padding: '0 8px 16px', borderBottom: '1px solid var(--za-border)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--za-gold-grad)', display: 'grid', placeItems: 'center',
            fontFamily: "'Noto Serif', Georgia, serif", fontSize: '14px', color: '#fff', flexShrink: 0,
          }}>
            {siteName.charAt(0)}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--za-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{siteName}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={siteStatus === 'published' ? 'glass-status-live' : 'glass-status-draft'} style={{ fontSize: '8px', padding: '1px 6px' }}>
                {siteStatus === 'published' ? 'Live' : 'Entwurf'}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--za-fg-4)' }}>{packageLabel}</span>
            </div>
          </div>
        </div>
        {siteDomain && (
          <a href={`https://${siteDomain}`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--za-fg-4)', textDecoration: 'none' }}>
            <Globe style={{ width: '10px', height: '10px' }} /> {siteDomain} <ExternalLink style={{ width: '8px', height: '8px' }} />
          </a>
        )}
      </div>

      {/* Main nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ padding: '0 8px 8px', fontWeight: 700, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--za-fg-4)' }}>
          Website
        </div>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`glass-nav-item ${isActive(item.href) ? 'active' : ''}`}
            style={{
              padding: '9px 12px', fontSize: '13px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '10px', position: 'relative',
            }}>
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <span style={{
                marginLeft: 'auto', background: 'var(--za-gold-grad)', color: '#fff',
                fontWeight: 700, fontSize: '10px', padding: '1px 7px', borderRadius: '999px',
              }}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Admin shortcut */}
      {isAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '8px' }}>
          <div style={{ padding: '0 8px 8px', fontWeight: 700, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--za-fg-4)' }}>
            Admin
          </div>
          <Link href="/admin" className="glass-nav-item" style={{ padding: '9px 12px', fontSize: '13px', textDecoration: 'none' }}>
            <Settings className="w-4 h-4" /> Admin-Dashboard
          </Link>
          <Link href="/dashboard" className="glass-nav-item" style={{ padding: '9px 12px', fontSize: '13px', textDecoration: 'none' }}>
            <FileText className="w-4 h-4" /> Alle Sites
          </Link>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid var(--za-border)', paddingTop: '12px' }}>
        {bottomItems.map((item) => (
          <Link key={item.href} href={item.href}
            className={`glass-nav-item ${isActive(item.href) ? 'active' : ''}`}
            style={{ padding: '9px 12px', fontSize: '13px', textDecoration: 'none' }}>
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {/* User */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '10px',
        background: 'var(--za-surface)', border: '1px solid var(--za-border)',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'var(--za-gold-grad)', display: 'grid', placeItems: 'center',
          fontFamily: "'Noto Serif', Georgia, serif", fontSize: '11px', color: '#fff',
        }}>
          {customerName.charAt(0) || '?'}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--za-fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{customerName}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" title="Abmelden" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--za-fg-4)' }}>
            <LogOut style={{ width: '14px', height: '14px' }} />
          </button>
        </form>
      </div>
    </aside>
  )
}
