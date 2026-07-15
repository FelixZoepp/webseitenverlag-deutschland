const services = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: "Webdesign & Entwicklung",
    desc: "Modernes, individuelles Design, das auf allen Geräten perfekt aussieht. Keine Templates von der Stange.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /><path d="M11 8v6M8 11h6" />
      </svg>
    ),
    title: "SEO-Optimierung",
    desc: "Sichtbar bei Google von Tag 1. Technisches SEO, Meta-Daten, Ladezeit-Optimierung – alles dabei.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "DSGVO & Impressum",
    desc: "Rechtssicheres Impressum, Datenschutzerklärung und Cookie-Banner – juristisch geprüft.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" />
      </svg>
    ),
    title: "Domain & Hosting",
    desc: "Ihre Wunschdomain, schnelles Hosting auf deutschen Servern, SSL-Zertifikat inklusive.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Wartung & Updates",
    desc: "Regelmäßige Updates, Sicherheits-Patches und technische Betreuung – Sie müssen sich um nichts kümmern.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M22 6l-10 7L2 6" />
      </svg>
    ),
    title: "E-Mail & Kontaktformular",
    desc: "Professionelle E-Mail-Adressen mit Ihrer Domain und ein Kontaktformular, das direkt bei Ihnen ankommt.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Content-Erstellung",
    desc: "Texte, Bilder und Inhalte, die Ihre Zielgruppe ansprechen – auf Wunsch komplett von uns erstellt.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: "Analytics & Reporting",
    desc: "Monatliche Berichte über Besucherzahlen, Rankings und Performance – transparent und verständlich.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24">
      <div className="mx-auto max-w-[1280px] px-8">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-5 block">Unsere Leistungen</span>
          <h2 className="mb-4 text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight">
            Alles inklusive. <span className="text-[var(--blue)]">Ein</span> Preis.
          </h2>
          <p className="mx-auto max-w-[580px] text-lg text-[var(--ink-soft)]">
            Von Design über Hosting bis SEO &ndash; wir kümmern uns um alles, damit Sie sich auf Ihr Geschäft konzentrieren können.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <div
              key={i}
              className="group cursor-pointer rounded-2xl border border-[var(--border)] bg-white p-7 transition-all hover:-translate-y-1 hover:border-[var(--blue-soft)] hover:bg-[var(--bg-alt)] hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[var(--blue)] text-white transition-transform group-hover:rotate-[-8deg] group-hover:scale-105">
                {s.icon}
              </div>
              <h3 className="mb-2 text-[20px] font-semibold leading-tight tracking-tight transition-colors group-hover:text-[var(--blue)]">
                {s.title}
              </h3>
              <p className="mb-5 text-sm leading-relaxed text-[var(--ink-soft)]">{s.desc}</p>
              <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.05em] text-[var(--blue)] transition-all group-hover:gap-2.5">
                Mehr erfahren<span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
