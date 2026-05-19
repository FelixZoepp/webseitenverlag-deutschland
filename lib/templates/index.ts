import { renderGruenwerkTemplate, GruenwerkConfig } from './gruenwerk'
import { renderEisenwerkTemplate, EisenwerkConfig } from './eisenwerk'
import { renderTrattoriaTemplate, TrattoriaConfig } from './trattoria'
import { renderWildblattTemplate, WildblattConfig } from './wildblatt'
import { renderFitnessBoutiqueTemplate, FitnessBoutiqueConfig } from './fitness-boutique'
import { renderFitnessFrauenTemplate, FitnessFrauenConfig } from './fitness-frauen'
import { renderSushiTemplate, SushiConfig } from './sushi'
import { renderCafeTemplate, CafeConfig } from './cafe'
import { renderReinigungIndustrieTemplate, ReinigungIndustrieConfig } from './reinigung-industrie'
import { renderFloristikBioTemplate, FloristikBioConfig } from './floristik-bio'
import { renderFriseurUnisexTemplate, FriseurUnisexConfig } from './friseur-unisex'
import { renderReinigungPrivatTemplate, ReinigungPrivatConfig } from './reinigung-privat'
import { renderFriseurDamenTemplate, FriseurDamenConfig } from './friseur-damen'
import { renderReinigungB2BTemplate, ReinigungB2BConfig } from './reinigung-b2b'
import { renderFriseurBarbershopTemplate, FriseurBarbershopConfig } from './friseur-barbershop'
import { renderArztHautarztTemplate, ArztHautarztConfig } from './arzt-hautarzt'
import { renderArztHausarztTemplate, ArztHausarztConfig } from './arzt-hausarzt'
import { renderHandwerkSanitaerTemplate, HandwerkSanitaerConfig } from './handwerk-sanitaer'
import { renderHandwerkElektrikerTemplate, HandwerkElektrikerConfig } from './handwerk-elektriker'
import { renderAnwaltSteuerberaterTemplate, AnwaltSteuerberaterConfig } from './anwalt-steuerberater'
import { renderWerkstattBMWTemplate, WerkstattBMWConfig } from './werkstatt-bmw'
import { renderFloristikEdelTemplate, FloristikEdelConfig } from './floristik-edel'
import { renderHotelLandTemplate, HotelLandConfig } from './hotel-land'
import { renderHandwerkMalerTemplate, HandwerkMalerConfig } from './handwerk-maler'
import { renderImmobilienPremiumTemplate, ImmobilienPremiumConfig } from './immobilien-premium'
import { renderHotelNordseeTemplate, HotelNordseeConfig } from './hotel-nordsee'
import { renderImmobilienTechTemplate, ImmobilienTechConfig } from './immobilien-tech'
import { renderYogaPilatesTemplate, YogaPilatesConfig } from './yoga-pilates'
import { renderYogaPremiumTemplate, YogaPremiumConfig } from './yoga-premium'
import { renderArztZahnarztTemplate, ArztZahnarztConfig } from './arzt-zahnarzt'
import { renderYogaHotTemplate, YogaHotConfig } from './yoga-hot'
import { renderHotelStadtTemplate, HotelStadtConfig } from './hotel-stadt'
import { renderAnwaltWirtschaftTemplate, AnwaltWirtschaftConfig } from './anwalt-wirtschaft'
import { renderAnwaltFamilieTemplate, AnwaltFamilieConfig } from './anwalt-familie'
import { renderWerkstattKlassischTemplate, WerkstattKlassischConfig } from './werkstatt-klassisch'
import { renderWerkstattEAutoTemplate, WerkstattEAutoConfig } from './werkstatt-eauto'
import { renderImmobilienRegionalTemplate, ImmobilienRegionalConfig } from './immobilien-regional'
import { renderTattooStudioTemplate, TattooStudioConfig } from './tattoo-studio'

