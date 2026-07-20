import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog – Webseiten-Verlag Deutschland",
  description: "Praxiswissen rund um Webseiten, Online-Sichtbarkeit und digitale Kundengewinnung für Selbstständige und kleine Unternehmen.",
};

const articles = [
  {
    slug: "webseite-erstellen-lassen-kosten",
    title: "Webseite erstellen lassen: Was kostet das wirklich? (Ehrlicher Vergleich 2026)",
    excerpt: "4.800€ auf dem Tisch – und du fragst dich, ob das wirklich sein muss? Ein ehrlicher Kostenvergleich zwischen Agentur, Baukasten und Abo-Modell.",
    date: "14. Mai 2026",
    readTime: "8 Min. Lesezeit",
    category: "Kosten & Preise",
  },
  {
    slug: "website-fuer-handwerker",
    title: "Website für Handwerker: So gewinnst du Kunden online",
    excerpt: "Über 80 % der Kunden suchen online nach Handwerkern. Warum eine eigene Website 2026 kein Luxus mehr ist – und wie du damit planbar neue Aufträge bekommst.",
    date: "13. Mai 2026",
    readTime: "7 Min. Lesezeit",
    category: "Handwerk & Web",
  },
  {
    slug: "website-mieten-oder-kaufen",
    title: "Website mieten oder kaufen? Ehrlicher Vergleich 2026",
    excerpt: "Einmal kaufen oder monatlich mieten? Wir rechnen beide Modelle ehrlich durch – mit Break-even-Analyse und konkreten Zahlen.",
    date: "12. Mai 2026",
    readTime: "7 Min. Lesezeit",
    category: "Kosten & Modelle",
  },
  {
    slug: "warum-selbststaendige-eine-website-brauchen",
    title: "Warum Selbstständige 2026 eine Website brauchen",
    excerpt: "\u201EIch habe doch Instagram\u201C \u2013 warum Social Media allein nicht reicht und eine eigene Website f\u00FCr Selbstst\u00E4ndige unverzichtbar ist.",
    date: "11. Mai 2026",
    readTime: "7 Min. Lesezeit",
    category: "Selbstständigkeit",
  },
  {
    slug: "local-seo-fuer-kleine-unternehmen",
    title: "Local SEO für kleine Unternehmen – Der komplette Guide",
    excerpt: "46 % aller Google-Suchen haben einen lokalen Bezug. So wirst du als kleines Unternehmen bei Google Maps und in der lokalen Suche sichtbar.",
    date: "10. Mai 2026",
    readTime: "8 Min. Lesezeit",
    category: "SEO & Sichtbarkeit",
  },
];

export default function BlogPage() {
  return (
    <>
      <nav>
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image src="/logo.svg" alt="Webseiten-Verlag Deutschland" width={36} height={36} priority />Webseiten-Verlag <span>Deutschland</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Startseite</Link>
            <Link href="/#rechner">ROI-Rechner</Link>
            <Link href="/ergebnisse">Ergebnisse</Link>
            <Link href="/blog">Blog</Link>
          </div>
          <Link href="/entwurf" className="nav-cta">Kostenloses Erstgespräch</Link>
        </div>
      </nav>

      <section className="hero" style={{ padding: "60px 0 80px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 800 }}>
          <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>Blog</span>
          <h1 className="display large" style={{ fontSize: "clamp(36px, 5vw, 56px)", marginBottom: 20 }}>
            Wissen, das dein Business <span className="accent">sichtbar macht</span>.
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 560, margin: "0 auto" }}>
            Praxistipps rund um Webseiten, Online-Sichtbarkeit und digitale Kundengewinnung – ohne Tech-Sprache.
          </p>
        </div>
      </section>

      <section style={{ padding: "96px 0", background: "var(--bg)" }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {articles.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: "none" }}>
                <article style={{
                  padding: "36px 40px", borderRadius: 24,
                  border: "1px solid var(--border)", background: "var(--cream)",
                  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  cursor: "pointer",
                }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "center" }}>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      color: "var(--blue)", background: "rgba(37,99,235,0.08)",
                      padding: "4px 12px", borderRadius: 999,
                    }}>
                      {a.category}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--ink-soft)" }}>
                      {a.date} · {a.readTime}
                    </span>
                  </div>
                  <h2 style={{
                    fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28,
                    lineHeight: 1.2, marginBottom: 12, letterSpacing: "-0.02em",
                    fontVariationSettings: '"opsz" 24, "SOFT" 50',
                    color: "var(--ink)",
                  }}>
                    {a.title}
                  </h2>
                  <p style={{ fontSize: 16, lineHeight: 1.65, color: "var(--ink-soft)", marginBottom: 16 }}>
                    {a.excerpt}
                  </p>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 500,
                    color: "var(--blue)", letterSpacing: "0.05em", textTransform: "uppercase",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    Artikel lesen →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-bottom">
            <span>© 2026 Webseiten-Verlag Deutschland. Alle Rechte vorbehalten.</span>
            <span><Link href="/impressum">Impressum</Link> · <Link href="/datenschutz">Datenschutz</Link></span>
          </div>
        </div>
      </footer>
    </>
  );
}
