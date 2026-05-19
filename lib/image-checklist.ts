// ============================================================
// Bild-Checkliste pro Template-Kategorie
// Definiert welche Bilder für jedes Template benötigt werden
// ============================================================

export interface ImageSlot {
  id: string
  label: string
  description: string
  required: boolean
  category: 'hero' | 'team' | 'gallery' | 'logo' | 'project' | 'other'
  targetField: string    // JSON-Pfad in der Config, z.B. 'heroImageUrl'
  aspectRatio?: string   // z.B. '16:9', '1:1', '3:4'
  minWidth?: number
}

// ============================================================
// Branchen-spezifische Checklisten
// ============================================================

const FRISEUR_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Salonansicht von innen oder außen, einladend und professionell', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Inhaber/in-Foto', description: 'Porträtfoto des/der Inhabers/Inhaberin', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team-1', label: 'Stylist/in 1', description: 'Porträtfoto (Brustbild, lächelnd, professionell)', required: false, category: 'team', targetField: 'stylists.0.imageUrl', aspectRatio: '1:1' },
  { id: 'team-2', label: 'Stylist/in 2', description: 'Porträtfoto (Brustbild, lächelnd, professionell)', required: false, category: 'team', targetField: 'stylists.1.imageUrl', aspectRatio: '1:1' },
  { id: 'team-3', label: 'Stylist/in 3', description: 'Porträtfoto (Brustbild, lächelnd, professionell)', required: false, category: 'team', targetField: 'stylists.2.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-1', label: 'Galerie: Frisur 1', description: 'Vorher/Nachher oder fertige Frisur', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-2', label: 'Galerie: Frisur 2', description: 'Vorher/Nachher oder fertige Frisur', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-3', label: 'Galerie: Frisur 3', description: 'Vorher/Nachher oder fertige Frisur', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-4', label: 'Galerie: Frisur 4', description: 'Vorher/Nachher oder fertige Frisur', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-5', label: 'Galerie: Salon-Impression', description: 'Arbeitsplatz, Waschbereich, Details', required: false, category: 'gallery', targetField: 'galleryItems.4.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-6', label: 'Galerie: Salon-Impression 2', description: 'Empfangsbereich, Wartebereich, Produkte', required: false, category: 'gallery', targetField: 'galleryItems.5.imageUrl', aspectRatio: '1:1' },
]

const RESTAURANT_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Restaurant-Innenraum, Terrasse oder Signature-Gericht', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'chef', label: 'Koch/Küchenchef-Foto', description: 'Porträt in der Küche oder mit Gericht', required: false, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'gallery-1', label: 'Galerie: Gericht 1', description: 'Foto eines Hauptgerichts (von oben oder seitlich)', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-2', label: 'Galerie: Gericht 2', description: 'Foto eines Hauptgerichts', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-3', label: 'Galerie: Gericht 3', description: 'Foto eines Gerichts oder Desserts', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-4', label: 'Galerie: Gericht 4', description: 'Foto eines Gerichts oder Getränks', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-5', label: 'Galerie: Innenraum', description: 'Atmosphäre im Restaurant, Tischgedeck', required: false, category: 'gallery', targetField: 'galleryItems.4.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-6', label: 'Galerie: Küche/Bar', description: 'Offene Küche, Bar oder Weinselektion', required: false, category: 'gallery', targetField: 'galleryItems.5.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-7', label: 'Galerie: Außenbereich', description: 'Terrasse, Fassade oder Eingangsbereich', required: false, category: 'gallery', targetField: 'galleryItems.6.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-8', label: 'Galerie: Detail', description: 'Tisch-Dekoration, Zutaten, Küchen-Detail', required: false, category: 'gallery', targetField: 'galleryItems.7.imageUrl', aspectRatio: '1:1' },
]

