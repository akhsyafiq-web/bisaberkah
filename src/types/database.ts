export type TransactionType = 'income' | 'expense'

/* ── Envelope budgeting (amplop digital) ───────────────────────────── */
export type WalletStatus = 'normal' | 'mepet' | 'habis'

export interface BudgetTemplate {
  id: string
  household_id: string
  user_id: string
  nama: string
  nominal_rencana: number
  urutan: number
  aktif: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface BudgetWallet {
  id: string
  household_id: string
  template_id: string
  bulan: string            // YYYY-MM
  saldo: number            // >= 0
  nominal_rencana: number  // snapshot
  created_at: string
}

export interface IncomeAllocation {
  id: string
  pemasukan_id: string
  wallet_id: string
  nominal_dialokasikan: number
  created_at: string
}

export interface ExpenseFromWallet {
  id: string
  pengeluaran_id: string
  wallet_id: string
  nominal: number
  is_overflow: boolean
  overflow_note: string | null
  created_at: string
}

/** Dompet + metadata template (untuk display di kartu) */
export interface WalletWithMeta extends BudgetWallet {
  nama: string
  is_system: boolean
  urutan: number
  terpakai: number         // total pengeluaran dari dompet ini bulan ini
  status: WalletStatus
}

export interface WalletTransfer {
  id: string
  household_id: string
  bulan: string
  from_wallet_id: string | null
  to_wallet_id: string | null
  nominal: number
  catatan: string | null
  created_at: string
}

/** Item riwayat gabungan untuk halaman detail dompet */
export type WalletHistoryKind = 'in' | 'out' | 'transfer_in' | 'transfer_out'

export interface WalletHistoryItem {
  id: string
  kind: WalletHistoryKind
  label: string
  nominal: number          // selalu positif; tanda ditentukan oleh kind
  date: string
  catatan?: string | null
}
export type CategoryType = 'income' | 'expense'
export type DebtStatus = 'active' | 'paid'
export type GoalStatus = 'active' | 'achieved' | 'paused'
export type BudgetPeriodType = 'monthly' | 'weekly'

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  household_id: string | null
  created_at: string
}

export interface Household {
  id: string
  name: string
  created_by: string
  created_at: string
}

export interface Category {
  id: string
  household_id: string
  name: string
  type: CategoryType
  icon: string
  is_default: boolean
  color: string | null
  created_at: string
}

export interface Transaction {
  id: string
  household_id: string
  user_id: string
  type: TransactionType
  amount: number
  category_id: string
  date: string
  note: string | null
  receipt_url: string | null
  created_at: string
  updated_at: string
  /* joined */
  categories?: Pick<Category, 'name' | 'icon' | 'color'>
}

export interface Budget {
  id: string
  household_id: string
  category_id: string
  amount: number
  period_type: BudgetPeriodType
  period_start: string
  period_end: string
  created_at: string
  /* joined */
  categories?: Pick<Category, 'name' | 'icon' | 'color'>
}

export interface Debt {
  id: string
  household_id: string
  creditor_name: string
  total_amount: number
  paid_amount: number
  due_date: string | null
  status: DebtStatus
  note: string | null
  created_at: string
  updated_at: string
}

export interface DebtPayment {
  id: string
  debt_id: string
  amount: number
  paid_at: string
  note: string | null
  created_at: string
}

export interface Goal {
  id: string
  household_id: string
  name: string
  target_amount: number
  saved_amount: number
  duration_months: number
  start_date: string
  readonly deadline_date: string
  status: GoalStatus
  note: string | null
  created_at: string
  updated_at: string
}

export interface GoalSaving {
  id: string
  goal_id: string
  amount: number
  saved_at: string
  note: string | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/* Database type — must satisfy postgrest-js GenericSchema:            */
/*   each table needs Relationships: []                                */
/*   public schema needs Views and Functions                           */
/* ------------------------------------------------------------------ */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
      households: {
        Row: Household
        Insert: Omit<Household, 'id' | 'created_at'>
        Update: Partial<Omit<Household, 'id' | 'created_at'>>
        Relationships: []
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
        Relationships: []
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'categories'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'categories'>>
        Relationships: [
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at' | 'categories'>
        Update: Partial<Omit<Budget, 'id' | 'created_at' | 'categories'>>
        Relationships: [
          {
            foreignKeyName: 'budgets_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      debts: {
        Row: Debt
        Insert: Omit<Debt, 'id' | 'paid_amount' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Debt, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      debt_payments: {
        Row: DebtPayment
        Insert: Omit<DebtPayment, 'id' | 'created_at'>
        Update: Partial<Omit<DebtPayment, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'debt_payments_debt_id_fkey'
            columns: ['debt_id']
            isOneToOne: false
            referencedRelation: 'debts'
            referencedColumns: ['id']
          }
        ]
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id' | 'saved_amount' | 'deadline_date' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      goal_savings: {
        Row: GoalSaving
        Insert: Omit<GoalSaving, 'id' | 'created_at'>
        Update: Partial<Omit<GoalSaving, 'id' | 'created_at'>>
        Relationships: [
          {
            foreignKeyName: 'goal_savings_goal_id_fkey'
            columns: ['goal_id']
            isOneToOne: false
            referencedRelation: 'goals'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
