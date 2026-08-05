/**
 * Telefon-Verifizierung via Supabase Auth OTP.
 * POST: SMS-Code an Nummer senden
 * PUT: Code verifizieren
 */

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function normalizePhone(phone: string): string {
  let p = phone.trim().replace(/[\s\-()]/g, '')
  // Deutsche Nummer ohne Landesvorwahl → +49
  if (p.startsWith('0') && !p.startsWith('00')) {
    p = '+49' + p.slice(1)
  }
  if (p.startsWith('00')) {
    p = '+' + p.slice(2)
  }
  if (!p.startsWith('+')) {
    p = '+49' + p
  }
  return p
}

// Rate Limit: max 5 Anfragen pro IP pro Stunde
const rateLimits = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  if (!entry || now > entry.reset) {
    rateLimits.set(ip, { count: 1, reset: now + 3600000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

// POST: Code senden
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warten Sie eine Stunde.' }, { status: 429 })
  }

  const { phone } = await request.json().catch(() => ({ phone: '' }))
  if (!phone || phone.length < 6) {
    return NextResponse.json({ error: 'Ungültige Telefonnummer' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)
  const supabase = getServiceClient()

  const { error } = await supabase.auth.signInWithOtp({ phone: normalized })
  if (error) {
    console.error('[VERIFY] OTP senden fehlgeschlagen:', error.message)
    return NextResponse.json({ error: 'SMS konnte nicht gesendet werden. Bitte prüfen Sie die Nummer.' }, { status: 500 })
  }

  return NextResponse.json({ sent: true })
}

// PUT: Code verifizieren
export async function PUT(request: Request) {
  const { phone, code } = await request.json().catch(() => ({ phone: '', code: '' }))
  if (!phone || !code || code.length < 6) {
    return NextResponse.json({ error: 'Code ungültig' }, { status: 400 })
  }

  const normalized = normalizePhone(phone)
  const supabase = getServiceClient()

  const { error } = await supabase.auth.verifyOtp({
    phone: normalized,
    token: code,
    type: 'sms',
  })

  if (error) {
    return NextResponse.json({ error: 'Code ungültig oder abgelaufen. Bitte erneut anfordern.' }, { status: 400 })
  }

  return NextResponse.json({ verified: true })
}
