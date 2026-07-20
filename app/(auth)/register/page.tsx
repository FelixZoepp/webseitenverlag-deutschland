import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div style={{ background: '#F5F6F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '640px', height: '640px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.55, background: 'radial-gradient(circle, #FADCE0 0%, transparent 65%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Webseitenverlag Deutschland" style={{ height: '56px', width: 'auto', margin: '0 auto' }} />
        </div>
        <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(22px) saturate(140%)', border: '1px solid rgba(23,24,26,0.07)', borderRadius: '16px', padding: '32px', textAlign: 'center', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 36px -18px rgba(23,24,26,0.12)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: '#17181A', marginBottom: '16px' }}>Registrierung</h1>
          <p style={{ fontSize: '13px', color: '#5A5D63', marginBottom: '20px', lineHeight: 1.6 }}>
            Die Registrierung ist nur über Einladung möglich.
            Bitte wende dich an deinen Ansprechpartner.
          </p>
          <Link href="/login" style={{ fontSize: '12px', color: '#E0354B', textDecoration: 'none', fontWeight: 600 }}>
            Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  )
}
