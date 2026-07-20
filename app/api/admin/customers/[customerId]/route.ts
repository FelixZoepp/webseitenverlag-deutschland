import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const PatchCustomerSchema = z.object({
  company_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  monthly_price: z.number().optional(),
  setup_fee: z.number().optional(),
  contract_years: z.number().optional(),
  contract_start: z.string().optional(),
  contract_end: z.string().optional(),
  package: z.enum(['starter', 'business', 'growth']).optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  branche: z.string().optional(),
  vertrags_status: z.string().optional(),
  ansprechpartner: z.string().optional(),
  telefon: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  closer_name: z.string().optional(),
  closer_notiz: z.string().optional(),
  onboarding_completed: z.boolean().optional(),
}).strict()

export async function GET(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const { data } = await supabase
      .from('customers')
      .select('*, sites(*), kunden_dokumente(*), vertrags_timeline(*), kunden_bilder(*)')
      .eq('id', params.customerId)
      .single()

    if (!data) return NextResponse.json({ error: 'Nicht gefunden' }, { status: 404 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json()
    const parsed = PatchCustomerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('customers')
      .update(parsed.data)
      .eq('id', params.customerId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    await supabase.from('customers').delete().eq('id', params.customerId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
