export default function BentoGrid() {
  return (
    <section className="bento-section">
      <div className="beams" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-8">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-5 block !text-[var(--blue)]">Warum WVD</span>
          <h2 className="mb-4 text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight text-white">
            Mehr als ein <span className="text-[var(--blue)]">Webdesigner</span>.
          </h2>
          <p className="mx-auto max-w-[580px] text-lg text-white/70">
            Fünf Gründe, warum über 200 Unternehmen uns vertrauen &ndash; und ihre Partner weiterempfehlen.
          </p>
        </div>

        <div className="bento-grid-layout grid grid-cols-6 gap-5">
          {/* Card 1: 24h */}
          <div className="bento-card col-span-6 md:col-span-2">
            <div className="relative z-10 mb-6">
              <h3 className="mb-3 text-2xl font-semibold tracking-tight text-white">In 24 Stunden online</h3>
              <p className="text-[15px] leading-relaxed text-white/70">
                Kein wochenlanges Warten. Wir liefern Ihre fertige Webseite innerhalb von 24 Stunden nach Auftragseingang.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Pulsing rings */}
                <div className="absolute h-40 w-40 animate-ping rounded-full border border-[var(--blue)]/20" style={{ animationDuration: "3s" }} />
                <div className="absolute h-32 w-32 rounded-full border border-[var(--blue)]/10" />
                <div className="absolute h-48 w-48 rounded-full border border-[var(--blue)]/5" />
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--blue)]/30 bg-[#020617]/90 shadow-xl backdrop-blur-md">
                  <span className="text-3xl font-bold text-white">24h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Keine Startgebühr */}
          <div className="bento-card col-span-6 md:col-span-2">
            <div className="relative z-10 mb-6">
              <h3 className="mb-3 text-2xl font-semibold tracking-tight text-white">Keine Startgebühr</h3>
              <p className="text-[15px] leading-relaxed text-white/70">
                Kein Einmal-Investment von tausenden Euro. Sie zahlen einfach monatlich &ndash; fair, transparent, alles inklusive.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="relative">
                <div className="flex items-center gap-6">
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-center">
                    <div className="text-2xl font-bold text-red-400 line-through">5.000€</div>
                    <div className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-red-400/60">Agentur</div>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-white/30">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 text-center">
                    <div className="text-2xl font-bold text-green-400">0€</div>
                    <div className="mt-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-green-400/60">Bei uns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Alles inklusive */}
          <div className="bento-card col-span-6 md:col-span-2">
            <div className="relative z-10 mb-6">
              <h3 className="mb-3 text-2xl font-semibold tracking-tight text-white">Alles inklusive</h3>
              <p className="text-[15px] leading-relaxed text-white/70">
                Design, Hosting, Domain, SSL, SEO, Updates, Support &ndash; ein Preis, keine Überraschungen.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="grid grid-cols-3 gap-3">
                {["Design", "Hosting", "Domain", "SSL", "SEO", "Support"].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-[var(--blue)]">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4: SEO (wide) */}
          <div className="bento-card bento-wide col-span-6 md:col-span-3">
            <div className="relative z-10 mb-6">
              <h3 className="mb-3 text-[28px] font-semibold tracking-tight text-white">SEO von Anfang an</h3>
              <p className="max-w-[92%] text-[15px] leading-relaxed text-white/70">
                Jede Webseite wird von Grund auf suchmaschinenoptimiert gebaut. Technisches SEO, schnelle Ladezeiten und strukturierte Daten &ndash; damit Sie bei Google gefunden werden.
              </p>
            </div>
            <div className="flex flex-1 items-end justify-center overflow-hidden">
              <div className="flex w-full items-end justify-around gap-3 pb-4">
                {[40, 60, 45, 80, 55, 90, 70, 95, 85].map((h, i) => (
                  <div key={i} className="flex w-full flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[var(--blue)]/60 to-[var(--blue)]"
                      style={{ height: `${h}px`, opacity: 0.3 + (h / 100) * 0.7 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Support (wide) */}
          <div className="bento-card bento-wide col-span-6 md:col-span-3">
            <div className="relative z-10 mb-6">
              <h3 className="mb-3 text-[28px] font-semibold tracking-tight text-white">Persönlicher Ansprechpartner</h3>
              <p className="max-w-[92%] text-[15px] leading-relaxed text-white/70">
                Kein Ticket-System, kein Chatbot. Sie haben einen festen Ansprechpartner, der Ihre Webseite kennt und bei Änderungswünschen sofort reagiert.
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center">
              <div className="relative flex items-center gap-8">
                {/* Chat bubbles */}
                <div className="space-y-3">
                  <div className="max-w-[220px] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                    Können Sie das Logo größer machen?
                  </div>
                  <div className="ml-auto max-w-[220px] rounded-2xl rounded-br-sm border border-[var(--blue)]/30 bg-[var(--blue)]/10 px-4 py-3 text-sm text-white/80">
                    Ist erledigt! Schauen Sie mal drauf. &#x2714;
                  </div>
                  <div className="max-w-[220px] rounded-2xl rounded-bl-sm border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                    Perfekt, danke! Super schnell.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
