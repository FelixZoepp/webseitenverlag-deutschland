"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Wie schnell ist meine Webseite fertig?",
    a: "In der Regel innerhalb von 24 Stunden nach Auftragseingang. Bei umfangreicheren Projekten (z.B. Online-Shop) kann es bis zu 48 Stunden dauern.",
  },
  {
    q: "Was ist im monatlichen Preis enthalten?",
    a: "Alles: Design, Entwicklung, Hosting, Domain, SSL-Zertifikat, SEO-Optimierung, DSGVO-konforme Rechtstexte, Updates, Wartung und persönlicher Support.",
  },
  {
    q: "Gibt es eine Mindestlaufzeit?",
    a: "Nein. Sie können monatlich kündigen. Wir sind überzeugt, dass Sie bleiben, weil Sie zufrieden sind – nicht weil Sie müssen.",
  },
  {
    q: "Kann ich meine Webseite selbst bearbeiten?",
    a: "Ja, auf Wunsch richten wir Ihnen ein einfaches Content-Management-System ein. Alternativ übernehmen wir alle Änderungen für Sie – das ist im Preis enthalten.",
  },
  {
    q: "Was passiert, wenn ich kündige?",
    a: "Ihre Webseite wird nach Ablauf des letzten bezahlten Monats deaktiviert. Auf Wunsch exportieren wir alle Inhalte für Sie.",
  },
  {
    q: "Brauche ich bereits eine Domain?",
    a: "Nein. Wir registrieren Ihre Wunschdomain kostenlos für Sie und richten alles ein. Falls Sie bereits eine Domain haben, übernehmen wir den Umzug.",
  },
  {
    q: "Sind die Webseiten mobilfreundlich?",
    a: "Selbstverständlich. Alle unsere Webseiten sind responsive und sehen auf Smartphone, Tablet und Desktop perfekt aus.",
  },
  {
    q: "Wie läuft der Support ab?",
    a: "Sie haben einen festen Ansprechpartner, den Sie per E-Mail oder Telefon erreichen. Änderungswünsche werden in der Regel innerhalb von 24 Stunden umgesetzt.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[var(--bg)] py-24">
      <div className="mx-auto max-w-[800px] px-8">
        <div className="mb-16 text-center">
          <span className="eyebrow mb-5 block">Häufige Fragen</span>
          <h2 className="mb-4 text-[clamp(36px,5vw,60px)] font-bold leading-[1.05] tracking-tight">
            Noch <span className="text-[var(--blue)]">Fragen</span>?
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white transition-all"
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[17px] font-semibold tracking-tight transition-colors hover:text-[var(--blue)]"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                {faq.q}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`h-5 w-5 shrink-0 text-[var(--ink-soft)] transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="border-t border-[var(--border)] px-6 py-5 text-[15px] leading-relaxed text-[var(--ink-soft)]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
