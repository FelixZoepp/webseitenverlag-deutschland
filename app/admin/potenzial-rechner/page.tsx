'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Calculator, RotateCcw, Copy, Check, MapPin } from 'lucide-react'
import { BRANCHEN, STAEDTE, SUCHVOLUMEN, getSuchvolumen, getRegionalerAuftragswert } from '@/lib/potenzial-daten'

// ============================================================
// Calculator Logic
// ============================================================

function berechne(i: { suchvolumen: number; klickrate: number; conversionWebToLead: number; abschlussrate: number; auftragswertCent: number }) {
  const klicks = i.suchvolumen * i.klickrate
  const leadsProMonat = klicks * i.conversionWebToLead
  const abschluesseProMonat = leadsProMonat * i.abschlussrate
  const umsatzProMonatCent = Math.round(abschluesseProMonat * i.auftragswertCent)
  return { klicks, leadsProMonat, abschluesseProMonat, umsatzProMonatCent, umsatzProJahrCent: umsatzProMonatCent * 12 }
}

function fmtEuro(cent: number) {
  return (cent / 100).toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function fmtDec(n: number, d = 1) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: d, maximumFractionDigits: d })
}

// ============================================================
// Page
// ============================================================

export default function PotenzialRechnerPage() {
  const [brancheSlug, setBrancheSlug] = useState('')
  const [stadtSlug, setStadtSlug] = useState('')
  const [branchenFilter, setBranchenFilter] = useState('')
  const [stadtFilter, setStadtFilter] = useState('')
  const [copied, setCopied] = useState(false)

  // Inputs
  const [suchvolumen, setSuchvolumen] = useState(1000)
  const [klickratePct, setKlickratePct] = useState(28)
  const [conversionPct, setConversionPct] = useState(3.5)
  const [abschlussratePct, setAbschlussratePct] = useState(25)
  const [auftragswertEuro, setAuftragswertEuro] = useState(4200)
  const [angepasst, setAngepasst] = useState(false)

  const branche = BRANCHEN.find((b) => b.slug === brancheSlug)
  const stadt = STAEDTE.find((s) => s.slug === stadtSlug)

  // Ergebnis
  const ergebnis = useMemo(() => berechne({
    suchvolumen,
    klickrate: klickratePct / 100,
    conversionWebToLead: conversionPct / 100,
    abschlussrate: abschlussratePct / 100,
    auftragswertCent: Math.round(auftragswertEuro * 100),
  }), [suchvolumen, klickratePct, conversionPct, abschlussratePct, auftragswertEuro])

  const jahresUmsatz = ergebnis.umsatzProJahrCent / 100
  const empfohlenespaket = jahresUmsatz > 80000 ? 'Growth (249 €/Mt)' : jahresUmsatz > 30000 ? 'Business (149 €/Mt)' : 'Starter (99 €/Mt)'

  // Lade Defaults wenn Branche + Stadt gesetzt
  function ladeDefaults(bSlug: string, sSlug: string) {
    const b = BRANCHEN.find((br) => br.slug === bSlug)
    if (!b) return
    const vol = sSlug ? getSuchvolumen(bSlug, sSlug) : 0
    const aw = sSlug ? getRegionalerAuftragswert(b.auftragswertCent, sSlug) : b.auftragswertCent

    setSuchvolumen(vol || 0)
    setKlickratePct(Math.round(b.klickrateTop3 * 1000) / 10)
    setConversionPct(Math.round(b.conversionWebToLead * 1000) / 10)
    setAbschlussratePct(Math.round(b.abschlussrate * 1000) / 10)
    setAuftragswertEuro(aw / 100)
    setAngepasst(false)
  }

  function selectBranche(slug: string) {
    setBrancheSlug(slug)
    setBranchenFilter('')
    if (stadtSlug) ladeDefaults(slug, stadtSlug)
  }

  function selectStadt(slug: string) {
    setStadtSlug(slug)
    setStadtFilter('')
    if (brancheSlug) ladeDefaults(brancheSlug, slug)
  }

  function resetDefaults() {
    if (brancheSlug && stadtSlug) ladeDefaults(brancheSlug, stadtSlug)
  }

  function handleInput(setter: (v: number) => void, v: number) {
    setter(v)
    setAngepasst(true)
  }

  const auswahlKomplett = brancheSlug && stadtSlug

  // Quelle-Label für Suchvolumen
  const volumenQuelle = useMemo(() => {
    if (!brancheSlug || !stadtSlug) return ''
    const key = `${brancheSlug}:${stadtSlug}`
    return SUCHVOLUMEN[key] !== undefined ? 'Google Keyword Planner' : 'Hochrechnung nach Einwohnerzahl'
  }, [brancheSlug, stadtSlug])

  function copyErgebnis() {
    const text = [
      `Potenzial-Rechnung${branche ? ` — ${branche.name}` : ''}${stadt ? ` in ${stadt.name}` : ''}`,
      '',
      `Suchvolumen/Monat: ${suchvolumen.toLocaleString('de-DE')}${volumenQuelle ? ` (${volumenQuelle})` : ''}`,
      `Klickrate Top 3: ${fmtDec(klickratePct)}%`,
      `Conversion Web→Lead: ${fmtDec(conversionPct)}%`,
      `Abschlussrate: ${fmtDec(abschlussratePct)}%`,
      `Ø Auftragswert: ${auftragswertEuro.toLocaleString('de-DE')} €${stadt ? ` (Kaufkraft ${stadt.name}: ${Math.round(stadt.kaufkraftIndex * 100)}%)` : ''}`,
      '',
      `→ ${fmtDec(ergebnis.klicks, 0)} Klicks/Monat`,
      `→ ${fmtDec(ergebnis.leadsProMonat)} Leads/Monat`,
      `→ ${fmtDec(ergebnis.abschluesseProMonat)} Abschlüsse/Monat`,
      `→ ${fmtEuro(ergebnis.umsatzProMonatCent)} € Umsatz/Monat`,
      `→ ${fmtEuro(ergebnis.umsatzProJahrCent)} € Umsatz/Jahr`,
      '',
      `Empfohlenes Paket: ${empfohlenespaket}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const gefilterteBranchen = BRANCHEN.filter((b) => b.name.toLowerCase().includes(branchenFilter.toLowerCase()))
  const gefiltereStaedte = STAEDTE.filter((s) => s.name.toLowerCase().includes(stadtFilter.toLowerCase()))

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
        {auswahlKomplett && (
          <button onClick={copyErgebnis}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--za-surface)', border: '1px solid var(--za-border)', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 500, color: 'var(--za-fg-2)', cursor: 'pointer' }}>
            {copied ? <><Check size={14} color="var(--za-success)" /> Kopiert</> : <><Copy size={14} /> Ergebnis kopieren</>}
          </button>
        )}
      </div>

      {/* Branche + Stadt Auswahl */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Branche */}
        <div className="panel fade-up" style={{ animationDelay: '60ms' }}>
          <span className="panel-eyebrow">Schritt 1</span>
          <div className="panel-title" style={{ marginBottom: '14px' }}>Branche</div>
          <input
            type="text"
            placeholder="Branche suchen..."
            value={branchenFilter}
            onChange={(e) => setBranchenFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--za-border)', background: 'var(--za-surface)', fontSize: '13px', color: 'var(--za-fg)', marginBottom: '12px', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {gefilterteBranchen.map((b) => (
              <button key={b.slug} onClick={() => selectBranche(b.slug)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  border: brancheSlug === b.slug ? '1.5px solid var(--za-gold)' : '1px solid var(--za-border)',
                  background: brancheSlug === b.slug ? 'rgba(42,111,219,0.08)' : 'var(--za-surface)',
                  color: brancheSlug === b.slug ? 'var(--za-gold-2)' : 'var(--za-fg-2)',
                  transition: 'all 240ms',
                }}>
                {b.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stadt */}
        <div className="panel fade-up" style={{ animationDelay: '120ms' }}>
          <span className="panel-eyebrow">Schritt 2</span>
          <div className="panel-title" style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} /> Stadt
          </div>
          <input
            type="text"
            placeholder="Stadt suchen..."
            value={stadtFilter}
            onChange={(e) => setStadtFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--za-border)', background: 'var(--za-surface)', fontSize: '13px', color: 'var(--za-fg)', marginBottom: '12px', outline: 'none' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
            {gefiltereStaedte.map((s) => (
              <button key={s.slug} onClick={() => selectStadt(s.slug)}
                style={{
                  padding: '7px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  border: stadtSlug === s.slug ? '1.5px solid var(--za-gold)' : '1px solid var(--za-border)',
                  background: stadtSlug === s.slug ? 'rgba(42,111,219,0.08)' : 'var(--za-surface)',
                  color: stadtSlug === s.slug ? 'var(--za-gold-2)' : 'var(--za-fg-2)',
                  transition: 'all 240ms',
                }}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auswahl-Info */}
      {auswahlKomplett && stadt && branche && (
        <div className="panel fade-up" style={{ animationDelay: '180ms', marginBottom: '16px', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--za-fg)' }}>{branche.name}</span>
            <span style={{ color: 'var(--za-fg-4)' }}>×</span>
            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--za-fg)' }}>{stadt.name}</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--za-fg-3)' }}>
            <span>{stadt.einwohner.toLocaleString('de-DE')} Einwohner</span>
            <span>Kaufkraft: {Math.round(stadt.kaufkraftIndex * 100)}%</span>
            <span>SV: {volumenQuelle}</span>
          </div>
        </div>
      )}

      {/* Rechner — nur anzeigen wenn beide gewählt */}
      {auswahlKomplett && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Inputs */}
          <div className="panel fade-up" style={{ animationDelay: '240ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span className="panel-eyebrow">Schritt 3</span>
                <div className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={16} /> Parameter
                  {angepasst && (
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: 'rgba(42,111,219,0.10)', color: 'var(--za-gold)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      Angepasst
                    </span>
                  )}
                </div>
              </div>
              {angepasst && (
                <button onClick={resetDefaults} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--za-fg-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SliderInput label="Suchvolumen / Monat" value={suchvolumen} min={0} max={15000} step={10}
                format={(v) => v.toLocaleString('de-DE')} onChange={(v) => handleInput(setSuchvolumen, v)}
                info={volumenQuelle || 'Wie oft wird die Branche + Stadt gegoogelt'} />
              <SliderInput label="Klickrate Top 3 (%)" value={klickratePct} min={0} max={60} step={0.5}
                format={(v) => `${fmtDec(v)}%`} onChange={(v) => handleInput(setKlickratePct, v)}
                info="Anteil der Klicks auf die Top-3-Suchergebnisse" />
              <SliderInput label="Conversion Web → Lead (%)" value={conversionPct} min={0} max={15} step={0.1}
                format={(v) => `${fmtDec(v)}%`} onChange={(v) => handleInput(setConversionPct, v)}
                info="Besucher die eine Anfrage stellen" />
              <SliderInput label="Abschlussrate (%)" value={abschlussratePct} min={0} max={100} step={1}
                format={(v) => `${fmtDec(v, 0)}%`} onChange={(v) => handleInput(setAbschlussratePct, v)}
                info="Leads die zu Kunden werden" />
              <SliderInput label="Ø Auftragswert (€)" value={auftragswertEuro} min={10} max={50000} step={10}
                format={(v) => `${v.toLocaleString('de-DE')} €`} onChange={(v) => handleInput(setAuftragswertEuro, v)}
                info={stadt ? `Kaufkraft ${stadt.name}: ${Math.round(stadt.kaufkraftIndex * 100)}% vom DE-Schnitt` : 'Durchschnittlicher Umsatz pro Auftrag'} />
            </div>
          </div>

          {/* Ergebnis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel fade-up" style={{ animationDelay: '300ms', textAlign: 'center', padding: '32px 22px' }}>
              <span className="panel-eyebrow">Potenzial pro Jahr</span>
              <div style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '48px', letterSpacing: '-0.03em', color: 'var(--za-fg)', lineHeight: 1, marginTop: '8px' }}>
                {fmtEuro(ergebnis.umsatzProJahrCent)}
                <span style={{ fontSize: '24px', color: 'var(--za-gold)', marginLeft: '6px' }}>€</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--za-fg-2)', marginTop: '8px' }}>
                Umsatz-Potenzial für {branche?.name} in {stadt?.name}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <MiniKPI label="Klicks / Monat" value={fmtDec(ergebnis.klicks, 0)} delay={360} />
              <MiniKPI label="Leads / Monat" value={fmtDec(ergebnis.leadsProMonat)} delay={400} />
              <MiniKPI label="Abschlüsse / Monat" value={fmtDec(ergebnis.abschluesseProMonat)} delay={440} />
              <MiniKPI label="Umsatz / Monat" value={`${fmtEuro(ergebnis.umsatzProMonatCent)} €`} delay={480} />
            </div>

            <div className="panel fade-up" style={{ animationDelay: '520ms' }}>
              <span className="panel-eyebrow">Rechenweg</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                <FormelZeile left={`${suchvolumen.toLocaleString('de-DE')} × ${fmtDec(klickratePct)}%`} right={`= ${fmtDec(ergebnis.klicks, 0)} Klicks`} />
                <FormelZeile left={`${fmtDec(ergebnis.klicks, 0)} × ${fmtDec(conversionPct)}%`} right={`= ${fmtDec(ergebnis.leadsProMonat)} Leads`} />
                <FormelZeile left={`${fmtDec(ergebnis.leadsProMonat)} × ${fmtDec(abschlussratePct)}%`} right={`= ${fmtDec(ergebnis.abschluesseProMonat)} Abschl.`} />
                <div style={{ borderTop: '1px solid var(--za-border)', paddingTop: '6px', marginTop: '2px' }}>
                  <FormelZeile left={`${fmtDec(ergebnis.abschluesseProMonat)} × ${auftragswertEuro.toLocaleString('de-DE')} €`} right={`= ${fmtEuro(ergebnis.umsatzProMonatCent)} €/Mt`} bold />
                </div>
                <FormelZeile left={`${fmtEuro(ergebnis.umsatzProMonatCent)} € × 12`} right={`= ${fmtEuro(ergebnis.umsatzProJahrCent)} €/Jahr`} bold />
              </div>
            </div>

            <div className="panel fade-up" style={{ animationDelay: '580ms', background: 'linear-gradient(135deg, rgba(42,111,219,0.06), rgba(11,36,79,0.03))' }}>
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
      )}

      {/* Platzhalter wenn noch nicht alles gewählt */}
      {!auswahlKomplett && (
        <div className="panel fade-up" style={{ animationDelay: '200ms', textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📊</div>
          <div style={{ fontSize: '14px', color: 'var(--za-fg-3)' }}>
            {!brancheSlug ? 'Wähle zuerst eine Branche' : 'Wähle eine Stadt für lokale Daten'}
          </div>
        </div>
      )}
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
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--za-gold)', height: '6px', cursor: 'pointer' }} />
      <div style={{ fontSize: '10px', color: 'var(--za-fg-4)', marginTop: '4px' }}>{info}</div>
    </div>
  )
}

function MiniKPI({ label, value, delay }: { label: string; value: string; delay: number }) {
  return (
    <div className="panel fade-up" style={{ animationDelay: `${delay}ms`, padding: '16px', textAlign: 'center' }}>
      <div style={{ fontFamily: "'Noto Serif', Georgia, serif", fontSize: '22px', color: 'var(--za-fg)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'var(--za-fg-3)', marginTop: '4px', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
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
