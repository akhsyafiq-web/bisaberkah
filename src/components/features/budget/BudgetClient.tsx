'use client'

import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useBudgets, type BudgetWithActual } from '@/hooks/useBudgets'
import { BudgetCard } from './BudgetCard'
import { BudgetForm } from './BudgetForm'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

const ID_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

interface BudgetClientProps {
  householdId: string
}

export function BudgetClient({ householdId }: BudgetClientProps) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [budgets, setBudgets] = useState<BudgetWithActual[]>([])
  const [fetching, setFetching] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<BudgetWithActual | null>(null)
  const { getBudgetsWithActual } = useBudgets(householdId)

  const load = useCallback(async () => {
    setFetching(true)
    const data = await getBudgetsWithActual(year, month)
    setBudgets(data)
    setFetching(false)
  }, [year, month, getBudgetsWithActual])

  useEffect(() => { load() }, [load])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalActual = budgets.reduce((s, b) => s + b.actual, 0)
  const totalPct = totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0
  const overallBar = totalPct >= 100 ? '#D92D20' : totalPct >= 75 ? '#F79009' : '#079455'

  return (
    <div className="pb-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-full border bg-card active:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-base font-bold text-foreground">{ID_MONTHS[month - 1]} {year}</p>
        <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-full border bg-card active:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Overview card */}
      <div className="mx-4 rounded-2xl border bg-card p-4 shadow-sm space-y-3">
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Total Dianggarkan</p>
            <p className="font-bold tabular-nums text-foreground">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Terpakai</p>
            <p className="font-bold tabular-nums text-foreground">{formatCurrency(totalActual)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Sisa</p>
            <p className={cn('font-bold tabular-nums', totalBudget - totalActual < 0 ? 'text-[#D92D20]' : 'text-income')}>
              {formatCurrency(Math.max(0, totalBudget - totalActual))}
            </p>
          </div>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${totalPct}%`, background: overallBar }} />
        </div>
        <p className="text-xs text-muted-foreground text-right">{totalPct}% terpakai</p>
      </div>

      {/* Budget list */}
      <div className="mt-4 space-y-3 px-4">
        {fetching ? (
          [0,1,2].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-3xl">📊</p>
            <p className="text-sm font-semibold">Belum ada anggaran</p>
            <p className="text-xs text-muted-foreground">Atur anggaran per kategori untuk kontrol pengeluaranmu.</p>
          </div>
        ) : (
          budgets.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              onEdit={t => { setEditTarget(t); setFormOpen(true) }}
            />
          ))
        )}
      </div>

      {/* FAB-style add button */}
      <div className="px-4 mt-4">
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true) }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary transition-colors active:bg-muted/40"
        >
          <Plus className="h-4 w-4" />
          Tambah Anggaran
        </button>
      </div>

      <BudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        householdId={householdId}
        year={year}
        month={month}
        editTarget={editTarget}
        onSuccess={load}
      />
    </div>
  )
}
