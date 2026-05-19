import { SiteConfig } from '@/types'

export interface TemplateInfo {
  id: string
  name: string
  description: string
  industry: string
  preview?: string
}

export const AVAILABLE_TEMPLATES: TemplateInfo[] = [
  { id: 'handwerker', name: 'Handwerker & Service', description: 'Für Handwerksbetriebe, Hausmeister, Gartenbau, Reinigung', industry: 'Handwerk' },
  { id: 'restaurant', name: 'Restaurant & Gastronomie', description: 'Für Restaurants, Cafés, Catering, Bars', industry: 'Gastronomie' },
  { id: 'arztpraxis', name: 'Arztpraxis & Gesundheit', description: 'Für Ärzte, Therapeuten, Physiotherapie, Heilpraktiker', industry: 'Gesundheit' },
  { id: 'anwalt', name: 'Rechtsanwalt & Beratung', description: 'Für Anwälte, Steuerberater, Unternehmensberater', industry: 'Beratung' },
  { id: 'business-basic', name: 'Business (Allgemein)', description: 'Allgemeines Business-Template für alle Branchen', industry: 'Allgemein' },
  // Premium Templates (Branchen-spezifisch)
  { id: 'gruenwerk', name: 'Grünwerk — Garten & Landschaft', description: 'Premium-Template für GaLaBau, Gartenpflege, Landschaftsbau', industry: 'Handwerk', preview: 'gruenwerk' },
  { id: 'eisenwerk', name: 'Eisenwerk — Fitness & Sport', description: 'Premium-Template für Fitnessstudios, Personal Training, Sportvereine', industry: 'Fitness', preview: 'eisenwerk' },
  { id: 'trattoria', name: 'Trattoria — Restaurant & Gastro', description: 'Premium-Template für Restaurants, Trattorien, Bistros mit Speisekarte', industry: 'Gastronomie', preview: 'trattoria' },
  { id: 'wildblatt', name: 'Wildblatt — Blumen & Floristik', description: 'Premium-Template für Blumenläden, Floristen, Lieferservice', industry: 'Einzelhandel', preview: 'wildblatt' },
]

export function getTemplateDefaults(templateId: string, businessName: string): SiteConfig {
  switch (templateId) {
    case 'handwerker': return handwerkerDefaults(businessName)
    case 'restaurant': return restaurantDefaults(businessName)
    case 'arztpraxis': return arztpraxisDefaults(businessName)
    case 'anwalt': return anwaltDefaults(businessName)
    default: return businessDefaults(businessName)
  }
}

function businessDefaults(name: string): SiteConfig {
  return {
    businessName: name,
    tagline: `${name} — Ihr zuverlässiger Partner`,
    description: `Willkommen bei ${name}. Wir bieten professionelle Dienstleistungen mit persönlicher Beratung.`,
    primaryColor: '#0F172A',
    secondaryColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    textColor: '#020617',
    heroImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&q=80',
    heroSubtitle: 'Professionell, zuverlässig und persönlich — so arbeiten wir für Sie.',
    ctaText: 'Jetzt Anfrage senden',
    ctaImageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1400&q=80',
    aboutText: `${name} steht für Qualität und Zuverlässigkeit. Mit langjähriger Erfahrung und einem engagierten Team sorgen wir dafür, dass unsere Kunden rundum zufrieden sind.`,
    stats: [{ value: '100+', label: 'Zufriedene Kunden' }, { value: '10+', label: 'Jahre Erfahrung' }, { value: '100%', label: 'Weiterempfehlung' }],
    services: [
      { icon: '⭐', title: 'Beratung', description: 'Individuelle Beratung für Ihre Anforderungen.' },
      { icon: '🔧', title: 'Umsetzung', description: 'Professionelle Umsetzung Ihres Projekts.' },
      { icon: '🛡️', title: 'Support', description: 'Zuverlässiger Support auch nach dem Projekt.' },
    ],
    reviews: [],
    faqItems: [
      { question: 'Wie kann ich Sie kontaktieren?', answer: 'Rufen Sie uns an oder nutzen Sie unser Kontaktformular. Wir melden uns innerhalb von 24 Stunden.' },
      { question: 'Was kostet Ihre Dienstleistung?', answer: 'Die Kosten hängen vom Umfang ab. Kontaktieren Sie uns für ein unverbindliches Angebot.' },
    ],
    galleryImages: [],
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0 },
      { id: 'intro', type: 'intro', title: name, visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Unsere Leistungen', visible: true, order: 2 },
      { id: 'about', type: 'about', visible: true, order: 3 },
      { id: 'cta', type: 'cta', title: 'Kontaktieren Sie uns', visible: true, order: 4 },
      { id: 'faq', type: 'faq', visible: true, order: 5 },
    ],
  }
}

