# Go-Live-Flow — Design-Spec

## Ziel

Admin kann eine bezahlte Kunden-Site mit einem Klick freischalten: noindex wird entfernt, Subdomain oder Custom Domain wird aktiv, SEO-Tags gehen scharf, Kunde bekommt Zugang zum Dashboard. Halbautomatischer Flow — Zahlung erstellt automatisch Contract + Site, aber Go-Live erst nach manueller Admin-Freigabe (Qualitätsprüfung).

## Ablauf

```
Stripe checkout.session.completed (existiert bereits)
  → Contract + Site + Kunden-Account erstellt
  → Demo-Status → CONVERTED
  → Site: noindex=true, status=BEREIT

Admin öffnet /admin/vertraege oder /admin/customers/[id]
  → Sieht Site mit Status "BEREIT"
  → Klickt "Freischalten"
  → Modal: "Hat der Kunde eine eigene Domain?"
    → JA: Domain-Eingabefeld → Vercel-API hängt Domain an
         → DNS-Anleitung generiert (CNAME auf cname.vercel-dns.com)
         → Domain-Status: WARTET_AUF_DNS
    → NEIN: Subdomain automatisch vergeben
         → {firmenname-slug}.webseitenverlag-deutschland.de
  → noindex → false
  → status → LIVE
  → Kunden-Sitemap aktiv
  → SEO-Tags scharf (canonical, OG, JSON-LD)
```

## Komponenten

### 1. Freischalt-API

**Route:** `POST /api/admin/sites/[siteId]/freischalten`

**Request Body:**
```ts
{
  domain?: string  // Custom Domain (optional, z.B. "www.gruenwerk-galabau.de")
}
```

**Ablauf:**
1. Auth-Check: nur Admin
2. Site laden, prüfen dass `status !== 'LIVE'` (Doppel-Freischaltung verhindern)
3. Wenn `domain` übergeben: `attachCustomDomain(siteId, domain)` via Vercel API → domains-Tabelle Eintrag mit `status: WARTET_AUF_DNS`
4. Wenn keine `domain`: Subdomain generieren aus `sites.name` (slugify: Leerzeichen→Bindestrich, Umlaute→ae/oe/ue, lowercase, max 63 Zeichen) → `sites.subdomain` setzen → Vercel-API Subdomain anhängen
5. `sites.noindex` → `false`
6. `sites.status` → `LIVE`
7. Response: `{ subdomain?, domain?, dns_anleitung? }`

### 2. Subdomain-Generierung

**Funktion:** `generiereSubdomain(firmenname: string): string`
- In: `lib/hosting/subdomain.ts`
- Slugify: `Grünwerk GaLaBau` → `gruenwerk-galabau`
- Umlaute: ä→ae, ö→oe, ü→ue, ß→ss
- Nur a-z, 0-9, Bindestrich
- Max 63 Zeichen (DNS-Limit)
- Kollisionsprüfung: wenn Subdomain schon vergeben → `-2`, `-3` etc. anhängen

**Subdomain-Host:** `{slug}.webseitenverlag-deutschland.de`

### 3. Admin-UI: Freischalten-Button + Modal

**Ort:** In der Admin Customer-Detail-Seite oder Site-Ansicht — überall wo eine Site mit `status=BEREIT` angezeigt wird.

**Button:** „Freischalten" (grün, nur sichtbar wenn status !== LIVE)

**Modal:**
- Headline: „Website freischalten"
- Text: „Die Website wird öffentlich sichtbar und bei Google indexiert."
- Radio: ○ Subdomain (automatisch) / ○ Eigene Domain
- Bei „Eigene Domain": Text-Input für Domain
- Buttons: „Freischalten" (primary) / „Abbrechen"

### 4. DNS-Anleitung

Wenn Custom Domain gewählt, zeigt das Modal nach Freischaltung:

```
DNS-Einrichtung für www.gruenwerk-galabau.de:

1. Gehe zu deinem Domain-Anbieter (z.B. IONOS, Strato, united-domains)
2. Erstelle einen CNAME-Eintrag:
   Name: www
   Typ: CNAME
   Ziel: cname.vercel-dns.com
3. Für die nackte Domain (ohne www): A-Record auf 76.76.21.21

Die Verbindung wird automatisch erkannt. Status siehst du im Dashboard.
```

Diese Anleitung wird auch im Kunden-Dashboard unter `/dashboard/[siteId]/domain` angezeigt (dort existiert bereits eine Domain-Seite).

### 5. Kunden-Sitemap

**Route:** Über die bestehende Kundenseite-Auslieferung (`app/kundenseite/[host]/[[...pfad]]/route.ts`)

Wenn der Pfad `/sitemap.xml` ist und `noindex=false`:
- Generiere XML-Sitemap mit allen Seiten der Site (Startseite + Unterseiten)
- `<url><loc>https://{domain}/</loc></url>` etc.
- Canonical-URL = Custom Domain wenn vorhanden, sonst Subdomain

### 6. SEO-Tags bei Go-Live

Beim Rendering einer LIVE-Site (noindex=false):
- `<meta name="robots" content="index, follow">` (statt noindex)
- `<link rel="canonical" href="https://{domain}/">`
- `<meta property="og:url" content="https://{domain}/">`
- JSON-LD LocalBusiness Schema mit echter URL
- Kein Demo-Badge
- Kein `X-Robots-Tag: noindex` Header

Die meisten dieser Mechanismen existieren bereits (noindex-Toggle, Badge nur bei Demo, JSON-LD). Der canonical und og:url müssen die tatsächliche Domain nutzen.

## Voraussetzungen (Env Vars)

Müssen in Vercel gesetzt sein (WARTELISTE):
- `VERCEL_TOKEN` — für Domain-API-Aufrufe
- `VERCEL_PROJECT_ID` — Projekt-ID für Domain-Attachment
- `VERCEL_TEAM_ID` — Team-ID (optional, je nach Vercel-Setup)
- Wildcard-Domain `*.webseitenverlag-deutschland.de` muss im Vercel-Projekt konfiguriert sein

## Verhinderungs-Regel

### R-GO-LIVE (neu)
- **Beschreibung:** Freischaltung setzt noindex=false + status=LIVE + Subdomain/Domain. Doppelfreischaltung verhindert. Subdomain ist DNS-konform (≤63 Zeichen, nur a-z/0-9/-).
- **Test:** `scripts/test-go-live.ts` — Subdomain-Slugify-Tests + API-Contract-Tests

## Nicht im Scope

- Automatische DNS-Verifizierung per Cron (Vercel macht das selbst)
- SSL-Zertifikat-Management (Vercel automatisch)
- Mehrere Custom Domains pro Site
- Kunden-Self-Service Domain-Änderung (über Admin)
- Benachrichtigungs-Mail an Kunde (kommt später)
- Wildcard-Domain-Setup in Vercel (manueller Schritt von Felix)
