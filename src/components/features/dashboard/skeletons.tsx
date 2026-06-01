import { Skeleton } from '@/components/ui/skeleton'

export function SaldoSkeleton() {
  return (
    <div className="mx-4 rounded-2xl border bg-card p-5 shadow-sm">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-2 h-9 w-48" />
      <div className="mt-4 flex gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div>
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TransactionsSkeleton() {
  return (
    <section className="mt-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function GoalsSkeleton() {
  return (
    <section className="mt-6 px-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card px-4 py-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
            <div className="mt-1.5 flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function HeaderSkeleton() {
  return (
    <div className="px-4 pt-5 pb-2">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-1.5 h-5 w-52" />
    </div>
  )
}
