/**
 * Subdomain-Generierung für Kunden-Sites.
 * Schema: {slug}.webseitenverlag-deutschland.de
 */

/** Slugify: Firmenname → DNS-konformer Subdomain-Label */
export function slugifyFirmenname(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    // Akzentbuchstaben (é, è, à, â, ê, …) → Basiszeichen
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')  // alles außer a-z, 0-9 → Bindestrich
    .replace(/^-+|-+$/g, '')       // führende/trailing Bindestriche weg
    .slice(0, 63)                   // DNS-Limit
}
