# REZEPTE_GALABAU — Higgsfield-Rezeptliste „Garten- & Landschaftsbau" (GrünWerk-Flagship)

> **Vorlage der Template-Fabrik (B3).** Neue Branchen leiten ihre `REZEPTE_{BRANCHE}.md`
> von dieser Datei ab. Verbindlicher Vertrag für `scripts/import-assets.ts` (T2).
>
> **Hinweis:** Die Original-Rezeptliste wurde als Prompt geliefert; diese Datei sichert
> den verbindlichen Vertrag im Repo. Motiv-Prompts sind seit 2026-07-22 nach dem
> Maler-Muster ausformuliert (Motive 1:1 aus den `media.label`-Feldern des
> GrünWerk-Seeds `lib/flagship/galabau/seed.ts` abgeleitet).

## Stil-Modul (verbindlich für JEDEN Prompt)

`config/asset-styles.ts` hat keinen `galabau`-Eintrag (dort greift `fallbackStil`) —
dieses Rezept-Stil-Modul ist daher die verbindliche Quelle, abgeleitet aus der
Seed-Stimmung („Hero: Gartenanlage am Abend"):

Licht: warmes Abendlicht (golden hour), lange weiche Schatten, dezente
Gartenbeleuchtung · Farbwelt: sattes Pflanzengrün, warme Natursteintöne
(sand/grau), tiefblauer Abendhimmel · Kamera: Weitwinkel auf Augenhöhe für
Anlagen, 50mm-Look mit leichter Tiefenschärfe für Details · Stimmung: gepflegt,
hochwertig, deutsches Meister-Handwerk, ultra-photorealistisch.
`BASIS_NEGATIV` gilt für jeden Prompt (keine Gesichter nah — nur von hinten/
seitlich oder unscharf, keine Logos/Marken, kein Text im Bild).

## Dateinamen-Vertrag

**Dateiname = Slot-ID mit Bindestrich** (Import mappt per `slotKeyAusDateiname`):
`hero-bg.jpg → hero_bg`, `ba-before.jpg → ba_before`, `hero-video.mp4 → hero_video` usw.
Unbekannte Dateinamen werden abgewiesen (kein Raten).

## Slot-Deckung (21 Slots, Quelle: `lib/flagship/galabau/asset-slots.ts`)

| Datei | Slot | Format | Min-Breite | Pflicht | Motiv |
|---|---|---|---|---|---|
| `hero-bg.jpg` | hero_bg | 16:9 | 1920 | ja | Basis der Kette (zuerst!) — weitläufige, fertig angelegte Privatgarten-Anlage am Abend: Natursteinterrasse, makelloser Rasen, Staudenbeete, warme Gartenbeleuchtung glimmt (Seed: „Hero: Gartenanlage am Abend") |
| `hero-video.mp4` | hero_video | 16:9 | — | nein | aus hero-bg generiert, Fallback hero_bg |
| `about-detail.jpg` | about_detail | 4:3 | 1200 | ja | Hände in Arbeitshandschuhen setzen eine Staude in frische Erde, Nahaufnahme (Seed: „Detail: Hände bei der Pflanzarbeit") |
| `svc-01.jpg` | svc_01 | 4:3 | 1200 | ja | Gartenplanung — Gartenplan/3D-Entwurf auf Tisch im Freien, Maßband, Pflanzenmuster (Karte „Vom Aufmaß zum 3D-Entwurf") |
| `svc-02.jpg` | svc_02 | 4:3 | 1200 | ja | Pflaster- & Terrassenbau — frisch verlegte Natursteinterrasse, millimetergenaue Fugen, Gummihammer + Wasserwaage (Karte „Wege, Terrassen, Einfahrten") |
| `svc-03.jpg` | svc_03 | 4:3 | 1200 | ja | Gartenpflege — präzise geschnittene Hecke/gepflegtes Staudenbeet, Schnittwerkzeug im Bild (Karte „Ganzjährig gepflegt") |
| `svc-04.jpg` | svc_04 | 4:3 | 1200 | ja | Bewässerung — Tropf-/Sprühbewässerung in Aktion im Beet, Wassertropfen im Gegenlicht (Karte „Automatisch versorgt") |
| `svc-05.jpg` | svc_05 | 4:3 | 1200 | ja | Zaun- & Sichtschutzbau — neu gesetzter Holz-Sichtschutz/Gabionen in gerader Flucht, sauber betonierte Pfosten (Karte „Privatsphäre mit System") |
| `why-1.jpg` | why_1 | 4:3 | 1200 | ja | Meister-Handwerk — Wasserwaage auf frisch verlegter Pflasterkante, Hände im Arbeitshandschuh |
| `why-2.jpg` | why_2 | 4:3 | 1200 | ja | Heimische Pflanzen — blühendes Staudenbeet mit heimischen Arten, weiches Abendlicht |
| `why-3.jpg` | why_3 | 4:3 | 1200 | ja | Festpreis-Garantie — Angebotsmappe + Aufmaß-Skizze auf Gartentisch, Meterstab daneben |
| `contact-img.jpg` | contact_img | 4:3 | 1200 | ja | Team von hinten/seitlich auf der Baustelle vor gepflegter Anlage (Seed: „Kontakt: Team vor Ort") |
| `ba-after.jpg` | ba_after | 4:3 | 1200 | ja | **ZUERST** generieren + freigeben — fertiger Garten: Terrasse, Rasen, Beete, Abendlicht (Seed: „Nachher: fertiger Garten") |
| `ba-before.jpg` | ba_before | 4:3 | 1200 | ja | `pair_with: ba_after`, gleiche `pair_id` — gleiche Kamera, Zustand Baustelle: Erdarbeiten, verwilderte Fläche (Seed: „Vorher: Baustelle") |
| `team-1.jpg` … `team-3.jpg` | team_1…team_3 | 3:4 | 900 | ja | Environmental Portraits in Arbeitskleidung, draußen im Werk-Kontext (Rollen lt. Seed: Inhaber & Meister · Planung & Angebote · Vorarbeiter Pflasterbau), **nur Demo** |
| `avatar-1.jpg` … `avatar-4.jpg` | avatar_1…avatar_4 | 1:1 | 200 | nein | quadratische Crops aus team-1..3 + why-1 (keine eigene Generierung) |

## Ketten-Logik (Reihenfolge ist Pflicht)

1. **Hero zuerst:** `hero-bg.jpg` generieren und freigeben — alle Stimmungs-/Licht-Referenzen
   hängen daran.
2. **Video aus Hero:** `hero-video.mp4` als image-to-video vom freigegebenen Hero-Bild
   (5–8 s Loop, ≤ 3 MB, Poster = hero-bg — vgl. `config/video-guidelines.ts`;
   `BRANCHEN_VIDEO_STIL` hat keinen galabau-Eintrag → `DEFAULT_VIDEO_STIL` greift,
   Licht/Farbwelt dieses Rezepts im Prompt mitgeben). Motiv-Idee: leichter Wind
   bewegt Gräser und Stauden, Gartenbeleuchtung glimmt, Lichtstimmung bleibt konstant.
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
