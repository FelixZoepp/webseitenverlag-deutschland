'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, RotateCcw, Copy, Check } from 'lucide-react'

// ============================================================
// Branchen-Defaults
// ============================================================

interface BranchenDefault {
  slug: string
  name: string
  suchvolumenMonatlich: number
  klickrateTop3: number         // 0..1
  conversionWebToLead: number   // 0..1
  abschlussrate: number         // 0..1
  durchschnittsAuftragswertCent: number
}

const BRANCHEN: BranchenDefault[] = [
  { slug: 'heizung-sanitaer', name: 'Heizung & Sanitär', suchvolumenMonatlich: 880, klickrateTop3: 0.28, conversionWebToLead: 0.035, abschlussrate: 0.25, durchschnittsAuftragswertCent: 420000 },
  { slug: 'dachdecker', name: 'Dachdecker', suchvolumenMonatlich: 720, klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.30, durchschnittsAuftragswertCent: 850000 },
  { slug: 'elektriker', name: 'Elektriker', suchvolumenMonatlich: 1200, klickrateTop3: 0.26, conversionWebToLead: 0.03, abschlussrate: 0.28, durchschnittsAuftragswertCent: 280000 },
  { slug: 'maler', name: 'Maler & Lackierer', suchvolumenMonatlich: 950, klickrateTop3: 0.27, conversionWebToLead: 0.035, abschlussrate: 0.30, durchschnittsAuftragswertCent: 350000 },
  { slug: 'friseur', name: 'Friseur', suchvolumenMonatlich: 2400, klickrateTop3: 0.32, conversionWebToLead: 0.05, abschlussrate: 0.60, durchschnittsAuftragswertCent: 4500 },
  { slug: 'zahnarzt', name: 'Zahnarzt', suchvolumenMonatlich: 3200, klickrateTop3: 0.25, conversionWebToLead: 0.03, abschlussrate: 0.45, durchschnittsAuftragswertCent: 25000 },
  { slug: 'rechtsanwalt', name: 'Rechtsanwalt', suchvolumenMonatlich: 1800, klickrateTop3: 0.22, conversionWebToLead: 0.025, abschlussrate: 0.20, durchschnittsAuftragswertCent: 200000 },
  { slug: 'immobilien', name: 'Immobilienmakler', suchvolumenMonatlich: 1400, klickrateTop3: 0.20, conversionWebToLead: 0.02, abschlussrate: 0.15, durchschnittsAuftragswertCent: 1200000 },
  { slug: 'fitnessstudio', name: 'Fitnessstudio', suchvolumenMonatlich: 2800, klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.35, durchschnittsAuftragswertCent: 60000 },
  { slug: 'restaurant', name: 'Restaurant / Gastronomie', suchvolumenMonatlich: 3500, klickrateTop3: 0.35, conversionWebToLead: 0.06, abschlussrate: 0.70, durchschnittsAuftragswertCent: 3500 },
  { slug: 'steuerberater', name: 'Steuerberater', suchvolumenMonatlich: 1600, klickrateTop3: 0.22, conversionWebToLead: 0.025, abschlussrate: 0.25, durchschnittsAuftragswertCent: 300000 },
  { slug: 'reinigung', name: 'Gebäudereinigung', suchvolumenMonatlich: 600, klickrateTop3: 0.28, conversionWebToLead: 0.04, abschlussrate: 0.30, durchschnittsAuftragswertCent: 150000 },
  { slug: 'physiotherapie', name: 'Physiotherapie', suchvolumenMonatlich: 2200, klickrateTop3: 0.28, conversionWebToLead: 0.035, abschlussrate: 0.50, durchschnittsAuftragswertCent: 8000 },
  { slug: 'kfz-werkstatt', name: 'KFZ-Werkstatt', suchvolumenMonatlich: 1800, klickrateTop3: 0.30, conversionWebToLead: 0.04, abschlussrate: 0.40, durchschnittsAuftragswertCent: 65000 },
]

// ============================================================
// Calculator Logic (pure)
// ============================================================

interface CalcInputs {
  suchvolumen: number
  klickrate: number          // 0..1
  conversionWebToLead: number // 0..1
  abschlussrate: number      // 0..1
  auftragswertCent: number
}

interface CalcOutputs {
  klicks: number
  leadsProMonat: number
  abschluesseProMonat: number
  umsatzProMonatCent: number
  umsatzProJahrCent: number
}

