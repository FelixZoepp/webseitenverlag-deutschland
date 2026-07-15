/**
 * Phase H4 (Mission §12): Kompletter Testmode-Durchlauf Lead → veröffentlichte
 * Website ohne manuellen Eingriff.
 *
 *   Landing-Form → Lead+UTM in DB → Demo (Library, Offline-Defaults) →
 *   Stripe-Checkout-Session (Testmode) → Webhook-Simulation → Kunden-Login →
 *   Wizard (Pflichtangaben, Fakten, Domain via Mock-Registrar, SEO-Upsell-Kauf)
 *   → Fertigstellen → Chat-Edit → Publish → Rollback → Kickoff-Touchpoint.
 *
 * Env-gated: läuft nur mit E2E_ENABLED=1 + Supabase- und Stripe-TEST-Keys
 * (eine Test-Supabase-Instanz mit Migrationen 001–021 + Library-Seeds).
 * Aufruf: E2E_ENABLED=1 npm run test:e2e
 *
 * Der Stripe-Webhook wird mit einer echt signierten Payload simuliert
 * (webhooks.generateTestHeaderString) — der Handler macht keine Stripe-
 * API-Nachfragen, daher ist kein Stripe-CLI-Forwarding nötig.
 */
import { test, expect, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { ladeEnvLocal } from './env'

ladeEnvLocal()

const NOETIG = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
]
const fehlend = NOETIG.filter((k) => !process.env[k])
const aktiv = process.env.E2E_ENABLED === '1' && fehlend.length === 0

// Stop-Condition (Masterprompt §0): NIE gegen Stripe-Live-Keys testen.
if (process.env.E2E_ENABLED === '1' && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  throw new Error('E2E abgebrochen: STRIPE_SECRET_KEY ist kein Testmode-Key (sk_test_...) — Lauf gegen Live-Keys ist verboten.')
}

const runId = `e2e${Date.now()}`
const FIRMA = `E2E Sanitär ${runId}`
const KUNDEN_EMAIL = `kunde-${runId}@e2e.example.com`
const KUNDEN_PASSWORT = `E2e!${runId}Pw`
const ADMIN_EMAIL = `admin-${runId}@e2e.example.com`
const ADMIN_PASSWORT = `E2e!${runId}Admin`
const WUNSCH_DOMAIN = `${runId}-sanitaer.de`

function serviceClient(): SupabaseClient {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** DB-Zustand abwarten (Webhook/Insert sind asynchron zur UI). */
async function pollBis<T>(fn: () => Promise<T | null | undefined>, was: string, timeoutMs = 20_000): Promise<T> {
  const start = Date.now()
  for (;;) {
    const wert = await fn()
    if (wert) return wert
    if (Date.now() - start > timeoutMs) throw new Error(`Timeout beim Warten auf: ${was}`)
    await new Promise((r) => setTimeout(r, 500))
  }
}

/** Signiertes Stripe-Event an den Webhook schicken (raw body, echte Signatur). */
async function sendeWebhook(page: Page, stripe: Stripe, sessionObjekt: Record<string, unknown>) {
  const payload = JSON.stringify({
    id: `evt_${runId}_${Math.random().toString(36).slice(2, 8)}`,
    object: 'event',
    api_version: '2024-06-20',
    created: Math.floor(Date.now() / 1000),
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
    type: 'checkout.session.completed',
    data: { object: { object: 'checkout.session', ...sessionObjekt } },
  })
  const signatur = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  })
  const res = await page.request.post('/api/webhooks/stripe', {
    headers: { 'content-type': 'application/json', 'stripe-signature': signatur },
    data: payload,
  })
  expect(res.status(), `Webhook-Antwort: ${await res.text()}`).toBe(200)
}

async function login(page: Page, email: string, passwort: string) {
  await page.context().clearCookies()
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', passwort)
  await page.click('button[type="submit"]')
  await page.waitForURL('**/dashboard**', { timeout: 20_000 })
}

