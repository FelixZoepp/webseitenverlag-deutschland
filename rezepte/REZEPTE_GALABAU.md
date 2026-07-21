# REZEPTE_GALABAU — Higgsfield-Rezeptliste „Garten- & Landschaftsbau" (GrünWerk-Flagship)

> **Vorlage der Template-Fabrik (B3).** Neue Branchen leiten ihre `REZEPTE_{BRANCHE}.md`
> von dieser Datei ab. Verbindlicher Vertrag für `scripts/import-assets.ts` (T2).
>
> **Hinweis:** Die Original-Rezeptliste wurde als Prompt geliefert; diese Datei sichert
> den verbindlichen Vertrag im Repo. Feinheiten einzelner Motiv-Prompts bei Bedarf von
> Felix nachreichen lassen (WARTELISTE „Higgsfield-Assets galabau generieren").

## Dateinamen-Vertrag

**Dateiname = Slot-ID mit Bindestrich** (Import mappt per `slotKeyAusDateiname`):
`hero-bg.jpg → hero_bg`, `ba-before.jpg → ba_before`, `hero-video.mp4 → hero_video` usw.
Unbekannte Dateinamen werden abgewiesen (kein Raten).

## Slot-Deckung (21 Slots, Quelle: `lib/flagship/galabau/asset-slots.ts`)

| Datei | Slot | Format | Min-Breite | Pflicht | Besonderheit |
|---|---|---|---|---|---|
| `hero-bg.jpg` | hero_bg | 16:9 | 1920 | ja | Basis der Kette (zuerst!) |
| `hero-video.mp4` | hero_video | 16:9 | — | nein | aus hero-bg generiert, Fallback hero_bg |
| `about-detail.jpg` | about_detail | 4:3 | 1200 | ja | |
| `svc-01.jpg` … `svc-05.jpg` | svc_01…svc_05 | 4:3 | 1200 | ja | 5 Leistungs-Motive |
| `why-1.jpg` … `why-3.jpg` | why_1…why_3 | 4:3 | 1200 | ja | |
| `contact-img.jpg` | contact_img | 4:3 | 1200 | ja | |
| `ba-after.jpg` | ba_after | 4:3 | 1200 | ja | **ZUERST** generieren + freigeben |
| `ba-before.jpg` | ba_before | 4:3 | 1200 | ja | `pair_with: ba_after`, gleiche `pair_id` |
| `team-1.jpg` … `team-3.jpg` | team_1…team_3 | 3:4 | 900 | ja | Environmental Portraits, **nur Demo** |
| `avatar-1.jpg` … `avatar-4.jpg` | avatar_1…avatar_4 | 1:1 | 200 | nein | quadratische Crops aus team-1..3 + why-1 |

## Ketten-Logik (Reihenfolge ist Pflicht)

1. **Hero zuerst:** `hero-bg.jpg` generieren und freigeben — alle Stimmungs-/Licht-Referenzen
   hängen daran.
2. **Video aus Hero:** `hero-video.mp4` als image-to-video vom freigegebenen Hero-Bild
   (5–8 s Loop, ≤ 3 MB, Poster = hero-bg — vgl. `config/video-guidelines.ts`).
3. **Vorher/Nachher:** **NACHHER (`ba-after.jpg`) zuerst** generieren und freigeben.
   Danach **VORHER (`ba-before.jpg`) als image-to-image** vom Nachher-Bild mit hoher
   Referenz-Stärke: nur der Zustand ändert sich (verwildert/ungepflegt), **Haus, Horizont
   und Bäume bleiben pixel-identisch — sonst verwerfen.** Beide mit gleicher `pair_id`.
4. **Avatare zuletzt:** 1:1-Crops aus team-1..3 + why-1 (keine eigene Generierung).

## Team-Regel

Team-Motive (environmental portraits, Arbeitskleidung, draußen im Werk-Kontext) sind
**ausschließlich für Demos**. Live ersetzt IMMER der Kunden-Upload — KI-Menschen als
echtes Team wären ein Vertrauensbruch.

## Fertig-Kriterium (T2/B6)

≥ 25 freigegebene Assets, darunter mindestens: 1 komplettes BA-Paar, 1 Hero, 1 Video.
Stub-Assets sind als STUB markiert und **niemals freigebbar**.