export type PremiumTemplateId = 'gruenwerk' | 'eisenwerk' | 'trattoria' | 'wildblatt' | 'fitness-boutique' | 'fitness-frauen' | 'sushi' | 'cafe' | 'reinigung-industrie' | 'floristik-bio' | 'friseur-unisex' | 'reinigung-privat' | 'friseur-damen' | 'reinigung-b2b' | 'friseur-barbershop' | 'arzt-hautarzt' | 'arzt-hausarzt' | 'handwerk-sanitaer' | 'handwerk-elektriker' | 'anwalt-steuerberater' | 'werkstatt-bmw' | 'floristik-edel' | 'handwerk-maler' | 'immobilien-premium' | 'hotel-nordsee' | 'immobilien-tech' | 'yoga-pilates' | 'arzt-zahnarzt' | 'yoga-hot' | 'hotel-land' | 'hotel-stadt' | 'anwalt-wirtschaft' | 'anwalt-familie' | 'werkstatt-klassisch' | 'werkstatt-eauto' | 'immobilien-regional' | 'yoga-premium' | 'tattoo-studio'

export const PREMIUM_TEMPLATE_IDS: PremiumTemplateId[] = ['gruenwerk', 'eisenwerk', 'trattoria', 'wildblatt', 'fitness-boutique', 'fitness-frauen', 'sushi', 'cafe', 'reinigung-industrie', 'floristik-bio', 'friseur-unisex', 'reinigung-privat', 'friseur-damen', 'reinigung-b2b', 'friseur-barbershop', 'arzt-hautarzt', 'arzt-hausarzt', 'handwerk-sanitaer', 'handwerk-elektriker', 'anwalt-steuerberater', 'werkstatt-bmw', 'floristik-edel', 'handwerk-maler', 'immobilien-premium', 'hotel-nordsee', 'immobilien-tech', 'yoga-pilates', 'arzt-zahnarzt', 'yoga-hot', 'hotel-land', 'hotel-stadt', 'anwalt-wirtschaft', 'anwalt-familie', 'werkstatt-klassisch', 'werkstatt-eauto', 'immobilien-regional', 'yoga-premium', 'tattoo-studio']

export function isPremiumTemplate(templateId: string): templateId is PremiumTemplateId {
  return PREMIUM_TEMPLATE_IDS.includes(templateId as PremiumTemplateId)
}

