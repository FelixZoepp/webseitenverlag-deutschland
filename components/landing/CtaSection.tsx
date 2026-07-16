"use client";

import { useState } from "react";

const inputCls =
  "rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[15px] text-white placeholder:text-white/30 transition-all focus:border-[var(--blue)] focus:bg-white/10 focus:outline-none";
const labelCls =
  "font-[family-name:var(--font-mono)] text-xs font-medium uppercase tracking-[0.08em] text-white/60";

export default function CtaSection() {
  const [data, setData] = useState({ name: "", email: "", telefon: "", branche: "", website: "", nachricht: "", unterseiten: "", seo: "", video_header: "" });
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data.name || !data.email) {
      setError("Bitte Name und E-Mail angeben.");
      return;
    }
    setSending(true);
    setError("");
    try {
      // Qualifizierung in die Nachricht einbauen
      const quali: string[] = [];
      if (data.unterseiten) quali.push(`Unterseiten: ${data.unterseiten}`);
      if (data.seo) quali.push(`SEO: ${data.seo}`);
      if (data.video_header) quali.push(`Video-Header: ${data.video_header}`);
      const nachrichtMitQuali = [data.nachricht, ...quali].filter(Boolean).join("\n");
      // Paket ableiten
      const empfohlen = data.seo === "ja" || data.unterseiten === "5-10" ? (data.video_header === "ja" || data.unterseiten === "5-10" ? "growth" : "business") : "starter";
      const params = new URLSearchParams(window.location.search);
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          telefon: data.telefon,
          branche: data.branche,
          website: data.website,
          nachricht: nachrichtMitQuali,
          mitarbeiter: empfohlen,
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
      setSubmitted(true);
    } catch {
      setError("Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section id="contact" className="px-8 py-24">
      <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-16 text-white md:p-16">
        {/* Animated grid behind */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="relative z-10">
          <span className="eyebrow mb-4 block !text-[var(--blue)]">Jetzt starten</span>
          <h2 className="mb-3 text-[clamp(32px,4.5vw,56px)] font-bold leading-[1.05] tracking-tight">
            Bereit für Ihre <span className="text-[var(--blue)]">neue Webseite</span>?
          </h2>
          <p className="mb-10 max-w-[600px] text-[17px] text-white/70">
            Kostenlose Erstberatung, keine Verpflichtung. Erzählen Sie uns von Ihrem Unternehmen &ndash; wir melden uns innerhalb von 2 Stunden.
          </p>

          {submitted ? (
            <div className="rounded-2xl border border-[var(--blue)]/40 bg-[var(--blue)]/10 p-10 text-center">
              <h3 className="mb-2 text-2xl font-bold">Vielen Dank!</h3>
              <p className="mb-4 text-white/70">
                Ihre Anfrage ist bei uns eingegangen. Wir erstellen jetzt Ihren persönlichen Website-Entwurf und melden uns innerhalb von 2 Stunden bei Ihnen.
              </p>
              {data.seo === "ja" || data.unterseiten === "5-10" ? (
                <p className="text-sm text-[var(--blue)]">
                  Basierend auf Ihren Angaben empfehlen wir Ihnen unser {data.video_header === "ja" || data.unterseiten === "5-10" ? "Growth" : "Business"}-Paket.
                </p>
              ) : null}
            </div>
          ) : (
            <form className="grid gap-5 md:grid-cols-2 md:gap-x-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-name" className={labelCls}>Name</label>
                <input
                  id="cta-name" type="text" placeholder="Max Mustermann" required
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-email" className={labelCls}>E-Mail</label>
                <input
                  id="cta-email" type="email" placeholder="max@firma.de" required
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-telefon" className={labelCls}>Telefon</label>
                <input
                  id="cta-telefon" type="tel" placeholder="+49 123 456 789"
                  value={data.telefon}
                  onChange={(e) => setData({ ...data, telefon: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-branche" className={labelCls}>Branche</label>
                <select
                  id="cta-branche"
                  value={data.branche}
                  onChange={(e) => setData({ ...data, branche: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[15px] text-white/70 transition-all focus:border-[var(--blue)] focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  <option value="handwerk">Handwerk</option>
                  <option value="gastronomie">Gastronomie</option>
                  <option value="dienstleistung">Dienstleistung</option>
                  <option value="einzelhandel">Einzelhandel</option>
                  <option value="arzt">Arztpraxis / Gesundheit</option>
                  <option value="immobilien">Immobilien</option>
                  <option value="sonstige">Sonstige</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-website" className={labelCls}>Aktuelle Website (falls vorhanden)</label>
                <input
                  id="cta-website" type="text" placeholder="www.meine-firma.de"
                  value={data.website}
                  onChange={(e) => setData({ ...data, website: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-unterseiten" className={labelCls}>Wie viele Seiten brauchen Sie?</label>
                <select
                  id="cta-unterseiten"
                  value={data.unterseiten}
                  onChange={(e) => setData({ ...data, unterseiten: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[15px] text-white/70 transition-all focus:border-[var(--blue)] focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  <option value="1">Nur eine Startseite (One-Pager)</option>
                  <option value="2-5">2-5 Seiten (z.B. + Leistungen, Über uns)</option>
                  <option value="5-10">5-10 Seiten (umfangreiche Website)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-seo" className={labelCls}>SEO-Optimierung gewünscht?</label>
                <select
                  id="cta-seo"
                  value={data.seo}
                  onChange={(e) => setData({ ...data, seo: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[15px] text-white/70 transition-all focus:border-[var(--blue)] focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  <option value="ja">Ja, bei Google gefunden werden</option>
                  <option value="nein">Nein, erstmal nicht nötig</option>
                  <option value="unsicher">Bin mir unsicher</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="cta-video" className={labelCls}>Video-Header (Premium-Look)?</label>
                <select
                  id="cta-video"
                  value={data.video_header}
                  onChange={(e) => setData({ ...data, video_header: e.target.value })}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-[15px] text-white/70 transition-all focus:border-[var(--blue)] focus:bg-white/10 focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  <option value="ja">Ja, animierter Video-Header</option>
                  <option value="nein">Nein, Standbild reicht</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="cta-nachricht" className={labelCls}>Ihre Nachricht (optional)</label>
                <textarea
                  id="cta-nachricht" rows={4}
                  placeholder="Erzählen Sie uns kurz von Ihrem Projekt..."
                  value={data.nachricht}
                  onChange={(e) => setData({ ...data, nachricht: e.target.value })}
                  className={`resize-y ${inputCls}`}
                />
              </div>
              {/* Honeypot — für Menschen unsichtbar, Bots füllen es aus */}
              <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                <label htmlFor="cta-homepage">Homepage</label>
                <input
                  id="cta-homepage" type="text" tabIndex={-1} autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-400 md:col-span-2">{error}</p>
              )}
              <div className="md:col-span-2">
                <button type="submit" disabled={sending} className="btn btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
                  <span>{sending ? "Wird gesendet…" : "Kostenlos beraten lassen"}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
