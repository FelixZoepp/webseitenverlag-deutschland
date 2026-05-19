// ============================================================
// Upsell-Module Definitionen
// Jedes Modul ist eine eigenständige Funktion, die per Admin
// für einen Kunden mit einem Klick aktiviert werden kann.
// ============================================================

export interface ConfigField {
  key: string
  label: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'textarea'
  required: boolean
  default?: string | number | boolean
  options?: { value: string; label: string }[]
  description?: string
}

export interface ConfigSchema {
  fields: ConfigField[]
}

export interface UpsellModuleDefinition {
  id: string
  name: string
  preisProMonatCent: number
  beschreibung: string
  techStack: string[]
  configSchema: ConfigSchema
}

export interface InjectCode {
  htmlBlocks?: { selector: string; html: string }[]
  jsScripts?: { src?: string; inline?: string; position: 'head' | 'body-end' }[]
  cssStyles?: string[]
  newRoutes?: { path: string; component: string }[]
}

// ============================================================
// Die 12 Module
// ============================================================

export const UPSELL_MODULES: UpsellModuleDefinition[] = [
  {
    id: 'karriere-seite',
    name: 'Karriere-Seite',
    preisProMonatCent: 4900,
    beschreibung: 'Eigener Karriere-Bereich mit Stellen-CMS, Bewerbungsformular und Bewerber-Inbox',
    techStack: ['CMS', 'Form-Handler', 'Email'],
    configSchema: {
      fields: [
        { key: 'headlineText', label: 'Headline der Karriere-Seite', type: 'string', required: false, default: 'Werde Teil unseres Teams' },
        { key: 'introText', label: 'Intro-Text', type: 'textarea', required: false, default: 'Wir suchen Menschen, die etwas bewegen wollen.' },
        { key: 'emailFuerBewerbungen', label: 'Email für Bewerbungs-Benachrichtigungen', type: 'string', required: true, description: 'An diese Adresse gehen alle Bewerbungen' },
        { key: 'mitDatenschutzHinweis', label: 'DSGVO-Hinweis im Formular anzeigen', type: 'boolean', default: true, required: false },
      ],
    },
  },
  {
    id: 'bewertungs-maschine',
    name: 'Bewertungs-Maschine',
    preisProMonatCent: 3900,
    beschreibung: 'Automatisierte Google-Review-Einladungen nach Kundenkontakt',
    techStack: ['Email-Automation', 'Cronjob', 'Webhook'],
    configSchema: {
      fields: [
        { key: 'googleBusinessUrl', label: 'Google-Bewertungs-Link', type: 'string', required: true, description: 'Der direkte Link zu Ihrem Google-Bewertungsformular' },
        { key: 'verzoegerungTage', label: 'Tage zwischen Kontakt und Bewertungsbitte', type: 'number', required: false, default: 7 },
        { key: 'absenderName', label: 'Absender-Name in Email', type: 'string', required: true },
        { key: 'negativFilterAktivieren', label: 'Negative Bewertungen abfangen', type: 'boolean', required: false, default: true },
      ],
    },
  },
  {
    id: '247-besucher-chatbot',
    name: '24/7 Besucher-Chatbot',
    preisProMonatCent: 4900,
    beschreibung: 'KI-Chatbot auf der Webseite für Besucher-Fragen und Lead-Capture',
    techStack: ['Claude/OpenAI', 'RAG', 'Widget-Embed'],
    configSchema: {
      fields: [
        { key: 'botName', label: 'Name des Chatbots', type: 'string', default: 'Assistent', required: false },
        { key: 'begruessungstext', label: 'Begrüßungstext', type: 'textarea', required: false, default: 'Hallo! Wie kann ich Ihnen helfen?' },
        { key: 'farbe', label: 'Widget-Farbe (Hex)', type: 'string', default: '#1E4A82', required: false },
        {
          key: 'position', label: 'Position auf der Seite', type: 'select',
          options: [{ value: 'bottom-right', label: 'Unten rechts' }, { value: 'bottom-left', label: 'Unten links' }],
          default: 'bottom-right', required: false,
        },
        { key: 'extraKnowledge', label: 'Zusätzliches Wissen für den Bot', type: 'textarea', description: 'Wird als Kontext hinzugefügt', required: false },
      ],
    },
  },
  {
    id: 'newsletter-maschine',
    name: 'Newsletter-Maschine',
    preisProMonatCent: 3900,
    beschreibung: 'Email-Tool mit Welcome-Sequenz und Auto-Newsletter aus Blog-Artikeln',
    techStack: ['Email-Backend', 'Sequence-Builder'],
    configSchema: {
      fields: [
        { key: 'absenderName', label: 'Absender', type: 'string', required: true },
        { key: 'absenderEmail', label: 'Absender-Email', type: 'string', required: true },
        { key: 'welcomeSequenzAktivieren', label: 'Willkommens-Sequenz aktivieren', type: 'boolean', default: true, required: false },
        { key: 'autoNewsletterAusBlog', label: 'Auto-Newsletter bei neuen Blog-Artikeln', type: 'boolean', default: true, required: false },
      ],
    },
  },
  {
    id: 'termin-buchung',
    name: 'Termin-Buchungs-System',
    preisProMonatCent: 4900,
    beschreibung: 'Self-Service-Buchung mit Google-Calendar-Sync',
    techStack: ['Calendar-Widget', 'iCal', 'Reminder-Emails'],
    configSchema: {
      fields: [
        { key: 'googleCalendarEmail', label: 'Google Calendar Email', type: 'string', required: true },
        { key: 'terminDauerMinuten', label: 'Standard-Termindauer (Min)', type: 'number', default: 30, required: true },
        { key: 'pufferZeitMinuten', label: 'Puffer zwischen Terminen (Min)', type: 'number', default: 15, required: false },
        {
          key: 'verfuegbareTage', label: 'Verfügbare Tage', type: 'multiselect',
          options: [
            { value: 'mo', label: 'Montag' }, { value: 'di', label: 'Dienstag' },
            { value: 'mi', label: 'Mittwoch' }, { value: 'do', label: 'Donnerstag' },
            { value: 'fr', label: 'Freitag' }, { value: 'sa', label: 'Samstag' },
          ],
          required: true,
        },
        { key: 'verfuegbareStunden', label: 'Verfügbare Stunden', type: 'string', default: '09:00-17:00', required: true },
      ],
    },
  },
  {
    id: 'whatsapp-connector',
    name: 'WhatsApp-Lead-Connector',
    preisProMonatCent: 2900,
    beschreibung: 'WhatsApp-Button auf Webseite, Anfragen landen im Dashboard',
    techStack: ['HTML/CSS-Inject', 'WA-Business-API'],
    configSchema: {
      fields: [
        { key: 'whatsappNummer', label: 'WhatsApp-Nummer (mit +49)', type: 'string', required: true },
        { key: 'vorlagentext', label: 'Vorlagentext beim Klick', type: 'textarea', default: 'Hallo, ich interessiere mich für Ihr Angebot.', required: true },
        {
          key: 'buttonPosition', label: 'Position', type: 'select',
          options: [
            { value: 'bottom-right', label: 'Unten rechts (schwebend)' },
            { value: 'header', label: 'Im Header' },
            { value: 'beide', label: 'Beides' },
          ],
          default: 'bottom-right', required: true,
        },
      ],
    },
  },
  {
    id: 'lead-magnet',
    name: 'Lead-Magnet-Funnel',
    preisProMonatCent: 4900,
    beschreibung: 'Pop-up mit PDF-Download + Email-Capture + 5-Mail-Welcome-Sequenz',
    techStack: ['Pop-up', 'PDF-Generator', 'Email-Sequence'],
    configSchema: {
      fields: [
        { key: 'magnetTitel', label: 'Titel des Lead-Magnets', type: 'string', required: true, description: 'z.B. "7 Fehler beim Hauskauf"' },
        { key: 'magnetBeschreibung', label: 'Pop-up-Beschreibung', type: 'textarea', required: true },
        { key: 'pdfInhalt', label: 'Inhalt des PDFs (wird per KI erstellt wenn leer)', type: 'textarea', required: false },
        {
          key: 'popupTrigger', label: 'Wann erscheint das Pop-up?', type: 'select',
          options: [
            { value: 'exit-intent', label: 'Beim Verlassen der Seite' },
            { value: 'time-30s', label: 'Nach 30 Sekunden' },
            { value: 'scroll-50', label: 'Nach 50% Scroll' },
          ],
          default: 'exit-intent', required: true,
        },
        { key: 'sequenzAnzahl', label: 'Anzahl Welcome-Mails', type: 'number', default: 5, required: false },
      ],
    },
  },
  {
    id: 'mehrsprachigkeit',
    name: 'Mehrsprachigkeit',
    preisProMonatCent: 4900,
    beschreibung: 'Komplette Webseite in zusätzlicher Sprache (KI-übersetzt), pro Sprache',
    techStack: ['i18n-Routing', 'KI-Translation', 'Sprach-Switcher'],
    configSchema: {
      fields: [
        {
          key: 'zielsprache', label: 'Zielsprache', type: 'select',
          options: [
            { value: 'en', label: 'Englisch' }, { value: 'tr', label: 'Türkisch' },
            { value: 'pl', label: 'Polnisch' }, { value: 'ru', label: 'Russisch' },
            { value: 'ar', label: 'Arabisch' }, { value: 'fr', label: 'Französisch' },
            { value: 'it', label: 'Italienisch' }, { value: 'es', label: 'Spanisch' },
          ],
          required: true,
        },
        {
          key: 'switcherPosition', label: 'Position des Sprach-Switchers', type: 'select',
          options: [
            { value: 'header-right', label: 'Header rechts oben' },
            { value: 'footer', label: 'Im Footer' },
          ],
          default: 'header-right', required: true,
        },
      ],
    },
  },
  {
    id: 'mini-shop',
    name: 'Mini-Shop',
    preisProMonatCent: 7900,
    beschreibung: 'Produktkatalog mit Bestellfunktion',
    techStack: ['Shop-Module', 'Checkout', 'Order-Dashboard'],
    configSchema: {
      fields: [
        { key: 'shopName', label: 'Shop-Name', type: 'string', required: true },
        { key: 'waehrung', label: 'Währung', type: 'select', options: [{ value: 'EUR', label: 'Euro' }], default: 'EUR', required: true },
        {
          key: 'lieferungArt', label: 'Liefer-/Abholoptionen', type: 'multiselect',
          options: [
            { value: 'versand', label: 'Versand' },
            { value: 'abholung', label: 'Abholung' },
            { value: 'digital', label: 'Digitaler Download' },
          ],
          required: true,
        },
        {
          key: 'paymentMethoden', label: 'Zahlungsarten', type: 'multiselect',
          options: [
            { value: 'paypal', label: 'PayPal' },
            { value: 'klarna', label: 'Klarna' },
            { value: 'rechnung', label: 'Auf Rechnung' },
            { value: 'vorkasse', label: 'Vorkasse' },
          ],
          required: true, description: 'Anbindung der Zahlungsabwicklung erfolgt manuell durch unser Team',
        },
      ],
    },
  },
  {
    id: 'retargeting-pixel',
    name: 'Retargeting-Pixel-Setup',
    preisProMonatCent: 2900,
    beschreibung: 'Meta + Google Pixel installiert + Audiences automatisch angelegt',
    techStack: ['Pixel-Inject', 'Marketing-API'],
    configSchema: {
      fields: [
        { key: 'metaPixelId', label: 'Meta Pixel ID', type: 'string', required: false },
        { key: 'googleAdsConversionId', label: 'Google Ads Conversion ID', type: 'string', required: false },
        { key: 'ga4MeasurementId', label: 'GA4 Measurement ID', type: 'string', required: false },
        { key: 'monatlicherReport', label: 'Monatlicher Audience-Report per Email', type: 'boolean', default: true, required: false },
      ],
    },
  },
  {
    id: 'click-to-call',
    name: 'Click-to-Call-Tracking',
    preisProMonatCent: 1900,
    beschreibung: 'Anruf-Messung mit Quelle, Tageszeit, Dauer',
    techStack: ['Dynamic-Number-Insertion', 'Call-Tracking-Provider'],
    configSchema: {
      fields: [
        { key: 'echteRufnummer', label: 'Ihre echte Telefonnummer', type: 'string', required: true },
        {
          key: 'trackingProvider', label: 'Tracking-Provider', type: 'select',
          options: [
            { value: 'matelso', label: 'matelso' },
            { value: 'calltracking', label: 'CallTracking.com' },
          ],
          default: 'matelso', required: true,
        },
      ],
    },
  },
  {
    id: 'live-dashboard',
    name: 'Live-Dashboard',
    preisProMonatCent: 4900,
    beschreibung: 'Echtzeit-Daten zu Besuchern, Anfragen, SEO-Rankings, Conversion',
    techStack: ['Analytics-Aggregation', 'SERP-API', 'Dashboard-UI'],
    configSchema: {
      fields: [
        { key: 'trackingKeywords', label: 'SEO-Keywords (eines pro Zeile)', type: 'textarea', required: true, description: 'Top 10 Keywords, die wir für Sie tracken sollen' },
        { key: 'standort', label: 'Standort für lokales Ranking', type: 'string', required: true },
        { key: 'wochenReportEmail', label: 'Wochen-Report per Email', type: 'boolean', default: true, required: false },
      ],
    },
  },
]

// ============================================================
// Helpers
// ============================================================

export function getUpsellModule(id: string): UpsellModuleDefinition | undefined {
  return UPSELL_MODULES.find((m) => m.id === id)
}

export function getUpsellModuleOrThrow(id: string): UpsellModuleDefinition {
  const m = getUpsellModule(id)
  if (!m) throw new Error(`Unbekanntes Upsell-Modul: ${id}`)
  return m
}

