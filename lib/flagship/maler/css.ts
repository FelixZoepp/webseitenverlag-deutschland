/**
 * Template-Fabrik B2 — CSS der Komposition „maler-landing-v1".
 *
 * Basis = galabauCss(MALER_THEME) (Token-Layer, Struktur unangetastet),
 * plus Maler-Extras: Signature-Wand (--rolle-Fortschritt via clip-path,
 * Default 1 = fertige Wand für no-JS/reduced-motion), Galerie(-Filter),
 * Einzugsgebiets-Chips, Reviews, WhatsApp-Bubble, Unterseiten-Kopf.
 * Nur transform/opacity/clip-path animiert.
 */

import { galabauCss } from '../galabau/css'
import { MALER_THEME } from '../themes/maler'
import type { KompositionTheme } from '../themes/galabau'

const MALER_EXTRA_CSS = `
/* — Signature-Wand: Altweiß → Salbei (clip-path über --rolle, Default fertig) — */
.wand-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:48px;align-items:center}
.wand{--rolle:1;position:relative;border-radius:22px;min-height:380px;background:#F1EEE6;border:1px solid var(--line);overflow:hidden;box-shadow:0 24px 60px rgba(var(--shade-rgb),.10)}
.wand-salbei{position:absolute;inset:0;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));clip-path:inset(0 calc((1 - var(--rolle,1)) * 100%) 0 0)}
.wand-kante{position:absolute;top:0;bottom:0;left:calc(var(--rolle,1) * 100%);width:3px;margin-left:-2px;background:rgba(255,255,255,.85);opacity:.9;transform:translateZ(0)}
.wand[data-wand] .wand-kante{transition:opacity .4s ease}
.wand-tag{position:absolute;bottom:14px;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.9);color:var(--ink-soft)}
.wand-tag.von{left:14px}
.wand-tag.zu{right:14px;background:rgba(var(--accent-rgb),.16);color:var(--accent-ink)}
@media(max-width:900px){.wand-grid{grid-template-columns:1fr}.wand{min-height:260px}}
@media(prefers-reduced-motion:reduce){.wand{--rolle:1 !important}}

/* — Referenz-Galerie (Grid; Filter nur auf der Growth-Unterseite) — */
.galerie-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:1160px;margin:0 auto;padding:0 24px}
.galerie-item{position:relative;margin:0;border-radius:18px;overflow:hidden}
.galerie-item .galerie-bild{aspect-ratio:4/3;border-radius:18px}
.galerie-item figcaption{position:absolute;left:12px;bottom:12px}
.galerie-item.aus{display:none}
.galerie-filter{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin:0 auto 26px;padding:0 24px}
.filter-btn{border:1px solid var(--line);background:#fff;color:var(--ink-soft);font:inherit;font-size:14px;font-weight:600;padding:8px 16px;border-radius:999px;cursor:pointer;transition:transform .2s ease,opacity .2s ease}
.filter-btn:hover{transform:translateY(-1px)}
.filter-btn.aktiv{background:var(--accent-deep);border-color:var(--accent-deep);color:#fff}
@media(max-width:900px){.galerie-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.galerie-grid{grid-template-columns:1fr}}

/* — Einzugsgebiet: Orts-Chips, self-contained — */
.gebiet-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}
.gebiet-chip{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:999px;background:#fff;border:1px solid var(--line);font-weight:700;color:var(--ink);box-shadow:0 10px 28px rgba(var(--shade-rgb),.06)}
.gebiet-chip svg{color:var(--accent-deep)}

/* — Google-Reviews (nur echte) — */
.review-karte{background:#fff;border:1px solid var(--line);border-radius:18px;padding:26px}
.review-karte .sterne{color:var(--star);letter-spacing:2px;margin-bottom:10px}
.review-karte p{color:var(--ink-soft);line-height:1.6;margin:0 0 14px}
.review-karte .name{font-weight:700;font-size:14px}

/* — WhatsApp-Bubble (Growth-Modul) — */
.wa-bubble{position:fixed;right:22px;bottom:22px;z-index:60;display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;background:#25D366;color:#fff;box-shadow:0 14px 34px rgba(var(--shade-rgb),.28);transition:transform .2s ease}
.wa-bubble:hover{transform:translateY(-3px) scale(1.04)}

/* — Growth-Unterseiten — */
.unterseite-kopf{padding-top:140px}
.unterseite-kopf h1{font-size:clamp(34px,5vw,54px);line-height:1.08;letter-spacing:-.02em;margin:14px 0 16px}
.unterseite-kopf .sektion-lead{max-width:640px}
.feld-label{display:block;font-size:13px;font-weight:600;color:var(--ink-soft)}
.feld-label input[type=file]{margin-top:6px;padding:10px}
`.trim()

/** Gesamt-CSS: GaLaBau-Basis im Maler-Theme + Maler-Extras */
export function malerCss(theme: KompositionTheme = MALER_THEME): string {
  return `${galabauCss(theme)}\n\n${MALER_EXTRA_CSS}`
}