const HANDWERK_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Team bei der Arbeit oder fertiges Projekt', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Inhaber-Foto', description: 'Meister/Inhaber in Arbeitskleidung', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team', label: 'Team-Foto', description: 'Das gesamte Team (Gruppenfoto)', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '16:9' },
  { id: 'project-1', label: 'Referenz-Projekt 1', description: 'Fertiges Projekt (Vorher/Nachher ideal)', required: false, category: 'project', targetField: 'projects.0.imageUrl', aspectRatio: '16:9' },
  { id: 'project-2', label: 'Referenz-Projekt 2', description: 'Fertiges Projekt', required: false, category: 'project', targetField: 'projects.1.imageUrl', aspectRatio: '16:9' },
  { id: 'project-3', label: 'Referenz-Projekt 3', description: 'Fertiges Projekt', required: false, category: 'project', targetField: 'projects.2.imageUrl', aspectRatio: '16:9' },
  { id: 'project-4', label: 'Referenz-Projekt 4', description: 'Fertiges Projekt oder Arbeits-Impression', required: false, category: 'project', targetField: 'projects.3.imageUrl', aspectRatio: '16:9' },
  { id: 'project-5', label: 'Referenz-Projekt 5', description: 'Fertiges Projekt oder Arbeits-Impression', required: false, category: 'project', targetField: 'projects.4.imageUrl', aspectRatio: '16:9' },
  { id: 'fahrzeug', label: 'Firmenfahrzeug', description: 'Firmenwagen mit Beschriftung (optional)', required: false, category: 'other', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
]

const ARZT_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Praxis-Eingangsbereich oder Empfang', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'arzt', label: 'Arzt/Ärztin-Foto', description: 'Professionelles Porträtfoto (Kittel, freundlich)', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team-1', label: 'Team-Mitglied 1', description: 'MFA oder Kolleg/in (Porträt)', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '1:1' },
  { id: 'team-2', label: 'Team-Mitglied 2', description: 'MFA oder Kolleg/in (Porträt)', required: false, category: 'team', targetField: 'team.1.imageUrl', aspectRatio: '1:1' },
  { id: 'team-3', label: 'Team-Mitglied 3', description: 'MFA oder Kolleg/in (Porträt)', required: false, category: 'team', targetField: 'team.2.imageUrl', aspectRatio: '1:1' },
  { id: 'praxis-1', label: 'Praxis: Behandlungsraum', description: 'Moderner, sauberer Behandlungsraum', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'praxis-2', label: 'Praxis: Wartebereich', description: 'Einladender Wartebereich', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'praxis-3', label: 'Praxis: Außenansicht', description: 'Gebäude oder Praxis-Schild', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
]

const HOTEL_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Hotel-Außenansicht oder beeindruckende Lobby', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'gallery-1', label: 'Zimmer: Standard', description: 'Standard-Zimmer (bestes Foto)', required: true, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Zimmer: Superior/Suite', description: 'Höhere Zimmerkategorie', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Badezimmer', description: 'Modernes Badezimmer', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-4', label: 'Lobby/Empfang', description: 'Eingangsbereich, Rezeption', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-5', label: 'Restaurant/Frühstück', description: 'Frühstücksraum oder Restaurant', required: false, category: 'gallery', targetField: 'galleryItems.4.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-6', label: 'Wellness/Pool', description: 'Spa, Pool oder Sauna', required: false, category: 'gallery', targetField: 'galleryItems.5.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-7', label: 'Außenbereich', description: 'Garten, Terrasse oder Umgebung', required: false, category: 'gallery', targetField: 'galleryItems.6.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-8', label: 'Detail-Aufnahme', description: 'Dekoration, Blumen, Amenities', required: false, category: 'gallery', targetField: 'galleryItems.7.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-9', label: 'Umgebung', description: 'Aussicht, Strand, Stadt, Natur', required: false, category: 'gallery', targetField: 'galleryItems.8.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-10', label: 'Veranstaltung/Tagung', description: 'Tagungsraum oder Event-Setup', required: false, category: 'gallery', targetField: 'galleryItems.9.imageUrl', aspectRatio: '16:9' },
]

