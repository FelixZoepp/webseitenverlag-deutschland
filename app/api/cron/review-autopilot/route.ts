import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { istCronAutorisiert } from '@/lib/cron-auth'
import { sendReviewRequest } from '@/lib/email'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://webseitenverlag-deutschland.vercel.app'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

interface ReviewAutopilotConfig {
  enabled: boolean
  delay_days: number
  google_review_url: string
  absender_name: string
  betreff: string
  nachricht: string
}

/**
 * Bewertungs-Autopilot Cron — läuft täglich um 10:00.
 *
 * 1. Findet Sites mit aktivem review_autopilot
 * 2. Prüft form_submissions die alt genug sind (delay_days)
 * 3. Erstellt review_requests (geplant → gesendet)
 * 4. Sendet Zufriedenheits-Mails via Resend
 */
export async function GET(request: Request) {
  if (!istCronAutorisiert(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = getServiceClient()
  const jetzt = new Date()
  let erstellt = 0
  let gesendet = 0
  let fehler = 0

  // 1. Sites mit aktivem Autopilot
  const { data: sites } = await sb
    .from('sites')
    .select('id, name, review_autopilot, customer_id')
    .not('review_autopilot', 'is', null)

  if (!sites?.length) {
    return NextResponse.json({ message: 'Keine aktiven Autopiloten', erstellt, gesendet })
  }

  for (const site of sites) {
    const config = site.review_autopilot as ReviewAutopilotConfig
    if (!config?.enabled || !config?.google_review_url) continue

    const delayDays = config.delay_days || 14
    const cutoff = new Date(jetzt.getTime() - delayDays * 24 * 60 * 60 * 1000)

    // 2. Submissions die alt genug sind + noch keinen Review-Request haben
    const { data: submissions } = await sb
      .from('form_submissions')
      .select('id, sender_email, sender_name, created_at')
      .eq('site_id', site.id)
      .neq('status', 'spam')
      .lt('created_at', cutoff.toISOString())
      .not('sender_email', 'is', null)

    if (!submissions?.length) continue

    // IDs der Submissions die schon einen Request haben
    const subIds = submissions.map(s => s.id)
    const { data: existing } = await sb
      .from('review_requests')
      .select('submission_id')
      .in('submission_id', subIds)

    const existingIds = new Set((existing || []).map(e => e.submission_id))

    for (const sub of submissions) {
      if (existingIds.has(sub.id) || !sub.sender_email) continue

      // 3. Review-Request erstellen
      const faelligAm = new Date() // sofort senden, da delay schon abgelaufen
      const { data: rr, error: insertErr } = await sb
        .from('review_requests')
        .insert({
          site_id: site.id,
          submission_id: sub.id,
          empfaenger_email: sub.sender_email,
          empfaenger_name: sub.sender_name,
          status: 'geplant',
          faellig_am: faelligAm.toISOString(),
        })
        .select('id')
        .single()

      if (insertErr || !rr) {
        // Unique constraint = schon vorhanden, skip
        continue
      }
      erstellt++

      // 4. Mail senden
      const jaUrl = `${APP_URL}/api/public/review/${rr.id}?response=ja`
      const neinUrl = `${APP_URL}/api/public/review/${rr.id}?response=nein`

      const result = await sendReviewRequest({
        toEmail: sub.sender_email,
        toName: sub.sender_name || '',
        firmenName: site.name || config.absender_name || 'Unser Unternehmen',
        absenderName: config.absender_name || site.name || 'Webseiten-Verlag',
        betreff: config.betreff || 'Waren Sie zufrieden mit uns?',
        nachricht: config.nachricht || 'Vielen Dank für Ihr Vertrauen. Wir würden uns sehr über eine kurze Bewertung freuen.',
        jaUrl,
        neinUrl,
      })

      if (result.success) {
        await sb
          .from('review_requests')
          .update({ status: 'gesendet', gesendet_am: new Date().toISOString() })
          .eq('id', rr.id)
        gesendet++
      } else {
        await sb
          .from('review_requests')
          .update({ status: 'fehler', fehler: result.error })
          .eq('id', rr.id)
        fehler++
      }
    }
  }

  return NextResponse.json({ erstellt, gesendet, fehler })
}
