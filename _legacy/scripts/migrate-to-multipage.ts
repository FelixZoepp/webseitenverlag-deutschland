import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const defaultConfigPath = path.join(__dirname, '../templates/business-multipage/default-config.json')
const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'))

const targetId = process.argv[2]

async function migrate() {
  let query = supabase.from('sites').select('*').eq('multi_page', false)

  if (targetId && targetId !== '--all') {
    query = query.eq('id', targetId)
  }

  const { data: sites, error } = await query
  if (error) { console.error('Fehler:', error.message); process.exit(1) }
  if (!sites || sites.length === 0) { console.log('Keine Sites zum Migrieren.'); return }

  console.log(`${sites.length} Site(s) zu migrieren...\n`)

  for (const site of sites) {
    const oldConfig = site.config || {}
    console.log(`Migriere: ${site.name} (${site.id})`)

    const multiPageConfig = {
      site: {
        name: oldConfig.businessName || site.name,
        colors: {
          primary: oldConfig.primaryColor || '#2d5a27',
          secondary: oldConfig.secondaryColor || '#e8f0e6',
          background: oldConfig.backgroundColor || '#faf8f4',
          text: oldConfig.textColor || '#1a2218',
        },
        branding: { logoText: oldConfig.businessName || site.name },
        navigation: ['home', 'about', 'services', 'contact'],
        footer: {
          text: oldConfig.description || '',
          legalLinks: [
            { label: 'Impressum', pageKey: 'legal-imprint' },
            { label: 'Datenschutz', pageKey: 'legal-privacy' },
          ],
        },
      },
      pages: {
        home: {
          template: 'home',
          slug: '',
          title: 'Startseite',
          config: {
            hero: {
              headline: oldConfig.tagline || 'Willkommen',
              subtitle: oldConfig.heroSubtitle || oldConfig.description || '',
              imageUrl: oldConfig.heroImageUrl || defaultConfig.pages.home.config.hero.imageUrl,
              badge: oldConfig.heroBadge || '',
              ctaText: oldConfig.ctaText || 'Jetzt Anfrage senden',
              ctaLink: 'kontakt',
            },
            highlights: oldConfig.stats || [],
          },
        },
        about: {
          ...defaultConfig.pages.about,
          config: {
            title: 'Über uns',
            story: oldConfig.aboutText || oldConfig.description || '',
            story2: oldConfig.aboutText2 || '',
            team: [],
            imageUrl: oldConfig.ownerImageUrl || '',
          },
        },
        services: {
          ...defaultConfig.pages.services,
          config: {
            title: 'Unsere Leistungen',
            intro: '',
            items: (oldConfig.services || []).map((s: { icon: string; title: string; description: string }) => ({
              icon: s.icon,
              title: s.title,
              description: s.description,
            })),
          },
        },
        contact: {
          ...defaultConfig.pages.contact,
          config: {
            title: 'Kontakt',
            address: oldConfig.address || '',
            phone: oldConfig.phone || '',
            email: oldConfig.email || '',
            hours: '',
          },
        },
        'legal-imprint': { ...defaultConfig.pages['legal-imprint'] },
        'legal-privacy': { ...defaultConfig.pages['legal-privacy'] },
      },
    }

    const { error: updateError } = await supabase
      .from('sites')
      .update({
        config: multiPageConfig,
        draft_config: multiPageConfig,
        multi_page: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', site.id)

    if (updateError) {
      console.error(`  Fehler: ${updateError.message}`)
    } else {
      console.log(`  ✅ Migriert zu Multi-Page (${Object.keys(multiPageConfig.pages).length} Seiten)`)
    }
  }

  console.log('\nMigration abgeschlossen.')
}

migrate().catch(console.error)
