"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

/** Live-Demo GrünWerk GaLaBau (T3, Felix 2026-07-22: Demo auf der Landingpage). */
const DEMO_URL = "/demo/VQDzw4LlCT82KT4_X3xU3rL1Rwq3k21A";

/** Beispiel-Demos (Higgsfield, Felix 2026-07-22: eigene Reihe unter den Ergebnissen). */
const BEISPIEL_DEMOS = [
  { name: "Solar", url: "https://sonnenstrom-journey.higgsfield.app" },
  { name: "Dachdecker", url: "https://dachmeister.higgsfield.app" },
  { name: "Garten", url: "https://garden-scroll.higgsfield.app" },
];

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: "easeOut" },
  viewport: { once: true, margin: "-80px" },
} as const;

/* ═══════════════════════════════════════
   ROI CALCULATOR DATA
   ═══════════════════════════════════════ */
const BRANCHEN_DATA: Record<string, { base: number; terms: string[] }> = {
  "Elektriker": { base: 320, terms: ["Elektriker", "Elektroinstallation"] },
  "Maler": { base: 280, terms: ["Maler", "Malerarbeiten"] },
  "Dachdecker": { base: 260, terms: ["Dachdecker", "Dachsanierung"] },
  "Sanitär & Heizung": { base: 390, terms: ["Sanitär", "Heizungsbau"] },
  "Schreiner / Tischler": { base: 210, terms: ["Schreiner", "Tischler"] },
  "KFZ-Werkstatt": { base: 350, terms: ["KFZ Werkstatt", "Autowerkstatt"] },
  "Friseur": { base: 420, terms: ["Friseur", "Friseursalon"] },
  "Physiotherapie": { base: 380, terms: ["Physiotherapie", "Physiotherapeut"] },
  "Zahnarzt": { base: 510, terms: ["Zahnarzt", "Zahnärzte"] },
  "Rechtsanwalt": { base: 440, terms: ["Rechtsanwalt", "Anwalt"] },
  "Steuerberater": { base: 360, terms: ["Steuerberater", "Steuerkanzlei"] },
  "Coach / Berater": { base: 180, terms: ["Business Coach", "Unternehmensberater"] },
  "Fotograf": { base: 250, terms: ["Fotograf", "Fotostudio"] },
  "Fitnessstudio": { base: 300, terms: ["Fitnessstudio", "Gym"] },
  "Restaurant / Café": { base: 340, terms: ["Restaurant", "Café"] },
  "Immobilienmakler": { base: 290, terms: ["Immobilienmakler", "Immobilien"] },
  "Architekt": { base: 200, terms: ["Architekt", "Architekturbüro"] },
  "Reinigungsfirma": { base: 310, terms: ["Reinigungsfirma", "Gebäudereinigung"] },
};

