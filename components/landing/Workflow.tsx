export default function Workflow() {
  return (
    <section id="workflow" className="bg-[var(--bg)] py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-5 block">So läuft es ab</span>
          <h2 className="mb-4 text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight">
            In <span className="text-[var(--blue)]">drei Schritten</span> zur fertigen Webseite.
          </h2>
          <p className="mx-auto max-w-[580px] text-lg text-[var(--ink-soft)]">
            Einfach, schnell, ohne Technik-Stress.
          </p>
        </div>

        <div className="relative mx-auto max-w-[900px] grid grid-cols-1 gap-12 py-10 md:grid-cols-3 md:gap-20">
          {/* Beam SVG */}
          <svg className="beam-svg hidden md:block" viewBox="0 0 800 80" preserveAspectRatio="none">
            <defs>
              <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
                <stop offset="50%" stopColor="#2563eb" stopOpacity="1" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="beam-path" d="M 140 40 Q 270 -20 400 40" />
            <path className="beam-pulse" d="M 140 40 Q 270 -20 400 40" />
            <path className="beam-path" d="M 400 40 Q 530 100 660 40" />
            <path className="beam-pulse delayed" d="M 400 40 Q 530 100 660 40" />
          </svg>

          {/* Step 1 */}
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-[var(--border)] bg-white text-[var(--blue)] shadow-md transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-9 w-9">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="mb-3 font-[family-name:var(--font-mono)] text-xs font-medium tracking-[0.14em] text-[var(--blue)]">
              SCHRITT 01
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Gespräch & Briefing</h3>
            <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-[var(--ink-soft)]">
              Kostenlos & unverbindlich. Wir besprechen Ihre Wünsche, Zielgruppe und Inhalte.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-[var(--border)] bg-white text-[var(--blue)] shadow-md transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-9 w-9">
                <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div className="mb-3 font-[family-name:var(--font-mono)] text-xs font-medium tracking-[0.14em] text-[var(--blue)]">
              SCHRITT 02
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Design & Umsetzung</h3>
            <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-[var(--ink-soft)]">
              Wir erstellen Ihre Webseite innerhalb von 24 Stunden &ndash; inklusive aller Inhalte und Optimierungen.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative z-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[20px] border-2 border-[var(--border)] bg-white text-[var(--blue)] shadow-md transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-9 w-9">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <div className="mb-3 font-[family-name:var(--font-mono)] text-xs font-medium tracking-[0.14em] text-[var(--blue)]">
              SCHRITT 03
            </div>
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">Live & Betreuung</h3>
            <p className="mx-auto max-w-[260px] text-sm leading-relaxed text-[var(--ink-soft)]">
              Ihre Webseite geht online. Ab jetzt kümmern wir uns um Hosting, Updates und Support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
