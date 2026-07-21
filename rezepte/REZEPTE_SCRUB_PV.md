# REZEPTE_SCRUB_PV — Higgsfield-Rezeptliste „Scroll-Scrub PV" (Premium, Solarflow-Seed)

> **Quelle: Felix' Guide „Scroll-Scrub PV Website — Kompletter 1:1 Guide" (Muster A4
> „Seam-locked Scroll Scrub").** Verbindlicher Vertrag für den Asset-Import
> (`scrubSlotKeyAusDateiname`, `lib/flagship/scrub/asset-slots.ts`).
>
> Konzept: EINE kontinuierliche Kamerafahrt in 5 nahtlosen Szenen — Scrollen
> steuert die Zeit. Sonne → Modul → Stromfluss → Haus → Speicher.

## Stil-Modul (Guide-Palette)

Hintergrund `#07090c` (Nacht-Blau) · Hauptakzent `#f5ff5a` (Sonnengelb) ·
Sekundär `#00e5ff` (Cyan) · Stimmung: Abenddämmerung, cinematisch, moody,
ultra-photorealistisch. **Jeder Prompt endet mit „no text, no logos".**

## Dateinamen-Vertrag

**Dateiname = Slot-ID mit Bindestrich** (`poster-01.jpg → poster_01`,
`clip-03.mp4 → clip_03`). Unbekannte Dateinamen werden abgewiesen (kein Raten).

## Slot-Deckung (10 Slots, Quelle: `lib/flagship/scrub/asset-slots.ts`)

| Datei | Slot | Format | Pflicht | Motiv |
|---|---|---|---|---|
| `poster-01.jpg` | poster_01 | 16:9, min 1920 | ja | Entry Still (Basis der Kette, zuerst!) — Haus mit PV-Dach in Abenddämmerung |
| `poster-02.jpg` … `poster-05.jpg` | poster_02…poster_05 | 16:9, min 1920 | ja | Frame bei 0.1 s aus Clip 2…5 (ffmpeg, siehe unten) |
| `clip-01.mp4` … `clip-05.mp4` | clip_01…clip_05 | 16:9, 1080p, 5 s | nein (Fallback Poster) | die 5 Szenen-Videos, seam-locked |

Die **Frame-Sequenz** des Canvas-Modus (240 Bilder) ist ein **Derivat** der Clips
und wird NICHT slot-verwaltet — sie wird über `inhalte.frames.pfad_muster`
referenziert (z. B. `/media/pv/frames/frame-NUM.jpg`, ziffern 4, fps 24).

## Schritt 1 — Entry Still (gpt_image_2, 7 Credits)

Params: `resolution: "2k"`, `aspect: "16:9"`.

> Cinematic wide shot of a modern minimalist house with a large solar panel
> array on the roof, golden hour, the sun positioned directly behind the house
> ridge creating a dramatic lens flare and god rays, deep blue twilight sky,
> ultra photorealistic, 8k detail, solar panels slightly glowing yellow from
> reflected sunlight, house dark inside, moody atmosphere, no text, no logos

## Schritt 2 — 5 Videos (seedance_2_0, 5 × 45 = 225 Credits)

Params identisch für alle: `duration: 5`, `resolution: "1080p"`,
`aspect: "16:9"`, `mode: "std"`, `genre: "epic"`, `generate_audio: false`,
`bitrate_mode: "high"`.

**Sequentiell zwingend: `start_image` von Video N+1 = letzter Frame von Video N.**
Nie zwei Videos parallel anstoßen.

1. **V1 (start: Entry Still)** — slow dolly forward toward the house, solar
   panels glow brighter as the camera approaches, lens flare shifts, twilight
   deepens, no text, no logos
2. **V2** — extreme close-up of solar cells glowing golden, camera pushing into
   the surface, tiny electric arcs sparking between cells, macro detail,
   no text, no logos
3. **V3** — electricity flows out of the cells as cyan light streams, camera
   follows the current along copper cables, seamless continuous motion forward,
   no text, no logos
4. **V4** — camera pulls back from macro to reveal the house interior coming
   alive, warm lights turning on one by one, warm glow contrasting the twilight
   outside, no text, no logos
