import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH: Slot-Zuordnung manuell ändern
export async function PATCH(
  request: Request,
  { params }: { params: { bildId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const body = await request.json()
    const { slotId } = body

    const { data, error } = await supabase
      .from('kunden_bilder')
      .update({
        slot_id: slotId || null,
        manuell_zugeordnet: true,
      })
      .eq('id', params.bildId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// DELETE: Bild löschen
export async function DELETE(
  _request: Request,
  { params }: { params: { bildId: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    // Bild laden um Storage-Pfad zu bekommen
    const { data: bild } = await supabase
      .from('kunden_bilder')
      .select('storage_path')
      .eq('id', params.bildId)
      .single()

    if (bild?.storage_path) {
      await supabase.storage.from('kundenbilder').remove([bild.storage_path])
    }

    await supabase.from('kunden_bilder').delete().eq('id', params.bildId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}
