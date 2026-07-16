"use client";

import { useCallback, useState } from "react";

/**
 * Lead-Funnel für Ads-Traffic (/anfrage) — Design nach Referenz-Screenshots:
 * heller Grid-Hintergrund, Intro-Screen mit Eyebrow + CTA + Trust-Zeile,
 * Fragen mit "FRAGE 01 / 06"-Label, dünner Progress-Bar und
 * Antwort-Karten mit Buchstaben-Präfix (A/B/C/D).
 */

type Antworten = {
  website_status: string;
  zeitrahmen: string;
  branche: string;
  ziel: string;
  umfang: string;
  extras: string;
  firma: string;
  ort: string;
  bestehende_website: string;
  name: string;
  email: string;
  telefon: string;
};

const LEER: Antworten = {
  website_status: "",
  zeitrahmen: "",
  branche: "",
  ziel: "",
  umfang: "",
  extras: "",
  firma: "",
  ort: "",
  bestehende_website: "",
  name: "",
  email: "",
  telefon: "",
};

const BUCHSTABEN = ["A", "B", "C", "D", "E"];

const FRAGEN: { key: keyof Antworten; frage: string; optionen: string[] }[] = [
  {
    key: "website_status",
    frage: "Hat Ihr Unternehmen bereits eine Website?",
    optionen: [
      "Ja, aber sie ist veraltet und bringt keine Kunden",
      "Nein, wir haben noch gar keine",
      "Ja, und ich bin eigentlich zufrieden",
    ],
  },
  {
    key: "zeitrahmen",
    frage: "Wie schnell soll Ihre neue Website online sein?",
    optionen: [
      "So schnell wie möglich — am besten diese Woche",
      "In den nächsten 2–4 Wochen",
      "Ich möchte mich erst einmal informieren",
    ],
  },
  {
    key: "branche",
    frage: "In welcher Branche sind Sie tätig?",
    optionen: [
      "Handwerk & Bau",
      "Gastronomie & Hotel",
      "Gesundheit & Praxis",
      "Beauty & Friseur",
      "Andere Branche",
    ],
  },
  {
    key: "ziel",
    frage: "Was ist Ihnen bei Ihrer Website am wichtigsten?",
    optionen: [
      "Neue Kunden über Google gewinnen",
      "Ein professioneller erster Eindruck",
      "Alles aus einer Hand — null Aufwand für mich",
    ],
  },
  {
    key: "umfang",
    frage: "Wie umfangreich soll Ihre Website sein?",
    optionen: [
      "Eine starke Startseite reicht mir",
      "Startseite + ein paar Unterseiten (Leistungen, Über uns)",
      "Umfangreich — viele Leistungen, Blog, Stellenanzeigen",
    ],
  },
  {
    key: "extras",
    frage: "Welche Features sind Ihnen wichtig?",
    optionen: [
      "Standard-Website — sauber und professionell",
      "Mit Animationen & Video-Header — richtig premium",
      "Volle Ausstattung — SEO, Animationen, Terminbuchung",
    ],
  },
];

// 4 Fragen + Firma + Kontakt
const GESAMT = FRAGEN.length + 2;

function fmt(n: number) {
  return String(n).padStart(2, "0");
}

