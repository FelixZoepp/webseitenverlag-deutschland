# Video-Hero Upgrade — Bessere Prompts + Besseres Rendering

**Ziel:** Growth-Tier Video-Hero auf zwei Ebenen upgraden: (1) Higgsfield-Prompts die echte Objekt-Transformationen erzeugen statt generisches "ambient motion", (2) Browser-Rendering mit Gradient-Maske, Glow-Play-Button und optionalem Scroll-Scrub-Modus.

---

## Scope

**Geändert werden:**
- `lib/flagship/types.ts` — Neues Feld `hero.video.modus` für Loop vs Scroll-Scrub
- `lib/flagship/css.ts` — Video-Hero CSS upgraden (Glow-Play-Button, Gradient-Maske)
- `lib/flagship/sections.ts` — Video-Hero HTML mit Play-Button und Scroll-Scrub Markup
- `lib/flagship/js.ts` — Scroll-Scrub JS-Logik
- `lib/pipeline/generate-flagship-demo.ts` — Video-Prompt-Logik verbessern
- `lib/seeding/schema.ts` — `header_animation` Schema für Branchenprofil

**NICHT geändert:**
- Standard-Hero (ohne Video) — bleibt unverändert
- Starter/Business-Tier — bekommen weiterhin kein Video
- Asset-Pipeline (`lib/assets/pipeline.ts`) — Higgsfield-API-Calls bleiben gleich

---

## 1. Bessere Video-Prompts (Objekt-Transformation)

### Problem

Aktuelle `VIDEO_PROMPTS` in `generate-flagship-demo.ts` sind generisch:
```
"Light reflections slowly shifting on freshly cleaned glass surfaces, gentle water droplets..."
```
Das ergibt langweilige "Stockvideo-Stimmung". Kein Wow.

### Lösung

Jede Branche bekommt einen **Transformation-Prompt** der eine sichtbare Veränderung zeigt:

```typescript
const VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }> = {
  reinigung: {
    loop: 'A grimy, dusty glass surface slowly becoming crystal clear as an invisible force wipes across it from left to right, revealing a sparkling clean window with bright daylight streaming through. Static camera, extreme close-up, no person visible.',
    scrub: 'Transition from a dirty neglected office space to the same space immaculately clean — dust disappears, surfaces gleam, floors shine. Static wide shot, no person, the transformation unfolds smoothly.',
  },
  restaurant_italienisch: {
    loop: 'An empty white plate on a rustic wooden table — steam rises as fresh handmade pasta with rich tomato sauce materializes on the plate, finished with basil and parmesan. Warm candlelight, static overhead camera, no hands visible.',
    scrub: 'A bare restaurant table transforms into a fully set dinner scene — tablecloth appears, plates materialize, wine fills glasses, candles light themselves. Static camera, warm evening light, no person.',
  },
  // ... weitere Branchen
}
```

**Loop**: kurze, loopbare Transformation (5-8s), perfekt für autoplay.
**Scrub**: längere, lineare Transformation die mit Scroll-Position gesteuert wird.

Der Prompt-Typ wird aus `header_animation.typ` im Branchenprofil gewählt (oder Default: `ambient_loop`).

### Prompt-Regeln (aus bisherigen Lektionen)

- **Die Arbeit, nicht die Person** — keine Gesichter, keine erkennbaren Menschen
- **Statische Kamera** — nur das Objekt/die Szene verändert sich
- **5-8 Sekunden** für Loop, bis 10s für Scrub
- **Kein Text, keine Logos** im Video
- **Konkretes Ergebnis sichtbar** — nicht nur Stimmung, sondern eine Transformation

---

## 2. Video-Hero Rendering Upgrade

### 2a. VideoSlot-Typ erweitern

In `types.ts`, erweitere `VideoSlot`:

```typescript
export interface VideoSlot {
  src: string
  poster?: string
  modus?: 'loop' | 'scrub'  // NEU: Default 'loop'
}
```

### 2b. CSS Upgrade (css.ts)

Das bestehende `.vhero` CSS wird erweitert um:

