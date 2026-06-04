-- ============================================================
-- 004_wallet_transfers.sql
-- Transfer internal antar dompet (plotting dari "Tidak Dianggarkan").
-- Jalankan di Supabase SQL Editor (setelah 003).
-- ============================================================

CREATE TABLE IF NOT EXISTS wallet_transfers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    uuid REFERENCES households(id) ON DELETE CASCADE,
  bulan           text NOT NULL,                                   -- YYYY-MM
  from_wallet_id  uuid REFERENCES budget_wallets(id) ON DELETE SET NULL,
  to_wallet_id    uuid REFERENCES budget_wallets(id) ON DELETE SET NULL,
  nominal         numeric(15,2) NOT NULL CHECK (nominal > 0),
  catatan         text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wallet_transfers_from ON wallet_transfers(from_wallet_id);
CREATE INDEX IF NOT EXISTS wallet_transfers_to   ON wallet_transfers(to_wallet_id);
CREATE INDEX IF NOT EXISTS wallet_transfers_household_bulan ON wallet_transfers(household_id, bulan);

ALTER TABLE wallet_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallet_transfers_household" ON wallet_transfers
  FOR ALL USING (household_id IN (SELECT household_id FROM profiles WHERE id = auth.uid()));

-- ============================================================
-- RPC: pilah dana dari satu dompet ke beberapa dompet (atomic).
-- Validasi: total transfer <= saldo from_wallet. Saldo tidak minus.
-- p_transfers: jsonb [{ "to_wallet_id": "...", "nominal": 8000, "catatan": null }]
-- ============================================================
CREATE OR REPLACE FUNCTION plot_from_unbudgeted(
  p_from_wallet_id uuid,
  p_bulan          text,
  p_transfers      jsonb
) RETURNS boolean AS $$
DECLARE
  t            jsonb;
  v_total      numeric := 0;
  v_from_saldo numeric;
  v_hh         uuid;
  v_to_id      uuid;
  v_nom        numeric;
  v_cat        text;
BEGIN
  -- Hitung total yang akan dipindahkan
  FOR t IN SELECT * FROM jsonb_array_elements(p_transfers) LOOP
    v_total := v_total + (t->>'nominal')::numeric;
  END LOOP;

  IF v_total <= 0 THEN
    RAISE EXCEPTION 'Nominal pilah harus lebih dari 0';
  END IF;

  -- Kunci baris from_wallet, validasi saldo
  SELECT saldo, household_id INTO v_from_saldo, v_hh
  FROM budget_wallets WHERE id = p_from_wallet_id FOR UPDATE;

  IF v_from_saldo IS NULL THEN
    RAISE EXCEPTION 'Dompet sumber tidak ditemukan';
  END IF;
  IF v_total > v_from_saldo THEN
    RAISE EXCEPTION 'Saldo tidak mencukupi (saldo %, diminta %)', v_from_saldo, v_total;
  END IF;

  -- Kurangi sumber
  UPDATE budget_wallets SET saldo = saldo - v_total WHERE id = p_from_wallet_id;

  -- Tambah tujuan + catat transfer
  FOR t IN SELECT * FROM jsonb_array_elements(p_transfers) LOOP
    v_to_id := (t->>'to_wallet_id')::uuid;
    v_nom   := (t->>'nominal')::numeric;
    v_cat   := t->>'catatan';
    IF v_nom > 0 THEN
      UPDATE budget_wallets SET saldo = saldo + v_nom WHERE id = v_to_id;
      INSERT INTO wallet_transfers (household_id, bulan, from_wallet_id, to_wallet_id, nominal, catatan)
      VALUES (v_hh, p_bulan, p_from_wallet_id, v_to_id, v_nom, v_cat);
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
