import { requireAdmin } from '@/lib/auth-helpers'
import { NextResponse } from 'next/server'
import { startBuildPipeline } from '@/lib/build-pipeline'

// POST: Build-Pipeline manuell starten
export async function POST(
  request: Request,
  { params }: { params: { customerId: string } }
) {
  try {
    const result = await requireAdmin()
    if (!result.ok) return result.response

    const { supabase } = result.data
    const body = await request.json().catch(() => ({}))

    const buildResult = await startBuildPipeline(
      supabase,
      params.customerId,
      body.transcript || undefined,
      body.firefliesUrl || undefined
    )

    if (!buildResult.success) {
      return NextResponse.json({ error: buildResult.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Serverfehler' }, { status: 500 })
  }
}
