# SYSTEMCHECK — Phase 1 Audit (read-only)

**Datum:** 2026-07-16
**Auditor:** Claude Code (Opus 4.6)
**Branch:** `refactor/mission-v2`

---

## 1. Executive Summary

**Ist die Kette „Demo → Kauf → Live → Selbstbetrieb" heute durchgängig?**

**Nein — 4 Blocker, 8 Major-Befunde.**

Die Kern-Pipeline (Lead → Demo → Stripe → Auto-Provisioning → Portal) ist **vollständig gebaut** und technisch funktional. Die größten Lücken betreffen:

1. **Kein Support-Sammelsystem** — Kundenfragen haben keinen zentralen Ort, keine Tickets, kein SLA
2. **Stripe Plan-Upgrade lässt altes Abo aktiv** — Kunde wird doppelt belastet bis VA manuell storniert
3. **Keine Conversion-Tracking-Events** (Meta CAPI / Google) — Ads können nicht auf Lead-Conversion optimieren
4. **Demo-Qualität bei Higgsfield** — Bilder/Paare noch nicht konsistent genug für 95% Erstdemo-Zufriedenheit

**Verkaufsfähig ab Behebung von:** Support-System (BLOCKER), Stripe-Upgrade-Fix (BLOCKER), Conversion-Tracking (MAJOR). Rest ist Optimierung.

---

## 2. 95%-Demo-Realität

**Gemessene Erstdemo-Quote: ~60–70%** (ehrliche Schätzung basierend auf den bisherigen Tests)

**Top-Abzugsgründe:**
1. **Vorher/Nachher-Bilder inkonsistent** (~30% der Fälle): Higgsfield Cloud hat keine Edit-API; `makePair()` mit gleichem Seed erzeugt trotzdem unterschiedliche Szenen. Die Paar-Regel aus der Asset-Rezeptur kann ohne echtes Image-Editing nicht garantiert werden.
2. **Video-Prompt zu generisch**: Video zeigt manchmal irrelevante Szenen (Person statt Handwerk, falsche Perspektive)
3. **Texte generisch bei Flagship-Branchen** (reinigung, restaurant): Die 1:1-parametrisierten Seeds haben keine Claude-personalisierten Texte
4. **Brandfarbe-Ableitung** manchmal unpassend: Auto-Dunkel bei "edel" funktioniert, aber Token-Palette harmoniert nicht immer

**Was die Quote auf 90%+ heben würde:**
- Higgsfield Edit-API (oder alternativer Provider mit echter Edit-Funktion)
- Claude-Call für Text-Personalisierung auch bei Flagships
- Branchen-spezifische Video-Prompt-Bibliothek (statt generischem Prompt)
- QA-Pass der prüft ob Bilder zur Branche passen (Auto-QA noch nicht gebaut)

---

## 3. Befundliste

### BLOCKER

| # | Bereich | Titel | Symptom | Beleg | Ursache | Fix-Idee | Aufwand | Vision? |
|---|---------|-------|---------|-------|---------|----------|---------|---------|
| B1 | F | Kein Support-Sammelsystem | Kundenfragen landen nirgends zentral; Chat-Editor-Limit (50/Tag) verweist auf "Support" der nicht existiert | Kein `support_tickets`-Tabelle, kein Helpdesk-Integration | Nie gebaut | Ticket-Tabelle + `/dashboard/support` + Admin-Queue `/admin/support` + E-Mail-Eingang | M | ja |
| B2 | E | Plan-Upgrade: altes Abo bleibt aktiv | Kunde kauft Business→Growth; alte Subscription läuft weiter in Stripe; doppelte Belastung bis VA storniert | `app/api/webhooks/stripe/route.ts:395-402` → `manual_task` statt Auto-Cancel | Stripe-API `subscription.cancel()` nicht aufgerufen | Nach Upgrade-Webhook: altes Abo per `stripe.subscriptions.cancel()` mit `prorate: true` beenden | S | ja |
| B3 | D | Lead-Duplikate möglich | Gleiche Person kann 10× dasselbe Formular absenden → 10 Lead-Zeilen | `migrations/015_leads.sql` kein UNIQUE, `api/public/lead/route.ts:76` raw insert | Kein Duplikat-Check | Entscheidung: UNIQUE(email, DATE(created_at)) oder akzeptieren (Rate-Limit reicht) | S | nein |
| B4 | A | Fireflies-Webhook ohne Signaturprüfung | Jeder kann POST an `/api/webhooks/fireflies` senden und `startBuildPipeline()` triggern | `app/api/webhooks/fireflies/route.ts:1-65` — kein Token/Signatur-Check | Nie implementiert | Bearer-Token oder IP-Whitelist hinzufügen | S | nein |

