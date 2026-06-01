import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort, isToday } from '@/lib/utils/date'
import type { Transaction } from '@/types/database'

interface TransactionItemProps {
  tx: Transaction
}

export function TransactionItem({ tx }: TransactionItemProps) {
  const isIncome = tx.type === 'income'
  const cat = tx.categories

  // Icon tint: income → success-50 green, expense → gray-100 neutral
  const iconBg = isIncome ? '#ECFDF3' : '#F2F4F7'

  return (
    <Link href={`/transactions/${tx.id}`} className="block">
      <div className="flex items-center gap-3 px-4 py-3 active:bg-muted/50 transition-colors">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl"
          style={{ background: iconBg }}
        >
          {cat?.icon ?? '💸'}
        </span>

        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {cat?.name ?? 'Transaksi'}
          </p>
          <p className="text-xs text-muted-foreground">
            {isToday(tx.date) ? 'Hari ini' : formatDateShort(tx.date)}
            {tx.note ? ` · ${tx.note}` : ''}
          </p>
        </div>

        {/* Income: green. Expense: neutral dark (never alarmist red). */}
        <p className="shrink-0 text-sm font-semibold tabular-nums text-expense">
          {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
        </p>
      </div>
    </Link>
  )
}
