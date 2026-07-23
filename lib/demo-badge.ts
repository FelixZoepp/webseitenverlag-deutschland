/**
 * Demo-Badge + Social-Meta für ALLE Demo-Auslieferungspfade (B-01, B-16).
 *
 * Eine einzige Injektionsstelle statt Renderer-Wissen: egal ob custom,
 * flagship, library oder premium — jede Demo-Response läuft durch
 * `finalisiereDemoHtml`. Damit kann kein Engine-Pfad mehr ohne Badge,
 * noindex oder OG-Preview ausgeliefert werden (Zielbild Station 5:
 * „Demo-Link (noindex, Badge)").
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

export interface DemoBadgeOptionen {
  prospectName: string
  /** Stripe-Payment-Link der Demo (falls vom Admin erzeugt) → CTA „Jetzt freischalten" */
  paymentLinkUrl?: string | null
  /** Absolute Origin für og:image (z. B. https://webseitenverlag.de) */
  origin: string
}

/** Fixe Leiste am unteren Rand — der Kauf-Trigger auf jeder Demo. */
export function demoLeiste(opts: DemoBadgeOptionen): string {
  const cta = opts.paymentLinkUrl
    ? `<a href="${escapeHtml(opts.paymentLinkUrl)}" style="background:#22c55e;color:#0f1115;font-weight:600;padding:6px 14px;border-radius:999px;text-decoration:none;white-space:nowrap;flex-shrink:0">Jetzt freischalten</a>`
    : ''
  return `
<div data-demo-badge style="position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#111;color:#fff;font-family:system-ui,sans-serif;font-size:13px;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 -2px 12px rgba(0,0,0,0.3)">
  <span style="background:#22c55e;width:8px;height:8px;border-radius:50%;display:inline-block;flex-shrink:0"></span>
  <span>Demo-Vorschau für <strong>${escapeHtml(opts.prospectName)}</strong> &middot; erstellt vom Webseiten-Verlag Deutschland</span>
  ${cta}
</div>
<div style="height:44px"></div>`
}

/** noindex + OG-Tags für WhatsApp/E-Mail-Vorschau (og:image muss absolut sein). */
export function demoMetaTags(opts: DemoBadgeOptionen): string {
  const titel = escapeHtml(`${opts.prospectName} — Ihre neue Website (Vorschau)`)
  const beschreibung = escapeHtml(
    'Persönliche Website-Vorschau, erstellt vom Webseiten-Verlag Deutschland.'
  )
  const bild = `${opts.origin.replace(/\/$/, '')}/og-image.png`
  return [
    '<meta name="robots" content="noindex, nofollow">',
    `<meta property="og:title" content="${titel}">`,
    `<meta property="og:description" content="${beschreibung}">`,
    `<meta property="og:image" content="${bild}">`,
    '<meta property="og:type" content="website">',
    '<meta name="twitter:card" content="summary_large_image">',
  ].join('')
}

/**
 * Pflicht-Finalisierung jeder Demo-HTML-Response:
 * Badge vor </body>, Meta-Tags nach <head>. Fehlt eine der Marken im HTML,
 * wird angehängt bzw. vorangestellt — nie stillschweigend ausgelassen.
 */
export function finalisiereDemoHtml(html: string, opts: DemoBadgeOptionen): string {
  const badge = demoLeiste(opts)
  const mitBadge = html.includes('</body>')
    ? html.replace('</body>', `${badge}</body>`)
    : html + badge
  const meta = demoMetaTags(opts)
  if (mitBadge.includes('<head>')) return mitBadge.replace('<head>', `<head>${meta}`)
  return meta + mitBadge
}
