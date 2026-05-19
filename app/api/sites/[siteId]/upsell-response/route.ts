import { getOwnedSite } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const ResponseSchema = z.object({
  upsellId: z.string(),
  action: z.enum(['accept', 'reject', 'later']),
  reason: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase, customer } = result.data as {
      supabase: ReturnType<typeof import('@/lib/supabase/server').createClient>
      site: Record<string, unknown>
      customer: Record<string, string>
      user: { id: string }
    }

    const body = await request.json()
    const parsed = ResponseSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
    }

    const { upsellId, action, reason } = parsed.data

    if (action === 'reject' || action === 'later') {
      const retryAfter = new Date()
      retryAfter.setDate(retryAfter.getDate() + 30)

      await supabase.from('upsell_rejections').insert({
        customer_id: customer.id,
        upsell_id: upsellId,
        reason: action === 'later' ? 'maybe_later' : (reason || 'not_needed'),
        retry_after: retryAfter.toISOString(),
      })

      return NextResponse.json({ tracked: true, action })
    }

    if (action === 'accept') {
      // Bei "accept" leiten wir an den Admin weiter — Kunde kann nicht selbst aktivieren.
      // Wir speichern die Anfrage als Chat-Message für den Admin-Kontext.
      await supabase.from('chat_messages').insert({
        site_id: params.siteId,
        role: 'user',
        content: `[UPSELL-ANFRAGE] Kunde möchte "${upsellId}" aktivieren.`,
      })

      return NextResponse.json({
        tracked: true,
        action: 'accept',
        message: 'Ihre Anfrage wurde weitergeleitet. Wir aktivieren das Modul kurzfristig für Sie.',
      })
    }

    return NextResponse.json({ error: 'Unbekannte Aktion' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
