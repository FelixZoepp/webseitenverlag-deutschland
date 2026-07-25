# Scroll-Scrub Multi-Szenen — Design-Spec

## Ziel

Echter Scroll-Scrub wie die Eitzen-Demo: 5 Videos die beim Scrollen vorwärts/rückwärts laufen, mit Start-Frame-Chaining für nahtlose Übergänge, GOP-Encoding für ruckelfreies Seeking, und Linger-Effekt an den Szenen-Enden.

## Trigger

NUR wenn `scroll_animationen === true` im Admin Demo-Formular angeklickt wird (Premium-Paket). Sonst normaler Hero (Fullscreen-Bild oder Loop-Video).

## Ablauf End-to-End

### 1. Seeding (einmalig pro Branche, lokal)

Script `scripts/seed-scrub-videos.ts`:

1. Claude generiert 5-Szenen-Story pro Branche (`scrub_szenen` im Profil)
2. Entry Still generieren (Higgsfield `gpt_image_2`, 16:9)
3. Video 1 generieren (Entry Still als `start_image`, Seedance 2.0, 5s, 1080p, 16:9)
4. Letzten Frame extrahieren (`ffmpeg -sseof -0.1 -i video.mp4 -update 1 -q:v 1 last_frame.jpg`)
5. Video 2 generieren (letzter Frame als `start_image`)
6. Wiederholen bis Video 5
7. Encoding:
   - Desktop: `ffmpeg -g 8 -keyint_min 8 -sc_threshold 0 -crf 18 -preset slower -movflags +faststart -vf scale=1920:-2 -an`
   - Mobile: `ffmpeg -g 4 -keyint_min 4 -sc_threshold 0 -crf 20 -preset slower -movflags +faststart -vf scale=1280:-2 -an`
   - Poster: `ffmpeg -vframes 1 -q:v 3`
8. Upload nach Supabase Storage (`asset-bank/scrub/{branche}/`)
9. URLs in `branchen_profile.profil.scrub_assets` speichern

Dauer: ~15 Min pro Branche (sequentiell wegen Frame-Chaining).

### 2. Datenmodell

Im Branchen-Profil `profil.scrub_szenen`:

```ts
interface ScrubSzene {
  id: string
  label: string         // 'Schritt 01 — Das Fundament'
  titel: string         // 'Wo alles beginnt.'
  text: string          // 2-3 Sätze
  tags: string[]        // 3 Stichworte
  align: 'left' | 'right'
  scroll: number        // 1.3-1.8
  linger: number        // 0.1-0.3
  videoPrompt: string   // Higgsfield Prompt (Englisch, cinematic)
}
```

Generierte Assets `profil.scrub_assets`:

```ts
interface ScrubAssets {
  entryStill: string
  clips: Array<{
    desktop: string     // GOP 8, 1080p
    mobile: string      // GOP 4, 720p
    poster: string      // JPEG
  }>
}
```

### 3. Demo-Generierung

Wenn `scroll_animationen === true` und Branchen-Profil `scrub_assets` hat:
- `config.scrub_szenen` = aus Branchen-Profil übernommen (inkl. Asset-URLs)
- Hero-Sektion wird durch Scrub-Multi ersetzt
- Gleiche Videos für alle Kunden derselben Branche (branchenspezifisch)

Wenn `scroll_animationen === true` aber KEINE `scrub_assets`:
- Fallback: normaler Loop-Video-Hero (wie bisher)

### 4. Scroll-Controller (Vanilla JS)

In `lib/flagship/js.ts`, neuer Modus. Kernlogik:

```
requestAnimationFrame Loop:
  1. Scroll-Position lesen
  2. Für jedes Segment: progress = (scrollPos - segStart) / segHöhe
  3. Aktives Segment bestimmen (höchste opacity)
  4. video.currentTime = lingerEase(progress, linger) * video.duration
  5. Interpolation: current += (target - current) * 0.2
  6. Opacity: smoothstep für Überblendung
```

Video-Loading:
- Videos per `fetch()` + Blob laden (Kontrolle über Timing)
- Nur ±1.5 Viewport vorausladen
- Poster bis Video geladen

### 5. CSS

```css
.scrub-multi { display: grid; grid-template-columns: 1fr 1fr; }
.scrub-stage { position: sticky; top: 0; height: 100dvh; overflow: hidden; }
.scrub-layer { position: absolute; inset: 0; opacity: 0; }
.scrub-layer video, .scrub-layer img { width: 100%; height: 100%; object-fit: cover; }
.scrub-story { grid-column: 2; }
.scrub-chapter { min-height: 100dvh; display: flex; align-items: center; padding: 20vh 48px; }
@media (hover: none) and (pointer: coarse) { .scrub-chapter { min-height: 60dvh; } }
@media (max-width: 860px) {
  .scrub-multi { grid-template-columns: 1fr; }
  .scrub-story { position: relative; }
  .scrub-chapter { min-height: auto; padding: 40px 24px; }
}
```

### 6. Renderer Integration

`lib/flagship/sections.ts` — `renderHero()`:
- Wenn `config.scrub_szenen` vorhanden UND `config.scroll_animationen === true`:
  → rendert Scrub-Multi HTML statt normalen Hero
- Sonst: wie bisher (Fullscreen-Bild oder Loop-Video)

### 7. Szenen-Generierung durch Claude

Beim Branchen-Seeding generiert Claude `scrub_szenen`. Prompt:

"Schreibe eine 5-Szenen-Verwandlungsgeschichte für {Branche}. Jede Szene zeigt einen sichtbaren Schritt der Transformation — vom Zustand vorher bis zum perfekten Ergebnis. Die Kamera fährt langsam durch die Szene, cinematic, 16:9. Pro Szene: id (snake_case), label (Schritt 01-05), titel (kurz, poetisch), text (2-3 Sätze), tags (3 Stichworte), videoPrompt (Englisch, cinematic, episch, 5 Sekunden)."

### Nicht im Scope

- Canvas-basiertes Frame-Rendering (Video-Element reicht mit GOP-Encoding)
- Audio/Soundtrack
- Individuelle Szenen pro Kunde (branchenspezifisch reicht)
- React/Framework (Vanilla JS)
- Automatisches Seeding im CI (manueller Lauf)
