const plans = [
  {
    name: "Starter",
    price: "99",
    desc: "Perfekt für Einzelunternehmer und kleine Betriebe.",
    features: [
      "One-Page Webseite",
      "Fullscreen-Hintergrundbild",
      "Responsive Design",
      "SEO-Grundoptimierung",
      "Kontaktformular",
      "SSL-Zertifikat & Hosting",
      "DSGVO-konform",
      "Eigene Domain möglich",
    ],
    highlight: false,
  },
  {
    name: "Business",
    price: "169",
    desc: "Für Unternehmen, die mehr Sichtbarkeit wollen.",
    features: [
      "Bis zu 5 Unterseiten",
      "Video-Header möglich",
      "Individuelles Design",
      "Erweiterte SEO",
      "Bewertungs-Widget",
      "Sektionen bearbeiten",
      "Alle Farbthemen",
      "Kontaktformular",
      "Eigene Domain möglich",
    ],
    highlight: true,
  },
  {
    name: "Premium",
    price: "249",
    desc: "Für maximale Online-Präsenz und Wachstum.",
    features: [
      "Bis zu 10 Unterseiten",
      "Video-Header + Scroll-Effekt",
      "Premium-Animationen",
      "Vollständige SEO-Strategie",
      "Ads-Landingpages",
      "Terminbuchung",
      "Alle Business-Features",
      "Prioritäts-Support",
    ],
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-5 block">Preise</span>
          <h2 className="mb-4 text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight">
            Transparent. <span className="text-[var(--blue)]">Ehrlich.</span> Fair.
          </h2>
          <p className="mx-auto max-w-[580px] text-lg text-[var(--ink-soft)]">
            Keine versteckten Kosten, keine Startgebühr. Alle Preise netto.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`pricing-card group relative overflow-hidden rounded-[20px] border p-8 transition-all hover:-translate-y-1 hover:shadow-xl ${
                plan.highlight
                  ? "border-[var(--blue)] bg-[var(--ink)] text-white shadow-lg"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              <div className="border-beam" />

              {plan.highlight && (
                <div className="mb-6 inline-block rounded-full bg-[var(--blue)] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                  Beliebteste Wahl
                </div>
              )}

              <h3 className="mb-1 text-2xl font-bold tracking-tight">{plan.name}</h3>
              <p className={`mb-6 text-sm ${plan.highlight ? "text-white/60" : "text-[var(--ink-soft)]"}`}>
                {plan.desc}
              </p>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                <span className={`text-lg ${plan.highlight ? "text-white/60" : "text-[var(--ink-soft)]"}`}>
                  &euro; netto/Monat
                </span>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-3 text-[15px]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`mt-0.5 h-[18px] w-[18px] shrink-0 ${
                        plan.highlight ? "text-[var(--blue)]" : "text-[var(--blue)]"
                      }`}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                    <span className={plan.highlight ? "text-white/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/entwurf"
                className={`flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold transition-all hover:-translate-y-0.5 ${
                  plan.highlight
                    ? "bg-[var(--blue)] text-white shadow-lg shadow-blue-500/25 hover:bg-[var(--blue-hover)]"
                    : "bg-[var(--ink)] text-white hover:bg-[var(--blue)]"
                }`}
              >
                Jetzt starten &rarr;
              </a>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-[var(--ink-soft)]">
          Alle Preise netto zzgl. MwSt. &middot; Mindestlaufzeit 24 Monate &middot; 3 Monate Kündigungsfrist
        </p>
      </div>
    </section>
  );
}
