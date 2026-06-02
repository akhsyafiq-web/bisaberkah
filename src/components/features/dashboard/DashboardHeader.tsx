import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDayDate } from '@/lib/utils/date'
import type { Profile } from '@/types/database'

export async function DashboardHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName = 'Sahabat'
  if (user) {
    const res = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    const profile = res.data as unknown as Pick<Profile, 'display_name'> | null
    if (profile?.display_name) displayName = profile.display_name.split(' ')[0]
  }

  const today = formatDayDate(new Date().toISOString().slice(0, 10))

  return (
    <header className="flex items-start justify-between px-4 pt-5 pb-4">
      <div>
        <p className="text-sm text-muted-foreground">{today}</p>
        <h1 className="mt-0.5 text-lg font-semibold leading-tight">
          Assalamu&apos;alaikum, {displayName}! 👋
        </h1>
      </div>
      <button
        className="mt-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-95"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
      </button>
    </header>
  )
}
