-- 025: F5 Demo-Pipeline (BF §6) — Kosten pro Demo + Asset-Verweise
--
-- Jede Flagship-Demo generiert Schlüssel-Assets frisch (Hero + Signature-Paar,
-- quelle 'demo_generiert'); die Summe der Generierungskosten landet an der Demo,
-- damit das Dashboard "Kosten pro Demo" zeigen kann (DoD: ≤ 1,50 €/Demo).
-- Additiv, kein Drop.

ALTER TABLE demos ADD COLUMN IF NOT EXISTS kosten_cent int NOT NULL DEFAULT 0;
ALTER TABLE demos ADD COLUMN IF NOT EXISTS asset_meta jsonb;

COMMENT ON COLUMN demos.kosten_cent IS 'Summe der Asset-Generierungskosten dieser Demo in Cent (F5)';
COMMENT ON COLUMN demos.asset_meta IS 'IDs/Quellen der Demo-Assets: {hero, paar, fallback[], warnungen[]}';
