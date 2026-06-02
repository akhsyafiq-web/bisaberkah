import { Skeleton } from '@/components/ui/skeleton'

export default function ReportsLoading() {
  return (
    <main>
      <div className="h-14 border-b bg-background" />
      <div className="space-y-4 px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          {[0,1,2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </main>
  )
}
