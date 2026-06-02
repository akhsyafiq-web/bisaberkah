'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  PlanBudget, PlanBudgetUsage, PlanBudgetWithUsage, PlanBudgetStatus,
} from '@/types/database'

export interface PlanBudgetFormValues {
  nama: string
  nominal_rencana: number
  bulan: string   // YYYY-MM
  warna?: string
}

/** Hitung bulan sebelumnya, format YYYY-MM */
export function prevMonth(bulan: string): string {
  const [y, m] = bulan.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

/** Bulan aktif format YYYY-MM */
export function currentMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function calcStatus(rencana: number, terpakai: number): PlanBudgetStatus {
  const sisa = rencana - terpakai
  if (sisa < 0) return 'minus'
  if (sisa / rencana < 0.2) return 'mepet'
  return 'aman'
}

export function usePlanBudget(householdId: string, userId: string) {
  const [loading, setLoading] = useState(false)

  /** Ambil semua anggaran bulan tertentu + kalkulasi terpakai */
  async function getBudgets(bulan: string): Promise<PlanBudgetWithUsage[]> {
    const supabase = createClient()

    const [budgetRes, usageRes] = await Promise.all([
      supabase
        .from('plan_budgets')
        .select('*')
        .eq('household_id', householdId)
        .eq('bulan', bulan)
        .order('created_at'),
      supabase
        .from('plan_budget_usage')
        .select('budget_id, nominal')
        .in('budget_id',
          (await supabase
            .from('plan_budgets')
            .select('id')
            .eq('household_id', householdId)
            .eq('bulan', bulan)
          ).data?.map((b: any) => b.id) ?? []
        ),
    ])

    if (budgetRes.error) throw new Error(budgetRes.error.message)
    const budgets = (budgetRes.data as unknown as PlanBudget[] | null) ?? []
    const usages  = (usageRes.data  as unknown as Array<{ budget_id: string; nominal: number }> | null) ?? []

    const terpakaiMap = new Map<string, number>()
    for (const u of usages) {
      terpakaiMap.set(u.budget_id, (terpakaiMap.get(u.budget_id) ?? 0) + Number(u.nominal))
    }

    return budgets.map(b => {
      const terpakai = terpakaiMap.get(b.id) ?? 0
      return {
        ...b,
        nominal_terpakai: terpakai,
        sisa: Number(b.nominal_rencana) - terpakai,
        status: calcStatus(Number(b.nominal_rencana), terpakai),
      }
    })
  }

  /** Ambil usage (transaksi terhubung) milik satu anggaran */
  async function getBudgetUsages(budgetId: string): Promise<
    Array<PlanBudgetUsage & { transactions: { date: string; note: string | null; categories: { name: string; icon: string } | null } }>
  > {
    const supabase = createClient()
    const res = await supabase
      .from('plan_budget_usage')
      .select('*, transactions(date, note, categories(name, icon))')
      .eq('budget_id', budgetId)
      .order('created_at', { ascending: false })
    return (res.data as unknown as any[] | null) ?? []
  }

  async function createBudget(data: PlanBudgetFormValues): Promise<PlanBudget | null> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('plan_budgets') as any).insert({
        household_id: householdId,
        user_id: userId,
        nama: data.nama.trim(),
        nominal_rencana: data.nominal_rencana,
        bulan: data.bulan,
        warna: data.warna ?? null,
      }).select('*').single()

      const b = res.data as unknown as PlanBudget | null
      if (!b) throw new Error(res.error?.message ?? 'Gagal membuat anggaran')
      toast.success('Anggaran berhasil dibuat')
      return b
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat anggaran')
      return null
    } finally { setLoading(false) }
  }

  async function updateBudget(id: string, data: Partial<PlanBudgetFormValues>): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('plan_budgets') as any).update({
        ...(data.nama !== undefined && { nama: data.nama.trim() }),
        ...(data.nominal_rencana !== undefined && { nominal_rencana: data.nominal_rencana }),
        ...(data.warna !== undefined && { warna: data.warna }),
      }).eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Anggaran diperbarui')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui anggaran')
      return false
    } finally { setLoading(false) }
  }

  async function deleteBudget(id: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await supabase.from('plan_budgets').delete().eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Anggaran dihapus')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus anggaran')
      return false
    } finally { setLoading(false) }
  }

  /** Tautkan transaksi ke anggaran */
  async function linkTransaction(budgetId: string, transaksiId: string, nominal: number): Promise<boolean> {
    try {
      const supabase = createClient()
      // Hapus tautan lama untuk transaksi ini jika ada
      await supabase.from('plan_budget_usage').delete().eq('transaksi_id', transaksiId)
      if (budgetId === '') return true  // unlink only

      const res = await (supabase.from('plan_budget_usage') as any).insert({
        budget_id: budgetId,
        transaksi_id: transaksiId,
        nominal,
      })
      return !res.error
    } catch { return false }
  }

  /** Salin semua anggaran dari bulan lalu ke bulan ini */
  async function copyFromLastMonth(targetBulan: string): Promise<number> {
    setLoading(true)
    try {
      const prev = prevMonth(targetBulan)
      const last = await getBudgets(prev)
      if (last.length === 0) { toast.info('Tidak ada anggaran di bulan sebelumnya'); return 0 }

      const supabase = createClient()
      const rows = last.map(b => ({
        household_id: householdId,
        user_id: userId,
        nama: b.nama,
        nominal_rencana: b.nominal_rencana,
        bulan: targetBulan,
        warna: b.warna,
      }))
      const res = await (supabase.from('plan_budgets') as any).insert(rows)
      if (res.error) throw new Error(res.error.message)
      toast.success(`${last.length} anggaran disalin dari bulan lalu`)
      return last.length
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyalin anggaran')
      return 0
    } finally { setLoading(false) }
  }

  /** Ambil anggaran bulan ini untuk TransactionForm dropdown */
  async function getBudgetsForMonth(bulan: string): Promise<PlanBudgetWithUsage[]> {
    return getBudgets(bulan)
  }

  return {
    loading,
    getBudgets,
    getBudgetUsages,
    createBudget,
    updateBudget,
    deleteBudget,
    linkTransaction,
    copyFromLastMonth,
    getBudgetsForMonth,
  }
}
