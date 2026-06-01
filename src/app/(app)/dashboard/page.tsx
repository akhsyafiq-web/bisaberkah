import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/features/dashboard/DashboardHeader'
import { SaldoCard } from '@/components/features/dashboard/SaldoCard'
import { QuickActions } from '@/components/features/dashboard/QuickActions'
import { RecentTransactions } from '@/components/features/dashboard/RecentTransactions'
import { GoalsWidget } from '@/components/features/dashboard/GoalsWidget'
import { AmalWidget } from '@/components/features/dashboard/AmalWidget'
import {
  HeaderSkeleton,
  SaldoSkeleton,
  TransactionsSkeleton,
  GoalsSkeleton,
} from '@/components/features/dashboard/skeletons'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileRes = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  const profile = profileRes.data as unknown as { household_id: string | null } | null
  const householdId = profile?.household_id
  if (!householdId) {
    /* New user whose trigger hasn't run yet — should rarely happen */
    return (
      <main className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-2xl">⏳</p>
        <p className="mt-2 text-sm text-muted-foreground">Menyiapkan akun kamu…</p>
      </main>
    )
  }

  return (
    <main className="pb-6">
      <Suspense fallback={<HeaderSkeleton />}>
        <DashboardHeader />
      </Suspense>

      <Suspense fallback={<SaldoSkeleton />}>
        <SaldoCard householdId={householdId} />
      </Suspense>

      <QuickActions />

      <Suspense fallback={<TransactionsSkeleton />}>
        <RecentTransactions householdId={householdId} />
      </Suspense>

      <Suspense fallback={<GoalsSkeleton />}>
        <GoalsWidget householdId={householdId} />
      </Suspense>

      <Suspense fallback={null}>
        <AmalWidget householdId={householdId} />
      </Suspense>
    </main>
  )
}
