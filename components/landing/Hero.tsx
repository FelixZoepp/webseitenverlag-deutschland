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

        {/* Video */}
        <div
          className="relative aspect-video"
          style={{ opacity: 0, animation: "fadeInUp 1s var(--smooth) 0.4s forwards" }}
        >
          <video
            className="absolute inset-0 w-full h-full rounded-3xl object-cover shadow-[var(--shadow-image)]"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          >
            <source src="https://objeupustvkaayxvedog.supabase.co/storage/v1/object/public/asset-bank/landing/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