**Play-Button mit Glow** (für Loop-Modus, versteckt sich nach autoplay-Start):
```css
.vplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:80px;height:80px;border-radius:50%;background:var(--ak1);border:none;
  cursor:pointer;display:grid;place-items:center;z-index:3;
  box-shadow:0 0 0 0 rgba(AK1_RGB,.5);animation:vglow 2.5s ease-in-out infinite;
  transition:opacity .5s,transform .3s}
.vplay:hover{transform:translate(-50%,-50%) scale(1.1)}
.vplay.hidden{opacity:0;pointer-events:none}
.vplay svg{width:28px;height:28px;fill:HERO_TEXT_COLOR;margin-left:3px}
@keyframes vglow{0%{box-shadow:0 0 0 0 rgba(AK1_RGB,.5)}50%{box-shadow:0 0 0 20px rgba(AK1_RGB,0)}100%{box-shadow:0 0 0 0 rgba(AK1_RGB,0)}}
```

**Verbesserte Gradient-Maske** (stärkerer Scrim für Lesbarkeit):
```css
.vshade{background:linear-gradient(90deg,
  var(--basis) 0%,rgba(BASIS_RGB,.95) 30%,rgba(BASIS_RGB,.7) 50%,rgba(BASIS_RGB,.15) 70%,rgba(BASIS_RGB,0) 85%)}
.vshade::after{background:linear-gradient(180deg,rgba(BASIS_RGB,.6),transparent 25%,transparent 75%,rgba(BASIS_RGB,.4))}
```

**Scroll-Scrub spezifisch:**
```css
.vhero.scrub{min-height:200vh}
.vhero.scrub video{position:sticky;top:0;height:100vh}
.vhero.scrub .vinner{position:sticky;top:0;height:100vh;display:flex;align-items:center}
```

### 2c. HTML Änderungen (sections.ts)

Video-Hero bekommt:
- Play-Button (nur visuell im Loop-Modus, versteckt sich nach autoplay-Start)
- `class="vhero scrub"` wenn `modus === 'scrub'`
- `data-modus="loop|scrub"` Attribut für JS

### 2d. JS Upgrade (js.ts)

**Loop-Modus:** Play-Button versteckt sich nach Video-Start:
```javascript
var hv=document.getElementById('heroVideo');
var vplay=document.querySelector('.vplay');
if(hv && vplay){
  hv.addEventListener('playing',function(){vplay.classList.add('hidden')});
  vplay.addEventListener('click',function(){hv.play()});
}
```

**Scroll-Scrub-Modus:** Video-Fortschritt an Scroll-Position koppeln:
```javascript
if(!reduced && hv && hv.closest('.scrub')){
  hv.removeAttribute('autoplay');
  hv.pause();
  function scrubVideo(){
    var hero=hv.closest('.vhero');
    var r=hero.getBoundingClientRect();
    var total=r.height-innerHeight;
    var p=Math.min(Math.max(-r.top/total,0),1);
    if(hv.duration){hv.currentTime=p*hv.duration}
  }
  addEventListener('scroll',scrubVideo,{passive:true});
  hv.addEventListener('loadedmetadata',scrubVideo);
}
```

---

## 3. Branchenprofil-Schema erweitern

In `lib/seeding/schema.ts`, füge `header_animation` zum `BranchenProfil` Schema hinzu:

```typescript
header_animation: z.object({
  typ: z.enum(['ambient_loop', 'scroll_scrub', 'material_makro']),
  higgsfield_prompt: z.string(),
  poster_prompt: z.string(),
  begruendung: z.string(),
}).optional()
```

Dies ist optional — bestehende Profile ohne `header_animation` funktionieren weiterhin mit den Default-Prompts aus `VIDEO_PROMPTS`.

---

## 4. Pipeline-Integration

In `generate-flagship-demo.ts`, wenn Video generiert wird:

1. Prüfe ob `styleProfil.header_animation` existiert
2. Wenn ja: nutze `header_animation.higgsfield_prompt` als Video-Prompt, setze `modus` aus `header_animation.typ`
3. Wenn nein: nutze die neuen `VIDEO_PROMPTS[brancheKey].loop` (Fallback wie bisher)
4. Setze `config.inhalte.hero.video.modus` auf den gewählten Modus

---

## Dateien-Änderungen

1. **`lib/flagship/types.ts`** — `VideoSlot.modus` Feld
2. **`lib/flagship/css.ts`** — `.vplay`, verbesserte `.vshade`, `.vhero.scrub`
3. **`lib/flagship/sections.ts`** — Play-Button HTML, `scrub` Klasse, `data-modus`
4. **`lib/flagship/js.ts`** — Play-Button hide, Scroll-Scrub Logik
5. **`lib/pipeline/generate-flagship-demo.ts`** — Bessere `VIDEO_PROMPTS`, `header_animation` Integration, `modus` setzen
6. **`lib/seeding/schema.ts`** — `header_animation` Schema (optional)
