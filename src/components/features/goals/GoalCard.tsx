'use client'

import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'
import { calculateGoalStats } from '@/hooks/useGoals'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'
import type { Goal, GoalStatus } from '@/types/database'

const STATUS_LABEL: Record<GoalStatus, string> = {
  active: 'Aktif',
  achieved: 'Tercapai ✓',
  paused: 'Ditunda',
}
const STATUS_CLASS: Record<GoalStatus, string> = {
  active: 'bg-green-100 text-green-700',
  achieved: 'bg-blue-100 text-blue-700',
  paused: 'bg-muted text-muted-foreground',
}

interface GoalCardProps {
  goal: Goal
  onAddSaving?: (goal: Goal) => void
}

export function GoalCard({ goal, onAddSaving }: GoalCardProps) {
  const stats = calculateGoalStats(goal)

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-2xl shrink-0">{(goal.note?.startsWith('emoji:') ? goal.note.slice(6) : null) ?? '🎯'}</span>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{goal.name}</p>
            <p className="text-xs text-muted-foreground">Target: {stats.deadline}</p>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-medium', STATUS_CLASS[goal.status])}>
          {STATUS_LABEL[goal.status]}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">
            {formatCurrency(goal.saved_amount)} dari {formatCurrency(goal.target_amount)}
          </span>
          <span className="font-semibold text-primary">{stats.percentage}%</span>
        </div>
        <Progress value={stats.percentage} className="h-2.5" />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Target per bulan</p>
          <p className="text-sm font-bold text-income">{formatCurrency(stats.perMonth)}</p>
        </div>
        {goal.status === 'active' && onAddSaving && (
          <button
            onClick={() => onAddSaving(goal)}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            + Tabung
          </button>
        )}
      </div>
    </div>
  )
}
