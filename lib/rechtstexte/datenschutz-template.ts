/**
 * Datenschutz-Template (Change 3, §5.4).
 *
 * Modularer Datenschutzerklaerung-Generator:
 * - Verantwortlicher aus Impressum-Daten
 * - Bausteine je nach aktiven Features der Site
 * - Optionaler ergaenzender Hinweis vom Kunden
 *
 * TEMPLATE_VERSION wird in pflichtangaben.rechtstext_template_version gespeichert
 * und bei Mismatch automatisch neu gerendert.
 */

import type { ImpressumDaten } from './types'

export const TEMPLATE_VERSION = '1.0'

// ============================================================
// Bausteine
// ============================================================

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const BAUSTEIN_HOSTING = `<h3>Hosting</h3>
<p>Diese Website wird bei einem externen Dienstleister gehostet. Anbieter sind:</p>
<ul>
<li><strong>Vercel Inc.</strong>, 340 S Lemon Ave #4133, Walnut, CA 91789, USA (Hosting, CDN, Edge-Funktionen)</li>
<li><strong>Supabase Inc.</strong>, 970 Toa Payoh North #07-04, Singapore 318992 (Datenbank, Authentifizierung)</li>
</ul>
<p>Beim Aufruf dieser Website werden automatisch Informationen in Server-Logfiles gespeichert. Dabei handelt es sich um: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite, Browsertyp und -version, Betriebssystem sowie die Referrer-URL. Diese Daten sind technisch erforderlich, um die Website anzuzeigen und die Stabilität und Sicherheit zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO). Die Server-Logfiles werden nach 30 Tagen automatisch gelöscht.</p>
<p>Wir haben mit den o. g. Anbietern Auftragsverarbeitungsverträge (AVV) geschlossen. Die Übermittlung in die USA erfolgt auf Grundlage der EU-Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).</p>`

const BAUSTEIN_KONTAKTFORMULAR = `<h3>Kontaktformular</h3>
<p>Wenn Sie uns über das Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Formular inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert (Art. 6 Abs. 1 lit. b DSGVO). Diese Daten geben wir nicht ohne Ihre Einwilligung weiter. Die Daten werden gelöscht, sobald die Anfrage abschließend bearbeitet ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.</p>`

const BAUSTEIN_TERMINBUCHUNG = `<h3>Terminbuchung</h3>
<p>Für die Online-Terminbuchung werden Ihr Name, Ihre E-Mail-Adresse, optional eine Telefonnummer sowie der gewünschte Termin erhoben. Die Verarbeitung erfolgt zur Durchführung vorvertraglicher Maßnahmen bzw. zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO). Die Daten werden nach Ablauf der Aufbewahrungsfrist (i. d. R. 6 Monate nach letztem Termin) gelöscht.</p>`

const BAUSTEIN_ANALYTICS = `<h3>Webanalyse</h3>
<p>Diese Website nutzt ein datenschutzfreundliches Analyse-Tool, das keine Cookies setzt und keine personenbezogenen Daten an Dritte übermittelt. Es werden lediglich anonymisierte Nutzungsstatistiken erhoben (Seitenaufrufe, ungefähre Region, Gerätetyp). Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an der Verbesserung unseres Webangebots (Art. 6 Abs. 1 lit. f DSGVO).</p>`

const BAUSTEIN_NEWSLETTER = `<h3>Newsletter</h3>
<p>Wenn Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse zum Zweck des Versands auf Grundlage Ihrer Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Sie können den Newsletter jederzeit über den Abmeldelink in jeder E-Mail abbestellen. Die Daten werden nach Abmeldung gelöscht, sofern keine anderweitige Rechtsgrundlage besteht.</p>`

const BAUSTEIN_GOOGLE_MAPS = `<h3>Google Maps</h3>
<p>Diese Website bindet Karten von Google Maps ein (Anbieter: Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland). Beim Laden der Karte werden Daten (u. a. IP-Adresse) an Google übertragen. Die Einbindung erfolgt auf Grundlage unseres berechtigten Interesses an der ansprechenden Darstellung unseres Standorts (Art. 6 Abs. 1 lit. f DSGVO). Datenschutzhinweise von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>.</p>`

const BAUSTEIN_SOCIAL_MEDIA = `<h3>Social-Media-Verlinkungen</h3>
<p>Auf unserer Website befinden sich Links zu unseren Social-Media-Profilen. Es handelt sich um einfache Verlinkungen (keine Social-Plugins), sodass beim Aufruf unserer Website keine Daten an die Betreiber der sozialen Netzwerke übertragen werden. Erst beim Klick auf den Link werden Sie auf die jeweilige Plattform weitergeleitet und es gelten deren Datenschutzbestimmungen.</p>`

