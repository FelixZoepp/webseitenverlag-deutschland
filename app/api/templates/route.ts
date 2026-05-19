import { AVAILABLE_TEMPLATES } from '@/lib/template-configs'
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(AVAILABLE_TEMPLATES)
}
