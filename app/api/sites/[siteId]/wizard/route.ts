import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PflichtangabenSchema, generiereImpressum, generiereDatenschutz } from '@/lib/rechtstexte'
import { wizardFortschritt, offenePflichtSchritte, WIZARD_SCHRITTE, WizardStatus } from '@/lib/wizard'
import { SiteConfig } from '@/types'

/** Fertigstellungs-Wizard (§10.1): Zustand lesen + Schritte abschließen. */

const StatusEnum = z.enum(['erledigt', 'uebersprungen', 'vertagt'])

const PatchSchema = z.discriminatedUnion('schritt', [
  z.object({ schritt: z.literal('pflichtangaben'), daten: PflichtangabenSchema }),
  z.object({ schritt: z.literal('logo'), status: StatusEnum }),
  z.object({
    schritt: z.literal('fakten'),
    daten: z.object({
      telefon: z.string().min(5).max(50),
      email: z.string().email(),
      adresse: z.string().max(300).optional(),
      oeffnungszeiten: z.string().max(500).optional(),
    }),
  }),
  z.object({ schritt: z.literal('domain'), status: StatusEnum, wunsch_domain: z.string().max(253).optional() }),
  z.object({ schritt: z.literal('seo_plan'), status: StatusEnum }),
])

export async function GET(_request: Request, { params }: { params: { siteId: string } }) {
  const result = await getOwnedSite(params.siteId)
  if (!result.ok) return result.response
  const { site } = result.data

  const wizardStatus = (site.wizard_status as WizardStatus) || {}
  const config = (site.draft_config || site.config || {}) as SiteConfig

  return NextResponse.json({
    schritte: WIZARD_SCHRITTE,
    wizard_status: wizardStatus,
    fortschritt: wizardFortschritt(wizardStatus),
    offene_pflicht: offenePflichtSchritte(wizardStatus).map((s) => s.key),
    pflichtangaben: site.pflichtangaben || null,
    fertiggestellt_am: site.fertiggestellt_am || null,
    fakten: {
      telefon: config.phone || '',
      email: config.email || '',
      adresse: config.address || '',
    },
  })
}

export async function PATCH(request: Request, { params }: { params: { siteId: string } }) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response
    const { supabase, site } = result.data

    const body = await request.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const wizardStatus: WizardStatus & { wunsch_domain?: string } = {
      ...((site.wizard_status as WizardStatus) || {}),
    }
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
    const patch = parsed.data

    if (patch.schritt === 'pflichtangaben') {
      const p = patch.daten
      const config = { ...((site.draft_config || site.config || {}) as SiteConfig) } as SiteConfig & {
        rechtstexte?: { impressum: string; datenschutz: string }
      }
      config.rechtstexte = {
        impressum: generiereImpressum(p),
        datenschutz: generiereDatenschutz(p),
      }
      // Kontaktdaten übernehmen, wenn im Entwurf noch leer
      if (!config.phone) config.phone = p.telefon
      if (!config.email) config.email = p.email
      if (!config.address) config.address = `${p.strasse}, ${p.plz} ${p.ort}`
      update.pflichtangaben = p
      update.draft_config = config
      wizardStatus.pflichtangaben = 'erledigt'
    } else if (patch.schritt === 'fakten') {
      const config = { ...((site.draft_config || site.config || {}) as SiteConfig) } as SiteConfig & {
        oeffnungszeiten?: string
      }
      config.phone = patch.daten.telefon
      config.email = patch.daten.email
      if (patch.daten.adresse) config.address = patch.daten.adresse
      if (patch.daten.oeffnungszeiten) config.oeffnungszeiten = patch.daten.oeffnungszeiten
      update.draft_config = config
      wizardStatus.fakten = 'erledigt'
    } else if (patch.schritt === 'domain') {
      // Stub: Wunsch wird gespeichert, Cloudflare-Connect folgt in Phase G.
      // Scheitert/vertagt → Site läuft nahtlos auf multi_tenant weiter (§10.1).
      if (patch.wunsch_domain) wizardStatus.wunsch_domain = patch.wunsch_domain.toLowerCase().trim()
      wizardStatus.domain = patch.status
    } else if (patch.schritt === 'logo') {
      wizardStatus.logo = patch.status
    } else {
      wizardStatus.seo_plan = patch.status
    }

    update.wizard_status = wizardStatus

    const { error } = await supabase.from('sites').update(update).eq('id', params.siteId)
    if (error) {
      return NextResponse.json({ error: 'Speichern fehlgeschlagen' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      wizard_status: wizardStatus,
      fortschritt: wizardFortschritt(wizardStatus),
      offene_pflicht: offenePflichtSchritte(wizardStatus).map((s) => s.key),
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