// Feature-Key -> Baustein
const FEATURE_BAUSTEINE: Record<string, string> = {
  kontaktformular: BAUSTEIN_KONTAKTFORMULAR,
  terminbuchung: BAUSTEIN_TERMINBUCHUNG,
  analytics: BAUSTEIN_ANALYTICS,
  newsletter: BAUSTEIN_NEWSLETTER,
  google_maps: BAUSTEIN_GOOGLE_MAPS,
  social_media: BAUSTEIN_SOCIAL_MEDIA,
}

// ============================================================
// Renderer
// ============================================================

export function rendereDatenschutz(
  impressum: ImpressumDaten,
  aktiveFeatures: string[],
  ergaenzung?: string
): string {
  const teile: string[] = []
  let abschnittNr = 1

  // 1. Verantwortlicher
  teile.push(`<h2>${abschnittNr}. Verantwortlicher</h2>`)
  teile.push(`<p>${esc(impressum.firmenname)}<br>`)
  teile.push(`${esc(impressum.vertretung)}<br>`)
  teile.push(`${esc(impressum.strasse)}<br>`)
  teile.push(`${esc(impressum.plz)} ${esc(impressum.ort)}</p>`)
  teile.push(`<p>Telefon: ${esc(impressum.telefon)}<br>`)
  teile.push(`E-Mail: ${esc(impressum.email)}</p>`)
  abschnittNr++

  // 2. Hosting (immer)
  teile.push(`<h2>${abschnittNr}. ${BAUSTEIN_HOSTING.match(/<h3>(.*?)<\/h3>/)?.[1] || 'Hosting'}</h2>`)
  teile.push(BAUSTEIN_HOSTING.replace(/<h3>.*?<\/h3>\n?/, ''))
  abschnittNr++

  // Dynamische Bausteine
  for (const feature of aktiveFeatures) {
    const baustein = FEATURE_BAUSTEINE[feature]
    if (!baustein) continue
    const titel = baustein.match(/<h3>(.*?)<\/h3>/)?.[1] || feature
    teile.push(`<h2>${abschnittNr}. ${titel}</h2>`)
    teile.push(baustein.replace(/<h3>.*?<\/h3>\n?/, ''))
    abschnittNr++
  }

  // Ihre Rechte (immer)
  teile.push(`<h2>${abschnittNr}. Ihre Rechte</h2>`)
  teile.push('<p>Sie haben jederzeit das Recht auf:</p>')
  teile.push('<ul>')
  teile.push('<li>Auskunft über Ihre gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>')
  teile.push('<li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>')
  teile.push('<li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>')
  teile.push('<li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>')
  teile.push('<li>Datenübertragbarkeit (Art. 20 DSGVO)</li>')
  teile.push('<li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>')
  teile.push('</ul>')
  teile.push('<p>Außerdem steht Ihnen ein Beschwerderecht bei der zuständigen Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO).</p>')
  abschnittNr++

  // Speicherdauer (immer)
  teile.push(`<h2>${abschnittNr}. Speicherdauer</h2>`)
  teile.push('<p>Ihre Daten werden nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Nach Ablauf dieser Fristen werden die Daten routinemäßig gelöscht.</p>')
  abschnittNr++

  // Ergaenzende Hinweise
  if (ergaenzung && ergaenzung.trim()) {
    teile.push(`<h2>${abschnittNr}. Ergänzende Hinweise</h2>`)
    teile.push(`<p>${esc(ergaenzung.trim()).replace(/\n/g, '<br>')}</p>`)
  }

  return teile.join('\n')
}

/**
 * Erkennt aktive Features aus der Site-Config.
 * Schaut in engine-spezifische und allgemeine Config-Felder.
 */
export function erkenneAktiveFeatures(config: Record<string, unknown>): string[] {
  const features: string[] = []

  // Kontaktformular: fast jede Site hat eins
  const hatFormular =
    config.email ||
    config.phone ||
    (config as { funnel?: { modus?: string } }).funnel?.modus === 'anfrage' ||
    (config as { funnel?: { modus?: string } }).funnel?.modus === 'reservierung' ||
    (config as { pages?: Record<string, { template?: string }> }).pages?.contact

  if (hatFormular) features.push('kontaktformular')

  // Terminbuchung
  if (
    (config as { funnel?: { modus?: string } }).funnel?.modus === 'reservierung' ||
    (config as { terminbuchung?: boolean }).terminbuchung
  ) {
    features.push('terminbuchung')
  }

  // Analytics
  if ((config as { analytics?: unknown }).analytics) {
    features.push('analytics')
  }

  // Google Maps
  if (
    (config as { googlemapsUrl?: string }).googlemapsUrl ||
    (config as { maps?: unknown }).maps
  ) {
    features.push('google_maps')
  }

  // Social Media
  if (
    (config as { instagramUrl?: string }).instagramUrl ||
    (config as { whatsappUrl?: string }).whatsappUrl ||
    (config as { social?: unknown }).social
  ) {
    features.push('social_media')
  }

  return features
}
