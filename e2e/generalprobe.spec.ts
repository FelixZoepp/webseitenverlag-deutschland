/**
 * MASTER-REVIEW Kap. 2: E2E-GENERALPROBE — ein durchgehender Testlauf.
 *
 *   Ad-Klick → Formular (/entwurf) → Lead in DB → Geschäftsprofil (Admin) →
 *   Ein-Klick-Demo (GaLaBau, Flagship) → QA-Gates → Mensch-Gate (Freigeben) →
 *   Demo-Link mobil (noindex) → Stripe-Testmode-Kauf → Webhook → Kunde+Site+
 *   Vertrag+Magic-Link-User → Kunden-Login → Chat-Edit → Publish → Live-URL →
 *   Nightly-QA-Simulation (Cron) → SEO-Upsell-Kauf → SEO-Cron → Unterseite →
 *   1-Klick-Freigabe → Zahlung fehlschlagen → Mahnkette 0/3/7 → Sperre Tag 14 →
 *   Wartungsseite (503) → Zahlung nachholen → Site wieder live.
 *
 * Jeder Pfeil = Assertion + Screenshot (test-results/generalprobe/).
 *
 * Env-gated wie e2e/journey.spec.ts: E2E_ENABLED=1 + Supabase-Test-Instanz +
 * Stripe-TEST-Keys + CRON_SECRET. Ohne ANTHROPIC_API_KEY fallen die
 * LLM-Schritte (Flagship-Generierung, Browser-QA-Reparatur, Chat-Edit,
 * SEO-Unterseite) auf eine Library-Demo bzw. Skips zurück — der Rest der
 * Kette läuft trotzdem.
 *
 * Bekannte, dokumentierte Abweichungen vom Zielbild (siehe REVIEW_REPORT.md):
 *   - Kein 7-Schritte-Wizard (B-05): Einstieg ist das /entwurf-Formular;
 *     „Edel"/Akzentfarbe sind dort nicht wählbar.
 *   - Magic-Link-Mail wird nicht geklickt (kein Mail-Postfach im Test);
 *     bewiesen wird der Auth-User aus dem Webhook-Provisioning, der Login
 *     läuft über ein per Admin-API gesetztes Passwort.
 */
import { test, expect, type Page, type APIRequestContext, devices } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { mkdirSync } from 'fs'
import { ladeEnvLocal } from './env'

ladeEnvLocal()

const NOETIG = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'CRON_SECRET',
]
const fehlend = NOETIG.filter((k) => !process.env[k])
const aktiv = process.env.E2E_ENABLED === '1' && fehlend.length === 0
const MIT_LLM = Boolean(process.env.ANTHROPIC_API_KEY)

// Stop-Condition: NIE gegen Stripe-Live-Keys testen.
if (
  process.env.E2E_ENABLED === '1' &&
  process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
) {
  throw new Error('Generalprobe abgebrochen: STRIPE_SECRET_KEY ist kein Testmode-Key (sk_test_...).')
}

const runId = `gp${Date.now()}`
const FIRMA = `Generalprobe GaLaBau ${runId}`
const STADT = 'Leipzig'
const KUNDEN_EMAIL = `kunde-${runId}@e2e.example.com`
const KUNDEN_PASSWORT = `Gp!${runId}Pw`
const ADMIN_EMAIL = `admin-${runId}@e2e.example.com`
const ADMIN_PASSWORT = `Gp!${runId}Admin`
const WUNSCH_DOMAIN = `${runId}-galabau.de`
const SCREEN_DIR = 'test-results/generalprobe'

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function pollBis<T>(fn: () => Promise<T | null | undefined>, was: string, timeoutMs = 30_000): Promise<T> {
  const start = Date.now()
  for (;;) {
    const wert = await fn()
    if (wert) return wert
    if (Date.now() - start > timeoutMs) throw new Error(`Timeout beim Warten auf: ${was}`)
    await new Promise((r) => setTimeout(r, 500))
  }
}

