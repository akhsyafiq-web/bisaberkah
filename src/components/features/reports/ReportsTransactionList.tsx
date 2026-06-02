'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Pencil, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDateShort, isToday } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { ReportPeriod } from '@/hooks/useReports'
import type { Transaction, Category } from '@/types/database'

type TabType = 'all' | 'income' | 'expense'

const TABS: { label: string; value: TabType }[] = [
  { label: 'Semua',       value: 'all' },
  { label: 'Pemasukan',   value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

interface ReportsTransactionListProps {
  householdId: string
  period: ReportPeriod
}

export function ReportsTransactionList({ householdId, period }: ReportsTransactionListProps) {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('all')
  const [categoryId, setCategoryId] = useState('all')
  const [search, setSearch] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [fetching, setFetching] = useState(true)

  // Action state
  const [actionTarget, setActionTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Fetch categories once
  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('categories')
      .select('id, household_id, name, type, icon, color, is_default, created_at')
      .eq('household_id', householdId)
      .order('name')
      .then(res => setCategories((res.data as unknown as Category[] | null) ?? []))
  }, [householdId])

  // Fetch transactions when period / tab / category changes
  useEffect(() => {
    let cancelled = false
    setFetching(true)
    const supabase = createClient()

    let query = supabase
      .from('transactions')
      .select('id, type, amount, date, note, category_id, household_id, user_id, created_at, updated_at, categories(name, icon, color)')
      .eq('household_id', householdId)
      .gte('date', period.start)
      .lte('date', period.end)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (tab !== 'all') query = (query as any).eq('type', tab)
    if (categoryId !== 'all') query = (query as any).eq('category_id', categoryId)

    query.then(res => {
      if (!cancelled) {
        setTransactions((res.data as unknown as Transaction[] | null) ?? [])
        setFetching(false)
      }
    })
    return () => { cancelled = true }
  }, [householdId, period.start, period.end, tab, categoryId])

  function handleTabChange(t: TabType) {
    setTab(t)
    setCategoryId('all')
    setSearch('')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const supabase = createClient()
    const res = await supabase.from('transactions').delete().eq('id', deleteTarget.id)
    setDeleting(false)
    if (res.error) {
      toast.error('Gagal menghapus transaksi')
    } else {
      setTransactions(prev => prev.filter(t => t.id !== deleteTarget.id))
      toast.success('Transaksi dihapus')
      setDeleteTarget(null)
      setActionTarget(null)
    }
  }

  // Category chips filtered by tab
  const visibleCats = categories.filter(c => tab === 'all' ? true : c.type === tab)

  // Client-side search filter
  const filtered = transactions.filter(tx => {
    if (!search.trim()) return true
    const cat = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
    const haystack = [cat?.name ?? '', tx.note ?? ''].join(' ').toLowerCase()
    return haystack.includes(search.toLowerCase())
  })

  return (
    <div className="space-y-3 px-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari kategori atau catatan…"
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex rounded-xl border bg-muted/40 p-1 gap-1">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => handleTabChange(t.value)}
            className={cn(
              'flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors',
              tab === t.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Category chips */}
      {visibleCats.length > 0 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          <button
            onClick={() => setCategoryId('all')}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
              categoryId === 'all'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            Semua
          </button>
          {visibleCats.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryId(prev => prev === cat.id ? 'all' : cat.id)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors',
                categoryId === cat.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-muted-foreground'
              )}
            >
              <span>{cat.icon}</span>{cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Transaction count */}
      {!fetching && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} transaksi ditemukan
        </p>
      )}

      {/* Transaction list */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {fetching ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-2xl">📭</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Tidak ada hasil pencarian' : 'Tidak ada transaksi'}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filtered.map(tx => {
              const cat = Array.isArray(tx.categories) ? tx.categories[0] : tx.categories
              const isIncome = tx.type === 'income'
              return (
                <button
                  key={tx.id}
                  onClick={() => setActionTarget(tx)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/50"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ background: isIncome ? '#ECFDF3' : '#F2F4F7' }}
                  >
                    {cat?.icon ?? '💸'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{cat?.name ?? 'Transaksi'}</p>
                    <p className="text-xs text-muted-foreground">
                      {isToday(tx.date) ? 'Hari ini' : formatDateShort(tx.date)}
                      {tx.note ? ` · ${tx.note}` : ''}
                    </p>
                  </div>
                  <p className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    isIncome ? 'text-income' : 'text-expense'
                  )}>
                    {isIncome ? '+' : '−'}{formatCurrency(Number(tx.amount))}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Action dialog — tap item */}
      {actionTarget && (() => {
        const cat = Array.isArray(actionTarget.categories)
          ? actionTarget.categories[0]
          : actionTarget.categories
        return (
          <div
            className="fixed inset-0 z-9999 flex items-end justify-center"
            style={{ background: 'rgba(12,17,29,0.55)', backdropFilter: 'blur(4px)' }}
            onClick={() => setActionTarget(null)}
          >
            <div
              className="w-full max-w-[430px] rounded-t-3xl bg-card p-6 space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ background: actionTarget.type === 'income' ? '#ECFDF3' : '#F2F4F7' }}>
                  {cat?.icon ?? '💸'}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{cat?.name ?? 'Transaksi'}</p>
                  <p className={cn(
                    'text-sm font-bold tabular-nums',
                    actionTarget.type === 'income' ? 'text-income' : 'text-expense'
                  )}>
                    {actionTarget.type === 'income' ? '+' : '−'}{formatCurrency(Number(actionTarget.amount))}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setActionTarget(null); router.push(`/transactions/${actionTarget.id}/edit`) }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-semibold text-foreground transition-colors active:bg-muted/50"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => { setDeleteTarget(actionTarget); setActionTarget(null) }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-semibold text-destructive transition-colors active:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Hapus
                </button>
              </div>
              <button onClick={() => setActionTarget(null)} className="w-full rounded-xl bg-muted py-3 text-sm font-semibold text-muted-foreground">
                Batal
              </button>
            </div>
          </div>
        )
      })()}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        title="Hapus transaksi?"
        description="Transaksi ini akan dihapus permanen dan tidak dapat dikembalikan."
        confirmLabel="Ya, Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
