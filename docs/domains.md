# Domain-Management — Betreiber-Dokumentation

## Architektur

Alle Kunden-Domains laufen auf **einem einzigen Vercel-Projekt** (Host-Routing).
Die Auslieferung erfolgt ueber `app/kundenseite/[host]` — der eingehende
`Host`-Header wird in `lib/hosting/site-cache.ts` auf eine `site_id` gemappt.

## Vercel Pro Plan — Domain-Limits

- **Soft Limit**: 100.000 Domains pro Projekt (Pro Plan)
- Bei Bedarf ueber Vercel Support erhoehbar
- **Rate Limit**: Domain-Loeschungen sind Rate-Limited (Vercel-seitig).
  Massenloeschungen sollten zeitlich gestreckt werden.

## Domain-Typen

### Apex-Domain (z.B. `maler-schmidt.de`)

- Erfordert **A-Record**: `@ -> {IP aus Vercel API}`
- Die IP wird NICHT hardcoded, sondern aus der Vercel Domains API gelesen
  (`GET /v6/domains/{domain}/config` → `aValues`)

### Subdomain (z.B. `www.maler-schmidt.de`)

- Erfordert **CNAME-Record**: `www -> {Ziel aus Vercel API}`
- Das CNAME-Ziel wird aus der Vercel API gelesen
  (`GET /v6/domains/{domain}/config` → `cnames`)

### Beide Varianten

Beim Anlegen einer Domain werden IMMER beide Varianten registriert:
- `kunde.de` + `www.kunde.de`
- Die vom Kunden eingegebene Variante wird als `ist_hauptdomain = true` markiert
- Die andere Variante leitet auf die Hauptdomain weiter (Vercel uebernimmt das automatisch)

## DNS-Werte

**Grundregel: DNS-Zielwerte kommen IMMER aus der Vercel API.**

Quellen (in Prioritaetsreihenfolge):
1. `POST /v10/projects/{id}/domains` Antwort → `verification[]`
2. `GET /v6/domains/{domain}/config` → `aValues` / `cnames`
3. Gespeicherte Werte in `domains.dns_anforderungen` (JSONB)
4. Fallback-Werte (nur wenn API nicht erreichbar, mit Warnung im Log)

Die frueheren hardcoded Werte (`76.76.21.21`, `cname.vercel-dns.com`) werden
nur noch als letzter Fallback verwendet, wenn die API nicht erreichbar ist.

## Status-Uebergaenge

```
WARTET_AUF_DNS  →  DNS_ERKANNT  →  AKTIV
       ↓                ↓
     FEHLER          FEHLER
```

- `WARTET_AUF_DNS` — Domain angelegt, DNS noch nicht konfiguriert (gelb)
- `DNS_ERKANNT` — DNS zeigt auf Vercel, SSL-Zertifikat wird ausgestellt (blau)
- `AKTIV` — Domain vollstaendig verifiziert und einsatzbereit (gruen)
- `FEHLER` — Fehlkonfiguration erkannt, mit spezifischer Fehlermeldung (rot)

## Automatisches Polling

Das Frontend prueft den Status automatisch:
- **Erste 15 Minuten**: alle 30 Sekunden
- **Danach**: alle 15 Minuten
- **Stopp**: wenn Status `AKTIV` oder `FEHLER`

## MX-Warnung

Im Dashboard wird eine **nicht ausblendbare Warnung** angezeigt:
Kunden sollen keine MX-, SPF-, DKIM- oder DMARC-Eintraege veraendern.
Registrar-Assistenten zum "Domain verbinden" koennen alle DNS-Eintraege
ueberschreiben und damit die Firmen-E-Mail zerstoeren.

## Datenbank-Schema

Tabelle `domains` (siehe `supabase/migrations/020_phase_g.sql` + `035_domain_robust.sql`):

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `dns_typ` | `text` | `'A'` oder `'CNAME'` (automatisch erkannt) |
| `dns_anforderungen` | `jsonb` | Array mit `{typ, name, wert}` aus Vercel API |
| `ist_hauptdomain` | `boolean` | Kanonische Domain (fuer Redirects) |
| `partner_domain_id` | `uuid` | Verknuepfung apex ↔ www |

## API-Endpunkte

| Methode | Pfad | Beschreibung |
|---------|------|--------------|
| `GET` | `/api/sites/{siteId}/domains` | Alle Domains der Site |
| `POST` | `/api/sites/{siteId}/domains` | Domain + Partner anlegen |
| `POST` | `/api/sites/{siteId}/domains/{domainId}` | DNS-Recheck (Legacy) |
| `POST` | `/api/sites/{siteId}/domains/{domainId}/check` | Automatischer Status-Check |
| `PATCH` | `/api/sites/{siteId}/domains/{domainId}` | Hauptdomain umschalten |
| `DELETE` | `/api/sites/{siteId}/domains/{domainId}` | Domain + Partner entfernen |
