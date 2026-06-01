'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types/database'

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

export interface ReportPeriod {
  type: PeriodType
  start: string   // YYYY-MM-DD
  end: string     // YYYY-MM-DD
}

export interface CategoryStat {
  category_id: string
  name: string
  icon: string
  color: string | null
  total: number
  count: number
  percentage: number
}

export interface DailyBar {
  label: string   // "1 Jan", "Mg 1", "Jan", etc.
  income: number
  expense: number
}

export interface ReportData {
  totalIncome: number
  totalExpense: number
  expenseByCategory: CategoryStat[]
  incomeByCategory: CategoryStat[]
  bars: DailyBar[]
  totalAmal: number
}

const AMAL_CATEGORIES = ['Sedekah', 'Zakat', 'Infaq', 'Wakaf']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function startOfMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

function endOfMonth() {
  const d = new Date()
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return lastDay.toISOString().slice(0, 10)
}

function startOfYear() {
  return `${new Date().getFullYear()}-01-01`
}

function endOfYear() {
  return `${new Date().getFullYear()}-12-31`
}

function startOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  return mon.toISOString().slice(0, 10)
}

function endOfWeek() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  const sun = new Date(d.setDate(diff))
  return sun.toISOString().slice(0, 10)
}

function last7Days() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 6)
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) }
}

export function defaultPeriod(type: PeriodType): ReportPeriod {
  switch (type) {
    case 'daily': {
      const t = todayISO()
      return { type, start: t, end: t }
    }
    case 'weekly':
      return { type, start: startOfWeek(), end: endOfWeek() }
    case 'monthly':
      return { type, start: startOfMonth(), end: endOfMonth() }
    case 'yearly':
      return { type, start: startOfYear(), end: endOfYear() }
    case 'custom': {
      const { start, end } = last7Days()
      return { type, start, end }
    }
  }
}

function buildBars(
  rows: Array<{ date: string; type: string; amount: number }>,
  period: ReportPeriod
): DailyBar[] {
  const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

  if (period.type === 'monthly') {
    // Group by day-of-month
    const map = new Map<string, DailyBar>()
    const start = new Date(period.start)
    const end = new Date(period.end)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10)
      map.set(key, { label: String(d.getDate()), income: 0, expense: 0 })
    }
    for (const row of rows) {
      const bar = map.get(row.date)
      if (bar) {
        if (row.type === 'income') bar.income += Number(row.amount)
        else bar.expense += Number(row.amount)
      }
    }
    return Array.from(map.values())
  }

  if (period.type === 'yearly') {
    // Group by month
    const map = new Map<string, DailyBar>()
    for (let m = 0; m < 12; m++) {
      const key = String(m)
      map.set(key, { label: ID_MONTHS[m], income: 0, expense: 0 })
    }
    for (const row of rows) {
      const m = new Date(row.date).getMonth()
      const bar = map.get(String(m))!
      if (row.type === 'income') bar.income += Number(row.amount)
      else bar.expense += Number(row.amount)
    }
    return Array.from(map.values())
  }

  // daily / weekly / custom → group by date
  const map = new Map<string, DailyBar>()
  for (const row of rows) {
    const d = new Date(row.date)
    const label = `${d.getDate()} ${ID_MONTHS[d.getMonth()]}`
    const existing = map.get(row.date) ?? { label, income: 0, expense: 0 }
    if (row.type === 'income') existing.income += Number(row.amount)
    else existing.expense += Number(row.amount)
    map.set(row.date, existing)
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export function useReports(householdId: string) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ReportData | null>(null)

  const fetchReport = useCallback(async (period: ReportPeriod) => {
    setLoading(true)
    try {
      const supabase = createClient()

      const [txRes, catRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('date, type, amount, category_id')
          .eq('household_id', householdId)
          .gte('date', period.start)
          .lte('date', period.end),
        supabase
          .from('categories')
          .select('id, name, icon, color')
          .eq('household_id', householdId),
      ])

      const rows = (txRes.data as unknown as Array<{ date: string; type: string; amount: number; category_id: string }> | null) ?? []
      const cats = (catRes.data as unknown as Array<Pick<Category, 'id' | 'name' | 'icon' | 'color'>> | null) ?? []

      const catMap = new Map(cats.map(c => [c.id, c]))
      const amalIds = new Set(cats.filter(c => AMAL_CATEGORIES.includes(c.name)).map(c => c.id))

      let totalIncome = 0
      let totalExpense = 0
      let totalAmal = 0

      const expenseMap = new Map<string, { total: number; count: number }>()
      const incomeMap = new Map<string, { total: number; count: number }>()

      for (const row of rows) {
        const amt = Number(row.amount)
        if (row.type === 'income') {
          totalIncome += amt
          const e = incomeMap.get(row.category_id) ?? { total: 0, count: 0 }
          e.total += amt; e.count++
          incomeMap.set(row.category_id, e)
        } else {
          totalExpense += amt
          const e = expenseMap.get(row.category_id) ?? { total: 0, count: 0 }
          e.total += amt; e.count++
          expenseMap.set(row.category_id, e)
          if (amalIds.has(row.category_id)) totalAmal += amt
        }
      }

      function toStats(map: Map<string, { total: number; count: number }>, total: number): CategoryStat[] {
        return Array.from(map.entries())
          .map(([id, { total: amt, count }]) => {
            const cat = catMap.get(id)
            return {
              category_id: id,
              name: cat?.name ?? 'Lainnya',
              icon: cat?.icon ?? '💸',
              color: cat?.color ?? null,
              total: amt,
              count,
              percentage: total > 0 ? Math.round((amt / total) * 100) : 0,
            }
          })
          .sort((a, b) => b.total - a.total)
      }

      setData({
        totalIncome,
        totalExpense,
        expenseByCategory: toStats(expenseMap, totalExpense),
        incomeByCategory: toStats(incomeMap, totalIncome),
        bars: buildBars(rows, period),
        totalAmal,
      })
    } finally {
      setLoading(false)
    }
  }, [householdId])

  return { loading, data, fetchReport }
}
