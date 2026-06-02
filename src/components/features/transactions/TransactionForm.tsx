'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormValues } from '@/lib/validations/transaction'
import { useTransactions } from '@/hooks/useTransactions'
import { usePlanBudget, currentMonthStr } from '@/hooks/usePlanBudget'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category, Transaction, PlanBudgetWithUsage } from '@/types/database'

interface TransactionFormProps {
  householdId: string
  userId: string
  categories: Category[]
  initialValues?: Transaction
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function TransactionForm({ householdId, userId, categories, initialValues }: TransactionFormProps) {
  const router = useRouter()
  const { loading, createTransaction, updateTransaction } = useTransactions(householdId)
  const { getBudgetsForMonth, linkTransaction } = usePlanBudget(householdId, userId)
  const isEdit = !!initialValues

  // Budget selector state
  const [planBudgets, setPlanBudgets] = useState<PlanBudgetWithUsage[]>([])
  const [selectedBudgetId, setSelectedBudgetId] = useState('')
  const getBudgetsRef = useRef(getBudgetsForMonth)
  getBudgetsRef.current = getBudgetsForMonth

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: initialValues?.type ?? 'expense',
      amount: initialValues?.amount ?? 0,
      category_id: initialValues?.category_id ?? '',
      date: initialValues?.date ?? todayISO(),
      note: initialValues?.note ?? '',
      receipt_url: initialValues?.receipt_url ?? '',
    },
  })

  const selectedType = watch('type')
  const selectedCategory = watch('category_id')
  const amount = watch('amount')

  // Load budgets for current month (only for expense type)
  useEffect(() => {
    if (selectedType === 'expense') {
      getBudgetsRef.current(currentMonthStr()).then(setPlanBudgets)
    } else {
      setPlanBudgets([])
      setSelectedBudgetId('')
    }
  }, [selectedType])

  // Respect disabled categories from settings
  const disabledIds = (() => {
    try {
      const raw = typeof window !== 'undefined'
        ? localStorage.getItem(`bb_disabled_cats_${householdId}`)
        : null
      return new Set<string>(raw ? JSON.parse(raw) : [])
    } catch { return new Set<string>() }
  })()

  const filteredCategories = categories.filter(c => c.type === selectedType && !disabledIds.has(c.id))

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory)
      if (cat && cat.type !== selectedType) setValue('category_id', '')
    }
  }, [selectedType, selectedCategory, categories, setValue])

  // Budget warning calculation
  const selectedBudget = planBudgets.find(b => b.id === selectedBudgetId)
  const sisaSetelahInput = selectedBudget
    ? selectedBudget.sisa - (amount || 0)
    : null
  const willGoMinus = sisaSetelahInput !== null && sisaSetelahInput < 0

  async function onSubmit(data: TransactionFormValues) {
    let result: Transaction | null

    if (isEdit) {
      result = await updateTransaction(initialValues.id, data)
    } else {
      result = await createTransaction({ ...data, household_id: householdId, user_id: userId })
    }

    if (result) {
      // Link to budget if selected (only for new expense transactions)
      if (!isEdit && selectedBudgetId && data.type === 'expense') {
        await linkTransaction(selectedBudgetId, result.id, data.amount)
      }
      router.push('/transactions')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 px-4 pt-4 pb-6">
      {/* Type toggle */}
      <div className="flex rounded-xl border bg-muted/40 p-1">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setValue('type', t)}
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-semibold transition-colors',
              selectedType === t
                ? t === 'income'
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-red-500 text-white shadow-sm'
                : 'text-muted-foreground'
            )}
          >
            {t === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Jumlah</Label>
        <CurrencyInput
          value={amount}
          onChange={v => setValue('amount', v, { shouldValidate: true })}
          autoFocus={!isEdit}
        />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Kategori</Label>
        {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
        <div className="grid grid-cols-4 gap-2">
          {filteredCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setValue('category_id', cat.id, { shouldValidate: true })}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors',
                selectedCategory === cat.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30'
              )}
            >
              <span className="text-2xl leading-none">{cat.icon}</span>
              <span className="text-[10px] text-center leading-tight text-foreground line-clamp-1">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
        <input type="hidden" {...register('category_id')} />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label>Tanggal</Label>
        <input
          type="date"
          {...register('date')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <Label>Catatan <span className="text-muted-foreground">(opsional)</span></Label>
        <Textarea {...register('note')} placeholder="Tambah catatan..." rows={2} className="resize-none" />
        {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
      </div>

      {/* ── Budget selector (expense only, opsional) ─────────────────── */}
      {selectedType === 'expense' && !isEdit && planBudgets.length > 0 && (
        <div className="space-y-2">
          <Label>
            Masukkan ke anggaran
            <span className="ml-1 text-muted-foreground font-normal">(opsional)</span>
          </Label>

          <select
            value={selectedBudgetId}
            onChange={e => setSelectedBudgetId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Tidak ada / Skip</option>
            {planBudgets.map(b => (
              <option key={b.id} value={b.id}>
                {b.nama} (sisa {formatCurrency(Math.max(0, b.sisa))})
              </option>
            ))}
          </select>

          {/* Hint: sisa anggaran setelah input */}
          {selectedBudget && amount > 0 && (
            <div className={cn(
              'rounded-xl px-3 py-2.5 text-xs',
              willGoMinus
                ? 'bg-[#FEF3F2] text-[#B42318]'
                : 'bg-[#ECFDF3] text-[#067647]'
            )}>
              {willGoMinus ? (
                <>
                  ⚠️ Anggaran <strong>{selectedBudget.nama}</strong> akan minus{' '}
                  <strong>{formatCurrency(Math.abs(sisaSetelahInput!))}</strong> setelah pengeluaran ini.
                </>
              ) : (
                <>
                  ✓ Sisa anggaran <strong>{selectedBudget.nama}</strong> setelah ini:{' '}
                  <strong>{formatCurrency(sisaSetelahInput!)}</strong>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading} className="h-12 text-base font-semibold">
        {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </Button>
    </form>
  )
}
