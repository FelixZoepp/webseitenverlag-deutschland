/**
 * Verhinderungs-Regel zu J-006 / B-15: Cron-Auth ist fail-closed.
 *
 * Prüft (1) die Helper-Logik direkt und (2) dass ALLE Cron-Routen den
 * Helper benutzen — ein neuer/geänderter Cron mit dem alten
 * "Bearer undefined"-Muster lässt diesen Test fehlschlagen.
 *
 * Lauf: npm run test:cron-auth
 */
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { istCronAutorisiert } from '../lib/cron-auth'

let fehler = 0
function check(name: string, ok: boolean, detail?: string) {
  console.log(`${ok ? '✅' : '❌'} ${name}${detail ? ` — ${detail}` : ''}`)
  if (!ok) fehler++
}

function req(auth?: string): Request {
  return new Request('http://localhost/api/cron/test', {
    headers: auth ? { authorization: auth } : {},
  })
}

// 1) Helper-Logik
delete process.env.CRON_SECRET
check('ohne CRON_SECRET: kein Header → abgelehnt', istCronAutorisiert(req()) === false)
check(
  'ohne CRON_SECRET: "Bearer undefined" → abgelehnt (J-006)',
  istCronAutorisiert(req('Bearer undefined')) === false
)
check('ohne CRON_SECRET: "Bearer " → abgelehnt', istCronAutorisiert(req('Bearer ')) === false)

process.env.CRON_SECRET = 'test-geheimnis-123'
check('mit CRON_SECRET: korrekter Header → erlaubt', istCronAutorisiert(req('Bearer test-geheimnis-123')) === true)
check('mit CRON_SECRET: falscher Header → abgelehnt', istCronAutorisiert(req('Bearer falsch')) === false)
check('mit CRON_SECRET: kein Header → abgelehnt', istCronAutorisiert(req()) === false)

// 2) Alle Cron-Routen nutzen den Helper (kein Inline-Vergleich mehr)
const cronDir = join(__dirname, '..', 'app', 'api', 'cron')
const routen = readdirSync(cronDir)
check('Cron-Routen gefunden', routen.length >= 6, `${routen.length} Routen`)
for (const name of routen) {
  const quelle = readFileSync(join(cronDir, name, 'route.ts'), 'utf8')
  check(`${name}: nutzt istCronAutorisiert`, quelle.includes('istCronAutorisiert'))
  check(
    `${name}: kein Inline-Vergleich gegen CRON_SECRET`,
    !quelle.includes('Bearer ${process.env.CRON_SECRET}')
  )
}

console.log(fehler === 0 ? '\nAlle Cron-Auth-Checks grün.' : `\n${fehler} Fehler.`)
process.exit(fehler === 0 ? 0 : 1)
