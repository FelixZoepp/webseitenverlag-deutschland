import { getOwnedSite } from '@/lib/api-helpers'
import { sendLeadNotification } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { site } = result.data
    return NextResponse.json({
      notification_email: site.notification_email || '',
      notification_enabled: site.notification_enabled !== false,
    })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { siteId: string } }
) {
  try {
    const result = await getOwnedSite(params.siteId)
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json()

    const updates: Record<string, unknown> = {}
    if (body.notification_email !== undefined) updates.notification_email = body.notification_email
    if (body.notification_enabled !== undefined) updates.notification_enabled = body.notification_enabled

    // Test mail
    if (body.send_test) {
      const email = body.notification_email || result.data.customer.contact_email
      if (email) {
        const res = await sendLeadNotification(
          email,
          result.data.customer.company_name || 'Test',
          (result.data.site.name as string) || 'Test-Site',
          { name: 'Max Mustermann', email: 'max@example.com', phone: '0170 1234567', message: 'Dies ist eine Test-Nachricht.' },
          '00000000-0000-0000-0000-000000000000',
          params.siteId
        )
        if (!res.success) {
          return NextResponse.json({ error: `Test-Mail fehlgeschlagen: ${res.error}` }, { status: 500 })
        }
        return NextResponse.json({ success: true, message: 'Test-Mail gesendet!' })
      }
      return NextResponse.json({ error: 'Keine E-Mail-Adresse hinterlegt' }, { status: 400 })
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('sites').update(updates).eq('id', params.siteId)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