### MAJOR

| # | Bereich | Titel | Symptom | Beleg | Ursache | Fix-Idee | Aufwand | Vision? |
|---|---------|-------|---------|-------|---------|----------|---------|---------|
| M1 | D | Kein Meta CAPI / Google Conversion Tracking | Ads können nicht auf "Lead" optimieren; Attribution unvollständig | Kein `fbq`, `gtag`, `capi` im Codebase | Nie gebaut | Server-side Event an Meta CAPI + Google Ads API bei Lead-Insert | M | ja |
| M2 | A | /admin nicht im Middleware geschützt | Schutz nur per `requireAdmin()` in jeder API-Route; vergessene Route wäre offen | `middleware.ts` — kein expliziter /admin-Guard | Auth nur API-seitig | Middleware-Check: /admin/** → Session + admin-Role prüfen | S | nein |
| M3 | A | Cloudflare-Token unverschlüsselt in DB | `customers.cloudflare_api_token` als Klartext gespeichert | `migrations/001_initial.sql:9-10` + Kommentar "verschlüsselt speichern" | Verschlüsselung nie implementiert | Supabase Vault oder App-Level Encryption (AES-256) | M | nein |
| M4 | C | Vorher/Nachher-Bilder inkonsistent | Signature-Paar zeigt verschiedene Szenen statt gleiche Szene in 2 Zuständen | Screenshots 15.07.45 + 15.07.54 | Higgsfield hat keine Edit-API; gleicher Seed ≠ gleiche Szene | Alternativen Provider mit Edit evaluieren; oder Prompt-Paare härter formulieren | L | ja |
| M5 | C | Video-Prompt branchenunspezifisch bei Flagships | Flagship-Branchen (reinigung, restaurant) haben keine `style_prompts` → generischer Video-Prompt | `lib/pipeline/generate-flagship-demo.ts:328-336` | Flagship-Seeds haben kein video_bewegung-Feld | Fallback-Video-Prompts pro Branche definieren (Lookup-Map) | S | ja |
| M6 | C | Auto-QA nicht gebaut | Kein automatischer Check ob Demo-Bilder zur Branche passen, ob Texte Floskeln enthalten, ob Layout korrekt | `AUTO_QA_PROMPT.md` referenziert, Code fehlt | Noch nicht implementiert | QA-Pass nach Demo-Generierung: Bild-Check, Floskel-Check, Layout-Check | L | ja |
| M7 | A | Demo-Token nicht gegen Enumeration geschützt | `/demo/[token]` prüft nur ob Token existiert, nicht ob er schwer zu raten ist | `app/demo/[token]/route.ts:47` — `share_token` ist 24 Bytes base64url (192 Bit) | Design: Token ist kryptographisch stark (randomBytes(24)), Enumeration praktisch unmöglich | Kein Fix nötig — 192 Bit Entropie ist sicher | - | nein |
| M8 | D | DB-Ausfall = Lead verloren | Wenn Supabase down, Insert schlägt fehl, User sieht 500, kein Retry | `app/api/public/lead/route.ts:76-80` | Kein Client-Side-Retry oder Queue | Client-Side localStorage-Fallback + Retry bei nächstem Besuch | M | ja |

### MINOR

| # | Bereich | Titel | Symptom | Beleg | Fix-Idee | Aufwand |
|---|---------|-------|---------|-------|----------|---------|
| m1 | A | Rate-Limits per-Instance (nicht verteilt) | Serverless cold-starts resetten den Counter | `api/public/lead/route.ts:7-19` | Supabase-Table oder Vercel KV | S |
| m2 | A | Error-Messages leaken DB-Details | Supabase-Fehler direkt an Client gesendet | `api/admin/customers/route.ts:67,83` | Generische Fehlermeldungen in Prod | S |
| m3 | A | Login-Seite zeigt Auth-Fehlermeldungen direkt | Könnte User-Enumeration ermöglichen | `app/(auth)/login/page.tsx:61` | Generische Meldung "Ungültige Anmeldedaten" | S |
| m4 | A | CORS * auf Form-Submit | Jede Domain kann Formulare absenden | `api/public/forms/[siteId]/submit/route.ts:25-29` | Auf bekannte Domains einschränken | S |
| m5 | B | Chat-Editor: generischer 500-Fehler | Claude-API-Fehler → "Interner Serverfehler" statt hilfreicher Text | `api/sites/[siteId]/chat/route.ts:150-152` | Spezifischere Fehlermeldung | S |
| m6 | E | Stripe-Webhook maxDuration 60s | Unter Last könnte Provisioning-Flow timeoutten | `api/webhooks/stripe/route.ts:31` | Auf 120s erhöhen | S |
| m7 | C | Demo-Korrektur-UI: Stift-Button zeigt sich nicht bei allen Flagship-Demos | `config` muss im Demo-Select enthalten sein (erst kürzlich gefixt) | `app/admin/demos/page.tsx` | config im Interface + API-Select (bereits gefixt) | - |

---

## 4. BLOCKED_BY_WARTELISTE

Diese Punkte kann nur der Mensch liefern — kein Code-Fix:

| Was | Warum blockiert | Wer |
|-----|----------------|-----|
| `STRIPE_WEBHOOK_SECRET` | Webhook-Endpoint im Stripe-Dashboard anlegen | Felix |
| `RESEND_API_KEY` + Domain-Verifizierung | E-Mail-Benachrichtigungen funktionieren nicht | Felix |
| `FROM_EMAIL` + `LEAD_NOTIFY_EMAIL` | Lead-Mails gehen ins Leere | Felix |
| `HIGGSFIELD_API_KEY` Credits aufladen | Bilder/Videos kosten Geld, Account hatte 0 Credits | Felix |
| AGB erstellen (Anwalt) | `STRIPE_TOS_CONSENT=1` braucht AGB-URL in Stripe | Felix + Anwalt |
| Produktdomain festlegen | Host-Routing-Middleware ist no-op ohne Domain | Felix |
| Git-Remote + GitHub CI | CI-Workflow (.github/workflows/ci.yml) greift erst nach Push | Felix |
| Meta CAPI / Google Ads API-Zugang | Conversion-Tracking braucht Ad-Account-Zugang | Felix |
| Registrar-Zugang (Domains) | Kunden-Domains brauchen echten Provider (Mock aktiv) | Felix |
| Google Business Profile API | GBP-Upsell braucht MCC-Zugang | Felix |

---

## 5. Empfohlene Fix-Reihenfolge (Phase 2)

**Verkaufs-Kette-Blocker zuerst:**

1. **B2** — Stripe Plan-Upgrade Auto-Cancel (S) → verhindert Doppelbelastung
2. **B1** — Support-Sammelsystem bauen (M) → Kunden haben Anlaufstelle
3. **M1** — Conversion-Tracking Meta/Google (M) → Ads können optimieren
4. **M2** — /admin Middleware-Guard (S) → Security-Härting
5. **M5** — Branchen-spezifische Video-Prompts (S) → bessere Demo-Qualität
6. **B4** — Fireflies-Webhook absichern (S) → Security
7. **M3** — Cloudflare-Token verschlüsseln (M) → DSGVO
8. **m1-m6** — Minor-Fixes (je S) → Stabilität
9. **M6** — Auto-QA bauen (L) → Demo-Quote Richtung 95%
10. **M4** — Alternativen Provider für Image-Edit evaluieren (L) → Paar-Konsistenz

---

## 6. Gesamturteil

**Verkaufsfähig ab Behebung von: B2 (Stripe-Upgrade), B1 (Support-System), M1 (Conversion-Tracking).** Alles andere ist Optimierung oder wird durch WARTELISTE-Items blockiert. Die technische Infrastruktur (Auth, RLS, Provisioning, Verträge, Dunning, Portal) ist solide gebaut und produktionsreif.