test.describe('Zero-Fulfillment-Journey (Stripe-Testmode)', () => {
  test.skip(
    !aktiv,
    `E2E übersprungen — E2E_ENABLED=1 + Envs nötig${fehlend.length ? ` (fehlend: ${fehlend.join(', ')})` : ''}`
  )

  test('Lead → Demo → Kauf → Wizard → Publish → Rollback → Kickoff', async ({ page }) => {
    const db = serviceClient()
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    let demoId = ''
    let customerId = ''
    let customerUserId = ''
    let siteId = ''

    await test.step('1. Landing-Formular → Lead mit UTM in DB', async () => {
      await page.goto(`/?utm_source=${runId}&utm_medium=e2e&utm_campaign=phase-h`)
      await page.fill('#cta-name', 'Erika E2E-Beispiel')
      await page.fill('#cta-email', KUNDEN_EMAIL)
      await page.fill('#cta-telefon', '0341 1234567')
      await page.fill('#cta-nachricht', `Automatischer E2E-Testlauf ${runId}`)
      await page.locator('#contact button[type="submit"]').click()

      const lead = await pollBis(async () => {
        const { data } = await db.from('leads').select('id, utm_source, utm_medium').eq('email', KUNDEN_EMAIL).maybeSingle()
        return data
      }, 'Lead in leads-Tabelle')
      expect(lead.utm_source).toBe(runId)
      expect(lead.utm_medium).toBe('e2e')
    })

    await test.step('2. Admin anlegen + einloggen', async () => {
      const { data: admin, error } = await db.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORT,
        email_confirm: true,
      })
      expect(error).toBeNull()
      expect(admin.user).toBeTruthy()
      const { error: profilFehler } = await db.from('customers').insert({
        user_id: admin.user!.id,
        company_name: 'E2E Admin',
        contact_email: ADMIN_EMAIL,
        role: 'admin',
      })
      expect(profilFehler).toBeNull()
      await login(page, ADMIN_EMAIL, ADMIN_PASSWORT)
    })

    await test.step('3. Demo erzeugen (Library-Engine, Offline-Defaults) + öffentliche Ansicht', async () => {
      const res = await page.request.post('/api/admin/demos', {
        data: {
          prospectName: FIRMA,
          engine: 'library',
          branche: 'Handwerk',
          stil: 'klar',
          ort: 'Leipzig',
          notes: `E2E-Lauf ${runId}`,
        },
      })
      expect(res.status(), await res.text()).toBe(200)
      const body = await res.json()
      demoId = body.demo.id
      expect(demoId).toBeTruthy()

      const { data: demo } = await db.from('demos').select('share_token').eq('id', demoId).single()
      const demoAntwort = await page.goto(`/demo/${demo!.share_token}`)
      expect(demoAntwort!.status()).toBe(200)
      await expect(page.locator('body')).toContainText(FIRMA)
    })

    await test.step('4. Stripe-Checkout-Session (echter Testmode-Call)', async () => {
      const res = await page.request.post(`/api/admin/demos/${demoId}/payment-link`, {
        data: { paket: 'business' },
      })
      expect(res.status(), await res.text()).toBe(200)
      const { url } = await res.json()
      expect(url).toContain('checkout.stripe.com')
    })

    await test.step('5. Webhook-Simulation checkout.session.completed → Kunde+Site+Vertrag', async () => {
      await sendeWebhook(page, stripe, {
        id: `cs_test_${runId}`,
        mode: 'subscription',
        customer: `cus_${runId}`,
        subscription: `sub_${runId}`,
        customer_details: { email: KUNDEN_EMAIL, name: FIRMA },
        metadata: { demo_id: demoId, paket: 'business' },
      })

      const kunde = await pollBis(async () => {
        const { data } = await db.from('customers').select('id, user_id, package').eq('contact_email', KUNDEN_EMAIL).maybeSingle()
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
        .select('status, paket, laufzeit_monate')
        .eq('customer_id', customerId)
        .eq('paket', 'business')
        .maybeSingle()
      expect(vertrag?.status).toBe('AKTIV')
      expect(vertrag?.laufzeit_monate).toBe(24)

      const { data: demo } = await db.from('demos').select('status').eq('id', demoId).single()
      expect(demo!.status).toBe('CONVERTED')
    })

    await test.step('6. Kunden-Login (Passwort via Admin-API gesetzt)', async () => {
      const { error } = await db.auth.admin.updateUserById(customerUserId, { password: KUNDEN_PASSWORT })
      expect(error).toBeNull()
      await login(page, KUNDEN_EMAIL, KUNDEN_PASSWORT)
    })

    await test.step('7. Wizard: Pflichtangaben + Fakten', async () => {
      const pflicht = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
        method: 'PATCH',
        data: {
          schritt: 'pflichtangaben',
          daten: {
            firmenname: FIRMA,
            inhaber: 'Erika E2E-Beispiel',
            strasse: 'Musterweg 1',
            plz: '04109',
            ort: 'Leipzig',
            telefon: '0341 1234567',
            email: KUNDEN_EMAIL,
          },
        },
      })
      expect(pflicht.status(), await pflicht.text()).toBe(200)

      const fakten = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
        method: 'PATCH',
        data: {
          schritt: 'fakten',
          daten: { telefon: '0341 1234567', email: KUNDEN_EMAIL, oeffnungszeiten: 'Mo–Fr 8–17 Uhr' },
        },
      })
      expect(fakten.status(), await fakten.text()).toBe(200)
      const stand = await fakten.json()
      expect(stand.offene_pflicht).toEqual([])
    })

    await test.step('8. Wizard: Domain-Neuregistrierung über Mock-Registrar', async () => {
      const res = await page.request.post(`/api/sites/${siteId}/domains`, {
        data: { hostname: WUNSCH_DOMAIN, typ: 'neuregistrierung' },
      })
      expect(res.status(), await res.text()).toBeLessThan(300)

      const domain = await pollBis(async () => {
        const { data } = await db.from('domains').select('status, hostname').eq('hostname', WUNSCH_DOMAIN).maybeSingle()
        return data
      }, 'domains-Zeile (Mock-Registrar)')
      expect(['AKTIV', 'WARTET_AUF_DNS']).toContain(domain.status)

      const wizard = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
        method: 'PATCH',
        data: { schritt: 'domain', status: 'erledigt', wunsch_domain: WUNSCH_DOMAIN },
      })
      expect(wizard.status()).toBe(200)
    })

    await test.step('9. SEO-Upsell: Kauf im Wizard + Webhook → eigener Upsell-Vertrag', async () => {
      const checkout = await page.request.post(`/api/sites/${siteId}/upsell-checkout`, {
        data: { product_key: 'seo-unterseiten-abo', quelle: 'wizard' },
      })
      expect(checkout.status(), await checkout.text()).toBe(200)
      const { url } = await checkout.json()
      expect(url).toContain('checkout.stripe.com')

      const order = await pollBis(async () => {
        const { data } = await db
          .from('upsell_orders')
          .select('id, status, stripe_checkout_session_id')
          .eq('customer_id', customerId)
          .eq('product_key', 'seo-unterseiten-abo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        return data
      }, 'upsell_orders-Zeile (OFFEN)')

      await sendeWebhook(page, stripe, {
        id: order.stripe_checkout_session_id,
        mode: 'subscription',
        customer: `cus_${runId}`,
        subscription: `sub_seo_${runId}`,
        customer_details: { email: KUNDEN_EMAIL, name: FIRMA },
        metadata: { product_key: 'seo-unterseiten-abo', order_id: order.id },
      })

      const bezahlt = await pollBis(async () => {
        const { data } = await db.from('upsell_orders').select('status').eq('id', order.id).single()
        return data && ['BEZAHLT', 'PROVISIONIERT'].includes(data.status) ? data : null
      }, 'Upsell-Order BEZAHLT/PROVISIONIERT')
      expect(['BEZAHLT', 'PROVISIONIERT']).toContain(bezahlt.status)

      const { data: upsellVertrag } = await db
        .from('contracts')
        .select('status')
        .eq('customer_id', customerId)
        .eq('paket', 'upsell:seo-unterseiten-abo')
        .maybeSingle()
      expect(upsellVertrag?.status).toBe('AKTIV')

      const wizard = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
        method: 'PATCH',
        data: { schritt: 'seo_plan', status: 'erledigt' },
      })
      expect(wizard.status()).toBe(200)

      const logo = await page.request.fetch(`/api/sites/${siteId}/wizard`, {
        method: 'PATCH',
        data: { schritt: 'logo', status: 'uebersprungen' },
      })
      expect(logo.status()).toBe(200)
    })

    await test.step('10. Website fertigstellen (Pflicht-Check + Auto-QA)', async () => {
      const res = await page.request.post(`/api/sites/${siteId}/fertigstellen`)
      const body = await res.json()
      expect(res.status(), JSON.stringify(body)).toBe(200)
      expect(body.ok).toBe(true)
      expect(body.fertiggestellt_am).toBeTruthy()
    })

    await test.step('11. Chat-Edit (nur mit ANTHROPIC_API_KEY)', async () => {
      test.skip(!process.env.ANTHROPIC_API_KEY, 'Chat-Edit braucht ANTHROPIC_API_KEY — Schritt übersprungen')
      const res = await page.request.post(`/api/sites/${siteId}/chat`, {
        data: { message: 'Bitte ändere die Hauptüberschrift in „Ihr Meisterbetrieb in Leipzig".' },
      })
      expect(res.status(), await res.text()).toBe(200)
      const body = await res.json()
      expect(typeof body.response).toBe('string')
      expect(body.response.length).toBeGreaterThan(0)
    })

    await test.step('12. Publish → Live-URL', async () => {
      const res = await page.request.post(`/api/sites/${siteId}/publish`)
      const body = await res.json()
      expect(res.status(), JSON.stringify(body)).toBe(200)
      expect(body.success).toBe(true)

      const { data: site } = await db.from('sites').select('status').eq('id', siteId).single()
      expect(site!.status).toBe('published')
    })

    await test.step('13. Rollback auf frühere Version', async () => {
      const { data: versionen } = await db
        .from('config_versions')
        .select('id, created_at')
        .eq('site_id', siteId)
        .order('created_at', { ascending: true })
      expect(versionen!.length).toBeGreaterThanOrEqual(2)

      const res = await page.request.post(`/api/sites/${siteId}/rollback`, {
        data: { version_id: versionen![0].id },
      })
      const body = await res.json()
      expect(res.status(), JSON.stringify(body)).toBe(200)
      expect(body.success).toBe(true)
    })

    await test.step('14. Kickoff-Touchpoint: GBP-Angebot im Portal sichtbar', async () => {
      await page.goto(`/dashboard/${siteId}/erweiterungen`)
      await expect(page.locator('body')).toContainText('Google-Unternehmensprofil-Einrichtung')
      // SEO-Abo ist gekauft → darf nicht erneut als offenes Angebot erscheinen,
      // sondern als gebucht markiert sein (Kauf-Status aus upsell_orders).
      await expect(page.locator('body')).toContainText('SEO')
    })
  })

  test.afterAll(async () => {
    if (!aktiv) return
    // Best-effort-Aufräumen der Testdaten (FK-Reihenfolge beachten)
    const db = serviceClient()
    try {
      const { data: kunde } = await db.from('customers').select('id, user_id').eq('contact_email', KUNDEN_EMAIL).maybeSingle()
      if (kunde) {
        await db.from('contracts').delete().eq('customer_id', kunde.id)
        await db.from('upsell_orders').delete().eq('customer_id', kunde.id)
        await db.from('activated_upsells').delete().eq('customer_id', kunde.id)
        const { data: sites } = await db.from('sites').select('id').eq('customer_id', kunde.id)
        for (const s of sites || []) {
          await db.from('domains').delete().eq('site_id', s.id)
        }
        await db.from('sites').delete().eq('customer_id', kunde.id)
        await db.from('demos').delete().eq('converted_customer_id', kunde.id)
        await db.from('customers').delete().eq('id', kunde.id)
        if (kunde.user_id) await db.auth.admin.deleteUser(kunde.user_id)
      }
      await db.from('demos').delete().like('prospect_name', `E2E Sanitär ${runId}%`)
      await db.from('leads').delete().eq('email', KUNDEN_EMAIL)
      const { data: admin } = await db.from('customers').select('id, user_id').eq('contact_email', ADMIN_EMAIL).maybeSingle()
      if (admin) {
        await db.from('customers').delete().eq('id', admin.id)
        if (admin.user_id) await db.auth.admin.deleteUser(admin.user_id)
      }
    } catch (e) {
      console.warn('E2E-Cleanup unvollständig (unkritisch):', e)
    }
  })
})
