ALTER TABLE customers ADD COLUMN IF NOT EXISTS contract_start date;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contract_end date;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contract_years int DEFAULT 4;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS monthly_price numeric(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS setup_fee numeric(10,2) DEFAULT 0;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS upsell_potential jsonb DEFAULT '[]';