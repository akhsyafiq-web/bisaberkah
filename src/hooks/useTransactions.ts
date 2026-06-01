'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, TransactionType } from '@/types/database'
import type { TransactionFormValues } from '@/lib/validations/transaction'

export interface TransactionFilter {
  type?: TransactionType | 'all'
  category_id?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export function useTransactions(householdId: string) {
  const [loading, setLoading] = useState(false)

  async function getTransactions(filter: TransactionFilter = {}): Promise<Transaction[]> {
    const supabase = createClient()
    let query = supabase
      .from('transactions')
      .select('id, type, amount, category_id, date, note, receipt_url, user_id, household_id, created_at, updated_at, categories(name, icon, color)')
      .eq('household_id', householdId)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filter.type && filter.type !== 'all') {
      query = query.eq('type', filter.type)
    }
    if (filter.category_id) {
      query = query.eq('category_id', filter.category_id)
    }
    if (filter.dateFrom) {
      query = query.gte('date', filter.dateFrom)
    }
    if (filter.dateTo) {
      query = query.lte('date', filter.dateTo)
    }

    const res = await query
    return (res.data as unknown as Transaction[] | null) ?? []
  }

  async function createTransaction(data: TransactionFormValues & { household_id: string; user_id: string }): Promise<Transaction | null> {
    setLoading(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('transactions') as any)
        .insert({
          household_id: data.household_id,
          user_id: data.user_id,
          type: data.type,
          amount: data.amount,
          category_id: data.category_id,
          date: data.date,
          note: data.note || null,
          receipt_url: data.receipt_url || null,
        })
        .select('id, type, amount, category_id, date, note, receipt_url, user_id, household_id, created_at, updated_at')
        .single()

      const tx = res.data as unknown as Transaction | null
      if (!tx) throw new Error(res.error?.message ?? 'Gagal menyimpan transaksi')

      toast.success('Transaksi berhasil disimpan')
      return tx
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan transaksi')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function updateTransaction(id: string, data: Partial<TransactionFormValues>): Promise<Transaction | null> {
    setLoading(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await (supabase.from('transactions') as any)
        .update({
          ...(data.type !== undefined && { type: data.type }),
          ...(data.amount !== undefined && { amount: data.amount }),
          ...(data.category_id !== undefined && { category_id: data.category_id }),
          ...(data.date !== undefined && { date: data.date }),
          ...(data.note !== undefined && { note: data.note || null }),
          ...(data.receipt_url !== undefined && { receipt_url: data.receipt_url || null }),
        })
        .eq('id', id)
        .select('id, type, amount, category_id, date, note, receipt_url, user_id, household_id, created_at, updated_at')
        .single()

      const tx = res.data as unknown as Transaction | null
      if (!tx) throw new Error(res.error?.message ?? 'Gagal mengubah transaksi')

      toast.success('Transaksi berhasil diperbarui')
      return tx
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengubah transaksi')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function deleteTransaction(id: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await supabase.from('transactions').delete().eq('id', id)
      if (res.error) throw new Error(res.error.message)

      toast.success('Transaksi dihapus')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus transaksi')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { loading, getTransactions, createTransaction, updateTransaction, deleteTransaction }
}