function handwerkerDefaults(name: string): SiteConfig {
  return {
    businessName: name,
    tagline: `${name} — Ihr Handwerksprofi vor Ort`,
    description: `Zuverlässiger Handwerksservice in Ihrer Region. Von der Reparatur bis zum Neubau — wir sind für Sie da.`,
    primaryColor: '#1e40af',
    secondaryColor: '#eff6ff',
    backgroundColor: '#f8fafc',
    textColor: '#1e3a8a',
    heroImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=80',
    heroSubtitle: 'Professionelle Handwerksarbeit, faire Preise und termingerechte Ausführung. Über 200 zufriedene Kunden in der Region.',
    heroBadge: '★★★★★ Bestbewerteter Handwerker der Region',
    ctaText: 'Kostenloses Angebot anfordern',
    ctaImageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1400&q=80',
    ownerName: '',
    ownerRole: 'Inhaber & Meister',
    aboutText: `${name} ist ein familiengeführter Handwerksbetrieb mit Leidenschaft für Qualität. Seit Jahren sind wir der verlässliche Partner für Privat- und Geschäftskunden in der Region.`,
    aboutText2: 'Ob privat oder gewerblich — wir stehen Ihnen mit unserem umfassenden Service zur Seite. Faire Preise, saubere Arbeit und pünktliche Ausführung sind für uns selbstverständlich.',
    region: 'Ihr regionaler Partner',
    stats: [{ value: '200+', label: 'Zufriedene Kunden' }, { value: '15+', label: 'Jahre Erfahrung' }, { value: '100%', label: 'Familiengeführt' }],
    services: [
      { icon: '🏠', title: 'Renovierung & Sanierung', description: 'Komplettrenovierung von Wohn- und Geschäftsräumen. Böden, Wände, Decken — alles aus einer Hand.' },
      { icon: '🔧', title: 'Reparatur & Wartung', description: 'Schnelle und zuverlässige Reparaturen im und am Haus. Wir kommen innerhalb von 48 Stunden.' },
      { icon: '🌳', title: 'Garten- & Außenbereich', description: 'Gartenpflege, Terrassen, Zäune und mehr. Wir bringen Ihren Außenbereich in Form.' },
      { icon: '🪜', title: 'Montage & Installation', description: 'Fachgerechte Montage von Möbeln, Küchen, Markisen und vielem mehr.' },
    ],
    reviews: [
      { text: 'Schnell, sauber und super freundlich. Kann ich nur weiterempfehlen!', name: 'Thomas K.', source: 'Google Bewertung' },
      { text: 'Endlich ein Handwerker, der pünktlich kommt und hält, was er verspricht.', name: 'Sandra M.', source: 'MyHammer' },
      { text: 'Tolle Arbeit, fairer Preis. Gerne wieder!', name: 'Peter L.', source: 'Google Bewertung' },
    ],
    faqItems: [
      { question: 'Wie schnell können Sie einen Termin machen?', answer: 'In der Regel können wir innerhalb von 3-5 Werktagen einen Termin anbieten. Bei Notfällen auch kurzfristiger.' },
      { question: 'Bieten Sie kostenlose Angebote?', answer: 'Ja, wir erstellen Ihnen gerne ein unverbindliches Angebot nach einer Besichtigung vor Ort.' },
      { question: 'In welchem Umkreis sind Sie tätig?', answer: 'Wir sind in der gesamten Region tätig — bis zu 50 km Umkreis.' },
      { question: 'Arbeiten Sie auch am Wochenende?', answer: 'Nach Absprache sind auch Samstags-Termine möglich.' },
      { question: 'Sind Sie versichert?', answer: 'Ja, wir sind vollständig haftpflichtversichert.' },
      { question: 'Können Sie auch größere Projekte übernehmen?', answer: 'Absolut. Von der kleinen Reparatur bis zur kompletten Renovierung — wir passen uns Ihrem Projekt an.' },
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80',
    ],
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0 },
      { id: 'intro', type: 'intro', title: 'Ihr regionaler Handwerksprofi', visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Unsere Leistungen', visible: true, order: 2 },
      { id: 'reviews', type: 'reviews', title: 'Das sagen unsere Kunden', visible: true, order: 3 },
      { id: 'about', type: 'about', title: 'Über uns', visible: true, order: 4 },
      { id: 'cta', type: 'cta', title: 'Kostenloses Angebot anfordern', visible: true, order: 5 },
      { id: 'gallery', type: 'gallery', title: 'Unsere Arbeiten', visible: true, order: 6 },
      { id: 'faq', type: 'faq', title: 'Häufige Fragen', visible: true, order: 7 },
    ],
  }
}

