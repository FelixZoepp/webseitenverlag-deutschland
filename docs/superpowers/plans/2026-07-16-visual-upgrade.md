# Visual Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually upgrade the Webseitenverlag landing page with a video-hero, Faris-style bento grids, glow effects, and Framer Motion animations — keeping all existing content and the blue color scheme.

**Architecture:** All changes happen in two files: `WvdClient.tsx` (JSX structure) and `marketing.css` (styles). Framer Motion (already installed) replaces custom IntersectionObserver animations. No new files or components needed.

**Tech Stack:** Next.js 14, React, Framer Motion, Tailwind (but marketing page uses scoped CSS via `marketing.css`)

## Global Constraints

- Color scheme stays: `--blue: #2563eb`, `--dark: #0f172a`, light backgrounds
- All text/headlines stay exactly as-is — only visual/structural changes
- No test framework — verification via `npx tsc --noEmit` and `npm run dev` visual check
- Framer Motion `^12.42.2` is installed but not yet used in WvdClient
- CSS is scoped under `.marketing-root` to avoid conflicts with admin/dashboard
- WvdClient.tsx is 810 lines — keep it as single file, follow existing inline-style patterns

---

### Task 1: CSS Foundation — Glow, Dot-Pattern, Video-Hero Styles

**Files:**
- Modify: `app/(marketing)/marketing.css`

**Interfaces:**
- Produces: CSS classes `.video-hero-container`, `.video-play-btn`, `.glow-pulse`, `.dot-pattern`, `.problem-bento`, `.problem-card`, `.urgency-cta`, `.workflow-v2`, `.workflow-line`, `.workflow-circle` used by Tasks 2–5

- [ ] **Step 1: Add video-hero CSS after the existing `.visual` block (after line 299)**

Append after the `@keyframes nodeFloat` block:

```css
/* ========================================
   VIDEO HERO
   ======================================== */
.hero-centered {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}
.hero-centered h1 {
  font-size: clamp(48px, 5.5vw, 88px);
  margin-bottom: 28px;
  line-height: 1.02;
}
.hero-centered .hero-lead {
  max-width: 620px;
  margin: 0 auto 36px;
}
.hero-centered .cta-row {
  justify-content: center;
}
.hero-centered .trust {
  justify-content: center;
  grid-template-columns: repeat(4, auto);
}

.video-hero-container {
  max-width: 720px;
  margin: 48px auto 0;
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, var(--dark-2) 0%, rgba(37,99,235,0.15) 50%, var(--dark) 100%);
  border: 1px solid rgba(37, 99, 235, 0.2);
  box-shadow: 0 30px 80px -20px rgba(37, 99, 235, 0.3);
  cursor: pointer;
  transition: transform 0.4s var(--smooth), box-shadow 0.4s var(--smooth);
  opacity: 0;
  animation: fadeInUp 1s var(--smooth) 2s forwards;
}
.video-hero-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 36px 90px -20px rgba(37, 99, 235, 0.4);
}
.video-hero-container img,
.video-hero-container video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play-btn {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--blue);
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  z-index: 2;
  box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5);
  animation: glowPulse 2.5s ease-in-out infinite;
  transition: transform 0.3s var(--spring);
}
.video-play-btn:hover {
  transform: translate(-50%, -50%) scale(1.1);
}
.video-play-btn svg {
  width: 28px; height: 28px;
  fill: white;
  margin-left: 3px;
}

@keyframes glowPulse {
  0%   { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
  50%  { box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
}
```

- [ ] **Step 2: Add problem-bento CSS after the section-head block (around line 310)**

