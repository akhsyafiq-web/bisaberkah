import { Skeleton } from '@/components/ui/skeleton'

export default function GoalsLoading() {
  return (
    <main>
      <div className="h-14 border-b bg-background" />
      <div className="space-y-3 px-4 pt-4">
        {[0,1,2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
    </main>
  )
}
