import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { GoalsList } from '@/components/features/goals/GoalsList'

export default async function GoalsPage() {
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

  return (
    <main>
      <PageHeader
        title="Goals Tabungan 🎯"
        action={
          <Link
            href="/goals/new"
            className="text-sm font-semibold text-primary"
          >
            + Baru
          </Link>
        }
      />
      <GoalsList householdId={householdId} />
    </main>
  )
}
