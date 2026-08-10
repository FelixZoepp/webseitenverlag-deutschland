import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = await supabase
    .from('demos')
    .select('payment_link_url')
    .eq('id', '9760c44d-ceb1-4c4d-9f85-0387dbf43ff8')
    .single()

  if (!data?.payment_link_url) {
    return new NextResponse('Zahlungslink nicht verfügbar', { status: 404 })
  }

  return NextResponse.redirect(data.payment_link_url)
}
