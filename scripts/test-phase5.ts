/**
 * Phase-5-Test (Stripe Testmode + Zugang + SEO-Upsell): npx tsx scripts/test-phase5.ts
 *
 * Deckt §6 des MVP-Finish-Prompts ab:
 *  - Checkout: subscription-Mode, card+sepa_debit, Setup-Fee aus Config,
 *    Laufzeit-Text (24/12/3) NUR aus config/vertraege.ts, metadata lead/site/plan
 *  - Webhook-Idempotenz über processed_webhook_events (Migration 032)
 *  - Provisioning: Magic-Link (Resend oder Log-Stub) mit Passwort-Fallback
 *  - Dunning zeitbasiert: Mails Tag 0/3/7, Sperre (suspended) nach 14 Tagen —
 *    Schwellen NUR aus config/vertraege.ts, Eskalation über täglichen Cron
 *  - SEO-Unterseiten-Abo: Kauf → eigener Vertrag → Monats-Cron → Klick-Freigabe
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { DUNNING_ZEITPLAN, HAUPTPRODUKT_KONDITIONEN, vertragsKonditionenText } from '../config/vertraege'
import { sperreFaellig, stufeFuerTage, tageUeberfaellig } from '../lib/dunning'
import { PACKAGES } from '../lib/packages'

let fehler = 0
function check(name: string, bedingung: boolean) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}`)
  if (!bedingung) fehler++
}

const root = join(__dirname, '..')
const lese = (pfad: string) => readFileSync(join(root, pfad), 'utf8')

// ------------------------------------------------------------
// §6.1 Checkout: Zahlarten, Setup-Fee, Metadata, Laufzeit aus Config
// ------------------------------------------------------------
{
  const stripe = lese('lib/stripe.ts')
  check('Checkout: subscription-Mode', stripe.includes("mode: 'subscription'"))
  check('Checkout: card + sepa_debit', stripe.includes("payment_method_types: ['card', 'sepa_debit']"))
  check('Checkout: Setup-Fee als One-time-Posten aus Config (0 = kein Posten)',
    stripe.includes('pkg.setupFee > 0') && stripe.includes('unit_amount: pkg.setupFee * 100'))
  check('Checkout: metadata lead_id/site_id/plan (additiv zu demo_id/paket)',
    stripe.includes('lead_id: params.demoId') &&
    stripe.includes("site_id: params.siteId || ''") &&
    stripe.includes('plan: params.paket') &&
    stripe.includes('demo_id: params.demoId'))
  check('Checkout: Laufzeit-Text kommt aus config/vertraege.ts',
    stripe.includes('vertragsKonditionenText') && !/Laufzeit 24 Monate/.test(stripe))
  check('Config: Konditionen 24/12/3',
    HAUPTPRODUKT_KONDITIONEN.mindestlaufzeit_monate === 24 &&
    HAUPTPRODUKT_KONDITIONEN.verlaengerung_monate === 12 &&
    HAUPTPRODUKT_KONDITIONEN.kuendigungsfrist_monate === 3)
  check('Config: Konditionen-Text nennt alle drei Werte',
    vertragsKonditionenText().includes('24 Monate') &&
    vertragsKonditionenText().includes('12 Monate') &&
    vertragsKonditionenText().includes('3 Monaten'))
  check('Pakete: setupFee in jedem Tier als Zahl gepflegt',
    PACKAGES.every((p) => typeof p.setupFee === 'number' && p.setupFee >= 0))
}

// ------------------------------------------------------------
// §6.2 Webhook-Idempotenz (processed_webhook_events)
// ------------------------------------------------------------
{
  const migration = 'supabase/migrations/032_processed_webhook_events.sql'
  check('Idempotenz: Migration 032 existiert', existsSync(join(root, migration)))
  const sql = existsSync(join(root, migration)) ? lese(migration) : ''
  check('Idempotenz: Tabelle additiv mit event_id als Primary Key',
    sql.includes('CREATE TABLE IF NOT EXISTS processed_webhook_events') &&
    sql.includes('event_id text PRIMARY KEY'))

  const webhook = lese('app/api/webhooks/stripe/route.ts')
  check('Idempotenz: Webhook prüft Event-ID vor der Verarbeitung',
    webhook.includes("from('processed_webhook_events')") &&
    webhook.includes("eq('event_id', event.id)"))
  check('Idempotenz: Marker erst NACH erfolgreicher Verarbeitung (500 → Stripe-Retry)',
    webhook.includes('antwort.status === 200') &&
    webhook.includes('event_id: event.id, event_type: event.type'))
  check('Idempotenz: fachliche Zweitschicht bleibt (Demo CONVERTED)',
    webhook.includes("demo.status === 'CONVERTED'"))
}

// ------------------------------------------------------------
// §6.2 Provisioning: Magic-Link mit Fallback
// ------------------------------------------------------------
{
  const webhook = lese('app/api/webhooks/stripe/route.ts')
  check('Zugang: Magic-Link über supabase.auth.admin.generateLink',
    webhook.includes('generateLink') && webhook.includes("type: 'magiclink'"))
  check('Zugang: Magic-Link-Mail wird versendet', webhook.includes('sendMagicLinkEmail'))
  check('Zugang: Passwort-Fallback bleibt bestehen',
    webhook.includes('sendInvitationEmail') && webhook.includes('MAIL_FEHLGESCHLAGEN'))

  const email = lese('lib/email.ts')
  check('Zugang: sendMagicLinkEmail mit Log-Stub ohne RESEND_API_KEY',
    email.includes('export async function sendMagicLinkEmail') &&
    email.includes('[MAIL-STUB]') &&
    email.includes('process.env.RESEND_API_KEY'))
}

// ------------------------------------------------------------
// §6.2 Dunning: zeitbasiert Tag 0/3/7 → Sperre nach 14 Tagen
// ------------------------------------------------------------
check('Dunning: Zeitplan aus Config (Tage 0/3/7, Sperre 14)',
  JSON.stringify(DUNNING_ZEITPLAN.mahnTage) === JSON.stringify([0, 3, 7]) &&
  DUNNING_ZEITPLAN.sperreNachTagen === 14)
check('Dunning: tageUeberfaellig rechnet volle Tage',
  tageUeberfaellig('2026-07-01', '2026-07-01') === 0 &&
  tageUeberfaellig('2026-07-01', '2026-07-04') === 3 &&
  tageUeberfaellig('2026-07-01', '2026-07-15') === 14)
check('Dunning: Stufen folgen dem Zeitplan (0→1, 2→1, 3→2, 6→2, 7→3)',
  stufeFuerTage(0) === 1 && stufeFuerTage(2) === 1 &&
  stufeFuerTage(3) === 2 && stufeFuerTage(6) === 2 &&
  stufeFuerTage(7) === 3 && stufeFuerTage(100) === 3)
check('Dunning: Sperre exakt ab Tag 14',
  !sperreFaellig(13) && sperreFaellig(14) && sperreFaellig(30))
{
  const webhook = lese('app/api/webhooks/stripe/route.ts')
  check('Dunning: Webhook eskaliert zeitbasiert statt pro Event (+1 entfernt)',
    webhook.includes('stufeFuerTage(tageUeberfaellig(') &&
    !webhook.includes('mahnstufe ?? 0) + 1'))
  check('Dunning: Stufen nur aufwärts (idempotent bei Event-Doppeln)',
    webhook.includes('zielStufe <= (contract.mahnstufe ?? 0)'))

  const cron = lese('app/api/cron/dunning/route.ts')
  check('Dunning-Cron: existiert mit fail-closed Cron-Auth',
    cron.includes('istCronAutorisiert') && cron.includes("status: 401"))
  check('Dunning-Cron: Eskalation + Sperre aus lib/dunning (Config-getrieben)',
    cron.includes('stufeFuerTage') && cron.includes('sperreFaellig') && cron.includes('tageUeberfaellig'))
  check('Dunning-Cron: Sperre setzt gesperrt + Cache-Invalidierung + Task',
    cron.includes('gesperrt: true') && cron.includes('revalidateSite(') && cron.includes('DUNNING_ESKALIERT'))
  check('Dunning-Cron: Sperr-Mitteilung (Stufe 4) an den Kunden',
    cron.includes('sendDunningEmail(kontakt.email, kontakt.name, 4)'))

  const vercelJson = lese('vercel.json')
  check('Dunning-Cron: täglich in vercel.json registriert', vercelJson.includes('/api/cron/dunning'))

  const email = lese('lib/email.ts')
  check('Dunning: Mail-Stufe 4 = Sperr-Mitteilung vorhanden',
    email.includes('Math.min(4') && email.includes('vor\\u00fcbergehend deaktiviert'))
}

// ------------------------------------------------------------
// §6.3 SEO-Unterseiten-Abo: Kauf → Vertrag → Cron → Freigabe
// ------------------------------------------------------------
{
  const upsells = lese('config/upsells.ts')
  check('SEO-Abo: Produkt in config/upsells.ts', upsells.includes("key: 'seo-unterseiten-abo'"))

  const webhook = lese('app/api/webhooks/stripe/route.ts')
  check('SEO-Abo: Upsell-Kauf erzeugt eigenen Vertrag (upsell:-Kennung)',
    webhook.includes('handleUpsellCheckout') && webhook.includes('upsell:'))

  const seoCron = lese('app/api/cron/seo-plan/route.ts')
  check('SEO-Cron: monatlich, fail-closed Cron-Auth, Kill-Switch',
    seoCron.includes('istCronAutorisiert') && seoCron.includes('generierungGesperrt'))
  check('SEO-Cron: idempotent pro Site+Monat, Freigabe-Status',
    seoCron.includes('WARTET_AUF_FREIGABE') && seoCron.includes('monat'))
  check('SEO-Cron: in vercel.json registriert', lese('vercel.json').includes('/api/cron/seo-plan'))

  const freigabe = lese('app/api/sites/[siteId]/seo/[lpId]/route.ts')
  check('SEO-Freigabe: 1-Klick-Freigabe setzt FREIGEGEBEN',
    freigabe.includes("'FREIGEGEBEN'") && freigabe.includes('freigegeben_am'))
}

console.log(fehler === 0 ? '\nAlle Phase-5-Tests grün.' : `\n${fehler} Test(s) rot.`)
process.exit(fehler === 0 ? 0 : 1)
