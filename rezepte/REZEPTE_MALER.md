# REZEPTE_MALER — Higgsfield-Rezeptliste „Maler & Lackierer" (Voss-Flagship)

> **Abgeleitet aus der Vorlage `rezepte/REZEPTE_GALABAU.md` (Template-Fabrik B3).**
> Verbindlicher Vertrag für `scripts/import-assets.ts` (SLOT_REGISTRY `maler`).
>
> **Hinweis:** Felix' Original-Rezeptliste `HIGGSFIELD_REZEPTE_MALER.md` war nicht
> auffindbar (WARTELISTE) — diese Datei ist aus der GaLaBau-Vorlage + Steckbrief
> abgeleitet. Feinheiten einzelner Motiv-Prompts bei Bedarf nachreichen lassen.

## Stil-Modul (Quelle: `config/asset-styles.ts` → `maler`)

Licht: helles Tageslicht durch Fenster, weiche Schatten · Farbwelt: saubere
Weißtöne, warme Neutraltöne, Akzente in frischer Farbe (Salbei #7BA88A passt zur
Theme-Palette) · Kamera: Weitwinkel-Innenraum, Augenhöhe, leichte Tiefenschärfe.
`BASIS_NEGATIV` gilt für jeden Prompt (keine Gesichter nah, keine Logos/Marken,
kein Text im Bild).

## Dateinamen-Vertrag

**Dateiname = Slot-ID mit Bindestrich** (Import mappt per `malerSlotKeyAusDateiname`):
`hero-bg.jpg → hero_bg`, `ba-before.jpg → ba_before`, `gal-01.jpg → gal_01` usw.
Unbekannte Dateinamen werden abgewiesen (kein Raten).

## Slot-Deckung (27 Slots, Quelle: `lib/flagship/maler/asset-slots.ts`)

| Datei | Slot | Format | Min-Breite | Pflicht | Motiv |
|---|---|---|---|---|---|
| `hero-bg.jpg` | hero_bg | 16:9 | 1920 | ja | Basis der Kette (zuerst!) — frisch gestrichener heller Wohnraum, makellose Wände, ordentlich arrangiertes Maler-Werkzeug |
| `hero-video.mp4` | hero_video | 16:9 | — | nein | aus hero-bg generiert, Fallback hero_bg |
| `about-detail.jpg` | about_detail | 4:3 | 1200 | ja | Meisterbetrieb-Detail: Werkbank mit Pinseln, Farbfächer, Abdeckvlies |
| `svc-01.jpg` | svc_01 | 4:3 | 1200 | ja | Innenanstrich — Wohnraum, Roller an heller Wand (Karte „Wohnräume") |
| `svc-02.jpg` | svc_02 | 4:3 | 1200 | ja | Fassadenanstrich — frische Putzfassade, Gerüst-Kontext (Karte „Außen") |
| `svc-03.jpg` | svc_03 | 4:3 | 1200 | ja | Lackierarbeiten — lackierte Altbautür/Heizkörper (Karte „Türen & Holz") |
| `svc-04.jpg` | svc_04 | 4:3 | 1200 | ja | Tapezierarbeiten — Wandgestaltung mit Mustertapete (Karte „Wandgestaltung") |
| `svc-05.jpg` | svc_05 | 4:3 | 1200 | ja | Spachteltechnik — Kalk-/Betonspachtel-Oberfläche (Karte „Premium") |
| `why-1.jpg` … `why-3.jpg` | why_1…why_3 | 4:3 | 1200 | ja | saubere Abklebe-Kante, staubfrei abgedeckter Boden, Farbberatung mit Mustern |
| `contact-img.jpg` | contact_img | 4:3 | 1200 | ja | einladendes Detail: Farbeimer + Pinsel vor heller Wand |
| `ba-after.jpg` | ba_after | 4:3 | 1200 | ja | **ZUERST** generieren + freigeben — frisch gestrichenes helles Zimmer |
| `ba-before.jpg` | ba_before | 4:3 | 1200 | ja | `pair_with: ba_after`, gleiche `pair_id` — vergilbtes Zimmer, gleiche Kamera |
| `team-1.jpg` … `team-3.jpg` | team_1…team_3 | 3:4 | 900 | ja | Environmental Portraits in weißer Arbeitskleidung, **nur Demo** |
| `avatar-1.jpg` … `avatar-4.jpg` | avatar_1…avatar_4 | 1:1 | 200 | nein | quadratische Crops aus team-1..3 + why-1 |
| `gal-01.jpg` | gal_01 | 4:3 | 1200 | nein | Galerie „Innen": Wohnzimmer in Salbei |
| `gal-02.jpg` | gal_02 | 4:3 | 1200 | nein | Galerie „Innen": helles Schlafzimmer |
| `gal-03.jpg` | gal_03 | 4:3 | 1200 | nein | Galerie „Fassade": frische Putzfassade |
| `gal-04.jpg` | gal_04 | 4:3 | 1200 | nein | Galerie „Lack": lackierte Altbautür |
| `gal-05.jpg` | gal_05 | 4:3 | 1200 | nein | Galerie „Spachteltechnik": Kalkspachtel im Bad |
| `gal-06.jpg` | gal_06 | 4:3 | 1200 | nein | Galerie „Spachteltechnik": Betonspachtel-Wand |

Galerie-Motive müssen zu den `kategorie`-Werten des Seeds passen (Innen, Fassade,
Lack, Spachteltechnik) — der Filter auf `/referenzen` baut daraus seine Buttons.

## Ketten-Logik (Reihenfolge ist Pflicht)

1. **Hero zuerst:** `hero-bg.jpg` generieren und freigeben — alle Stimmungs-/Licht-
   Referenzen hängen daran (Signature-Farbe Salbei dezent im Motiv).
2. **Video aus Hero:** `hero-video.mp4` als image-to-video vom freigegebenen Hero-Bild
   (5–8 s Loop, ≤ 3 MB, Poster = hero-bg — vgl. `config/video-guidelines.ts`).
   Motiv-Idee: Roller zieht eine ruhige Bahn, Lichtstimmung bleibt konstant.
3. **Vorher/Nachher:** **NACHHER (`ba-after.jpg`) zuerst** generieren und freigeben.
   Danach **VORHER (`ba-before.jpg`) als image-to-image** vom Nachher-Bild mit hoher
   Referenz-Stärke: nur der Zustand ändert sich (vergilbte, fleckige Altfarbe, Risse,
   staubiger Boden), **Raumgeometrie, Fenster, Kamera und Licht bleiben
   pixel-identisch — sonst verwerfen.** Beide mit gleicher `pair_id`.
4. **Galerie nach Hero:** `gal-01`–`gal-06` mit Hero als Stil-Referenz, damit die
   Referenzen-Seite eine durchgängige Lichtstimmung hat.
5. **Avatare zuletzt:** 1:1-Crops aus team-1..3 + why-1 (keine eigene Generierung).

## Team-Regel

Team-Motive (environmental portraits, weiße Arbeitskleidung, im Werk-Kontext,
bevorzugt von hinten/seitlich) sind **ausschließlich für Demos**. Live ersetzt
IMMER der Kunden-Upload — KI-Menschen als echtes Team wären ein Vertrauensbruch.

## Fertig-Kriterium (B6)

≥ 25 freigegebene Assets, darunter mindestens: 1 komplettes BA-Paar, 1 Hero,
1 Video, 4 Galerie-Bilder (mind. 2 Kategorien für den Filter).
Stub-Assets sind als STUB markiert und **niemals freigebbar**.
