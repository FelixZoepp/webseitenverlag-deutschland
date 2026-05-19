'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Loader2, Check, Copy, FileText, CreditCard, Phone, Send } from 'lucide-react'
import { PACKAGES, type PackageTier } from '@/lib/packages'
import { UPSELL_MODULES } from '@/lib/upsells'

const CLOSER_OPTIONS = ['Henning', 'Felix']

export default function NewCustomerPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    // Kundendaten
    firma: '',
    ansprechpartner: '',
    email: '',
    telefon: '',
    strasse: '',
    plz: '',
    ort: '',
    ustIdNr: '',
    steuernummer: '',
    unternehmerBestaetigt: false,
    // Bank
    ibanKunde: '',
    bicKunde: '',
    // Paket
    paket: 'business' as PackageTier,
    upsells: [] as string[],
    // Vertrag
    contractYears: 4,
    contractStart: new Date().toISOString().split('T')[0],
    // Closer
    closerName: CLOSER_OPTIONS[0],
    closerNotiz: '',
    firefliesUrl: '',
    // Optionen
    sendInvitation: true,
  })

  const [result, setResult] = useState<{
    kundenId: string
    angebotsNummer: string
    tempPassword: string
    invitationSent: boolean
    monatsrateCent: number
    werklohnCent: number
  } | null>(null)
  const [copied, setCopied] = useState(false)

  function update(key: string, value: string | boolean | number | string[]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function toggleUpsell(id: string) {
    setForm((f) => ({
      ...f,
      upsells: f.upsells.includes(id) ? f.upsells.filter((u) => u !== id) : [...f.upsells, id],
    }))
  }

  // Berechnung
  const pkg = PACKAGES.find((p) => p.id === form.paket) || PACKAGES[1]
  const basisCent = pkg.price * 100
  const upsellSummeCent = form.upsells.reduce((sum, id) => {
    const mod = UPSELL_MODULES.find((m) => m.id === id)
    return sum + (mod?.preisProMonatCent || 0)
  }, 0)
  const monatsrateCent = basisCent + upsellSummeCent
  const werklohnCent = monatsrateCent * 12 * form.contractYears

  async function handleCreate() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/vertraege', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          contractYears: form.contractYears,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setResult({
        kundenId: data.kundenId,
        angebotsNummer: data.angebotsNummer,
        tempPassword: data.tempPassword,
        invitationSent: data.invitationSent,
        monatsrateCent: data.monatsrateCent,
        werklohnCent: data.werklohnCent,
      })
      setStep(5) // Erfolg
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  function copyCredentials() {
    navigator.clipboard.writeText(
      `E-Mail: ${form.email}\nPasswort: ${result?.tempPassword}\nLogin: https://webseitenverlag-deutschland.vercel.app/login`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const canProceedStep1 = form.firma && form.ansprechpartner && form.email && form.telefon &&
    form.strasse && form.plz && form.ort && form.unternehmerBestaetigt
  const canProceedStep2 = form.ibanKunde.length >= 15
  const canProceedStep3 = form.closerName

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <Link href="/admin/customers" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Neuer Vertrag</h1>

      {/* Progress Steps */}
      {step < 5 && (
        <div className="flex items-center gap-2 mb-8">
          {[
            { n: 1, icon: FileText, label: 'Kundendaten' },
            { n: 2, icon: CreditCard, label: 'Bank & Paket' },
            { n: 3, icon: Phone, label: 'Call & Closer' },
            { n: 4, icon: Send, label: 'Bestätigung' },
          ].map((s) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.n ? 'bg-blue-600 text-white' :
                step > s.n ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-400'
              }`}>
                {step > s.n ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs ${step === s.n ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{s.label}</span>
              {s.n < 4 && <div className={`w-8 h-px ${step > s.n ? 'bg-green-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Step 1: Kundendaten */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><FileText className="w-4 h-4" /> Kundendaten</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Firmenname *" value={form.firma} onChange={(v) => update('firma', v)} />
            <Field label="Ansprechpartner *" value={form.ansprechpartner} onChange={(v) => update('ansprechpartner', v)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-Mail *" type="email" value={form.email} onChange={(v) => update('email', v)} />
            <Field label="Telefon *" type="tel" value={form.telefon} onChange={(v) => update('telefon', v)} />
          </div>

          <h3 className="font-semibold text-gray-900 pt-3">Adresse</h3>
          <Field label="Straße + Hausnr. *" value={form.strasse} onChange={(v) => update('strasse', v)} />
          <div className="grid grid-cols-3 gap-4">
            <Field label="PLZ *" value={form.plz} onChange={(v) => update('plz', v)} />
            <div className="col-span-2">
              <Field label="Ort *" value={form.ort} onChange={(v) => update('ort', v)} />
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 pt-3">Steuerlich</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="USt-IdNr." value={form.ustIdNr} onChange={(v) => update('ustIdNr', v)} placeholder="DE123456789" />
            <Field label="Steuernummer" value={form.steuernummer} onChange={(v) => update('steuernummer', v)} />
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-amber-50 border border-amber-200 rounded-lg p-4">
            <input type="checkbox" checked={form.unternehmerBestaetigt} onChange={(e) => update('unternehmerBestaetigt', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600" />
            <div>
              <span className="text-sm font-medium text-gray-900">Unternehmer-Eigenschaft bestätigt *</span>
              <p className="text-xs text-gray-500 mt-0.5">Kunde hat im Call bestätigt, dass er/sie Unternehmer gem. § 14 BGB ist.</p>
            </div>
          </label>

          <div className="flex justify-end pt-3">
            <button onClick={() => setStep(2)} disabled={!canProceedStep1}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              Weiter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Step 2: Bankdaten & Paket */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bankdaten & Paket</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs text-blue-700">Diese Daten werden ins SEPA-Lastschriftmandat eingetragen, das der Kunde digital unterschreibt.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="IBAN *" value={form.ibanKunde} onChange={(v) => update('ibanKunde', v)} placeholder="DE89 3704 0044 0532 0130 00" mono />
            <Field label="BIC (optional)" value={form.bicKunde} onChange={(v) => update('bicKunde', v)} mono />
          </div>

          <h3 className="font-semibold text-gray-900 pt-3">Paket</h3>
          <div className="grid grid-cols-3 gap-3">
            {PACKAGES.map((p) => (
              <button key={p.id} type="button" onClick={() => update('paket', p.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  form.paket === p.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span>{p.emoji}</span>
                  <span className="font-semibold text-sm text-gray-900">{p.name}</span>
                  {p.id === 'business' && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">empfohlen</span>}
                </div>
                <span className="text-lg font-bold text-gray-900">{p.price} €</span>
                <span className="text-xs text-gray-500">/Monat</span>
                <p className="text-xs text-gray-500 mt-1">Bis zu {p.maxPages} Seiten</p>
              </button>
            ))}
          </div>

          <h3 className="font-semibold text-gray-900 pt-3">Vertrag</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laufzeit</label>
              <select value={form.contractYears} onChange={(e) => update('contractYears', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value={1}>1 Jahr</option>
                <option value={2}>2 Jahre</option>
                <option value={3}>3 Jahre</option>
                <option value={4}>4 Jahre</option>
              </select>
            </div>
            <Field label="Vertragsbeginn" type="date" value={form.contractStart} onChange={(v) => update('contractStart', v)} />
          </div>

          <h3 className="font-semibold text-gray-900 pt-3">Direkt-Upsells (optional)</h3>
          <div className="grid grid-cols-2 gap-2">
            {UPSELL_MODULES.map((mod) => (
              <button key={mod.id} type="button" onClick={() => toggleUpsell(mod.id)}
                className={`flex items-center justify-between text-left p-3 rounded-lg border transition-all text-sm ${
                  form.upsells.includes(mod.id) ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                    form.upsells.includes(mod.id) ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {form.upsells.includes(mod.id) && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-gray-900 font-medium">{mod.name}</span>
                </div>
                <span className="text-gray-500 font-medium">+{mod.preisProMonatCent / 100} €</span>
              </button>
            ))}
          </div>

          {/* Zusammenfassung */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Basis-Paket ({pkg.name})</span>
              <span className="font-medium">{pkg.price},00 €/Mt</span>
            </div>
            {form.upsells.length > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{form.upsells.length} Upsell(s)</span>
                <span className="font-medium">+{(upsellSummeCent / 100).toFixed(2)} €/Mt</span>
              </div>
            )}
            <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-sm">
              <span className="font-semibold text-gray-900">Monatsrate</span>
              <span className="font-bold text-gray-900">{(monatsrateCent / 100).toFixed(2)} € netto</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Werklohn gesamt ({form.contractYears}J)</span>
              <span>{(werklohnCent / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € netto</span>
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button onClick={() => setStep(1)} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={() => setStep(3)} disabled={!canProceedStep2}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              Weiter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Step 3: Call & Closer */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Phone className="w-4 h-4" /> Call & Closer</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Closer *</label>
            <select value={form.closerName} onChange={(e) => update('closerName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              {CLOSER_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notiz aus dem Call</label>
            <textarea value={form.closerNotiz} onChange={(e) => update('closerNotiz', e.target.value)} rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-vertical"
              placeholder="Besonderheiten, Wünsche, relevante Infos aus dem Gespräch..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fireflies-URL (optional)</label>
            <input type="url" value={form.firefliesUrl} onChange={(e) => update('firefliesUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://app.fireflies.ai/view/..." />
            <p className="text-xs text-gray-500 mt-1">Das System lädt das Transkript automatisch und speichert es in der Kundenakte.</p>
          </div>

          <div className="flex justify-between pt-3">
            <button onClick={() => setStep(2)} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={() => setStep(4)} disabled={!canProceedStep3}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              Weiter <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Step 4: Bestätigung */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 4 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Send className="w-4 h-4" /> Bestätigung</h2>

          <div className="bg-gray-50 rounded-lg p-5 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <SummaryRow label="Firma" value={form.firma} />
              <SummaryRow label="Ansprechpartner" value={form.ansprechpartner} />
              <SummaryRow label="E-Mail" value={form.email} />
              <SummaryRow label="Telefon" value={form.telefon} />
              <SummaryRow label="Adresse" value={`${form.strasse}, ${form.plz} ${form.ort}`} />
              {form.ustIdNr && <SummaryRow label="USt-IdNr." value={form.ustIdNr} />}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <SummaryRow label="IBAN" value={form.ibanKunde} />
            </div>

            <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-x-8 gap-y-2">
              <SummaryRow label="Paket" value={`${pkg.emoji} ${pkg.name} (${pkg.price} €/Mt)`} />
              <SummaryRow label="Laufzeit" value={`${form.contractYears} Jahre ab ${form.contractStart}`} />
              {form.upsells.length > 0 && (
                <SummaryRow label="Upsells" value={form.upsells.map((id) => UPSELL_MODULES.find((m) => m.id === id)?.name).filter(Boolean).join(', ')} />
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between font-semibold">
                <span>Monatsrate</span>
                <span>{(monatsrateCent / 100).toFixed(2)} € netto</span>
              </div>
              <div className="flex justify-between text-gray-500 text-xs mt-1">
                <span>Werklohn gesamt</span>
                <span>{(werklohnCent / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € netto</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 grid grid-cols-2 gap-x-8 gap-y-2">
              <SummaryRow label="Closer" value={form.closerName} />
              {form.firefliesUrl && <SummaryRow label="Fireflies" value="Wird abgerufen" />}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.sendInvitation} onChange={(e) => update('sendInvitation', e.target.checked)} className="rounded" />
            Einladungs-E-Mail mit Dashboard-Login senden
          </label>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-medium">Was passiert beim Klick:</p>
            <ul className="text-xs text-blue-700 mt-1 space-y-0.5">
              <li>1. Kunde + Auth-Account wird angelegt</li>
              <li>2. Angebots-PDF + SEPA-Mandat-PDF werden generiert</li>
              <li>3. Dokumente + AGB-Link werden per E-Mail an {form.email} versendet</li>
              <li>4. Slack-Benachrichtigung an #vertrieb</li>
              {form.firefliesUrl && <li>5. Fireflies-Transkript wird im Hintergrund geladen</li>}
            </ul>
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>}

          <div className="flex justify-between pt-3">
            <button onClick={() => setStep(3)} className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
            <button onClick={handleCreate} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird erstellt...</> : <><Send className="w-4 h-4" /> Angebot senden</>}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Step 5: Erfolg */}
      {/* ══════════════════════════════════════════════════════════ */}
      {step === 5 && result && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Vertrag erstellt & Angebot versendet!</h2>
          <p className="text-sm text-gray-600 mb-1">Angebotsnummer: <strong>{result.angebotsNummer}</strong></p>
          {result.invitationSent && <p className="text-sm text-green-600 mb-4">Einladungs-E-Mail wurde gesendet.</p>}

          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm mb-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Monatsrate:</span>
              <span className="font-semibold">{(result.monatsrateCent / 100).toFixed(2)} € netto</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Werklohn:</span>
              <span className="font-semibold">{(result.werklohnCent / 100).toLocaleString('de-DE', { minimumFractionDigits: 2 })} € netto</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <p><strong>E-Mail:</strong> {form.email}</p>
              <p><strong>Temp. Passwort:</strong> <code className="bg-gray-200 px-1 rounded">{result.tempPassword}</code></p>
            </div>
          </div>

          <button onClick={copyCredentials} className="flex items-center gap-1.5 mx-auto px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 mb-6">
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopiert!' : 'Login-Daten kopieren'}
          </button>

          <div className="flex gap-3 justify-center">
            <button onClick={() => router.push(`/admin/customers/${result.kundenId}`)}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
              Zur Kundenakte
            </button>
            <button onClick={() => { setStep(1); setResult(null); setForm((f) => ({ ...f, firma: '', ansprechpartner: '', email: '', telefon: '', strasse: '', plz: '', ort: '', ustIdNr: '', steuernummer: '', unternehmerBestaetigt: false, ibanKunde: '', bicKunde: '', upsells: [], closerNotiz: '', firefliesUrl: '' })) }}
              className="px-5 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              Weiteren Vertrag anlegen
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

// ============================================================
// Wiederverwendbare Komponenten
// ============================================================

function Field({ label, value, onChange, type = 'text', placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}:</span>{' '}
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
