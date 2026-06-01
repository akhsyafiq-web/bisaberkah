'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useDebts } from '@/hooks/useDebts'
import { DebtCard } from './DebtCard'
import { DebtForm } from './DebtForm'
import { PaymentSheet } from './PaymentSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { Debt, DebtStatus } from '@/types/database'

interface DebtsClientProps {
  householdId: string
}

const TABS: { label: string; value: DebtStatus | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Lunas', value: 'paid' },
]

export function DebtsClient({ householdId }: DebtsClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<DebtStatus | 'all'>('active')
  const [debts, setDebts] = useState<Debt[]>([])
  const [fetching, setFetching] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [payTarget, setPayTarget] = useState<Debt | null>(null)
  const { getDebts } = useDebts(householdId)

  // Keep a stable ref so the effect doesn't re-subscribe on every render
  const getDebtsRef = useRef(getDebts)
  getDebtsRef.current = getDebts

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    getDebtsRef.current(tab).then(data => {
      if (!cancelled) { setDebts(data); setFetching(false) }
    })
    return () => { cancelled = true }
  }, [tab]) // only re-fetch when tab changes

  function reload() {
    let cancelled = false
    setFetching(true)
    getDebtsRef.current(tab).then(data => {
      if (!cancelled) { setDebts(data); setFetching(false) }
    })
  }

  const activeDebts = debts.filter(d => d.status === 'active')
  const totalActive = activeDebts.reduce((s, d) => s + Math.max(0, Number(d.total_amount) - Number(d.paid_amount)), 0)

  return (
    <div className="pb-6">
      {tab !== 'paid' && (
        <div className="mx-4 mt-3 rounded-2xl border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Total hutang aktif</p>
          <p className="text-2xl font-extrabold tabular-nums text-foreground" style={{ letterSpacing: '-0.02em' }}>
            {formatCurrency(totalActive)}
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors',
              tab === t.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 px-4">
        {fetching ? (
          [0, 1, 2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : debts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <p className="text-3xl">💳</p>
            <p className="text-sm font-semibold">
              {tab === 'paid' ? 'Belum ada hutang yang lunas' : 'Tidak ada hutang aktif'}
            </p>
            <p className="text-xs text-muted-foreground">
              {tab === 'paid' ? 'Terus semangat lunasi hutangnya!' : 'Alhamdulillah, kamu bebas hutang!'}
            </p>
          </div>
        ) : (
          debts.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onPay={d => setPayTarget(d)}
              onClick={() => router.push(`/debts/${debt.id}`)}
            />
          ))
        )}
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={() => setAddOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary transition-colors active:bg-muted/40"
        >
          <Plus className="h-4 w-4" />
          Catat Hutang Baru
        </button>
      </div>

      <DebtForm open={addOpen} onOpenChange={setAddOpen} householdId={householdId} onSuccess={reload} />

      {payTarget && (
        <PaymentSheet
          open={!!payTarget}
          onOpenChange={open => { if (!open) setPayTarget(null) }}
          debt={payTarget}
          householdId={householdId}
          onSuccess={reload}
        />
      )}
    </div>
  )
}
