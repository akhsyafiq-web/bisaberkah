import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { DebtDetailClient } from '@/components/features/debts/DebtDetailClient'
import type { Debt } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function DebtDetailPage({ params }: Props) {
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

  const debtRes = await supabase
    .from('debts')
    .select('*')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  const debt = debtRes.data as unknown as Debt | null
  if (!debt) notFound()

  return (
    <main>
      <PageHeader title={debt.creditor_name} showBack />
      <DebtDetailClient debt={debt} householdId={householdId} />
    </main>
  )
}
