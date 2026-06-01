import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { CategoriesClient } from '@/components/features/settings/CategoriesClient'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileRes = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  const profile = profileRes.data as unknown as { household_id: string | null } | null
  if (!profile?.household_id) redirect('/dashboard')

  return (
    <main>
      <PageHeader title="Kelola Kategori" showBack />
      <CategoriesClient householdId={profile.household_id} />
    </main>
  )
}
