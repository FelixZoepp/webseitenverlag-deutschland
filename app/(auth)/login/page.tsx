'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{ background: '#F1F5FB', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '640px', height: '640px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.55, background: 'radial-gradient(circle, #BFD7F4 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '720px', height: '720px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.7, background: 'radial-gradient(circle, #D8E5F7 0%, transparent 60%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Webseitenverlag Deutschland" style={{ height: '56px', width: 'auto', margin: '0 auto' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(22px) saturate(140%)', WebkitBackdropFilter: 'blur(22px) saturate(140%)', border: '1px solid rgba(15,30,60,0.08)', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 36px -18px rgba(15,30,60,0.16)' }}>
          <h1 style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '22px', color: '#0B1322', textAlign: 'center', marginBottom: '24px' }}>Anmelden</h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '10px', color: 'rgba(11,19,34,0.52)', marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>E-Mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mail@example.com"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,30,60,0.08)', borderRadius: '10px', fontSize: '13px', color: '#0B1322', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '10px', color: 'rgba(11,19,34,0.52)', marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Passwort</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(15,30,60,0.08)', borderRadius: '10px', fontSize: '13px', color: '#0B1322', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {error && <p style={{ color: '#C7453A', fontSize: '12px' }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #5C9EE8, #2A6FDB, #0B244F)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: '0 4px 14px -4px rgba(42,111,219,0.50)', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: 'rgba(11,19,34,0.34)' }}>
            Zugang nur über Einladung.
          </p>
        </div>
      </div>

      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </div>
  )
}