5. **V5** — camera dollies back and reveals a battery storage unit with cyan
   LED charge indicators, then the complete system: battery, inverter, smart
   meter — the complete energy loop, no text, no logos

## Schritt 3 — Seam-Locking (ffmpeg)

Letzten Frame von Clip N extrahieren (start_image für N+1):

```bash
ffmpeg -y -i clip-01.mp4 -vframes 1 -ss 00:00:04.9 seam-01.png
# bei Bewegungsunschärfe stattdessen -ss 00:00:04.7
```

Szenen-Poster (poster-02…05) aus dem Clip-Anfang:

```bash
ffmpeg -y -i clip-02.mp4 -vframes 1 -ss 00:00:00.1 poster-02.jpg
```

**QA je Clip vor dem nächsten:** gleiche Bewegungsrichtung wie Vorgänger ·
letzter Frame scharf · keine Farbsprünge am Übergang. Sonst neu generieren.

## Schritt 4 — Encoding (nur falls Video-Fallback direkt ausgespielt wird)

```bash
# Desktop
ffmpeg -i in.mp4 -c:v libx264 -preset medium -crf 22 -g 8 -keyint_min 8 \
  -sc_threshold 0 -movflags +faststart -an out-desktop.mp4
# Mobile (720p, stärker komprimiert)
ffmpeg -i in.mp4 -c:v libx264 -preset medium -crf 25 -g 4 -keyint_min 4 \
  -sc_threshold 0 -movflags +faststart -an -vf "scale=-2:720" out-mobile.mp4
```

GOP 8 = Sweet Spot, `sc_threshold 0` = vorhersagbare Keyframes.
Budget: Desktop-Clips ≤ 32 MB gesamt, Mobile ≤ 16 MB gesamt.

## Schritt 5 — Frame-Sequenz für den Canvas-Modus

Zuerst die 5 Clips verlustarm zusammensetzen, dann Frames ziehen:

```bash
printf "file 'clip-01.mp4'\nfile 'clip-02.mp4'\nfile 'clip-03.mp4'\nfile 'clip-04.mp4'\nfile 'clip-05.mp4'\n" > liste.txt
ffmpeg -f concat -safe 0 -i liste.txt -c copy gesamt.mp4
mkdir -p frames
ffmpeg -i gesamt.mp4 -vf "fps=24" -q:v 5 frames/frame-%04d.jpg
```

Ziel: **≤ 5 MB gesamt** für die Sequenz — sonst `-q:v 7` oder `fps=20`
(dann `inhalte.frames.fps` und `gesamt` anpassen). Erst danach `inhalte.frames`
in der Config setzen (`pfad_muster` mit `NUM`, `gesamt` = Framezahl, `ziffern: 4`).

## QA-Checklist (Guide)

- [ ] Seams: vor- und zurückscrollen ohne sichtbaren Sprung an allen 4 Übergängen
- [ ] Poster-Modus ohne JS korrekt (SSR-Copy sichtbar, keine Leerflächen)
- [ ] `prefers-reduced-motion` zeigt Poster, kein Canvas
- [ ] Mobile: < 3 s auf 4G, kein Black Flash beim Einstieg
- [ ] iOS: tap-then-scroll funktioniert (deshalb Canvas statt Video-Seeking)
- [ ] Titel/OG gesetzt, keine Platzhalter/NaN, CTAs führen zu #kontakt

## Kosten (Higgsfield, geschätzt)

1× Entry Still (gpt_image_2, 2k) = **7 Credits** · 5× seedance_2_0 (5 s, 1080p,
std) = **225 Credits** · Reserve Branding/Retries = **14 Credits** →
**~246 Credits gesamt**. Freigabe durch Felix erforderlich (WARTELISTE).

## Fertig-Kriterium

5 freigegebene Poster + 5 seam-gelockte Clips + Frame-Sequenz ≤ 5 MB →
`inhalte.frames` setzen → Scrub-Modus aktiv. Bis dahin rendert die Komposition
automatisch den statischen Poster-Modus.
