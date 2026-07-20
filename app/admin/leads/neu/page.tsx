'use client'

/**
 * Phase 3 (MVP_FINISH_PROMPT §4.1): 2-Minuten-Formular.
 * Pflicht: Firma, Branche (approved), Stadt, Telefon, 3–8 Leistungen.
 * Optional: USPs, Öffnungszeiten, E-Mail, Notizen.
 * Dieses Formular ist die EINZIGE Datenquelle der Generierung.
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Zap } from 'lucide-react'

interface Branche {
  branche_key: string
  name: string
  quality_status: string
}

function zeilen(text: string): string[] {
  return text.split('\n').map((z) => z.trim()).filter((z) => z.length >= 2)
}

export default function NeuerLeadPage() {
  const router = useRouter()
  const [branchen, setBranchen] = useState<Branche[]>([])
  const [firma, setFirma] = useState('')
  const [brancheKey, setBrancheKey] = useState('')
  const [stadt, setStadt] = useState('')
  const [telefon, setTelefon] = useState('')
  const [leistungenText, setLeistungenText] = useState('')
  const [uspsText, setUspsText] = useState('')
  const [oeffnungszeitenText, setOeffnungszeitenText] = useState('')
  const [email, setEmail] = useState('')
  const [notizen, setNotizen] = useState('')
  const [sofortGenerieren, setSofortGenerieren] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/branchen')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.branchen) {
          const approved = (data.branchen as Branche[]).filter((b) => b.quality_status === 'approved')
          setBranchen(approved)
          if (approved.length > 0) setBrancheKey(approved[0].branche_key)
        }
      })
      .catch(() => {})
  }, [])

  async function speichern(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const leistungen = zeilen(leistungenText)
    if (leistungen.length < 3 || leistungen.length > 8) {
      setError('Bitte 3–8 Leistungen angeben (eine pro Zeile).')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firma,
          branche_key: brancheKey,
          stadt,
          telefon,
          leistungen,
          usps: zeilen(uspsText),
          oeffnungszeiten: zeilen(oeffnungszeitenText),
          email: email || undefined,
          notizen: notizen || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Speichern fehlgeschlagen.')
        return
      }

      if (sofortGenerieren && data.leadId) {
        // Ein-Klick: direkt generieren (§4.2) — Ergebnis erscheint in der Liste
        fetch(`/api/admin/leads/${data.leadId}/generieren`, { method: 'POST' }).catch(() => {})
      }
      router.push('/admin/leads')
    } catch {
      setError('Netzwerkfehler beim Speichern.')
    } finally {
      setBusy(false)
    }
  }

  const feld = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--za-border)', background: 'rgba(255,255,255,0.7)', fontSize: '13px', color: 'var(--za-fg)' } as const
  const label = { display: 'block', fontWeight: 700, fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--za-fg-3)', marginBottom: '6px' } as const

  return (
    <div className="fade-up" style={{ maxWidth: '640px' }}>
      <div className="topbar">
        <Link href="/admin/leads" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--za-fg-2)' }}>
          <ArrowLeft size={16} />
        </Link>
        <div>
          <div className="tb-eyebrow">Closer</div>
          <div className="tb-heading">Neuer Lead — 2-Minuten-Formular</div>
        </div>
      </div>

      <form onSubmit={speichern} className="panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={label}>Firma *</label>
            <input style={feld} value={firma} onChange={(e) => setFirma(e.target.value)} required minLength={2} placeholder="Glanzwerk Gebäudereinigung" />
          </div>
          <div>
            <label style={label}>Branche *</label>
            <select style={feld} value={brancheKey} onChange={(e) => setBrancheKey(e.target.value)} required>
              {branchen.length === 0 && <option value="">Lade Branchen…</option>}
              {branchen.map((b) => (
                <option key={b.branche_key} value={b.branche_key}>{b.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Stadt *</label>
            <input style={feld} value={stadt} onChange={(e) => setStadt(e.target.value)} required minLength={2} placeholder="Ludwigsburg" />
          </div>
          <div>
            <label style={label}>Telefon *</label>
            <input style={feld} value={telefon} onChange={(e) => setTelefon(e.target.value)} required minLength={5} placeholder="07141 123456" />
          </div>
        </div>

        <div>
          <label style={label}>Leistungen * (3–8, eine pro Zeile)</label>
          <textarea style={{ ...feld, minHeight: '110px', fontFamily: 'inherit' }} value={leistungenText} onChange={(e) => setLeistungenText(e.target.value)} required placeholder={'Unterhaltsreinigung\nGlasreinigung\nBauendreinigung'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={label}>USPs (optional, je Zeile)</label>
            <textarea style={{ ...feld, minHeight: '80px', fontFamily: 'inherit' }} value={uspsText} onChange={(e) => setUspsText(e.target.value)} placeholder={'Festes Team\nÖko-Reinigungsmittel'} />
          </div>
          <div>
            <label style={label}>Öffnungszeiten (optional, je Zeile)</label>
            <textarea style={{ ...feld, minHeight: '80px', fontFamily: 'inherit' }} value={oeffnungszeitenText} onChange={(e) => setOeffnungszeitenText(e.target.value)} placeholder={'Mo–Fr 8–18 Uhr'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={label}>E-Mail (optional)</label>
            <input style={feld} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@firma.de" />
          </div>
          <div>
            <label style={label}>Notizen (optional)</label>
            <input style={feld} value={notizen} onChange={(e) => setNotizen(e.target.value)} placeholder="Empfehlung von …" />
          </div>
        </div>

        {error && <div style={{ fontSize: '12px', color: '#B3261E' }}>{error}</div>}

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="submit"
            disabled={busy || !brancheKey}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '10px', border: 'none', background: 'var(--za-gold-grad)', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: busy ? 'wait' : 'pointer' }}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {sofortGenerieren ? 'Speichern & Demo generieren' : 'Lead speichern'}
          </button>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--za-fg-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={sofortGenerieren} onChange={(e) => setSofortGenerieren(e.target.checked)} />
            Direkt generieren
          </label>
        </div>
      </form>
    </div>
  )
}
