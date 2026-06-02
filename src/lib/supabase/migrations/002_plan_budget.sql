-- ============================================================
-- 002_plan_budget.sql
-- Jalankan di Supabase SQL Editor sebelum menggunakan fitur
-- Budget Planning (Penganggaran Bulanan).
-- ============================================================

-- Tabel anggaran (plan_budgets)
-- Berbeda dari tabel budgets yang category-based.
-- plan_budgets bersifat named bucket, per bulan, per household.
CREATE TABLE IF NOT EXISTS plan_budgets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid REFERENCES households(id) ON DELETE CASCADE,
  user_id         uuid REFERENCES auth.users(id),
  nama            text NOT NULL,
  nominal_rencana numeric(15,2) NOT NULL DEFAULT 0,
  bulan           text NOT NULL,              -- format: YYYY-MM
  warna           text,                        -- hex color opsional
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- Tabel relasi pengeluaran ke anggaran (plan_budget_usage)
-- Jika transaksi dihapus → usage otomatis terhapus (CASCADE)
CREATE TABLE IF NOT EXISTS plan_budget_usage (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id     uuid REFERENCES plan_budgets(id) ON DELETE CASCADE,
  transaksi_id  uuid REFERENCES transactions(id) ON DELETE CASCADE,
  nominal       numeric(15,2) NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS plan_budgets_household_bulan ON plan_budgets(household_id, bulan);
CREATE INDEX IF NOT EXISTS plan_budget_usage_budget_id  ON plan_budget_usage(budget_id);
CREATE INDEX IF NOT EXISTS plan_budget_usage_transaksi  ON plan_budget_usage(transaksi_id);

-- RLS
ALTER TABLE plan_budgets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_budget_usage ENABLE ROW LEVEL SECURITY;

-- Policies plan_budgets: akses hanya untuk household yang sama
CREATE POLICY "plan_budgets_household" ON plan_budgets
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policies plan_budget_usage: akses melalui budget yang diizinkan
CREATE POLICY "plan_budget_usage_household" ON plan_budget_usage
  FOR ALL USING (
    budget_id IN (
      SELECT pb.id FROM plan_budgets pb
      JOIN profiles p ON p.household_id = pb.household_id
      WHERE p.id = auth.uid()
    )
  );
