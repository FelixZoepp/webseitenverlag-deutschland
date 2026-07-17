# Video-Hero Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Growth-tier video heroes with transformation-focused Higgsfield prompts, a glow play-button, improved gradient masks, and an optional scroll-scrub mode that ties video progress to scroll position.

**Architecture:** Extend `VideoSlot` with a `modus` field, upgrade CSS/HTML/JS rendering in the flagship engine, replace generic ambient-motion prompts with per-branch transformation prompts, and add `header_animation` to the seeding schema so branches can specify their animation type.

**Tech Stack:** TypeScript, inline CSS/JS generation (flagship engine), Higgsfield image-to-video API, Zod schemas

## Global Constraints

- Growth-tier only — Starter/Business heroes stay image-only
- Both typo modes (`sans_bold_hell` / `serif_warm_dunkel`) must work with the new video hero
- `prefers-reduced-motion` must pause video and hide play-button (existing behavior preserved)
- No new npm dependencies
- Verification: `npx tsc --noEmit` + `npx tsx scripts/test-flagship.ts` (270 checks, 0 errors)
- `rgb()` helper in css.ts converts hex to "r,g,b" for rgba()
- Video prompts: no faces, static camera, no text/logos, 5-8s loop / up to 10s scrub

---

### Task 1: Extend VideoSlot type + header_animation schema

**Files:**
- Modify: `lib/flagship/types.ts`
- Modify: `lib/seeding/schema.ts`

**Interfaces:**
- Produces: `VideoSlot.modus?: 'loop' | 'scrub'` used by Tasks 2-4. `HeaderAnimationSchema` in seeding schema used by Task 4.

- [ ] **Step 1: Add `modus` to `VideoSlot` in types.ts**

Find the `VideoSlot` interface in `lib/flagship/types.ts`. It currently looks like:

```typescript
export interface VideoSlot {
  src: string
  poster?: string
}
```

Change to:

```typescript
export interface VideoSlot {
  src: string
  poster?: string
  /** 'loop' = autoplay loop (default), 'scrub' = video progress tied to scroll position */
  modus?: 'loop' | 'scrub'
}
```

- [ ] **Step 2: Add `header_animation` to seeding schema**

In `lib/seeding/schema.ts`, find the `BranchenProfilSchema` (the main Zod object). Add `header_animation` as an optional field. Find the closing of the schema object and add before it:

```typescript
  header_animation: z.object({
    typ: z.enum(['ambient_loop', 'scroll_scrub', 'material_makro']),
    higgsfield_prompt: z.string().min(20),
    poster_prompt: z.string().min(10),
    begruendung: z.string().min(10),
  }).optional(),
```

Also update the `BranchenProfil` TypeScript type (if it's inferred from the schema via `z.infer`, this happens automatically; if it's a separate interface, add the field manually).

- [ ] **Step 3: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/types.ts lib/seeding/schema.ts
git commit -m "feat(flagship): add VideoSlot.modus and header_animation to seeding schema"
```

---

### Task 2: Video-Hero CSS upgrade (play-button, gradient, scrub)

**Files:**
- Modify: `lib/flagship/css.ts`

**Interfaces:**
- Consumes: `rgb()` helper, design tokens `t`, `hell` boolean
- Produces: CSS classes `.vplay`, `.vplay.hidden`, `@keyframes vglow`, improved `.vshade`, `.vhero.scrub` used by Tasks 3-4

- [ ] **Step 1: Add play-button CSS**

In `css.ts`, find the Video-Hero section (starts with the comment `/* Video-Hero (Growth-Level) */`, around line 133). After the existing `.vcard` rules and before `.media{`, add:

```typescript
// Add inside the template string, after the .vcard media query block:

.vplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:var(--ak1);border:none;cursor:pointer;display:grid;place-items:center;z-index:3;box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},.5);animation:vglow 2.5s ease-in-out infinite;transition:opacity .5s,transform .3s var(--spring,ease)}
.vplay:hover{transform:translate(-50%,-50%) scale(1.1)}
.vplay.hidden{opacity:0;pointer-events:none}
.vplay svg{width:28px;height:28px;fill:${hell ? 'var(--text)' : 'var(--basis)'};margin-left:3px}
@keyframes vglow{0%{box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},.5)}50%{box-shadow:0 0 0 20px rgba(${rgb(t.akzent1)},0)}100%{box-shadow:0 0 0 0 rgba(${rgb(t.akzent1)},0)}}
```

- [ ] **Step 2: Improve gradient shade**

Find the existing `.vshade` rule (around line 136-138). Replace:

```css
.vshade{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,var(--basis) 0%,rgba(${rgb(t.basis)},.97) 34%,rgba(${rgb(t.basis)},.72) 52%,rgba(${rgb(t.basis)},0) 70%)}
.vshade::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(${rgb(t.basis)},.5),transparent 20%)}
```

With:

```css
.vshade{position:absolute;inset:0;z-index:1;pointer-events:none;
  background:linear-gradient(90deg,var(--basis) 0%,rgba(${rgb(t.basis)},.95) 30%,rgba(${rgb(t.basis)},.7) 50%,rgba(${rgb(t.basis)},.15) 70%,rgba(${rgb(t.basis)},0) 85%)}
