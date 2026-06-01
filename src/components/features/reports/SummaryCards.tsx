import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
}

export function SummaryCards({ totalIncome, totalExpense }: SummaryCardsProps) {
  const saldo = totalIncome - totalExpense
  const isPositive = saldo >= 0

  return (
    <div className="grid grid-cols-3 gap-2 px-4">
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <p className="text-[10px] text-muted-foreground">Pemasukan</p>
        <p className="mt-0.5 text-sm font-bold text-income leading-tight">
          {formatCurrency(totalIncome)}
        </p>
      </div>
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <p className="text-[10px] text-muted-foreground">Pengeluaran</p>
        <p className="mt-0.5 text-sm font-bold text-expense leading-tight">
          {formatCurrency(totalExpense)}
        </p>
      </div>
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <p className="text-[10px] text-muted-foreground">Saldo</p>
        <p className={cn(
          'mt-0.5 text-sm font-bold leading-tight',
          isPositive ? 'text-income' : 'text-expense'
        )}>
          {isPositive ? '' : '−'}{formatCurrency(Math.abs(saldo))}
        </p>
      </div>
    </div>
  )
}