function restaurantDefaults(name: string): SiteConfig {
  return {
    businessName: name,
    tagline: `${name} — Genuss, der verbindet`,
    description: `Willkommen bei ${name}. Frische Zutaten, mit Liebe zubereitet. Reservieren Sie jetzt Ihren Tisch.`,
    primaryColor: '#dc2626',
    secondaryColor: '#fef2f2',
    backgroundColor: '#fffbeb',
    textColor: '#450a0a',
    heroImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
    heroSubtitle: 'Frische Küche, gemütliches Ambiente und herzlicher Service. Erleben Sie Gastfreundschaft, die man schmeckt.',
    heroBadge: '★★★★★ 4.8 auf Google',
    ctaText: 'Tisch reservieren',
    ctaImageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400&q=80',
    aboutText: `Seit der Gründung steht ${name} für authentische Küche und echte Gastfreundschaft. Unsere Küche verwendet ausschließlich frische, regionale Zutaten.`,
    aboutText2: 'Ob romantisches Dinner, Familienfeier oder Geschäftsessen — bei uns finden Sie den perfekten Rahmen.',
    stats: [{ value: '4.8★', label: 'Google Bewertung' }, { value: '50+', label: 'Sitzplätze' }, { value: '100%', label: 'Frische Zutaten' }],
    services: [
      { icon: '🍽️', title: 'Restaurant', description: 'Genießen Sie unsere Gerichte in gemütlichem Ambiente. Täglich frisch zubereitet.' },
      { icon: '🥡', title: 'Lieferung & Abholung', description: 'Bestellen Sie bequem zur Abholung oder lassen Sie sich beliefern.' },
      { icon: '🎉', title: 'Events & Catering', description: 'Von der Familienfeier bis zum Firmenevent — wir machen Ihr Event kulinarisch unvergesslich.' },
      { icon: '🍷', title: 'Besondere Anlässe', description: 'Geburtstage, Jubiläen, Hochzeiten — sprechen Sie uns an für ein individuelles Menü.' },
    ],
    reviews: [
      { text: 'Das beste Essen der Stadt! Frisch, kreativ und liebevoll angerichtet.', name: 'Julia R.', source: 'Google' },
      { text: 'Tolles Ambiente, super Service und die Pasta ist ein Traum!', name: 'Marco S.', source: 'TripAdvisor' },
      { text: 'Unser Stammrestaurant. Immer lecker, immer freundlich.', name: 'Familie Weber', source: 'Google' },
    ],
    faqItems: [
      { question: 'Muss ich einen Tisch reservieren?', answer: 'Empfehlenswert, besonders am Wochenende. Aber Walk-ins sind auch willkommen, wenn Plätze frei sind.' },
      { question: 'Bieten Sie vegetarische/vegane Gerichte?', answer: 'Ja! Unsere Karte bietet eine große Auswahl an vegetarischen und veganen Optionen.' },
      { question: 'Kann ich bei Ihnen eine private Feier ausrichten?', answer: 'Absolut. Wir bieten einen separaten Bereich für bis zu 30 Personen. Sprechen Sie uns an!' },
      { question: 'Haben Sie einen Mittagstisch?', answer: 'Ja, montags bis freitags von 11:30 bis 14:00 Uhr bieten wir einen wechselnden Mittagstisch ab 8,90€.' },
      { question: 'Sind Hunde erlaubt?', answer: 'Ja, auf unserer Terrasse sind Hunde herzlich willkommen.' },
      { question: 'Bieten Sie Catering an?', answer: 'Ja, für Events ab 20 Personen. Kontaktieren Sie uns für ein individuelles Angebot.' },
    ],
    galleryImages: [
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
    ],
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0 },
      { id: 'intro', type: 'intro', title: 'Willkommen bei uns', visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Unser Angebot', visible: true, order: 2 },
      { id: 'reviews', type: 'reviews', title: 'Was unsere Gäste sagen', visible: true, order: 3 },
      { id: 'about', type: 'about', title: 'Unsere Geschichte', visible: true, order: 4 },
      { id: 'cta', type: 'cta', title: 'Reservieren Sie Ihren Tisch', visible: true, order: 5 },
      { id: 'gallery', type: 'gallery', title: 'Impressionen', visible: true, order: 6 },
      { id: 'faq', type: 'faq', title: 'Häufige Fragen', visible: true, order: 7 },
    ],
  }
}