.vshade::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(${rgb(t.basis)},.6),transparent 25%,transparent 75%,rgba(${rgb(t.basis)},.4))}
```

- [ ] **Step 3: Add scroll-scrub specific CSS**

After the play-button CSS (after the `@keyframes vglow` block), add:

```css
.vhero.scrub{min-height:200vh}
.vhero.scrub video{position:sticky;top:0;height:100vh;width:100%;object-fit:cover}
.vhero.scrub .vshade{position:sticky;top:0;height:100vh}
.vhero.scrub .vinner{position:sticky;top:0;height:100vh;display:flex;align-items:center}
```

- [ ] **Step 4: Update mobile vshade in the existing media query**

Find the existing mobile media query for `.vshade` (around line 142). It currently overrides the gradient for mobile. Update it to match the improved gradient:

```css
.vshade{background:linear-gradient(180deg,var(--basis) 0%,rgba(${rgb(t.basis)},.92) 30%,rgba(${rgb(t.basis)},.6) 55%,rgba(${rgb(t.basis)},.3) 100%)}
```

The existing rule is already similar — just verify the values match and the mobile override still works.

- [ ] **Step 5: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 6: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/css.ts
git commit -m "feat(flagship): add video-hero glow play-button, improved gradient mask, scroll-scrub CSS"
```

---

### Task 3: Video-Hero HTML + JS upgrade

**Files:**
- Modify: `lib/flagship/sections.ts` — video hero HTML
- Modify: `lib/flagship/js.ts` — play-button + scroll-scrub logic

**Interfaces:**
- Consumes: `VideoSlot.modus` from Task 1, CSS classes `.vplay`, `.vhero.scrub` from Task 2
- Produces: Updated video hero rendering with play-button and scroll-scrub support

- [ ] **Step 1: Update video hero HTML in sections.ts**

In `renderHero()`, find the video-hero branch (starts around line 50 with `if (hero.video?.src)`). Replace the entire video-hero return block (lines 50-79) with:

```typescript
  if (hero.video?.src) {
    const modus = hero.video.modus || 'loop'
    const posterAttr = hero.video.poster
      ? ` poster="${escAttr(hero.video.poster)}"`
      : hero.media.datei
        ? ` poster="${escAttr(hero.media.datei)}"`
        : ''
    const reducedBg = hero.video.poster || hero.media.datei
      ? `\n  <style>@media(prefers-reduced-motion:reduce){.vhero{background:url('${escAttr(hero.video.poster || hero.media.datei!)}') center/cover}}</style>`
      : ''
    const autoplayAttr = modus === 'loop' ? ' autoplay' : ''
    const loopAttr = modus === 'loop' ? ' loop' : ''
    const scrubClass = modus === 'scrub' ? ' scrub' : ''
    return `<!-- sektion:hero -->
