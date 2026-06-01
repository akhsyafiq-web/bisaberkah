'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Debt, DebtPayment, DebtStatus } from '@/types/database'

export interface DebtFormValues {
  creditor_name: string
  total_amount: number
  due_date?: string
  note?: string
}

export function useDebts(householdId: string) {
  const [loading, setLoading] = useState(false)

  async function getDebts(status?: DebtStatus | 'all'): Promise<Debt[]> {
    const supabase = createClient()
    let query = supabase
      .from('debts')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') query = query.eq('status', status)

    const res = await query
    return (res.data as unknown as Debt[] | null) ?? []
  }

  async function createDebt(data: DebtFormValues): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('debts') as any).insert({
        household_id: householdId,
        creditor_name: data.creditor_name,
        total_amount: data.total_amount,
        due_date: data.due_date || null,
        note: data.note || null,
        status: 'active',
      })
      if (res.error) throw new Error(res.error.message)
      toast.success('Hutang berhasil dicatat')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mencatat hutang')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function addPayment(debtId: string, amount: number, paidAt: string, note?: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get current debt
      const debtRes = await supabase
        .from('debts')
        .select('paid_amount, total_amount')
        .eq('id', debtId)
        .single()
      const debt = debtRes.data as unknown as { paid_amount: number; total_amount: number } | null
      if (!debt) throw new Error('Hutang tidak ditemukan')

      const newPaid = Number(debt.paid_amount) + amount
      const isFullyPaid = newPaid >= Number(debt.total_amount)

      await Promise.all([
        (supabase.from('debt_payments') as any).insert({
          debt_id: debtId,
          amount,
          paid_at: paidAt,
          note: note || null,
        }),
        (supabase.from('debts') as any).update({
          paid_amount: newPaid,
          ...(isFullyPaid && { status: 'paid' }),
        }).eq('id', debtId),
      ])

      toast.success(isFullyPaid ? '🎉 Hutang lunas!' : 'Pembayaran dicatat')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mencatat pembayaran')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function getPayments(debtId: string): Promise<DebtPayment[]> {
    const supabase = createClient()
    const res = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', debtId)
      .order('paid_at', { ascending: false })
    return (res.data as unknown as DebtPayment[] | null) ?? []
  }

  async function deleteDebt(id: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await supabase.from('debts').delete().eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Catatan hutang dihapus')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus hutang')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { loading, getDebts, createDebt, addPayment, getPayments, deleteDebt }
}
