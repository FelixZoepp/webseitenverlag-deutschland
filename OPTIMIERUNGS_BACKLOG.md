# OPTIMIERUNGS_BACKLOG — Master-Review

Max. 15 Vorschläge, sortiert nach Umsatzwirkung ÷ Aufwand, je 2 Sätze.
Befüllt während des Reviews (Kap. 6). Keine Neuerfindungen.

1. **CRON_SECRET + fehlende Env-Keys in Vercel setzen (B-15/B-12, D-Ops).**
   Ohne CRON_SECRET laufen alle 6 Crons (Briefings, SEO, Dunning, QA) nicht —
   das ist der Automatisierungs-Kern des „0-Fulfillment"-Modells. Aufwand:
   Minuten im Vercel-Dashboard, Wirkung: gesamte Betriebsautomatik geht an.

2. **Demo-Badge/Wasserzeichen auf Flagship-Demos (B-01).**
   Demos sind öffentlich unter eigener URL erreichbar und wirken wie fertige
   Kundenseiten — ohne Badge fehlt der Kauf-Trigger („das ist DEINE Seite,
   schalte sie frei"). Kleiner Renderer-Eingriff, direkte Conversion-Wirkung.

3. **og:image für Demo-Links (B-16).**
   Demos werden per WhatsApp/E-Mail an Prospects geschickt — ohne
   Vorschaubild sinkt die Öffnungsrate des wichtigsten Sales-Assets deutlich.
   Ein generisches Branchen-OG-Bild pro Demo ist ein kleiner Meta-Tag-Fix.

4. **sitemap.xml + robots.txt für die Plattform (B-02).**
   Beides fehlt komplett — die Library- und Branchen-Seiten sind für Google
   unsichtbar, obwohl SEO ein Verkaufsargument des Produkts ist. Next.js
   `sitemap.ts`/`robots.ts` sind je eine Datei.

5. **LocalBusiness-JSON-LD auf Kundenseiten/Library (B-17).**
   Das Produktversprechen ist lokale Auffindbarkeit; strukturierte Daten sind
   dafür der stärkste Hebel und fehlen. Daten (Firma, Ort, Telefon) liegen
   bereits in business_profiles — reine Template-Arbeit.

6. **CI-Workflow, der die Generalprobe fährt (B-13).**
   Alle Test-Suiten existieren und sind grün, aber nichts erzwingt sie —
   jeder Push kann unbemerkt Journal-Fehler reaktivieren
   (Wiederholungs-Verbot!). Ein GitHub-Actions-Workflow, der die
   Generalprobe (Kap. 6) ausführt, macht jede Verhinderungs-Regel scharf.

7. **npm-audit-Fixes: next/ws High-Findings (B-24).**
   `next` 14.2.x und `ws` haben bekannte High-Advisories — auf einer
   Plattform, die Kundenseiten hostet, ist das ein Reputationsrisiko.
   Patch-Level-Update + `npm audit` als CI-Schritt.

8. **Kosten-Cap + Rate-Limit für LLM-Routen (B-25).**
   Demo-Generierung ruft Anthropic mit Production-Key ohne Tages-Cap oder
   IP-Rate-Limit auf — ein Skript-Kiddie kann echtes Geld verbrennen.
   Zähler existiert (kosten-Logging), es fehlt nur der harte Stopp.

9. **Kundenseiten-Sitemap pro Custom-Domain (B-18).**
   Bezahlte Kundenseiten haben keine eigene Sitemap — das gekaufte
   SEO-Versprechen wird technisch nicht eingelöst. Gleiches Muster wie
   Punkt 4, nur pro Site gerendert.

10. **Growth-Unterseiten live schalten (B-21).**
    Die SEO-Unterseiten-Pipeline existiert (Plan, Texte, QA), aber die
    Routen fehlen — der monatliche Mehrwert, der die Abo-Retention trägt,
    kommt beim Kunden nie an. Routing + Rendern vorhandener Inhalte.

11. **Totes Hero-Video ersetzen oder entfernen (B-03).**
    Die Startseite referenziert ein nicht existierendes Video — erster
    Eindruck der Plattform ist ein schwarzes Rechteck. Entfernen ist eine
    Zeile, ersetzen braucht ein Asset.

12. **QA-Browser-Endpoint konfigurieren (B-04, D-Ops).**
    Ohne BROWSER_QA_WS_ENDPOINT läuft der Screenshot-/Lighthouse-Teil des
    QA-Gates auf Vercel nie — ein Teil der Qualitätssicherung ist im
    Betrieb blind. Browserless-Account + eine Env-Var.

13. **SEO-Unterseiten durch dieselben QA-Gates schicken (B-19).**
    Generierte Unterseiten umgehen den Konsistenz-Validator, der für Demos
    Pflicht ist — genau dort können Journal-Fehler (J-001..J-003) wieder
    auftauchen. Validator-Aufruf in die Unterseiten-Pipeline einhängen.

14. **view_count-Race + expires_at aufräumen (B-08/B-07).**
    Demo-Aufrufzähler verliert Zählungen (read-modify-write) und abgelaufene
    Demos werden nie bereinigt — beides verzerrt die Sales-Daten, auf denen
    Follow-ups basieren. Atomarer SQL-Increment + Cleanup im QA-Cron.

15. **Stilles Error-Logging sichtbar machen (B-26).**
    Fehler in Crons/Pipelines landen nur in console.error — im
    „0-Fulfillment"-Betrieb merkt niemand, wenn die Automatik still stirbt.
    Bestehenden Resend-Mailer für Fehler-Alerts an Betreiber nutzen.
