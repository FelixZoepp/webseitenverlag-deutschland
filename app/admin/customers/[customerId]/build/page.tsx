'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles, Check, Eye, Rocket, Image } from 'lucide-react'

interface KundenBild {
  id: string
  slot_id: string | null
  dateiname: string
  public_url: string
  ki_zuordnung: string | null
}

interface SiteInfo {
  id: string
  name: string
  template_id: string
  status: string
  config: Record<string, unknown>
}

export default function BuildPage() {
  const params = useParams()
  const customerId = params.customerId as string

  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null)
  const [sites, setSites] = useState<SiteInfo[]>([])
  const [bilder, setBilder] = useState<KundenBild[]>([])
  const [loading, setLoading] = useState(true)
  const [transcript, setTranscript] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/customers/${customerId}`).then(async (r) => {
      if (r.ok) {
        const data = await r.json()
        setCustomer(data)
        setSites(data.sites || [])
        setBilder(data.kunden_bilder || [])
        // Pre-fill transcript from Fireflies if available
        if (data.fireflies_transkript) {
          setTranscript(data.fireflies_transkript)
        }
      }
      setLoading(false)
    })
  }, [customerId])

  const site = sites[0] as SiteInfo | undefined
  const zugeordneteBilder = bilder.filter((b) => b.slot_id)
  const nichtZugeordnet = bilder.filter((b) => !b.slot_id)

  async function handleGenerate() {
    if (!site || !transcript.trim()) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/build-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteId: site.id,
          customerId,
          transcript: transcript.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setGenerated(true)
      setPreviewUrl(data.previewUrl)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler bei der Generierung')
    } finally {
      setGenerating(false)
    }
  }

  async function handlePublish() {
    if (!site) return
    setPublishing(true)
    try {
      await fetch(`/api/sites/${site.id}/publish`, { method: 'POST' })
      setPublished(true)
    } catch {
      setError('Publish fehlgeschlagen')
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!customer) return <div className="p-8 text-center text-gray-500">Kunde nicht gefunden</div>

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <Link href={`/admin/customers/${customerId}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Kundenakte
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Webseite bauen: {customer.company_name as string}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Template: <strong>{site?.template_id || '—'}</strong> · {bilder.length} Bilder hochgeladen
      </p>

      {/* Bilder-Übersicht */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Image className="w-4 h-4" /> Kunden-Bilder ({bilder.length})
        </h2>

        {bilder.length === 0 ? (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg p-4">
            Keine Bilder hochgeladen. Die Webseite wird mit Platzhaltern generiert.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-6 gap-3 mb-4">
              {bilder.map((bild) => (
                <div key={bild.id} className="relative group">
                  <img src={bild.public_url} alt={bild.dateiname}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-b-lg truncate">
                    {bild.slot_id || 'nicht zugeordnet'}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {zugeordneteBilder.length} zugeordnet · {nichtZugeordnet.length} nicht zugeordnet
            </p>
          </>
        )}
      </div>

      {/* Transkript */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-2">Onboarding-Transkript / Briefing</h2>
        <p className="text-xs text-gray-500 mb-4">
          Füge hier das Transkript aus dem Onboarding-Call ein, oder beschreibe das Unternehmen.
          {customer.fireflies_transkript ? ' (Fireflies-Transkript wurde vorausgefüllt)' : ''}
        </p>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={`Beispiel:\n\nDas ist ${customer.company_name || 'die Firma'}. Wir machen...\nUnsere Adresse ist...\nÖffnungszeiten: Mo-Fr 10-19 Uhr\nUnsere Spezialitäten sind...\nDas Team besteht aus...`}
        />
        {customer.closer_notiz ? (
          <div className="mt-3 bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Closer-Notiz ({customer.closer_name as string}):</p>
            <p className="text-sm text-gray-700">{String(customer.closer_notiz)}</p>
          </div>
        ) : null}
      </div>

      {/* Aktionen */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!generated ? (
        <button
          onClick={handleGenerate}
          disabled={generating || !transcript.trim() || !site}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {generating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> KI generiert die Webseite...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Webseite generieren</>
          )}
        </button>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Webseite generiert!</h3>
          <p className="text-sm text-gray-600 mb-6">
            Die Konfiguration wurde erstellt und die Bilder eingesetzt.
          </p>

          <div className="flex gap-3 justify-center">
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                <Eye className="w-4 h-4" /> Vorschau ansehen
              </a>
            )}

            {!published ? (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {publishing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Wird veröffentlicht...</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Live schalten</>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <Check className="w-4 h-4" /> Webseite ist live!
              </div>
            )}
          </div>

          <button
            onClick={() => { setGenerated(false); setError(null) }}
            className="mt-4 text-xs text-gray-500 hover:text-gray-700"
          >
            Nochmal generieren (überschreibt die aktuelle Version)
          </button>
        </div>
      )}
    </main>
  )
}
