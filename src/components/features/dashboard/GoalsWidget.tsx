import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'

interface GoalsWidgetProps {
  householdId: string
}

interface GoalRow {
  id: string
  name: string
  target_amount: number
  saved_amount: number
  deadline_date: string | null
}

export async function GoalsWidget({ householdId }: GoalsWidgetProps) {
  const supabase = await createClient()

  const res = await supabase
    .from('goals')
    .select('id, name, target_amount, saved_amount, deadline_date, status')
    .eq('household_id', householdId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(2)

  const goals = res.data as unknown as GoalRow[] | null

  return (
    <section className="mt-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Goals Tabungan 🎯</h2>
        <Link href="/goals" className="flex items-center gap-0.5 text-xs text-primary">
          Lihat Semua <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {!goals || goals.length === 0 ? (
        <Link
          href="/goals/new"
          className="flex flex-col items-center rounded-xl border border-dashed bg-card py-6 text-center transition-colors active:bg-muted"
        >
          <p className="text-2xl">🎯</p>
          <p className="mt-2 text-sm font-medium">Belum ada goal aktif</p>
          <p className="mt-0.5 text-xs text-primary">Buat goal pertamamu →</p>
        </Link>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => {
            const pct = Math.min(
              100,
              Math.round((Number(goal.saved_amount) / Number(goal.target_amount)) * 100)
            )
            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="block rounded-xl border bg-card px-4 py-3 transition-colors active:bg-muted"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{goal.name}</p>
                  <span className="text-xs font-semibold text-primary">{pct}%</span>
                </div>
                <Progress value={pct} className="mt-2 h-2" />
                <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(Number(goal.saved_amount))}</span>
                  <span>{formatCurrency(Number(goal.target_amount))}</span>
                </div>
                {goal.deadline_date && (
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Target: {formatDate(goal.deadline_date)}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
