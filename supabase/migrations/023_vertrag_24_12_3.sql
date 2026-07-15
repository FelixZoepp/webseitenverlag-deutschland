-- 023: Laufzeit-Standard Hauptprodukt 24/24/3 → 24/12/3 (Änderungsauftrag 2026-07-15)
--
-- Nur der DEFAULT ändert sich (neue Zeilen ohne expliziten Wert). Bestehende
-- Vertragszeilen bleiben unangetastet — Vertragswerte werden beim Kauf aus
-- config/vertraege.ts in die Zeile geschrieben und sind danach fix
-- (Altverträge behalten, was vereinbart wurde). Additiv, kein Drop.
--
-- Hintergrund: 24-Monats-Verlängerung per AGB ist im B2B nach § 307 BGB
-- angreifbar; 12 Monate gelten als robust. Anwalts-Freigabe → WARTELISTE.md.

ALTER TABLE contracts ALTER COLUMN verlaengerung_monate SET DEFAULT 12;
