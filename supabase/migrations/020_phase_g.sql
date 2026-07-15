-- 020: Phase G — Auslieferung, Domains, SEO-Plan, GBP, Ads (§11)
--
-- sites: deploy_target steuert, wohin veröffentlicht wird:
--   'multi_tenant'        → Auslieferung über unsere Infrastruktur (Host-Routing,
--                           app/kundenseite/[host]) — der Default, kein Kunden-Setup nötig
--   'customer_cloudflare' → statischer Export → Pages Direct Upload ins Kunden-Konto;
--                           bei Token-Fehlern automatischer Fallback auf multi_tenant
--   subdomain: Slug für die Auslieferung unter *.PRODUKTDOMAIN (multi_tenant)
--
-- domains: Custom Domains je Site — Neuregistrierung (Mock-Registrar bis
--   Reseller-API-Zugang, WARTELISTE) oder vorhandene Domain mit DNS-Wartestatus.
--
-- seo_landingpages: SEO-Plan-Automation (Upsell #1) — 1 Keyword-Landingpage pro
--   Monat je Abonnent, Kunde gibt per 1 Klick frei.
--
-- gbp_setups: GBP-Ersteinrichtung (Upsell #2, va_manual) — Status bis „Zugriff erteilt".
--
-- ads_kampagnen: Google Ads Starter (Upsell #3) — Kampagnen-Entwurf im Test-Modus;
--   Werbebudget läuft IMMER direkt Kunde↔Google, nie über unsere Zahlungsmittel.
--
-- Additiv, kein Drop.

-- ── Auslieferung / Deploy ────────────────────────────────────────────────────
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deploy_target text NOT NULL DEFAULT 'multi_tenant'
  CHECK (deploy_target IN ('multi_tenant', 'customer_cloudflare'));
ALTER TABLE sites ADD COLUMN IF NOT EXISTS subdomain text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_sites_subdomain ON sites(subdomain) WHERE subdomain IS NOT NULL;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deploy_status text
  CHECK (deploy_status IN ('LAEUFT', 'OK', 'FEHLER'));
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deploy_fehler text;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS deploy_fehlversuche int NOT NULL DEFAULT 0;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS zuletzt_deployt_am timestamptz;

-- ── Custom Domains ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  hostname text NOT NULL UNIQUE,           -- z.B. maler-schmidt.de
  typ text NOT NULL DEFAULT 'vorhanden' CHECK (typ IN ('neuregistrierung', 'vorhanden')),
  status text NOT NULL DEFAULT 'WARTET_AUF_DNS'
    CHECK (status IN ('BESTELLT', 'WARTET_AUF_DNS', 'AKTIV', 'FEHLER')),
  registrar text,                          -- 'mock' | echter Reseller (WARTELISTE)
  registrar_order_id text,
  nameserver text[],                       -- Soll-Nameserver bei Neuregistrierung
  dns_ziel text,                           -- erwarteter CNAME/A-Eintrag bei 'vorhanden'
  fehler text,
  letzter_check_am timestamptz,
  aktiv_seit timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_domains_site ON domains(site_id);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own domains" ON domains
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sites JOIN customers ON customers.id = sites.customer_id
    WHERE sites.id = domains.site_id AND customers.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage domains" ON domains
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- ── SEO-Plan-Automation (Upsell #1) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_landingpages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  monat date NOT NULL,                     -- erster des Monats (ein Eintrag pro Site+Monat)
  keyword text NOT NULL,                   -- z.B. "Malerbetrieb Berlin-Pankow"
  slug text NOT NULL,                      -- URL-Pfad, z.B. "malerbetrieb-berlin-pankow"
  seiten_config jsonb NOT NULL,            -- gerenderte Sektions-Inhalte (Slot-Pipeline)
  seo_check jsonb,                         -- technischer Check (Meta, Links, Ladezeit)
  status text NOT NULL DEFAULT 'WARTET_AUF_FREIGABE'
    CHECK (status IN ('WARTET_AUF_FREIGABE', 'FREIGEGEBEN', 'ABGELEHNT')),
  freigegeben_am timestamptz,
  report_versendet_am timestamptz,         -- monatlicher Sichtbarkeits-Report
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (site_id, monat),
  UNIQUE (site_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_seo_lp_site ON seo_landingpages(site_id);

ALTER TABLE seo_landingpages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own seo_landingpages" ON seo_landingpages
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM sites JOIN customers ON customers.id = sites.customer_id
    WHERE sites.id = seo_landingpages.site_id AND customers.user_id = auth.uid()
  ));
CREATE POLICY "Admins can manage seo_landingpages" ON seo_landingpages
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- ── GBP-Ersteinrichtung (Upsell #2, va_manual) ──────────────────────────────
CREATE TABLE IF NOT EXISTS gbp_setups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'OFFEN'
    CHECK (status IN ('OFFEN', 'IN_ARBEIT', 'ZUGRIFF_ERTEILT', 'FERTIG', 'ABGEBROCHEN')),
  daten jsonb NOT NULL DEFAULT '{}'::jsonb, -- Business-Profil-Daten für den VA
  manual_task_id uuid REFERENCES manual_tasks(id) ON DELETE SET NULL,
  notizen text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gbp_customer ON gbp_setups(customer_id);

ALTER TABLE gbp_setups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own gbp_setups" ON gbp_setups
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = gbp_setups.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Admins can manage gbp_setups" ON gbp_setups
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));

-- ── Google Ads Starter (Upsell #3) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ads_kampagnen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE SET NULL,
  typ text NOT NULL DEFAULT 'search' CHECK (typ IN ('search', 'pmax')),
  status text NOT NULL DEFAULT 'ENTWURF'
    CHECK (status IN ('ENTWURF', 'EINLADUNG_VERSENDET', 'KONTO_VERKNUEPFT', 'AKTIV', 'PAUSIERT')),
  entwurf jsonb NOT NULL DEFAULT '{}'::jsonb, -- templated Setup aus Website-Content
  mcc_kundenkonto_id text,                    -- Kunden-Ads-Konto unter unserem MCC
  wochen_check jsonb,                         -- letzter regelbasierter Check
  letzter_report_am timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ads_customer ON ads_kampagnen(customer_id);

ALTER TABLE ads_kampagnen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers can view own ads_kampagnen" ON ads_kampagnen
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM customers WHERE customers.id = ads_kampagnen.customer_id AND customers.user_id = auth.uid()));
CREATE POLICY "Admins can manage ads_kampagnen" ON ads_kampagnen
  FOR ALL
  USING (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM customers WHERE user_id = auth.uid() AND role = 'admin'));
