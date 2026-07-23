import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { getImageChecklist } from '@/lib/image-checklist'
import { pruefeAspekt } from '@/lib/assets/aspekt'
import sharp from 'sharp'
import Anthropic from '@anthropic-ai/sdk'
import { pruefeLlmSchranke } from '@/lib/llm-schranke'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

/** Sharp-Pipeline (§5.2): EXIF-Rotation, max. Breite, WebP — nie Originale ausliefern. */
const MAX_BREITE = 2560
const WEBP_QUALITAET = 82

// GET: Alle Bilder eines Kunden für eine Site laden
export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 })

    let query = supabase
      .from('kunden_bilder')
      .select('*')
      .eq('customer_id', customer.id)
      .order('uploaded_at', { ascending: true })

    if (siteId) query = query.eq('site_id', siteId)

    const { data } = await query
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// POST: Bild hochladen + automatische KI-Zuordnung
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })

    const { data: customer } = await supabase
      .from('customers')
      .select('id, branche')
      .eq('user_id', user.id)
      .single()

    if (!customer) return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 })

    // B-25: KI-Zuordnung kostet Tokens — Kill-Switch + Tages-Cap + 30 Uploads/h je Kunde
    const schranke = await pruefeLlmSchranke('customer-bilder', {
      schluessel: customer.id,
      maxProFenster: 30,
      fensterMs: 60 * 60 * 1000,
    })
    if (!schranke.ok) {
      return NextResponse.json({ error: schranke.grund }, { status: schranke.status })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const siteId = formData.get('siteId') as string | null
    const templateId = formData.get('templateId') as string | null

    if (!file) return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })
    if (!siteId) return NextResponse.json({ error: 'Keine siteId' }, { status: 400 })

    // Prüfen ob Site dem Kunden gehört
    const { data: site } = await supabase
      .from('sites')
      .select('id')
      .eq('id', siteId)
      .eq('customer_id', customer.id)
      .single()

    if (!site) return NextResponse.json({ error: 'Site nicht gefunden' }, { status: 404 })

    // Datei validieren
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilddateien erlaubt' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Datei zu groß (max 10MB)' }, { status: 400 })
    }

    // Sharp-Pipeline (§5.2): EXIF-Rotation → max. Breite → WebP.
    // Es wird NIE das Original ausgeliefert, nur die verarbeitete Datei.
    const arrayBuffer = await file.arrayBuffer()
    let webpBuffer: Buffer
    let breite: number
    let hoehe: number
    try {
      const { data, info } = await sharp(Buffer.from(arrayBuffer))
        .rotate() // EXIF-Orientierung anwenden
        .resize({ width: MAX_BREITE, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITAET })
        .toBuffer({ resolveWithObject: true })
      webpBuffer = data
      breite = info.width
      hoehe = info.height
    } catch {
      return NextResponse.json({ error: 'Bild konnte nicht verarbeitet werden — bitte JPG, PNG oder WebP hochladen.' }, { status: 400 })
    }

    // Aspect-Check (§5.2): kompatible Slots + Auto-Crop-Vorschläge
    const aspekt = pruefeAspekt(breite, hoehe)

    const storagePath = `${customer.id}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.webp`

    const { error: uploadError } = await supabase.storage
      .from('kundenbilder')
      .upload(storagePath, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload fehlgeschlagen: ${uploadError.message}` }, { status: 500 })
    }

    // Public URL generieren
    const { data: urlData } = supabase.storage.from('kundenbilder').getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    // DB-Eintrag erstellen (ohne KI-Zuordnung erstmal)
    const { data: bild, error: insertError } = await supabase
      .from('kunden_bilder')
      .insert({
        customer_id: customer.id,
        site_id: siteId,
        dateiname: file.name,
        storage_path: storagePath,
        public_url: publicUrl,
        mime_type: 'image/webp',
        groesse_bytes: webpBuffer.length,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Phase 4 (§5.2): Kunden-Upload landet als quelle='kunde' in der Asset-Bank —
    // site-gebunden (site_id), damit er NUR für diese Site sichtbar ist.
    // asset_bank ist RLS-admin-only → Admin-Client.
    try {
      const admin = createAdminClient()
      const { error: bankError } = await admin.from('asset_bank').insert({
        storage_path: storagePath,
        medium: 'image',
        szene_typ: aspekt.kompatibleSlots[0] ?? null,
        branchen: [(customer.branche as string | null)?.toLowerCase() || 'kunde'],
        style_tags: [],
        quelle: 'kunde',
        site_id: siteId,
        quality_status: 'approved',
        breite,
        hoehe,
        aspect_ratio: aspekt.aspectRatio,
        alt_text_de: file.name.replace(/\.[a-z0-9]+$/i, ''),
      })
      if (bankError) console.error('asset_bank-Eintrag (kunde) fehlgeschlagen:', bankError.message)
    } catch (err) {
      console.error('asset_bank-Eintrag (kunde) fehlgeschlagen:', err)
    }

    // KI-Zuordnung im Hintergrund (nicht blockierend)
    if (templateId) {
      classifyImageWithAI(supabase, bild.id, publicUrl, templateId, siteId)
        .catch((err) => console.error('KI-Zuordnung fehlgeschlagen:', err))
    }

    // Aspekt-Ergebnis (§5.2) mitliefern: kompatible Slots + Auto-Crop-Vorschläge
    return NextResponse.json({ ...bild, aspekt }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

// KI-Bild-Zuordnung per Claude Vision
async function classifyImageWithAI(
  supabase: ReturnType<typeof createClient>,
  bildId: string,
  imageUrl: string,
  templateId: string,
  siteId: string
) {
  // Kurz warten um Race-Conditions bei Batch-Uploads zu reduzieren
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 2000))

  const slots = getImageChecklist(templateId)

  // Bestehende Zuordnungen laden (sowohl slot_id als auch ki_zuordnung)
  const { data: existingImages } = await supabase
    .from('kunden_bilder')
    .select('id, slot_id, ki_zuordnung')
    .eq('site_id', siteId)
    .neq('id', bildId)

  const belegteSlots = (existingImages || [])
    .map((i) => i.slot_id || i.ki_zuordnung)
    .filter(Boolean) as string[]

  // Nur freie Slots anbieten
  const freieSlots = slots.filter((s) => !belegteSlots.includes(s.id))

  if (freieSlots.length === 0) {
    // Alle Slots belegt — nur ki_zuordnung setzen, nicht slot_id
    await supabase
      .from('kunden_bilder')
      .update({ ki_zuordnung: 'extra', ki_confidence: 0.3 })
      .eq('id', bildId)
    return
  }

  const freieSlotDescriptions = freieSlots.map((s) => `- "${s.id}": ${s.label} — ${s.description}`).join('\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: `Analysiere dieses Bild und ordne es dem passendsten FREIEN Slot zu.

NUR DIESE SLOTS SIND NOCH FREI:
${freieSlotDescriptions}

Antworte NUR mit einem JSON-Objekt:
{"slot_id": "der_passende_slot", "confidence": 0.85}

Wähle den am besten passenden freien Slot.`,
          },
        ],
      }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[^}]+\}/)
    if (!jsonMatch) return

    const result = JSON.parse(jsonMatch[0])
    const slotId = result.slot_id
    const confidence = Math.min(Math.max(result.confidence || 0.5, 0), 1)

    // Nochmal prüfen ob Slot inzwischen belegt wurde (Race-Condition)
    const { data: checkSlot } = await supabase
      .from('kunden_bilder')
      .select('id')
      .eq('site_id', siteId)
      .eq('slot_id', slotId)
      .neq('id', bildId)
      .limit(1)

    if (checkSlot && checkSlot.length > 0) {
      // Slot wurde inzwischen belegt — nur ki_zuordnung setzen, nicht slot_id
      await supabase
        .from('kunden_bilder')
        .update({ ki_zuordnung: slotId, ki_confidence: confidence })
        .eq('id', bildId)
    } else {
      await supabase
        .from('kunden_bilder')
        .update({ ki_zuordnung: slotId, ki_confidence: confidence, slot_id: slotId })
        .eq('id', bildId)
    }
  } catch (err) {
    console.error('Claude Vision Fehler:', err)
  }
}
