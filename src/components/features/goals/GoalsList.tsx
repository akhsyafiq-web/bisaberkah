'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useGoals } from '@/hooks/useGoals'
import { GoalCard } from './GoalCard'
import { AddSavingSheet } from './AddSavingSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import type { Goal, GoalStatus } from '@/types/database'

interface GoalsListProps {
  householdId: string
}

const FILTERS: { label: string; value: GoalStatus | 'all' }[] = [
  { label: 'Semua', value: 'all' },
  { label: 'Aktif', value: 'active' },
  { label: 'Tercapai', value: 'achieved' },
  { label: 'Ditunda', value: 'paused' },
]

export function GoalsList({ householdId }: GoalsListProps) {
  const [filter, setFilter] = useState<GoalStatus | 'all'>('all')
  const [goals, setGoals] = useState<Goal[]>([])
  const [fetching, setFetching] = useState(true)
  const [savingTarget, setSavingTarget] = useState<Goal | null>(null)
  const { getGoals } = useGoals(householdId)

  async function load() {
    setFetching(true)
    const data = await getGoals(filter)
    setGoals(data)
    setFetching(false)
  }

  useEffect(() => { load() }, [filter])

  return (
    <div className="pb-6">
      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              filter === f.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {fetching ? (
        <div className="space-y-3 px-4">
          {[0, 1, 2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center px-8">
          <p className="text-4xl">🎯</p>
          <p className="text-base font-semibold">Tetapkan impianmu!</p>
          <p className="text-sm text-muted-foreground">Buat goal pertamamu dan mulai menabung secara konsisten.</p>
          <Link
            href="/goals/new"
            className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            + Buat Goal Pertama
          </Link>
        </div>
      ) : (
        <div className="space-y-3 px-4">
          {goals.map(goal => (
            <Link key={goal.id} href={`/goals/${goal.id}`} className="block">
              <GoalCard goal={goal} onAddSaving={g => { setSavingTarget(g) }} />
            </Link>
          ))}
        </div>
      )}

      {savingTarget && (
        <AddSavingSheet
          open={!!savingTarget}
          onOpenChange={open => { if (!open) setSavingTarget(null) }}
          goalId={savingTarget.id}
          goalName={savingTarget.name}
          householdId={householdId}
          onSuccess={load}
        />
      )}
    </div>
  )
}
