'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Upload, Loader2, Globe, FileText, Sparkles, Check, Package, Layout, Search } from 'lucide-react'
import Link from 'next/link'
import { PACKAGES, PackageTier } from '@/lib/packages'

type Step = 'package' | 'template' | 'info' | 'transcript' | 'generating' | 'done'

const TEMPLATE_OPTIONS = [
  // Fitness
  { id: 'eisenwerk', name: 'Performance-Gym', industry: 'Fitness', color: '#d9f55b', dark: true },
  { id: 'fitness-boutique', name: 'Boutique-Studio', industry: 'Fitness', color: '#e85d50' },
  { id: 'fitness-frauen', name: 'Frauen-Fitness', industry: 'Fitness', color: '#5c2d56' },
  // Gastronomie
  { id: 'trattoria', name: 'Restaurant Italienisch', industry: 'Gastronomie', color: '#b8533a' },
  { id: 'cafe', name: 'Spezialitäten-Café', industry: 'Gastronomie', color: '#3b2a1a' },
  { id: 'sushi', name: 'Sushi-Restaurant', industry: 'Gastronomie', color: '#8bc34a', dark: true },
  // Floristik
  { id: 'wildblatt', name: 'Slow Flower Floristik', industry: 'Floristik', color: '#7a9a6a' },
  { id: 'floristik-edel', name: 'Edel-Florist', industry: 'Floristik', color: '#4a2040' },
  { id: 'floristik-bio', name: 'Bio-Markt Florist', industry: 'Floristik', color: '#e8b931' },
  // Reinigung
  { id: 'reinigung-b2b', name: 'B2B-Büroreinigung', industry: 'Reinigung', color: '#4ecdc4' },
  { id: 'reinigung-privat', name: 'Privat-Reinigung', industry: 'Reinigung', color: '#3b82c8' },
  { id: 'reinigung-industrie', name: 'Industriereinigung', industry: 'Reinigung', color: '#e8722a', dark: true },
  // Friseur
  { id: 'friseur-damen', name: 'Damen-Salon Premium', industry: 'Friseur', color: '#3a1f35' },
  { id: 'friseur-unisex', name: 'Unisex-Salon', industry: 'Friseur', color: '#c9907a' },
  { id: 'friseur-barbershop', name: 'Barbershop', industry: 'Friseur', color: '#c8943a', dark: true },
  // Gesundheit
  { id: 'arzt-hausarzt', name: 'Hausarzt-Praxis', industry: 'Gesundheit', color: '#4a7a5a' },
  { id: 'arzt-zahnarzt', name: 'Zahnarzt-Praxis', industry: 'Gesundheit', color: '#2a7ab8' },
  { id: 'arzt-hautarzt', name: 'Dermatologe', industry: 'Gesundheit', color: '#c4887a' },
  // Handwerk
  { id: 'gruenwerk', name: 'Garten & Landschaft', industry: 'Handwerk', color: '#1f3a2e' },
  { id: 'handwerk-sanitaer', name: 'Sanitär & Heizung', industry: 'Handwerk', color: '#0f2a4a' },
  { id: 'handwerk-maler', name: 'Maler & Lackierer', industry: 'Handwerk', color: '#1a5a5a' },
  { id: 'handwerk-elektriker', name: 'Elektriker', industry: 'Handwerk', color: '#d9f55b', dark: true },
  // Recht
  { id: 'anwalt-wirtschaft', name: 'Wirtschaftskanzlei', industry: 'Recht', color: '#0e1f3e' },
  { id: 'anwalt-steuerberater', name: 'Steuerberater', industry: 'Recht', color: '#d4a828' },
  { id: 'anwalt-familie', name: 'Familienrecht', industry: 'Recht', color: '#5a2030' },
  // Hotel
  { id: 'hotel-stadt', name: 'Boutique-Stadthotel', industry: 'Hotel', color: '#c8b88a' },
  { id: 'hotel-land', name: 'Landhotel', industry: 'Hotel', color: '#2a4a2e' },
  { id: 'hotel-nordsee', name: 'Design-Hotel Küste', industry: 'Hotel', color: '#0e2a4a' },
  // KFZ
  { id: 'werkstatt-klassisch', name: 'Meisterwerkstatt', industry: 'KFZ', color: '#e87a2a' },
  { id: 'werkstatt-bmw', name: 'Marken-Spezialist', industry: 'KFZ', color: '#1a3a6a', dark: true },
  { id: 'werkstatt-eauto', name: 'E-Auto-Werkstatt', industry: 'KFZ', color: '#2ec4a0' },
  // Immobilien
  { id: 'immobilien-premium', name: 'Premium-Makler', industry: 'Immobilien', color: '#4a1a2a' },
  { id: 'immobilien-tech', name: 'Tech-Makler', industry: 'Immobilien', color: '#a8e040' },
  { id: 'immobilien-regional', name: 'Regional-Makler', industry: 'Immobilien', color: '#2a4a30' },
  // Yoga
  { id: 'yoga-premium', name: 'Premium-Yoga', industry: 'Yoga', color: '#c4907a' },
  { id: 'yoga-pilates', name: 'Pilates-Studio', industry: 'Yoga', color: '#d4806a' },
  { id: 'yoga-hot', name: 'Hot-Yoga', industry: 'Yoga', color: '#5a1a2a' },
  // Tattoo
  { id: 'tattoo-studio', name: 'Tattoo-Studio', industry: 'Tattoo', color: '#c62828' },
]

