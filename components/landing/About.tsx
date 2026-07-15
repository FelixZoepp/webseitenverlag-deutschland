"use client";

import { useEffect, useRef } from "react";

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          let current = 0;
          const step = Math.ceil(target / 40);
          const interval = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + suffix;
            if (current >= target) clearInterval(interval);
          }, 30);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, suffix]);

  return (
    <div ref={ref} className="font-bold text-[clamp(40px,5vw,64px)] leading-none tracking-tighter text-[var(--blue)]">
      0{suffix}
    </div>
  );
}

const stats = [
  { target: 200, suffix: "+", label: "Webseiten erstellt" },
  { target: 24, suffix: "h", label: "Bis zur Fertigstellung" },
  { target: 98, suffix: "%", label: "Kundenzufriedenheit" },
  { target: 0, suffix: "€", label: "Startgebühr" },
];

export default function About() {
  return (
    <section id="about" className="bg-white py-24">
      <div className="mx-auto grid max-w-[1280px] items-center gap-20 px-8 md:grid-cols-2">
        {/* Text */}
        <div>
          <span className="eyebrow mb-5 block">Wer wir sind</span>
          <h2 className="mb-7 text-[clamp(36px,4.5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Webseiten, die <em className="text-[var(--blue)]">verkaufen</em>.
          </h2>
          <p className="mb-5 text-[17px] leading-relaxed text-[var(--ink-soft)]">
            Wir sind <strong className="font-semibold text-[var(--ink)]">kein Website-Baukasten und keine teure Agentur</strong>.
            Webseitenverlag Deutschland liefert professionelle, individuell gestaltete Webseiten &ndash; schnell, günstig und ohne versteckte Kosten.
          </p>
          <p className="text-[17px] leading-relaxed text-[var(--ink-soft)]">
            Unser Konzept: <strong className="font-semibold text-[var(--ink)]">Sie mieten Ihre Webseite ab 99&thinsp;&euro;/Monat</strong>.
            Keine hohe Einmalzahlung, kein Risiko. Design, Hosting, Domain, SEO, Updates und Support &ndash; alles im Preis enthalten.
            In 24 Stunden ist Ihre Seite online.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 border-l border-t border-[var(--border)]">
          {stats.map((s, i) => (
            <div key={i} className="border-b border-r border-[var(--border)] p-8">
              <Counter target={s.target} suffix={s.suffix} />
              <div className="mt-2 font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.08em] text-[var(--ink-soft)]">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
