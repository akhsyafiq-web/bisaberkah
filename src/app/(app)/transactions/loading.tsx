import { Skeleton } from '@/components/ui/skeleton'

export default function TransactionsLoading() {
  return (
    <main>
      <div className="h-14 border-b bg-background" />
      <div className="space-y-1 px-4 pt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </main>
  )
}
