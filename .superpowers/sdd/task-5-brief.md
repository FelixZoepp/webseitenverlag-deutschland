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

