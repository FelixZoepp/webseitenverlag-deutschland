import { NextResponse } from 'next/server'
import { revalidateHostMap, revalidateSite } from '@/lib/hosting/site-cache'

export async function POST(request: Request) {
  const { siteId } = await request.json().catch(() => ({ siteId: null }))
  revalidateHostMap()
  if (siteId) revalidateSite(siteId)
  return NextResponse.json({ ok: true, revalidated: true })
}
