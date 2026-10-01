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

