import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransactionForm } from '@/components/features/transactions/TransactionForm'
import type { Category } from '@/types/database'

export default async function NewTransactionPage() {
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

  const catRes = await supabase
    .from('categories')
    .select('id, household_id, name, type, icon, color, is_default, created_at')
    .eq('household_id', householdId)
    .order('name')

  const categories = (catRes.data as unknown as Category[] | null) ?? []

  return (
    <main>
      <PageHeader title="Tambah Transaksi" showBack />
      <TransactionForm householdId={householdId} userId={user.id} categories={categories} />
    </main>
  )
}