function berechne(i: CalcInputs): CalcOutputs {
  const klicks = i.suchvolumen * i.klickrate
  const leadsProMonat = klicks * i.conversionWebToLead
  const abschluesseProMonat = leadsProMonat * i.abschlussrate
  const umsatzProMonatCent = Math.round(abschluesseProMonat * i.auftragswertCent)
  return { klicks, leadsProMonat, abschluesseProMonat, umsatzProMonatCent, umsatzProJahrCent: umsatzProMonatCent * 12 }
}

function fmtEuro(cent: number): string {
  return (cent / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtDecimal(n: number, digits = 1): string {
  return n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

// ============================================================
// Page
// ============================================================

export default function PotenzialRechnerPage() {
  const [branche, setBranche] = useState<string>('')
  const [suchFilter, setSuchFilter] = useState('')
  const [copied, setCopied] = useState(false)

  // Inputs als State
  const [suchvolumen, setSuchvolumen] = useState(1000)
  const [klickratePct, setKlickratePct] = useState(28)
  const [conversionPct, setConversionPct] = useState(3.5)
  const [abschlussratePct, setAbschlussratePct] = useState(25)
  const [auftragswertEuro, setAuftragswertEuro] = useState(4200)

  // Track ob Werte manuell geändert wurden
  const [angepasst, setAngepasst] = useState(false)

  const ergebnis = useMemo(() => berechne({
    suchvolumen,
    klickrate: klickratePct / 100,
    conversionWebToLead: conversionPct / 100,
    abschlussrate: abschlussratePct / 100,
    auftragswertCent: Math.round(auftragswertEuro * 100),
  }), [suchvolumen, klickratePct, conversionPct, abschlussratePct, auftragswertEuro])

  // Paket-Empfehlung
  const jahresUmsatz = ergebnis.umsatzProJahrCent / 100
  const empfohlenespaket = jahresUmsatz > 80000 ? 'Growth (249 €/Mt)' : jahresUmsatz > 30000 ? 'Business (149 €/Mt)' : 'Starter (99 €/Mt)'

  function ladeBranche(slug: string) {
    const b = BRANCHEN.find((br) => br.slug === slug)
    if (!b) return
    setBranche(slug)
    setSuchvolumen(b.suchvolumenMonatlich)
    setKlickratePct(Math.round(b.klickrateTop3 * 1000) / 10)
    setConversionPct(Math.round(b.conversionWebToLead * 1000) / 10)
    setAbschlussratePct(Math.round(b.abschlussrate * 1000) / 10)
    setAuftragswertEuro(b.durchschnittsAuftragswertCent / 100)
    setAngepasst(false)
    setSuchFilter('')
  }

  function resetBranche() {
    if (branche) ladeBranche(branche)
  }

  function handleInputChange(setter: (v: number) => void, value: number) {
    setter(value)
    setAngepasst(true)
  }

  const gefilterteBranchen = BRANCHEN.filter((b) =>
    b.name.toLowerCase().includes(suchFilter.toLowerCase())
  )

  function copyErgebnis() {
    const aktiveBranche = BRANCHEN.find((b) => b.slug === branche)
    const text = [
      `Potenzial-Rechnung${aktiveBranche ? ` — ${aktiveBranche.name}` : ''}`,
      '',
      `Suchvolumen/Monat: ${suchvolumen.toLocaleString('de-DE')}`,
      `Klickrate Top 3: ${fmtDecimal(klickratePct)}%`,
      `Conversion Web→Lead: ${fmtDecimal(conversionPct)}%`,
      `Abschlussrate: ${fmtDecimal(abschlussratePct)}%`,
      `Ø Auftragswert: ${auftragswertEuro.toLocaleString('de-DE')} €`,
      '',
      `→ ${fmtDecimal(ergebnis.klicks)} Klicks/Monat`,
      `→ ${fmtDecimal(ergebnis.leadsProMonat)} Leads/Monat`,
      `→ ${fmtDecimal(ergebnis.abschluesseProMonat)} Abschlüsse/Monat`,
      `→ ${fmtEuro(ergebnis.umsatzProMonatCent)} € Umsatz/Monat`,
      `→ ${fmtEuro(ergebnis.umsatzProJahrCent)} € Umsatz/Jahr`,
      '',
      `Empfohlenes Paket: ${empfohlenespaket}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* Topbar */}
      <div className="topbar fade-up">
        <Link href="/admin" style={{ color: 'var(--za-fg-3)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Zurück
        </Link>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <span className="tb-eyebrow">Closer-Tool</span>
          <span className="tb-heading">Potenzial-Rechner</span>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={copyErgebnis}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--za-surface)', border: '1px solid var(--za-border)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, color: 'var(--za-fg-2)', cursor: 'pointer' }}>
          {copied ? <><Check size={14} color="var(--za-success)" /> Kopiert</> : <><Copy size={14} /> Ergebnis kopieren</>}
        </button>
      </div>

      {/* Branchen-Auswahl */}
      <div className="panel fade-up" style={{ animationDelay: '60ms', marginBottom: '16px' }}>
        <span className="panel-eyebrow">Schritt 1</span>
        <div className="panel-title" style={{ marginBottom: '14px' }}>Branche auswählen</div>
        <input
          type="text"
          placeholder="Branche suchen..."
          value={suchFilter}
          onChange={(e) => setSuchFilter(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--za-border)', background: 'var(--za-surface)', fontSize: '13px', color: 'var(--za-fg)', marginBottom: '12px', outline: 'none' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {gefilterteBranchen.map((b) => (
            <button
              key={b.slug}
              onClick={() => ladeBranche(b.slug)}
              style={{
                padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                border: branche === b.slug ? '1.5px solid var(--za-gold)' : '1px solid var(--za-border)',
                background: branche === b.slug ? 'rgba(42,111,219,0.08)' : 'var(--za-surface)',
                color: branche === b.slug ? 'var(--za-gold-2)' : 'var(--za-fg-2)',
                transition: 'all 240ms',
              }}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rechner */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Inputs */}
        <div className="panel fade-up" style={{ animationDelay: '140ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <span className="panel-eyebrow">Schritt 2</span>
              <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={16} /> Parameter anpassen
                {angepasst && (
                  <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(42,111,219,0.10)', color: 'var(--za-gold)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Angepasst
                  </span>
                )}
              </div>
            </div>
            {angepasst && branche && (
              <button onClick={resetBranche} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--za-fg-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <RotateCcw size={12} /> Reset
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <SliderInput
              label="Suchvolumen / Monat"
              value={suchvolumen}
              min={0} max={10000} step={10}
              format={(v) => v.toLocaleString('de-DE')}
              onChange={(v) => handleInputChange(setSuchvolumen, v)}
              info="Wie oft wird die Branche + Stadt gegoogelt"
            />
            <SliderInput
              label="Klickrate Top 3 (%)"
              value={klickratePct}
              min={0} max={60} step={0.5}
              format={(v) => `${fmtDecimal(v)}%`}
              onChange={(v) => handleInputChange(setKlickratePct, v)}
              info="Anteil der Klicks auf Position 1–3"
            />
            <SliderInput
              label="Conversion Web → Lead (%)"
              value={conversionPct}
              min={0} max={15} step={0.1}
              format={(v) => `${fmtDecimal(v)}%`}
              onChange={(v) => handleInputChange(setConversionPct, v)}
              info="Besucher die eine Anfrage stellen"
            />
            <SliderInput
              label="Abschlussrate (%)"
              value={abschlussratePct}
              min={0} max={100} step={1}
              format={(v) => `${fmtDecimal(v, 0)}%`}
              onChange={(v) => handleInputChange(setAbschlussratePct, v)}
              info="Leads die zu Kunden werden"
            />
            <SliderInput
              label="Ø Auftragswert (€)"
              value={auftragswertEuro}
              min={10} max={50000} step={10}
              format={(v) => `${v.toLocaleString('de-DE')} €`}
              onChange={(v) => handleInputChange(setAuftragswertEuro, v)}
              info="Durchschnittlicher Umsatz pro Auftrag"
            />
          </div>
        </div>

        {/* Ergebnis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Hero-Zahl */}
          <div className="panel fade-up" style={{ animationDelay: '220ms', textAlign: 'center', padding: '32px 22px' }}>
            <span className="panel-eyebrow">Potenzial pro Jahr</span>
            <div style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '48px', letterSpacing: '-0.03em', color: 'var(--za-fg)', lineHeight: 1, marginTop: '8px' }}>
              {fmtEuro(ergebnis.umsatzProJahrCent)}
              <span style={{ fontSize: '24px', color: 'var(--za-gold)', marginLeft: '6px' }}>€</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--za-fg-2)', marginTop: '8px' }}>
              zusätzlicher Umsatz durch professionelle Webpräsenz
            </div>
          </div>

          {/* Sub-KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <MiniKPI label="Klicks / Monat" value={fmtDecimal(ergebnis.klicks, 0)} delay={280} />
            <MiniKPI label="Leads / Monat" value={fmtDecimal(ergebnis.leadsProMonat)} delay={320} />
            <MiniKPI label="Abschlüsse / Monat" value={fmtDecimal(ergebnis.abschluesseProMonat)} delay={360} />
            <MiniKPI label="Umsatz / Monat" value={`${fmtEuro(ergebnis.umsatzProMonatCent)} €`} delay={400} />
          </div>

          {/* Formel */}
          <div className="panel fade-up" style={{ animationDelay: '440ms' }}>
            <span className="panel-eyebrow">Rechenweg</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
              <FormelZeile left={`${suchvolumen.toLocaleString('de-DE')} × ${fmtDecimal(klickratePct)}%`} right={`= ${fmtDecimal(ergebnis.klicks, 0)} Klicks`} />
              <FormelZeile left={`${fmtDecimal(ergebnis.klicks, 0)} × ${fmtDecimal(conversionPct)}%`} right={`= ${fmtDecimal(ergebnis.leadsProMonat)} Leads`} />
              <FormelZeile left={`${fmtDecimal(ergebnis.leadsProMonat)} × ${fmtDecimal(abschlussratePct)}%`} right={`= ${fmtDecimal(ergebnis.abschluesseProMonat)} Abschlüsse`} />
              <div style={{ borderTop: '1px solid var(--za-border)', paddingTop: '6px', marginTop: '2px' }}>
                <FormelZeile left={`${fmtDecimal(ergebnis.abschluesseProMonat)} × ${auftragswertEuro.toLocaleString('de-DE')} €`} right={`= ${fmtEuro(ergebnis.umsatzProMonatCent)} €/Mt`} bold />
              </div>
              <FormelZeile left={`${fmtEuro(ergebnis.umsatzProMonatCent)} € × 12`} right={`= ${fmtEuro(ergebnis.umsatzProJahrCent)} €/Jahr`} bold />
            </div>
          </div>

          {/* Paket-Empfehlung */}
          <div className="panel fade-up" style={{ animationDelay: '500ms', background: 'linear-gradient(135deg, rgba(42,111,219,0.06), rgba(11,36,79,0.03))' }}>
            <span className="panel-eyebrow">Empfehlung</span>
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--za-fg)' }}>
              Bei <strong>{fmtEuro(ergebnis.umsatzProJahrCent)} € Jahres-Potenzial</strong> empfehlen wir:
            </div>
            <div style={{ marginTop: '8px', fontFamily: "'Noto Serif', Georgia, serif", fontSize: '20px', color: 'var(--za-gold-2)' }}>
              {empfohlenespaket}
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--za-fg-3)' }}>
              {jahresUmsatz > 80000 ? 'Bis 10 Seiten + 4 SEO-Artikel/Mt + Performance-Report' :
               jahresUmsatz > 30000 ? 'Bis 5 Seiten + Lokales SEO + Strukturierte Daten' :
               '1 professionelle Webseite mit KI-Editor'}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ============================================================
// Komponenten
// ============================================================

function SliderInput({ label, value, min, max, step, format, onChange, info }: {
  label: string; value: number; min: number; max: number; step: number
  format: (v: number) => string; onChange: (v: number) => void; info: string
}) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--za-fg)' }}>{label}</label>
        <span style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '14px', fontWeight: 600, color: 'var(--za-gold-2)' }}>
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--za-gold)', height: '6px', cursor: 'pointer' }}
      />
      <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginTop: '4px' }}>{info}</div>
    </div>
  )
}

function MiniKPI({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className="panel fade-up" style={{ animationDelay: `${delay}ms`, padding: '16px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '22px', color: 'var(--za-fg)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
      <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '4px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </div>
    </div>
  )
}

function FormelZeile({ left, right, bold }: { left: string; right: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: bold ? 700 : 400, color: bold ? 'var(--za-fg)' : 'var(--za-fg-2)' }}>
      <span>{left}</span>
      <span>{right}</span>
    </div>
  )
}
