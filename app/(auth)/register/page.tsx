import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div style={{ background: '#F1F5FB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '640px', height: '640px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.55, background: 'radial-gradient(circle, #BFD7F4 0%, transparent 65%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Webseitenverlag Deutschland" style={{ height: '56px', width: 'auto', margin: '0 auto' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(22px) saturate(140%)', border: '1px solid rgba(15,30,60,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 36px -18px rgba(15,30,60,0.16)' }}>
          <h1 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '22px', color: '#0B1322', marginBottom: '16px' }}>Registrierung</h1>
          <p style={{ fontSize: '13px', color: 'rgba(11,19,34,0.52)', marginBottom: '20px', lineHeight: 1.6 }}>
            Die Registrierung ist nur über Einladung möglich.
            Bitte wende dich an deinen Ansprechpartner.
          </p>
          <Link href="/login" style={{ fontSize: '12px', color: '#2A6FDB', textDecoration: 'none', fontWeight: 600 }}>
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  )
}
