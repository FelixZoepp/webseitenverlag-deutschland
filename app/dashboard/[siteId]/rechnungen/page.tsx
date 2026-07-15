'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { FileText, Download, Loader2, CreditCard, Calendar, ExternalLink } from 'lucide-react'

interface RechnungsPosten {
  id: string
  typ: string
  bezeichnung: string
  betrag_pro_monat_cent: number
  gueltig_ab: string
  gueltig_bis: string | null
  created_at: string
}

interface KundenDokument {
  id: string
  typ: string
  dateiname: string
  speicher_url: string
  created_at: string
}

export default function RechnungenPage() {
  const params = useParams()
  const siteId = params.siteId as string
  const [posten, setPosten] = useState<RechnungsPosten[]>([])
  const [dokumente, setDokumente] = useState<KundenDokument[]>([])
  const [loading, setLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<{ monatsrate: number; paket: string; vertragsende: string } | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalFehler, setPortalFehler] = useState<string | null>(null)

  async function openBillingPortal() {
    setPortalLoading(true)
    setPortalFehler(null)
    try {
      const res = await fetch(`/api/sites/${siteId}/billing-portal`, { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.url) {
        window.location.href = data.url
        return
      }
      setPortalFehler(data?.error || 'Portal konnte nicht geöffnet werden.')
    } catch {
      setPortalFehler('Portal konnte nicht geöffnet werden.')
    }
    setPortalLoading(false)
  }

  useEffect(() => {
    fetch(`/api/customer/rechnungen?siteId=${siteId}`)
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json()
          setPosten(data.posten || [])
          setDokumente(data.dokumente || [])
          setCustomerInfo(data.info || null)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [siteId])

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px' }}><Loader2 className="w-5 h-5 animate-spin" style={{ color: '#9CA3AF' }} /></div>
  }

  const aktivePosten = posten.filter(p => !p.gueltig_bis || new Date(p.gueltig_bis) > new Date())
  const monatsrate = customerInfo?.monatsrate || aktivePosten.reduce((sum, p) => sum + p.betrag_pro_monat_cent, 0) / 100
  const rechnungsDokumente = dokumente.filter(d => d.typ === 'RECHNUNG' || d.typ === 'ANGEBOT_UNSIGNIERT' || d.typ === 'ANGEBOT_SIGNIERT' || d.typ === 'SEPA_MANDAT_SIGNIERT')

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
        Rechnungen & Abrechnung
      </h1>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
        Ihre aktuelle Abrechnung und Vertragsdokumente
      </p>

      {/* Stripe Customer Portal */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={openBillingPortal}
          disabled={portalLoading}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', borderRadius: '10px', border: '1px solid #E5E7EB',
            background: '#fff', color: '#111827', fontSize: '14px', fontWeight: 600,
            cursor: portalLoading ? 'wait' : 'pointer',
          }}
        >
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink style={{ width: '15px', height: '15px', color: '#6B7280' }} />}
          Zahlungsmethode & Rechnungen verwalten
        </button>
        <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px' }}>
          Öffnet das sichere Stripe-Kundenportal — dort können Sie Ihre Zahlungsmethode ändern und Rechnungen herunterladen.
        </p>
        {portalFehler && (
          <p style={{ fontSize: '13px', color: '#B91C1C', marginTop: '6px' }}>{portalFehler}</p>
        )}
      </div>

      {/* Übersicht */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CreditCard style={{ width: '16px', height: '16px', color: '#6B7280' }} />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Monatsrate</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{monatsrate.toFixed(2)} €</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF' }}>netto / Monat</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileText style={{ width: '16px', height: '16px', color: '#6B7280' }} />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Paket</span>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{(customerInfo?.paket || 'starter').charAt(0).toUpperCase() + (customerInfo?.paket || 'starter').slice(1)}</p>
        </div>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Calendar style={{ width: '16px', height: '16px', color: '#6B7280' }} />
            <span style={{ fontSize: '12px', color: '#6B7280' }}>Vertragsende</span>
          </div>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
            {customerInfo?.vertragsende ? new Date(customerInfo.vertragsende).toLocaleDateString('de-DE') : '—'}
          </p>
        </div>
      </div>

      {/* Aktive Posten */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
        Aktive Abrechnungsposten
      </h2>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: '32px' }}>
        {aktivePosten.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Keine aktiven Posten</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Bezeichnung</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Typ</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Betrag/Mt</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Seit</th>
              </tr>
            </thead>
            <tbody>
              {aktivePosten.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', fontWeight: 500 }}>{p.bezeichnung}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: p.typ === 'PAKET_BASIS' ? '#EFF6FF' : '#F0FDF4', color: p.typ === 'PAKET_BASIS' ? '#1D4ED8' : '#16A34A' }}>
                      {p.typ === 'PAKET_BASIS' ? 'Basis' : p.typ === 'UPSELL_AKTIVIERUNG' ? 'Upsell' : p.typ}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#111827' }}>{(p.betrag_pro_monat_cent / 100).toFixed(2)} €</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', color: '#6B7280' }}>{new Date(p.gueltig_ab).toLocaleDateString('de-DE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dokumente */}
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
        Vertragsdokumente
      </h2>
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {rechnungsDokumente.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: '14px' }}>Keine Dokumente vorhanden</p>
        ) : (
          <div>
            {rechnungsDokumente.map((doc) => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText style={{ width: '16px', height: '16px', color: '#1D4ED8' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{doc.dateiname}</p>
                    <p style={{ fontSize: '12px', color: '#6B7280' }}>{new Date(doc.created_at).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
                {doc.speicher_url && (
                  <a href={doc.speicher_url} download={doc.dateiname}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#1D4ED8', textDecoration: 'none' }}>
                    <Download style={{ width: '14px', height: '14px' }} /> Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
