/**
 * Phase 3 (MVP_FINISH_PROMPT §4.2): Ein-Klick-Generierung Lead → Demo.
 *
 * Ablauf: business_profile laden → generation_job "laufend" →
 * Flagship-Personalisierung + Assets → Copy-Slots (Claude, Gates) →
 * Site (status=demo) + Demo anlegen → rendern → Konsistenz-Validator
 * (hartes Gate; Fail ⇒ 1 Copy-Retry ⇒ failed mit lesbarem Grund).
 * Das Formular ist die EINZIGE Datenquelle (§4.1) — kein Scraping.
 */

import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { generiereFlagshipDemo } from '@/lib/pipeline/generate-flagship-demo'
import type { ProspectData } from '@/lib/pipeline/prospect-data'
import { renderFlagshipPage } from '@/lib/flagship/render'
import type { FlagshipConfig, MediaSlot } from '@/lib/flagship/types'
import {
  generiereCopySlots,
  wendeCopySlotsAn,
  type BusinessProfil,
} from './copy-slots'
import { validiereKonsistenz, reportAlsText, type ValidatorReport } from './konsistenz-validator'

export interface LeadDemoErgebnis {
  jobId: string
  status: 'demo_erstellt' | 'failed'
  demoId?: string
  siteId?: string
  subdomain?: string
  shareToken?: string
  fehlerGrund?: string
  kostenCent: number
  copyVersuche: number
  validatorReport?: ValidatorReport
}

// ------------------------------------------------------------
// Hilfen
// ------------------------------------------------------------

/** URL-tauglicher Slug aus Firma + Stadt (deutsch: Umlaute transliterieren) */
export function baueSubdomainSlug(firma: string, stadt: string): string {
  const roh = `${firma} ${stadt}`
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    .replace(/-+$/g, '')
  return roh || 'demo'
}

/** Freie Subdomain finden (Kollision → -2, -3, …) */
async function freieSubdomain(basis: string): Promise<string> {
  const admin = createAdminClient()
  for (let i = 0; i < 20; i++) {
    const kandidat = i === 0 ? basis : `${basis}-${i + 1}`
    const { data } = await admin
      .from('sites')
      .select('id')
      .eq('subdomain', kandidat)
      .maybeSingle()
    if (!data) return kandidat
  }
  return `${basis}-${randomBytes(3).toString('hex')}`
}

/** Formular-Profil → ProspectData (quellen: manuell, kein Scraping) */
function profilAlsProspect(profil: BusinessProfil): ProspectData {
  return {
    firma: profil.firma,
    ort: profil.stadt,
    branche: profil.brancheKey,
    website: null,
    telefon: profil.telefon,
    email: null,
    adresse: null,
    gruendungsjahr: null,
    oeffnungszeiten: profil.oeffnungszeiten?.length ? profil.oeffnungszeiten : null,
    rating: null,
    reviewCount: null,
    bewertungen: [],
    websiteText: null,
    impressumText: null,
    logoUrl: null,
    bilder: [],
    notizen: profil.notizen ?? null,
    quellen: ['manuell'],
  }
}

/** Setzt intrinsische Bildmaße auf alle befüllten Media-Slots (Validator §4.3) */
async function setzeBildMasse(config: FlagshipConfig, assetIds: string[]): Promise<void> {
  const admin = createAdminClient()
  const slots: MediaSlot[] = [
    config.inhalte.hero.media,
    config.inhalte.signature.vorher,
    config.inhalte.signature.nachher,
  ]
  config.inhalte.ergebnisse.paare?.forEach((p) => slots.push(p.vorher, p.nachher))

  // Maße der beteiligten Bank-Assets: storage_path steckt in der Public-URL
  const masse = new Map<string, { breite: number; hoehe: number }>()
  if (assetIds.length > 0) {
    const { data } = await admin
      .from('asset_bank')
      .select('storage_path, breite, hoehe')
      .in('id', Array.from(new Set(assetIds)))
    for (const a of data ?? []) {
      if (a.breite && a.hoehe) masse.set(a.storage_path, { breite: a.breite, hoehe: a.hoehe })
    }
  }

  for (const slot of slots) {
    if (!slot.datei || (slot.breite && slot.hoehe)) continue
    const treffer = Array.from(masse.entries()).find(([pfad]) => slot.datei!.includes(pfad))
    if (treffer) {
      slot.breite = treffer[1].breite
      slot.hoehe = treffer[1].hoehe
    } else {
      // Frisch generierte Assets sind 16:9 (generate-flagship-demo)
      slot.breite = 1600
      slot.hoehe = 900
    }
  }
}

async function jobUpdate(jobId: string, patch: Record<string, unknown>): Promise<void> {
  const admin = createAdminClient()
  await admin
    .from('generation_jobs')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', jobId)
}

// ------------------------------------------------------------
// Orchestrierung
// ------------------------------------------------------------

