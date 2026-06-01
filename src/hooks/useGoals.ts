'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { Goal, GoalSaving, GoalStatus } from '@/types/database'

export interface GoalFormValues {
  name: string
  emoji: string
  target_amount: number
  saved_amount: number
  duration_months: number
  start_date: string
  note?: string
}

export interface GoalStats {
  perMonth: number
  deadline: string
  percentage: number
  remaining: number
}

export function calculateGoalStats(goal: Pick<Goal, 'target_amount' | 'saved_amount' | 'duration_months' | 'start_date' | 'deadline_date'>): GoalStats {
  const remaining = Math.max(0, goal.target_amount - goal.saved_amount)
  const perMonth = goal.duration_months > 0 ? remaining / goal.duration_months : 0
  const percentage = goal.target_amount > 0
    ? Math.min(100, Math.round((goal.saved_amount / goal.target_amount) * 100))
    : 0

  const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const dl = new Date(goal.deadline_date)
  const deadline = `${ID_MONTHS[dl.getMonth()]} ${dl.getFullYear()}`

  return { perMonth, deadline, percentage, remaining }
}

export function useGoals(householdId: string) {
  const [loading, setLoading] = useState(false)

  async function getGoals(status?: GoalStatus | 'all'): Promise<Goal[]> {
    const supabase = createClient()
    let query = supabase
      .from('goals')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const res = await query
    return (res.data as unknown as Goal[] | null) ?? []
  }

  async function createGoal(data: GoalFormValues): Promise<Goal | null> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('goals') as any)
        .insert({
          household_id: householdId,
          name: data.name,
          target_amount: data.target_amount,
          saved_amount: data.saved_amount,
          duration_months: data.duration_months,
          start_date: data.start_date,
          status: 'active',
          note: data.note || null,
        })
        .select('*')
        .single()

      const goal = res.data as unknown as Goal | null
      if (!goal) throw new Error(res.error?.message ?? 'Gagal membuat goal')

      toast.success('Goal berhasil dibuat!')
      return goal
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat goal')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function updateGoal(id: string, data: Partial<GoalFormValues & { status: GoalStatus }>): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('goals') as any)
        .update(data)
        .eq('id', id)

      if (res.error) throw new Error(res.error.message)
      toast.success('Goal diperbarui')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui goal')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function addSaving(goalId: string, amount: number, date: string, note?: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const goalRes = await supabase.from('goals').select('saved_amount, target_amount').eq('id', goalId).single()
      const current = goalRes.data as unknown as { saved_amount: number; target_amount: number } | null
      if (!current) throw new Error('Goal tidak ditemukan')

      const newSaved = Number(current.saved_amount) + amount

      await Promise.all([
        (supabase.from('goal_savings') as any).insert({
          goal_id: goalId,
          amount,
          saved_at: date,
          note: note || null,
        }),
        (supabase.from('goals') as any)
          .update({
            saved_amount: newSaved,
            ...(newSaved >= current.target_amount && { status: 'achieved' }),
          })
          .eq('id', goalId),
      ])

      if (newSaved >= current.target_amount) {
        toast.success('🎉 Goal tercapai! Selamat!')
      } else {
        toast.success('Tabungan berhasil ditambahkan')
      }
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambah tabungan')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function getSavings(goalId: string): Promise<GoalSaving[]> {
    const supabase = createClient()
    const res = await supabase
      .from('goal_savings')
      .select('*')
      .eq('goal_id', goalId)
      .order('saved_at', { ascending: false })

    return (res.data as unknown as GoalSaving[] | null) ?? []
  }

  async function deleteGoal(id: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await supabase.from('goals').delete().eq('id', id)
      if (res.error) throw new Error(res.error.message)
      toast.success('Goal dihapus')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus goal')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { loading, getGoals, createGoal, updateGoal, addSaving, getSavings, deleteGoal, calculateGoalStats }
}
