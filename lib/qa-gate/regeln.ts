/**
 * QA-Gate (QA_GATE_PRODUKTSTUFEN_PROMPT Baustein B): Regel-Registry.
 *
 * QUALITY_CHECKLIST.md wird aus dieser Registry generiert — die Registry ist
 * die einzige maschinenlesbare Quelle. Jede Regel trägt:
 *   id            eindeutige Regel-ID (C-* config, R-* render, B-* browser)
 *   layer         wo die Regel durchgesetzt wird
 *   autofix       chirurgische Reparatur-Strategie (Baustein A)
 *   implementiertIn  Datei, die die Regel durchsetzt
 *   marker        String, der in implementiertIn vorkommen MUSS (Coverage-Lint)
 *   testRef       Testdatei, deren Testnamen die Regel-ID enthalten müssen
 *
 * scripts/check-quality-coverage.ts prüft: Regel ohne Implementierung in
 * ihrem Layer = Build-Fehler.
 */

export type RegelLayer = 'config' | 'render' | 'browser'

export interface QaRegel {
  id: string
  beschreibung: string
  layer: RegelLayer
  autofix: string
  implementiertIn: string
  /** String der in implementiertIn wörtlich vorkommen muss (Default: die Regel-ID) */
  marker?: string
  testRef: string
  kategorie: 'Inhalt & Copy' | 'Bilder' | 'Technik' | 'SEO & Recht' | 'Video/Growth'
}

const T_QA = 'scripts/test-qa-gate.ts'
const T_P3 = 'scripts/test-phase3.ts'
const VALIDATOR = 'lib/generierung/konsistenz-validator.ts'
const COPY = 'lib/generierung/copy-slots.ts'
const BROWSER = 'lib/qa-gate/browser-checks.ts'
const RENDER = 'lib/qa-gate/render-checks.ts'

