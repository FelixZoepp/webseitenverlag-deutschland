# Multipage Support - Implementation Report

## Status: COMPLETE

## Changes Made

### 1. `lib/flagship/render.ts` - Core multipage rendering
- Extracted `htmlShell()` helper to avoid duplicating the HTML document skeleton
- Added `multipageNavLinks()` helper for real page links in multipage mode
- Modified `renderFlagshipPage()`: when `seiten_modus === 'multipage'`, home shows reduced sections (Nav, Hero, Fakten, Signature, Zahlen, Conversion, Footer)
- Added `renderUnterseite()` export with section mapping per sub-page:
  - `leistungen`: Leistungen + Ablauf + Prozess + Nachweise
  - `ergebnisse`: Ergebnisse + Referenzen + Stimmen
  - `ueber-uns`: Empathie + Marken + Zahlen + Lokal
  - `kontakt`: Lokal + FAQ + Conversion
- Sub-page titles follow pattern: `${seitenLabel} – ${meta.firma}`

### 2. `app/demo/[token]/[seite]/route.ts` - Route handler
- Added imports for `renderUnterseite`, `UnterseitenSlug`, `UNTERSEITEN`
- Route now handles 6 slugs: `anfrage`, `reservierung` (funnel) + `leistungen`, `ergebnisse`, `ueber-uns`, `kontakt` (content sub-pages)
- Sub-pages only served when `config.seiten_modus === 'multipage'` (returns 404 otherwise)

### 3. `app/api/admin/demos/route.ts` - Paket-based mode assignment
- Moved `gewaehltesPaket` computation before DB insert
- Added `ergebnis.config.seiten_modus` assignment: `starter` -> `'onepager'`, `business`/`growth` -> `'multipage'`
- Reused `gewaehltesPaket` in insert (was previously computed twice)

### 4. `scripts/test-flagship.ts` - Extended stress tests
- Added multipage tests for both seeds (reinigung + restaurant)
- Tests verify: reduced home sections, excluded sections, nav links, sub-page sections, titles, ribbon
- Added explicit onepager mode verification
- Test count: 270 -> 463 checks, 0 errors

## Verification

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Clean (0 errors) |
| `npx tsx scripts/test-flagship.ts` | 463 checks, 0 errors |

## Concerns

- The `kontakt` sub-page renders `renderLokal` which also appears on `ueber-uns`. This is intentional per the spec (contact info relevant in both contexts) but could be revisited if it feels redundant to prospects.
- Seeds don't have `seiten_modus` set by default - the test creates multipage clones dynamically. Existing demos without the field will continue to render as onepagers (safe default since undefined !== 'multipage').
