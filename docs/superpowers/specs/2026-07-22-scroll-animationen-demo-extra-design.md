# Scroll-Animationen als wählbares Demo-Extra — Design

Datum: 2026-07-22
Status: Vom Nutzer freigegeben (Chat, „ja passt, setz um")

## Ziel

Die Checkbox „Scroll-Animationen" im Demo-Formular (`app/admin/demos/page.tsx`) schaltet
gebündelt alle Scroll-Mechaniken der Engine ein — bisher setzte sie nur milde Hover-Effekte
(`premium_animationen`).

Felix-Entscheidungen:
- **Gebündelt:** eine Checkbox schaltet Scroll-Video-Header + Premium-Animationen + Signature-Story
- **Überall wählbar, nirgends auto:** Business UND Growth manuell wählbar, Default aus, Starter ausgeschlossen
- **Ansatz 1:** Durchstich über die bestehende Checkbox, Flag im Config-JSONB, kein neues Feature-System

## 1. Formular (`app/admin/demos/page.tsx`)

- Checkbox-Label: „Scroll-Animationen (Scroll-Video + Effekte)"
- Bei Paket `starter`: deaktiviert (ausgegraut, Hinweis „ab Business"); beim Wechsel auf
  Starter wird ein gesetzter Haken zurückgesetzt
- Payload unverändert: `scrollAnimationen: boolean`

## 2. Config-Flag

- `lib/flagship/types.ts`: neues optionales Feld `scroll_animationen?: boolean` am FlagshipConfig
  (neben `premium_animationen`)
- `app/api/admin/demos/route.ts`: `body.scrollAnimationen === true` setzt
  `designOverrides.premium_animationen = true` (wie bisher) UND `designOverrides.scroll_animationen = true`
- `lib/pipeline/generate-flagship-demo.ts`: Override `scroll_animationen` in den Config übernehmen

## 3. Scroll-Video-Header (`app/api/admin/demos/[demoId]/video/route.ts`)

- Wenn `config.scroll_animationen === true`:
  - Prompt: `VIDEO_PROMPTS[branche].scrub` statt `.loop`
  - `config.inhalte.hero.video.modus = 'scrub'` statt `'loop'`
- Branchen ohne Eintrag in `VIDEO_PROMPTS`: generischer Loop-Prompt + `modus: 'loop'` wie bisher
  (kein Fehler, stiller Fallback)
- Frontend existiert bereits: `lib/flagship/sections.ts:63-65` (`data-modus`, `.scrub`-Klasse)
  + `lib/flagship/js.ts:130-141` (Video-Zeit an Scrollposition)

## 4. Signature-Story (`lib/pipeline/generate-flagship-demo.ts`)

- Bei Kompositionen mit `signature_story`-Feld (aktuell maler-landing-v1): Flag setzt
  `signature_story: 'on'`
- Bekannte Grenze: Die Maler-Wand-Scrub-Ansicht rendert nur in Stufe `growth`
  (`?level=growth`) — Kompositions-Stufenlogik bleibt unangetastet (frozen). Bei Business
  wirken Scroll-Video-Header + Premium-Animationen.

## 5. Fehlerbehandlung

Keine neuen Fehlerpfade. Scheitert das Scrub-Video, greift derselbe Fehlerfluss wie beim
Loop-Video heute (Fehlermeldung im Formular, Demo bleibt ohne Video nutzbar).

## 6. Tests

- `test:flagship` erweitert:
  - Config mit `scroll_animationen: true` + `hero.video.modus: 'scrub'` rendert
    `data-modus="scrub"` und `.scrub`-Klasse am Hero
  - Ohne Flag: weiter `data-modus="loop"`
- Bestehende Prüfungen (463 flagship, 204 maler) bleiben grün

## Nicht im Scope

- Kein buchbares Kunden-Extra / Feature-Gate in `config/plans.ts` (kommt ggf. mit
  Teilprojekt C, Upsells)
- Keine Änderung an frozen Kompositionen (galabau, maler) oder deren Stufenlogik
- Kein Starter-Video
