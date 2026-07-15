/**
 * Flagship-Engine: HTML-Bausteine — Escaping, Highlight-Markup, Icon-Map.
 * Alle Inhalte werden escaped; [[wort]] ist die einzige Auszeichnung.
 */

import type { IconKey, MediaSlot } from './types'

export function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function escAttr(s: string): string {
  return esc(s).replace(/'/g, '&#39;')
}

/** [[wort]] → <span class="hl">wort</span>, Rest escaped */
export function hl(s: string, extraClass = ''): string {
  return markiere(s, (inner) => `<span class="hl${extraClass ? ' ' + extraClass : ''}">${inner}</span>`)
}

/** [[wort]] → <em>wort</em> (Fakten-Leiste), Rest escaped */
export function em(s: string): string {
  return markiere(s, (inner) => `<em>${inner}</em>`)
}

function markiere(s: string, wrap: (inner: string) => string): string {
  const teile = s.split(/\[\[(.+?)\]\]/g)
  return teile
    .map((teil, i) => (i % 2 === 1 ? wrap(esc(teil)) : esc(teil)))
    .join('')
}

/** SVG-Innenpfade (stroke-basiert, viewBox 0 0 24 24) — aus den Flagship-Referenzen */
export const ICON_PATHS: Record<IconKey, string> = {
  check: '<path d="M20 6L9 17l-5-5"/>',
  shield: '<path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  clock: '<path d="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  badge: '<path d="M9 12l2 2 4-4M7.8 4.6a5 5 0 018.4 0M4 9a9 9 0 0116 0"/>',
  window: '<rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M12 3v18M4 12h16"/>',
  building: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
  sparkle: '<path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
  bucket: '<path d="M5 8h14l-1 13H6L5 8zM8 8V6a4 4 0 018 0v2"/>',
  sofa: '<path d="M4 12V9a3 3 0 013-3h10a3 3 0 013 3v3M4 12a2 2 0 00-2 2v3h20v-3a2 2 0 00-2-2M4 12h16M6 17v2M18 17v2"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  wallet: '<path d="M20 12V8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2v-1M22 12h-6a2 2 0 000 4h6v-4z"/>',
  pin: '<path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  phone: '<path d="M4 5a2 2 0 012-2h2l2 5-2.2 1.4a12 12 0 006.8 6.8L16 14l5 2v2a2 2 0 01-2 2A16 16 0 014 5z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4l-2.9 2.9-2.1-2.1 2.9-2.9z"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.6 8.6L20 20M14.5 9.5L20 4M8.6 15.4l3.4-3.4"/>',
  car: '<path d="M5 16l1.5-5.5A2 2 0 018.4 9h7.2a2 2 0 011.9 1.5L19 16M5 16h14M5 16v3h2v-2h10v2h2v-3M7.5 13h.01M16.5 13h.01"/>',
  heart: '<path d="M12 21s-8-5.4-8-11a4.6 4.6 0 018-3.2A4.6 4.6 0 0120 10c0 5.6-8 11-8 11z"/>',
  chart: '<path d="M3 21h18M7 17V9M12 17V5M17 17v-6"/>',
  leaf: '<path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19c3-3 6-5 10-6"/>',
  star: '<path d="M12 3l2.7 5.6 6.3.9-4.5 4.3 1 6.2L12 17l-5.5 3 1-6.2L3 9.5l6.3-.9L12 3z"/>',
}

export function icon(key: IconKey, strokeWidth = 1.8): string {
  const path = ICON_PATHS[key] || ICON_PATHS.check
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}">${path}</svg>`
}

/**
 * Media-Slot: gestalteter Platzhalter, bis das Asset lädt
 * (Muster aus den Flagships: onload → .loaded, onerror → remove).
 */
export function mediaSlot(slot: MediaSlot, klassen: string, extraStyle = ''): string {
  const style = [slot.hintergrund ? `background:${slot.hintergrund}` : '', extraStyle]
    .filter(Boolean)
    .join(';')
  const img = slot.datei
    ? `<img src="${escAttr(slot.datei)}" alt="${escAttr(slot.alt || slot.label)}" onload="this.parentElement.classList.add('loaded')" onerror="this.remove()">`
    : ''
  return `<div class="${klassen} media" data-label="${escAttr(slot.label)}"${style ? ` style="${escAttr(style)}"` : ''}>${img}</div>`
}
