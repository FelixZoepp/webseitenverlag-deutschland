"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Perspective-Style Lead-Funnel für Ads-Traffic (/anfrage).
 * Eine Frage pro Screen, Auto-Weiter bei Kachel-Klick, Progress-Bar oben.
 * Weißer Hintergrund, blauer Akzent (Design-Tokens aus marketing.css).
 */

type Antworten = {
  website_status: string;
  zeitrahmen: string;
  branche: string;
  ziel: string;
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
  firma: "",
  ort: "",
  bestehende_website: "",
  name: "",
  email: "",
  telefon: "",
};

type Option = { wert: string; label: string; sub?: string; icon: React.ReactNode };

const ic = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d={d} />
  </svg>
);

const FRAGEN: { key: keyof Antworten; frage: string; sub?: string; optionen: Option[] }[] = [
  {
    key: "website_status",
    frage: "Hat Ihr Unternehmen bereits eine Website?",
    sub: "Damit wir wissen, wo wir ansetzen.",
    optionen: [
      { wert: "Ja, aber veraltet", label: "Ja, aber sie ist veraltet", sub: "Bringt keine neuen Kunden", icon: ic("M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z") },
      { wert: "Nein, noch keine", label: "Nein, noch keine", sub: "Wir starten bei null", icon: ic("M12 5v14M5 12h14") },
      { wert: "Ja, bin zufrieden", label: "Ja, ich bin zufrieden", sub: "Ich schaue mich nur um", icon: ic("M20 6 9 17l-5-5") },
    ],
  },
  {
    key: "zeitrahmen",
    frage: "Wie schnell soll Ihre neue Website online sein?",
    optionen: [
      { wert: "So schnell wie möglich", label: "So schnell wie möglich", sub: "Am besten diese Woche", icon: ic("M13 2 3 14h9l-1 8 10-12h-9l1-8Z") },
      { wert: "In 2–4 Wochen", label: "In den nächsten 2–4 Wochen", sub: "Kein akuter Zeitdruck", icon: ic("M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z") },
      { wert: "Erst informieren", label: "Ich möchte mich erst informieren", sub: "Unverbindlich vergleichen", icon: ic("M21 21l-4.35-4.35M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z") },
    ],
  },
  {
    key: "branche",
    frage: "In welcher Branche sind Sie tätig?",
    optionen: [
      { wert: "Handwerk", label: "Handwerk & Bau", icon: ic("M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4L15 12l-3-3 2.7-2.7Z") },
      { wert: "Gastronomie", label: "Gastronomie & Hotel", icon: ic("M3 11h18M5 11V7a7 7 0 0 1 14 0v4M2 15h20v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-2Z") },
      { wert: "Gesundheit", label: "Gesundheit & Praxis", icon: ic("M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7 7-7Z") },
      { wert: "Beauty & Friseur", label: "Beauty & Friseur", icon: ic("M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12") },
      { wert: "Andere Branche", label: "Andere Branche", icon: ic("M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c2.5 2.5 2.5 15.5 0 18m-9-9h18") },
    ],
  },
  {
    key: "ziel",
    frage: "Was ist Ihnen am wichtigsten?",
    optionen: [
      { wert: "Neue Kunden über Google", label: "Neue Kunden über Google", sub: "Gefunden werden, wenn Kunden suchen", icon: ic("M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z") },
      { wert: "Professioneller Auftritt", label: "Ein professioneller Auftritt", sub: "Seriöser erster Eindruck", icon: ic("M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-3.5-1.5L7 23l5-3 5 3-1.5-9.5") },
      { wert: "Rundum-sorglos", label: "Alles aus einer Hand", sub: "Null Aufwand für mich", icon: ic("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z") },
    ],
  },
];

// Schritte gesamt: 4 Fragen + Firma + Kontakt
const GESAMT = FRAGEN.length + 2;

