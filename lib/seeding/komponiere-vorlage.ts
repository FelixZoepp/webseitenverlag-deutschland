/**
 * Branchen-Fabrik F3: Komposition Profil + Vorlagen-Copy → FlagshipConfig
 * (BF §4.3). Deterministisch, kein Claude — alle Inhalte kommen aus dem
 * validierten BranchenSeed, Struktur-Entscheidungen aus der Meta-Kategorie.
 *
 * Flagship-Branchen (reinigung, restaurant_italienisch) laufen NICHT hier
 * durch, sondern werden im Orchestrator direkt aus FLAGSHIP_SEEDS
 * parametrisiert (BF §3.2: 1:1-Reproduktion als Beweis der Zerlegung).
 */

import { metaKategorie } from '@/config/branchen'
import type { AblaufInhalt, FlagshipConfig } from '@/lib/flagship/types'
import type { BranchenSeed } from './schema'
import type { StartBranche } from './branchen-start'

const ROEMISCH = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII']

export function komponiereVorlage(branche: StartBranche, seed: BranchenSeed): FlagshipConfig {
  const kategorie = metaKategorie(branche.meta_kategorie)
  if (!kategorie) throw new Error(`Unbekannte Meta-Kategorie "${branche.meta_kategorie}"`)
  const { profil, vorlage } = seed
  const m = vorlage.beispiel_meta

  // Ablauf nur bei Stepper 'ablauf' (Gastro: entfällt zugunsten lokal/info)
  let ablauf: AblaufInhalt | undefined
  if (kategorie.stepper === 'ablauf') {
    if (!vorlage.ablauf) throw new Error(`${branche.branche_key}: vorlage.ablauf fehlt trotz Stepper 'ablauf'`)
    ablauf = {
      eyebrow: vorlage.ablauf.eyebrow,
      headline: vorlage.ablauf.headline,
      schritte: profil.ablauf_schritte,
    }
  }

  // Nummern-Stil: römische Ziffern auffüllen, falls Claude keine geliefert hat
  const karten = vorlage.leistungen.karten.map((k, i) => ({
    ...k,
    no: vorlage.leistungen.stil === 'nummern' ? (k.no || ROEMISCH[i] || String(i + 1)) : k.no,
  }))

  return {
    engine: 'flagship',
    branche_key: branche.branche_key,
    meta_kategorie: branche.meta_kategorie,
    meta: {
      firma: m.firma,
      ort: m.ort,
      telefon: m.telefon,
      gegruendet: m.gegruendet,
      seo_titel: m.seo_titel,
      seo_beschreibung: m.seo_beschreibung,
    },
    design: profil.design,
    inhalte: {
      nav: vorlage.nav,
      hero: vorlage.hero,
      fakten: vorlage.fakten,
      empathie: vorlage.empathie,
      signature: {
        variante: kategorie.signature_variante,
        eyebrow: vorlage.signature.eyebrow,
        headline: vorlage.signature.headline,
        vorher: vorlage.signature.vorher,
        nachher: vorlage.signature.nachher,
        tag_vorher: profil.signature.tag_vorher,
        tag_nachher: profil.signature.tag_nachher,
        cap: vorlage.signature.cap,
      },
      leistungen: { ...vorlage.leistungen, karten },
      ablauf,
      ergebnisse: vorlage.ergebnisse,
      zahlen: vorlage.zahlen,
      stimmen: vorlage.stimmen,
      lokal: vorlage.lokal,
      faq: {
        eyebrow: vorlage.faq.eyebrow,
        headline: vorlage.faq.headline,
        fragen: profil.faq_rohlinge,
      },
      conversion: { ...vorlage.conversion, telefon: m.telefon },
      footer: vorlage.footer,
    },
    funnel: {
      modus: kategorie.funnel_modus,
      leistungen: kategorie.funnel_modus === 'anfrage' ? profil.leistungen.map((l) => l.titel) : undefined,
      quali_fragen: kategorie.funnel_modus === 'anfrage' ? profil.quali_fragen : undefined,
      erfolg_text: profil.erfolg_text,
    },
    herkunft: { generator: 'branchen-seeding-f3' },
  }
}