export const QA_REGELN: QaRegel[] = [
  // ------------------------------------------------------------ Inhalt & Copy
  {
    id: 'C-STADT-H1',
    beschreibung: 'Kundenstadt kommt in H1 (hero_headline) und im SEO-Titel vor.',
    layer: 'config',
    autofix: 'Copy-Retry mit Fehler-Feedback (max. 2 Runden), sonst failed.',
    implementiertIn: COPY,
    marker: 'enthaeltStadt',
    testRef: T_P3,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'B-BLOCKLISTE',
    beschreibung: 'Keine fremde Stadt aus der Top-200-Blockliste im sichtbaren DOM.',
    layer: 'browser',
    autofix: 'Nur betroffene Copy-Slots mit Fehler-Feedback neu generieren, andere unverändert.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'R-FLOSKEL',
    beschreibung: 'Floskel-Blacklist („Ihr zuverlässiger Partner“ u. a.) taucht nirgends auf.',
    layer: 'render',
    autofix: 'Copy-Retry mit Fehler-Feedback (max. 2 Runden), sonst failed.',
    implementiertIn: COPY,
    marker: 'FLOSKEL_BLACKLIST',
    testRef: T_P3,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'B-STUB',
    beschreibung: 'Keine {{Token}}-Reste, kein „Lorem“, keine Stub-Texte im DOM.',
    layer: 'browser',
    autofix: 'Nur betroffene Copy-Slots mit Fehler-Feedback neu befüllen, andere unverändert.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'C-LIMITS',
    beschreibung: 'Zeichenlimits aller Copy-Slots werden eingehalten (Schema).',
    layer: 'config',
    autofix: 'Copy-Retry mit Limit-Feedback (max. 2 Runden), sonst failed.',
    implementiertIn: COPY,
    marker: 'baueCopySlotsSchema',
    testRef: T_P3,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'C-REVIEWS',
    beschreibung: 'Keine erfundenen Bewertungen — Kundenstimmen nur bei echten Profildaten.',
    layer: 'config',
    autofix: 'Stimmen-Sektion automatisch leeren (quotes = []).',
    implementiertIn: VALIDATOR,
    marker: 'erfundene_bewertungen',
    testRef: T_P3,
    kategorie: 'Inhalt & Copy',
  },
  {
    id: 'B-KONTAKT',
    beschreibung: 'Telefon sichtbar und als tel:-Link verlinkt; Kontaktweg vorhanden.',
    layer: 'browser',
    autofix: 'Strukturell (Template-Bug) → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Inhalt & Copy',
  },

  // ------------------------------------------------------------ Bilder
  {
    id: 'C-SLOTS',
    beschreibung: 'Alle Pflicht-Bild-Slots (Hero, Signature vorher/nachher, BA-Paare) sind befüllt.',
    layer: 'config',
    autofix: 'assignAssets für genau diesen Slot erneut, sonst failed.',
    implementiertIn: VALIDATOR,
    marker: 'pflicht_slot_leer',
    testRef: T_P3,
    kategorie: 'Bilder',
  },
  {
    id: 'B-IMG-LOAD',
    beschreibung: 'Jedes <img> lädt wirklich (naturalWidth > 0).',
    layer: 'browser',
    autofix:
      'assignAssets für genau diesen Slot mit Ausschlussliste; defektes Asset als broken markieren + Admin-Hinweis.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Bilder',
  },
  {
    id: 'C-IMG-DUP',
    beschreibung: 'Kein Bild doppelt auf derselben Seite.',
    layer: 'config',
    autofix: 'assignAssets mit Ausschlussliste für den doppelten Slot.',
    implementiertIn: VALIDATOR,
    marker: 'doppeltes_bild',
    testRef: T_P3,
    kategorie: 'Bilder',
  },
  {
    id: 'B-ASPECT',
    beschreibung: 'Dargestelltes Seitenverhältnis weicht max. ±5 % vom intrinsischen ab (keine Verzerrung).',
    layer: 'browser',
    autofix: 'Maße aus Asset-DB nachziehen; strukturell → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Bilder',
  },
  {
    id: 'R-IMG-DIM',
    beschreibung: 'Jedes <img> trägt width- und height-Attribut (CLS-Schutz).',
    layer: 'render',
    autofix: 'Maße aus Asset-DB nachziehen (setzeBildMasse); strukturell → Template-Bug → failed.',
    implementiertIn: VALIDATOR,
    marker: 'img_dimensionen',
    testRef: T_P3,
    kategorie: 'Bilder',
  },
  {
    id: 'R-ALT',
    beschreibung: 'Jedes <img> hat aussagekräftigen deutschen alt-Text.',
    layer: 'render',
    autofix: 'alt aus Asset-Datensatz (alt_text_de) ziehen, sonst Claude-generieren und am Asset speichern.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'Bilder',
  },
  {
    id: 'C-APPROVED',
    beschreibung: 'Nur Assets mit quality_status=approved werden zugewiesen.',
    layer: 'config',
    autofix: 'Kein Autofix — harter Fail in assignAssets, wenn kein approved Asset existiert.',
    implementiertIn: 'lib/assets/repository.ts',
    marker: "quality_status', 'approved'",
    testRef: 'scripts/test-assets.ts',
    kategorie: 'Bilder',
  },
  {
    id: 'C-PAAR',
    beschreibung: 'Vorher/Nachher-Bilder nur als echtes Paar (gemeinsame pair_id).',
    layer: 'config',
    autofix: 'Paar-Neuzuweisung über pair_id; ohne Paar → Sektion entfällt.',
    implementiertIn: VALIDATOR,
    marker: 'signature_paar',
    testRef: T_P3,
    kategorie: 'Bilder',
  },
  {
    id: 'R-VARIANTEN',
    beschreibung: 'Nur verarbeitete Varianten im HTML — keine original_-Pfade.',
    layer: 'render',
    autofix: 'Slot auf Variante umziehen (assignAssets), sonst failed.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'Bilder',
  },

  // ------------------------------------------------------------ Technik
  {
    id: 'B-CONSOLE',
    beschreibung: 'Keine Console-Errors und keine fehlgeschlagenen Requests beim Laden.',
    layer: 'browser',
    autofix: 'Drittanbieter-Quelle entfernen; eigener Code → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'R-CDN',
    beschreibung: 'Keine fremden CDNs/Third-Party-Skripte im HTML (Fonts/Assets self-hosted bzw. Supabase).',
    layer: 'render',
    autofix: 'Fremde Quelle aus dem HTML entfernen.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'B-CLS',
    beschreibung: 'Cumulative Layout Shift < 0.05 beim Laden (mobil und Desktop).',
    layer: 'browser',
    autofix: 'width/height aus Asset-DB nachziehen; strukturell → Template-Bug → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'R-JS-BUDGET',
    beschreibung: 'Inline-JS-Budget: Gesamtgröße aller <script> ≤ 32 kB (keine Frameworks).',
    layer: 'render',
    autofix: 'Kein Autofix — Template-Bug → failed + manual_task.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'B-LINKS',
    beschreibung: 'Keine toten href="#"-Links im DOM.',
    layer: 'browser',
    autofix: 'Link aus Sektions-Config reparieren oder Element ausblenden; sonst failed.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'B-FORM',
    beschreibung: 'Formular-Testsubmit erreicht den Endpoint (bzw. Funnel-CTA korrekt verlinkt).',
    layer: 'browser',
    autofix: 'Strukturell → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Technik',
  },
  {
    id: 'B-MOTION',
    beschreibung: 'prefers-reduced-motion wird respektiert (keine Endlos-Animationen unter reduce).',
    layer: 'browser',
    autofix: 'Strukturell → Template-Bug → failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Technik',
  },

  // ------------------------------------------------------------ SEO & Recht
  {
    id: 'R-SEO-TITLE',
    beschreibung: 'Title (≤60) und Meta-Description (≤160) vorhanden, beide mit Kundenstadt.',
    layer: 'render',
    autofix: 'seo_titel/seo_beschreibung mit Feedback neu generieren.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },
  {
    id: 'R-JSONLD',
    beschreibung: 'JSON-LD (LocalBusiness) vorhanden und valide parsebar.',
    layer: 'render',
    autofix: 'Kein Autofix — Template-Bug → failed.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },
  {
    id: 'R-OG',
    beschreibung: 'OG-Tags (og:title, og:description, og:type, og:locale) vorhanden.',
    layer: 'render',
    autofix: 'Kein Autofix — Template-Bug → failed.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },
  {
    id: 'B-RECHT',
    beschreibung: 'Impressum und Datenschutz sind verlinkt (kein #, kein leerer href).',
    layer: 'browser',
    autofix: 'Links aus Sektions-Config reparieren; sonst failed + manual_task.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },
  {
    id: 'B-NOINDEX',
    beschreibung: 'Demo trägt noindex; Live-Site trägt KEIN noindex.',
    layer: 'browser',
    autofix: 'Re-Render mit korrekter noindex-Option.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },
  {
    id: 'R-SITEMAP',
    beschreibung: 'Live-Sites: canonical gesetzt; Sitemap-Route liefert die Site aus.',
    layer: 'render',
    autofix: 'Kein Autofix — Hosting-Bug → failed + manual_task.',
    implementiertIn: RENDER,
    testRef: T_QA,
    kategorie: 'SEO & Recht',
  },

  // ------------------------------------------------------------ Video/Growth
  {
    id: 'C-VIDEO-SIZE',
    beschreibung: 'Hero-Video ≤ 3 MB (transcodiert), sonst kein Video.',
    layer: 'config',
    autofix: 'Fallback auf statisches Hero-Bild desselben Slots + Video-Task in Admin-Queue.',
    implementiertIn: RENDER,
    marker: 'C-VIDEO-SIZE',
    testRef: T_QA,
    kategorie: 'Video/Growth',
  },
  {
    id: 'B-VIDEO-ATTR',
    beschreibung: 'Video hat muted, loop/scrub, playsinline und poster (kein Autoplay-Block, kein CLS).',
    layer: 'browser',
    autofix: 'Fallback auf statisches Hero-Bild + Video-Task in Admin-Queue.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Video/Growth',
  },
  {
    id: 'B-VIDEO-LAZY',
    beschreibung: 'Poster ist LCP-Kandidat, Video lädt lazy (preload=metadata/none).',
    layer: 'browser',
    autofix: 'Fallback auf statisches Hero-Bild + Video-Task in Admin-Queue.',
    implementiertIn: BROWSER,
    testRef: T_QA,
    kategorie: 'Video/Growth',
  },
  {
    id: 'C-VIDEO-FALLBACK',
    beschreibung: 'Jedes Video hat ein statisches Fallback-Bild (poster/Hero-Bild) im Config.',
    layer: 'config',
    autofix: 'Poster aus Hero-Bild setzen; ohne Bild → Video entfernen.',
    implementiertIn: RENDER,
    marker: 'C-VIDEO-FALLBACK',
    testRef: T_QA,
    kategorie: 'Video/Growth',
  },
]

export function regelnNachLayer(layer: RegelLayer): QaRegel[] {
  return QA_REGELN.filter((r) => r.layer === layer)
}

export function findeRegel(id: string): QaRegel | undefined {
  return QA_REGELN.find((r) => r.id === id)
}

// ------------------------------------------------------------
// Ergebnis-Typen (qa_reports.report)
// ------------------------------------------------------------

export interface RegelErgebnis {
  regelId: string
  ok: boolean
  /** CSS-Selector bzw. Fundstelle */
  selector?: string
  gemessen?: string
  erwartet?: string
  viewport?: 'mobile' | 'desktop'
}

export interface QaReport {
  status: 'passed' | 'repaired' | 'failed'
  runden: number
  ergebnisse: RegelErgebnis[]
  reparaturen: string[]
  /** Menschenlesbarer Grund bei failed */
  fehler_grund?: string
  geprueft_am: string
}

/** Menschenlesbare Zusammenfassung fehlgeschlagener Regeln */
export function fehlerAlsText(ergebnisse: RegelErgebnis[]): string {
  const fails = ergebnisse.filter((e) => !e.ok)
  if (fails.length === 0) return 'Alle QA-Regeln bestanden.'
  return fails
    .map((f) => {
      const regel = findeRegel(f.regelId)
      const teile = [
        `[${f.regelId}${f.viewport ? ` · ${f.viewport}` : ''}] ${regel?.beschreibung ?? ''}`,
        f.selector ? `Selector: ${f.selector}` : null,
        f.gemessen ? `Gemessen: ${f.gemessen}` : null,
        f.erwartet ? `Erwartet: ${f.erwartet}` : null,
      ].filter(Boolean)
      return teile.join(' — ')
    })
    .join('\n')
}
