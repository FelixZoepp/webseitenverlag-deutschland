'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check, FileText } from 'lucide-react'

interface Posten {
  id: string
  customer_id: string
  typ: string
  bezeichnung: string
  betrag_pro_monat_cent: number
  gueltig_ab: string
  gueltig_bis: string | null
  extern_uebertragen: boolean
  extern_ref: string | null
  created_at: string
  customers: { id: string; company_name: string; contact_email: string }
}

export default function OffenePostenPage() {
  const [posten, setPosten] = useState<Posten[]>([])
  const [loading, setLoading] = useState(true)

  function loadPosten() {
    setLoading(true)
    fetch('/api/admin/rechnungsposten').then(async (r) => {
      if (r.ok) setPosten(await r.json())
      setLoading(false)
    })
  }

  useEffect(() => { loadPosten() }, [])

  async function markAsTransferred(postenId: string) {
    const ref = prompt('Externe Referenz (z.B. Lexoffice-ID, Rechnungsnr.):')
    if (ref === null) return

    await fetch(`/api/admin/rechnungsposten/${postenId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ externRef: ref || 'manuell' }),
    })
    loadPosten()
  }

  const typLabels: Record<string, string> = {
    UPSELL_AKTIVIERUNG: 'Upsell',
    UPSELL_DEAKTIVIERUNG: 'Deaktivierung',
    PAKET_UPGRADE: 'Paket-Upgrade',
    PAKET_BASIS: 'Basis-Paket',
  }

  const typColors: Record<string, string> = {
    UPSELL_AKTIVIERUNG: 'bg-blue-100 text-blue-700',
    UPSELL_DEAKTIVIERUNG: 'bg-red-100 text-red-700',
    PAKET_UPGRADE: 'bg-purple-100 text-purple-700',
    PAKET_BASIS: 'bg-gray-100 text-gray-700',
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offene Rechnungsposten</h1>
          <p className="text-sm text-gray-500">Posten, die noch nicht an ein Payment-System übertragen wurden</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : posten.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Check className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">Keine offenen Posten</p>
          <p className="text-sm text-gray-400">Alle Posten wurden übertragen.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Kunde</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Typ</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Bezeichnung</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Betrag/Mt</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Gültig ab</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posten.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <Link href={`/admin/customers/${p.customer_id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {p.customers?.company_name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typColors[p.typ] || 'bg-gray-100 text-gray-600'}`}>
                      {typLabels[p.typ] || p.typ}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{p.bezeichnung}</td>
                  <td className="px-4 py-3 text-sm text-right font-mono font-medium">{(p.betrag_pro_monat_cent / 100).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.gueltig_ab).toLocaleDateString('de-DE')}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => markAsTransferred(p.id)} className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 font-medium">
                      Als übertragen markieren
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
