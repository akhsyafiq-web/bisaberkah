'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionFormValues } from '@/lib/validations/transaction'
import { useTransactions } from '@/hooks/useTransactions'
import {
  useEnvelope, currentMonthStr,
  type AllocationPick, type SpendPick,
} from '@/hooks/useEnvelope'
import { IncomeAllocationSection } from '@/components/features/envelope/IncomeAllocationSection'
import { ExpenseWalletSection } from '@/components/features/envelope/ExpenseWalletSection'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils/cn'
import type { Category, Transaction } from '@/types/database'

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
  const { allocateIncome, spendExpense } = useEnvelope(householdId, userId)
  const isEdit = !!initialValues
  const bulan = currentMonthStr()

  // Envelope picks (only for new transactions)
  const [incomePicks, setIncomePicks] = useState<AllocationPick[]>([])
  const [expensePicks, setExpensePicks] = useState<SpendPick[]>([])

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

  async function onSubmit(data: TransactionFormValues) {
    let result: Transaction | null

    if (isEdit) {
      result = await updateTransaction(initialValues.id, data)
    } else {
      result = await createTransaction({ ...data, household_id: householdId, user_id: userId })
    }

    if (result) {
      // ── Envelope linkage (hanya transaksi baru) ─────────────────
      if (!isEdit) {
        if (data.type === 'income') {
          await allocateIncome(result.id, data.amount, incomePicks, bulan)
        } else {
          await spendExpense(result.id, data.amount, expensePicks, bulan)
        }
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

      {/* ── Envelope: pilah pemasukan (income, transaksi baru) ───────── */}
      {selectedType === 'income' && !isEdit && amount > 0 && (
        <div className="space-y-2">
          <Label>Pilah pemasukan ke dompet <span className="ml-1 font-normal text-muted-foreground">(opsional)</span></Label>
          <IncomeAllocationSection
            householdId={householdId}
            userId={userId}
            bulan={bulan}
            totalAmount={amount}
            onChange={setIncomePicks}
          />
        </div>
      )}

      {/* ── Envelope: ambil dari dompet (expense, transaksi baru) ─────── */}
      {selectedType === 'expense' && !isEdit && amount > 0 && (
        <div className="space-y-2">
          <Label>Ambil dari dompet</Label>
          <ExpenseWalletSection
            householdId={householdId}
            userId={userId}
            bulan={bulan}
            totalAmount={amount}
            onChange={setExpensePicks}
          />
        </div>
      )}

      <Button type="submit" disabled={loading} className="h-12 text-base font-semibold">
        {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi'}
      </Button>
    </form>
  )
}