<header class="vhero${scrubClass}" id="top" data-modus="${modus}">
  <video id="heroVideo"${autoplayAttr} muted${loopAttr} playsinline preload="metadata"${posterAttr}>
    <source src="${escAttr(hero.video.src)}" type="video/mp4">
  </video>
  <div class="vshade"></div>
  <div class="wrap vinner">
    <div class="rv in" style="max-width:640px">
      <span class="eyebrow">${esc(hero.eyebrow)}</span>
      <h1>${headline}</h1>
      <p class="lead" style="margin:24px 0 36px">${esc(hero.lead)}</p>
      <div class="cta-row">
        <a class="${ctaKlasse}" href="${escAttr(funnelUrl)}">${esc(hero.cta_label)} <span class="arr">→</span></a>${sekundaer}
      </div>
      <div class="chips">
        ${chips}
      </div>
    </div>
  </div>
  <button class="vplay" aria-label="Video abspielen"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
  <div class="stat-card vcard"><b>${esc(hero.stat2.wert)}</b><small>${esc(hero.stat2.label)}</small></div>
  <div class="scroll-hint">Entdecken <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg></div>${reducedBg}
</header>`
  }
```

- [ ] **Step 2: Update JS for play-button and scroll-scrub in js.ts**

In `lib/flagship/js.ts`, find the existing video-hero block (around line 116-118):

```typescript
  teile.push(`
  /* Highlight-Wipes im Hero sofort */
  document.querySelectorAll('.hero .hl, .vhero .hl').forEach(function(h){setTimeout(function(){h.classList.add('on')},300)});

  /* Video-Hero: reduced-motion → pausieren */
  var hv=document.getElementById('heroVideo');
  if(reduced&&hv){hv.pause();hv.removeAttribute('autoplay');}`)
```

Replace with:

```typescript
  teile.push(`
  /* Highlight-Wipes im Hero sofort */
  document.querySelectorAll('.hero .hl, .vhero .hl').forEach(function(h){setTimeout(function(){h.classList.add('on')},300)});

  /* Video-Hero */
  var hv=document.getElementById('heroVideo');
  var vplay=document.querySelector('.vplay');
  if(reduced&&hv){hv.pause();hv.removeAttribute('autoplay');if(vplay)vplay.classList.add('hidden')}

  /* Play-Button: hide after autoplay starts, click to play */
  if(hv&&vplay&&!reduced){
    hv.addEventListener('playing',function(){vplay.classList.add('hidden')});
    vplay.addEventListener('click',function(){hv.play()});
    /* If autoplay blocked by browser, keep button visible */
    var pp=hv.play();if(pp&&pp.catch)pp.catch(function(){vplay.classList.remove('hidden')});
  }

  /* Scroll-Scrub: tie video progress to scroll position */
  if(!reduced&&hv&&hv.closest('.scrub')){
    hv.pause();
    function scrubV(){
      var hero=hv.closest('.vhero');
      var r=hero.getBoundingClientRect();
      var total=r.height-innerHeight;
      if(total<=0)return;
      var p=Math.min(Math.max(-r.top/total,0),1);
      if(hv.duration)hv.currentTime=p*hv.duration;
    }
    addEventListener('scroll',scrubV,{passive:true});
    hv.addEventListener('loadedmetadata',scrubV);
  }`)
```

