'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { usePlanBudget } from '@/hooks/usePlanBudget'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/date'
import type { PlanBudgetWithUsage } from '@/types/database'

interface PlanBudgetDetailProps {
  budget: PlanBudgetWithUsage
  householdId: string
  userId: string
  onClose: () => void
}

type UsageRow = {
  id: string
  transaksi_id: string
  nominal: number
  created_at: string
  transactions: { date: string; note: string | null; categories: { name: string; icon: string } | null } | null
}

export function PlanBudgetDetail({ budget, householdId, userId, onClose }: PlanBudgetDetailProps) {
  const { getBudgetUsages } = usePlanBudget(householdId, userId)
  const [usages, setUsages] = useState<UsageRow[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    getBudgetUsages(budget.id).then(data => {
      setUsages(data as UsageRow[])
      setFetching(false)
    })
  }, [budget.id])

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center"
      style={{ background: 'rgba(12,17,29,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl bg-card max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b shrink-0">
          <div className="min-w-0">
            <p className="font-bold text-foreground">{budget.nama}</p>
            <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
              Total terpakai: {formatCurrency(budget.nominal_terpakai)}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y">
          {fetching ? (
            <div className="space-y-2 p-4">
              {[0,1,2].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
            </div>
          ) : usages.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-2xl">📋</p>
              <p className="text-sm text-muted-foreground">
                Belum ada pengeluaran yang ditautkan ke anggaran ini.
              </p>
            </div>
          ) : (
            usages.map(u => {
              const cat = u.transactions?.categories
              return (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg bg-muted">
                    {cat?.icon ?? '💸'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {cat?.name ?? 'Transaksi'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {u.transactions?.date ? formatDateShort(u.transactions.date) : '—'}
                      {u.transactions?.note ? ` · ${u.transactions.note}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-expense">
                    −{formatCurrency(Number(u.nominal))}
                  </p>
                </div>
              )
            })
          )}
        </div>

        {/* Total footer */}
        {usages.length > 0 && (
          <div className="border-t px-5 py-3 flex justify-between shrink-0">
            <span className="text-sm text-muted-foreground">{usages.length} transaksi</span>
            <span className="text-sm font-bold tabular-nums text-foreground">
              −{formatCurrency(budget.nominal_terpakai)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
