'use client'

import { useEffect, useRef, useState } from 'react'
import { useReports, defaultPeriod, type PeriodType, type ReportPeriod } from '@/hooks/useReports'
import { PeriodSelector } from './PeriodSelector'
import { SummaryCards } from './SummaryCards'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { ReportsTransactionList } from './ReportsTransactionList'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface ReportsClientProps {
  householdId: string
}

const VIEW_TABS = [
  { label: 'Ringkasan', value: 'summary' },
  { label: 'Transaksi',  value: 'transactions' },
] as const

type ViewTab = 'summary' | 'transactions'

export function ReportsClient({ householdId }: ReportsClientProps) {
  const [view, setView] = useState<ViewTab>('summary')
  const [period, setPeriod] = useState<ReportPeriod>(defaultPeriod('monthly'))
  const { loading, data, fetchReport } = useReports(householdId)

  const fetchRef = useRef(fetchReport)
  fetchRef.current = fetchReport

  useEffect(() => {
    fetchRef.current(period)
  }, [period])

  function handlePeriodChange(type: PeriodType) {
    setPeriod(defaultPeriod(type))
  }

  function handleCustomChange(start: string, end: string) {
    if (start && end) setPeriod({ type: 'custom', start, end })
  }

  return (
    <div className="pb-6">
      {/* View tabs */}
      <div className="flex border-b bg-background sticky top-14 z-30">
        {VIEW_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setView(t.value)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-colors',
              view === t.value
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Period selector — shared between both views */}
      <div className="pt-3">
        <PeriodSelector
          active={period.type}
          onChange={handlePeriodChange}
          customStart={period.start}
          customEnd={period.end}
          onCustomChange={handleCustomChange}
        />
      </div>

      {view === 'summary' ? (
        /* ── Ringkasan view ─────────────────────────────────────── */
        <div className="space-y-5 mt-2">
          {loading ? (
            <div className="space-y-4 px-4">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
              <Skeleton className="h-52 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          ) : data ? (
            <>
              <SummaryCards totalIncome={data.totalIncome} totalExpense={data.totalExpense} />
              <div className="rounded-xl border bg-card py-4 mx-4 shadow-sm">
                <IncomeExpenseChart bars={data.bars} />
              </div>
              <div className="rounded-xl border bg-card py-4 mx-4 shadow-sm">
                <CategoryBreakdown
                  categories={data.expenseByCategory}
                  totalExpense={data.totalExpense}
                />
              </div>
              {data.totalAmal > 0 && (
                <div className="mx-4 flex items-center gap-4 rounded-xl px-4 py-4"
                  style={{ background: '#FFF6DB', borderColor: '#FCEBB3', border: '1px solid' }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
                    <span className="text-xl">🤲</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: '#91560B' }}>Amal Periode Ini</p>
                    <p className="text-lg font-extrabold tabular-nums" style={{ color: '#101828' }}>
                      {formatCurrency(data.totalAmal)}
                    </p>
                    <p className="mt-0.5 text-[10px]" style={{ color: '#B57108' }}>Semoga berkah 🌿</p>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      ) : (
        /* ── Transaksi detail view ──────────────────────────────── */
        <div className="mt-2">
          <ReportsTransactionList
            householdId={householdId}
            period={period}
          />
        </div>
      )}
    </div>
  )
}
