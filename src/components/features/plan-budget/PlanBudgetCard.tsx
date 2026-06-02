'use client'

import { ChevronRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { PlanBudgetWithUsage } from '@/types/database'

const STATUS_CONFIG = {
  aman:  { bar: '#079455', badge: 'bg-[#ECFDF3] text-[#067647]',  label: 'Aman' },
  mepet: { bar: '#F79009', badge: 'bg-[#FFFAEB] text-[#B54708]',  label: 'Mepet' },
  minus: { bar: '#D92D20', badge: 'bg-[#FEF3F2] text-[#B42318]',  label: 'Minus!' },
}

interface PlanBudgetCardProps {
  budget: PlanBudgetWithUsage
  onEdit: (b: PlanBudgetWithUsage) => void
  onDetail: (b: PlanBudgetWithUsage) => void
}

export function PlanBudgetCard({ budget, onEdit, onDetail }: PlanBudgetCardProps) {
  const cfg = STATUS_CONFIG[budget.status]
  const pct = budget.nominal_rencana > 0
    ? Math.min(100, Math.round((budget.nominal_terpakai / budget.nominal_rencana) * 100))
    : 0
  const isMinus = budget.sisa < 0

  return (
    <div
      className="rounded-2xl border bg-card shadow-sm overflow-hidden"
      style={budget.warna ? { borderLeftWidth: 4, borderLeftColor: budget.warna } : {}}
    >
      <button
        onClick={() => onDetail(budget)}
        className="w-full px-4 pt-4 pb-3 text-left space-y-3"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{budget.nama}</p>
            <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
              {formatCurrency(budget.nominal_terpakai)} dari {formatCurrency(budget.nominal_rencana)} terpakai
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-semibold', cfg.badge)}>
              {cfg.label}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: cfg.bar }}
          />
        </div>

        {/* Sisa */}
        <p className={cn('text-sm font-bold tabular-nums', isMinus ? 'text-[#D92D20]' : 'text-income')}>
          {isMinus
            ? `Minus ${formatCurrency(Math.abs(budget.sisa))}`
            : `Sisa ${formatCurrency(budget.sisa)}`}
          <span className="ml-2 text-xs font-normal text-muted-foreground">({100 - pct}% tersisa)</span>
        </p>
      </button>

      {/* Edit button */}
      <div className="border-t px-4 py-2.5">
        <button
          onClick={() => onEdit(budget)}
          className="text-xs font-semibold text-primary"
        >
          Edit anggaran
        </button>
      </div>
    </div>
  )
}