function arztpraxisDefaults(name: string): SiteConfig {
  return {
    businessName: name,
    tagline: `${name} — Ihre Gesundheit in guten Händen`,
    description: `Moderne Medizin mit persönlicher Betreuung. Vereinbaren Sie jetzt Ihren Termin.`,
    primaryColor: '#0891b2',
    secondaryColor: '#ecfeff',
    backgroundColor: '#f0fdfa',
    textColor: '#164e63',
    heroImageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1400&q=80',
    heroSubtitle: 'Einfühlsame Betreuung, modernste Diagnostik und kurze Wartezeiten. Wir nehmen uns Zeit für Sie.',
    ctaText: 'Termin vereinbaren',
    ctaImageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1400&q=80',
    aboutText: `In unserer Praxis verbinden wir moderne Medizin mit persönlicher Zuwendung. Jeder Patient ist einzigartig — und so behandeln wir Sie auch.`,
    aboutText2: 'Unser Team aus erfahrenen Ärzten und qualifiziertem Fachpersonal steht Ihnen mit Kompetenz und Empathie zur Seite.',
    stats: [{ value: '2.000+', label: 'Patienten pro Jahr' }, { value: '20+', label: 'Jahre Erfahrung' }, { value: '< 15 Min', label: 'Wartezeit' }],
    services: [
      { icon: '🩺', title: 'Allgemeinmedizin', description: 'Umfassende Diagnostik und Behandlung. Vorsorge, Akutbehandlung und Langzeitbetreuung.' },
      { icon: '💉', title: 'Vorsorge & Prävention', description: 'Gesundheits-Check-ups, Impfungen und Krebsvorsorge. Vorbeugen ist besser als heilen.' },
      { icon: '🫀', title: 'Spezialisierte Diagnostik', description: 'EKG, Ultraschall, Labordiagnostik. Modernste Geräte für präzise Ergebnisse.' },
      { icon: '🧘', title: 'Ganzheitliche Therapie', description: 'Naturheilverfahren, Akupunktur und Ernährungsberatung als Ergänzung zur Schulmedizin.' },
    ],
    reviews: [
      { text: 'Endlich ein Arzt, der sich Zeit nimmt und zuhört. Sehr empfehlenswert!', name: 'Monika H.', source: 'Jameda' },
      { text: 'Kaum Wartezeit, freundliches Personal und kompetente Behandlung.', name: 'Stefan B.', source: 'Google' },
      { text: 'Fühle mich hier bestens aufgehoben. Moderne Praxis mit Herz.', name: 'Claudia W.', source: 'Jameda' },
    ],
    faqItems: [
      { question: 'Nehmen Sie neue Patienten auf?', answer: 'Ja, wir nehmen gerne neue Patienten auf. Bringen Sie bitte Ihre Versichertenkarte und ggf. Überweisungen mit.' },
      { question: 'Brauche ich einen Termin?', answer: 'Wir bieten sowohl Terminsprechstunden als auch eine offene Sprechstunde an. Termine werden bevorzugt behandelt.' },
      { question: 'Welche Kassen akzeptieren Sie?', answer: 'Wir behandeln gesetzlich und privat Versicherte sowie Selbstzahler.' },
      { question: 'Bieten Sie Hausbesuche an?', answer: 'Ja, in begründeten Fällen machen wir Hausbesuche im Umkreis von 10 km.' },
      { question: 'Wie sind Ihre Sprechzeiten?', answer: 'Mo-Fr 8-12 Uhr und Mo, Di, Do 14-18 Uhr. Notfälle jederzeit nach telefonischer Rücksprache.' },
      { question: 'Kann ich Rezepte online bestellen?', answer: 'Ja, Folgerezepte können Sie telefonisch oder per E-Mail anfordern.' },
    ],
    galleryImages: [],
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0 },
      { id: 'intro', type: 'intro', title: 'Ihre Praxis', visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Unsere Leistungen', visible: true, order: 2 },
      { id: 'reviews', type: 'reviews', title: 'Patientenstimmen', visible: true, order: 3 },
      { id: 'about', type: 'about', title: 'Über unsere Praxis', visible: true, order: 4 },
      { id: 'cta', type: 'cta', title: 'Termin vereinbaren', visible: true, order: 5 },
      { id: 'faq', type: 'faq', title: 'Häufige Fragen', visible: true, order: 6 },
    ],
  }
}

