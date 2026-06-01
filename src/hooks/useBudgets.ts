'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Budget, Category } from '@/types/database'

export interface BudgetWithActual extends Budget {
  actual: number
  percentage: number
  status: 'safe' | 'warning' | 'over'
}

export interface BudgetFormValues {
  category_id: string
  amount: number
  period_start: string
  period_end: string
}

function monthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { start, end }
}

export function useBudgets(householdId: string) {
  const [loading, setLoading] = useState(false)

  async function getBudgetsWithActual(year: number, month: number): Promise<BudgetWithActual[]> {
    const supabase = createClient()
    const { start, end } = monthRange(year, month)

    const [budgetRes, txRes] = await Promise.all([
      supabase
        .from('budgets')
        .select('id, household_id, category_id, amount, period_type, period_start, period_end, created_at, categories(name, icon, color)')
        .eq('household_id', householdId)
        .lte('period_start', end)
        .gte('period_end', start),
      supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('household_id', householdId)
        .eq('type', 'expense')
        .gte('date', start)
        .lte('date', end),
    ])

    const budgets = (budgetRes.data as unknown as Budget[] | null) ?? []
    const txRows = (txRes.data as unknown as Array<{ category_id: string; amount: number }> | null) ?? []

    // Sum actual spending per category
    const actualMap = new Map<string, number>()
    for (const tx of txRows) {
      actualMap.set(tx.category_id, (actualMap.get(tx.category_id) ?? 0) + Number(tx.amount))
    }

    return budgets.map(b => {
      const actual = actualMap.get(b.category_id) ?? 0
      const pct = b.amount > 0 ? Math.round((actual / b.amount) * 100) : 0
      const status: 'safe' | 'warning' | 'over' = pct >= 100 ? 'over' : pct >= 75 ? 'warning' : 'safe'
      return { ...b, actual, percentage: pct, status }
    }).sort((a, b) => b.percentage - a.percentage)
  }

  async function createBudget(data: BudgetFormValues): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('budgets') as any).insert({
        household_id: householdId,
        category_id: data.category_id,
        amount: data.amount,
        period_type: 'monthly',
        period_start: data.period_start,
        period_end: data.period_end,
      })
      if (res.error) throw new Error(res.error.message)
      toast.success('Anggaran berhasil dibuat')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat anggaran')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function updateBudget(id: string, amount: number): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('budgets') as any).update({ amount }).eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Anggaran diperbarui')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui anggaran')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function deleteBudget(id: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await supabase.from('budgets').delete().eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Anggaran dihapus')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus anggaran')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function getExpenseCategories(): Promise<Category[]> {
    const supabase = createClient()
    const res = await supabase
      .from('categories')
      .select('id, household_id, name, type, icon, color, is_default, created_at')
      .eq('household_id', householdId)
      .eq('type', 'expense')
      .order('name')
    return (res.data as unknown as Category[] | null) ?? []
  }

  return { loading, getBudgetsWithActual, createBudget, updateBudget, deleteBudget, getExpenseCategories }
}
