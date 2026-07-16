import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-helpers'
import { scrapeProspectWebsite } from '@/lib/scrape-prospect'
import { generateDemoConfig } from '@/lib/generate-demo'
import { ScrapedProspect } from '@/lib/scrape-prospect'
import { collectProspectData } from '@/lib/pipeline/prospect-data'
import {
  generateLibraryDemoConfig,
  type LibraryDemoConfig,
} from '@/lib/pipeline/generate-library-content'
import { generiereFlagshipDemo } from '@/lib/pipeline/generate-flagship-demo'
import type { FlagshipConfig } from '@/lib/flagship/types'
import { generiereAsset, generiereVideo, makePair } from '@/lib/assets/pipeline'
import { loadLibraryPage } from '@/lib/library/load'

export const maxDuration = 300

const VALID_STATUS = ['GENERIERT', 'VERSENDET', 'CONVERTED', 'ABGELAUFEN']

export async function GET(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { data: demo, error } = await auth.data.supabase
    .from('demos')
    .select('*')
    .eq('id', params.demoId)
    .single()
  if (error || !demo) return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  return NextResponse.json({ demo })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { error } = await auth.data.supabase
    .from('demos')
    .delete()
    .eq('id', params.demoId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: { demoId: string } }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const { supabase } = auth.data

  const body = await request.json().catch(() => null)
  const action = typeof body?.action === 'string' ? body.action : null

  const { data: demo, error: loadError } = await supabase
    .from('demos')
    .select('*')
    .eq('id', params.demoId)
    .single()

  if (loadError || !demo) {
    return NextResponse.json({ error: 'Demo nicht gefunden' }, { status: 404 })
  }

  // Status-Update (z.B. auf VERSENDET nach dem Versenden des Links)
  if (action === 'status') {
    const status = typeof body?.status === 'string' ? body.status : ''
    if (!VALID_STATUS.includes(status)) {
      return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 })
    }
    const { data: updated, error } = await supabase
      .from('demos')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated })
  }

  // Neu generieren: Flagship-Engine
  if (action === 'regenerate' && (demo.config as { engine?: string })?.engine === 'flagship') {
    const alteConfig = demo.config as FlagshipConfig

    const prospect = await collectProspectData({
      firma: demo.prospect_name,
      ort: alteConfig.meta.ort,
      branche: demo.branche,
      websiteUrl: demo.prospect_website,
      notizen: demo.notes,
    })

    let ergebnis
    try {
      ergebnis = await generiereFlagshipDemo(prospect, demo.branche!)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Flagship-Regenerierung fehlgeschlagen' },
        { status: 500 }
      )
    }

    const { data: updated, error } = await supabase
      .from('demos')
      .update({
        config: ergebnis.config,
        scraped_data: prospect,
        status: 'GENERIERT',
        kosten_cent: ergebnis.kostenCent,
        asset_meta: ergebnis.assetMeta,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const warning = ergebnis.warnungen.length > 0 ? ergebnis.warnungen.join(' · ') : null
    return NextResponse.json({ demo: updated, warning })
  }

  // Neu generieren (Library-Engine, Pipeline v2): Datenkette komplett neu durchlaufen
  if (action === 'regenerate' && (demo.config as { engine?: string })?.engine === 'library') {
    const alteConfig = demo.config as LibraryDemoConfig

    const loaded = await loadLibraryPage(supabase, alteConfig.library_page_key)
    if (!loaded) {
      return NextResponse.json(
        { error: `Komposition ${alteConfig.library_page_key} nicht gefunden` },
        { status: 500 }
      )
    }

    const prospect = await collectProspectData({
      firma: demo.prospect_name,
      ort: alteConfig.meta.ort,
      branche: demo.branche,
      websiteUrl: demo.prospect_website,
      telefon: alteConfig.meta.telefon,
      email: alteConfig.meta.email,
      notizen: demo.notes,
    })

    const config = await generateLibraryDemoConfig(prospect, loaded)

    const { data: updated, error } = await supabase
      .from('demos')
      .update({
        config,
        scraped_data: prospect,
        status: 'GENERIERT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const warning =
      config.herkunft.generator === 'defaults'
        ? 'Demo wurde mit Standard-Inhalten erstellt (Claude nicht verfügbar oder Qualitätsprüfung fehlgeschlagen).'
        : null
    return NextResponse.json({ demo: updated, warning })
  }

  // Neu generieren: frisch scrapen falls Website vorhanden, sonst gespeicherte Daten nutzen
  if (action === 'regenerate') {
    let scraped: ScrapedProspect | null = null
    let scrapeWarning: string | null = null

    if (demo.prospect_website) {
      scraped = await scrapeProspectWebsite(demo.prospect_website)
      if (!scraped && demo.scraped_data) {
        scraped = demo.scraped_data as ScrapedProspect
        scrapeWarning = 'Website nicht erreichbar — vorherige Scrape-Daten wurden verwendet.'
      } else if (!scraped) {
        scrapeWarning = 'Website konnte nicht gescrapt werden — Demo wurde mit branchentypischen Inhalten erstellt.'
      }
    } else if (demo.scraped_data) {
      scraped = demo.scraped_data as ScrapedProspect
    }

    let config: Record<string, unknown>
    try {
      config = await generateDemoConfig(
        demo.prospect_name,
        demo.template_id,
        scraped,
        demo.branche,
        demo.notes
      )
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Demo-Generierung fehlgeschlagen' },
        { status: 500 }
      )
    }

    const { data: updated, error } = await supabase
      .from('demos')
      .update({
        config,
        scraped_data: scraped,
        status: 'GENERIERT',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.demoId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated, warning: scrapeWarning })
  }

  // ── Demo-Korrektur: Config-Felder direkt patchen (Texte, Meta, Design) ──
  if (action === 'edit' && (demo.config as { engine?: string })?.engine === 'flagship') {
    const config = demo.config as FlagshipConfig
    const edits = body?.edits as Record<string, unknown> | undefined
    if (!edits || typeof edits !== 'object') {
      return NextResponse.json({ error: 'edits-Objekt fehlt' }, { status: 400 })
    }

    // Sichere Pfade: nur erlaubte Top-Level-Keys patchen
    const erlaubt = ['meta', 'inhalte', 'design', 'funnel'] as const
    for (const key of erlaubt) {
      if (edits[key] && typeof edits[key] === 'object') {
        // Shallow-Merge auf erster Ebene, Deep-Merge auf zweiter
        const ziel = config[key] as unknown as Record<string, unknown>
        for (const [subKey, subVal] of Object.entries(edits[key] as Record<string, unknown>)) {
          if (subVal && typeof subVal === 'object' && !Array.isArray(subVal) && ziel[subKey] && typeof ziel[subKey] === 'object') {
            ziel[subKey] = { ...(ziel[subKey] as Record<string, unknown>), ...subVal }
          } else {
            ziel[subKey] = subVal
          }
        }
      }
    }

    const { data: updated, error } = await supabase
      .from('demos')
      .update({ config, updated_at: new Date().toISOString() })
      .eq('id', params.demoId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated })
  }

  // ── Demo-Korrektur: einzelnes Asset neu generieren ──
  if (action === 'regenerate-asset' && (demo.config as { engine?: string })?.engine === 'flagship') {
    const config = demo.config as FlagshipConfig
    const slot = typeof body?.slot === 'string' ? body.slot : ''
    const brancheKey = config.branche_key || demo.branche || ''
    const kontext = `demo-edit:${brancheKey}:${demo.prospect_name}`

    if (slot === 'hero') {
      const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
      const heroPrompt = `Close-up on the craft and result: ${heroLabel}, hands and tools only, no face visible. The main action on the RIGHT half, calm open interior on the left. Photorealistic photography, shallow depth of field, 16:9. No text, no logos, no people facing camera.`
      try {
        const hero = await generiereAsset({ prompt: heroPrompt, aspect: '16:9', branche: brancheKey, szeneTyp: 'hero', quelleOverride: 'demo_generiert', kontext })
        config.inhalte.hero.media.datei = hero.publicUrl
        // Video optional dazu
        try {
          const video = await generiereVideo({ imageUrl: hero.publicUrl, prompt: `Cinematic 4K, static camera, subtle ambient motion: ${heroLabel}. Seamless loop. No people, no text.`, durationSeconds: 6, kontext: `video:${kontext}` })
          if (video.videoUrl) config.inhalte.hero.video = { src: video.videoUrl, poster: hero.publicUrl }
        } catch { /* Video-Fehler ignorieren */ }
        const { data: updated, error } = await supabase.from('demos').update({ config, updated_at: new Date().toISOString() }).eq('id', params.demoId).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ demo: updated, regenerated: 'hero' })
      } catch (err) {
        return NextResponse.json({ error: `Hero-Generierung fehlgeschlagen: ${(err as Error).message}` }, { status: 500 })
      }
    }

    if (slot === 'signature') {
      const nachherLabel = config.inhalte.signature.nachher.label || config.inhalte.signature.tag_nachher
      const vorherLabel = config.inhalte.signature.vorher.label || config.inhalte.signature.tag_vorher
      const sigCap = config.inhalte.signature.cap || brancheKey
      try {
        const paar = await makePair({
          branche: brancheKey,
          nachherPrompt: `${nachherLabel}. ${sigCap}. Immaculate, gleaming, well-maintained. Bright daylight, 16:9. Photorealistic, shallow depth of field. No people, no text, no logos.`,
          vorherPrompt: `Same exact scene, keep IDENTICAL room/objects/camera. Only change: ${vorherLabel}. Dusty, grimy, neglected. Muted colors, flat light. No text, no logos.`,
          aspect: '16:9',
          quelleOverride: 'demo_generiert',
          kontext,
        })
        config.inhalte.signature.nachher.datei = paar.nachher.publicUrl
        config.inhalte.signature.vorher.datei = paar.vorher.publicUrl
        const { data: updated, error } = await supabase.from('demos').update({ config, updated_at: new Date().toISOString() }).eq('id', params.demoId).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ demo: updated, regenerated: 'signature' })
      } catch (err) {
        return NextResponse.json({ error: `Signature-Paar fehlgeschlagen: ${(err as Error).message}` }, { status: 500 })
      }
    }

    if (slot.startsWith('ergebnis-')) {
      const idx = parseInt(slot.split('-')[1], 10)
      const paare = config.inhalte.ergebnisse.paare
      if (!paare || idx < 0 || idx >= paare.length) {
        return NextResponse.json({ error: `Ergebnis-Paar ${idx} nicht gefunden` }, { status: 400 })
      }
      const paarDef = paare[idx]
      try {
        const paar = await makePair({
          branche: brancheKey,
          nachherPrompt: `${paarDef.nachher.label || paarDef.caption}. Clean, well-maintained. Bright lighting, 16:9. Photorealistic. No people, no text, no logos.`,
          vorherPrompt: `Same exact scene, keep IDENTICAL composition/camera. Only change: ${paarDef.vorher.label || paarDef.caption} in neglected state. Dusty, worn. Muted colors. No text, no logos.`,
          aspect: '16:9',
          quelleOverride: 'demo_generiert',
          kontext: `${kontext}:ergebnis-${idx}`,
        })
        paarDef.nachher.datei = paar.nachher.publicUrl
        paarDef.vorher.datei = paar.vorher.publicUrl
        const { data: updated, error } = await supabase.from('demos').update({ config, updated_at: new Date().toISOString() }).eq('id', params.demoId).select().single()
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ demo: updated, regenerated: `ergebnis-${idx}` })
      } catch (err) {
        return NextResponse.json({ error: `Ergebnis-Paar fehlgeschlagen: ${(err as Error).message}` }, { status: 500 })
      }
    }

    return NextResponse.json({ error: `Unbekannter Slot "${slot}" — erlaubt: hero, signature, ergebnis-0, ergebnis-1, …` }, { status: 400 })
  }

  // ── Inline-Editor: HTML direkt speichern ──
  if (action === 'save-html') {
    const newHtml = typeof body?.html === 'string' ? body.html : ''
    if (!newHtml || newHtml.length < 100) {
      return NextResponse.json({ error: 'HTML zu kurz oder fehlt' }, { status: 400 })
    }
    if (newHtml.length > 500000) {
      return NextResponse.json({ error: 'HTML zu groß (max 500 KB)' }, { status: 400 })
    }

    const engine = (demo.config as { engine?: string })?.engine
    let newConfig: Record<string, unknown>
    if (engine === 'custom') {
      newConfig = { engine: 'custom', html: newHtml }
    } else if (engine === 'flagship') {
      // Flagship: HTML nicht direkt speichern, stattdessen als custom-override
      newConfig = { ...(demo.config as Record<string, unknown>), _html_override: newHtml }
    } else {
      return NextResponse.json({ error: 'save-html nur für Flagship/Custom-Demos' }, { status: 400 })
    }

    const { data: updated, error } = await supabase
      .from('demos')
      .update({ config: newConfig, updated_at: new Date().toISOString() })
      .eq('id', params.demoId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ demo: updated })
  }

  return NextResponse.json({ error: 'Ungültige Aktion' }, { status: 400 })
}