export async function generiereDemoFuerLead(
  leadId: string,
  businessProfileId: string
): Promise<LeadDemoErgebnis> {
  const admin = createAdminClient()

  const { data: profilRow, error: profilFehler } = await admin
    .from('business_profiles')
    .select('*')
    .eq('id', businessProfileId)
    .maybeSingle()
  if (profilFehler || !profilRow) {
    throw new Error(`Geschäftsprofil nicht gefunden: ${profilFehler?.message ?? businessProfileId}`)
  }

  const profil: BusinessProfil = {
    firma: profilRow.firma,
    brancheKey: profilRow.branche_key,
    stadt: profilRow.stadt,
    telefon: profilRow.telefon,
    leistungen: (profilRow.leistungen as string[]) ?? [],
    usps: (profilRow.usps as string[] | null) ?? undefined,
    oeffnungszeiten: (profilRow.oeffnungszeiten as string[] | null) ?? undefined,
    notizen: profilRow.notizen,
  }

  // Job anlegen — jeder Lauf wird protokolliert (§4.2)
  const { data: job, error: jobFehler } = await admin
    .from('generation_jobs')
    .insert({ lead_id: leadId, business_profile_id: businessProfileId, status: 'laufend' })
    .select('id')
    .single()
  if (jobFehler || !job) throw new Error(`Job anlegen fehlgeschlagen: ${jobFehler?.message}`)

  let kostenCent = 0
  let copyVersuche = 0

  try {
    // Branchen-Name (approved-Check macht generiereFlagshipDemo selbst)
    const { data: branche } = await admin
      .from('branchen_profile')
      .select('name')
      .eq('branche_key', profil.brancheKey)
      .maybeSingle()
    const brancheName = branche?.name ?? profil.brancheKey

    // Flagship-Basis + Assets (Hero 16:9, Signature-Paar, Bank-Fallback)
    const prospect = profilAlsProspect(profil)
    const flagship = await generiereFlagshipDemo(prospect, profil.brancheKey)
    kostenCent += flagship.kostenCent
    let config = flagship.config

    // Formular liefert keine echten Bewertungen → Stimmen-Sektion entfällt (§4.3)
    config.inhalte.stimmen.quotes = []
    const beteiligteAssets = [
      ...(flagship.assetMeta.hero ? [flagship.assetMeta.hero.id] : []),
      ...(flagship.assetMeta.paar?.asset_ids ?? []),
    ]
    await setzeBildMasse(config, beteiligteAssets)

    // Copy-Slots mit hartem Gate; Validator-Fail ⇒ genau EIN Copy-Retry
    let report: ValidatorReport | undefined
    let html = ''
    let konsistent = false

    for (let lauf = 1; lauf <= 2 && !konsistent; lauf++) {
      const copy = await generiereCopySlots(profil, brancheName)
      kostenCent += copy.kostenCent
      copyVersuche += copy.versuche
      config = wendeCopySlotsAn(config, copy.slots, profil)
      await setzeBildMasse(config, beteiligteAssets)

      html = renderFlagshipPage(config, { demo: true, noindex: true })
      report = validiereKonsistenz(html, config, profil.stadt, flagship.assetMeta, {
        echteBewertungen: false,
      })
      konsistent = report.ok
      await jobUpdate(job.id, {
        copy_versuche: copyVersuche,
        kosten_cent: kostenCent,
        validator_report: report,
      })
    }

    if (!konsistent) {
      const grund = reportAlsText(report!)
      await jobUpdate(job.id, { status: 'failed', fehler_grund: grund })
      return {
        jobId: job.id, status: 'failed', fehlerGrund: grund,
        kostenCent, copyVersuche, validatorReport: report,
      }
    }

    // Site (status=demo → Subdomain-Auslieferung, Phase 1) + Demo anlegen
    const subdomain = await freieSubdomain(baueSubdomainSlug(profil.firma, profil.stadt))
    const { data: site, error: siteFehler } = await admin
      .from('sites')
      .insert({
        customer_id: null,
        name: `${profil.firma} — Demo`,
        template_id: `flagship:${profil.brancheKey}`,
        config,
        draft_config: config,
        status: 'demo',
        subdomain,
      })
      .select('id')
      .single()
    if (siteFehler || !site) throw new Error(`Site anlegen fehlgeschlagen: ${siteFehler?.message}`)

    const shareToken = randomBytes(24).toString('base64url')
    const { data: demo, error: demoFehler } = await admin
      .from('demos')
      .insert({
        prospect_name: profil.firma,
        prospect_website: null,
        branche: profil.brancheKey,
        template_id: `flagship:${profil.brancheKey}`,
        engine: 'flagship',
        config,
        scraped_data: prospect,
        share_token: shareToken,
        status: 'GENERIERT',
        kosten_cent: kostenCent,
        asset_meta: flagship.assetMeta,
        site_id: site.id,
        demo_bereit: false,
      })
      .select('id')
      .single()
    if (demoFehler || !demo) throw new Error(`Demo anlegen fehlgeschlagen: ${demoFehler?.message}`)

    await admin.from('leads').update({ demo_id: demo.id }).eq('id', leadId)
    await jobUpdate(job.id, {
      status: 'demo_erstellt',
      demo_id: demo.id,
      site_id: site.id,
      kosten_cent: kostenCent,
      copy_versuche: copyVersuche,
      validator_report: report,
      fehler_grund: null,
    })

    return {
      jobId: job.id, status: 'demo_erstellt',
      demoId: demo.id, siteId: site.id, subdomain, shareToken,
      kostenCent, copyVersuche, validatorReport: report,
    }
  } catch (e) {
    const grund = e instanceof Error ? e.message : 'Unbekannter Fehler bei der Generierung.'
    await jobUpdate(job.id, {
      status: 'failed',
      fehler_grund: grund,
      kosten_cent: kostenCent,
      copy_versuche: copyVersuche,
    })
    return { jobId: job.id, status: 'failed', fehlerGrund: grund, kostenCent, copyVersuche }
  }
}