const INDUSTRIES = Array.from(new Set(TEMPLATE_OPTIONS.map((t) => t.industry)))

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('package')
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>('business')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [templateFilter, setTemplateFilter] = useState<string | null>(null)
  const [templateSearch, setTemplateSearch] = useState('')
  const [siteName, setSiteName] = useState('')
  const [domain, setDomain] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [siteId, setSiteId] = useState<string | null>(null)

  const pkg = PACKAGES.find((p) => p.id === selectedPackage)!
  const selectedTemplateName = TEMPLATE_OPTIONS.find((t) => t.id === selectedTemplate)?.name || ''

  const filteredTemplates = TEMPLATE_OPTIONS.filter((t) => {
    if (templateFilter && t.industry !== templateFilter) return false
    if (templateSearch && !t.name.toLowerCase().includes(templateSearch.toLowerCase()) && !t.industry.toLowerCase().includes(templateSearch.toLowerCase())) return false
    return true
  })

  async function handleGenerate() {
    setStep('generating')
    setError(null)
    try {
      const res = await fetch('/api/onboarding/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName,
          transcript,
          package: selectedPackage,
          templateId: selectedTemplate || undefined,
          domain: domain || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generierung fehlgeschlagen')
      setSiteId(data.site.id)
      setStep('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler')
      setStep('transcript')
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setTranscript(ev.target?.result as string)
    reader.readAsText(file)
  }

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: 'package', label: 'Paket', icon: <Package className="w-4 h-4" /> },
    { key: 'template', label: 'Template', icon: <Layout className="w-4 h-4" /> },
    { key: 'info', label: 'Info', icon: <Globe className="w-4 h-4" /> },
    { key: 'transcript', label: 'Briefing', icon: <FileText className="w-4 h-4" /> },
    { key: 'generating', label: 'KI', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'done', label: 'Fertig', icon: <Check className="w-4 h-4" /> },
  ]

  const stepIndex = steps.findIndex((s) => s.key === step)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">&larr; Dashboard</Link>
        <span className="text-gray-600">|</span>
        <h1 className="font-semibold">Neue Website erstellen</h1>
      </nav>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 text-sm ${i <= stepIndex ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  i < stepIndex ? 'bg-blue-600 text-white' : i === stepIndex ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : s.icon}
                </div>
                <span className="hidden sm:inline text-xs">{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-10">

        {/* ===== STEP: PAKET ===== */}
        {step === 'package' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Paket wählen</h2>
              <p className="text-sm text-gray-500">Das Paket bestimmt den Umfang der generierten Website.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {PACKAGES.map((p) => (
                <button key={p.id} onClick={() => setSelectedPackage(p.id)}
                  className={`relative text-left rounded-xl border-2 p-5 transition-all ${
                    selectedPackage === p.id ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-100' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}>
                  {p.id === 'business' && (
                    <span className="absolute -top-2.5 left-4 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Empfehlung</span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{p.emoji}</span>
                    <span className="font-bold text-gray-900">{p.name}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">{p.price} €</span>
                    <span className="text-sm text-gray-500">/Mt</span>
                  </div>
                  <ul className="space-y-1.5">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${selectedPackage === p.id ? 'text-blue-600' : 'text-gray-400'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {selectedPackage === p.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep('template')} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                Weiter <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP: TEMPLATE ===== */}
        {step === 'template' && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Template wählen</h2>
              <p className="text-sm text-gray-500">Wähle das Branchen-Design das am besten passt. Die KI füllt es mit den Kundendaten.</p>
            </div>

            {/* Filter + Suche */}
            <div className="flex gap-2 mb-4 flex-wrap items-center">
              <button onClick={() => setTemplateFilter(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${!templateFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                Alle
              </button>
              {INDUSTRIES.map((ind) => (
                <button key={ind} onClick={() => setTemplateFilter(templateFilter === ind ? null : ind)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${templateFilter === ind ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {ind}
                </button>
              ))}
              <div className="flex-1" />
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                <input type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Suchen..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[420px] overflow-y-auto pr-1">
              {filteredTemplates.map((t) => (
                <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                  className={`text-left rounded-lg border-2 overflow-hidden transition-all ${
                    selectedTemplate === t.id ? 'border-blue-600 shadow-lg shadow-blue-100' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <div style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}aa)`, height: '60px' }}
                    className="flex items-center justify-center relative">
                    <span style={{ color: t.dark ? '#fff' : 'rgba(255,255,255,0.95)', fontSize: '13px', fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                      {t.name.split(' ')[0]}
                    </span>
                    {selectedTemplate === t.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-900 leading-tight">{t.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.industry}</p>
                  </div>
                </button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-sm text-gray-400">Keine Templates gefunden.</div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep('package')} className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 text-sm">
                <ArrowLeft className="w-4 h-4" /> Paket
              </button>
              <button onClick={() => setStep('info')} disabled={!selectedTemplate}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                Weiter mit &quot;{selectedTemplateName || '...'}&quot; <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP: INFO ===== */}
        {step === 'info' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{pkg.emoji}</span>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{pkg.name}</span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs text-gray-500">{selectedTemplateName}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Website-Informationen</h2>
            <p className="text-sm text-gray-500 mb-6">Grundlegende Informationen zur neuen Website.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name der Website / Firmenname *</label>
                <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Haus- & Gartenservice Dollan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain (optional)</label>
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. gartenservice-dollan.de" />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep('template')} className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-800 text-sm">
                <ArrowLeft className="w-4 h-4" /> Template ändern
              </button>
              <button onClick={() => setStep('transcript')} disabled={!siteName.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                Weiter <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP: TRANSCRIPT ===== */}
        {step === 'transcript' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Briefing / Transkript</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-blue-800">
                <strong>{pkg.emoji} {pkg.name} · {selectedTemplateName}:</strong> Die KI generiert alle Inhalte passend zum gewählten Branchen-Template aus dem Briefing.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datei hochladen (optional)</label>
                <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">.txt oder .md Datei</span>
                  <input type="file" accept=".txt,.md,.text" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Oder Text eingeben *</label>
                <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Firmenbeschreibung, Dienstleistungen, Kontaktdaten, Kundenstimmen, Region..." />
              </div>
            </div>
            {error && <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>}
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep('info')} className="flex items-center gap-2 px-5 py-2.5 text-gray-600 text-sm"><ArrowLeft className="w-4 h-4" /> Zurück</button>
              <button onClick={handleGenerate} disabled={transcript.trim().length < 20}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
                <Sparkles className="w-4 h-4" /> Website generieren
              </button>
            </div>
          </div>
        )}

        {/* ===== STEP: GENERATING ===== */}
        {step === 'generating' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Website wird generiert...</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {pkg.emoji} {pkg.name} · {selectedTemplateName} — Die KI analysiert das Briefing und erstellt alle Inhalte.
            </p>
          </div>
        )}

        {/* ===== STEP: DONE ===== */}
        {step === 'done' && siteId && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Website erstellt!</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-8">
              &quot;{siteName}&quot; wurde mit dem {selectedTemplateName}-Template generiert.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => router.push(`/dashboard/${siteId}`)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                Im Editor öffnen <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm">
                Zum Dashboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
