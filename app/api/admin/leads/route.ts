/**
 * Phase 3 (MVP_FINISH_PROMPT §4.1): Leads verwalten.
 * GET  → Liste (mit Geschäftsprofil + letztem Generierungs-Job)
 * POST → 2-Minuten-Formular: Lead (quelle=manuell) + business_profile.
 * Das Formular ist die EINZIGE Datenquelle der Generierung — kein Scraping.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const leadSchema = z.object({
  firma: z.string().trim().min(2, 'Firma: mindestens 2 Zeichen'),
  branche_key: z.string().trim().min(2, 'Branche fehlt'),
  stadt: z.string().trim().min(2, 'Stadt: mindestens 2 Zeichen'),
  telefon: z.string().trim().min(5, 'Telefon: mindestens 5 Zeichen'),
  leistungen: z
    .array(z.string().trim().min(2))
    .min(3, 'Mindestens 3 Leistungen angeben')
    .max(8, 'Maximal 8 Leistungen'),
  usps: z.array(z.string().trim().min(2)).max(5).optional(),
  oeffnungszeiten: z.array(z.string().trim().min(2)).max(10).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  notizen: z.string().trim().max(2000).optional(),
})

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const admin = createAdminClient()
  const { data: leads, error } = await admin
    .from('leads')
    .select('id, name, firma, email, telefon, branche, status, demo_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const leadIds = (leads ?? []).map((l) => l.id)
  const [{ data: profile }, { data: jobs }] = await Promise.all([
    leadIds.length
      ? admin.from('business_profiles').select('id, lead_id, firma, branche_key, stadt').in('lead_id', leadIds)
      : Promise.resolve({ data: [] as never[] }),
    leadIds.length
      ? admin
          .from('generation_jobs')
          .select('id, lead_id, status, fehler_grund, kosten_cent, copy_versuche, demo_id, site_id, created_at')
          .in('lead_id', leadIds)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as never[] }),
  ])

  const profilProLead = new Map((profile ?? []).map((p) => [p.lead_id, p]))
  const letzterJob = new Map<string, (typeof jobs extends (infer T)[] | null ? T : never)>()
  for (const job of jobs ?? []) {
    if (job.lead_id && !letzterJob.has(job.lead_id)) letzterJob.set(job.lead_id, job)
  }

  // QA-Gate Baustein A: letzter Browser-QA-Report pro Site (Status + Screenshots)
  const siteIds = Array.from(
    new Set(Array.from(letzterJob.values()).map((j) => j.site_id).filter((s): s is string => Boolean(s)))
  )
  const { data: qaReports } = siteIds.length
    ? await admin
        .from('qa_reports')
        .select('id, site_id, mode, status, report, screenshots, created_at')
        .in('site_id', siteIds)
        .order('created_at', { ascending: false })
    : { data: [] as never[] }
  const qaProSite = new Map<string, NonNullable<typeof qaReports>[number]>()
  for (const report of qaReports ?? []) {
    if (report.site_id && !qaProSite.has(report.site_id)) qaProSite.set(report.site_id, report)
  }

  return NextResponse.json({
    leads: (leads ?? []).map((lead) => {
      const job = letzterJob.get(lead.id) ?? null
      const qa = job?.site_id ? qaProSite.get(job.site_id) ?? null : null
      return {
        ...lead,
        business_profile: profilProLead.get(lead.id) ?? null,
        letzter_job: job,
        qa_report: qa
          ? {
              id: qa.id,
              status: qa.status as 'passed' | 'repaired' | 'failed',
              fehler_grund:
                (qa.report as { fehler_grund?: string | null } | null)?.fehler_grund ?? null,
              screenshots: (qa.screenshots as { mobile?: string; desktop?: string } | null) ?? {},
              created_at: qa.created_at,
            }
          : null,
      }
    }),
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request-Body (JSON erwartet)' }, { status: 400 })
  }

  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    const fehler = parsed.error.issues.map((i) => i.message).join('; ')
    return NextResponse.json({ error: fehler }, { status: 400 })
  }
  const daten = parsed.data

  const admin = createAdminClient()

  // Nur approved Branchen sind generierbar (§3.4)
  const { data: branche } = await admin
    .from('branchen_profile')
    .select('branche_key, name, quality_status')
    .eq('branche_key', daten.branche_key)
    .maybeSingle()
  if (!branche) {
    return NextResponse.json({ error: `Unbekannte Branche: ${daten.branche_key}` }, { status: 400 })
  }

  const { data: lead, error: leadFehler } = await admin
    .from('leads')
    .insert({
      name: daten.firma,
      firma: daten.firma,
      email: daten.email || null,
      telefon: daten.telefon,
      branche: daten.branche_key,
      quelle: 'manuell',
      status: 'NEU',
      notes: daten.notizen || null,
    })
    .select('id')
    .single()
  if (leadFehler || !lead) {
    return NextResponse.json({ error: `Lead anlegen fehlgeschlagen: ${leadFehler?.message}` }, { status: 500 })
  }

  const { data: profil, error: profilFehler } = await admin
    .from('business_profiles')
    .insert({
      lead_id: lead.id,
      firma: daten.firma,
      branche_key: daten.branche_key,
      stadt: daten.stadt,
      telefon: daten.telefon,
      leistungen: daten.leistungen,
      usps: daten.usps?.length ? daten.usps : null,
      oeffnungszeiten: daten.oeffnungszeiten?.length ? daten.oeffnungszeiten : null,
      notizen: daten.notizen || null,
    })
    .select('id')
    .single()
  if (profilFehler || !profil) {
    return NextResponse.json(
      { error: `Geschäftsprofil anlegen fehlgeschlagen: ${profilFehler?.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    leadId: lead.id,
    businessProfileId: profil.id,
    brancheApproved: branche.quality_status === 'approved',
  })
}
