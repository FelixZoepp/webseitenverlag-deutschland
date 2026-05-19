'use client'

import { useState } from 'react'
import { Rocket, Loader2, Check } from 'lucide-react'

export default function FreigabeBanner({ siteId }: { siteId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleFreigabe() {
    if (!confirm('Webseite jetzt freigeben und live schalten?')) return
    setLoading(true)
    const res = await fetch('/api/customer/freigeben', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteId }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  if (done) {
    return (
      <div style={{ padding: '12px 24px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <Check style={{ width: '16px', height: '16px', color: '#16A34A' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#16A34A' }}>Webseite freigeschaltet!</span>
      </div>
    )
  }

  return (
    <div style={{
      padding: '10px 24px', background: 'linear-gradient(90deg, #F0FDF4, #DCFCE7)',
      borderBottom: '1px solid #BBF7D0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontSize: '13px', color: '#374151' }}>
        Ihre Webseite ist bereit. Prüfen Sie die Vorschau und geben Sie frei.
      </span>
      <button onClick={handleFreigabe} disabled={loading} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 16px', borderRadius: '6px', fontSize: '12px',
        fontWeight: 600, background: '#16A34A', color: '#fff',
        border: 'none', cursor: 'pointer',
      }}>
        {loading
          ? <Loader2 className="w-3 h-3 animate-spin" />
          : <Rocket style={{ width: '12px', height: '12px' }} />}
        Freigeben
      </button>
    </div>
  )
}
