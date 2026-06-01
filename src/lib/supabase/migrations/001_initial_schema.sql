-- ============================================================
-- BisaBerkah — Initial Schema Migration v1.0
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url   text,
  household_id uuid,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- households
CREATE TABLE IF NOT EXISTS public.households (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- FK profiles → households (setelah kedua tabel ada)
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_household_id_fkey
  FOREIGN KEY (household_id) REFERENCES public.households(id) ON DELETE SET NULL;

-- categories
CREATE TABLE IF NOT EXISTS public.categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name         text NOT NULL,
  type         text NOT NULL CHECK (type IN ('income', 'expense')),
  icon         text NOT NULL DEFAULT '📦',
  is_default   boolean NOT NULL DEFAULT false,
  color        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text NOT NULL CHECK (type IN ('income', 'expense')),
  amount       numeric(15, 2) NOT NULL CHECK (amount > 0),
  category_id  uuid NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  date         date NOT NULL DEFAULT CURRENT_DATE,
  note         text,
  receipt_url  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  category_id  uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount       numeric(15, 2) NOT NULL CHECK (amount > 0),
  period_type  text NOT NULL DEFAULT 'monthly' CHECK (period_type IN ('monthly', 'weekly')),
  period_start date NOT NULL,
  period_end   date NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (household_id, category_id, period_start)
);

-- debts
CREATE TABLE IF NOT EXISTS public.debts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id  uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  creditor_name text NOT NULL,
  total_amount  numeric(15, 2) NOT NULL CHECK (total_amount > 0),
  paid_amount   numeric(15, 2) NOT NULL DEFAULT 0 CHECK (paid_amount >= 0),
  due_date      date,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paid')),
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- debt_payments
CREATE TABLE IF NOT EXISTS public.debt_payments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  debt_id    uuid NOT NULL REFERENCES public.debts(id) ON DELETE CASCADE,
  amount     numeric(15, 2) NOT NULL CHECK (amount > 0),
  paid_at    date NOT NULL DEFAULT CURRENT_DATE,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- goals (deadline_date auto-generated dari start_date + duration_months)
CREATE TABLE IF NOT EXISTS public.goals (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id   uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  name           text NOT NULL,
  target_amount  numeric(15, 2) NOT NULL CHECK (target_amount > 0),
  saved_amount   numeric(15, 2) NOT NULL DEFAULT 0 CHECK (saved_amount >= 0),
  duration_months int NOT NULL CHECK (duration_months > 0),
  start_date     date NOT NULL DEFAULT CURRENT_DATE,
  deadline_date  date GENERATED ALWAYS AS (
                   (start_date + make_interval(months => duration_months))::date
                 ) STORED,
  status         text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused')),
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- goal_savings
CREATE TABLE IF NOT EXISTS public.goal_savings (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id    uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  amount     numeric(15, 2) NOT NULL CHECK (amount > 0),
  saved_at   date NOT NULL DEFAULT CURRENT_DATE,
  note       text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_transactions_household_date
  ON public.transactions (household_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_household_category
  ON public.transactions (household_id, category_id);

CREATE INDEX IF NOT EXISTS idx_transactions_household_type
  ON public.transactions (household_id, type);

CREATE INDEX IF NOT EXISTS idx_budgets_household_period
  ON public.budgets (household_id, period_start);

CREATE INDEX IF NOT EXISTS idx_debts_household_status
  ON public.debts (household_id, status);

CREATE INDEX IF NOT EXISTS idx_goals_household_status
  ON public.goals (household_id, status);

CREATE INDEX IF NOT EXISTS idx_goal_savings_goal
  ON public.goal_savings (goal_id, saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_debt_payments_debt
  ON public.debt_payments (debt_id, paid_at DESC);


-- ============================================================
-- 3. UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_debts_updated_at
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_savings   ENABLE ROW LEVEL SECURITY;

-- Helper: ambil household_id milik user saat ini
CREATE OR REPLACE FUNCTION public.get_user_household_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT household_id FROM public.profiles WHERE id = auth.uid()
$$;

-- profiles: hanya baris milik sendiri
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- households: hanya household sendiri
CREATE POLICY "households_select_own" ON public.households
  FOR SELECT USING (id = public.get_user_household_id());
CREATE POLICY "households_update_own" ON public.households
  FOR UPDATE USING (id = public.get_user_household_id());

-- categories: household sendiri (full CRUD)
CREATE POLICY "categories_all_own" ON public.categories
  FOR ALL USING (household_id = public.get_user_household_id());

-- transactions: household sendiri
CREATE POLICY "transactions_all_own" ON public.transactions
  FOR ALL USING (household_id = public.get_user_household_id());

-- budgets: household sendiri
CREATE POLICY "budgets_all_own" ON public.budgets
  FOR ALL USING (household_id = public.get_user_household_id());

-- debts: household sendiri
CREATE POLICY "debts_all_own" ON public.debts
  FOR ALL USING (household_id = public.get_user_household_id());

-- debt_payments: lewat join ke debts → household
CREATE POLICY "debt_payments_all_own" ON public.debt_payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.debts
      WHERE debts.id = debt_payments.debt_id
        AND debts.household_id = public.get_user_household_id()
    )
  );

-- goals: household sendiri
CREATE POLICY "goals_all_own" ON public.goals
  FOR ALL USING (household_id = public.get_user_household_id());

-- goal_savings: lewat join ke goals → household
CREATE POLICY "goal_savings_all_own" ON public.goal_savings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = goal_savings.goal_id
        AND goals.household_id = public.get_user_household_id()
    )
  );


