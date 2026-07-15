'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2, Mail, Loader2, Check, Package, FileText, Clock, ChevronRight, Download, Building2, CreditCard, Image, Sparkles, Link2, Copy } from 'lucide-react'
import { VERTRAGS_STATUS_LABELS, VERTRAGS_STATUS_COLORS, type VertragsStatus, type KundenDokument, type VertragsTimeline } from '@/types'
import { UPSELL_PRODUCTS } from '@/config/upsells'

/** Katalog-Produkt (§10.4) mit Kauf-Status aus upsell_orders (neuer Kaufweg). */
interface UpsellProduktStatus {
  key: string
  name: string
  nutzen: string[]
  einmalCent: number
  monatCent: number
  fulfillment: 'auto' | 'va_manual'
  orderStatus: string | null
  gekauftAm: string | null
  quelle: string | null
}

/** Alt-Freischaltung aus dem abgelösten Aktivierungs-Flow (nur lesend). */
interface AltUpsell {
  upsell_id: string
  preis_pro_monat_cent: number
  aktiviert_am: string
}

export default function CustomerDetailPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [produkte, setProdukte] = useState<UpsellProduktStatus[]>([])
  const [altUpsells, setAltUpsells] = useState<AltUpsell[]>([])
  const [upsellsLoading, setUpsellsLoading] = useState(true)
  const [dokumente, setDokumente] = useState<KundenDokument[]>([])
  const [timeline, setTimeline] = useState<VertragsTimeline[]>([])
  const [bilder, setBilder] = useState<{ id: string; slot_id: string | null; dateiname: string; public_url: string; ki_zuordnung: string | null; ki_confidence: number | null; manuell_zugeordnet: boolean }[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'dokumente' | 'upsells' | 'timeline' | 'bilder' | 'briefing'>('overview')

  const loadUpsells = useCallback(() => {
    setUpsellsLoading(true)
    fetch(`/api/admin/customers/${params.customerId}/upsells`).then(async (r) => {
      if (r.ok) {
        const data = await r.json()
        setProdukte(data.produkte || [])
        setAltUpsells(data.altUpsells || [])
      }
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
  const gekaufteProdukte = produkte.filter((p) => p.orderStatus && ['BEZAHLT', 'PROVISIONIERT'].includes(p.orderStatus))
  const aktiveUpsellCount = gekaufteProdukte.length + altUpsells.length
  const upsellSumme =
    gekaufteProdukte.reduce((s, p) => s + p.monatCent, 0) +
    altUpsells.reduce((s, a) => s + (a.preis_pro_monat_cent || 0), 0)
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
          <ZahlungslinkPanel customerId={params.customerId as string} sites={sites} />
          {upsellsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4">
                {produkte.map((p) => {
                  const gekauft = !!(p.orderStatus && ['BEZAHLT', 'PROVISIONIERT'].includes(p.orderStatus))
                  const preisTeile: string[] = []
                  if (p.einmalCent > 0) preisTeile.push(`${(p.einmalCent / 100).toFixed(0)} € einmalig`)
                  if (p.monatCent > 0) preisTeile.push(`${(p.monatCent / 100).toFixed(0)} €/Mt`)
                  return (
                    <div key={p.key} className={`bg-white rounded-lg border p-4 ${gekauft ? 'border-green-300 bg-green-50/30' : 'border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                        {gekauft ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> {p.orderStatus === 'PROVISIONIERT' ? 'Provisioniert' : 'Bezahlt'}
                          </span>
                        ) : p.orderStatus === 'OFFEN' ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Link offen</span>
                        ) : null}
                      </div>
                      <ul className="text-xs text-gray-500 mb-3 space-y-0.5 list-disc pl-4">
                        {p.nutzen.map((n, i) => <li key={i}>{n}</li>)}
                      </ul>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">{preisTeile.join(' + ')}</span>
                        <span className="text-xs text-gray-400">{p.fulfillment === 'va_manual' ? 'VA-Einrichtung' : 'Auto'}</span>
                      </div>
                      {gekauft && p.gekauftAm && (
                        <p className="text-xs text-gray-400 mt-2">
                          Gekauft am {new Date(p.gekauftAm).toLocaleDateString('de-DE')}{p.quelle ? ` · ${p.quelle}` : ''}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Kauf läuft über Stripe-Checkout: Zahlungslink oben erzeugen oder der Kunde bucht selbst im Portal.
                Freischaltung passiert automatisch per Webhook — keine manuelle Aktivierung mehr.
              </p>
              {altUpsells.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-2">Alt-Bestand (abgelöster Aktivierungs-Flow)</h3>
                  <div className="divide-y divide-gray-100">
                    {altUpsells.map((a) => (
                      <div key={a.upsell_id} className="flex items-center justify-between py-2 text-sm">
                        <span className="text-gray-700">{a.upsell_id}</span>
                        <span className="text-gray-500">
                          {(a.preis_pro_monat_cent / 100).toFixed(2)} €/Mt · seit {new Date(a.aktiviert_am).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Nur lesend — Abrechnung dieser Alt-Module bei Vertragsumstellung klären.</p>
                </div>
              )}
            </>
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

/**
 * Zahlungslink für Katalog-Upsells (Kaufweg 3, §10.4): erzeugt über
 * /api/admin/upsell-payment-link eine Stripe-Checkout-URL zum Versenden.
 */
function ZahlungslinkPanel({ customerId, sites }: { customerId: string; sites: Record<string, unknown>[] }) {
  const [productKey, setProductKey] = useState('')
  const [siteId, setSiteId] = useState(sites.length === 1 ? String(sites[0].id) : '')
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  async function handleCreate() {
    if (!productKey) return
    setLoading(true)
    setUrl(null)
    setFehler(null)
    setCopied(false)
    try {
      const res = await fetch('/api/admin/upsell-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customerId,
          product_key: productKey,
          ...(siteId ? { site_id: siteId } : {}),
        }),
      })
      const data = await res.json().catch(() => null)
      if (res.ok && data?.url) setUrl(data.url)
      else setFehler(data?.error || 'Zahlungslink konnte nicht erstellt werden')
    } catch {
      setFehler('Netzwerkfehler')
    }
    setLoading(false)
  }

  async function handleCopy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const preisLabel = (key: string) => {
    const p = UPSELL_PRODUCTS.find((x) => x.key === key)
    if (!p) return ''
    const teile: string[] = []
    if (p.einmalCent > 0) teile.push(`${(p.einmalCent / 100).toFixed(0)} € einmalig`)
    if (p.monatCent > 0) teile.push(`${(p.monatCent / 100).toFixed(0)} €/Monat`)
    return teile.join(' + ')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><Link2 className="w-4 h-4" /> Zahlungslink erzeugen</h2>
      <p className="text-xs text-gray-500 mb-4">Stripe-Checkout-Link für ein Katalog-Produkt — zum Versenden per Mail oder im Gespräch.</p>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Produkt</label>
          <select value={productKey} onChange={(e) => setProductKey(e.target.value)}
            className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white min-w-[260px]">
            <option value="">— Produkt auswählen —</option>
            {UPSELL_PRODUCTS.map((p) => (
              <option key={p.key} value={p.key}>{p.name} ({preisLabel(p.key)})</option>
            ))}
          </select>
        </div>
        {sites.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Site (optional)</label>
            <select value={siteId} onChange={(e) => setSiteId(e.target.value)}
              className="text-sm border border-gray-200 rounded-md px-3 py-2 bg-white min-w-[180px]">
              <option value="">— Keine Site —</option>
              {sites.map((s) => (
                <option key={String(s.id)} value={String(s.id)}>{String(s.name || s.id)}</option>
              ))}
            </select>
          </div>
        )}
        <button onClick={handleCreate} disabled={loading || !productKey}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Erzeuge...</> : <><Link2 className="w-4 h-4" /> Link erzeugen</>}
        </button>
      </div>
      {url && (
        <div className="mt-4 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <span className="text-xs font-mono text-gray-700 truncate flex-1">{url}</span>
          <button onClick={handleCopy} className="flex items-center gap-1 text-xs text-blue-600 hover:underline flex-shrink-0">
            {copied ? <><Check className="w-3 h-3" /> Kopiert</> : <><Copy className="w-3 h-3" /> Kopieren</>}
          </button>
        </div>
      )}
      {fehler && <p className="mt-3 text-sm text-red-600">{fehler}</p>}
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
