# Fix Prompts Report — 2026-07-16

## Status: COMPLETED

## Commit
`d7f1ca9` on branch `refactor/mission-v2`
Message: `fix: set temperature on all Claude calls, add floskel-gate to premium engine, stop fabricating reviews`

## Fix 1: Temperature on all Claude calls

7 files modified, each `anthropic.messages.create()` call now has an explicit `temperature`:

| File | Temperature | Rationale |
|------|-------------|-----------|
| `lib/generate-demo.ts` | 0.4 | Content generation — needs variety but not too much |
| `lib/pipeline/generate-library-content.ts` | 0.4 | Same category |
| `lib/seeding/generiere-profil.ts` | 0.3 | Template generation — more deterministic |
| `lib/seeding/klassifiziere-branche.ts` | 0.1 | Classification — very deterministic |
| `lib/claude.ts` | 0.5 | Chatbot — needs natural variety |
| `lib/briefing.ts` | 0.4 | Briefing generation |
| `lib/generate-site.ts` | 0.4 | Site generation from transcript |

## Fix 2: Floskel-gate added to Premium engine

`lib/generate-demo.ts` now:
- Imports `pruefeContentAufFloskeln` from `./floskel-blacklist`
- After successful JSON parse on attempt 0: if floskeln found, sets `lastError` and retries
- On attempt 1 (second attempt): accepts the config regardless of floskeln (resilience over perfectionism)
- Pattern mirrors the existing library engine behavior

## Fix 3: No more fabricated reviews in Premium engine

System prompt in `lib/generate-demo.ts` (~line 61) changed from:
> "Wenn echte Kundenstimmen in den Daten stehen, nutze sie. Sonst 2-3 generische, glaubwürdige Beispiel-Reviews mit Vornamen + Initial"

To:
> "Wenn echte Kundenstimmen in den Daten stehen, nutze sie. Wenn KEINE echten Bewertungen vorhanden sind, lasse das reviews-Array LEER ([]) — erfinde NIEMALS Bewertungen."

## Test Results

- `npx tsc --noEmit --pretty`: PASSED (no output = no errors)
- `npx tsx scripts/test-flagship.ts`: PASSED — 463 Prüfungen, 0 Fehler
  - 8 Flagship-Tests (reinigung + restaurant_italienisch, 4 varianten each)
  - 10 Multipage-Tests
  - 1 Onepager-Test