-- ============================================================
-- 5. NEW USER TRIGGER
--    Otomatis buat profile + household + default categories
--    saat user baru register
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_household_id uuid;
  user_name        text;
BEGIN
  -- Ambil nama dari metadata OAuth/email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Buat household baru
  INSERT INTO public.households (name, created_by)
  VALUES (user_name || ' Family', NEW.id)
  RETURNING id INTO new_household_id;

  -- Buat profile
  INSERT INTO public.profiles (id, display_name, household_id)
  VALUES (NEW.id, user_name, new_household_id);

  -- Default categories — pengeluaran
  INSERT INTO public.categories (household_id, name, type, icon, is_default, color) VALUES
    (new_household_id, 'Makan & Minum',  'expense', '🍽️', true, '#F97316'),
    (new_household_id, 'Transportasi',   'expense', '🚗', true, '#3B82F6'),
    (new_household_id, 'Listrik',        'expense', '⚡',  true, '#EAB308'),
    (new_household_id, 'Air',            'expense', '💧', true, '#06B6D4'),
    (new_household_id, 'Internet',       'expense', '📶', true, '#8B5CF6'),
    (new_household_id, 'Belanja',        'expense', '🛒', true, '#EC4899'),
    (new_household_id, 'Kesehatan',      'expense', '💊', true, '#EF4444'),
    (new_household_id, 'Pendidikan',     'expense', '📚', true, '#10B981'),
    (new_household_id, 'Hiburan',        'expense', '🎮', true, '#F59E0B'),
    (new_household_id, 'Pakaian',        'expense', '👕', true, '#6366F1'),
    (new_household_id, 'Sedekah',        'expense', '🤲', true, '#7C3AED'),
    (new_household_id, 'Zakat',          'expense', '🌙', true, '#059669'),
    (new_household_id, 'Infaq',          'expense', '🌿', true, '#16A34A'),
    (new_household_id, 'Wakaf',          'expense', '🕌', true, '#065F46'),
    (new_household_id, 'Lainnya',        'expense', '📦', true, '#6B7280'),
    -- Default categories — pemasukan
    (new_household_id, 'Gaji',           'income',  '💼', true, '#16A34A'),
    (new_household_id, 'Freelance',      'income',  '💻', true, '#0EA5E9'),
    (new_household_id, 'Bisnis',         'income',  '🏪', true, '#F97316'),
    (new_household_id, 'Investasi',      'income',  '📈', true, '#8B5CF6'),
    (new_household_id, 'Hadiah',         'income',  '🎁', true, '#EC4899'),
    (new_household_id, 'Lainnya',        'income',  '💰', true, '#6B7280');

  RETURN NEW;
END;
$$;

-- Pasang trigger ke auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
