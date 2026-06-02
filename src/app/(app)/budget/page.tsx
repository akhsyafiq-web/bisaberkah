import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlanBudgetClient } from '@/components/features/plan-budget/PlanBudgetClient'

export default async function BudgetPage() {
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
      <PageHeader title="Anggaran Bulanan" />
      <PlanBudgetClient householdId={householdId} userId={user.id} />
    </main>
  )
}
