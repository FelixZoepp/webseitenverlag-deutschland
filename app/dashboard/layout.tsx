import './dashboard.css'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--za-obsidian)', minHeight: '100vh' }}>
      <div className="aurora" aria-hidden="true"><div className="blob3" /></div>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  )
}
