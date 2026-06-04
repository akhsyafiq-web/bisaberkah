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
    <header className="px-4 pt-5 pb-4">
      <p className="text-sm text-muted-foreground">{today}</p>
      <h1 className="mt-0.5 text-lg font-semibold leading-tight">
        Assalamu&apos;alaikum, {displayName}! 👋
      </h1>
    </header>
  )
}
