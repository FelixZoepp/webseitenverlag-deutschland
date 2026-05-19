import { getAuthenticatedCustomer } from '@/lib/api-helpers'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getTemplateDefaults } from '@/lib/template-configs'

const CreateSiteSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
  domain: z.string().optional(),
  templateId: z.string().optional(),
})

export async function GET() {
  try {
    const result = await getAuthenticatedCustomer()
    if (!result.ok) return result.response

    const { customer, supabase } = result.data

    const { data: sites, error } = await supabase
      .from('sites')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Fehler beim Laden der Seiten' }, { status: 500 })
    }

    return NextResponse.json(sites || [])
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const result = await getAuthenticatedCustomer()
    if (!result.ok) return result.response

    const { customer, supabase } = result.data

    const body = await request.json()
    const parsed = CreateSiteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, domain, templateId } = parsed.data
    const tpl = templateId || 'business-basic'
    const defaultConfig = getTemplateDefaults(tpl, name)

    const { data: site, error } = await supabase
      .from('sites')
      .insert({
        customer_id: customer.id,
        name,
        domain: domain || null,
        template_id: tpl,
        config: defaultConfig,
        draft_config: defaultConfig,
        status: 'draft',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Fehler beim Erstellen der Seite' }, { status: 500 })
    }

    return NextResponse.json(site, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
