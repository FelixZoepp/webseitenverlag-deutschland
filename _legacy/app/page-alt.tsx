import Link from 'next/link'

export default function HomePage() {
  return (
    <div style={{ background: '#F1F5FB', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <nav style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <img src="/logo.png" alt="Webseitenverlag Deutschland" style={{ height: '44px', width: 'auto' }} />
        <Link href="/login" style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #5C9EE8, #2A6FDB, #0B244F)', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
          Anmelden
        </Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#0B1322', marginBottom: '20px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          Deine Website.<br />
          <span style={{ background: 'linear-gradient(135deg, #5C9EE8, #2A6FDB, #0B244F)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Einfach mit KI verwaltet.</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'rgba(11,19,34,0.6)', maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.65 }}>
          Professionelle Webseiten für lokale Unternehmen. Verwalte deine Inhalte per Chat — ohne Programmierkenntnisse.
        </p>
        <Link href="/login" style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #5C9EE8, #2A6FDB, #0B244F)', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', boxShadow: '0 4px 20px rgba(42,111,219,0.40)' }}>
          Zum Dashboard
        </Link>
      </main>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  )
}
