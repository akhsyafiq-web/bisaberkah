import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ImportClient } from '@/components/features/settings/ImportClient'
import type { Category } from '@/types/database'

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileRes = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  const profile = profileRes.data as unknown as { household_id: string | null } | null
  if (!profile?.household_id) redirect('/dashboard')

  const catRes = await supabase
    .from('categories')
    .select('id, household_id, name, type, icon, color, is_default, created_at')
    .eq('household_id', profile.household_id)
    .order('name')

  const categories = (catRes.data as unknown as Category[] | null) ?? []

  return (
    <main>
      <PageHeader title="Import Data Excel" showBack />
      <div className="pt-4">
        <ImportClient
          householdId={profile.household_id}
          userId={user.id}
          categories={categories}
        />
      </div>
    </main>
  )
}
