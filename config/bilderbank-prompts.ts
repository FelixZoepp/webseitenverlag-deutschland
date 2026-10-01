/**
 * Bilderbank-Prompts: Vorab-generierte Bilder pro Branche.
 *
 * Jede Branche bekommt einen festen Satz Bilder die in Supabase Storage
 * unter asset-bank/branchen/{branche_key}/ liegen. Demo-Generation zieht
 * dann nur noch aus der Bank — keine Echtzeit-Generierung mehr.
 *
 * BILD-SLOTS pro Flagship-Seite:
 *   1. hero          — 1920×1080, 16:9, Hauptbild oben
 *   2. signature_vor — 1440×1080, 4:3, Vorher-Zustand
 *   3. signature_nach— 1440×1080, 4:3, Nachher-Zustand
 *   4-7. leistungen  — 1440×1080, 4:3, je 1 Bild pro Leistungskarte (4 Stück)
 *   8-9. ergebnisse  — 1920×1080, 16:9, Galerie/Referenzbilder (2 Stück)
 *   10.  lokal       — 1920×1080, 16:9, Firmenbild/Standort
 *
 * STIL-REGELN für alle Prompts:
 *   - Photorealistisch, professionelle Fotografie
 *   - KEINE Personen-Gesichter (Datenschutz)
 *   - KEIN Text, keine Logos, keine Wasserzeichen
 *   - Warme natürliche Beleuchtung, scharfer Fokus
 *   - Deutsche Umgebung (Architektur, Straßen, Schilder)
 */

export interface BranchenBilderSet {
  branche_key: string
  name: string
  meta_kategorie: string
  bilder: {
    slot: string
    breite: number
    hoehe: number
    prompt: string
    /** Anzahl Varianten die generiert werden (best-of) */
    varianten: number
  }[]
}