const FITNESS_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Studio-Innenansicht mit Geräten oder Training', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'trainer-1', label: 'Trainer/in 1', description: 'Porträtfoto (sportlich, professionell)', required: false, category: 'team', targetField: 'trainers.0.imageUrl', aspectRatio: '1:1' },
  { id: 'trainer-2', label: 'Trainer/in 2', description: 'Porträtfoto', required: false, category: 'team', targetField: 'trainers.1.imageUrl', aspectRatio: '1:1' },
  { id: 'trainer-3', label: 'Trainer/in 3', description: 'Porträtfoto', required: false, category: 'team', targetField: 'trainers.2.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-1', label: 'Galerie: Trainingsbereich', description: 'Gerätepark oder Functional Area', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Galerie: Kursraum', description: 'Gruppentraining oder Kursraum', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Galerie: Umkleide/Wellness', description: 'Sanitärbereich oder Sauna', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-4', label: 'Galerie: Außenansicht', description: 'Studiogebäude oder Eingang', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '16:9' },
]

const RECHT_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Kanzlei-Eingang, Besprechungsraum oder Büro', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'anwalt', label: 'Anwalt/Steuerberater-Foto', description: 'Professionelles Porträt (Business-Kleidung)', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team-1', label: 'Partner/Kolleg/in 1', description: 'Porträtfoto', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '1:1' },
  { id: 'team-2', label: 'Partner/Kolleg/in 2', description: 'Porträtfoto', required: false, category: 'team', targetField: 'team.1.imageUrl', aspectRatio: '1:1' },
  { id: 'kanzlei', label: 'Kanzlei-Impression', description: 'Besprechungsraum, Bibliothek oder Büro', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
]

const FLORISTIK_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Laden-Innenansicht oder Blumenarrangement', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Florist/in-Foto', description: 'Porträt mit Blumen oder bei der Arbeit', required: false, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'gallery-1', label: 'Galerie: Strauß 1', description: 'Blumenstrauß oder Arrangement', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-2', label: 'Galerie: Strauß 2', description: 'Blumenstrauß oder Arrangement', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-3', label: 'Galerie: Strauß 3', description: 'Blumenstrauß oder Arrangement', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-4', label: 'Galerie: Laden', description: 'Ladenansicht oder Schaufenster', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-5', label: 'Galerie: Hochzeit/Event', description: 'Floristik für Event oder Hochzeit', required: false, category: 'gallery', targetField: 'galleryItems.4.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-6', label: 'Galerie: Detail', description: 'Nahaufnahme Blüten, Werkzeug, Verpackung', required: false, category: 'gallery', targetField: 'galleryItems.5.imageUrl', aspectRatio: '1:1' },
]

const REINIGUNG_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Team bei der Arbeit oder sauberes Ergebnis', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Inhaber-Foto', description: 'Porträt in Firmenkleidung', required: false, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team', label: 'Team-Foto', description: 'Gruppenfoto des Teams', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '16:9' },
  { id: 'project-1', label: 'Referenz: Ergebnis 1', description: 'Vorher/Nachher oder sauberes Objekt', required: false, category: 'project', targetField: 'projects.0.imageUrl', aspectRatio: '16:9' },
  { id: 'project-2', label: 'Referenz: Ergebnis 2', description: 'Vorher/Nachher oder sauberes Objekt', required: false, category: 'project', targetField: 'projects.1.imageUrl', aspectRatio: '16:9' },
  { id: 'fahrzeug', label: 'Firmenfahrzeug', description: 'Firmenwagen mit Beschriftung', required: false, category: 'other', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
]

const WERKSTATT_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Werkstatt-Halle oder Team an einem Fahrzeug', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Meister/Inhaber-Foto', description: 'Porträt in Werkstattkleidung', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team', label: 'Team-Foto', description: 'Gruppenfoto aller Mitarbeiter', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-1', label: 'Galerie: Werkstatt', description: 'Hebebühne, Arbeitsbereich, Diagnose', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Galerie: Empfang', description: 'Kundenannahme oder Wartebereich', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Galerie: Außenansicht', description: 'Gebäude, Hof oder Schild', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
]

