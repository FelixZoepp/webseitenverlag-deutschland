'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Mail, Loader2, Zap, X, Check, Package, FileText, Clock, ChevronRight, Download, Building2, CreditCard, Image, Sparkles } from 'lucide-react'
import { VERTRAGS_STATUS_LABELS, VERTRAGS_STATUS_COLORS, type VertragsStatus, type KundenDokument, type VertragsTimeline } from '@/types'

interface UpsellModuleWithStatus {
  id: string
  name: string
  preisProMonatCent: number
  beschreibung: string
  bereitsAktiv: boolean
  aktivierung: { aktiviert_am: string; konfiguration: Record<string, unknown> } | null
  configSchema: { fields: ConfigField[] }
}

interface ConfigField {
  key: string
  label: string
  type: string
  required: boolean
  default?: unknown
  options?: { value: string; label: string }[]
  description?: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [upsells, setUpsells] = useState<UpsellModuleWithStatus[]>([])
  const [upsellsLoading, setUpsellsLoading] = useState(true)
  const [dokumente, setDokumente] = useState<KundenDokument[]>([])
  const [timeline, setTimeline] = useState<VertragsTimeline[]>([])
  const [bilder, setBilder] = useState<{ id: string; slot_id: string | null; dateiname: string; public_url: string; ki_zuordnung: string | null; ki_confidence: number | null; manuell_zugeordnet: boolean }[]>([])
  const [activatingModal, setActivatingModal] = useState<UpsellModuleWithStatus | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'dokumente' | 'upsells' | 'timeline' | 'bilder' | 'briefing'>('overview')

  const loadUpsells = useCallback(() => {
    setUpsellsLoading(true)
    fetch(`/api/admin/customers/${params.customerId}/upsells`).then(async (r) => {
      if (r.ok) setUpsells(await r.json())
      setUpsellsLoading(false)
    })
  }, [params.customerId])

  useEffect(() => {
    fetch(`/api/admin/customers/${params.customerId}`).then(async (r) => {
      if (r.ok) {
        const data = await r.json()
        setCustomer(data)
        setDokumente(data.kunden_dokumente || [])
        setTimeline(data.vertrags_timeline || [])
        setBilder(data.kunden_bilder || [])
      }
      setLoading(false)
    })
    loadUpsells()
  }, [params.customerId, loadUpsells])

