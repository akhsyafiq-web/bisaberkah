import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { BudgetWithActual } from '@/hooks/useBudgets'

interface BudgetCardProps {
  budget: BudgetWithActual
  onEdit?: (budget: BudgetWithActual) => void
}

const STATUS = {
  safe:    { label: 'Aman',        bar: '#079455', badge: 'bg-[#ECFDF3] text-[#067647]' },
  warning: { label: 'Hampir habis', bar: '#F79009', badge: 'bg-[#FFFAEB] text-[#B54708]' },
  over:    { label: 'Terlampaui!', bar: '#D92D20', badge: 'bg-[#FEF3F2] text-[#B42318]' },
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const cat = Array.isArray(budget.categories) ? budget.categories[0] : budget.categories
  const s = STATUS[budget.status]
  const pct = Math.min(100, budget.percentage)

  return (
    <button
      onClick={() => onEdit?.(budget)}
      className="w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors active:bg-muted/50"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
            style={{ background: '#F2F4F7' }}>
            {cat?.icon ?? '📦'}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{cat?.name ?? 'Kategori'}</p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {formatCurrency(budget.actual)} dari {formatCurrency(budget.amount)}
            </p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-bold tabular-nums text-foreground">{budget.percentage}%</p>
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', s.badge)}>
            {s.label}
          </span>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: s.bar }}
        />
      </div>
    </button>
  )
}
