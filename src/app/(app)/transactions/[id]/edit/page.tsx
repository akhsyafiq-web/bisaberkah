import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransactionForm } from '@/components/features/transactions/TransactionForm'
import type { Category, Transaction } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTransactionPage({ params }: Props) {
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

  const [txRes, catRes] = await Promise.all([
    supabase
      .from('transactions')
      .select('id, type, amount, category_id, date, note, receipt_url, user_id, household_id, created_at, updated_at')
      .eq('id', id)
      .eq('household_id', householdId)
      .single(),
    supabase
      .from('categories')
      .select('id, household_id, name, type, icon, color, is_default, created_at')
      .eq('household_id', householdId)
      .order('name'),
  ])

  const tx = txRes.data as unknown as Transaction | null
  if (!tx) notFound()

  const categories = (catRes.data as unknown as Category[] | null) ?? []

  return (
    <main>
      <PageHeader title="Edit Transaksi" showBack />
      <TransactionForm
        householdId={householdId}
        userId={user.id}
        categories={categories}
        initialValues={tx}
      />
    </main>
  )
}