  async function handleDelete() {
    if (!confirm('Kunde wirklich löschen? Alle Sites und Dokumente werden ebenfalls gelöscht.')) return
    await fetch(`/api/admin/customers/${params.customerId}`, { method: 'DELETE' })
    window.location.href = '/admin/customers'
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
  if (!customer) return <div className="p-8 text-center text-gray-500">Kunde nicht gefunden</div>

  const sites = (customer.sites || []) as Record<string, unknown>[]
  const aktiveUpsellCount = upsells.filter((u) => u.bereitsAktiv).length
  const upsellSumme = upsells.filter((u) => u.bereitsAktiv).reduce((s, u) => s + u.preisProMonatCent, 0)
  const basisPreis = Number(customer.monthly_price || 0) * 100
  const gesamtrate = (basisPreis + upsellSumme) / 100
  const vertragsStatus = (customer.vertrags_status || 'ENTWURF') as VertragsStatus

  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <Link href="/admin/customers" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Kundenliste
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{customer.company_name as string || 'Unbenannt'}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${VERTRAGS_STATUS_COLORS[vertragsStatus] || 'bg-gray-100 text-gray-700'}`}>
              {VERTRAGS_STATUS_LABELS[vertragsStatus] || vertragsStatus}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {customer.angebots_nummer ? <span className="mr-3">{String(customer.angebots_nummer)}</span> : null}
            {customer.contact_email as string}
          </p>
        </div>
        <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 text-red-600 border border-red-200 rounded-md hover:bg-red-50 text-sm">
          <Trash2 className="w-4 h-4" /> Löschen
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <KPICard label="Paket" value={`${(customer.package as string || 'starter').charAt(0).toUpperCase()}${(customer.package as string || 'starter').slice(1)}`} />
        <KPICard label="Monatsrate" value={`${gesamtrate.toFixed(2)} €`} />
        <KPICard label="Werklohn" value={customer.werklohn_cent ? `${(Number(customer.werklohn_cent) / 100).toLocaleString('de-DE')} €` : '—'} />
        <KPICard label="Aktive Upsells" value={String(aktiveUpsellCount)} />
        <KPICard label="Closer" value={customer.closer_name as string || '—'} />
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {([
          { id: 'overview' as const, label: 'Übersicht', icon: Building2, count: undefined as number | undefined },
          { id: 'dokumente' as const, label: 'Dokumente', icon: FileText, count: dokumente.length },
          { id: 'upsells' as const, label: 'Upsells', icon: Package, count: aktiveUpsellCount },
          { id: 'bilder' as const, label: 'Bilder', icon: Image, count: bilder.length },
          { id: 'briefing' as const, label: 'Briefing', icon: FileText, count: undefined as number | undefined },
          { id: 'timeline' as const, label: 'Timeline', icon: Clock, count: timeline.length },
        ]).map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab: Übersicht */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stammdaten */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Stammdaten</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Firma" value={customer.company_name as string} />
              <InfoRow label="Ansprechpartner" value={customer.ansprechpartner as string} />
              <InfoRow label="E-Mail" value={customer.contact_email as string} />
              <InfoRow label="Telefon" value={customer.telefon as string} />
              <InfoRow label="Adresse" value={[customer.strasse, `${customer.plz || ''} ${customer.ort || ''}`].filter(Boolean).join(', ')} />
              {customer.ust_id_nr ? <InfoRow label="USt-IdNr." value={customer.ust_id_nr as string} /> : null}
              {customer.steuernummer ? <InfoRow label="Steuernummer" value={customer.steuernummer as string} /> : null}
              {customer.branche ? <InfoRow label="Branche" value={customer.branche as string} /> : null}
            </div>
          </div>

          {/* Bankdaten */}
          {customer.iban_kunde ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> SEPA / Bankdaten</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoRow label="IBAN" value={customer.iban_kunde as string} mono />
                {customer.bic_kunde ? <InfoRow label="BIC" value={customer.bic_kunde as string} mono /> : null}
                <InfoRow label="Mandatsreferenz" value={customer.mandats_referenz as string || '—'} mono />
                <InfoRow label="Gläubiger-ID" value={customer.glaeubiger_id as string || 'Noch nicht gesetzt'} />
              </div>
            </div>
          ) : null}

          {/* Vertrag */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4" /> Vertrag</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <InfoRow label="Angebotsnummer" value={customer.angebots_nummer as string || '—'} />
              <InfoRow label="Paket" value={`${(customer.package as string || 'starter').charAt(0).toUpperCase()}${(customer.package as string || 'starter').slice(1)}`} />
              <InfoRow label="Monatsrate" value={`${gesamtrate.toFixed(2)} €`} />
              <InfoRow label="Werklohn" value={customer.werklohn_cent ? `${(Number(customer.werklohn_cent) / 100).toLocaleString('de-DE')} €` : '—'} />
              <InfoRow label="Laufzeit" value={customer.contract_years ? `${customer.contract_years} Jahre` : '—'} />
              <InfoRow label="Vertragsbeginn" value={customer.contract_start ? new Date(customer.contract_start as string).toLocaleDateString('de-DE') : '—'} />
              <InfoRow label="Vertragsende" value={customer.contract_end ? new Date(customer.contract_end as string).toLocaleDateString('de-DE') : '—'} />
              <InfoRow label="Closer" value={customer.closer_name as string || '—'} />
            </div>
            {customer.closer_notiz ? (
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Closer-Notiz:</p>
                <p className="text-sm text-gray-700">{String(customer.closer_notiz)}</p>
              </div>
            ) : null}
          </div>

          {/* Webseite bauen */}
          {sites.length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Webseite bauen</h3>
                <p className="text-sm text-gray-600 mt-1">{bilder.length} Bilder vorhanden · Template: {String(sites[0]?.template_id || '—')}</p>
              </div>
              <Link href={`/admin/customers/${params.customerId}/build`}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 no-underline">
                <Sparkles className="w-4 h-4" /> Webseite generieren
              </Link>
            </div>
          ) : null}

          {/* Nächste Schritte */}
          <NextSteps status={vertragsStatus} customer={customer} />

          {/* Sites */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Sites ({sites.length})</h2>
            </div>
            {sites.length === 0 ? (
              <p className="px-6 py-8 text-center text-gray-400 text-sm">Keine Sites</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {sites.map((site) => (
                  <div key={site.id as string} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <span className="font-medium text-gray-900">{site.name as string}</span>
                      {site.domain ? <span className="text-sm text-gray-500 ml-2">{site.domain as string}</span> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        site.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{site.status === 'published' ? 'Live' : 'Entwurf'}</span>
                      <Link href={`/dashboard/${site.id}`} className="text-xs text-blue-600 hover:underline">Bearbeiten</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <a href={`mailto:${customer.contact_email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline">
              <Mail className="w-4 h-4" /> E-Mail an Kunden senden
            </a>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab: Dokumente */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'dokumente' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Kundenakte ({dokumente.length} Dokumente)</h2>
          </div>
          {dokumente.length === 0 ? (
            <p className="px-6 py-12 text-center text-gray-400 text-sm">Noch keine Dokumente</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {dokumente.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                      doc.typ.includes('SIGNIERT') ? 'bg-green-100 text-green-700' :
                      doc.typ === 'CALL_TRANSCRIPT' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{doc.dateiname}</p>
                      <p className="text-xs text-gray-500">
                        {doc.typ.replace(/_/g, ' ')}
                        {doc.signiert_am && ` · Signiert am ${new Date(doc.signiert_am).toLocaleDateString('de-DE')}`}
                        {' · '}{new Date(doc.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  {doc.speicher_url && (
                    <a href={doc.speicher_url} download={doc.dateiname}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <Download className="w-3 h-3" /> Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab: Upsells */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'upsells' && (
        <div>
          {upsellsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {upsells.map((upsell) => (
                <div key={upsell.id} className={`bg-white rounded-lg border p-4 ${upsell.bereitsAktiv ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{upsell.name}</h3>
                    {upsell.bereitsAktiv && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Aktiv
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{upsell.beschreibung}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{upsell.preisProMonatCent / 100} €<span className="text-xs font-normal text-gray-500">/Mt</span></span>
                    {upsell.bereitsAktiv ? (
                      <DeactivateButton customerId={params.customerId as string} upsellId={upsell.id} upsellName={upsell.name} onDone={loadUpsells} />
                    ) : (
                      <InviteUpsellButton customerId={params.customerId as string} upsellId={upsell.id} upsellName={upsell.name} />
                    )}
                  </div>
                  {upsell.bereitsAktiv && upsell.aktivierung && (
                    <p className="text-xs text-gray-400 mt-2">Seit {new Date(upsell.aktivierung.aktiviert_am).toLocaleDateString('de-DE')}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Tab: Bilder */}
      {activeTab === 'bilder' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Kunden-Bilder ({bilder.length})</h2>
          </div>
          {bilder.length === 0 ? (
            <p className="px-6 py-12 text-center text-gray-400 text-sm">Noch keine Bilder hochgeladen</p>
          ) : (
            <div className="p-6 grid grid-cols-4 gap-4">
              {bilder.map((bild) => (
                <div key={bild.id} className="rounded-lg border border-gray-200 overflow-hidden">
                  <img src={bild.public_url} alt={bild.dateiname} className="w-full h-32 object-cover" />
                  <div className="p-3">
                    <p className="text-xs font-medium text-gray-900 truncate">{bild.dateiname}</p>
                    {bild.slot_id ? (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {bild.slot_id}
                        {bild.ki_confidence ? (
                          <span className="text-purple-600 ml-1">KI {Math.round(bild.ki_confidence * 100)}%</span>
                        ) : null}
                      </p>
                    ) : (
                      <p className="text-xs text-amber-600 mt-1">Nicht zugeordnet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Briefing */}
      {activeTab === 'briefing' && (
        <BriefingTab customerId={params.customerId as string} customer={customer} />
      )}

      {/* Tab: Timeline */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {timeline.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">Keine Einträge</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-200" />
              <div className="space-y-6">
                {timeline.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((entry) => (
                  <div key={entry.id} className="flex gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 z-10">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{entry.ereignis}</p>
                      {entry.details && <p className="text-xs text-gray-500 mt-0.5">{entry.details}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(entry.created_at).toLocaleDateString('de-DE')} um {new Date(entry.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aktivierungs-Modal */}
      {activatingModal && (
        <ActivationModal
          customerId={params.customerId as string}
          upsell={activatingModal}
          onClose={() => setActivatingModal(null)}
          onActivated={() => { setActivatingModal(null); loadUpsells() }}
        />
      )}
    </main>
  )
}

// ============================================================
// Sub-Komponenten
// ============================================================

function KPICard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function InfoRow({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>{' '}
      <span className={`font-medium text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
    </div>
  )
}

function NextSteps({ status, customer }: { status: VertragsStatus; customer: Record<string, unknown> }) {
  const steps: { label: string; done: boolean }[] = []

  steps.push({ label: 'Angebot versendet', done: status !== 'ENTWURF' })
  steps.push({ label: 'Vertrag signiert', done: ['SIGNIERT', 'SEPA_VORBEREITET', 'SEPA_AKTIV', 'ONBOARDING_GEBUCHT', 'WEBSEITE_LIVE', 'ZAHLUNG_AKTIV'].includes(status) })
  steps.push({ label: 'SEPA-Mandat aktiv', done: ['SEPA_AKTIV', 'ONBOARDING_GEBUCHT', 'WEBSEITE_LIVE', 'ZAHLUNG_AKTIV'].includes(status) })
  steps.push({ label: 'Onboarding durchgeführt', done: !!customer.onboarding_erfolgt_am })
  steps.push({ label: 'Webseite live', done: !!customer.webseite_live_am })
  steps.push({ label: 'Erste Rate eingezogen', done: status === 'ZAHLUNG_AKTIV' })

  if (status === 'STORNIERT' || status === 'GEKUENDIGT') return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Nächste Schritte</h2>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              s.done ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {s.done ? <Check className="w-3 h-3 text-green-600" /> : <span className="w-2 h-2 rounded-full bg-gray-300" />}
            </div>
            <span className={`text-sm ${s.done ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InviteUpsellButton({ customerId, upsellId }: {
  customerId: string; upsellId: string; upsellName?: string
}) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleInvite() {
    setLoading(true)
    const res = await fetch(`/api/admin/customers/${customerId}/upsells/${upsellId}/invite`, { method: 'POST' })
    setLoading(false)
    if (res.ok) setSent(true)
  }

  if (sent) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
        <Check className="w-3 h-3" /> Email gesendet
      </span>
    )
  }

  return (
    <button onClick={handleInvite} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Mail className="w-3 h-3" /> Angebot senden</>}
    </button>
  )
}

function DeactivateButton({ customerId, upsellId, upsellName, onDone }: {
  customerId: string; upsellId: string; upsellName: string; onDone: () => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleDeactivate() {
    if (!confirm(`${upsellName} wirklich deaktivieren?`)) return
    setLoading(true)
    await fetch(`/api/admin/customers/${customerId}/upsells/${upsellId}`, { method: 'DELETE' })
    setLoading(false)
    onDone()
  }

  return (
    <button onClick={handleDeactivate} disabled={loading} className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50">
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Deaktivieren'}
    </button>
  )
}

function ActivationModal({ customerId, upsell, onClose, onActivated }: {
  customerId: string; upsell: UpsellModuleWithStatus; onClose: () => void; onActivated: () => void
}) {
  const [config, setConfig] = useState<Record<string, unknown>>(() => {
    const defaults: Record<string, unknown> = {}
    for (const f of upsell.configSchema.fields) {
      if (f.default !== undefined) defaults[f.key] = f.default
    }
    return defaults
  })
  const [activating, setActivating] = useState(false)
  const [result, setResult] = useState<{ success: boolean; neueMonatsrateGesamtCent?: number; fehler?: string } | null>(null)

  async function handleActivate() {
    setActivating(true)
    try {
      const res = await fetch(`/api/admin/customers/${customerId}/upsells/${upsell.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setResult(data)
      } else {
        setResult({ success: false, fehler: data.error || 'Fehler bei Aktivierung' })
      }
    } catch {
      setResult({ success: false, fehler: 'Netzwerkfehler' })
    } finally {
      setActivating(false)
    }
  }

  const requiredMissing = upsell.configSchema.fields.some(
    (f) => f.required && !config[f.key]
  )

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{upsell.name} aktivieren</h2>
            <p className="text-sm text-gray-500">{upsell.preisProMonatCent / 100} €/Monat</p>
          </div>
          <button onClick={result?.success ? onActivated : onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-4">
          {result?.success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{upsell.name} ist jetzt aktiv!</h3>
              {result.neueMonatsrateGesamtCent && (
                <p className="text-sm text-gray-600">Neue Monatsrate: {(result.neueMonatsrateGesamtCent / 100).toFixed(2)} €</p>
              )}
              <button onClick={onActivated} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                Schließen
              </button>
            </div>
          ) : result?.fehler ? (
            <div className="text-center py-6">
              <p className="text-red-600 font-medium mb-2">Fehler</p>
              <p className="text-sm text-gray-600">{result.fehler}</p>
              <button onClick={() => setResult(null)} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200">
                Erneut versuchen
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">{upsell.beschreibung}</p>

              {upsell.configSchema.fields.length > 0 && (
                <div className="space-y-4 mb-6">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Konfiguration</p>
                  {upsell.configSchema.fields.map((field) => (
                    <DynamicField key={field.key} field={field} value={config[field.key]} onChange={(v) => setConfig((c) => ({ ...c, [field.key]: v }))} />
                  ))}
                </div>
              )}

              <button onClick={handleActivate} disabled={activating || requiredMissing} className="w-full py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {activating ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird aktiviert...</> : <><Zap className="w-4 h-4" /> Jetzt aktivieren</>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DynamicField({ field, value, onChange }: { field: ConfigField; value: unknown; onChange: (v: unknown) => void }) {
  const labelEl = (
    <label className="block text-xs font-medium text-gray-600 mb-1">
      {field.label} {field.required && <span className="text-red-400">*</span>}
      {field.description && <span className="block text-xs text-gray-400 font-normal mt-0.5">{field.description}</span>}
    </label>
  )

  if (field.type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600" />
        <label className="text-xs text-gray-600">{field.label}</label>
      </div>
    )
  }

  if (field.type === 'select') {
    return (
      <div>{labelEl}
        <select value={String(value || '')} onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 bg-white">
          <option value="">— Auswählen —</option>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    )
  }

  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value as string[] : []
    return (
      <div>{labelEl}
        <div className="flex flex-wrap gap-2">
          {field.options?.map((o) => (
            <button key={o.value} type="button" onClick={() => {
              onChange(selected.includes(o.value) ? selected.filter((s) => s !== o.value) : [...selected, o.value])
            }} className={`text-xs px-3 py-1.5 rounded-full border ${selected.includes(o.value) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-600'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div>{labelEl}
        <textarea value={String(value || '')} onChange={(e) => onChange(e.target.value)} rows={3}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2 resize-vertical" />
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div>{labelEl}
        <input type="number" value={String(value || '')} onChange={(e) => onChange(Number(e.target.value))}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-2" />
      </div>
    )
  }

  return (
    <div>{labelEl}
      <input type="text" value={String(value || '')} onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-md px-3 py-2" />
    </div>
  )
}

function BriefingTab({ customerId, customer }: { customerId: string; customer: Record<string, unknown> }) {
  const [briefing, setBriefing] = useState<string | null>(customer.pre_call_briefing_url as string | null)
  const [generatingBriefing, setGeneratingBriefing] = useState(false)
  const [buildingPipeline, setBuildingPipeline] = useState(false)
  const [buildResult, setBuildResult] = useState<string | null>(null)

  async function handleGenerateBriefing() {
    setGeneratingBriefing(true)
    const res = await fetch(`/api/admin/briefing/${customerId}`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) setBriefing(data.briefing)
    setGeneratingBriefing(false)
  }

  async function handleBuildPipeline() {
    setBuildingPipeline(true)
    setBuildResult(null)
    const res = await fetch(`/api/admin/build-pipeline/${customerId}`, { method: 'POST' })
    const data = await res.json()
    setBuildResult(res.ok ? 'Webseite erfolgreich generiert!' : `Fehler: ${data.error}`)
    setBuildingPipeline(false)
  }

  const buildStatus = String(customer.build_status || 'WARTEND')
  const onboardingStatus = String(customer.onboarding_status || 'AUSSTEHEND')

  return (
    <div className="space-y-6">
      {/* Onboarding-Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Onboarding-Status</h2>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Onboarding:</span>{' '}
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
              onboardingStatus === 'FREIGEGEBEN' ? 'bg-green-100 text-green-700' :
              onboardingStatus === 'WEBSEITE_FERTIG' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>{onboardingStatus}</span>
          </div>
          <div>
            <span className="text-gray-500">Build:</span>{' '}
            <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
              buildStatus === 'FERTIG' ? 'bg-green-100 text-green-700' :
              buildStatus === 'IN_BEARBEITUNG' ? 'bg-blue-100 text-blue-700' :
              buildStatus === 'FEHLER' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>{buildStatus}</span>
          </div>
          <div>
            <span className="text-gray-500">Termin:</span>{' '}
            <span className="font-medium">{customer.onboarding_termin_am ? new Date(customer.onboarding_termin_am as string).toLocaleDateString('de-DE') : '—'}</span>
          </div>
        </div>
        {customer.build_fehler ? (
          <div className="mt-3 bg-red-50 rounded-lg p-3 text-sm text-red-700">
            Build-Fehler: {String(customer.build_fehler)}
          </div>
        ) : null}
      </div>

      {/* Aktionen */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Aktionen</h2>
        <div className="flex gap-3">
          <button onClick={handleGenerateBriefing} disabled={generatingBriefing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {generatingBriefing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generiere...</> : <><FileText className="w-4 h-4" /> Briefing generieren</>}
          </button>
          <button onClick={handleBuildPipeline} disabled={buildingPipeline}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {buildingPipeline ? <><Loader2 className="w-4 h-4 animate-spin" /> Baut Webseite...</> : <><Sparkles className="w-4 h-4" /> Build-Pipeline starten</>}
          </button>
        </div>
        {buildResult ? (
          <p className={`mt-3 text-sm ${buildResult.startsWith('Fehler') ? 'text-red-600' : 'text-green-600'}`}>{buildResult}</p>
        ) : null}
      </div>

      {/* Briefing-Inhalt */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Pre-Call-Briefing</h2>
        {briefing ? (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed bg-gray-50 rounded-lg p-4 border border-gray-200">
              {briefing}
            </pre>
            <p className="text-xs text-gray-400 mt-2">
              Generiert: {customer.pre_call_briefing_at ? new Date(customer.pre_call_briefing_at as string).toLocaleString('de-DE') : '—'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Noch kein Briefing generiert. Klicke oben auf &quot;Briefing generieren&quot;.</p>
        )}
      </div>
    </div>
  )
}