function anwaltDefaults(name: string): SiteConfig {
  return {
    businessName: name,
    tagline: `${name} — Recht. Klar. Kompetent.`,
    description: `Kompetente Rechtsberatung mit persönlichem Engagement. Erstberatung unverbindlich.`,
    primaryColor: '#1e3a8a',
    secondaryColor: '#eff6ff',
    backgroundColor: '#f8fafc',
    textColor: '#1e40af',
    heroImageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80',
    heroSubtitle: 'Fundierte Rechtsberatung, verständlich erklärt. Wir setzen Ihr Recht durch — diskret, entschlossen und persönlich.',
    ctaText: 'Erstberatung vereinbaren',
    ctaImageUrl: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1400&q=80',
    aboutText: `${name} steht für engagierte Rechtsberatung auf höchstem Niveau. Wir verbinden juristische Expertise mit wirtschaftlichem Verständnis und persönlicher Betreuung.`,
    aboutText2: 'Jeder Fall ist einzigartig. Wir nehmen uns die Zeit, Ihre Situation gründlich zu verstehen, bevor wir eine Strategie entwickeln.',
    stats: [{ value: '500+', label: 'Abgeschlossene Mandate' }, { value: '98%', label: 'Erfolgsquote' }, { value: '24h', label: 'Reaktionszeit' }],
    services: [
      { icon: '⚖️', title: 'Arbeitsrecht', description: 'Kündigungsschutz, Abfindungen, Arbeitnehmerrechte. Wir vertreten Ihre Interessen.' },
      { icon: '📋', title: 'Vertragsrecht', description: 'Vertragsgestaltung, -prüfung und -durchsetzung. Sicherheit für Ihre Geschäfte.' },
      { icon: '🏠', title: 'Mietrecht', description: 'Mieterhöhung, Kündigung, Schäden. Beratung für Mieter und Vermieter.' },
      { icon: '🏢', title: 'Gesellschaftsrecht', description: 'Gründung, Umstrukturierung, Geschäftsführerhaftung. Rechtssicherheit für Ihr Unternehmen.' },
    ],
    reviews: [
      { text: 'Kompetent, schnell und immer erreichbar. Meine Kündigung wurde erfolgreich abgewendet.', name: 'Michael T.', source: 'anwalt.de' },
      { text: 'Endlich ein Anwalt, der nicht in Juristendeutsch redet sondern klar erklärt.', name: 'Sabine K.', source: 'Google' },
      { text: 'Hervorragende Beratung im Vertragsrecht. Professionell und fair im Preis.', name: 'Firma Schulze GmbH', source: 'Empfehlung' },
    ],
    faqItems: [
      { question: 'Was kostet eine Erstberatung?', answer: 'Die Erstberatung kostet 190€ inkl. MwSt. und dauert ca. 60 Minuten. Bei Mandatserteilung wird der Betrag angerechnet.' },
      { question: 'Übernimmt meine Rechtsschutzversicherung die Kosten?', answer: 'In den meisten Fällen ja. Wir klären die Deckungszusage gerne für Sie vorab.' },
      { question: 'Wie schnell können Sie mir helfen?', answer: 'In dringenden Fällen reagieren wir innerhalb von 24 Stunden. Reguläre Termine meist innerhalb von 3-5 Werktagen.' },
      { question: 'Beraten Sie auch Unternehmen?', answer: 'Ja, wir beraten sowohl Privatpersonen als auch Unternehmen in allen Rechtsgebieten.' },
      { question: 'Kann ich auch Online beraten werden?', answer: 'Ja, wir bieten Beratung per Videocall und Telefon an. Oft ist kein Vor-Ort-Termin nötig.' },
      { question: 'In welchen Rechtsgebieten sind Sie tätig?', answer: 'Schwerpunkte: Arbeitsrecht, Vertragsrecht, Mietrecht und Gesellschaftsrecht. Für andere Gebiete empfehlen wir gerne Kollegen.' },
    ],
    galleryImages: [],
    sections: [
      { id: 'hero', type: 'hero', visible: true, order: 0 },
      { id: 'intro', type: 'intro', title: 'Ihre Kanzlei', visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Rechtsgebiete', visible: true, order: 2 },
      { id: 'reviews', type: 'reviews', title: 'Mandantenstimmen', visible: true, order: 3 },
      { id: 'about', type: 'about', title: 'Über die Kanzlei', visible: true, order: 4 },
      { id: 'cta', type: 'cta', title: 'Erstberatung vereinbaren', visible: true, order: 5 },
      { id: 'faq', type: 'faq', title: 'Häufige Fragen', visible: true, order: 6 },
    ],
  }
}
