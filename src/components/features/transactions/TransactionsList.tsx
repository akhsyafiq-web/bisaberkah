'use client'

import { useEffect, useState, useRef } from 'react'
import { useTransactions, type TransactionFilter } from '@/hooks/useTransactions'
import { TransactionItem } from './TransactionItem'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils/date'
import type { Transaction } from '@/types/database'

interface TransactionsListProps {
  householdId: string
  initialFilter?: TransactionFilter
}

function groupByDate(txs: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const tx of txs) {
    const group = map.get(tx.date) ?? []
    group.push(tx)
    map.set(tx.date, group)
  }
  return map
}

export function TransactionsList({ householdId, initialFilter = {} }: TransactionsListProps) {
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [fetching, setFetching] = useState(true)
  const { getTransactions } = useTransactions(householdId)

  // Stable ref so effect only re-runs when filter changes, not on every render
  const getTransactionsRef = useRef(getTransactions)
  getTransactionsRef.current = getTransactions

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    getTransactionsRef.current(filter).then(data => {
      if (!cancelled) { setTransactions(data); setFetching(false) }
    })
    return () => { cancelled = true }
  }, [filter])

  const tabs = [
    { label: 'Semua', value: 'all' },
    { label: 'Pengeluaran', value: 'expense' },
    { label: 'Pemasukan', value: 'income' },
  ] as const

  const grouped = groupByDate(transactions)

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(prev => ({ ...prev, type: tab.value }))}
            className={[
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              (filter.type ?? 'all') === tab.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="space-y-1 px-4 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-3xl">📭</p>
          <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
        </div>
      ) : (
        <div>
          {Array.from(grouped.entries()).map(([date, txs]) => (
            <div key={date}>
              <p className="px-4 pb-1 pt-3 text-xs font-medium text-muted-foreground">
                {formatDate(date)}
              </p>
              <div className="divide-y divide-border">
                {txs.map(tx => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