- [ ] **Step 3: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/flagship/sections.ts lib/flagship/js.ts
git commit -m "feat(flagship): add play-button with glow, scroll-scrub mode to video hero"
```

---

### Task 4: Transformation video prompts + pipeline integration

**Files:**
- Modify: `lib/pipeline/generate-flagship-demo.ts`

**Interfaces:**
- Consumes: `VideoSlot.modus` from Task 1, `BranchenProfil.header_animation` from Task 1
- Produces: Better video prompts and `modus` field set on generated demos

- [ ] **Step 1: Replace VIDEO_PROMPTS with transformation-focused prompts**

In `generate-flagship-demo.ts`, find the `VIDEO_PROMPTS` constant (around line 23-41). Replace the entire `Record<string, string>` with a `Record<string, { loop: string; scrub: string }>`:

```typescript
const VIDEO_PROMPTS: Record<string, { loop: string; scrub: string }> = {
  reinigung: {
    loop: 'Extreme close-up of a grimy glass surface — an invisible force wipes across from left to right, revealing crystal-clear sparkling glass with bright daylight streaming through. Water droplets bead and roll off the clean surface. Static camera, no person visible, no text, no logos.',
    scrub: 'Wide shot of a neglected dusty office space transforming into an immaculate clean room — dust disappears from surfaces, floors begin to gleam, windows clear up, everything shines. Static camera, no person, smooth continuous transformation, no text, no logos.',
  },
  restaurant_italienisch: {
    loop: 'Overhead static shot of an empty white ceramic plate on a rustic wooden table — steam rises as fresh handmade pasta with rich tomato sauce materializes on the plate, finished with torn basil leaves and shaved parmesan. Warm candlelight flickers. No hands visible, no text, no logos.',
    scrub: 'A bare dark restaurant table transforms into a fully set Italian dinner scene — white tablecloth appears, plates materialize, wine slowly fills crystal glasses, candles light themselves, napkins fold. Static camera, warm evening light, no person, no text, no logos.',
  },
  maler: {
    loop: 'Close-up of a paint roller pressing against a wall — fresh white paint spreads smoothly across a patchy grey surface, leaving a perfect even finish. Paint glistens wet under bright work lighting. Static camera, only roller and wall visible, no face, no text, no logos.',
    scrub: 'A room with damaged peeling walls transforms — cracks fill themselves, primer appears, then fresh paint rolls across every surface. The room brightens from dull grey to pristine white. Static camera, no person, no text, no logos.',
  },
  dachdecker: {
    loop: 'Close-up of weathered broken roof tiles — new slate tiles slide into place one by one, clicking together perfectly. Morning sunlight catches the clean dark surfaces. Static camera from above, only tiles and hands in work gloves visible, no face, no text, no logos.',
    scrub: 'Aerial view of a damaged old roof transforming — broken tiles replace themselves, flashing appears, gutters straighten. The roof goes from patchy and worn to pristine and uniform. Static camera, no person, no text, no logos.',
  },
  cafe: {
    loop: 'Close-up of an espresso machine portafilter locking in — rich dark espresso streams into a white ceramic cup, crema forms a perfect golden layer on top, steam wisps curl upward. Soft morning café light. Static camera, no face visible, no text, no logos.',
    scrub: 'An empty café counter transforms into a bustling setup — espresso machine gleams to life, pastries appear under glass cloches, coffee beans fill the grinder, menu boards write themselves. Warm morning light, static camera, no person, no text, no logos.',
  },
  kosmetikstudio: {
    loop: 'Close-up of a jade roller gliding across a dewy skin surface — product absorbs, skin transforms from dull to radiant and glowing. Soft pink-toned studio lighting with gentle lens flare. Static camera, only skin and tool visible, no face, no text, no logos.',
    scrub: 'A plain treatment room transforms into a luxurious spa setup — towels fold themselves, candles light, products arrange on shelves, the treatment bed prepares with fresh linens. Soft warm lighting, static camera, no person, no text, no logos.',
  },
  zahnarzt: {
    loop: 'Close-up of dental instruments arranged on a sterile tray — bright LED examination light slowly powers on, reflecting off polished chrome surfaces. Sterile blue-white lighting, clean and precise. Static camera, no person, no text, no logos.',
    scrub: 'An empty dental treatment room powers up — the chair adjusts itself, monitors flicker on showing dental imagery, instruments arrange on the tray, the overhead light swings into position. Clean clinical lighting, static camera, no person, no text, no logos.',
  },
  physiotherapie: {
    loop: 'Close-up of therapy resistance bands stretching and releasing in rhythmic motion — natural light streams through floor-to-ceiling windows of a modern treatment room. Bands catch the light with each stretch. Static camera, no person, no text, no logos.',
    scrub: 'A bare therapy room equips itself — exercise balls inflate, resistance bands hang themselves on hooks, a treatment table unfolds fresh sheets, anatomical charts appear on walls. Bright natural light, static camera, no person, no text, no logos.',
  },
  friseur: {
    loop: 'Extreme close-up of professional scissors making precise cuts through hair strands in slow motion — cut hair falls catching salon spotlight, each strand detailed and sharp. Warm salon lighting. Static camera, only scissors and hair visible, no face, no text, no logos.',
    scrub: 'A salon station transforms from closed to ready — mirror lights up, scissors and combs arrange themselves, fresh cape unfolds on the chair, product bottles line up. Warm professional lighting, static camera, no person, no text, no logos.',
  },
  kfz_werkstatt: {
    loop: 'Close-up of a chrome wrench turning on a bolt — oil glistens on metal surfaces, a hydraulic lift slowly raises a car in the background. Workshop LED lighting reflects off polished tools. Static camera, only hands in gloves and tools visible, no face, no text, no logos.',
    scrub: 'An empty garage bay comes to life — a hydraulic lift rises, tool chest drawers extend, diagnostic screens power on, compressed air hoses coil into place. Industrial lighting, static camera, no person, no text, no logos.',
  },
  autoaufbereitung: {
    loop: 'Close-up of a car hood surface — water beads form and slowly roll off a freshly ceramic-coated deep black surface, reflecting surrounding lights like a mirror. The paint transforms from matte dusty to mirror-glossy. Static camera, no person, no text, no logos.',
    scrub: 'A neglected dusty car transforms — dirt washes away layer by layer, scratches fill and disappear, paint deepens to a mirror finish, chrome trim gleams. The car goes from neglected to showroom condition. Static camera, no person, no text, no logos.',
  },
  umzugsunternehmen: {
    loop: 'Close-up of moving blankets gently settling over furniture — bubble wrap catches light, a dolly wheel rolls smoothly across hardwood floor. Morning light streams through an empty apartment window. Static camera, no face visible, no text, no logos.',
    scrub: 'An empty apartment fills itself — boxes slide in through the door, furniture unwraps and positions itself, pictures hang on walls, plants appear on windowsills. Morning light, static camera, no person, no text, no logos.',
  },
  fotograf: {
    loop: 'A camera shutter closes in slow motion — the brief moment of exposure captured in detail, followed by a soft studio flash reflecting off a silver umbrella. Gentle bokeh lights drift in background. Static camera, only camera equipment visible, no person, no text, no logos.',
    scrub: 'A dark photo studio lights up — backdrop rolls down, softboxes power on one by one, camera mounts itself on tripod, lens focuses. Dramatic lighting transformation from dark to perfectly lit. Static camera, no person, no text, no logos.',
  },
  fitnessstudio: {
    loop: 'Close-up of a barbell being loaded — weight plates slide onto the bar one by one with satisfying clicks, chrome gleams under gym LED lighting. The bar slightly flexes under the weight. Static camera, no person, no text, no logos.',
    scrub: 'An empty gym floor equips itself — dumbbells rack themselves by weight, a cable machine tensions its cables, mirrors reflect increasingly equipped space, rubber flooring mats interlock. Bright gym lighting, static camera, no person, no text, no logos.',
  },
  personal_training: {
    loop: 'Close-up of a kettlebell gently swinging in the morning dew — outdoor training setup with resistance bands stretching in the wind, fresh morning sunlight creating long shadows on grass. Static camera, no person, no text, no logos.',
    scrub: 'An empty outdoor training area sets itself up — cones place themselves, battle ropes coil out, a training mat unrolls, TRX straps hang from a frame. Morning golden hour light, static camera, no person, no text, no logos.',
  },
  hausmeisterservice: {
    loop: 'Close-up of a set of brass keys swinging gently on a caretaker key ring — behind them, a freshly painted railing dries in sunlight, a garden sprinkler slowly rotates. Warm afternoon light. Static camera, no person, no text, no logos.',
    scrub: 'A neglected building entrance transforms — peeling paint refreshes itself, broken light fixtures repair, the garden tidies, the entrance mat straightens. Afternoon sunlight, static camera, no person, no text, no logos.',
  },
  padel: {
    loop: 'A padel ball rolls slowly across a pristine blue court surface — subtle LED light reflections shimmer on the glass walls, dust particles float in the bright court lighting. The ball gently bounces once. Static camera at ground level, no person, no text, no logos.',
    scrub: 'An empty padel court prepares for play — court lines illuminate, net tensions itself, glass walls gleam as lights power on sequentially, a racket and balls appear courtside. Static camera, no person, no text, no logos.',
  },
}
```

- [ ] **Step 2: Update video generation to use new prompt format and set modus**

In the same file, find where `generiereVideo()` is called (there are two places — one in the `styleProfil?.style_prompts` branch and one in the fallback branch). Both call `generiereVideo({ imageUrl, prompt: videoPrompt, ... })`.

The video prompt selection and modus setting need to change. Find the video generation blocks (they start with `try { ... const video = await generiereVideo`).

For BOTH video generation blocks, update the video prompt selection to:

1. Check `styleProfil?.header_animation?.higgsfield_prompt` first
2. Fall back to `VIDEO_PROMPTS[brancheKey]`
3. Set the modus on the config

Replace the video prompt construction. In the **first block** (inside `if (styleProfil?.style_prompts)`), the video prompt is `baueVideoPrompt(styleProfil)`. Change the video generation try-catch:

Find the pattern:
```typescript
          try {
            const video = await generiereVideo({
              imageUrl: hero.publicUrl,
              prompt: videoPrompt,  // or baueVideoPrompt(styleProfil)
              durationSeconds: 6,
              kontext: `video:${kontext}`,
            })
            if (video.videoUrl) {
              kostenCent += video.kostenCent
              config.inhalte.hero.video = { src: video.videoUrl, poster: hero.publicUrl }
              assetMeta.video = { job_id: video.jobId, quelle: 'frisch' }
            }
```

And change the video object assignment to include `modus`:

```typescript
              const videoModus = styleProfil?.header_animation?.typ === 'scroll_scrub' ? 'scrub' as const : 'loop' as const
              config.inhalte.hero.video = { src: video.videoUrl, poster: hero.publicUrl, modus: videoModus }
```

Do this for BOTH video generation blocks (the one using `baueVideoPrompt` and the one using inline `videoPrompt`).

For the **second block** (fallback without `style_prompts`), also update the video prompt to use the new format:

Find the existing `videoPrompt` construction that builds from `VIDEO_PROMPTS[brancheKey]` or the inline prompt array. Replace it with:

```typescript
            let videoPrompt: string
            if (styleProfil?.header_animation?.higgsfield_prompt) {
              videoPrompt = styleProfil.header_animation.higgsfield_prompt
            } else {
              const branchenVideo = VIDEO_PROMPTS[brancheKey]
              if (branchenVideo) {
                videoPrompt = branchenVideo.loop
              } else {
                const heroLabel = config.inhalte.hero.media.label || config.inhalte.hero.eyebrow
                const brancheName = row.name || brancheKey
                videoPrompt = `Cinematic 4K, completely static tripod camera, zero camera movement. Close-up scene: ${heroLabel}. ${brancheName} environment. Subtle ambient motion, gentle material movement, dust particles in light. Seamless 5-second loop, calm and premium. No face visible, no person looking at camera. No text, no logos.`
              }
            }
```

- [ ] **Step 3: Verify**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts 2>&1 | tail -5`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 4: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add lib/pipeline/generate-flagship-demo.ts
git commit -m "feat(flagship): add transformation video prompts per branch, support loop/scrub modus"
```

---

### Task 5: End-to-End Verification

**Files:**
- No file changes

- [ ] **Step 1: Full TypeScript check**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty`
Expected: Clean, zero errors

- [ ] **Step 2: Flagship stress test**

Run: `cd ~/webseitenverlag-deutschland && npx tsx scripts/test-flagship.ts`
Expected: 270 Prüfungen, 0 Fehler

- [ ] **Step 3: Review all changes**

Run: `cd ~/webseitenverlag-deutschland && git log --oneline -4`
Expected: 4 commits for this feature

Run: `cd ~/webseitenverlag-deutschland && git diff HEAD~4 --stat`
Expected: 5 files changed:
- `lib/flagship/types.ts`
- `lib/seeding/schema.ts`
- `lib/flagship/css.ts`
- `lib/flagship/sections.ts`
- `lib/flagship/js.ts`
- `lib/pipeline/generate-flagship-demo.ts`
