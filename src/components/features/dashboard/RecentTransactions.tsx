import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort, isToday } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

interface RecentTransactionsProps {
  householdId: string
}

interface TxRow {
  id: string
  type: string
  amount: number
  date: string
  note: string | null
  categories: { name: string; icon: string; color: string | null } | null
}

export async function RecentTransactions({ householdId }: RecentTransactionsProps) {
  const supabase = await createClient()

  const res = await supabase
    .from('transactions')
    .select('id, type, amount, date, note, categories(name, icon, color)')
    .eq('household_id', householdId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5)

  const transactions = res.data as unknown as TxRow[] | null

  return (
    <section className="mt-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Transaksi Terbaru</h2>
        <Link
          href="/transactions"
          className="flex items-center gap-0.5 text-xs text-primary"
        >
          Lihat Semua <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {!transactions || transactions.length === 0 ? (
        <div className="rounded-xl border bg-card py-8 text-center">
          <p className="text-2xl">🧾</p>
          <p className="mt-2 text-sm font-medium">Belum ada transaksi</p>
          <p className="text-xs text-muted-foreground">Yuk mulai catat keuanganmu!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map(tx => {
            const cat = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
            const isExpense = tx.type === 'expense'
            const dateLabel = isToday(tx.date) ? 'Hari ini' : formatDateShort(tx.date)

            return (
              <Link
                key={tx.id}
                href={`/transactions/${tx.id}`}
                className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-colors active:bg-muted"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                  style={{ background: isExpense ? '#F2F4F7' : '#ECFDF3' }}
                >
                  {cat?.icon ?? '📦'}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{cat?.name ?? 'Transaksi'}</p>
                  <p className="text-xs text-muted-foreground">{dateLabel}</p>
                </div>

                <p className="shrink-0 text-sm font-semibold tabular-nums text-expense">
                  {isExpense ? '−' : '+'}{formatCurrency(Number(tx.amount))}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