const YOGA_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Studio-Raum mit Matten oder Yoga-Pose', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'teacher', label: 'Yogalehrer/in-Foto', description: 'Porträt oder in Yoga-Pose', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'trainer-1', label: 'Lehrer/in 2', description: 'Weiterer Lehrer/weitere Lehrerin', required: false, category: 'team', targetField: 'trainers.0.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-1', label: 'Galerie: Kursraum', description: 'Studioraum (leer oder mit Schülern)', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Galerie: Kurs-Impression', description: 'Gruppenunterricht oder Workshop', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Galerie: Detail', description: 'Kerzen, Matten, Tee, Lounge', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '1:1' },
]

const IMMOBILIEN_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Bürofassade oder Premium-Immobilie', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'makler', label: 'Makler/in-Foto', description: 'Business-Porträt (Anzug/Blazer)', required: true, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team-1', label: 'Team-Mitglied 1', description: 'Kolleg/in Porträt', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '1:1' },
  { id: 'gallery-1', label: 'Galerie: Objekt 1', description: 'Referenzobjekt (Außenansicht)', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Galerie: Objekt 2', description: 'Referenzobjekt (Innenansicht)', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Galerie: Objekt 3', description: 'Referenzobjekt', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
  { id: 'buero', label: 'Büro-Foto', description: 'Büro oder Besprechungsraum', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '16:9' },
]

const TATTOO_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Studio-Innenansicht, Künstler bei der Arbeit oder beeindruckendes Tattoo', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'artist-1', label: 'Künstler/in 1', description: 'Porträtfoto oder bei der Arbeit (am besten beim Tätowieren)', required: true, category: 'team', targetField: 'artists.0.imageUrl', aspectRatio: '4:3' },
  { id: 'artist-2', label: 'Künstler/in 2', description: 'Porträtfoto oder bei der Arbeit', required: false, category: 'team', targetField: 'artists.1.imageUrl', aspectRatio: '4:3' },
  { id: 'artist-3', label: 'Künstler/in 3', description: 'Porträtfoto oder bei der Arbeit', required: false, category: 'team', targetField: 'artists.2.imageUrl', aspectRatio: '4:3' },
  { id: 'portfolio-1', label: 'Portfolio: Tattoo 1', description: 'Fertiges Tattoo (gut ausgeleuchtet, nah)', required: true, category: 'gallery', targetField: 'portfolioItems.0.imageUrl', aspectRatio: '1:1' },
  { id: 'portfolio-2', label: 'Portfolio: Tattoo 2', description: 'Fertiges Tattoo', required: true, category: 'gallery', targetField: 'portfolioItems.1.imageUrl', aspectRatio: '1:1' },
  { id: 'portfolio-3', label: 'Portfolio: Tattoo 3', description: 'Fertiges Tattoo', required: false, category: 'gallery', targetField: 'portfolioItems.2.imageUrl', aspectRatio: '1:1' },
  { id: 'portfolio-4', label: 'Portfolio: Tattoo 4', description: 'Fertiges Tattoo', required: false, category: 'gallery', targetField: 'portfolioItems.3.imageUrl', aspectRatio: '1:1' },
  { id: 'portfolio-5', label: 'Portfolio: Tattoo 5', description: 'Fertiges Tattoo oder Work-in-Progress', required: false, category: 'gallery', targetField: 'portfolioItems.4.imageUrl', aspectRatio: '1:1' },
  { id: 'portfolio-6', label: 'Portfolio: Tattoo 6', description: 'Fertiges Tattoo oder Work-in-Progress', required: false, category: 'gallery', targetField: 'portfolioItems.5.imageUrl', aspectRatio: '1:1' },
  { id: 'studio', label: 'Studio-Innenansicht', description: 'Arbeitsplätze, Empfang oder Wartebereich', required: false, category: 'other', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
]

