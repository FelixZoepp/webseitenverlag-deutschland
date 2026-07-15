'use client'

/**
 * Erweiterungs-Kacheln im Portal (§10.4): Buchen-Button → Stripe-Checkout.
 * Kein Dark Pattern: Preis steht auf der Kachel, aktive Module sind markiert,
 * kürzlich abgelehnte Angebote werden dezent ans Ende sortiert.
 */

import { useState } from 'react'
import { ArrowLeft, Check, Loader2, Sparkles, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface ProduktKachel {
  key: string
  name: string
  nutzen: string[]
  einmalCent: number
  monatCent: number
}

interface UpgradeAngebot {
  productKey: string
  name: string
  preisEuro: number
  features: string[]
}

function euro(cent: number): string {
  return (cent / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function preisZeile(p: ProduktKachel): string {
  const teile: string[] = []
  if (p.einmalCent > 0) teile.push(`${euro(p.einmalCent)} € einmalig`)
  if (p.monatCent > 0) teile.push(`${euro(p.monatCent)} €/Monat`)
  return teile.join(' + ')
}

export default function ErweiterungenListe({
  siteId,
  produkte,
  aktiveKeys,
  abgelehnteKeys,
  upgradeAngebot,
}: {
  siteId: string
  produkte: ProduktKachel[]
  aktiveKeys: string[]
  abgelehnteKeys: string[]
  upgradeAngebot: UpgradeAngebot | null
}) {
  const [laufend, setLaufend] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)

  async function buchen(productKey: string) {
    setLaufend(productKey)
    setFehler(null)
    try {
      const res = await fetch(`/api/sites/${siteId}/upsell-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_key: productKey, quelle: 'portal' }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setFehler(data.error || 'Buchung konnte nicht gestartet werden')
        setLaufend(null)
        return
      }
      window.location.href = data.url
    } catch {
      setFehler('Verbindung fehlgeschlagen. Bitte erneut versuchen.')
      setLaufend(null)
    }
  }

  // Nerv-Schutz: abgelehnte Angebote nicht prominent — ans Ende sortieren
  const sortiert = [...produkte].sort((a, b) => {
    const aAbgelehnt = abgelehnteKeys.includes(a.key) ? 1 : 0
    const bAbgelehnt = abgelehnteKeys.includes(b.key) ? 1 : 0
    return aAbgelehnt - bAbgelehnt
  })

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
      <Link
        href={`/dashboard/${siteId}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#6B7280', fontSize: 14, textDecoration: 'none', marginBottom: 16 }}
      >
        <ArrowLeft size={16} /> Zurück zur Website
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Erweiterungen</h1>
      <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
        Zusatzmodule für mehr Sichtbarkeit und Anfragen — jederzeit buchbar, Preise transparent.
      </p>

      {fehler && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '10px 14px', fontSize: 14, marginBottom: 16 }}>
          {fehler}
        </div>
      )}

      {upgradeAngebot && (
        <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendingUp size={18} color="#1D4ED8" />
            <span style={{ fontWeight: 700, color: '#1E3A8A', fontSize: 16 }}>
              Upgrade auf {upgradeAngebot.name} — {upgradeAngebot.preisEuro} €/Monat
            </span>
          </div>
          <ul style={{ margin: '0 0 14px', paddingLeft: 20, color: '#1E40AF', fontSize: 14 }}>
            {upgradeAngebot.features.slice(0, 4).map((f) => (
              <li key={f} style={{ marginBottom: 2 }}>{f}</li>
            ))}
          </ul>
          <button
            onClick={() => buchen(upgradeAngebot.productKey)}
            disabled={laufend !== null}
            style={{
              background: '#1D4ED8', color: '#fff', border: 'none', borderRadius: 8,
              padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8,
              opacity: laufend && laufend !== upgradeAngebot.productKey ? 0.5 : 1,
            }}
          >
            {laufend === upgradeAngebot.productKey && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            Jetzt upgraden
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {sortiert.map((p) => {
          const aktiv = aktiveKeys.includes(p.key)
          return (
            <div
              key={p.key}
              style={{
                background: '#fff', border: aktiv ? '1px solid #A7F3D0' : '1px solid #E5E7EB',
                borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={16} color={aktiv ? '#059669' : '#6366F1'} />
                <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{p.name}</span>
              </div>
              <ul style={{ margin: '0 0 14px', paddingLeft: 18, color: '#4B5563', fontSize: 13, flex: 1 }}>
                {p.nutzen.map((n) => (
                  <li key={n} style={{ marginBottom: 4 }}>{n}</li>
                ))}
              </ul>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 12 }}>{preisZeile(p)}</div>
              {aktiv ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#059669', fontSize: 14, fontWeight: 600 }}>
                  <Check size={16} /> Aktiv
                </span>
              ) : (
                <button
                  onClick={() => buchen(p.key)}
                  disabled={laufend !== null}
                  style={{
                    background: '#111827', color: '#fff', border: 'none', borderRadius: 8,
                    padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: laufend && laufend !== p.key ? 0.5 : 1,
                  }}
                >
                  {laufend === p.key && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  Buchen
                </button>
              )}
            </div>
          )
        })}
      </div>

      <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 24 }}>
        Monatliche Module sind monatlich kündbar. Nach der Zahlung wird das Modul automatisch für Sie freigeschaltet —
        bei Einrichtungs-Leistungen melden wir uns kurzfristig.
      </p>
    </div>
  )
}
