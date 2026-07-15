"use client";

import { useState } from "react";
import Image from "next/image";

const TOTAL_STEPS = 4;

const BRANCHEN = [
  "Handwerk & Bau",
  "Gastronomie & Hotellerie",
  "Arztpraxis & Gesundheit",
  "Rechtsanwalt & Steuerberater",
  "Immobilien & Makler",
  "Einzelhandel & E-Commerce",
  "Coaching & Beratung",
  "Fitness & Sport",
  "Friseur & Beauty",
  "IT & Software",
  "Marketing & Agentur",
  "Handwerk & Reparatur",
  "Fotografie & Kreativ",
  "Sonstige",
];

const MITARBEITER = [
  "Einzelunternehmer",
  "2–5 Mitarbeiter",
  "6–20 Mitarbeiter",
  "21–50 Mitarbeiter",
  "51–200 Mitarbeiter",
  "200+ Mitarbeiter",
];

const ZEITRAHMEN = [
  "So schnell wie möglich (24h)",
  "Diese Woche",
  "Innerhalb von 2 Wochen",
  "Innerhalb eines Monats",
  "Kein Zeitdruck – ich informiere mich erst",
];

export default function EntwurfForm() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    branche: "",
    mitarbeiter: "",
    zeitrahmen: "",
    name: "",
    email: "",
    telefon: "",
    firma: "",
    nachricht: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const canNext =
    (step === 1 && data.branche) ||
    (step === 2 && data.mitarbeiter) ||
    (step === 3 && data.zeitrahmen) ||
    (step === 4 && data.name && data.email);

  async function handleSubmit() {
    setSending(true);
    setError("");
    try {
      // UTM-Attribution aus der URL mitschicken
      const params = new URLSearchParams(window.location.search);
      const attribution = {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
        referrer: document.referrer || null,
        landing_path: window.location.pathname,
        homepage: honeypot, // Honeypot — bleibt bei echten Nutzern leer
      };
      const res = await fetch("/api/public/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution }),
      });
      if (!res.ok) throw new Error("Fehler beim Senden");
      setSubmitted(true);
    } catch {
      setError("Es gab ein Problem beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <>
        <NavSimple />
        <section className="hero" style={{ minHeight: "80vh", display: "flex", alignItems: "center" }}>
          <div className="container" style={{ textAlign: "center", maxWidth: 700 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 32px",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ width: 40, height: 40 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" />
              </svg>
            </div>
            <h1 className="display large" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 20 }}>
              Vielen Dank<span className="accent">!</span>
            </h1>
            <p style={{ fontSize: 19, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 36 }}>
              Wir haben Ihre Anfrage erhalten und erstellen jetzt Ihren kostenlosen Webseiten-Entwurf.
              Sie erhalten ihn innerhalb von <strong style={{ color: "#fff" }}>24 Stunden</strong> per E-Mail.
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
              Bei Fragen erreichen Sie uns jederzeit per E-Mail.
            </p>
          </div>
        </section>
        <FooterSimple />
      </>
    );
  }

  return (
    <>
      <NavSimple />

      <section className="hero" style={{ padding: "60px 0 80px", minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Kostenlos & unverbindlich</span>
            <h1 className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", marginBottom: 16 }}>
              Ihr kostenloser <span className="accent">Webseiten-Entwurf</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", maxWidth: 520, margin: "0 auto" }}>
              Beantworten Sie 4 kurze Fragen und erhalten Sie innerhalb von 24h einen individuellen Entwurf für Ihre neue Webseite.
            </p>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", gap: 8, marginBottom: 48 }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < step ? "var(--blue)" : "rgba(255,255,255,0.12)",
                  transition: "background 0.4s",
                }}
              />
            ))}
          </div>

          {/* Step Label */}
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500,
            letterSpacing: "0.14em", textTransform: "uppercase" as const,
            color: "var(--blue)", marginBottom: 24,
          }}>
            Schritt {step} von {TOTAL_STEPS}
          </div>

          {/* ====== STEP 1: Branche ====== */}
          {step === 1 && (
            <div>
              <h2 className="display" style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 12 }}>
                In welcher <span className="accent">Branche</span> sind Sie tätig?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
                So können wir Ihren Entwurf optimal auf Ihre Zielgruppe zuschneiden.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {BRANCHEN.map((b) => (
                  <button
                    key={b}
                    onClick={() => setData({ ...data, branche: b })}
                    style={{
                      padding: "16px 20px", borderRadius: 16, border: "1px solid",
                      borderColor: data.branche === b ? "var(--blue)" : "rgba(255,255,255,0.1)",
                      background: data.branche === b ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                      color: data.branche === b ? "#fff" : "rgba(255,255,255,0.75)",
                      fontSize: 15, fontFamily: "var(--font-body)", textAlign: "left" as const,
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: data.branche === b ? "2px solid var(--blue)" : "2px solid rgba(255,255,255,0.2)",
                      background: data.branche === b ? "var(--blue)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                    }}>
                      {data.branche === b && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: 12, height: 12 }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ====== STEP 2: Mitarbeiter ====== */}
          {step === 2 && (
            <div>
              <h2 className="display" style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 12 }}>
                Wie viele <span className="accent">Mitarbeiter</span> hat Ihr Unternehmen?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
                Das hilft uns, den richtigen Umfang für Ihre Webseite einzuschätzen.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {MITARBEITER.map((m) => (
                  <button
                    key={m}
                    onClick={() => setData({ ...data, mitarbeiter: m })}
                    style={{
                      padding: "20px 24px", borderRadius: 16, border: "1px solid",
                      borderColor: data.mitarbeiter === m ? "var(--blue)" : "rgba(255,255,255,0.1)",
                      background: data.mitarbeiter === m ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                      color: data.mitarbeiter === m ? "#fff" : "rgba(255,255,255,0.75)",
                      fontSize: 16, fontFamily: "var(--font-body)", textAlign: "left" as const,
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: data.mitarbeiter === m ? "2px solid var(--blue)" : "2px solid rgba(255,255,255,0.2)",
                      background: data.mitarbeiter === m ? "var(--blue)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                    }}>
                      {data.mitarbeiter === m && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: 12, height: 12 }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ====== STEP 3: Zeitrahmen ====== */}
          {step === 3 && (
            <div>
              <h2 className="display" style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 12 }}>
                Wie <span className="accent">schnell</span> brauchen Sie Ihre Webseite?
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
                Wir richten uns nach Ihrem Zeitplan.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {ZEITRAHMEN.map((z) => (
                  <button
                    key={z}
                    onClick={() => setData({ ...data, zeitrahmen: z })}
                    style={{
                      padding: "20px 24px", borderRadius: 16, border: "1px solid",
                      borderColor: data.zeitrahmen === z ? "var(--blue)" : "rgba(255,255,255,0.1)",
                      background: data.zeitrahmen === z ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                      color: data.zeitrahmen === z ? "#fff" : "rgba(255,255,255,0.75)",
                      fontSize: 16, fontFamily: "var(--font-body)", textAlign: "left" as const,
                      cursor: "pointer", transition: "all 0.2s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 6,
                      border: data.zeitrahmen === z ? "2px solid var(--blue)" : "2px solid rgba(255,255,255,0.2)",
                      background: data.zeitrahmen === z ? "var(--blue)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.2s",
                    }}>
                      {data.zeitrahmen === z && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" style={{ width: 12, height: 12 }}>
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </span>
                    {z}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ====== STEP 4: Kontaktdaten ====== */}
          {step === 4 && (
            <div>
              <h2 className="display" style={{ fontSize: "clamp(24px, 3vw, 36px)", marginBottom: 12 }}>
                Fast geschafft – Ihre <span className="accent">Kontaktdaten</span>
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>
                Damit wir Ihnen den fertigen Entwurf zusenden können.
              </p>
              <div className="form-grid">
                <div className="form-field">
                  <label htmlFor="e-name">Vor- und Nachname*</label>
                  <input
                    id="e-name" type="text" placeholder="Max Mustermann" required
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="e-firma">Firmenname</label>
                  <input
                    id="e-firma" type="text" placeholder="Mustermann GmbH"
                    value={data.firma}
                    onChange={(e) => setData({ ...data, firma: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="e-email">E-Mail-Adresse*</label>
                  <input
                    id="e-email" type="email" placeholder="max@firma.de" required
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="e-tel">Telefonnummer</label>
                  <input
                    id="e-tel" type="tel" placeholder="+49 123 456 789"
                    value={data.telefon}
                    onChange={(e) => setData({ ...data, telefon: e.target.value })}
                  />
                </div>
                {/* Honeypot — für Menschen unsichtbar, Bots füllen es aus */}
                <div style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
                  <label htmlFor="e-homepage">Homepage</label>
                  <input
                    id="e-homepage" type="text" tabIndex={-1} autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>
                <div className="form-field full">
                  <label htmlFor="e-msg">Haben Sie besondere Wünsche? (optional)</label>
                  <textarea
                    id="e-msg" placeholder="z.B. bestimmte Farben, Referenzseiten, besondere Funktionen..."
                    value={data.nachricht}
                    onChange={(e) => setData({ ...data, nachricht: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 48, gap: 16 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-ghost"
                style={{ padding: "14px 28px" }}
              >
                ← Zurück
              </button>
            ) : (
              <a href="/" className="btn btn-ghost" style={{ padding: "14px 28px" }}>
                ← Startseite
              </a>
            )}

            {step < TOTAL_STEPS ? (
              <button
                onClick={() => canNext && setStep(step + 1)}
                className="btn btn-primary"
                style={{
                  padding: "14px 36px",
                  opacity: canNext ? 1 : 0.4,
                  pointerEvents: canNext ? "auto" : "none",
                }}
              >
                <span>Weiter →</span>
              </button>
            ) : (
              <button
                onClick={() => canNext && !sending && handleSubmit()}
                className="btn btn-primary"
                style={{
                  padding: "14px 36px",
                  opacity: canNext && !sending ? 1 : 0.4,
                  pointerEvents: canNext && !sending ? "auto" : "none",
                }}
              >
                <span>{sending ? "Wird gesendet..." : "Entwurf anfordern →"}</span>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "12px 20px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Trust line */}
          <div style={{
            marginTop: 48, display: "flex", justifyContent: "center", gap: 32,
            fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.4)",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "var(--blue)" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              100% kostenlos
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "var(--blue)" }}>
                <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
              </svg>
              Unverbindlich
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, color: "var(--blue)" }}>
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Entwurf in 24h
            </span>
          </div>
        </div>
      </section>

      <FooterSimple />
    </>
  );
}

/* ═══════════════════════════════════════
   SIMPLE NAV & FOOTER (same style)
   ═══════════════════════════════════════ */
function NavSimple() {
  return (
    <nav>
      <div className="nav-inner">
        <a href="/" className="logo">
          <Image src="/logo.png" alt="Webseitenverlag Deutschland" width={160} height={50} style={{ height: 40, width: "auto" }} priority />
        </a>
        <a href="/" className="nav-cta">← Zurück zur Startseite</a>
      </div>
    </nav>
  );
}

function FooterSimple() {
  return (
    <footer>
      <div className="container">
        <div className="footer-bottom" style={{ borderTop: "none", paddingTop: 0 }}>
          <span>© 2026 Webseitenverlag Deutschland. Alle Rechte vorbehalten.</span>
          <span><a href="/impressum">Impressum</a> · <a href="/datenschutz">Datenschutz</a></span>
        </div>
      </div>
    </footer>
  );
}
