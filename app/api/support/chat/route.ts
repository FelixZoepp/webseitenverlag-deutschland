import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { buildSupportPrompt } from '@/lib/support-knowledge'
import Anthropic from '@anthropic-ai/sdk'

export const dynamic = 'force-dynamic'

const getAnthropicClient = () => new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function POST(request: Request) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: customer } = await supabase
    .from('customers')
    .select('id, company_name, contact_email, package')
    .eq('user_id', user.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Kein Kunde' }, { status: 403 })

  // Rate Limiting: max 30 Support-Chat-Nachrichten pro Tag pro Kunde
  const today = new Date().toISOString().slice(0, 10)
  const { count: todayCount } = await supabase
    .from('support_messages')
    .select('*', { count: 'exact', head: true })
    .eq('absender', 'kunde')
    .gte('created_at', `${today}T00:00:00Z`)

  if ((todayCount || 0) >= 30) {
    return NextResponse.json({ reply: 'Sie haben heute bereits viele Nachrichten gesendet. Bitte erstellen Sie ein Ticket für weitere Hilfe.', suggestsTicket: true })
  }

  const body = await request.json()
  const message = (body.message || '').trim().slice(0, 2000)
  const history = (body.history || []) as ChatMessage[]

  if (!message) return NextResponse.json({ error: 'Nachricht fehlt' }, { status: 400 })

  const systemPrompt = buildSupportPrompt(
    customer.company_name || customer.contact_email || 'Kunde',
    customer.company_name || 'Ihr Unternehmen',
    customer.package || 'starter'
  )

  // Build messages for Claude
  const messages: { role: 'user' | 'assistant'; content: string }[] = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: message },
  ]

  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0]?.type === 'text' ? response.content[0].text : 'Entschuldigung, ich konnte keine Antwort generieren.'

    // Check if bot suggests ticket creation
    const suggestsTicket = reply.toLowerCase().includes('ticket') || reply.toLowerCase().includes('support-ticket')

    return NextResponse.json({ reply, suggestsTicket })
  } catch (err) {
    console.error('Support chat error:', err)
    return NextResponse.json({
      reply: 'Entschuldigung, der Support-Assistent ist gerade nicht verfügbar. Bitte erstellen Sie ein Ticket und wir melden uns bei Ihnen.',
      suggestsTicket: true,
    })
  }
}
