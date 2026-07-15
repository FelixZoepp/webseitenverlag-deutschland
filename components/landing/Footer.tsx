export default function Footer() {
  return (
    <footer className="bg-[var(--ink)] px-8 pb-8 pt-16 text-white/70">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-12 grid gap-12 md:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="#" className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--blue)] text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              WVD<span className="text-[var(--blue)]">.</span>
            </a>
            <p className="max-w-[320px] text-sm leading-relaxed">
              Webseitenverlag Deutschland &ndash; professionelle Webseiten ab 99&thinsp;&euro;/Monat.
              In 24 Stunden online, ohne Startgebühr.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-5 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-white">
              Leistungen
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><a href="#services" className="transition-colors hover:text-[var(--blue)]">Webdesign</a></li>
              <li><a href="#services" className="transition-colors hover:text-[var(--blue)]">SEO</a></li>
              <li><a href="#services" className="transition-colors hover:text-[var(--blue)]">Hosting</a></li>
              <li><a href="#services" className="transition-colors hover:text-[var(--blue)]">Content</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-white">
              Unternehmen
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><a href="#about" className="transition-colors hover:text-[var(--blue)]">Über uns</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-[var(--blue)]">Preise</a></li>
              <li><a href="#faq" className="transition-colors hover:text-[var(--blue)]">FAQ</a></li>
              <li><a href="#contact" className="transition-colors hover:text-[var(--blue)]">Kontakt</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-5 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-white">
              Rechtliches
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li><a href="/impressum" className="transition-colors hover:text-[var(--blue)]">Impressum</a></li>
              <li><a href="/datenschutz" className="transition-colors hover:text-[var(--blue)]">Datenschutz</a></li>
              <li><a href="/agb" className="transition-colors hover:text-[var(--blue)]">AGB</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 font-[family-name:var(--font-mono)] text-xs tracking-[0.05em] text-white/40 md:flex-row">
          <span>&copy; {new Date().getFullYear()} Webseitenverlag Deutschland. Alle Rechte vorbehalten.</span>
          <span>
            Made with &#9829; in Deutschland
          </span>
        </div>
      </div>
    </footer>
  );
}
