'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals, calculateGoalStats } from '@/hooks/useGoals'
import { AddSavingSheet } from './AddSavingSheet'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import type { Goal, GoalSaving } from '@/types/database'

interface GoalDetailClientProps {
  goal: Goal
  householdId: string
  emoji: string
}

// SVG progress ring
function ProgressRing({ pct }: { pct: number }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <svg width="128" height="128" className="-rotate-90">
      <circle cx="64" cy="64" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
      <circle
        cx="64" cy="64" r={r}
        fill="none"
        stroke="#16A34A"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  )
}

export function GoalDetailClient({ goal: initialGoal, householdId, emoji }: GoalDetailClientProps) {
  const router = useRouter()
  const [goal, setGoal] = useState(initialGoal)
  const [savings, setSavings] = useState<GoalSaving[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { getSavings, updateGoal, deleteGoal, loading } = useGoals(householdId)

  const stats = calculateGoalStats(goal)

  useEffect(() => {
    getSavings(goal.id).then(setSavings)
  }, [goal.id])

  async function handleMarkAchieved() {
    await updateGoal(goal.id, { status: 'achieved' })
    setGoal(g => ({ ...g, status: 'achieved' }))
  }

  async function handleDelete() {
    const ok = await deleteGoal(goal.id)
    if (ok) router.push('/goals')
  }

  async function handleSavingAdded() {
    // Refetch savings and update saved_amount display
    const updated = await getSavings(goal.id)
    setSavings(updated)
    const total = updated.reduce((sum, s) => sum + Number(s.amount), 0)
    setGoal(g => ({
      ...g,
      saved_amount: total,
      status: total >= g.target_amount ? 'achieved' : g.status,
    }))
  }

  return (
    <div className="pb-6 space-y-5">
      {/* Hero */}
      <div className="flex flex-col items-center gap-2 pt-6 pb-2">
        <div className="relative flex items-center justify-center">
          <ProgressRing pct={stats.percentage} />
          <div className="absolute flex flex-col items-center">
            <span className="text-3xl">{emoji}</span>
            <span className="text-xl font-bold text-foreground">{stats.percentage}%</span>
          </div>
        </div>
        {goal.status === 'active' && stats.percentage >= 100 && (
          <Button onClick={handleMarkAchieved} disabled={loading} className="mt-1">
            Tandai Tercapai 🎉
          </Button>
        )}
        {goal.status === 'achieved' && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            🎉 Tercapai!
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mx-4 rounded-2xl border bg-card divide-y shadow-sm">
        <StatRow label="Target" value={formatCurrency(goal.target_amount)} />
        <StatRow label="Terkumpul" value={formatCurrency(goal.saved_amount)} className="text-income" />
        <StatRow label="Sisa" value={formatCurrency(stats.remaining)} className="text-expense" />
        <StatRow label="Target per bulan" value={formatCurrency(stats.perMonth)} className="font-bold text-income" />
        <StatRow label="Jatuh tempo" value={stats.deadline} />
      </div>

      {/* Add saving CTA */}
      {goal.status === 'active' && (
        <div className="px-4">
          <Button onClick={() => setAddOpen(true)} className="w-full h-12 text-base font-semibold">
            + Tambah Tabungan
          </Button>
        </div>
      )}

      {/* Savings history */}
      {savings.length > 0 && (
        <div className="mx-4 space-y-2">
          <p className="text-sm font-semibold">Riwayat Tabungan</p>
          <div className="rounded-xl border bg-card divide-y">
            {savings.map(s => (
              <div key={s.id} className="flex justify-between items-center px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-income">+{formatCurrency(s.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(s.saved_at)}{s.note ? ` · ${s.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete */}
      <div className="px-4">
        <Button variant="outline" onClick={() => setDeleteOpen(true)} className="w-full h-11 text-destructive border-destructive/30">
          Hapus Goal
        </Button>
      </div>

      <AddSavingSheet
        open={addOpen}
        onOpenChange={setAddOpen}
        goalId={goal.id}
        goalName={goal.name}
        householdId={householdId}
        onSuccess={handleSavingAdded}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus goal ini?"
        description="Goal dan seluruh riwayat tabungannya akan dihapus permanen."
        confirmLabel="Ya, Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  )
}

function StatRow({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn('text-sm font-medium', className)}>{value}</span>
    </div>
  )
}
