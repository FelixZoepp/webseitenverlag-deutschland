# Domain-Setup & Rechtstexte-Editor — Design-Spec

Die vollständige Spec wurde vom Nutzer vorgegeben (Prompt vom 2026-07-24).

## Änderung 1: Domain-Registrierung entfernen
- Option B ("Neu registrieren") aus `/dashboard/[siteId]/domain` entfernen
- Stub-API, DB-Felder, UI komplett raus
- Stattdessen: Hinweistext mit Registrar-Empfehlungen (IONOS, Strato, united-domains etc.)

## Änderung 2: Domain-Verbindung robust machen
- Apex vs. Subdomain automatisch erkennen (A-Record vs. CNAME)
- DNS-Zielwerte IMMER aus Vercel-API lesen, nie hardcoden
- Immer beide Varianten anlegen (apex + www), Hauptvariante umschaltbar
- Automatische Statusprüfung (Polling: 30s erste 15 Min, dann alle 15 Min bis 48h)
- MX-Warnung (nicht ausblendbar) + Registrar-Kurzanleitungen
- E-Mail bei aktiv, Support-Benachrichtigung nach 48h
- docs/domains.md mit Vercel-Betreiber-Hinweisen

## Änderung 3: Impressum + Datenschutz bearbeitbar
- Neuer Bereich `/dashboard/[siteId]/rechtstexte`
- Strukturierte Formularfelder (kein Freitext, kein HTML)
- KI-Editor blockiert legal:true Sektionen (Schema-Regel)
- Impressum: Pflichtfelder + bedingte Felder + Template-Rendering
- Datenschutz: auto-generiert aus aktiven Funktionen + Impressum-Daten
- Publish-Blocker wenn Impressum-Pflichtfelder leer
- Dauerhaftes Änderungsprotokoll (getrennt von normaler History)
- Template-Versionierung mit automatischem Upgrade

## Akzeptanzkriterien & Testfälle
Siehe Original-Prompt (11 Testfälle definiert).
