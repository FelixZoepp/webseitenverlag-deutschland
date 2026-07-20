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
    <div style={{ background: '#F5F6F8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Aurora */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '640px', height: '640px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.55, background: 'radial-gradient(circle, #FADCE0 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '720px', height: '720px', borderRadius: '50%', filter: 'blur(140px)', opacity: 0.7, background: 'radial-gradient(circle, #FDF0F2 0%, transparent 60%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo.png" alt="Webseitenverlag Deutschland" style={{ height: '56px', width: 'auto', margin: '0 auto' }} />
        </div>

        <div style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(22px) saturate(140%)', WebkitBackdropFilter: 'blur(22px) saturate(140%)', border: '1px solid rgba(23,24,26,0.07)', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 0 rgba(255,255,255,0.6) inset, 0 12px 36px -18px rgba(23,24,26,0.12)' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.01em', color: '#17181A', textAlign: 'center', marginBottom: '24px' }}>Anmelden</h1>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '10px', color: '#5A5D63', marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>E-Mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="mail@example.com"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(23,24,26,0.07)', borderRadius: '10px', fontSize: '13px', color: '#17181A', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', fontSize: '10px', color: '#5A5D63', marginBottom: '6px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700 }}>Passwort</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(23,24,26,0.07)', borderRadius: '10px', fontSize: '13px', color: '#17181A', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {error && <p style={{ color: '#B3261E', fontSize: '12px' }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(180deg, #EF5B6F 0%, #E0354B 100%)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', boxShadow: '0 4px 14px -4px rgba(224,53,75,0.45)', opacity: loading ? 0.5 : 1 }}>
              {loading ? 'Wird angemeldet...' : 'Anmelden'}
            </button>
          </form>

          <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#8A8F98' }}>
            Zugang nur über Einladung.
          </p>
        </div>
      </div>

    </div>
  )
}