```css
/* ========================================
   PROBLEM BENTO (3er Grid)
   ======================================== */
.problem-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.problem-card {
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--bg);
  overflow: hidden;
  transition: transform 0.4s var(--smooth), box-shadow 0.4s var(--smooth);
}
.problem-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.problem-card-visual {
  height: 200px;
  background: var(--cream-tint);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.problem-card-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0.4;
  background-image: radial-gradient(circle, var(--border) 1px, transparent 1px);
  background-size: 20px 20px;
}
.problem-card-visual svg {
  width: 80px;
  height: 80px;
  position: relative;
  z-index: 1;
  color: var(--blue);
  opacity: 0.6;
}

.problem-card-body {
  padding: 28px 28px 32px;
}
.problem-card-body h3 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  line-height: 1.3;
  margin-bottom: 10px;
  font-variation-settings: "opsz" 24, "SOFT" 50;
}
.problem-card-body p {
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.65;
}

@media (max-width: 768px) {
  .problem-bento {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Add workflow-v2 and urgency-cta CSS after the existing workflow block (after line 464)**

```css
/* ========================================
   WORKFLOW V2 (Faris-Style)
   ======================================== */
.workflow-v2 {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 0 20px;
  position: relative;
}

.workflow-v2-step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 2;
}

.workflow-circle {
  width: 72px; height: 72px;
  border-radius: 50%;
  background: var(--blue);
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.35);
  transition: transform 0.4s var(--spring), box-shadow 0.4s var(--spring);
  position: relative;
  z-index: 2;
}
.workflow-circle::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: rgba(37, 99, 235, 0.15);
  z-index: -1;
}
.workflow-v2-step:hover .workflow-circle {
  transform: scale(1.1);
  box-shadow: 0 12px 36px rgba(37, 99, 235, 0.5);
}
.workflow-circle svg {
  width: 28px; height: 28px;
  stroke: white;
  stroke-width: 2;
  fill: none;
}

.workflow-line {
  position: absolute;
  top: 36px;
  left: calc(50% + 36px);
  right: calc(-50% + 36px);
  height: 0;
  border-top: 2px dashed var(--blue);
  opacity: 0.4;
  z-index: 1;
}
.workflow-v2-step:last-child .workflow-line { display: none; }

.workflow-v2-step h3 {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 20px;
  line-height: 1.2;
  margin-bottom: 8px;
  font-variation-settings: "opsz" 24, "SOFT" 50;
}
.workflow-v2-step p {
  color: var(--ink-soft);
  font-size: 14px;
  line-height: 1.55;
  max-width: 240px;
  margin: 0 auto;
}

.urgency-cta {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  background: var(--dark);
  color: var(--cream);
  padding: 20px 32px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: all 0.3s var(--spring);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  margin-top: 48px;
  position: relative;
  overflow: hidden;
}
.urgency-cta::before {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
  animation: shimmer 2.8s infinite;
}
.urgency-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.5);
}
.urgency-cta .arrow-circle {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--blue);
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.urgency-cta .arrow-circle svg {
  width: 16px; height: 16px;
  stroke: white;
  fill: none;
}
.urgency-dot {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-soft);
  margin-top: 16px;
}
.urgency-dot::before {
  content: '';
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5);
  animation: ping 2s infinite;
}
@keyframes ping {
  0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5); }
  70%  { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
  100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
}

@media (max-width: 768px) {
  .workflow-v2 { flex-direction: column; gap: 40px; align-items: center; }
  .workflow-line { display: none; }
}
```

- [ ] **Step 4: Add 5er bento feature card glow styles after the existing bento block (after line 538)**

```css
/* Glow icon container for 5er bento */
.bento-icon-glow {
  width: 64px; height: 64px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 0 40px rgba(37, 99, 235, 0.2);
  transition: box-shadow 0.4s var(--smooth);
}
.bento-card:hover .bento-icon-glow {
  box-shadow: 0 0 60px rgba(37, 99, 235, 0.4);
}
.bento-icon-glow svg {
  width: 28px; height: 28px;
  stroke: var(--blue);
  fill: none;
  stroke-width: 1.8;
}
```

- [ ] **Step 5: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors (CSS-only changes don't affect TS)

- [ ] **Step 6: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add app/\(marketing\)/marketing.css
git commit -m "feat: add CSS foundation for video-hero, problem-bento, workflow-v2, glow effects"
```

---

### Task 2: Hero-Umbau — Video-Poster mit Play-Button

**Files:**
- Modify: `components/landing/WvdClient.tsx:182-252` (hero section JSX)

