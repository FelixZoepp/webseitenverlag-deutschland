import { getAuthenticatedCustomer } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const result = await getAuthenticatedCustomer()
    if (!result.ok) return result.response

    const { supabase, customer } = result.data

    await supabase
      .from('customers')
      .update({ onboarding_completed: true })
      .eq('id', customer.id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
