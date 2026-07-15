"use client";

import HeroGrid from "./HeroGrid";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-8 py-20 text-white md:py-28">
      <HeroGrid />

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-center gap-16 md:grid-cols-2">
        {/* Text */}
        <div>
          <h1 className="mb-7 text-[clamp(42px,5.5vw,80px)] font-bold leading-[1.05] tracking-tight">
            Ihre Webseite.
            <span className="block text-[var(--blue)]">In 24 Stunden online.</span>
            <span className="mt-6 block font-[var(--font-mono)] text-[0.18em] font-medium uppercase tracking-[0.1em] text-white/60">
              Professionelles Webdesign &middot; Keine Startgebühr
            </span>
          </h1>

          <p
            className="mb-9 max-w-[560px] text-[19px] leading-relaxed text-white/75"
            style={{ opacity: 0, animation: "fadeInUp 0.8s var(--smooth) 0.6s forwards" }}
          >
            Professionelle Webseiten für Ihr Unternehmen &ndash; <strong className="font-semibold text-white">ab 99&thinsp;&euro;/Monat</strong>,
            ohne Startgebühr, in 24&thinsp;Stunden startbereit. Design, Hosting, SEO und Support &ndash; alles inklusive.
          </p>

          <div
            className="mb-12 flex flex-wrap gap-3"
            style={{ opacity: 0, animation: "fadeInUp 0.8s var(--smooth) 0.8s forwards" }}
          >
            <a href="#contact" className="btn btn-primary">
              <span>Kostenlos beraten lassen</span>
            </a>
            <a href="#pricing" className="btn btn-ghost">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Preise ansehen
            </a>
          </div>

          {/* Trust */}
          <div
            className="grid grid-cols-2 gap-x-10 gap-y-4 font-[family-name:var(--font-mono)] text-[13px] text-white/70 sm:grid-cols-3"
            style={{ opacity: 0, animation: "fadeInUp 0.8s var(--smooth) 1s forwards" }}
          >
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] shrink-0 text-[var(--blue)]">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              In 24h online
            </div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] shrink-0 text-[var(--blue)]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              DSGVO-konform
            </div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] shrink-0 text-[var(--blue)]">
                <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
              </svg>
              Keine Startgebühr
            </div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] shrink-0 text-[var(--blue)]">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              Persönlicher Support
            </div>
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px] shrink-0 text-[var(--blue)]">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" />
              </svg>
              SEO optimiert
            </div>
          </div>
        </div>

        {/* Visual */}
        <div
          className="relative aspect-[4/3]"
          style={{ opacity: 0, animation: "fadeInUp 1s var(--smooth) 0.4s forwards" }}
        >
          <div className="absolute inset-0 flex items-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#2563eb] via-[#3b82f6] to-[#1e40af] p-7 shadow-[var(--shadow-image)]">
            <span className="font-[family-name:var(--font-mono)] text-xs text-white/50">
              Ihre neue Webseite &ndash; modern &amp; mobil-optimiert
            </span>
          </div>

          {/* Floating Card */}
          <div className="absolute -bottom-[6%] -left-[6%] z-10 w-[55%] overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              <span className="ml-2 font-[family-name:var(--font-mono)] text-[10px] text-[var(--ink-soft)]">
                ihre-firma.de
              </span>
            </div>
            <div className="space-y-2.5 p-4">
              <div className="h-3 w-3/4 rounded bg-[var(--blue)]/20" />
              <div className="h-2 w-full rounded bg-slate-100" />
              <div className="h-2 w-5/6 rounded bg-slate-100" />
              <div className="mt-3 h-8 w-1/2 rounded-full bg-[var(--blue)]" />
            </div>
          </div>

          {/* Speed Badge */}
          <div className="absolute -right-[4%] top-[15%] z-10 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0f172a]/90 px-4 py-3 shadow-xl backdrop-blur-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-green-400">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <div>
              <div className="font-[family-name:var(--font-mono)] text-xs text-white/50">Ladezeit</div>
              <div className="text-sm font-bold text-white">0.8s</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
