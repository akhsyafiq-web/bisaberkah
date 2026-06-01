import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { GoalDetailClient } from '@/components/features/goals/GoalDetailClient'
import type { Goal } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params

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
  if (!householdId) redirect('/dashboard')

  const goalRes = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  const goal = goalRes.data as unknown as Goal | null
  if (!goal) notFound()

  const emoji = goal.note?.startsWith('emoji:') ? goal.note.slice(6).split(' ')[0] : '🎯'

  return (
    <main>
      <PageHeader title={goal.name} showBack />
      <GoalDetailClient goal={goal} householdId={householdId} emoji={emoji} />
    </main>
  )
}
