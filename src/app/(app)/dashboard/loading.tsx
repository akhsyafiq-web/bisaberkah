import { HeaderSkeleton, SaldoSkeleton, TransactionsSkeleton, GoalsSkeleton } from '@/components/features/dashboard/skeletons'

export default function DashboardLoading() {
  return (
    <main className="pb-6">
      <HeaderSkeleton />
      <SaldoSkeleton />
      <div className="mt-6 flex gap-3 px-4">
        {[0,1,2,3].map(i => <div key={i} className="h-16 flex-1 rounded-2xl bg-muted animate-pulse" />)}
      </div>
      <TransactionsSkeleton />
      <GoalsSkeleton />
    </main>
  )
}