/** Screenshot-Beweis je Pfeil (Kap.-2-Regel: jeder Pfeil = Assertion + Screenshot). */
async function beweis(page: Page, name: string) {
  await page.screenshot({ path: `${SCREEN_DIR}/${name}.png`, fullPage: true })
}

/** Signiertes Stripe-Event an den Webhook schicken (raw body, echte Signatur). */
async function sendeWebhook(
  request: APIRequestContext,
  stripe: Stripe,
  typ: string,
  objekt: Record<string, unknown>
) {
  const payload = JSON.stringify({
    id: `evt_${runId}_${Math.random().toString(36).slice(2, 8)}`,
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: typ,
    data: { object: objekt },
  })
  const signatur = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  })
  const res = await request.post('/api/webhooks/stripe', {
    headers: { 'content-type': 'application/json', 'stripe-signature': signatur },
    data: payload,
  })
  expect(res.status(), `Webhook (${typ}): ${await res.text()}`).toBe(200)
}

async function login(page: Page, email: string, passwort: string) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', passwort)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 20_000 })
}

/** Cron manuell triggern (mit CRON_SECRET, wie Vercel es tut). */
async function cron(request: APIRequestContext, pfad: string) {
  return request.get(pfad, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    timeout: 300_000,
  })
}

test.describe('E2E-Generalprobe (Kap. 2 Master-Review)', () => {
  test.skip(
    !aktiv,
    `Generalprobe übersprungen — E2E_ENABLED=1 + Envs nötig${fehlend.length ? ` (fehlend: ${fehlend.join(', ')})` : ''}`
  )

  test.setTimeout(20 * 60_000)

  test('Ad-Klick → … → Suspend → Reaktivierung', async ({ page, browser }) => {
    mkdirSync(SCREEN_DIR, { recursive: true })
    const db = serviceClient()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    let leadId = ''
    let demoId = ''
    let shareToken = ''
    let demoSiteId = ''
    let customerId = ''
    let customerUserId = ''
    let siteId = ''
    let contractId = ''

    await test.step('01 Ad-Klick simuliert → Landing mit UTM', async () => {
      await page.goto(`/?utm_source=${runId}&utm_medium=cpc&utm_campaign=generalprobe`)
      await expect(page.locator('a[href*="entwurf"]').first()).toBeVisible()
      await beweis(page, '01-landing-ad-klick')
    })

    await test.step('02 Formular /entwurf ausfüllen → Lead in DB', async () => {
      await page.goto(`/entwurf?utm_source=${runId}&utm_medium=cpc&utm_campaign=generalprobe`)
      await page.fill('#e-name', 'Erika Generalprobe')
      await page.fill('#e-firma', FIRMA)
      await page.fill('#e-email', KUNDEN_EMAIL)
      await page.fill('#e-tel', '0341 9876543')
      await page.fill('#e-msg', `Garten- und Landschaftsbau in ${STADT}, edler Look. E2E ${runId}`)
      await beweis(page, '02-entwurf-formular')
      await page.locator('form button[type="submit"]').first().click()

      const lead = await pollBis(async () => {
        const { data } = await db.from('leads').select('id').eq('email', KUNDEN_EMAIL).maybeSingle()
        return data
      }, 'Lead in leads-Tabelle')
      expect(lead.id).toBeTruthy()
      await beweis(page, '02b-entwurf-abgeschickt')
    })

    await test.step('03 Admin: Geschäftsprofil anlegen (GaLaBau)', async () => {
      const { data: admin, error } = await db.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORT,
        email_confirm: true,
      })
      expect(error).toBeNull()
      const { error: profilFehler } = await db.from('customers').insert({
        user_id: admin.user!.id,
        company_name: 'Generalprobe Admin',
        contact_email: ADMIN_EMAIL,
        role: 'admin',
      })
      expect(profilFehler).toBeNull()
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORT)

      const res = await page.request.post('/api/admin/leads', {
        data: {
          firma: FIRMA,
          branche_key: 'galabau',
          stadt: STADT,
          telefon: '0341 9876543',
          email: KUNDEN_EMAIL,
          leistungen: ['Gartenpflege', 'Pflasterarbeiten', 'Baumfällung'],
          usps: ['Meisterbetrieb', 'Festpreisgarantie'],
          notizen: `Generalprobe ${runId}`,
        },
      })
      expect(res.status(), await res.text()).toBe(200)
      const body = await res.json()
      leadId = body.leadId
      expect(body.businessProfileId).toBeTruthy()
      await page.goto('/admin/leads')
      await beweis(page, '03-admin-lead')
    })

    await test.step('04 Ein-Klick-Demo (Flagship, GaLaBau)', async () => {
      test.skip(!MIT_LLM, 'Flagship-Generierung braucht ANTHROPIC_API_KEY')
      const res = await page.request.post(`/api/admin/leads/${leadId}/generieren`, { timeout: 300_000 })
      const body = await res.json()
      expect(res.status(), JSON.stringify(body)).toBe(200)
      expect(body.status).toBe('demo_erstellt')
      demoId = body.demoId
      demoSiteId = body.siteId
      shareToken = body.shareToken

      const { data: job } = await db
        .from('generation_jobs')
        .select('kosten_cent, status')
        .eq('id', body.jobId)
        .single()
      expect(job!.status).toBe('demo_erstellt')
      expect(job!.kosten_cent).toBeGreaterThan(0)
    })

    await test.step('04b Fallback ohne LLM: Library-Demo', async () => {
      test.skip(MIT_LLM, 'entfällt — Flagship-Pfad aktiv')
      const res = await page.request.post('/api/admin/demos', {
        data: { prospectName: FIRMA, engine: 'library', branche: 'Handwerk', stil: 'klar', ort: STADT },
      })
      expect(res.status(), await res.text()).toBe(200)
      const body = await res.json()
      demoId = body.demo.id
      const { data: demo } = await db.from('demos').select('share_token, site_id').eq('id', demoId).single()
      shareToken = demo!.share_token
      demoSiteId = demo!.site_id ?? ''
    })

    await test.step('05 QA-Gates (Browser-QA) → Mensch-Gate Freigeben', async () => {
      test.skip(!MIT_LLM || !demoSiteId, 'QA-Gate-Kette braucht Flagship-Demo (ANTHROPIC_API_KEY)')
      const qa = await page.request.post(`/api/admin/sites/${demoSiteId}/qa`, { timeout: 300_000 })
      const qaBody = await qa.json()
      expect(qa.status(), JSON.stringify(qaBody)).toBe(200)
      expect(['passed', 'repaired']).toContain(qaBody.status)

      const frei = await page.request.post(`/api/admin/demos/${demoId}/freigeben`, { data: { bereit: true } })
      expect(frei.status(), await frei.text()).toBe(200)
      const { data: demo } = await db.from('demos').select('demo_bereit').eq('id', demoId).single()
      expect(demo!.demo_bereit).toBe(true)
    })

    await test.step('06 Demo-Link mobil öffnen (noindex)', async () => {
      const mobil = await browser.newContext({ ...devices['iPhone 13'] })
      const mobilePage = await mobil.newPage()
      const antwort = await mobilePage.goto(
        `${process.env.E2E_BASE_URL || 'http://localhost:3000'}/demo/${shareToken}`
      )
      expect(antwort!.status()).toBe(200)
      const html = await mobilePage.content()
      expect(html).toContain('noindex')
      await expect(mobilePage.locator('body')).toContainText(FIRMA.split(' ')[0])
      await mobilePage.screenshot({ path: `${SCREEN_DIR}/06-demo-mobil.png`, fullPage: true })
      await mobil.close()
    })

    await test.step('07 Stripe-Testmode-Kauf: Checkout-Session + Webhook', async () => {
      const link = await page.request.post(`/api/admin/demos/${demoId}/payment-link`, {
        data: { paket: 'business' },
      })
      expect(link.status(), await link.text()).toBe(200)
      const { url } = await link.json()
      expect(url).toContain('checkout.stripe.com')

      await sendeWebhook(page.request, stripe, 'checkout.session.completed', {
        object: 'checkout.session',
        id: `cs_test_${runId}`,
        mode: 'subscription',
        customer: `cus_${runId}`,
        subscription: `sub_${runId}`,
        customer_details: { email: KUNDEN_EMAIL, name: FIRMA },
        metadata: { demo_id: demoId, paket: 'business' },
      })

      const kunde = await pollBis(async () => {
        const { data } = await db
          .from('customers')
          .select('id, user_id, package')
          .eq('contact_email', KUNDEN_EMAIL)
          .maybeSingle()
        return data
      }, 'customers-Zeile nach Webhook')
      customerId = kunde.id
      customerUserId = kunde.user_id
      expect(kunde.package).toBe('business')

      const site = await pollBis(async () => {
        const { data } = await db.from('sites').select('id').eq('customer_id', customerId).maybeSingle()
        return data
      }, 'sites-Zeile nach Webhook')
      siteId = site.id

      const { data: vertrag } = await db
        .from('contracts')
        .select('id, status, laufzeit_monate, verlaengerung_monate')
        .eq('customer_id', customerId)
        .eq('paket', 'business')
        .maybeSingle()
      expect(vertrag?.status).toBe('AKTIV')
      expect(vertrag?.laufzeit_monate).toBe(24)
      expect(vertrag?.verlaengerung_monate).toBe(12)
      contractId = vertrag!.id

      // Magic-Link-Beweis: Provisioning hat einen Auth-User für den Kunden
      // angelegt (generateLink-Pfad). Die Mail selbst wird nicht geklickt.
      expect(customerUserId).toBeTruthy()
    })

    await test.step('08 Kunden-Login → Portal', async () => {
      const { error } = await db.auth.admin.updateUserById(customerUserId, { password: KUNDEN_PASSWORT })
      expect(error).toBeNull()
      await login(page, KUNDEN_EMAIL, KUNDEN_PASSWORT)
      await beweis(page, '08-portal-nach-login')
    })

    await test.step('09 Wizard-Pflichten + Domain (Mock-Registrar)', async () => {
      for (const [schritt, daten] of [
        [
          'pflichtangaben',
          {
            firmenname: FIRMA,
            inhaber: 'Erika Generalprobe',
            strasse: 'Musterweg 1',
            plz: '04109',
            ort: STADT,
            telefon: '0341 9876543',
            email: KUNDEN_EMAIL,
          },
        ],
        ['fakten', { telefon: '0341 9876543', email: KUNDEN_EMAIL, oeffnungszeiten: 'Mo–Fr 8–17 Uhr' }],
      ] as const) {
        const res = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
          method: 'PATCH',
          data: { schritt, daten },
        })
        expect(res.status(), `${schritt}: ${await res.text()}`).toBe(200)
      }

      const domain = await page.request.post(`/api/sites/${siteId}/domains`, {
        data: { hostname: WUNSCH_DOMAIN, typ: 'neuregistrierung' },
      })
      expect(domain.status(), await domain.text()).toBeLessThan(300)
      const domainZeile = await pollBis(async () => {
        const { data } = await db.from('domains').select('status').eq('hostname', WUNSCH_DOMAIN).maybeSingle()
        return data
      }, 'domains-Zeile (Mock-Registrar)')
      expect(['AKTIV', 'WARTET_AUF_DNS']).toContain(domainZeile.status)

      for (const patch of [
        { schritt: 'domain', status: 'erledigt', wunsch_domain: WUNSCH_DOMAIN },
        { schritt: 'seo_plan', status: 'uebersprungen' },
        { schritt: 'logo', status: 'uebersprungen' },
      ]) {
        const res = await page.request.fetch(`/api/sites/${siteId}/wizard`, { method: 'PATCH', data: patch })
        expect(res.status(), JSON.stringify(patch)).toBe(200)
      }
    })

    await test.step('10 Chat-Edit: Text ändern', async () => {
      test.skip(!MIT_LLM, 'Chat-Edit braucht ANTHROPIC_API_KEY')
      const res = await page.request.post(`/api/sites/${siteId}/chat`, {
        data: { message: `Bitte ändere die Hauptüberschrift in „Ihr GaLaBau-Meisterbetrieb in ${STADT}".` },
        timeout: 120_000,
      })
      expect(res.status(), await res.text()).toBe(200)
      const body = await res.json()
      expect(typeof body.response).toBe('string')
    })

    await test.step('11 Fertigstellen → Publish → Live-URL', async () => {
      const fertig = await page.request.post(`/api/sites/${siteId}/fertigstellen`, { timeout: 300_000 })
      const fertigBody = await fertig.json()
      expect(fertig.status(), JSON.stringify(fertigBody)).toBe(200)

      const pub = await page.request.post(`/api/sites/${siteId}/publish`)
      const pubBody = await pub.json()
      expect(pub.status(), JSON.stringify(pubBody)).toBe(200)

      const { data: site } = await db.from('sites').select('status').eq('id', siteId).single()
      expect(site!.status).toBe('published')

      const live = await page.goto(`/kundenseite/${WUNSCH_DOMAIN}`)
      expect(live!.status()).toBe(200)
      await beweis(page, '11-live-url')
    })

    await test.step('12 Nightly-QA-Simulation (Cron qa-scan)', async () => {
      const res = await cron(page.request, '/api/cron/qa-scan')
      expect(res.status(), await res.text()).toBe(200)
    })

    await test.step('13 SEO-Upsell kaufen → Cron → Unterseite → Freigabe', async () => {
      const checkout = await page.request.post(`/api/sites/${siteId}/upsell-checkout`, {
        data: { product_key: 'seo-unterseiten-abo', quelle: 'portal' },
      })
      expect(checkout.status(), await checkout.text()).toBe(200)

      const order = await pollBis(async () => {
        const { data } = await db
          .from('upsell_orders')
          .select('id, stripe_checkout_session_id')
          .eq('customer_id', customerId)
          .eq('product_key', 'seo-unterseiten-abo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        return data
      }, 'upsell_orders-Zeile')

      await sendeWebhook(page.request, stripe, 'checkout.session.completed', {
        object: 'checkout.session',
        id: order.stripe_checkout_session_id,
        mode: 'subscription',
        customer: `cus_${runId}`,
        subscription: `sub_seo_${runId}`,
        customer_details: { email: KUNDEN_EMAIL, name: FIRMA },
        metadata: { product_key: 'seo-unterseiten-abo', order_id: order.id },
      })
      await pollBis(async () => {
        const { data } = await db.from('upsell_orders').select('status').eq('id', order.id).single()
        return data && ['BEZAHLT', 'PROVISIONIERT'].includes(data.status) ? data : null
      }, 'Upsell-Order BEZAHLT/PROVISIONIERT')

      if (MIT_LLM) {
        const res = await cron(page.request, '/api/cron/seo-plan')
        expect(res.status(), await res.text()).toBe(200)

        const lp = await pollBis(async () => {
          const { data } = await db
            .from('seo_landingpages')
            .select('id, status')
            .eq('site_id', siteId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          return data
        }, 'seo_landingpages-Zeile (WARTET_AUF_FREIGABE)')
        expect(lp.status).toBe('WARTET_AUF_FREIGABE')

        const frei = await page.request.post(`/api/sites/${siteId}/seo/${lp.id}`, {
          data: { aktion: 'freigeben' },
        })
        expect(frei.status(), await frei.text()).toBe(200)
        const { data: freigegeben } = await db
          .from('seo_landingpages')
          .select('status')
          .eq('id', lp.id)
          .single()
        expect(freigegeben!.status).toBe('FREIGEGEBEN')
      }
    })

    await test.step('14 Zahlung schlägt fehl → Mahnkette 0/3/7 → Sperre Tag 14', async () => {
      await sendeWebhook(page.request, stripe, 'invoice.payment_failed', {
        object: 'invoice',
        id: `in_${runId}_fail`,
        customer: `cus_${runId}`,
        subscription: `sub_${runId}`,
      })
      const { data: v0 } = await db
        .from('contracts')
        .select('mahnstufe, zahlung_ueberfaellig_seit')
        .eq('id', contractId)
        .single()
      expect(v0!.mahnstufe).toBe(1)
      expect(v0!.zahlung_ueberfaellig_seit).toBeTruthy()

      // Zeitreise: Überfälligkeits-Beginn zurückdatieren, Cron erneut laufen lassen
      const zurueck = async (tage: number) => {
        const seit = new Date(Date.now() - tage * 86_400_000).toISOString().slice(0, 10)
        await db.from('contracts').update({ zahlung_ueberfaellig_seit: seit }).eq('id', contractId)
        const res = await cron(page.request, '/api/cron/dunning')
        expect(res.status(), await res.text()).toBe(200)
        const { data } = await db.from('contracts').select('mahnstufe').eq('id', contractId).single()
        return data!.mahnstufe as number
      }
      expect(await zurueck(3)).toBe(2)
      expect(await zurueck(7)).toBe(3)
      expect(await zurueck(14)).toBe(3)

      const { data: site } = await db.from('sites').select('gesperrt').eq('id', siteId).single()
      expect(site!.gesperrt).toBe(true)

      const wartung = await page.goto(`/kundenseite/${WUNSCH_DOMAIN}`)
      expect(wartung!.status()).toBe(503)
      await beweis(page, '14-wartungsseite-503')
    })

    await test.step('15 Zahlung nachholen → Site wieder live', async () => {
      await sendeWebhook(page.request, stripe, 'invoice.paid', {
        object: 'invoice',
        id: `in_${runId}_paid`,
        customer: `cus_${runId}`,
        subscription: `sub_${runId}`,
      })
      const vertrag = await pollBis(async () => {
        const { data } = await db.from('contracts').select('mahnstufe').eq('id', contractId).single()
        return data && data.mahnstufe === 0 ? data : null
      }, 'Mahnstufe 0 nach invoice.paid')
      expect(vertrag.mahnstufe).toBe(0)

      const { data: site } = await db.from('sites').select('gesperrt').eq('id', siteId).single()
      expect(site!.gesperrt).toBe(false)

      const live = await page.goto(`/kundenseite/${WUNSCH_DOMAIN}`)
      expect(live!.status()).toBe(200)
      await beweis(page, '15-wieder-live')
    })
  })

  test.afterAll(async () => {
    if (!aktiv) return
    const db = serviceClient()
    try {
      const { data: kunde } = await db
        .from('customers')
        .select('id, user_id')
        .eq('contact_email', KUNDEN_EMAIL)
        .maybeSingle()
      if (kunde) {
        await db.from('seo_landingpages').delete().eq('customer_id', kunde.id)
        await db.from('contracts').delete().eq('customer_id', kunde.id)
        await db.from('upsell_orders').delete().eq('customer_id', kunde.id)
        await db.from('activated_upsells').delete().eq('customer_id', kunde.id)
        const { data: sites } = await db.from('sites').select('id').eq('customer_id', kunde.id)
        for (const s of sites || []) {
          await db.from('domains').delete().eq('site_id', s.id)
          await db.from('qa_reports').delete().eq('site_id', s.id)
        }
        await db.from('sites').delete().eq('customer_id', kunde.id)
        await db.from('demos').delete().eq('converted_customer_id', kunde.id)
        await db.from('customers').delete().eq('id', kunde.id)
        if (kunde.user_id) await db.auth.admin.deleteUser(kunde.user_id)
      }
      await db.from('demos').delete().like('prospect_name', `${FIRMA}%`)
      await db.from('leads').delete().eq('email', KUNDEN_EMAIL)
      const { data: admin } = await db
        .from('customers')
        .select('id, user_id')
        .eq('contact_email', ADMIN_EMAIL)
        .maybeSingle()
      if (admin) {
        await db.from('customers').delete().eq('id', admin.id)
        if (admin.user_id) await db.auth.admin.deleteUser(admin.user_id)
      }
    } catch (e) {
      console.warn('Generalprobe-Cleanup unvollständig (unkritisch):', e)
    }
  })
})
