import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { SettingsSignOut } from '@/components/features/settings/SettingsSignOut'
import { Tag, FileSpreadsheet, HandCoins, Users, ChevronRight } from 'lucide-react'
import type { Profile } from '@/types/database'

const MENU = [
  { href: '/settings/categories', icon: Tag,             label: 'Kelola Kategori',         desc: 'Tambah atau edit kategori transaksi' },
  { href: '/settings/import',     icon: FileSpreadsheet, label: 'Import Data Excel',       desc: 'Impor transaksi dari file .xlsx' },
  { href: '/settings/zakat',      icon: HandCoins,       label: 'Kalkulator Zakat',        desc: 'Hitung zakat maal kamu' },
  { href: '#',                    icon: Users,            label: 'Undang Anggota Keluarga', desc: 'Fitur akan hadir segera', disabled: true },
] as const

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileRes = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const profile = profileRes.data as unknown as Pick<Profile, 'display_name' | 'avatar_url'> | null
  const name = profile?.display_name ?? user.email?.split('@')[0] ?? 'Pengguna'
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <main className="pb-6">
      <PageHeader title="Akun" />

      <div className="mx-4 mt-4 flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ background: '#07835A' }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm divide-y">
        {MENU.map(item => {
          const row = (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <item.icon className="h-4 w-4 text-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          )
          return 'disabled' in item && item.disabled ? (
            <div key={item.label} className="opacity-40">{row}</div>
          ) : (
            <Link key={item.href} href={item.href} className="block transition-colors active:bg-muted/50">
              {row}
            </Link>
          )
        })}
      </div>

      <div className="mx-4 mt-4">
        <SettingsSignOut />
      </div>
    </main>
  )
}
