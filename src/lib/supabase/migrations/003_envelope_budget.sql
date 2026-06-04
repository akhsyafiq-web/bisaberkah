-- ============================================================
-- 003_envelope_budget.sql
-- Sistem AMPLOP DIGITAL (envelope budgeting) — revisi fitur anggaran.
-- Jalankan di Supabase SQL Editor.
--
-- Konsep: dompet punya SALDO NYATA. Pemasukan dialokasikan (pilah) ke
-- dompet, pengeluaran mengambil dari saldo dompet. Saldo dompet >= 0.
-- ============================================================

-- Template rencana bulanan (acuan alokasi tiap bulan)
CREATE TABLE IF NOT EXISTS budget_templates (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid REFERENCES households(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id),
  nama            text NOT NULL,
  nominal_rencana numeric(15,2) NOT NULL DEFAULT 0,
  urutan          int NOT NULL DEFAULT 0,
  aktif           boolean NOT NULL DEFAULT true,
  is_system       boolean NOT NULL DEFAULT false,  -- TRUE hanya untuk "Tidak Dianggarkan"
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Dompet / realisasi per bulan (punya saldo nyata)
CREATE TABLE IF NOT EXISTS budget_wallets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid REFERENCES households(id) ON DELETE CASCADE,
  template_id     uuid REFERENCES budget_templates(id) ON DELETE CASCADE,
  bulan           text NOT NULL,                    -- YYYY-MM
  saldo           numeric(15,2) NOT NULL DEFAULT 0 CHECK (saldo >= 0),
  nominal_rencana numeric(15,2) NOT NULL DEFAULT 0, -- snapshot dari template
  created_at      timestamptz DEFAULT now(),
  UNIQUE (template_id, bulan)
);

-- Alokasi pemasukan ke dompet
CREATE TABLE IF NOT EXISTS income_allocations (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pemasukan_id         uuid REFERENCES transactions(id) ON DELETE CASCADE,
  wallet_id            uuid REFERENCES budget_wallets(id) ON DELETE CASCADE,
  nominal_dialokasikan numeric(15,2) NOT NULL,
  created_at           timestamptz DEFAULT now()
);

-- Pengeluaran yang diambil dari dompet
CREATE TABLE IF NOT EXISTS expense_from_wallets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pengeluaran_id  uuid REFERENCES transactions(id) ON DELETE CASCADE,
  wallet_id       uuid REFERENCES budget_wallets(id) ON DELETE CASCADE,
  nominal         numeric(15,2) NOT NULL,
  is_overflow     boolean NOT NULL DEFAULT false,
  overflow_note   text,
  created_at      timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS budget_templates_household ON budget_templates(household_id, aktif);
CREATE INDEX IF NOT EXISTS budget_wallets_household_bulan ON budget_wallets(household_id, bulan);
CREATE INDEX IF NOT EXISTS income_allocations_pemasukan ON income_allocations(pemasukan_id);
CREATE INDEX IF NOT EXISTS income_allocations_wallet ON income_allocations(wallet_id);
CREATE INDEX IF NOT EXISTS expense_from_wallets_pengeluaran ON expense_from_wallets(pengeluaran_id);
CREATE INDEX IF NOT EXISTS expense_from_wallets_wallet ON expense_from_wallets(wallet_id);

-- RLS
ALTER TABLE budget_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_wallets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_allocations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_from_wallets  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "budget_templates_household" ON budget_templates
  FOR ALL USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "budget_wallets_household" ON budget_wallets
  FOR ALL USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "income_allocations_household" ON income_allocations
  FOR ALL USING (
    wallet_id IN (
      SELECT bw.id FROM budget_wallets bw
      JOIN profiles p ON p.household_id = bw.household_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "expense_from_wallets_household" ON expense_from_wallets
  FOR ALL USING (
    wallet_id IN (
      SELECT bw.id FROM budget_wallets bw
      JOIN profiles p ON p.household_id = bw.household_id
      WHERE p.id = auth.uid()
    )
  );

-- ============================================================
-- RPC: ambil saldo dari beberapa dompet untuk satu pengeluaran.
-- Menjamin saldo dompet TIDAK PERNAH < 0 (server-side guard).
-- picks: jsonb array [{ "wallet_id": "...", "nominal": 45000 }]
-- Mengembalikan total yang berhasil ditutup (covered).
-- ============================================================
CREATE OR REPLACE FUNCTION spend_from_wallets(
  p_pengeluaran_id uuid,
  p_picks jsonb
) RETURNS numeric AS $$
DECLARE
  pick           jsonb;
  v_wallet_id    uuid;
  v_request      numeric;
  v_saldo        numeric;
  v_take         numeric;
  v_total_picks  numeric := 0;
  v_covered      numeric := 0;
  v_shortfall    numeric;
  v_note         text;
BEGIN
  -- total nominal yang diminta semua picks (untuk hitung kekurangan)
  FOR pick IN SELECT * FROM jsonb_array_elements(p_picks) LOOP
    v_total_picks := v_total_picks + (pick->>'nominal')::numeric;
  END LOOP;

  FOR pick IN SELECT * FROM jsonb_array_elements(p_picks) LOOP
    v_wallet_id := (pick->>'wallet_id')::uuid;
    v_request   := (pick->>'nominal')::numeric;

    SELECT saldo INTO v_saldo FROM budget_wallets WHERE id = v_wallet_id FOR UPDATE;
    IF v_saldo IS NULL THEN CONTINUE; END IF;

    v_take := LEAST(v_request, v_saldo);          -- tidak boleh > saldo
    UPDATE budget_wallets SET saldo = saldo - v_take WHERE id = v_wallet_id;
    v_covered := v_covered + v_take;

    v_shortfall := v_request - v_take;
    IF v_shortfall > 0 THEN
      v_note := 'Saldo dompet tidak mencukupi. Kekurangan ditutup dari dompet lain.';
    ELSE
      v_note := NULL;
    END IF;

    INSERT INTO expense_from_wallets (pengeluaran_id, wallet_id, nominal, is_overflow, overflow_note)
    VALUES (p_pengeluaran_id, v_wallet_id, v_take, v_shortfall > 0, v_note);
  END LOOP;

  RETURN v_covered;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
