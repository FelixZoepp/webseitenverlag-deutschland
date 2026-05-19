import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Fehler: NEXT_PUBLIC_SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.')
  console.error('Tipp: Lade die .env.local und setze SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.error('Usage: npx tsx scripts/seed-test-data.ts <email> <password>')
  console.error('Beispiel: npx tsx scripts/seed-test-data.ts test@example.com passwort123')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function seed() {
  console.log('Erstelle Test-User...')

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    console.error('Fehler beim Erstellen des Users:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`User erstellt: ${email} (ID: ${userId})`)

  // Create customer profile
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({
      user_id: userId,
      company_name: 'Test GmbH',
      contact_email: email,
    })
    .select()
    .single()

  if (customerError) {
    console.error('Fehler beim Erstellen des Kundenprofils:', customerError.message)
    process.exit(1)
  }

  console.log(`Kundenprofil erstellt: ${customer.company_name}`)

  // Create test site
  const defaultConfig = {
    businessName: 'Test GmbH',
    tagline: 'Qualität seit 2024',
    description: 'Wir sind ein innovatives Unternehmen, das sich auf hochwertige Lösungen spezialisiert hat.',
    primaryColor: '#2563eb',
    secondaryColor: '#f3f4f6',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    phone: '+49 800 123456',
    email: email,
    address: 'Musterstraße 1, 10115 Berlin',
    sections: [
      { id: 'hero', type: 'hero', title: 'Willkommen bei Test GmbH', content: '', visible: true, order: 0 },
      { id: 'about', type: 'about', title: 'Über uns', content: '', visible: true, order: 1 },
      { id: 'services', type: 'services', title: 'Unsere Leistungen', content: 'Beratung, Entwicklung und Support — alles aus einer Hand.', visible: true, order: 2 },
      { id: 'contact', type: 'contact', title: 'Kontakt', content: '', visible: true, order: 3 },
    ],
  }

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      customer_id: customer.id,
      name: 'Test GmbH Website',
      domain: 'test-gmbh.pages.dev',
      template_id: 'business-basic',
      config: defaultConfig,
      draft_config: defaultConfig,
      status: 'draft',
    })
    .select()
    .single()

  if (siteError) {
    console.error('Fehler beim Erstellen der Test-Site:', siteError.message)
    process.exit(1)
  }

  console.log(`Test-Site erstellt: ${site.name} (ID: ${site.id})`)

  console.log('\n✅ Seed erfolgreich!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`Login:     ${email}`)
  console.log(`Passwort:  ${password}`)
  console.log(`Dashboard: http://localhost:3000/dashboard`)
  console.log(`Editor:    http://localhost:3000/dashboard/${site.id}`)
}

seed().catch(console.error)