const STADT_MULTIPLIER: Record<string, number> = {
  "Berlin": 2.8, "Hamburg": 2.2, "München": 2.5, "Köln": 1.9,
  "Frankfurt": 1.8, "Stuttgart": 1.7, "Düsseldorf": 1.6, "Leipzig": 1.3,
  "Dortmund": 1.3, "Essen": 1.2, "Bremen": 1.1, "Dresden": 1.2,
  "Hannover": 1.3, "Nürnberg": 1.3, "Duisburg": 1.0, "Bochum": 1.0,
  "Wuppertal": 0.9, "Bielefeld": 0.9, "Bonn": 1.1, "Münster": 1.1,
  "Mannheim": 1.1, "Augsburg": 1.0, "Wiesbaden": 1.0, "Braunschweig": 0.9,
  "Kiel": 0.9, "Aachen": 0.9, "Freiburg": 0.9, "Lübeck": 0.8,
  "Andere / Kleinstadt": 0.6, "Ländliche Region": 0.4,
};

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */
export default function WvdClient() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  /* ROI Calculator State */
  const [auftragswert, setAuftragswert] = useState("");
  const [branche, setBranche] = useState("");
  const [stadt, setStadt] = useState("");
  const [showResult, setShowResult] = useState(false);

  const roi = useMemo(() => {
    const wert = parseFloat(auftragswert) || 0;
    const branchenData = BRANCHEN_DATA[branche];
    const stadtMult = STADT_MULTIPLIER[stadt] || 0.6;
    if (!wert || !branchenData) return null;

    const suchvolumen = Math.round(branchenData.base * stadtMult);
    const klicks = Math.round(suchvolumen * 0.035); // 3.5% CTR top 5
    const anfragen = Math.round(klicks * 0.08); // 8% Conversion
    const auftraege = Math.max(1, Math.round(anfragen * 0.3)); // 30% Closing
    const umsatz = auftraege * wert;
    const gewinn = umsatz - 99;
    const roiX = Math.round(umsatz / 99);

    // Agentur-Vergleich
    const agenturKosten = 5500;
    const agenturMonatlich = 49;
    const breakEvenMonate = Math.ceil(agenturKosten / (umsatz - agenturMonatlich));

    return { suchvolumen, klicks, anfragen, auftraege, umsatz, gewinn, roiX, breakEvenMonate: Math.max(1, breakEvenMonate) };
  }, [auftragswert, branche, stadt]);

  /* Grid Pattern */
  useEffect(() => {
    const grid = document.getElementById("heroGrid");
    if (!grid) return;
    const cols = 24, rows = 12, cellW = 60, cellH = 60;
    const w = cols * cellW, h = rows * cellH;
    let cells = "";
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (Math.random() < 0.25) {
          cells += `<rect class="grid-cell" x="${x * cellW}" y="${y * cellH}" width="${cellW - 2}" height="${cellH - 2}" rx="4"/>`;
        }
      }
    }
    grid.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${cells}</svg>`;
  }, []);

  /* Text Reveal */
  useEffect(() => {
    const headline = document.getElementById("heroHeadline");
    if (!headline) return;
    const wrapWords = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent!.split(/(\s+)/);
        const fragment = document.createDocumentFragment();
        words.forEach((word) => {
          if (word.trim()) {
            const span = document.createElement("span");
            span.className = "word";
            span.textContent = word;
            fragment.appendChild(span);
          } else if (word) {
            fragment.appendChild(document.createTextNode(word));
          }
        });
        node.parentNode!.replaceChild(fragment, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        Array.from(node.childNodes).forEach(wrapWords);
      }
    };
    wrapWords(headline);
    headline.querySelectorAll(".word").forEach((w, i) => {
      (w as HTMLElement).style.animationDelay = i * 0.08 + "s";
    });
  }, []);

  /* Number Ticker */
  useEffect(() => {
    const stats = document.querySelectorAll<HTMLElement>(".stat-num[data-target]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const target = parseInt(el.dataset.target!, 10);
            const suffix = el.dataset.suffix || "";
            const duration = 1500;
            const startTime = performance.now();
            const tick = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.round(target * eased) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );
    stats.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* ═══════════════════════════════════════
          NAV
          ═══════════════════════════════════════ */}
      <nav>
        <div className="nav-inner">
          <a href="#" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </a>
          <div className="nav-links">
            <a href="#problem">Warum jetzt</a>
            <a href="#rechner">ROI-Rechner</a>
            <a href="#ablauf">Ablauf</a>
            <a href="/kundenmeinungen">Kundenmeinungen</a>
            <a href="/blog">Blog</a>
          </div>
          <a href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</a>
          <button
            className="nav-burger"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menü"
            aria-expanded={mobileMenu}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
              {mobileMenu ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileMenu && (
          <div className="nav-mobile-menu">
            <a href="#problem" onClick={() => setMobileMenu(false)}>Warum jetzt</a>
            <a href="#rechner" onClick={() => setMobileMenu(false)}>ROI-Rechner</a>
            <a href="#ablauf" onClick={() => setMobileMenu(false)}>Ablauf</a>
            <a href="/kundenmeinungen" onClick={() => setMobileMenu(false)}>Kundenmeinungen</a>
            <a href="/blog" onClick={() => setMobileMenu(false)}>Blog</a>
          </div>
        )}
      </nav>

      {/* ═══════════════════════════════════════
          1. HERO – Das Versprechen
          ═══════════════════════════════════════ */}
      <section className="hero">
        <div className="animated-grid" id="heroGrid" />
        <div className="container hero-split">
          <span className="eyebrow hero-badge">Professionelles Webdesign · Alles inklusive</span>
          <h1 className="display large text-reveal" id="heroHeadline">
            Webseiten, die<br />Kunden bringen.
            <span className="accent">Für unter 100 €<br />im Monat.</span>
          </h1>
          <p className="hero-lead">
            Professionelle Webseite erstellen lassen – ohne tausende Euro vorab.
            <strong> Ab 99 €/Monat, komplett fertig in wenigen Tagen.</strong>{" "}
            Design, Hosting, SEO und Support inklusive. Damit du online gefunden wirst und neue Kunden gewinnst.
          </p>
          <div className="cta-row">
            <a href="/entwurf" className="btn btn-primary">
              <span>Kostenloses Erstgespräch buchen →</span>
            </a>
            <a href="#ergebnisse" className="btn btn-ghost">
              <span>Beispiele ansehen</span>
            </a>
          </div>

          {/* Video-Karte (rechts ab 1024px, mobil zwischen CTA und Trust-Pills) */}
          <div className="hero-video-wrap">
            <div className="hero-video-card" data-slot="hero_video_poster">
              <div className="hero-video-poster" aria-hidden="true" />
              <button className="video-play-btn" aria-label="Video abspielen">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </button>
            </div>
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
              0 € Startgebühr
            </div>
            <div className="trust-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              Monatlich kündbar
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          2. PROBLEM-AGITATION – "Kennst du das?"
          ═══════════════════════════════════════ */}
      <section id="problem" style={{ background: "var(--cream)" }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="section-head">
            <span className="eyebrow">Kommt dir das bekannt vor?</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 52px)" }}>
              Du bist gut in dem, was du tust. <span className="accent">Aber niemand findet dich.</span>
            </h2>
          </div>

          <motion.div {...reveal}>
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
          </motion.div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: "clamp(20px, 2.5vw, 28px)", letterSpacing: "-0.02em", color: "var(--red-500)", lineHeight: 1.3 }}>
              Das Problem ist nicht, dass du kein Budget hast.<br />
              Das Problem ist, dass das alte Modell nicht für dich gemacht wurde.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3. DIE WENDE – Guide-Positionierung
          ═══════════════════════════════════════ */}
      <section>
        <div className="container about-grid">
          <div className="about-text">
            <span className="eyebrow">Warum es heute anders geht</span>
            <h2 className="display">
              Stell dir vor, deine Webseite <em>kostet dich nichts</em> – sie <em>bringt dir etwas</em>.
            </h2>
            <p>
              Wir kennen das, weil wir jahrelang dasselbe beobachtet haben: Gute Handwerker, Berater und Selbstständige,
              die Aufträge verdient hätten – aber online unsichtbar waren. <strong>Weil das alte Agentur-Modell
              sie dazu zwingt, tausende Euro zu riskieren, bevor ein einziger Kunde anfragt.</strong>
            </p>
            <p>
              Deshalb haben wir das Modell umgedreht: <strong>Du zahlst 99€ im Monat. Wir liefern alles.</strong>
              Design, Technik, Hosting, Google-Optimierung, Updates, Support.
              Kein Einmal-Invest. Kein Risiko. Du kannst jederzeit kündigen.
            </p>
            <p>
              <strong>Eine einzige Kundenanfrage, die über deine neue Webseite kommt,
              refinanziert oft dein ganzes Jahres-Abo.</strong> Denk mal darüber nach.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat">
              <div className="stat-num" data-target="200" data-suffix="+">0</div>
              <div className="stat-label">Webseiten live</div>
            </div>
            <div className="stat">
              <div className="stat-num" data-target="0" data-suffix="€">0</div>
              <div className="stat-label">Startgebühr</div>
            </div>
            <div className="stat">
              <div className="stat-num" data-target="99" data-suffix="€">0</div>
              <div className="stat-label">Pro Monat, all-in</div>
            </div>
            <div className="stat">
              <div className="stat-num" data-target="98" data-suffix="%">0</div>
              <div className="stat-label">Zufriedenheit</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          3b. FEATURES – 5er Bento
          ═══════════════════════════════════════ */}
      <section className="bento-section">
        <div className="beams" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className="section-head">
            <span className="eyebrow">Was du bekommst</span>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 52px)" }}>
              Alles inklusive. <span className="accent">Ohne Kompromisse.</span>
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Design, Technik, SEO, Support – alles in einem Paket. Keine versteckten Kosten.
            </p>
          </div>

          <motion.div {...reveal}>
          <div className="features-bento">
            {/* 1 — In Tagen live (große Zelle, Browser-Mockup) */}
            <div className="fb-card fb-web">
              <div className="fb-head">
                <h3>In Tagen live</h3>
                <p className="bento-text">Vom Erstgespräch zur fertigen Webseite — professionell aufgebaut und sofort erreichbar.</p>
              </div>
              <div className="fb-visual">
                <div className="fb-browser">
                  <div className="fb-browser-bar">
                    <span className="fb-dot" style={{ background: "#F87171" }} />
                    <span className="fb-dot" style={{ background: "#FBBF24" }} />
                    <span className="fb-dot" style={{ background: "#4ADE80" }} />
                    <span className="fb-url">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      malermeister-krause.de
                    </span>
                    <span className="fb-live"><span className="fb-live-dot" />Live</span>
                  </div>
                  <div className="fb-site">
                    <div className="fb-site-hero">
                      <div className="fb-site-headline" />
                      <div className="fb-site-sub" />
                    </div>
                    <div className="fb-site-cards">
                      <div className="fb-site-card"><span /><span /></div>
                      <div className="fb-site-card"><span /><span /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2 — Sie schreiben, die KI baut (Chat-Szene) */}
            <div className="fb-card fb-editor">
              <div className="fb-head">
                <h3>Sie schreiben, die KI baut</h3>
                <p className="bento-text">Änderungswunsch im Chat — die Seite passt sich an. Ohne Agentur, ohne Wartezeit.</p>
              </div>
              <div className="fb-visual">
                <div className="fb-chat">
                  <div className="fb-bubble-user">Mach die Überschrift größer</div>
                  <div className="fb-answer-card">
                    <span className="fb-answer-headline">Malerbetrieb Krause</span>
                    <span className="fb-answer-line" />
                  </div>
                  <span className="fb-published">✓ Veröffentlicht</span>
                </div>
              </div>
            </div>

            {/* 3 — Bei Google gefunden (Such-Snippet) */}
            <div className="fb-card fb-google">
              <div className="fb-head">
                <h3>Bei Google gefunden</h3>
                <p className="bento-text">Lokale Suchbegriffe, saubere Technik — Ihre Kunden finden Sie dort, wo sie suchen.</p>
              </div>
              <div className="fb-visual">
                <div className="fb-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  Maler Wiesbaden
                </div>
                <div className="fb-snippet">
                  <span className="fb-snippet-top"><span className="fb-favicon" />Malermeister Krause — Maler in Wiesbaden</span>
                  <span className="fb-snippet-url">malermeister-krause.de</span>
                </div>
                <span className="fb-rank">Platz 1</span>
              </div>
            </div>

            {/* 4 — Anfragen direkt aufs Handy (Notification-Stapel) */}
            <div className="fb-card fb-anfragen">
              <div className="fb-head">
                <h3>Anfragen direkt aufs Handy</h3>
                <p className="bento-text">Jede Anfrage landet sofort bei Ihnen — per E-Mail und aufs Handy.</p>
              </div>
              <div className="fb-visual">
                <div className="fb-stack">
                  <div className="fb-notif fb-notif-3" aria-hidden="true" />
                  <div className="fb-notif fb-notif-2" aria-hidden="true" />
                  <div className="fb-notif fb-notif-1">
                    <span className="fb-avatar">S</span>
                    <span className="fb-notif-text">
                      <strong>Neue Anfrage · vor 2 Min</strong>
                      Guten Tag, wir bräuchten ein Angebot für…
                    </span>
                    <span className="fb-arrow">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 5 — Alles inklusive (Checkliste + Preis-Pill) */}
            <div className="fb-card fb-inklusive">
              <div className="fb-head">
                <h3>Alles inklusive</h3>
                <p className="bento-text">Ein Preis, keine versteckten Kosten — Technik und Pflege übernehmen wir.</p>
              </div>
              <div className="fb-visual">
                <div className="fb-checks">
                  <span>Design <em>✓</em></span>
                  <span>Hosting <em>✓</em></span>
                  <span>SEO <em>✓</em></span>
                  <span>Support <em>✓</em></span>
                </div>
                <div className="fb-price-row">
                  <span className="fb-price">99 €/Monat</span>
                  <span className="fb-dsgvo">DSGVO</span>
                </div>
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      </section>

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

          <motion.div {...reveal}>
          <div style={{ background: "var(--cream)", borderRadius: 24, border: "1px solid var(--border)", padding: "48px 40px 40px" }}>
            <div className="workflow-v2">
              {[
                {
                  icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 13.8 19.79 19.79 0 0 1 1.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />,
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
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          5. ROI-RECHNER – Das Herzstück
          ═══════════════════════════════════════ */}
      <section id="rechner" className="bento-section">
        <div className="beams" />
        <div className="container" style={{ maxWidth: 880, position: "relative", zIndex: 2 }}>
          <div className="section-head">
            <span className="eyebrow">Was bringt dir eine Webseite wirklich?</span>
            <h2 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)" }}>
              Rechne es dir <span className="accent">selbst aus</span>.
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Gib deine Daten ein und sieh, was eine sichtbare Webseite für dein Business bedeuten kann. Konservativ berechnet.
            </p>
          </div>

          {/* Input Fields */}
          <div className="form-grid" style={{ marginBottom: 40 }}>
            <div className="form-field">
              <label>1. Deine Branche</label>
              <select
                value={branche}
                onChange={(e) => { setBranche(e.target.value); setShowResult(false); }}
              >
                <option value="">Branche wählen</option>
                {Object.keys(BRANCHEN_DATA).map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>2. Deine Stadt / Region</label>
              <select
                value={stadt}
                onChange={(e) => { setStadt(e.target.value); setShowResult(false); }}
              >
                <option value="">Stadt wählen</option>
                {Object.keys(STADT_MULTIPLIER).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-field full">
              <label>3. Dein durchschnittlicher Auftragswert (€)</label>
              <input
                type="number"
                placeholder="z.B. 2500 – Was verdienst du im Schnitt pro Auftrag?"
                value={auftragswert}
                onChange={(e) => { setAuftragswert(e.target.value); setShowResult(false); }}
              />
            </div>
          </div>

          {/* Calculate Button */}
          {!showResult && (
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <button
                onClick={() => roi && setShowResult(true)}
                className="btn btn-primary"
                style={{ padding: "20px 56px", fontSize: 17, opacity: roi ? 1 : 0.4, pointerEvents: roi ? "auto" : "none" }}
              >
                <span>Mein Potenzial berechnen →</span>
              </button>
            </div>
          )}

          {/* Results */}
          {showResult && roi && (
            <div style={{ animation: "fadeInUp 0.22s var(--ease-out) forwards" }}>
              {/* Funnel */}
              <div className="roi-funnel" style={{ marginBottom: 32 }}>
                {[
                  { label: "Google-Suchen/Monat", value: roi.suchvolumen.toLocaleString("de-DE"), sub: `„${branche} ${stadt}"`, icon: <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" /> },
                  { label: "Klicken auf Top-Seiten", value: roi.klicks.toString(), sub: "~3.5% CTR", icon: <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></> },
                  { label: "Fragen bei dir an", value: roi.anfragen.toString(), sub: "~8% Conversion", icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> },
                  { label: "Werden zu Aufträgen", value: roi.auftraege.toString(), sub: "~30% Abschlussrate", icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></> },
                  { label: "Monatlicher Mehrumsatz", value: `${roi.umsatz.toLocaleString("de-DE")}€`, sub: "konservativ", highlight: true, icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: "24px 16px", borderRadius: 20, textAlign: "center" as const,
                    border: item.highlight ? "1px solid var(--red-200)" : "none",
                    background: item.highlight ? "var(--red-050)" : "var(--surface-card)",
                    boxShadow: "var(--shadow-sm)",
                    position: "relative" as const, overflow: "hidden",
                    transition: "transform 0.22s var(--ease-out), box-shadow 0.22s var(--ease-out)",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, margin: "0 auto 12px",
                      background: item.highlight ? "var(--red-100)" : "var(--gray-050)",
                      border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke={item.highlight ? "var(--red-500)" : "var(--text-secondary)"} strokeWidth="1.8" style={{ width: 20, height: 20 }}>
                        {item.icon}
                      </svg>
                    </div>
                    <div className="display" style={{
                      fontSize: item.highlight ? 32 : 26, color: item.highlight ? "var(--red-500)" : "var(--text-primary)",
                      marginBottom: 6,
                    }}>
                      {item.value}
                    </div>
                    <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "var(--text-secondary)", marginBottom: 4 }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, color: "var(--text-tertiary)" }}>
                      {item.sub}
                    </div>
                    {i < 4 && (
                      <div className="roi-pfeil" style={{ position: "absolute" as const, right: -8, top: "50%", transform: "translateY(-50%)", color: "var(--gray-300)", fontSize: 20, zIndex: 2 }}>→</div>
                    )}
                  </div>
                ))}
              </div>

              {/* The Big Comparison */}
              <div className="roi-vergleich" style={{ marginBottom: 32 }}>
                {/* Our Model */}
                <div style={{
                  padding: "32px 28px", borderRadius: 20,
                  border: "1px solid var(--red-200)", background: "var(--red-050)",
                  boxShadow: "var(--shadow-md)",
                }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--red-500)", marginBottom: 16 }}>
                    ✦ Mit Webseiten-Verlag Deutschland
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Deine Investition:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 24, color: "var(--text-primary)" }}>99€<span style={{ fontSize: 14, fontWeight: 400 }}>/Monat</span></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Potentieller Mehrumsatz:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 24, color: "var(--green-500)" }}>{roi.umsatz.toLocaleString("de-DE")}€<span style={{ fontSize: 14, fontWeight: 400 }}>/Monat</span></span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--red-200)", paddingTop: 12, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: 14 }}>Dein ROI:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 32, letterSpacing: "-0.02em", color: "var(--red-500)" }}>{roi.roiX}x</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
                    → Bereits im 1. Monat profitabel
                  </div>
                </div>

                {/* Agency Model */}
                <div style={{
                  padding: "32px 28px", borderRadius: 20,
                  border: "1px solid var(--border-default)", background: "var(--gray-050)",
                }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--text-tertiary)", marginBottom: 16 }}>
                    Klassisches Agentur-Modell
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Einmalzahlung:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 24, color: "var(--danger-600)" }}>5.500€</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>+ Hosting monatlich:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 18, color: "var(--text-secondary)" }}>49€/Monat</span>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border-default)", paddingTop: 12, marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Break-Even nach:</span>
                    <span style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: 24, color: "var(--text-secondary)" }}>{roi.breakEvenMonate} Monaten</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>
                    → Erst nach {roi.breakEvenMonate} Monaten im Plus
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 22, letterSpacing: "-0.01em", color: "var(--text-primary)", marginBottom: 24 }}>
                  {roi.gewinn.toLocaleString("de-DE")}€ mehr Gewinn pro Monat – für 99€ Einsatz.
                </p>
                <a href="/entwurf" className="btn btn-primary" style={{ fontSize: 17, padding: "20px 44px" }}>
                  <span>Diese Zahlen für mich realistisch machen →</span>
                </a>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, color: "var(--text-tertiary)", marginTop: 16 }}>
                  Kostenlos · 15 Min. · Unverbindlich
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          6. SOCIAL PROOF – Teaser → Unterseite
          ═══════════════════════════════════════ */}
      <section id="ergebnisse" style={{ background: "var(--cream)" }}>
        <div className="container" style={{ maxWidth: 900, textAlign: "center" }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 20 }}>Echte Ergebnisse</span>
          <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 56px)", marginBottom: 16 }}>
            Was unsere Kunden <span className="accent">erleben</span>.
          </h2>
          <p style={{ color: "var(--ink-soft)", fontSize: 18, maxWidth: 580, margin: "0 auto 48px" }}>
            Handwerker, Berater, Praxen – sie alle haben den gleichen Schritt gewagt. Hier sind ihre Geschichten und Ergebnisse.
          </p>

          {/* Preview Cards */}
          <motion.div {...reveal}>
          <div className="ergebnis-cards" style={{ marginBottom: 48 }}>
            {[
              { name: "Grünwerk GaLaBau", result: "+340% Anfragen", stars: 5, demo: DEMO_URL },
              { name: "Praxis Dr. Weber", result: "Warteliste nach 4 Wochen", stars: 5 },
              { name: "Elektro Schuster", result: "5 neue Aufträge/Woche", stars: 5 },
            ].map((t, i) => {
              const inhalt = (
                <>
                  <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 12 }}>
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <svg key={s} viewBox="0 0 24 24" fill="var(--red-500)" style={{ width: 16, height: 16 }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 18, marginBottom: 6, letterSpacing: "-0.01em" }}>
                    {t.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--red-500)", fontWeight: 600 }}>
                    {t.result}
                  </div>
                </>
              );
              const kartenStil = {
                padding: "28px 24px", borderRadius: 20,
                background: "var(--surface-card)", boxShadow: "var(--shadow-sm)",
                textAlign: "center" as const,
              };
              return t.demo ? (
                <a key={i} href={t.demo} target="_blank" rel="noopener" style={{ ...kartenStil, display: "block", color: "inherit", textDecoration: "none" }}>
                  {inhalt}
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-soft)", fontWeight: 600, marginTop: 10 }}>
                    Live-Demo ansehen →
                  </div>
                </a>
              ) : (
                <div key={i} style={kartenStil}>
                  {inhalt}
                </div>
              );
            })}
          </div>
          </motion.div>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" as const }}>
            <a href={DEMO_URL} target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: 16, padding: "18px 40px" }}>
              <span>Live-Demo ansehen</span>
            </a>
            <a href="/kundenmeinungen" className="btn btn-primary" style={{ fontSize: 16, padding: "18px 40px" }}>
              <span>Alle Kundenergebnisse ansehen →</span>
            </a>
          </div>

          {/* Beispiel-Demos (Higgsfield) */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-soft)", fontWeight: 600, marginBottom: 14 }}>
              Weitere Beispiel-Demos:
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const }}>
              {BEISPIEL_DEMOS.map((demo) => (
                <a
                  key={demo.name}
                  href={demo.url}
                  target="_blank"
                  rel="noopener"
                  style={{
                    fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 600,
                    color: "inherit", textDecoration: "none",
                    padding: "10px 20px", borderRadius: 999,
                    background: "var(--surface-card)", boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {demo.name} →
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MARQUEE
          ═══════════════════════════════════════ */}
      <section className="marquee-section" style={{ padding: "32px 0" }}>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {["Elektriker", "Maler", "Physiotherapie", "Steuerberater", "Coach", "Restaurant", "Dachdecker", "Fotograf", "Immobilien", "Fitness", "Friseur", "Anwalt",
              "Elektriker", "Maler", "Physiotherapie", "Steuerberater", "Coach", "Restaurant", "Dachdecker", "Fotograf", "Immobilien", "Fitness", "Friseur", "Anwalt"
            ].map((item, i) => (
              <span key={i} className="marquee-item">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          7. KONSEQUENZEN + VISION
          ═══════════════════════════════════════ */}
      <section>
        <div className="container" style={{ maxWidth: 900 }}>
          <motion.div {...reveal}>
          <div className="konsequenzen-grid">
            {/* Negative */}
            <div style={{
              padding: "40px 32px", borderRadius: 24,
              background: "var(--surface-card)", border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--danger-600)", marginBottom: 20 }}>
                ✕ Wenn du nichts änderst
              </div>
              <h3 style={{ fontFamily: "var(--font-ui)", fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.01em" }}>
                In 6 Monaten…
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {[
                  "Dein Konkurrent hat jetzt noch mehr Google-Bewertungen und Anfragen",
                  "Du gibst immer mehr Geld für Werbung aus, die weniger bringt",
                  "Potenzielle Kunden googeln – und finden jemand anderen",
                  "Du arbeitest härter für weniger Ertrag",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--danger-600)", flexShrink: 0 }}>✕</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Positive */}
            <div style={{
              padding: "40px 32px", borderRadius: 24,
              background: "linear-gradient(135deg, var(--success-soft), #fff)", border: "1px solid var(--success-soft)",
              boxShadow: "var(--shadow-md)",
            }}>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "var(--green-500)", marginBottom: 20 }}>
                ✓ Wenn du jetzt startest
              </div>
              <h3 style={{ fontFamily: "var(--font-ui)", fontSize: 24, fontWeight: 600, marginBottom: 16, letterSpacing: "-0.01em" }}>
                In 30 Tagen…
              </h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                {[
                  "Deine Webseite ist live und wird bei Google gefunden",
                  "Die ersten Anfragen kommen – ohne dass du etwas tust",
                  "Du wirkst professionell und baust Vertrauen auf, bevor der Kunde anruft",
                  "99€/Monat, die sich mit dem ersten Auftrag vielfach bezahlt machen",
                ].map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5, color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--green-500)", flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          8. FAQ
          ═══════════════════════════════════════ */}
      <section id="faq" style={{ background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="section-head">
            <span className="eyebrow">Letzte Fragen?</span>
            <h2 className="display">Häufig <span className="accent">gefragt</span>.</h2>
          </div>
          {[
            { q: "99€/Monat – was ist da alles drin?", a: "Alles. Design, Entwicklung, Hosting, Domain, SSL, Google-Optimierung (SEO), DSGVO-konforme Rechtstexte, Updates, Wartung und persönlicher Support. Es gibt keine versteckten Kosten." },
            { q: "Wie schnell ist meine Webseite online?", a: "In der Regel innerhalb weniger Tage nach unserem Erstgespräch. Bei umfangreicheren Projekten kann es etwas länger dauern – darüber sprechen wir im Gespräch." },
            { q: "Muss ich mich um irgendwas Technisches kümmern?", a: "Nein. Wir kümmern uns um alles – von der Domain-Registrierung über die Technik bis zu Updates. Du musst nichts installieren, konfigurieren oder updaten." },
            { q: "Was, wenn ich nach 2 Monaten kündigen will?", a: "Kein Problem. Du kannst monatlich kündigen, keine Mindestlaufzeit. Wir sind überzeugt, dass du bleibst, weil du zufrieden bist – nicht weil du musst." },
            { q: "Ist die Webseite wirklich professionell – oder sieht man, dass sie \"günstig\" ist?", a: "Unsere Webseiten sind individuell gestaltet und auf dem gleichen technischen Niveau wie Seiten, die Agenturen für 5.000€+ bauen. Der Unterschied ist unser Geschäftsmodell, nicht die Qualität." },
            { q: "Wie komme ich bei Google nach oben?", a: "Jede Seite wird mit technischem SEO, schnellen Ladezeiten, strukturierten Daten und den richtigen Meta-Informationen gebaut. Das ist die Grundlage. Sichtbarkeit bei Google baut sich über die ersten Wochen und Monate auf – je nach Wettbewerb in deiner Region." },
          ].map((faq, i) => (
            <div key={i} className="faq-item">
              <button className={`faq-question${faqOpen === i ? " open" : ""}`} onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                {faq.q}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
              </button>
              {faqOpen === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINALER CTA
          ═══════════════════════════════════════ */}
      <section id="contact">
        <div className="container">
          <div className="cta-section">
            <div style={{ textAlign: "center", maxWidth: 680, margin: "0 auto" }}>
              <span className="eyebrow" style={{ display: "inline-block", marginBottom: 16 }}>Der nächste Schritt</span>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", marginBottom: 16 }}>
                15 Minuten, die dein Business <span className="accent">verändern können</span>.
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.6, marginBottom: 36 }}>
                Kein Verkaufsgespräch. Kein Druck. Wir schauen uns gemeinsam an,
                was eine Webseite für dein Business bringen kann – und ob wir der richtige Partner dafür sind.
              </p>
              <a href="/entwurf" className="btn btn-primary" style={{ fontSize: 18, padding: "22px 48px" }}>
                <span>Kostenloses Erstgespräch buchen →</span>
              </a>
              <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 28, fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--text-tertiary)" }}>
                <span>✓ 100% kostenlos</span>
                <span>✓ 15 Minuten</span>
                <span>✓ Unverbindlich</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a href="#" className="logo">
                <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={32} height={32} />Webseiten-Verlag <span>Deutschland</span>
              </a>
              <p>Professionelle Webseiten ab 99&thinsp;€/Monat. Keine Startgebühr. In wenigen Tagen online.</p>
            </div>
            <div className="footer-col">
              <h4>Seiten</h4>
              <ul>
                <li><a href="#problem">Warum jetzt</a></li>
                <li><a href="#rechner">ROI-Rechner</a></li>
                <li><a href="#ablauf">Ablauf</a></li>
                <li><a href="#ergebnisse">Ergebnisse</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Kontakt</h4>
              <ul>
                <li><a href="/entwurf">Erstgespräch buchen</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Rechtliches</h4>
              <ul>
                <li><a href="/impressum">Impressum</a></li>
                <li><a href="/datenschutz">Datenschutz</a></li>
                <li><a href="/agb">AGB</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></span>
          </div>
        </div>
      </footer>
    </>
  );
}