export default function FunnelPage() {
  const [schritt, setSchritt] = useState(0);
  const [antworten, setAntworten] = useState<Antworten>(LEER);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [fertig, setFertig] = useState(false);
  const [error, setError] = useState("");

  const fortschritt = useMemo(
    () => Math.round(((fertig ? GESAMT : schritt) / GESAMT) * 100),
    [schritt, fertig]
  );

  const waehle = useCallback((key: keyof Antworten, wert: string) => {
    setAntworten((a) => ({ ...a, [key]: wert }));
    // Auto-Weiter mit kurzer Verzögerung, damit die Auswahl sichtbar aufblitzt
    setTimeout(() => setSchritt((s) => s + 1), 200);
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
        antworten.ort ? `Ort: ${antworten.ort}` : null,
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
    "w-full rounded-xl border border-[var(--border)] bg-white px-5 py-3.5 text-[16px] text-[var(--ink)] placeholder:text-[var(--ink-soft)]/60 transition-all focus:border-[var(--blue)] focus:outline-none focus:ring-4 focus:ring-[var(--blue)]/10";
  const labelCls = "mb-1.5 block text-left text-sm font-semibold text-[var(--ink)]";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-center border-b border-[var(--border)] px-6 py-4">
        <a href="/" className="text-[17px] font-bold tracking-tight text-[var(--ink)]">
          Webseitenverlag <span className="text-[var(--blue)]">Deutschland</span>
        </a>
      </header>

      {/* Progress */}
      <div className="h-1.5 w-full bg-[var(--cream-tint)]">
        <div
          className="h-full bg-[var(--blue)] transition-all duration-500 ease-out"
          style={{ width: `${Math.max(fortschritt, 4)}%` }}
        />
      </div>

      <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5 pb-16 pt-8 sm:pt-12">
        {/* Zurück-Button */}
        {!fertig && schritt > 0 && (
          <button
            type="button"
            onClick={() => setSchritt((s) => s - 1)}
            className="mb-6 flex items-center gap-1.5 self-start text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
        )}

        {/* Danke-Screen */}
        {fertig ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--blue)]/10">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="mb-3 text-[28px] font-bold leading-tight text-[var(--ink)]">
              Vielen Dank{antworten.name ? `, ${antworten.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="max-w-[400px] text-[16px] leading-relaxed text-[var(--ink-soft)]">
              Ihre Anfrage ist bei uns eingegangen. Wir erstellen Ihnen einen{" "}
              <strong className="text-[var(--ink)]">kostenlosen Website-Entwurf</strong> und melden
              uns innerhalb von 24 Stunden bei Ihnen.
            </p>
          </div>
        ) : schritt < FRAGEN.length ? (
          /* Fragen-Screens */
          <div key={schritt} className="funnel-fade">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">
              Schritt {schritt + 1} von {GESAMT}
            </p>
            <h1 className="mb-2 text-center text-[26px] font-bold leading-tight text-[var(--ink)] sm:text-[30px]">
              {FRAGEN[schritt].frage}
            </h1>
            {FRAGEN[schritt].sub && (
              <p className="mb-8 text-center text-[15px] text-[var(--ink-soft)]">{FRAGEN[schritt].sub}</p>
            )}
            {!FRAGEN[schritt].sub && <div className="mb-8" />}
            <div className="flex flex-col gap-3">
              {FRAGEN[schritt].optionen.map((o) => {
                const aktiv = antworten[FRAGEN[schritt].key] === o.wert;
                return (
                  <button
                    key={o.wert}
                    type="button"
                    onClick={() => waehle(FRAGEN[schritt].key, o.wert)}
                    className={`group flex items-center gap-4 rounded-2xl border-2 bg-white px-5 py-4 text-left transition-all duration-150 ${
                      aktiv
                        ? "border-[var(--blue)] bg-[var(--blue)]/5 shadow-[0_4px_16px_rgba(37,99,235,0.15)]"
                        : "border-[var(--border)] hover:border-[var(--blue)] hover:shadow-[0_4px_16px_rgba(37,99,235,0.10)]"
                    }`}
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                        aktiv ? "bg-[var(--blue)] text-white" : "bg-[var(--blue)]/8 text-[var(--blue)] group-hover:bg-[var(--blue)]/15"
                      }`}
                      style={!aktiv ? { backgroundColor: "rgba(37,99,235,0.08)" } : undefined}
                    >
                      {o.icon}
                    </span>
                    <span>
                      <span className="block text-[16px] font-semibold text-[var(--ink)]">{o.label}</span>
                      {o.sub && <span className="mt-0.5 block text-[13.5px] text-[var(--ink-soft)]">{o.sub}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : schritt === FRAGEN.length ? (
          /* Firmen-Screen */
          <div className="funnel-fade">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">
              Schritt {schritt + 1} von {GESAMT}
            </p>
            <h1 className="mb-2 text-center text-[26px] font-bold leading-tight text-[var(--ink)] sm:text-[30px]">
              Erzählen Sie uns kurz von Ihrem Unternehmen
            </h1>
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
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-[var(--blue)] py-4 text-[16px] font-semibold text-white transition-all hover:bg-[var(--blue-hover)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)]"
              >
                Weiter
              </button>
            </form>
          </div>
        ) : (
          /* Kontakt-Screen */
          <div className="funnel-fade">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--blue)]">
              Letzter Schritt
            </p>
            <h1 className="mb-2 text-center text-[26px] font-bold leading-tight text-[var(--ink)] sm:text-[30px]">
              Wohin dürfen wir Ihren kostenlosen Entwurf senden?
            </h1>
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
              <button
                type="submit"
                disabled={sending}
                className="mt-2 w-full rounded-xl bg-[var(--blue)] py-4 text-[16px] font-semibold text-white transition-all hover:bg-[var(--blue-hover)] hover:shadow-[0_8px_24px_rgba(37,99,235,0.35)] disabled:opacity-60"
              >
                {sending ? "Wird gesendet…" : "Kostenlosen Entwurf anfordern"}
              </button>
              <p className="text-center text-[12.5px] leading-relaxed text-[var(--ink-soft)]">
                Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren dürfen.
              </p>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-5 text-center text-[13px] text-[var(--ink-soft)]">
        <a href="/impressum" className="hover:text-[var(--ink)]">Impressum</a>
        <span className="mx-2">·</span>
        <a href="/datenschutz" className="hover:text-[var(--ink)]">Datenschutz</a>
      </footer>
    </div>
  );
}
