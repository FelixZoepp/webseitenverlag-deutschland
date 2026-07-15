"use client";

import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-8 px-8 py-4">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--ink)] text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </span>
          <span>
            WVD<span className="text-[var(--blue)]">.</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          <a href="#services" className="transition-colors hover:text-[var(--blue)]">Leistungen</a>
          <a href="#about" className="transition-colors hover:text-[var(--blue)]">Über uns</a>
          <a href="#workflow" className="transition-colors hover:text-[var(--blue)]">Ablauf</a>
          <a href="#pricing" className="transition-colors hover:text-[var(--blue)]">Preise</a>
          <a href="#faq" className="transition-colors hover:text-[var(--blue)]">FAQ</a>
        </div>

        {/* CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <a href="/login" className="text-[15px] font-medium transition-colors hover:text-[var(--blue)]">
            Anmelden
          </a>
          <a
            href="#contact"
            className="rounded-full bg-[var(--blue)] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--blue-hover)] hover:-translate-y-0.5 inline-flex"
          >
            Jetzt starten
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            {open ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="flex flex-col gap-4 border-t border-[var(--border)] px-8 py-6 md:hidden">
          <a href="#services" onClick={() => setOpen(false)} className="text-[15px] font-medium">Leistungen</a>
          <a href="#about" onClick={() => setOpen(false)} className="text-[15px] font-medium">Über uns</a>
          <a href="#workflow" onClick={() => setOpen(false)} className="text-[15px] font-medium">Ablauf</a>
          <a href="#pricing" onClick={() => setOpen(false)} className="text-[15px] font-medium">Preise</a>
          <a href="#faq" onClick={() => setOpen(false)} className="text-[15px] font-medium">FAQ</a>
          <a href="/login" onClick={() => setOpen(false)} className="text-[15px] font-medium">Anmelden</a>
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-full bg-[var(--blue)] px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Jetzt starten
          </a>
        </div>
      )}
    </nav>
  );
}
