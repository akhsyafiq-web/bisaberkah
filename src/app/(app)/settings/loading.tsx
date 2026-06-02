import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
  return (
    <main className="pb-6">
      <div className="h-14 border-b bg-background" />
      <div className="mx-4 mt-4 space-y-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-14 rounded-2xl" />
      </div>
    </main>
  )
}
