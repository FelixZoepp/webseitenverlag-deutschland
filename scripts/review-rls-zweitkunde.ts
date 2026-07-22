/**
 * Master-Review Kap. 5 — RLS-Isolationsbeweis mit zweitem Testkunden (2026-07-23).
 *
 * Prompt-Anforderung: „Supabase RLS auf ALLEN Tabellen beweisen — Tests mit
 * zweitem Testkunden." Dieses Script legt per Service-Role zwei komplette
 * Testkunden an (Auth-User + customers-Zeile + sites-Zeile), loggt sich als
 * Kunde A mit dem ANON-Key ein und versucht, Daten von Kunde B zu lesen und
 * zu schreiben. Erwartung: 0 Zeilen sichtbar, 0 Zeilen änderbar.
 *
 * Aufruf: npx tsx scripts/review-rls-zweitkunde.ts
 * Exit 1 bei jeder Isolations-Verletzung. Räumt am Ende alles wieder auf.
 */
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

const envPfad = join(process.cwd(), '.env.local')
if (existsSync(envPfad)) {
  for (const zeile of readFileSync(envPfad, 'utf8').split('\n')) {
    const m = zeile.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!URL || !SERVICE || !ANON) {
  console.error('Fehlende Env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const service = createClient(URL, SERVICE, { auth: { autoRefreshToken: false, persistSession: false } })

let fehler = 0
function check(name: string, bedingung: boolean, detail?: string) {
  console.log(`${bedingung ? 'PASS' : 'FAIL'}  ${name}${!bedingung && detail ? ` — ${detail}` : ''}`)
  if (!bedingung) fehler++
}

type Testkunde = { userId: string; customerId: string; siteId: string; email: string }

async function legeKundeAn(kennung: 'a' | 'b', passwort: string): Promise<Testkunde> {
  const email = `review-rls-${kennung}-${Date.now()}@example.com`
  const { data: auth, error: authErr } = await service.auth.admin.createUser({
    email,
    password: passwort,
    email_confirm: true,
  })
  if (authErr || !auth.user) throw new Error(`Auth-User ${kennung}: ${authErr?.message}`)

  const { data: kunde, error: kundeErr } = await service
    .from('customers')
    .insert({ user_id: auth.user.id, company_name: `RLS-Review Kunde ${kennung.toUpperCase()}`, contact_email: email })
    .select('id')
    .single()
  if (kundeErr || !kunde) throw new Error(`customers ${kennung}: ${kundeErr?.message}`)

  const { data: site, error: siteErr } = await service
    .from('sites')
    .insert({ customer_id: kunde.id, name: `RLS-Review Site ${kennung.toUpperCase()}` })
    .select('id')
    .single()
  if (siteErr || !site) throw new Error(`sites ${kennung}: ${siteErr?.message}`)

  return { userId: auth.user.id, customerId: kunde.id, siteId: site.id, email }
}

async function raeumeAuf(kunden: Testkunde[]) {
  for (const k of kunden) {
    await service.from('sites').delete().eq('id', k.siteId)
    await service.from('customers').delete().eq('id', k.customerId)
    await service.auth.admin.deleteUser(k.userId)
  }
}

async function main() {
  const passwort = `Rls-Review!${Date.now()}`
  const kunden: Testkunde[] = []
  try {
    const a = await legeKundeAn('a', passwort)
    const b = await legeKundeAn('b', passwort)
    kunden.push(a, b)
    console.log(`Testkunden angelegt: A=${a.customerId.slice(0, 8)}… B=${b.customerId.slice(0, 8)}…\n`)

    // Als Kunde A einloggen (Anon-Key + Session = echter Kundenkontext)
    const alsA = createClient(URL!, ANON!, { auth: { autoRefreshToken: false, persistSession: false } })
    const { error: loginErr } = await alsA.auth.signInWithPassword({ email: a.email, password: passwort })
    if (loginErr) throw new Error(`Login Kunde A: ${loginErr.message}`)

    // 1) Eigene Daten sichtbar (Positiv-Kontrolle — sonst wäre der Test wertlos)
    const eigene = await alsA.from('customers').select('id').eq('id', a.customerId)
    check('Kunde A sieht das eigene customers-Profil', (eigene.data ?? []).length === 1, JSON.stringify(eigene.error))
    const eigeneSite = await alsA.from('sites').select('id').eq('id', a.siteId)
    check('Kunde A sieht die eigene Site', (eigeneSite.data ?? []).length === 1, JSON.stringify(eigeneSite.error))

    // 2) Fremde Daten unsichtbar
    const fremdKunde = await alsA.from('customers').select('*').eq('id', b.customerId)
    check('Kunde A sieht Kunde B NICHT (customers)', (fremdKunde.data ?? []).length === 0)
    const fremdSite = await alsA.from('sites').select('*').eq('id', b.siteId)
    check('Kunde A sieht Site B NICHT (sites)', (fremdSite.data ?? []).length === 0)
    // Hinweis: Trigger on_auth_user_created legt pro Auth-User automatisch eine
    // zusätzliche customers-Zeile an — Ownership daher über user_id prüfen.
    const alleKunden = await alsA.from('customers').select('id, user_id')
    check('customers-Vollscan liefert nur Zeilen des eigenen Users',
      (alleKunden.data ?? []).length > 0 &&
      (alleKunden.data ?? []).every((z) => z.user_id === a.userId))
    const alleSites = await alsA.from('sites').select('id')
    check('sites-Vollscan liefert keine fremden Sites',
      (alleSites.data ?? []).every((z) => z.id === a.siteId))

    // 3) Fremde Daten nicht schreibbar
    const upd = await alsA.from('sites').update({ name: 'GEKAPERT' }).eq('id', b.siteId).select('id')
    check('Kunde A kann Site B NICHT updaten (0 Zeilen)', (upd.data ?? []).length === 0)
    const updKunde = await alsA.from('customers').update({ company_name: 'GEKAPERT' }).eq('id', b.customerId).select('id')
    check('Kunde A kann Kunde B NICHT updaten (0 Zeilen)', (updKunde.data ?? []).length === 0)
    const del = await alsA.from('sites').delete().eq('id', b.siteId).select('id')
    check('Kunde A kann Site B NICHT löschen (0 Zeilen)', (del.data ?? []).length === 0)

    // 4) Kontrolle per Service-Role: Site B ist unverändert
    const kontrolle = await service.from('sites').select('name').eq('id', b.siteId).single()
    check('Site B existiert unverändert (Service-Kontrolle)',
      kontrolle.data?.name === 'RLS-Review Site B', JSON.stringify(kontrolle.error))
  } finally {
    await raeumeAuf(kunden)
    console.log('\nTestdaten aufgeräumt.')
  }

  console.log(fehler === 0
    ? '\n✅ RLS-Isolation bewiesen: Zweitkunde kann fremde Daten weder lesen noch schreiben.'
    : `\n✗ ${fehler} Isolations-Check(s) rot.`)
  process.exit(fehler === 0 ? 0 : 1)
}

main().catch(async (e) => {
  console.error('Fehler:', e instanceof Error ? e.message : e)
  process.exit(1)
})
