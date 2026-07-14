/**
 * Anzeige-Katalog aller Premium-Templates für Admin-UIs
 * (Template-Bibliothek, Demo-Maschine).
 */

export interface TemplateCatalogEntry {
  id: string
  name: string
  industry: string
  desc: string
  color: string
  dark?: boolean
}

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  // Fitness
  { id: 'eisenwerk', name: 'Eisenwerk — Performance-Gym', industry: 'Fitness', desc: 'Anthrazit + Volt-Gelb. Krafttraining, Kurse, Pricing, Trainer.', color: '#d9f55b', dark: true },
  { id: 'fitness-boutique', name: 'Form & Co. — Boutique-Studio', industry: 'Fitness', desc: 'Off-White + Korallrot. Community, Barre, TRX, Reformer.', color: '#e85d50' },
  { id: 'fitness-frauen', name: 'Strong Studio — Frauen-Fitness', industry: 'Fitness', desc: 'Cream + Plum. Empowering, EMS, Pilates, Body Shaping.', color: '#5c2d56' },
  // Restaurant
  { id: 'trattoria', name: 'Trattoria Salvi — Italienisch', industry: 'Gastronomie', desc: 'Terracotta + Olive. Speisekarte, Reservierung, Chef-Quote.', color: '#b8533a' },
  { id: 'cafe', name: 'Kaffee & Komplizen — Café', industry: 'Gastronomie', desc: 'Beige + Espresso. Kaffee-Karte, Barista-Story, Beans.', color: '#3b2a1a' },
  { id: 'sushi', name: 'Hashi — Sushi-Restaurant', industry: 'Gastronomie', desc: "Schwarz + Wasabi. Omakase-Menü, Chef's Table, Sake.", color: '#8bc34a', dark: true },
  // Floristik
  { id: 'wildblatt', name: 'Wildblatt — Slow Flower', industry: 'Floristik', desc: 'Salbei + Antikrosa. Produkte, Lieferzonen, Abo.', color: '#7a9a6a' },
  { id: 'floristik-edel', name: 'Atelier Florale — Edel', industry: 'Floristik', desc: 'Aubergine + Gold. Luxuriös, Brautstrauß, Tischschmuck.', color: '#4a2040' },
  { id: 'floristik-bio', name: 'Wiesenduft — Bio-Markt', industry: 'Floristik', desc: 'Erdbraun + Gelb. Saisonblumen, Direkthandel, Gärtnerei.', color: '#e8b931' },
  // Reinigung
  { id: 'reinigung-b2b', name: 'Klar — B2B-Büroreinigung', industry: 'Reinigung', desc: 'Tiefblau + Mint. Festpreis-Kalkulator, DIN-ISO.', color: '#4ecdc4' },
  { id: 'reinigung-privat', name: 'Sauberhand — Privat', industry: 'Reinigung', desc: 'Hellgrau + Sky. Festpreise, Fenster, Umzug, Polster.', color: '#3b82c8' },
  { id: 'reinigung-industrie', name: 'Aurex — Industriereinigung', industry: 'Reinigung', desc: 'Schwarz + Orange. Hallen, Fassaden, Hochdruck.', color: '#e8722a', dark: true },
  // Friseur
  { id: 'friseur-damen', name: 'Maison Noir — Damen-Premium', industry: 'Friseur', desc: 'Aubergine + Champagner. Balayage, Olaplex, Styling.', color: '#3a1f35' },
  { id: 'friseur-unisex', name: 'Hair Lab — Unisex', industry: 'Friseur', desc: 'Anthrazit + Roségold. Vorher/Nachher, K18, Davines.', color: '#c9907a' },
  { id: 'friseur-barbershop', name: 'Klingen & Bart — Barbershop', industry: 'Friseur', desc: 'Schwarz + Whisky. Fade, Hot-Towel, Walk-in.', color: '#c8943a', dark: true },
  // Arzt
  { id: 'arzt-hausarzt', name: 'Dr. Reinhardt — Hausarzt', industry: 'Gesundheit', desc: 'Salbeigrün. Sprechzeiten, Kasse+Privat, DMP.', color: '#4a7a5a' },
  { id: 'arzt-zahnarzt', name: 'Dentalwerk — Zahnarzt', industry: 'Gesundheit', desc: 'Blau + Mint. Cerec, DVT, PZR, Implantate.', color: '#2a7ab8' },
  { id: 'arzt-hautarzt', name: 'Hautstudio — Dermatologe', industry: 'Gesundheit', desc: 'Rosé + Sand. Hautkrebsvorsorge, Laser, Ästhetik.', color: '#c4887a' },
  // Handwerk
  { id: 'gruenwerk', name: 'Grünwerk — Garten & Landschaft', industry: 'Handwerk', desc: 'Forest + Wood. Bento-Grid, Baumschule, Projekte.', color: '#1f3a2e' },
  { id: 'handwerk-sanitaer', name: 'Wasserwerk — Sanitär & Heizung', industry: 'Handwerk', desc: 'Tiefblau + Kupfer. 24h-Notdienst, Wärmepumpe.', color: '#0f2a4a' },
  { id: 'handwerk-maler', name: 'Pinselstrich — Maler & Lackierer', industry: 'Handwerk', desc: 'Petrol + Terracotta. Vorher/Nachher, Festpreise.', color: '#1a5a5a' },
  { id: 'handwerk-elektriker', name: 'Voltage — Elektriker', industry: 'Handwerk', desc: 'Schwarz + Volt. Smart-Home, PV, Wallbox, KNX.', color: '#d9f55b', dark: true },
  // Anwalt
  { id: 'anwalt-wirtschaft', name: 'Brückmann — Wirtschaftskanzlei', industry: 'Recht', desc: 'Marine + Bordeaux. M&A, IT-Recht, Mandate.', color: '#0e1f3e' },
  { id: 'anwalt-steuerberater', name: 'Steuerwerk — Steuerberater', industry: 'Recht', desc: 'Anthrazit + Senf. DATEV, EÜR, Bilanz, GmbH.', color: '#d4a828' },
  { id: 'anwalt-familie', name: 'Vogel & Söhne — Familienrecht', industry: 'Recht', desc: 'Bordeaux + Sand. Scheidung, Sorgerecht, Mediation.', color: '#5a2030' },
  // Hotel
  { id: 'hotel-stadt', name: 'Hotel Kahn — Boutique-Stadt', industry: 'Hotel', desc: 'Anthrazit + Champagner. Zimmer, Rooftop, Concierge.', color: '#c8b88a' },
  { id: 'hotel-land', name: 'Berghof — Landhotel Allgäu', industry: 'Hotel', desc: 'Tannengrün + Holz. Sauna, Bergpanorama, Küche.', color: '#2a4a2e' },
  { id: 'hotel-nordsee', name: 'Strandhaus Sylt — Design', industry: 'Hotel', desc: 'Tiefblau + Sand. Thalasso, Meerblick, Wattwandern.', color: '#0e2a4a' },
  // Werkstatt
  { id: 'werkstatt-klassisch', name: 'Motorwerk — Meisterwerkstatt', industry: 'KFZ', desc: 'Anthrazit + Orange. TÜV, Inspektion, Festpreise.', color: '#e87a2a' },
  { id: 'werkstatt-bmw', name: 'Bayern Klassik — BMW-Spezialist', industry: 'KFZ', desc: 'Schwarz + Tiefblau. M-Serie, Oldtimer, Premium.', color: '#1a3a6a', dark: true },
  { id: 'werkstatt-eauto', name: 'Voltgarage — E-Auto', industry: 'KFZ', desc: 'Off-White + Mint. Batterie, Wallbox, Hochvolt.', color: '#2ec4a0' },
  // Immobilien
  { id: 'immobilien-premium', name: 'Bauer & Walther — Premium', industry: 'Immobilien', desc: 'Bordeaux + Gold. Objekte, Marktwert, Investment.', color: '#4a1a2a' },
  { id: 'immobilien-tech', name: 'Hausverlag — Tech-Makler', industry: 'Immobilien', desc: 'Off-White + Lime. 3D-Touren, Daten, Timeline.', color: '#a8e040' },
  { id: 'immobilien-regional', name: 'Brunner — Regional-Makler', industry: 'Immobilien', desc: 'Tannengrün + Sand. Familiär, Erbimmobilien.', color: '#2a4a30' },
  // Yoga
  { id: 'yoga-premium', name: 'Mantra — Premium-Yoga', industry: 'Yoga', desc: 'Antikrosa + Salbei. Vinyasa, Hatha, Yin, RYT-500.', color: '#c4907a' },
  { id: 'yoga-pilates', name: 'Reform — Pilates-Studio', industry: 'Yoga', desc: 'Anthrazit + Korall. Reformer, Tower, Polestar.', color: '#d4806a' },
  { id: 'yoga-hot', name: 'Heat Yoga — Hot-Yoga', industry: 'Yoga', desc: 'Burgund + Cream. Bikram, 38°C, Inferno.', color: '#5a1a2a' },
  // Tattoo
  { id: 'tattoo-studio', name: 'Schwarzwerk — Tattoo-Studio', industry: 'Tattoo & Piercing', desc: 'Schwarz + Rot. Artists, Styles, Portfolio, Booking.', color: '#c0392b', dark: true },
]

export const CATALOG_INDUSTRIES = Array.from(new Set(TEMPLATE_CATALOG.map((t) => t.industry)))
