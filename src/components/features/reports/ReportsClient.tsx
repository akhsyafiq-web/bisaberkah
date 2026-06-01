'use client'

import { useEffect, useState } from 'react'
import { useReports, defaultPeriod, type PeriodType, type ReportPeriod } from '@/hooks/useReports'
import { PeriodSelector } from './PeriodSelector'
import { SummaryCards } from './SummaryCards'
import { IncomeExpenseChart } from './IncomeExpenseChart'
import { CategoryBreakdown } from './CategoryBreakdown'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'

interface ReportsClientProps {
  householdId: string
}

export function ReportsClient({ householdId }: ReportsClientProps) {
  const [period, setPeriod] = useState<ReportPeriod>(defaultPeriod('monthly'))
  const { loading, data, fetchReport } = useReports(householdId)

  useEffect(() => {
    fetchReport(period)
  }, [period, fetchReport])

  function handlePeriodChange(type: PeriodType) {
    setPeriod(defaultPeriod(type))
  }

  function handleCustomChange(start: string, end: string) {
    if (start && end) {
      setPeriod({ type: 'custom', start, end })
    }
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="pt-3">
        <PeriodSelector
          active={period.type}
          onChange={handlePeriodChange}
          customStart={period.start}
          customEnd={period.end}
          onCustomChange={handleCustomChange}
        />
      </div>

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

          {/* Amal widget */}
          {data.totalAmal > 0 && (
            <div className="mx-4 flex items-center gap-4 rounded-xl bg-purple-50 px-4 py-4">
              <span className="text-3xl">🤲</span>
              <div className="flex-1">
                <p className="text-xs font-medium text-purple-700">Amal Periode Ini</p>
                <p className="text-lg font-bold text-purple-900">{formatCurrency(data.totalAmal)}</p>
                <p className="mt-0.5 text-[10px] text-purple-600">Semoga berkah 🌿</p>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
