import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Debt } from '@/types/database'

interface DebtCardProps {
  debt: Debt
  onPay?: (debt: Debt) => void
  onClick?: () => void
}

export function DebtCard({ debt, onPay, onClick }: DebtCardProps) {
  const isPaid = debt.status === 'paid'
  const paid = Number(debt.paid_amount)
  const total = Number(debt.total_amount)
  const remaining = Math.max(0, total - paid)
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

  const isOverdue = debt.due_date && !isPaid && new Date(debt.due_date) < new Date()
  const isDueSoon = debt.due_date && !isPaid && !isOverdue &&
    (new Date(debt.due_date).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border bg-card p-4 text-left shadow-sm transition-colors active:bg-muted/50 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{debt.creditor_name}</p>
          {debt.due_date && (
            <p className={cn(
              'text-xs mt-0.5',
              isOverdue ? 'text-[#D92D20] font-semibold' :
              isDueSoon ? 'text-[#F79009] font-semibold' :
              'text-muted-foreground'
            )}>
              {isOverdue ? '⚠ Jatuh tempo: ' : 'Jatuh tempo: '}
              {formatDateShort(debt.due_date)}
            </p>
          )}
        </div>
        <span className={cn(
          'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
          isPaid
            ? 'bg-[#ECFDF3] text-[#067647]'
            : 'bg-[#FEF3F2] text-[#B42318]'
        )}>
          {isPaid ? '✓ Lunas' : 'Aktif'}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5 tabular-nums">
          <span>Terbayar {formatCurrency(paid)}</span>
          <span>Total {formatCurrency(total)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: isPaid ? '#079455' : '#07835A' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Sisa hutang</p>
          <p className={cn('text-sm font-bold tabular-nums', isPaid ? 'text-income' : 'text-foreground')}>
            {isPaid ? 'Lunas ✓' : formatCurrency(remaining)}
          </p>
        </div>
        {!isPaid && onPay && (
          <button
            onClick={e => { e.stopPropagation(); onPay(debt) }}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-colors active:opacity-80"
            style={{ background: '#07835A' }}
          >
            Bayar
          </button>
        )}
      </div>
    </button>
  )
}