**Interfaces:**
- Consumes: CSS classes `.hero-centered`, `.video-hero-container`, `.video-play-btn` from Task 1
- Produces: Updated hero section with centered layout + video container

- [ ] **Step 1: Replace the hero section JSX**

In `WvdClient.tsx`, replace lines 182–252 (from `{/* 1. HERO */}` through the closing `</section>`) with:

```tsx
      {/* ═══════════════════════════════════════
          1. HERO – Das Versprechen
          ═══════════════════════════════════════ */}
      <section className="hero">
        <div className="animated-grid" id="heroGrid" />
        <div className="container hero-centered">
          <h1 className="display large text-reveal" id="heroHeadline">
            Webseiten, die Kunden bringen.
            <span className="accent">Für unter 100€ im Monat.</span>
            <span className="sub-line">Professionelles Webdesign · Keine Startgebühr · Alles inklusive</span>
          </h1>
          <p className="hero-lead">
            Professionelle Webseite erstellen lassen – ohne tausende Euro vorab.
            <strong> Ab 99€/Monat, komplett fertig in wenigen Tagen.</strong>{" "}
            Design, Hosting, SEO und Support inklusive. Damit du online gefunden wirst und neue Kunden gewinnst.
          </p>
          <div className="cta-row">
            <a href="/entwurf" className="btn btn-primary">
              <span>Kostenloses Erstgespräch buchen →</span>
            </a>
          </div>
          <div className="trust">
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
              200+ Webseiten live
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              In wenigen Tagen online
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></svg>
              0€ Startgebühr
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Monatlich kündbar
            </div>
          </div>

          {/* Video Container */}
          <div className="video-hero-container">
            <button className="video-play-btn" aria-label="Video abspielen">
              <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </button>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Remove the old `.hero-grid` CSS rule that sets 2-column grid**

In `marketing.css`, change `.hero-grid` (line 153-156) — this class is no longer used but we should not break other references. Simply leave it; the class is not referenced anymore after the JSX change.

- [ ] **Step 3: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

- [ ] **Step 4: Verify visually**

Run: `cd ~/webseitenverlag-deutschland && npm run dev`
Check `http://localhost:3000` — hero should be centered with a blue gradient video container and pulsing play button.