export const BRANCHEN_BILDER: BranchenBilderSet[] = [

  // ─────────────────────────────────────────────
  // HANDWERK & BAU
  // ─────────────────────────────────────────────

  {
    branche_key: 'maler',
    name: 'Maler & Lackierer',
    meta_kategorie: 'handwerk_bau',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Professional painter rolling fresh white paint on interior wall, German apartment renovation, warm natural window light, paint roller in motion with smooth wet paint surface, professional workwear, shallow depth of field, editorial photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Damaged interior wall with peeling paint, cracks, and water stains, old German apartment before renovation, natural daylight, documentary style photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Freshly painted pristine white interior wall, perfectly smooth surface, modern German apartment after renovation, warm natural light, clean and bright atmosphere, professional real estate photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Close-up of professional paint brushes and premium paint cans arranged on drop cloth, German craftsman tools, warm workshop lighting, product photography style, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Exterior facade of German house being painted, scaffolding with fresh paint section visible, sunny day, residential neighborhood, professional construction photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Decorative wall technique wallpaper being applied in elegant German living room, textured finish, warm interior lighting, interior design photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Wood floor being lacquered with clear coat, reflection of window light on wet varnish surface, German craftsmanship, macro detail photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Beautiful renovated German living room with freshly painted walls in modern grey-white tones, new baseboards, professional interior photography, bright and airy, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Freshly painted German house exterior facade in elegant cream white, clean lines, manicured garden in front, golden hour lighting, architectural photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Professional painter van parked in front of German residential house, company vehicle with painting equipment visible, sunny morning, authentic small business feel, 16:9 landscape' },
    ],
  },

  {
    branche_key: 'dachdecker',
    name: 'Dachdecker',
    meta_kategorie: 'handwerk_bau',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'German rooftop with new clay tiles being installed, hands placing red roof tiles in precise rows, blue sky background, professional roofing craftsmanship, aerial perspective, warm daylight, editorial photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Old damaged German roof with broken tiles, moss growth, missing shingles, weathered wooden beams visible, overcast sky, documentary photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Perfectly renovated German roof with new premium clay tiles, clean copper gutters, sharp ridge line, blue sky, professional architectural photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Flat roof waterproofing membrane being applied on German commercial building, professional tools and materials, daylight, construction photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'New copper rain gutter and downspout installation on German house facade, precision metalwork, clean lines, architectural detail photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Roof insulation being installed between wooden rafters, mineral wool visible, German attic renovation, interior construction photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Solar panels being mounted on German residential roof, mounting rails and panels, blue sky, professional installation photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Beautiful German house with brand new complete roof, red clay tiles, dormers, clean gutters, garden visible, golden hour, real estate photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern German flat roof with gravel finish and skylights, rooftop terrace, city skyline in background, architectural photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Roofing company workshop yard with stacked roof tiles, work trailer, German industrial area, morning light, authentic trade business photography, 16:9 landscape' },
    ],
  },

  {
    branche_key: 'galabau',
    name: 'Garten- & Landschaftsbau',
    meta_kategorie: 'handwerk_bau',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Beautifully designed German residential garden with stone pathway, lush green lawn, ornamental grasses, mature trees, warm golden hour lighting, professional landscape photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Neglected overgrown German backyard, weeds between old paving stones, unmowed lawn, bare soil patches, overcast light, documentary photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professionally landscaped German garden with clean stone terrace, trimmed hedges, green lawn, planted flower beds, warm sunlight, garden design photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Natural stone patio being laid in German garden, granite slabs in sand bed, precision craftsmanship, outdoor construction photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional hedge trimming in German residential garden, perfectly shaped boxwood hedge, green clippings, sunny day, gardening photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Modern garden pond with natural stone border, water plants, small waterfall feature, German garden setting, tranquil atmosphere, landscape photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Automatic irrigation system sprinkler heads watering green lawn, water spray pattern visible, morning light, German garden, technical photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Stunning German garden with outdoor lounge area, stone terrace, firepit, ornamental lighting at dusk, professional landscape architecture photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Front yard of German house with professionally designed entrance, pathway with border lighting, shaped shrubs, clean driveway, evening atmosphere, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Landscaping company truck with trailer full of plants and tools, parked at German residential jobsite, morning light, authentic small business, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // REINIGUNG & FACILITY
  // ─────────────────────────────────────────────

  {
    branche_key: 'reinigung',
    name: 'Gebäudereinigung',
    meta_kategorie: 'reinigung_facility',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Sparkling clean modern German office lobby with polished marble floor, reflections visible, glass walls, professional cleaning just completed, bright daylight, commercial interior photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Dirty office floor with scuff marks, dust, coffee stains, before professional cleaning, German office building, harsh fluorescent light, documentary photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Spotless polished office floor reflecting ceiling lights, after professional cleaning, German office building, pristine condition, commercial photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional window cleaning on German office building, squeegee on large glass surface with water running, close-up detail, daylight, service photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Industrial floor cleaning machine on German warehouse floor, wet cleaning path visible, professional facility maintenance, industrial photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional staircase cleaning in German apartment building, freshly mopped stone stairs, cleaning equipment visible, natural window light, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Clean modern German office kitchen and break room, spotless countertops, organized supplies, bright lighting, commercial interior photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Pristine German conference room after professional deep cleaning, glass table reflecting lights, clean carpet, modern furniture, commercial photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Clean German retail storefront with sparkling display windows, swept sidewalk, inviting entrance, morning light, commercial photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Professional cleaning company van with equipment, parked at German commercial building entrance, organized supplies visible, morning, business photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // GASTRO & GENUSS
  // ─────────────────────────────────────────────

  {
    branche_key: 'restaurant_italienisch',
    name: 'Restaurant (italienisch)',
    meta_kategorie: 'gastro_genuss',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Elegant Italian restaurant interior in Germany, warm candlelight, rustic wooden tables set with white napkins, wine glasses, exposed brick wall, olive branches in vases, intimate atmosphere, food photography lighting, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Empty elegant restaurant table with clean white tablecloth, wine glasses upside down, folded napkins, waiting for guests, warm ambient light, hospitality photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Beautifully set Italian restaurant table with antipasti platter, wine being poured, candlelight, bread basket, olive oil, warm intimate atmosphere, food photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Fresh handmade pasta on marble surface, flour dusting, Italian cuisine preparation, rustic kitchen setting, warm lighting, food photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Wood-fired pizza fresh from oven, bubbling mozzarella, charred crust, Italian restaurant kitchen, warm fire glow, food photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Italian wine selection displayed on rustic wooden shelf, red and white bottles, wine glasses, warm restaurant ambiance, beverage photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Elegant tiramisu dessert plated on white dish, cocoa dusting, mint leaf garnish, Italian restaurant setting, food photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Full Italian restaurant scene at dinner time, all tables occupied but no visible faces, warm lighting, rustic elegant decor, atmospheric photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Italian restaurant outdoor terrace in German city, string lights, Mediterranean plants, evening atmosphere, cobblestone, lifestyle photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Charming Italian restaurant facade on German street, warm light from windows, menu board outside, evening atmosphere, architectural photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // BEAUTY & WELLNESS
  // ─────────────────────────────────────────────

  {
    branche_key: 'friseur',
    name: 'Friseursalon',
    meta_kategorie: 'beauty_wellness',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Elegant modern hair salon interior in Germany, styling chairs with mirrors, warm lighting, professional scissors and tools on counter, fresh flowers, clean minimalist design, no people, interior photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Hair styling tools laid out before appointment, brushes comb scissors on clean white surface, professional salon setting, product photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Beautiful freshly styled hair result draped over salon chair, glossy healthy hair, warm salon lighting, beauty photography, no face visible, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional hair color mixing bowls and brushes, premium hair dye products, salon workstation, warm lighting, beauty product photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Hair washing station in modern German salon, massage showerhead, premium shampoo bottles, relaxing atmosphere, interior photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional beard grooming tools on barber station, straight razor, brush, premium oils, masculine elegant setting, product photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Bridal hair accessories and styling tools arranged on vanity table, flowers, hair pins, elegant setting, wedding preparation photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Beautiful modern German hair salon full interior view, multiple styling stations, large mirrors, warm lighting, fresh design, commercial interior photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Premium hair care products displayed on salon shelf, branded bottles, warm backlight, luxury salon atmosphere, retail display photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern hair salon storefront on German shopping street, clean signage area, large windows showing elegant interior, daytime, architectural photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // GESUNDHEIT & PRAXIS
  // ─────────────────────────────────────────────

  {
    branche_key: 'physiotherapie',
    name: 'Physiotherapie',
    meta_kategorie: 'gesundheit_praxis',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Modern physiotherapy practice treatment room in Germany, massage table with fresh towels, exercise equipment, bright natural light from large windows, clean medical environment, healthcare photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Person holding lower back in discomfort, only torso and hands visible no face, neutral clothing, clinical white background, healthcare stock photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Person stretching freely, arms reaching up, only torso visible no face, bright activewear, outdoor park setting with sunshine, wellness photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional massage therapy table with hot stones and essential oils, clean white towels, calming treatment room, spa-like medical setting, healthcare photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Modern gym rehabilitation area with resistance bands, exercise balls, balance boards, bright physiotherapy clinic, medical fitness photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Kinesiology tape rolls in multiple colors on treatment table, therapeutic tools, clinical setting, medical product photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Hydrotherapy pool in German physiotherapy clinic, blue water, handrails, modern medical facility, clean architectural photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern German physiotherapy clinic waiting area, comfortable seating, plants, natural light, clean medical interior, healthcare architecture photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Physiotherapy exercise room with parallel bars, treatment mats, wall mirrors, bright clinical environment, professional medical photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern physiotherapy practice exterior in German medical building, ground floor with large windows, accessible entrance, professional signage area, daytime, architectural photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // AUTO & MOBILITÄT
  // ─────────────────────────────────────────────

  {
    branche_key: 'kfz_werkstatt',
    name: 'KFZ-Werkstatt',
    meta_kategorie: 'auto_mobilitaet',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Professional German auto repair workshop, car on hydraulic lift, organized tool walls, bright LED overhead lighting, clean concrete floor, automotive service photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Car engine bay with visible wear, dirty components, oil residue, automotive repair before service, workshop lighting, technical photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Clean serviced car engine bay, new parts visible, organized components, professional automotive service completed, bright workshop light, technical photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Car brake disc and caliper close-up during service, professional mechanic tools, clean workshop environment, automotive detail photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Car diagnostic computer connected to vehicle OBD port, digital readout on screen, modern German auto workshop, technical photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional tire mounting machine with alloy wheel, German auto workshop, seasonal tire change service, automotive service photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Car AC system service with professional refrigerant machine, climate control maintenance, German auto workshop, technical photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern German auto workshop full view, multiple service bays, cars on lifts, organized professional environment, commercial photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Freshly serviced car being lowered from lift in German workshop, clean vehicle, professional service complete, automotive photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'German auto repair shop exterior with open garage doors, workshop visible inside, cars parked outside, commercial zone, business photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // FITNESS & COACHING
  // ─────────────────────────────────────────────

  {
    branche_key: 'fitnessstudio',
    name: 'Fitnessstudio',
    meta_kategorie: 'fitness_coaching',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Modern German fitness gym interior, rows of strength training machines and free weights, mirrors, rubber floor, dramatic LED lighting, empty gym ready for workout, sports facility photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Empty gym bench with towel and water bottle, before workout scene, clean equipment, motivational atmosphere, fitness photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Gym equipment after intense workout, dumbbells racked, sweat towel on bench, protein shaker, achievement atmosphere, fitness photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional weight training area with barbells, squat rack, bumper plates, rubber floor, mirror wall, modern gym, fitness photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Group fitness studio room with wooden floor, mirrors, exercise mats laid out, sound system, bright lighting, empty class ready, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Cardio area with treadmills and rowing machines, screens showing data, modern gym, city view from windows, fitness facility photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Functional training area with kettlebells, battle ropes, TRX suspension trainers, CrossFit style setup, industrial gym design, fitness photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern gym lounge area with protein bar, comfortable seating, motivational wall design, clean locker room entrance visible, lifestyle photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Gym wellness area with sauna entrance, relaxation zone, towels and water, post-workout recovery space, warm lighting, facility photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Modern fitness studio exterior in German commercial area, large glass front showing gym equipment inside, signage area, evening with interior lights on, architectural photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // DIENSTLEISTUNG & BERATUNG
  // ─────────────────────────────────────────────

  {
    branche_key: 'umzugsunternehmen',
    name: 'Umzugsunternehmen',
    meta_kategorie: 'dienstleistung_beratung',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Professional moving truck open at back, neatly stacked moving boxes and furniture inside, German residential street, sunny day, logistics photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Room full of unpacked moving boxes, disassembled furniture, chaotic moving day scene, German apartment, natural light, documentary photography, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Beautifully organized German living room after move, all furniture placed, boxes gone, fresh flowers on table, clean and settled atmosphere, interior photography, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional moving blankets wrapping furniture, careful packing of antique dresser, German apartment, moving service photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Moving boxes with labeling system, packing tape, bubble wrap, organized packing station, professional moving supplies, product photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Furniture being carefully carried through German apartment stairwell, moving dolly, protective floor covering, professional moving service, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Clean storage unit with neatly organized furniture and boxes, climate controlled, labeled shelving, professional storage facility, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Happy home with last moving box being unpacked, new German apartment fully furnished, warm evening light, lifestyle photography, no faces, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Fleet of professional moving trucks in company yard, clean branded vehicles, German logistics base, morning light, commercial photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Moving company office and warehouse entrance, reception area visible, moving truck parked outside, German commercial area, business photography, 16:9 landscape' },
    ],
  },

  // ─────────────────────────────────────────────
  // PFLEGE
  // ─────────────────────────────────────────────

  {
    branche_key: 'pflegedienst',
    name: 'Ambulanter Pflegedienst',
    meta_kategorie: 'gesundheit_praxis',
    bilder: [
      { slot: 'hero', breite: 1920, hoehe: 1080, varianten: 3, prompt: 'Warm cozy German senior living room, comfortable armchair by window, cup of tea on side table, reading glasses, warm afternoon light, soft caring atmosphere, no person visible, healthcare lifestyle photography, 16:9 landscape' },
      { slot: 'signature_vor', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Elderly hands resting on walking aid handle, close-up showing need for care, warm indoor lighting, empathetic healthcare photography, no face, 4:3 format' },
      { slot: 'signature_nach', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Elderly hands holding fresh flowers arrangement, close-up showing vitality and care, warm sunlight, positive healthcare photography, no face, 4:3 format' },
      { slot: 'leistung_1', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Professional nursing care bag with medical supplies, blood pressure monitor, medication organizer, clean organized equipment, healthcare product photography, 4:3 format' },
      { slot: 'leistung_2', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Clean organized medication weekly planner box, pills sorted by day, water glass, German home care setting, medical photography, 4:3 format' },
      { slot: 'leistung_3', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Comfortable home care bed with adjustable positions, fresh linens, bedside table with essentials, warm German bedroom, care facility photography, 4:3 format' },
      { slot: 'leistung_4', breite: 1440, hoehe: 1080, varianten: 2, prompt: 'Fresh healthy meal on tray for home care patient, balanced nutrition, warm soup, bread, fruit, German home kitchen, food photography, 4:3 format' },
      { slot: 'ergebnis_1', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Bright welcoming German home care living space, adapted for elderly comfort, grab bars, comfortable furniture, warm natural light, interior photography, 16:9 landscape' },
      { slot: 'ergebnis_2', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Beautiful German garden seen through window, accessible terrace with seating, flowers, peaceful retirement setting, lifestyle photography, 16:9 landscape' },
      { slot: 'lokal', breite: 1920, hoehe: 1080, varianten: 2, prompt: 'Home care service vehicle parked in German residential neighborhood, clean professional car with care equipment visible, friendly morning light, 16:9 landscape' },
    ],
  },
]

/**
 * Supabase Storage-Pfad: asset-bank/branchen/{branche_key}/{slot}_{variante}.webp
 * Beispiel: asset-bank/branchen/maler/hero_1.webp, asset-bank/branchen/maler/hero_2.webp
 */
export function storagePfad(brancheKey: string, slot: string, variante: number): string {
  return `branchen/${brancheKey}/${slot}_${variante}.webp`
}

/** Öffentliche URL für ein Bank-Bild */
export function bankBildUrl(brancheKey: string, slot: string, variante = 1): string {
  return `https://objeupustvkaayxvedog.supabase.co/storage/v1/object/public/asset-bank/${storagePfad(brancheKey, slot, variante)}`
}

/** Alle Slots die eine Branche braucht */
export function alleSlotsVonBranche(brancheKey: string): string[] {
  const set = BRANCHEN_BILDER.find(b => b.branche_key === brancheKey)
  return set ? set.bilder.map(b => b.slot) : []
}

/** Gesamtanzahl zu generierende Bilder über alle Branchen */
export function gesamtBilderAnzahl(): number {
  return BRANCHEN_BILDER.reduce((sum, b) => sum + b.bilder.reduce((s, img) => s + img.varianten, 0), 0)
}