export function renderPremiumTemplate(
  templateId: PremiumTemplateId,
  config: Record<string, unknown>,
  siteId?: string
): string {
  switch (templateId) {
    case 'gruenwerk':
      return renderGruenwerkTemplate(config as unknown as GruenwerkConfig, siteId)
    case 'eisenwerk':
      return renderEisenwerkTemplate(config as unknown as EisenwerkConfig, siteId)
    case 'trattoria':
      return renderTrattoriaTemplate(config as unknown as TrattoriaConfig, siteId)
    case 'wildblatt':
      return renderWildblattTemplate(config as unknown as WildblattConfig, siteId)
    case 'fitness-boutique':
      return renderFitnessBoutiqueTemplate(config as unknown as FitnessBoutiqueConfig, siteId)
    case 'fitness-frauen':
      return renderFitnessFrauenTemplate(config as unknown as FitnessFrauenConfig, siteId)
    case 'sushi':
      return renderSushiTemplate(config as unknown as SushiConfig, siteId)
    case 'cafe':
      return renderCafeTemplate(config as unknown as CafeConfig, siteId)
    case 'reinigung-industrie':
      return renderReinigungIndustrieTemplate(config as unknown as ReinigungIndustrieConfig, siteId)
    case 'floristik-bio':
      return renderFloristikBioTemplate(config as unknown as FloristikBioConfig, siteId)
    case 'friseur-unisex':
      return renderFriseurUnisexTemplate(config as unknown as FriseurUnisexConfig, siteId)
    case 'reinigung-privat':
      return renderReinigungPrivatTemplate(config as unknown as ReinigungPrivatConfig, siteId)
    case 'friseur-damen':
      return renderFriseurDamenTemplate(config as unknown as FriseurDamenConfig, siteId)
    case 'reinigung-b2b':
      return renderReinigungB2BTemplate(config as unknown as ReinigungB2BConfig, siteId)
    case 'friseur-barbershop':
      return renderFriseurBarbershopTemplate(config as unknown as FriseurBarbershopConfig, siteId)
    case 'arzt-hautarzt':
      return renderArztHautarztTemplate(config as unknown as ArztHautarztConfig, siteId)
    case 'arzt-hausarzt':
      return renderArztHausarztTemplate(config as unknown as ArztHausarztConfig, siteId)
    case 'handwerk-sanitaer':
      return renderHandwerkSanitaerTemplate(config as unknown as HandwerkSanitaerConfig, siteId)
    case 'handwerk-elektriker':
      return renderHandwerkElektrikerTemplate(config as unknown as HandwerkElektrikerConfig, siteId)
    case 'anwalt-steuerberater':
      return renderAnwaltSteuerberaterTemplate(config as unknown as AnwaltSteuerberaterConfig, siteId)
    case 'werkstatt-bmw':
      return renderWerkstattBMWTemplate(config as unknown as WerkstattBMWConfig, siteId)
    case 'floristik-edel':
      return renderFloristikEdelTemplate(config as unknown as FloristikEdelConfig, siteId)
    case 'handwerk-maler':
      return renderHandwerkMalerTemplate(config as unknown as HandwerkMalerConfig, siteId)
    case 'immobilien-premium':
      return renderImmobilienPremiumTemplate(config as unknown as ImmobilienPremiumConfig, siteId)
    case 'hotel-nordsee':
      return renderHotelNordseeTemplate(config as unknown as HotelNordseeConfig, siteId)
    case 'immobilien-tech':
      return renderImmobilienTechTemplate(config as unknown as ImmobilienTechConfig, siteId)
    case 'yoga-pilates':
      return renderYogaPilatesTemplate(config as unknown as YogaPilatesConfig, siteId)
    case 'yoga-hot':
      return renderYogaHotTemplate(config as unknown as YogaHotConfig, siteId)
    case 'arzt-zahnarzt':
      return renderArztZahnarztTemplate(config as unknown as ArztZahnarztConfig, siteId)
    case 'hotel-land':
      return renderHotelLandTemplate(config as unknown as HotelLandConfig, siteId)
    case 'hotel-stadt':
      return renderHotelStadtTemplate(config as unknown as HotelStadtConfig, siteId)
    case 'anwalt-wirtschaft':
      return renderAnwaltWirtschaftTemplate(config as unknown as AnwaltWirtschaftConfig, siteId)
    case 'anwalt-familie':
      return renderAnwaltFamilieTemplate(config as unknown as AnwaltFamilieConfig, siteId)
    case 'werkstatt-klassisch':
      return renderWerkstattKlassischTemplate(config as unknown as WerkstattKlassischConfig, siteId)
    case 'werkstatt-eauto':
      return renderWerkstattEAutoTemplate(config as unknown as WerkstattEAutoConfig, siteId)
    case 'immobilien-regional':
      return renderImmobilienRegionalTemplate(config as unknown as ImmobilienRegionalConfig, siteId)
    case 'yoga-premium':
      return renderYogaPremiumTemplate(config as unknown as YogaPremiumConfig, siteId)
    case 'tattoo-studio':
      return renderTattooStudioTemplate(config as unknown as TattooStudioConfig, siteId)
  }
}

export type { GruenwerkConfig, EisenwerkConfig, TrattoriaConfig, WildblattConfig, FitnessBoutiqueConfig, FitnessFrauenConfig, SushiConfig, CafeConfig, ReinigungIndustrieConfig, FloristikBioConfig, FriseurUnisexConfig, ReinigungPrivatConfig, FriseurDamenConfig, ReinigungB2BConfig, FriseurBarbershopConfig, ArztHautarztConfig, ArztHausarztConfig, HandwerkSanitaerConfig, HandwerkElektrikerConfig, AnwaltSteuerberaterConfig, WerkstattBMWConfig, FloristikEdelConfig, HandwerkMalerConfig, ImmobilienPremiumConfig, HotelNordseeConfig, ImmobilienTechConfig, YogaPilatesConfig, ArztZahnarztConfig, YogaHotConfig, HotelLandConfig, HotelStadtConfig, AnwaltWirtschaftConfig, AnwaltFamilieConfig, WerkstattKlassischConfig, WerkstattEAutoConfig, ImmobilienRegionalConfig, YogaPremiumConfig, TattooStudioConfig }
