/**
 * Gemeinsame Config-Felder die alle Premium-Templates teilen.
 * Die KI generiert IMMER diese Felder aus dem Onboarding-Transkript.
 * Template-spezifische Extras werden als Zusatz-Prompt angehängt.
 */

export interface TemplateSchemaInfo {
  id: string
  label: string
  industry: string
  /** Zusätzliche Felder die die KI generieren soll, als JSON-Beschreibung */
  extraFields: string
  /** Schema.org @type */
  schemaType: string
  /** Branchenspezifische Prompt-Hinweise */
  industryHints: string
}

export const TEMPLATE_SCHEMAS: Record<string, TemplateSchemaInfo> = {
  // Fitness
  'eisenwerk': {
    id: 'eisenwerk', label: 'Performance-Gym', industry: 'Fitness',
    schemaType: 'SportsActivityLocation',
    extraFields: `"programs": [{"icon": "emoji", "title": "Kursname", "description": "Beschreibung", "features": ["Feature1", "Feature2"]}],
"pricing": [{"name": "Tarif", "price": "29", "period": "/Monat", "features": ["Feature1"], "highlighted": false, "ctaText": "Auswählen"}],
"trainers": [{"name": "Name", "role": "Rolle", "speciality": "Spezialisierung"}],
"schedule": [{"day": "Montag", "classes": [{"time": "09:00", "name": "Kursname", "trainer": "Trainer", "spots": "15 Plätze"}]}],
"openingHours": "Mo-Fr: 06-23 Uhr, Sa-So: 08-20 Uhr",
"announceText": "Optionaler Announcement-Text"`,
    industryHints: 'Fachbegriffe: Squat, Deadlift, Bench, HIIT, Kettlebell, Mobility, Olympic Lifting, RPE, AMRAP. Erstelle 3-6 Programme, 3 Preisstufen, 2-4 Trainer.',
  },
  'fitness-boutique': {
    id: 'fitness-boutique', label: 'Boutique-Studio', industry: 'Fitness',
    schemaType: 'HealthClub',
    extraFields: `"programs": [{"icon": "emoji", "title": "Kursname", "description": "Beschreibung", "features": ["Feature1"]}],
"pricing": [{"name": "Tarif", "price": "49", "period": "/Monat", "features": ["Feature1"], "highlighted": false, "ctaText": "Auswählen"}],
"trainers": [{"name": "Name", "role": "Rolle", "speciality": "Spezialisierung"}]`,
    industryHints: 'Fachbegriffe: Barre, HIIT, TRX, Reformer, Functional Training, Body Shaping. Community-orientiert.',
  },
  'fitness-frauen': {
    id: 'fitness-frauen', label: 'Frauen-Fitness', industry: 'Fitness',
    schemaType: 'HealthClub',
    extraFields: `"programs": [{"icon": "emoji", "title": "Kursname", "description": "Beschreibung", "features": ["Feature1"]}],
"pricing": [{"name": "Tarif", "price": "39", "period": "/Monat", "features": ["Feature1"], "highlighted": false, "ctaText": "Auswählen"}],
"trainers": [{"name": "Name", "role": "Rolle", "speciality": "Spezialisierung"}]`,
    industryHints: 'Empowering Tonalität, Fachbegriffe: EMS, Pilates, Yoga, Barre, Beckenbodentraining, Body Pump.',
  },
  // Gastronomie
  'trattoria': {
    id: 'trattoria', label: 'Restaurant Italienisch', industry: 'Gastronomie',
    schemaType: 'Restaurant',
    extraFields: `"menuCategories": [{"name": "Kategorie", "items": [{"name": "Gericht", "description": "Beschreibung", "price": "14,50 €", "tag": "optional: Vegetarisch/Vegan/Empfehlung"}]}],
"openingHours": [{"days": "Mo-Fr", "hours": "11:30-22:00"}],
"chefName": "Name des Küchenchefs", "chefRole": "Küchenchef", "chefQuote": "Zitat",
"reservationEnabled": true`,
    industryHints: 'Fachbegriffe: Antipasti, Primi, Secondi, Dolci, Holzofen, à la carte, mise en place. Erstelle 3-5 Menükategorien mit je 4-6 Gerichten.',
  },
  'cafe': {
    id: 'cafe', label: 'Spezialitäten-Café', industry: 'Gastronomie',
    schemaType: 'CafeOrCoffeeShop',
    extraFields: `"menuCategories": [{"name": "Kategorie", "items": [{"name": "Getränk/Gebäck", "description": "Beschreibung", "price": "4,50 €"}]}],
"openingHours": [{"days": "Mo-Fr", "hours": "07:30-18:00"}],
"baristaName": "Name", "baristaQuote": "Zitat über Kaffee"`,
    industryHints: 'Fachbegriffe: Single Origin, Pour-Over, V60, Flat White, Cortado, Latte Art, SCA-Barista. Erstelle 3-4 Menükategorien.',
  },
  'sushi': {
    id: 'sushi', label: 'Sushi-Restaurant', industry: 'Gastronomie',
    schemaType: 'Restaurant',
    extraFields: `"menuCategories": [{"name": "Kategorie", "items": [{"name": "Gericht", "description": "Beschreibung", "price": "16,80 €"}]}],
"openingHours": [{"days": "Di-So", "hours": "17:00-23:00"}],
"chefName": "Name", "chefRole": "Sushi-Meister"`,
    industryHints: 'Fachbegriffe: Omakase, Nigiri, Maki, Sashimi, Temaki, Edamame, Wagyu, Uni, Otoro. Minimalistisch-japanische Tonalität.',
  },
  // Floristik
  'wildblatt': {
    id: 'wildblatt', label: 'Slow Flower Floristik', industry: 'Floristik',
    schemaType: 'Florist',
    extraFields: `"occasions": [{"icon": "emoji", "title": "Anlass", "description": "Beschreibung"}],
"products": [{"name": "Produktname", "description": "Beschreibung", "price": "38 €", "badge": "optional: Bestseller/Neu/Saison"}],
"deliveryZones": [{"zone": "Gebiet", "time": "Lieferzeit", "price": "Preis oder Gratis"}],
"seasonalHighlight": {"title": "Saison-Titel", "description": "Beschreibung", "items": ["Blume1", "Blume2"]}`,
    industryHints: 'Fachbegriffe: Strauß binden, Brautstrauß, Tischschmuck, Ranunkel, Pfingstrose, Hortensie, Slow Flower, Saisonblume.',
  },
  'floristik-edel': {
    id: 'floristik-edel', label: 'Edel-Florist', industry: 'Floristik',
    schemaType: 'Florist',
    extraFields: `"occasions": [{"icon": "emoji", "title": "Anlass", "description": "Beschreibung"}],
"products": [{"name": "Produktname", "description": "Beschreibung", "price": "58 €", "badge": "optional"}],
"deliveryZones": [{"zone": "Gebiet", "time": "Lieferzeit", "price": "Preis"}]`,
    industryHints: 'Luxuriöse Tonalität mit Sie-Anrede. Brautstrauß, Trauergesteck, Event-Floristik.',
  },
  'floristik-bio': {
    id: 'floristik-bio', label: 'Bio-Markt Florist', industry: 'Floristik',
    schemaType: 'Florist',
    extraFields: `"occasions": [{"icon": "emoji", "title": "Anlass", "description": "Beschreibung"}],
"products": [{"name": "Produktname", "description": "Beschreibung", "price": "32 €", "badge": "optional"}]`,
    industryHints: 'Bio, Direkthandel, Saisonblumen, Gärtnerei, nachhaltig, regional.',
  },
  // Reinigung
  'reinigung-b2b': {
    id: 'reinigung-b2b', label: 'B2B-Büroreinigung', industry: 'Reinigung',
    schemaType: 'LocalBusiness',
    extraFields: `"certifications": ["DIN-EN-ISO 9001", "RAL Gütezeichen"],
"referenceProjects": [{"company": "Firmenname", "description": "Beschreibung", "quote": "Zitat"}]`,
    industryHints: 'Fachbegriffe: Unterhaltsreinigung, Grundreinigung, Glasreinigung, m²-Preis, Hygieneplan, DIN-Norm.',
  },
  'reinigung-privat': {
    id: 'reinigung-privat', label: 'Privat-Reinigung', industry: 'Reinigung',
    schemaType: 'HomeAndConstructionBusiness',
    extraFields: `"pricingTable": [{"service": "Leistung", "price": "ab 25 €/h", "includes": "Details"}]`,
    industryHints: 'Freundlich, Festpreise betonen, Fensterreinigung, Umzugsreinigung, Polsterreinigung.',
  },
  'reinigung-industrie': {
    id: 'reinigung-industrie', label: 'Industriereinigung', industry: 'Reinigung',
    schemaType: 'LocalBusiness',
    extraFields: `"referenceProjects": [{"title": "Projekt", "description": "Beschreibung"}]`,
    industryHints: 'Technisch-kompetent, 24h-Notdienst, Hallenreinigung, Hochdruck, DIN-ISO.',
  },
  // Friseur
  'friseur-damen': {
    id: 'friseur-damen', label: 'Damen-Salon Premium', industry: 'Friseur',
    schemaType: 'HairSalon',
    extraFields: `"serviceCategories": [{"name": "Kategorie", "items": [{"name": "Leistung", "price": "ab 45 €", "duration": "ca. 60 Min"}]}],
"team": [{"name": "Name", "role": "Rolle", "speciality": "Spezialisierung", "certifications": ["Zertifikat"]}],
"brands": ["Olaplex", "Kérastase"]`,
    industryHints: 'Fachbegriffe: Balayage, Ombré, Bond-Treatment, Glanzversiegelung, Trockenschnitt, Sassoon-Akademie.',
  },
  'friseur-unisex': {
    id: 'friseur-unisex', label: 'Unisex-Salon', industry: 'Friseur',
    schemaType: 'HairSalon',
    extraFields: `"serviceCategories": [{"name": "Damen/Herren/Kinder", "items": [{"name": "Leistung", "price": "ab 35 €"}]}],
"team": [{"name": "Name", "role": "Rolle", "speciality": "Spezialisierung"}],
"brands": ["K18", "Davines", "Goldwell"]`,
    industryHints: 'Modern, urban, genderneutral. Pixie-Cut, Bob, Balayage, Highlights.',
  },
  'friseur-barbershop': {
    id: 'friseur-barbershop', label: 'Barbershop', industry: 'Friseur',
    schemaType: 'BarberShop',
    extraFields: `"serviceCategories": [{"name": "Kategorie", "items": [{"name": "Leistung", "price": "25 €"}]}],
"team": [{"name": "Name", "role": "Barber", "speciality": "Spezialisierung"}]`,
    industryHints: 'Maskulin, Barbershop-Kultur. Fade, Skin-Fade, Taper, Hot-Towel Shave, Beard-Trim, Pomade.',
  },
  // Arzt
  'arzt-hausarzt': {
    id: 'arzt-hausarzt', label: 'Hausarzt', industry: 'Gesundheit',
    schemaType: 'MedicalBusiness',
    extraFields: `"openingHours": [{"days": "Mo-Fr", "hours": "08:00-12:00"}],
"team": [{"name": "Dr. med. Name", "role": "Facharzt für Allgemeinmedizin", "qualifications": ["Facharzt", "DMP"]}],
"insuranceInfo": "Kasse + Privat + IGeL"`,
    industryHints: 'Fachbegriffe: Anamnese, Diagnostik, Vorsorge, AU-Bescheinigung, DMP, IGeL, GOÄ, EBM.',
  },
  'arzt-zahnarzt': {
    id: 'arzt-zahnarzt', label: 'Zahnarzt', industry: 'Gesundheit',
    schemaType: 'Dentist',
    extraFields: `"technology": [{"name": "Cerec/DVT/Laser", "description": "Beschreibung"}],
"team": [{"name": "Dr. Name", "role": "Zahnarzt", "qualifications": ["Implantologie"]}]`,
    industryHints: 'Fachbegriffe: PZR, Bleaching, Veneer, Implantat, Endodontie, Cerec, DVT.',
  },
  'arzt-hautarzt': {
    id: 'arzt-hautarzt', label: 'Dermatologe', industry: 'Gesundheit',
    schemaType: 'MedicalBusiness',
    extraFields: `"treatmentSteps": [{"title": "Schritt", "description": "Beschreibung"}],
"team": [{"name": "Dr. Name", "role": "Facharzt für Dermatologie", "qualifications": ["Lasertherapie"]}]`,
    industryHints: 'Fachbegriffe: Dermatoskopie, Hautkrebsscreening, Hyaluron, Botox, Microneedling, Chemical Peeling.',
  },
  // Handwerk
  'gruenwerk': {
    id: 'gruenwerk', label: 'Garten & Landschaft', industry: 'Handwerk',
    schemaType: 'LocalBusiness',
    extraFields: `"uspItems": [{"title": "USP", "description": "Beschreibung", "highlight": "Kennzahl"}],
"workflowSteps": [{"title": "Schritt", "description": "Beschreibung"}]`,
    industryHints: 'Meisterbetrieb GaLaBau, Baumschule, Anwuchsgarantie, Pflanzplanung, Natursteinarbeiten.',
  },
  'handwerk-sanitaer': {
    id: 'handwerk-sanitaer', label: 'Sanitär & Heizung', industry: 'Handwerk',
    schemaType: 'Plumber',
    extraFields: `"pricingTable": [{"service": "Leistung", "price": "ab 89 €", "includes": "Details"}],
"emergencyPhone": "24h Notdienst-Nummer"`,
    industryHints: 'Fachbegriffe: Brennwerttechnik, Wärmepumpe, Solarthermie, Rohrbruch, Viessmann, Vaillant, Buderus.',
  },
  'handwerk-maler': {
    id: 'handwerk-maler', label: 'Maler & Lackierer', industry: 'Handwerk',
    schemaType: 'HousePainter',
    extraFields: `"referenceProjects": [{"title": "Projekt", "description": "Vorher/Nachher"}]`,
    industryHints: 'Fachbegriffe: Tapezieren, Streichen, Lasieren, Spachteln, Fassadenanstrich, Caparol, Brillux.',
  },
  'handwerk-elektriker': {
    id: 'handwerk-elektriker', label: 'Elektriker', industry: 'Handwerk',
    schemaType: 'Electrician',
    extraFields: `"technologyPartners": ["Hager", "Gira", "Jung"],
"emergencyPhone": "24h Notdienst-Nummer"`,
    industryHints: 'Fachbegriffe: Elektroinstallation, Smart-Home, KNX, Photovoltaik, Wallbox, FI-Schutzschalter.',
  },
  // Anwalt
  'anwalt-wirtschaft': {
    id: 'anwalt-wirtschaft', label: 'Wirtschaftskanzlei', industry: 'Recht',
    schemaType: 'Attorney',
    extraFields: `"team": [{"name": "Dr. Name, LL.M.", "role": "Fachanwalt für Arbeitsrecht", "specialities": ["Arbeitsrecht", "M&A"]}],
"honorarInfo": "Erstberatung 190€ inkl. MwSt."`,
    industryHints: 'Fachbegriffe: Mandant, Erstberatung, Klage, Widerspruch, RVG, Streitwert, Due Diligence, Fachanwalt.',
  },
  'anwalt-steuerberater': {
    id: 'anwalt-steuerberater', label: 'Steuerberater', industry: 'Recht',
    schemaType: 'AccountingService',
    extraFields: `"team": [{"name": "Name", "role": "Steuerberater", "specialities": ["GmbH-Beratung"]}],
"digitalTools": ["DATEV", "ELSTER"]`,
    industryHints: 'Fachbegriffe: Jahresabschluss, EÜR, USt-Voranmeldung, Lohnbuchhaltung, Betriebsprüfung, DATEV.',
  },
  'anwalt-familie': {
    id: 'anwalt-familie', label: 'Familienrecht', industry: 'Recht',
    schemaType: 'Attorney',
    extraFields: `"team": [{"name": "Name", "role": "Fachanwalt für Familienrecht"}]`,
    industryHints: 'Einfühlsam, diskret. Fachbegriffe: Zugewinnausgleich, Sorgerecht, Umgangsrecht, Trennungsjahr, Mediation.',
  },
  // Hotel
  'hotel-stadt': {
    id: 'hotel-stadt', label: 'Boutique-Stadthotel', industry: 'Hotel',
    schemaType: 'Hotel',
    extraFields: `"rooms": [{"name": "Zimmertyp", "description": "Beschreibung", "price": "ab 129 €", "features": ["WLAN", "Minibar"]}],
"highlights": [{"title": "Highlight", "description": "Beschreibung"}]`,
    industryHints: 'Fachbegriffe: Suite, Concierge, Room-Service, Check-in/out, Dehoga-Sterne.',
  },
  'hotel-land': {
    id: 'hotel-land', label: 'Landhotel', industry: 'Hotel',
    schemaType: 'Hotel',
    extraFields: `"rooms": [{"name": "Zimmertyp", "description": "Beschreibung", "price": "ab 89 €", "features": ["Bergblick"]}],
"highlights": [{"title": "Highlight", "description": "Beschreibung"}]`,
    industryHints: 'Gemütlich, alpin, Wellness, Wandern, Halbpension, Frühstücksbüffet.',
  },
  'hotel-nordsee': {
    id: 'hotel-nordsee', label: 'Design-Hotel Nordsee', industry: 'Hotel',
    schemaType: 'Hotel',
    extraFields: `"rooms": [{"name": "Zimmertyp", "description": "Beschreibung", "price": "ab 159 €", "features": ["Meerblick"]}],
"activities": [{"title": "Aktivität", "description": "Beschreibung"}]`,
    industryHints: 'Maritim, Thalasso, Spa, Strandkorb, Wattwandern, nordisch-minimalistisch.',
  },
  // Werkstatt
  'werkstatt-klassisch': {
    id: 'werkstatt-klassisch', label: 'Meisterwerkstatt', industry: 'KFZ',
    schemaType: 'AutoRepair',
    extraFields: `"pricingTable": [{"service": "Inspektion", "price": "ab 149 €", "includes": "Details"}]`,
    industryHints: 'Fachbegriffe: HU/AU, TÜV, Inspektion, Ölwechsel, Achsvermessung, OBD, KFZ-Meisterbetrieb.',
  },
  'werkstatt-bmw': {
    id: 'werkstatt-bmw', label: 'BMW-Spezialist', industry: 'KFZ',
    schemaType: 'AutoRepair',
    extraFields: `"specializations": [{"model": "3er/5er/M", "description": "Beschreibung"}],
"pricingTable": [{"service": "Leistung", "price": "ab 189 €"}]`,
    industryHints: 'Premium, BMW-Kultur, M-Serie, Oldtimer, technisch-exzellent.',
  },
  'werkstatt-eauto': {
    id: 'werkstatt-eauto', label: 'E-Auto-Werkstatt', industry: 'KFZ',
    schemaType: 'AutoRepair',
    extraFields: `"pricingTable": [{"service": "Leistung", "price": "ab 129 €"}],
"certifications": ["Tesla Approved", "VW ID Partner"]`,
    industryHints: 'Fachbegriffe: Hochvolt, Rekuperation, Batterie-Management, Wallbox, CCS.',
  },
  // Immobilien
  'immobilien-premium': {
    id: 'immobilien-premium', label: 'Premium-Makler', industry: 'Immobilien',
    schemaType: 'RealEstateAgent',
    extraFields: `"properties": [{"title": "Objekttitel", "location": "Stadtteil", "price": "450.000 €", "size": "85 m²", "rooms": 3}],
"team": [{"name": "Name", "role": "Geschäftsführer"}]`,
    industryHints: 'Fachbegriffe: Exposé, Marktwertgutachten, Energieausweis, IVD-Mitglied, Grundbuch, Notartermin.',
  },
  'immobilien-tech': {
    id: 'immobilien-tech', label: 'Tech-Makler', industry: 'Immobilien',
    schemaType: 'RealEstateAgent',
    extraFields: `"properties": [{"title": "Objekttitel", "location": "Stadtteil", "price": "350.000 €", "size": "75 m²", "rooms": 3}],
"processSteps": [{"title": "Schritt", "description": "Beschreibung"}]`,
    industryHints: 'Datenbasiert, 3D-Touren, transparent, modern.',
  },
  'immobilien-regional': {
    id: 'immobilien-regional', label: 'Regional-Makler', industry: 'Immobilien',
    schemaType: 'RealEstateAgent',
    extraFields: `"properties": [{"title": "Objekttitel", "location": "Stadtteil", "price": "280.000 €", "size": "90 m²", "rooms": 4}],
"regions": ["Stadtteil1", "Stadtteil2"]`,
    industryHints: 'Familiär, generationsübergreifend, regionale Expertise, Erbimmobilien.',
  },
  // Yoga
  'yoga-premium': {
    id: 'yoga-premium', label: 'Premium-Yoga', industry: 'Yoga',
    schemaType: 'SportsActivityLocation',
    extraFields: `"classes": [{"name": "Yoga-Stil", "description": "Beschreibung", "level": "Alle Level/Anfänger/Fortgeschritten"}],
"pricing": [{"name": "Tarif", "price": "18", "period": "/Klasse", "features": ["Feature"]}],
"teachers": [{"name": "Name", "role": "Yogalehrerin", "qualifications": ["RYT-500"]}]`,
    industryHints: 'Fachbegriffe: Asana, Vinyasa, Hatha, Yin, Pranayama, Savasana, RYT-200, RYT-500, BDY.',
  },
  'yoga-pilates': {
    id: 'yoga-pilates', label: 'Pilates-Studio', industry: 'Yoga',
    schemaType: 'SportsActivityLocation',
    extraFields: `"classes": [{"name": "Kursname", "description": "Beschreibung", "level": "Level"}],
"pricing": [{"name": "Tarif", "price": "25", "period": "/Klasse", "features": ["Feature"]}],
"teachers": [{"name": "Name", "role": "Pilates-Trainerin", "qualifications": ["Polestar-Diplom"]}]`,
    industryHints: 'Fachbegriffe: Reformer, Tower, Cadillac, Powerhouse, Neutral Spine, Polestar, BASI.',
  },
  'yoga-hot': {
    id: 'yoga-hot', label: 'Hot-Yoga', industry: 'Yoga',
    schemaType: 'SportsActivityLocation',
    extraFields: `"classes": [{"name": "Yoga-Stil", "description": "Beschreibung", "temperature": "38°C", "duration": "60 Min"}],
"pricing": [{"name": "Tarif", "price": "22", "period": "/Klasse", "features": ["Feature"]}]`,
    industryHints: 'Fachbegriffe: Bikram, Hot-Vinyasa, Inferno, 38°C, Detox, Infrarotwärme. Intensiv, transformativ.',
  },
  // Tattoo
  'tattoo-studio': {
    id: 'tattoo-studio', label: 'Tattoo-Studio', industry: 'Tattoo & Piercing',
    schemaType: 'TattooParlor',
    extraFields: `"styles": [{"name": "Stilname", "description": "Beschreibung des Stils", "icon": "needle|brush|star|skull"}],
"artists": [{"name": "Künstlername", "role": "Rolle", "specialties": ["Stil1", "Stil2"], "instagramHandle": "@handle", "quote": "Optionales Zitat"}],
"portfolioItems": [{"label": "Beschreibung des Tattoos", "artist": "Künstlername", "style": "Stilname"}],
"pricingInfo": [{"category": "Kategorie", "items": [{"name": "Leistung", "description": "Beschreibung", "price": "ab 80 €", "duration": "1-2 Stunden"}]}],
"bookingInfo": "Text über die Terminvereinbarung",
"bookingNote": "Hinweis für Kunden"`,
    industryHints: `Fachbegriffe: Realistic, Blackwork, Fine Line, Traditional, Neo-Traditional, Japanese/Irezumi, Watercolor, Dotwork, Geometric, Lettering, Cover-Up, Trash Polka, Chicano, Tribal, Minimalist. Erstelle 4-6 Stile, 2-4 Künstler mit Spezialisierungen, 6 Portfolio-Items. Tonalität: edgy aber professionell, künstlerisch, individuell.

WICHTIG FARBEN: Das Template hat ein DUNKLES Design. Die Farben MÜSSEN so aufgebaut sein:
- "primary": IMMER dunkel/schwarz (z.B. "#0a0a0a", "#0d0d0d") — das ist der Hintergrund!
- "accent": Die Akzentfarbe passend zum Studio-Stil (z.B. Rot, Pink, Gold, Türkis)
- "secondary": IMMER dunkler Grauton (z.B. "#1a1a1a", "#2a2a2a") — für Karten und Sections
- "text": IMMER helles Off-White (z.B. "#f0ece4", "#f5f0e8") — für den Text auf dunklem Hintergrund!
NIEMALS helle Hintergrundfarben oder dunkle Textfarben verwenden!`,
  },
}

export function getTemplateSchema(templateId: string): TemplateSchemaInfo | undefined {
  return TEMPLATE_SCHEMAS[templateId]
}
