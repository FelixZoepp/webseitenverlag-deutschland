/**
 * Rechtstexte-API (Change 3): Impressum + Datenschutz lesen & speichern.
 *
 * GET  — Aktuelle Impressum-Daten + generierte Datenschutz-Vorschau + Template-Version
 * PUT  — Impressum-Daten speichern, Rechtstexte re-rendern, sofort live
 */

import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rendereImpressum } from '@/lib/rechtstexte/impressum-template'
import { rendereDatenschutz, erkenneAktiveFeatures, TEMPLATE_VERSION } from '@/lib/rechtstexte/datenschutz-template'
import { fehlendeImpressumFelder } from '@/lib/rechtstexte/types'
import type { ImpressumDaten, RechtstextAenderung } from '@/lib/rechtstexte/types'
import type { SiteConfig } from '@/types'

const ImpressumSchema = z.object({
  firmenname: z.string().min(2, 'Firmenname fehlt').max(200),
  strasse: z.string().min(3, 'Straße fehlt').max(200),
  plz: z.string().regex(/^\d{5}$/, 'PLZ muss 5 Ziffern haben'),
  ort: z.string().min(2, 'Ort fehlt').max(120),
  vertretung: z.string().min(2, 'Vertretungsberechtigte Person fehlt').max(200),
  telefon: z.string().min(5, 'Telefonnummer fehlt').max(50),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  // Bedingte Felder
  registergericht: z.string().max(200).optional().default(''),
  registernummer: z.string().max(120).optional().default(''),
  ust_id: z.string().max(50).optional().default(''),
  kammer: z.string().max(200).optional().default(''),
  berufsbezeichnung: z.string().max(200).optional().default(''),
  berufsbezeichnung_staat: z.string().max(120).optional().default(''),
  berufsrechtliche_regelungen: z.string().max(500).optional().default(''),
  aufsichtsbehoerde: z.string().max(200).optional().default(''),
  redaktionell_verantwortlich: z.string().max(200).optional().default(''),
})

const PutSchema = z.object({
  impressum: ImpressumSchema,
  ergaenzung: z.string().max(2000).optional().default(''),
})

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { site } = result.data
    const pflichtangaben = (site.pflichtangaben || {}) as Record<string, unknown>
    const impressumDaten = (pflichtangaben.impressum || null) as ImpressumDaten | null
    const ergaenzung = (pflichtangaben.datenschutz_ergaenzung || '') as string
    const templateVersion = (pflichtangaben.rechtstext_template_version || null) as string | null
    const config = (site.draft_config || site.config || {}) as Record<string, unknown>

    // Generiere Datenschutz-Vorschau
    let datenschutzVorschau = ''
    if (impressumDaten && fehlendeImpressumFelder(impressumDaten).length === 0) {
      const features = erkenneAktiveFeatures(config)
      datenschutzVorschau = rendereDatenschutz(impressumDaten, features, ergaenzung)
    }

    return NextResponse.json({
      impressum: impressumDaten,
      ergaenzung,
      datenschutz_vorschau: datenschutzVorschau,
      template_version: templateVersion,
      aktuelle_template_version: TEMPLATE_VERSION,
      fehlende_felder: fehlendeImpressumFelder(impressumDaten),
    })
  } catch (e) {
    console.error('[rechtstexte GET] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, site, user } = result.data

    const body = await request.json()
    const parsed = PutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { impressum, ergaenzung } = parsed.data
    const config = { ...((site.draft_config || site.config || {}) as SiteConfig) } as SiteConfig & {
      rechtstexte?: { impressum: string; datenschutz: string }
    }

    // Aktive Features erkennen
    const features = erkenneAktiveFeatures(config as unknown as Record<string, unknown>)

    // Rechtstexte rendern
    const impressumHtml = rendereImpressum(impressum)
    const datenschutzHtml = rendereDatenschutz(impressum, features, ergaenzung)

    // In config.rechtstexte schreiben (sofort live)
    config.rechtstexte = {
      impressum: impressumHtml,
      datenschutz: datenschutzHtml,
    }

    // Kontaktdaten synchronisieren
    if (!config.phone) config.phone = impressum.telefon
    if (!config.email) config.email = impressum.email
    if (!config.address) config.address = `${impressum.strasse}, ${impressum.plz} ${impressum.ort}`

    // Aenderungsprotokoll
    const pflichtangaben = ((site.pflichtangaben || {}) as Record<string, unknown>)
    const bisherigLog = (pflichtangaben.rechtstext_log || []) as RechtstextAenderung[]
    const neuerEintrag: RechtstextAenderung = {
      zeitpunkt: new Date().toISOString(),
      nutzer_id: (user as { id: string }).id,
      felder: impressum as unknown as Record<string, unknown>,
    }
    const aktualisiertesLog = [...bisherigLog, neuerEintrag]

    // Pflichtangaben aktualisieren
    const neuePflichtangaben = {
      ...pflichtangaben,
      impressum,
      datenschutz_ergaenzung: ergaenzung,
      rechtstext_log: aktualisiertesLog,
      rechtstext_template_version: TEMPLATE_VERSION,
    }

    // Speichern — config + pflichtangaben in einem Update
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('sites')
      .update({
        config,
        draft_config: config,
        pflichtangaben: neuePflichtangaben,
        updated_at: now,
      })
      .eq('id', params.siteId)

    if (error) {
      console.error('[rechtstexte PUT] DB-Fehler:', error)
      return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      impressum,
      datenschutz_vorschau: datenschutzHtml,
      template_version: TEMPLATE_VERSION,
      fehlende_felder: fehlendeImpressumFelder(impressum),
    })
  } catch (e) {
    console.error('[rechtstexte PUT] Fehler:', e)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