export default function FunnelPage() {
  // schritt: -1 = Intro, 0..3 = Fragen, 4 = Firma, 5 = Kontakt
  const [schritt, setSchritt] = useState(-1);
  const [antworten, setAntworten] = useState<Antworten>(LEER);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [fertig, setFertig] = useState(false);
  const [error, setError] = useState("");

  const waehle = useCallback((key: keyof Antworten, wert: string) => {
    setAntworten((a) => ({ ...a, [key]: wert }));
    setTimeout(() => setSchritt((s) => s + 1), 180);
  }, []);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    if (!antworten.name || !antworten.email) {
      setError("Bitte Name und E-Mail angeben.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const params = new URLSearchParams(window.location.search);
      const nachricht = [
        `Website vorhanden: ${antworten.website_status}`,
        `Wichtigstes Ziel: ${antworten.ziel}`,
        `Umfang: ${antworten.umfang}`,
        `Features: ${antworten.extras}`,
        antworten.ort ? `Ort: ${antworten.ort}` : null,
        `Zeitrahmen: ${antworten.zeitrahmen}`,
      ]
        .filter(Boolean)
        .join("\n");
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: antworten.name,
          email: antworten.email,
          telefon: antworten.telefon || null,
          firma: antworten.firma || null,
          website: antworten.bestehende_website || null,
          branche: antworten.branche || null,
          zeitrahmen: antworten.zeitrahmen || null,
          nachricht,
          quelle: "funnel",
          utm_source: params.get("utm_source"),
          utm_medium: params.get("utm_medium"),
          utm_campaign: params.get("utm_campaign"),
          utm_term: params.get("utm_term"),
          utm_content: params.get("utm_content"),
          referrer: document.referrer || null,
          landing_path: window.location.pathname,
          homepage: honeypot,
        }),
      });
      if (!res.ok) throw new Error("Senden fehlgeschlagen");
      setFertig(true);
    } catch {
      setError("Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSending(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 text-[16px] text-[var(--ink)] placeholder:text-[var(--ink-soft)]/50 transition-all focus:border-[var(--blue)] focus:outline-none focus:ring-4 focus:ring-[var(--blue)]/10";
  const labelCls = "mb-1.5 block text-left text-sm font-semibold text-[var(--ink)]";
  const btnCls =
    "w-full rounded-xl bg-[var(--blue-2)] py-4 text-[16px] font-bold text-white shadow-[0_8px_20px_rgba(30,64,175,0.25)] transition-all hover:bg-[var(--blue-hover)] hover:shadow-[0_10px_28px_rgba(30,64,175,0.35)] disabled:opacity-60";

  const frageNr = Math.min(schritt + 1, GESAMT);
  const fortschritt = fertig ? 100 : schritt < 0 ? 0 : Math.round((schritt / GESAMT) * 100);

  return (
    <div className="funnel-bg flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white/90 px-5 py-4 backdrop-blur-sm">
        <a href="/" className="text-[16px] font-bold tracking-tight text-[var(--ink)]">
          Webseitenverlag <span className="font-semibold text-[var(--ink-soft)]">Deutschland</span>
        </a>
      </header>

      <main className="mx-auto flex w-full max-w-[520px] flex-1 flex-col px-5 pb-16">
        {/* ── Intro-Screen ─────────────────────────────── */}
        {schritt === -1 && !fertig && (
          <div className="funnel-fade flex flex-1 flex-col justify-center py-14 text-center">
            <p className="mb-5 flex items-center justify-center gap-2.5 font-[family-name:var(--font-mono)] text-[11.5px] font-bold uppercase tracking-[0.18em] text-[var(--blue)]">
              <span className="inline-block h-[2px] w-6 bg-[var(--blue)]" aria-hidden="true" />
              Der kostenlose Website-Check
            </p>
            <h1 className="mb-5 text-[34px] font-extrabold leading-[1.12] tracking-tight text-[var(--ink)] sm:text-[40px]">
              Wie viel Potenzial steckt in Ihrem Betrieb?
            </h1>
            <p className="mx-auto mb-9 max-w-[380px] text-[16.5px] leading-relaxed text-[var(--ink-soft)]">
              Finden Sie in 60 Sekunden heraus, ob sich eine professionelle Website für Sie lohnt
              &ndash; inklusive kostenlosem Entwurf.
            </p>
            <button type="button" onClick={() => setSchritt(0)} className={btnCls}>
              Jetzt Check starten <span aria-hidden="true">→</span>
            </button>
            <p className="mt-4 font-[family-name:var(--font-mono)] text-[12px] tracking-[0.12em] text-[var(--ink-soft)]">
              Kostenlos · {GESAMT} kurze Fragen
            </p>

            <hr className="my-10 border-[var(--border)]" />

            <p className="mb-2 flex items-center justify-center gap-2 text-[15px]">
              <span className="tracking-[0.1em] text-[#f59e0b]" aria-hidden="true">★★★★★</span>
              <strong className="text-[var(--ink)]">200+</strong>
              <span className="text-[var(--ink-soft)]">Webseiten erstellt</span>
            </p>
            <p className="mx-auto max-w-[360px] text-[14.5px] leading-relaxed text-[var(--ink-soft)]">
              Über <strong className="text-[var(--ink)]">200 Betriebe</strong> aus Handwerk,
              Gastronomie und Gesundheit vertrauen dem Webseitenverlag.
            </p>
          </div>
        )}

        {/* ── Zurück + Progress (alle Frage-Screens) ───── */}
        {!fertig && schritt >= 0 && (
          <div className="pt-8">
            <button
              type="button"
              onClick={() => setSchritt((s) => s - 1)}
              className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Zurück
            </button>
            <p className="mb-2 font-[family-name:var(--font-mono)] text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Frage {fmt(frageNr)} / {fmt(GESAMT)}
            </p>
            <div className="mb-9 h-[3px] w-full rounded-full bg-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--blue-2)] transition-all duration-500 ease-out"
                style={{ width: `${Math.max(fortschritt, 4)}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Danke-Screen ─────────────────────────────── */}
        {fertig ? (
          <div className="funnel-fade flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue)]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue-2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mb-3 text-[28px] font-extrabold leading-tight tracking-tight text-[var(--ink)]">
              Vielen Dank{antworten.name ? `, ${antworten.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="max-w-[400px] text-[16px] leading-relaxed text-[var(--ink-soft)]">
              Ihre Anfrage ist bei uns eingegangen. Wir erstellen Ihnen einen{" "}
              <strong className="text-[var(--ink)]">kostenlosen Website-Entwurf</strong> und melden
              uns innerhalb von 24 Stunden bei Ihnen.
            </p>
            {antworten.extras && (
              <p className="mt-4 rounded-xl bg-[var(--blue)]/5 px-6 py-3 text-[14px] text-[var(--blue-2)]">
                {antworten.extras.includes("Volle Ausstattung")
                  ? "Basierend auf Ihren Wünschen bereiten wir Ihnen unser Growth-Paket vor — mit SEO, Animationen & Terminbuchung."
                  : antworten.extras.includes("Video-Header")
                    ? "Basierend auf Ihren Wünschen bereiten wir Ihnen unser Business-Paket mit Premium-Animationen vor."
                    : "Wir bereiten Ihnen einen sauberen, professionellen Entwurf vor."}
              </p>
            )}
          </div>
        ) : schritt >= 0 && schritt < FRAGEN.length ? (
          /* ── Frage-Screens (A/B/C/D-Karten) ──────────── */
          <div key={schritt} className="funnel-fade">
            <h2 className="mb-8 text-center text-[25px] font-extrabold leading-[1.2] tracking-tight text-[var(--ink)] sm:text-[28px]">
              {FRAGEN[schritt].frage}
            </h2>
            <div className="flex flex-col gap-3.5">
              {FRAGEN[schritt].optionen.map((text, i) => {
                const aktiv = antworten[FRAGEN[schritt].key] === text;
                return (
                  <button
                    key={text}
                    type="button"
                    onClick={() => waehle(FRAGEN[schritt].key, text)}
                    className={`flex items-center gap-4 rounded-2xl border bg-white px-5 py-4 text-left shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition-all duration-150 ${
                      aktiv
                        ? "border-[var(--blue-2)] shadow-[0_4px_16px_rgba(30,64,175,0.18)]"
                        : "border-[var(--border)] hover:border-[var(--blue-2)] hover:shadow-[0_4px_16px_rgba(30,64,175,0.12)]"
                    }`}
                  >
                    <span
                      className={`font-[family-name:var(--font-mono)] text-[14px] font-medium ${
                        aktiv ? "text-[var(--blue-2)]" : "text-[var(--ink-soft)]"
                      }`}
                    >
                      {BUCHSTABEN[i]}
                    </span>
                    <span className="text-[15.5px] font-medium leading-snug text-[var(--ink)]">{text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : schritt === FRAGEN.length ? (
          /* ── Firmen-Screen ────────────────────────────── */
          <div className="funnel-fade">
            <h2 className="mb-2 text-center text-[25px] font-extrabold leading-[1.2] tracking-tight text-[var(--ink)] sm:text-[28px]">
              Erzählen Sie uns kurz von Ihrem Unternehmen
            </h2>
            <p className="mb-8 text-center text-[15px] text-[var(--ink-soft)]">
              Damit wir Ihren kostenlosen Entwurf vorbereiten können.
            </p>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSchritt((s) => s + 1);
              }}
            >
              <div>
                <label htmlFor="f-firma" className={labelCls}>Firmenname</label>
                <input
                  id="f-firma" type="text" placeholder="z. B. Sanitär Mustermann" required
                  value={antworten.firma}
                  onChange={(e) => setAntworten({ ...antworten, firma: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="f-ort" className={labelCls}>Ort / Region</label>
                <input
                  id="f-ort" type="text" placeholder="z. B. Leipzig" required
                  value={antworten.ort}
                  onChange={(e) => setAntworten({ ...antworten, ort: e.target.value })}
                  className={inputCls}
                />
              </div>
              {antworten.website_status.startsWith("Ja") && (
                <div>
                  <label htmlFor="f-website" className={labelCls}>
                    Ihre bestehende Website <span className="font-normal text-[var(--ink-soft)]">(optional)</span>
                  </label>
                  <input
                    id="f-website" type="text" placeholder="www.ihre-website.de"
                    value={antworten.bestehende_website}
                    onChange={(e) => setAntworten({ ...antworten, bestehende_website: e.target.value })}
                    className={inputCls}
                  />
                </div>
              )}
              <button type="submit" className={`mt-2 ${btnCls}`}>
                Weiter <span aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        ) : schritt > FRAGEN.length ? (
          /* ── Kontakt-Screen ───────────────────────────── */
          <div className="funnel-fade">
            <h2 className="mb-2 text-center text-[25px] font-extrabold leading-[1.2] tracking-tight text-[var(--ink)] sm:text-[28px]">
              Wohin dürfen wir Ihren kostenlosen Entwurf senden?
            </h2>
            <p className="mb-8 text-center text-[15px] text-[var(--ink-soft)]">
              100&nbsp;% kostenlos &amp; unverbindlich. Keine Startgebühr.
            </p>
            <form className="flex flex-col gap-4" onSubmit={absenden}>
              <div>
                <label htmlFor="f-name" className={labelCls}>Ihr Name</label>
                <input
                  id="f-name" type="text" placeholder="Max Mustermann" required
                  value={antworten.name}
                  onChange={(e) => setAntworten({ ...antworten, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="f-email" className={labelCls}>E-Mail</label>
                <input
                  id="f-email" type="email" placeholder="max@firma.de" required
                  value={antworten.email}
                  onChange={(e) => setAntworten({ ...antworten, email: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="f-telefon" className={labelCls}>
                  Telefon <span className="font-normal text-[var(--ink-soft)]">(für schnellere Rückmeldung)</span>
                </label>
                <input
                  id="f-telefon" type="tel" placeholder="+49 123 456 789"
                  value={antworten.telefon}
                  onChange={(e) => setAntworten({ ...antworten, telefon: e.target.value })}
                  className={inputCls}
                />
              </div>
              {/* Honeypot */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="f-homepage">Homepage</label>
                <input
                  id="f-homepage" type="text" tabIndex={-1} autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={sending} className={`mt-2 ${btnCls}`}>
                {sending ? "Wird gesendet…" : "Kostenlosen Entwurf anfordern"}
              </button>
              <p className="text-center text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren dürfen.
              </p>
            </form>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-white/90 px-6 py-5 text-center text-[13px] text-[var(--ink-soft)]">
        <a href="/impressum" className="hover:text-[var(--ink)]">Impressum</a>
        <span className="mx-2">·</span>
        <a href="/datenschutz" className="hover:text-[var(--ink)]">Datenschutz</a>
      </footer>
    </div>
  );
}