- [ ] **Step 5: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add components/landing/WvdClient.tsx
git commit -m "feat: rebuild hero with centered layout and video-poster play button"
```

---

### Task 3: Problem-Sektion → 3er Bento-Grid

**Files:**
- Modify: `components/landing/WvdClient.tsx:254-307` (problem section JSX)

**Interfaces:**
- Consumes: CSS classes `.problem-bento`, `.problem-card`, `.problem-card-visual`, `.problem-card-body` from Task 1

- [ ] **Step 1: Replace the problem section JSX**

In `WvdClient.tsx`, replace the problem section (from `{/* 2. PROBLEM-AGITATION */}` through its closing `</section>`) with:

```tsx
      {/* ═══════════════════════════════════════
          2. PROBLEM-AGITATION – "Kennst du das?"
          ═══════════════════════════════════════ */}
      <section id="problem" style={{ background: "var(--cream)", padding: "96px 0" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="section-head">
            <span className="eyebrow">Kommt dir das bekannt vor?</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 52px)" }}>
              Du bist gut in dem, was du tust. <span className="accent">Aber niemand findet dich.</span>
            </h2>
          </div>

          <div className="problem-bento">
            {[
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01" />
                  </svg>
                ),
                title: "Du hast Sichtbarkeit, aber der Kalender bleibt leer.",
                desc: "Du weißt, dass du online sichtbar sein musst. Aber 5.000–10.000€ vorab zahlen, ohne zu wissen ob es funktioniert? Das fühlt sich an wie ein Blindflug mit deinem Ersparten.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M7 8h4M7 11h6" />
                  </svg>
                ),
                title: "Schwächere Anbieter ziehen eiskalt an dir vorbei.",
                desc: "Die Seite deines Konkurrenten lädt schnell, ist mobil-optimiert und auf Google Seite 1. Du weißt, dass potenzielle Kunden abspringen – aber eine echte Lösung scheint zu teuer.",
              },
              {
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                ),
                title: "Du bist immer der, der hinterherrennt.",
                desc: "Statt dass Kunden von selbst anfragen, jagst du jeden Deal aktiv. Wer online nicht nach Premium aussieht, bettelt um Aufträge. Und killt dabei seine Verhandlungsposition.",
              },
            ].map((p, i) => (
              <div key={i} className="problem-card">
                <div className="problem-card-visual">
                  {p.icon}
                </div>
                <div className="problem-card-body">
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(20px, 2.5vw, 28px)", fontStyle: "italic", color: "var(--blue)", fontVariationSettings: '"opsz" 144, "SOFT" 80', lineHeight: 1.3 }}>
              Das Problem ist nicht, dass du kein Budget hast.<br />
              Das Problem ist, dass das alte Modell nicht für dich gemacht wurde.
            </p>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify build + visual**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors. Check localhost — 3 cards side by side with icons, dot pattern, hover effects.

- [ ] **Step 3: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add components/landing/WvdClient.tsx
git commit -m "feat: replace problem section with 3er bento-grid cards"
```

---

### Task 4: Workflow → Faris-Style Steps mit Dringlichkeit-CTA

**Files:**
- Modify: `components/landing/WvdClient.tsx:357-396` (workflow section JSX)

**Interfaces:**
- Consumes: CSS classes `.workflow-v2`, `.workflow-v2-step`, `.workflow-circle`, `.workflow-line`, `.urgency-cta`, `.urgency-dot` from Task 1

- [ ] **Step 1: Replace the workflow section JSX**

Replace the workflow section (from `{/* 4. DER PLAN */}` through its closing `</section>`) with:

```tsx
      {/* ═══════════════════════════════════════
          4. DER PLAN – 3 einfache Schritte
          ═══════════════════════════════════════ */}
      <section id="ablauf" className="workflow">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">So einfach geht&apos;s</span>
            <h2 className="display">Drei Schritte. <span className="accent">Null Stress.</span></h2>
            <p>Du kümmerst dich um deine Arbeit. Wir kümmern uns um deine Sichtbarkeit.</p>
          </div>

          <div style={{ background: "var(--cream)", borderRadius: 24, border: "1px solid var(--border)", padding: "48px 40px 40px" }}>
            <div className="workflow-v2">
              {[
                {
                  icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
                  title: "Kostenloses Erstgespräch",
                  desc: "In einem 15-Minuten-Gespräch lernen wir dich und dein Business kennen. Kostenlos und unverbindlich.",
                },
                {
                  icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></>,
                  title: "Webseite geht live",
                  desc: "Wir bauen deine Seite. In wenigen Tagen steht sie – fertig, optimiert, startklar.",
                },
                {
                  icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></>,
                  title: "Anfragen empfangen",
                  desc: "Deine Webseite arbeitet 24/7 für dich. Du wirst gefunden und bekommst Anfragen.",
                },
              ].map((s, i) => (
                <div key={i} className="workflow-v2-step">
                  <div className="workflow-circle">
                    <svg viewBox="0 0 24 24">{s.icon}</svg>
                  </div>
                  {i < 2 && <div className="workflow-line" />}
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <a href="/entwurf" className="urgency-cta">
                <span>Kostenloses Erstgespräch buchen</span>
                <span className="arrow-circle">
                  <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </span>
              </a>
              <div className="urgency-dot" style={{ justifyContent: "center" }}>
                Aktuell 3 Plätze diese Woche verfügbar
              </div>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify build + visual**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors. Check localhost — 3 circles connected by dashed lines, urgency CTA below.

- [ ] **Step 3: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add components/landing/WvdClient.tsx
git commit -m "feat: rebuild workflow as Faris-style steps with urgency CTA"
```

---

### Task 5: 5er Bento-Features Sektion einfügen

**Files:**
- Modify: `components/landing/WvdClient.tsx` — insert new section after Solution (Sektion 3), before Workflow (Sektion 4)

**Interfaces:**
- Consumes: Existing CSS classes `.bento-section`, `.bento-grid`, `.bento-card`, `.bento-card.wide`, `.bento-icon-glow` from Task 1 and existing CSS

- [ ] **Step 1: Insert the 5er bento section**

In `WvdClient.tsx`, find the closing `</section>` of section 3 ("DIE WENDE", ends around line 354 after the `stats-grid` div) and insert this new section AFTER it, BEFORE section 4 (Workflow):

```tsx
      {/* ═══════════════════════════════════════
          3b. FEATURES – 5er Bento
          ═══════════════════════════════════════ */}
      <section className="bento-section" style={{ padding: "120px 0" }}>
        <div className="beams" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-head">
            <span className="eyebrow" style={{ color: "var(--blue)" }}>Was du bekommst</span>
            <h2 className="display" style={{ color: "#fff", fontSize: "clamp(36px, 4.5vw, 52px)" }}>
              Alles inklusive. <span className="accent">Ohne Kompromisse.</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Design, Technik, SEO, Support – alles in einem Paket. Keine versteckten Kosten.
            </p>
          </div>

          <div className="bento-grid">
            {/* Row 1: 2 wide cards */}
            <div className="bento-card wide">
              <div className="card-content">
                <div className="bento-icon-glow">
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </div>
                <h3>24/7 Online</h3>
                <p className="bento-text">
                  Deine Webseite arbeitet rund um die Uhr für dich. Kunden finden dich, auch wenn du gerade arbeitest, schläfst oder im Urlaub bist.
                </p>
              </div>
              <div className="card-visual">
                <div style={{
                  width: "100%", maxWidth: 340, background: "var(--cream)", borderRadius: 16,
                  overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid var(--border)", background: "var(--cream-tint)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24" }} />
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
                    <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ink-soft)" }}>dein-betrieb.de</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ width: "75%", height: 10, borderRadius: 4, background: "rgba(37,99,235,0.2)", marginBottom: 8 }} />
                    <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#f1f5f9", marginBottom: 8 }} />
                    <div style={{ width: "85%", height: 8, borderRadius: 4, background: "#f1f5f9", marginBottom: 12 }} />
                    <div style={{ width: "50%", height: 28, borderRadius: 999, background: "var(--blue)" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bento-card wide">
              <div className="card-content">
                <div className="bento-icon-glow">
                  <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                </div>
                <h3>Conversion Optimiert</h3>
                <p className="bento-text">
                  Jede Seite ist so aufgebaut, dass Besucher zu Kunden werden. Klare Struktur, starke Texte, schnelle Ladezeiten.
                </p>
              </div>
              <div className="card-visual">
                <div style={{ width: "100%", maxWidth: 280, display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
                  {[40, 55, 35, 70, 50, 85, 65, 95].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, borderRadius: "6px 6px 0 0",
                      background: i === 7 ? "var(--blue)" : "rgba(255,255,255,0.08)",
                      border: i === 7 ? "none" : "1px solid rgba(255,255,255,0.06)",
                      transition: "height 0.6s var(--smooth)",
                    }} />
                  ))}
                </div>
                <div style={{
                  position: "absolute", top: 16, right: 20,
                  background: "rgba(74, 222, 128, 0.15)", border: "1px solid rgba(74, 222, 128, 0.3)",
                  borderRadius: 999, padding: "4px 12px",
                  fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, color: "#4ade80",
                }}>
                  +75%
                </div>
              </div>
            </div>

            {/* Row 2: 3 regular cards */}
            <div className="bento-card">
              <div className="card-content">
                <div className="bento-icon-glow">
                  <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                </div>
                <h3>SEO Inklusive</h3>
                <p className="bento-text">
                  Google-Optimierung von Anfang an. Damit du gefunden wirst, wenn Kunden in deiner Region suchen.
                </p>
              </div>
            </div>

            <div className="bento-card">
              <div className="card-content">
                <div className="bento-icon-glow">
                  <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                </div>
                <h3>Fertig in Tagen</h3>
                <p className="bento-text">
                  Keine monatelangen Projekte. Deine Webseite steht in wenigen Tagen – professionell und startklar.
                </p>
              </div>
            </div>

            <div className="bento-card">
              <div className="card-content">
                <div className="bento-icon-glow">
                  <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
                <h3>Support Inklusive</h3>
                <p className="bento-text">
                  Persönlicher Ansprechpartner. Änderungen, Updates, Fragen – wir sind für dich da.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
```

- [ ] **Step 2: Verify build + visual**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors. Check localhost — dark section with 5 bento cards (2 wide + 3 regular), glow icons, hover effects.

- [ ] **Step 3: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add components/landing/WvdClient.tsx
git commit -m "feat: add 5er bento-grid features section with glow icons"
```

---

### Task 6: Framer Motion ScrollReveal + Final Polish

**Files:**
- Modify: `components/landing/WvdClient.tsx` — add Framer Motion import, wrap sections in motion.div

**Interfaces:**
- Consumes: `framer-motion` package (already installed)

- [ ] **Step 1: Add Framer Motion import**

At the top of `WvdClient.tsx` (line 3), add after the existing imports:

```tsx
import { motion } from "framer-motion";
```

- [ ] **Step 2: Create a reusable reveal config**

After the imports and before the component function, add:

```tsx
const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  viewport: { once: true, margin: "-80px" },
} as const;
```

- [ ] **Step 3: Wrap key sections with motion.div**

Wrap the following section containers with `<motion.div {...reveal}>`:

1. **Problem section** — wrap the `<div className="problem-bento">` parent:
```tsx
<motion.div {...reveal}>
  <div className="problem-bento">
    {/* ...existing cards... */}
  </div>
</motion.div>
```

2. **Bento features section** — wrap `<div className="bento-grid">`:
```tsx
<motion.div {...reveal}>
  <div className="bento-grid">
    {/* ...existing cards... */}
  </div>
</motion.div>
```

3. **Workflow section** — wrap the workflow container:
```tsx
<motion.div {...reveal}>
  <div style={{ background: "var(--cream)", ... }}>
    {/* ...existing workflow... */}
  </div>
</motion.div>
```

4. **Social proof cards** — wrap the proof grid:
```tsx
<motion.div {...reveal}>
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", ... }}>
    {/* ...existing cards... */}
  </div>
</motion.div>
```

5. **Consequences section** — wrap the 2-column grid:
```tsx
<motion.div {...reveal}>
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", ... }}>
    {/* ...existing content... */}
  </div>
</motion.div>
```

- [ ] **Step 4: Remove the old text-reveal useEffect if it conflicts**

The text-reveal useEffect (lines 94-120) uses DOM manipulation for the hero headline. Keep it — it works independently of Framer Motion since it uses `requestAnimationFrame` and class-based animation.

- [ ] **Step 5: Verify build compiles**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty 2>&1 | head -10`
Expected: No errors

- [ ] **Step 6: Visual verification**

Run `npm run dev`, scroll through the page. Each section should fade in from below as you scroll to it.

- [ ] **Step 7: Commit**

```bash
cd ~/webseitenverlag-deutschland
git add components/landing/WvdClient.tsx
git commit -m "feat: add Framer Motion scroll reveal animations to landing sections"
```

---

### Task 7: End-to-End Verification

**Files:**
- No file changes

- [ ] **Step 1: Full TypeScript check**

Run: `cd ~/webseitenverlag-deutschland && npx tsc --noEmit --pretty`
Expected: Clean, zero errors

- [ ] **Step 2: Visual spot-check all sections**

Run dev server, check each section:
- Hero: centered, video container with glow play button
- Problem: 3 bento cards with icons and dot pattern
- Features: 5er bento with glow icons on dark background
- Workflow: circle icons, dashed lines, urgency CTA with green dot
- Scroll animations: sections fade in as you scroll

- [ ] **Step 3: Mobile responsive check**

Resize browser to ~375px width. Verify:
- Hero stacks properly, video container scales
- Problem cards stack to 1 column
- Bento cards stack properly
- Workflow steps stack vertically
- No horizontal overflow

- [ ] **Step 4: Review all changes**

Run: `cd ~/webseitenverlag-deutschland && git log --oneline -6`
Expected: 6 commits for this feature