// Generischer Fallback
const DEFAULT_SLOTS: ImageSlot[] = [
  { id: 'hero', label: 'Hero-Bild', description: 'Hauptbild für den oberen Bereich der Webseite', required: true, category: 'hero', targetField: 'heroImageUrl', aspectRatio: '16:9', minWidth: 1400 },
  { id: 'owner', label: 'Inhaber-Foto', description: 'Porträtfoto des Inhabers/der Inhaberin', required: false, category: 'team', targetField: 'ownerImageUrl', aspectRatio: '3:4' },
  { id: 'team', label: 'Team-Foto', description: 'Gruppenfoto oder einzelne Mitarbeiter', required: false, category: 'team', targetField: 'team.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-1', label: 'Galerie: Bild 1', description: 'Impression von Ihrem Unternehmen', required: false, category: 'gallery', targetField: 'galleryItems.0.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-2', label: 'Galerie: Bild 2', description: 'Impression von Ihrem Unternehmen', required: false, category: 'gallery', targetField: 'galleryItems.1.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-3', label: 'Galerie: Bild 3', description: 'Impression von Ihrem Unternehmen', required: false, category: 'gallery', targetField: 'galleryItems.2.imageUrl', aspectRatio: '16:9' },
  { id: 'gallery-4', label: 'Galerie: Bild 4', description: 'Impression von Ihrem Unternehmen', required: false, category: 'gallery', targetField: 'galleryItems.3.imageUrl', aspectRatio: '16:9' },
]

// ============================================================
// Template → Branchen-Mapping
// ============================================================

const TEMPLATE_INDUSTRY_MAP: Record<string, ImageSlot[]> = {
  // Friseur
  'friseur-damen': FRISEUR_SLOTS,
  'friseur-unisex': FRISEUR_SLOTS,
  'friseur-barbershop': FRISEUR_SLOTS,
  // Restaurant
  'trattoria': RESTAURANT_SLOTS,
  'cafe': RESTAURANT_SLOTS,
  'sushi': RESTAURANT_SLOTS,
  // Handwerk
  'gruenwerk': HANDWERK_SLOTS,
  'handwerk-sanitaer': HANDWERK_SLOTS,
  'handwerk-maler': HANDWERK_SLOTS,
  'handwerk-elektriker': HANDWERK_SLOTS,
  // Arzt
  'arzt-hausarzt': ARZT_SLOTS,
  'arzt-zahnarzt': ARZT_SLOTS,
  'arzt-hautarzt': ARZT_SLOTS,
  // Hotel
  'hotel-stadt': HOTEL_SLOTS,
  'hotel-land': HOTEL_SLOTS,
  'hotel-nordsee': HOTEL_SLOTS,
  // Fitness
  'eisenwerk': FITNESS_SLOTS,
  'fitness-boutique': FITNESS_SLOTS,
  'fitness-frauen': FITNESS_SLOTS,
  // Recht
  'anwalt-wirtschaft': RECHT_SLOTS,
  'anwalt-steuerberater': RECHT_SLOTS,
  'anwalt-familie': RECHT_SLOTS,
  // Floristik
  'wildblatt': FLORISTIK_SLOTS,
  'floristik-edel': FLORISTIK_SLOTS,
  'floristik-bio': FLORISTIK_SLOTS,
  // Reinigung
  'reinigung-b2b': REINIGUNG_SLOTS,
  'reinigung-privat': REINIGUNG_SLOTS,
  'reinigung-industrie': REINIGUNG_SLOTS,
  // KFZ
  'werkstatt-bmw': WERKSTATT_SLOTS,
  'werkstatt-klassisch': WERKSTATT_SLOTS,
  'werkstatt-eauto': WERKSTATT_SLOTS,
  // Yoga
  'yoga-pilates': YOGA_SLOTS,
  'yoga-premium': YOGA_SLOTS,
  'yoga-hot': YOGA_SLOTS,
  // Immobilien
  'immobilien-premium': IMMOBILIEN_SLOTS,
  'immobilien-tech': IMMOBILIEN_SLOTS,
  'immobilien-regional': IMMOBILIEN_SLOTS,
  // Tattoo
  'tattoo-studio': TATTOO_SLOTS,
}

export function getImageChecklist(templateId: string): ImageSlot[] {
  return TEMPLATE_INDUSTRY_MAP[templateId] || DEFAULT_SLOTS
}

export function getRequiredSlots(templateId: string): ImageSlot[] {
  return getImageChecklist(templateId).filter((s) => s.required)
}

export function getSlotById(templateId: string, slotId: string): ImageSlot | undefined {
  return getImageChecklist(templateId).find((s) => s.id === slotId)
}
