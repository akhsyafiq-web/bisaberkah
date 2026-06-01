'use client'

import { useEffect, useState, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import type { Category, CategoryType } from '@/types/database'

const EMOJI_OPTIONS = ['🍜','🛒','⚡','💧','🚗','🏠','💊','🎓','🎮','✈️','👕','💆','📱','🐕','🎬','💪','🌿','🍕','☕','📚','🚌','💼','💰','💳','🎁','🏥','⛽','📦']

interface CategoriesClientProps { householdId: string }

export function CategoriesClient({ householdId }: CategoriesClientProps) {
  const [tab, setTab] = useState<CategoryType>('expense')
  const [cats, setCats] = useState<Category[]>([])
  const [fetching, setFetching] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📦')
  const [saving, setSaving] = useState(false)

  const householdRef = useRef(householdId)

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    const supabase = createClient()
    supabase
      .from('categories')
      .select('*')
      .eq('household_id', householdRef.current)
      .eq('type', tab)
      .order('is_default', { ascending: false })
      .order('name')
      .then(res => {
        if (!cancelled) {
          setCats((res.data as unknown as Category[] | null) ?? [])
          setFetching(false)
        }
      })
    return () => { cancelled = true }
  }, [tab])

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const res = await (supabase.from('categories') as any).insert({
      household_id: householdId,
      name: newName.trim(),
      icon: newEmoji,
      type: tab,
      is_default: false,
      color: null,
    }).select('*').single()

    const cat = res.data as unknown as Category | null
    if (cat) {
      setCats(prev => [...prev, cat])
      setNewName(''); setNewEmoji('📦'); setAdding(false)
      toast.success('Kategori ditambahkan')
    } else {
      toast.error(res.error?.message ?? 'Gagal menambah kategori')
    }
    setSaving(false)
  }

  async function handleDelete(cat: Category) {
    const supabase = createClient()
    const res = await supabase.from('categories').delete().eq('id', cat.id)
    if (res.error) { toast.error('Gagal menghapus kategori'); return }
    setCats(prev => prev.filter(c => c.id !== cat.id))
    toast.success('Kategori dihapus')
  }

  return (
    <div className="pb-6">
      {/* Tab */}
      <div className="flex gap-2 px-4 py-3">
        {(['expense','income'] as CategoryType[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors',
              tab === t ? (t === 'expense' ? 'border-[#D92D20] bg-[#FEF3F2] text-[#D92D20]' : 'border-primary bg-primary/10 text-primary')
                       : 'border-border bg-background text-muted-foreground'
            )}
          >
            {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 space-y-2">
        {fetching ? (
          [0,1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)
        ) : cats.map(cat => (
          <div key={cat.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
            <span className="text-xl">{cat.icon}</span>
            <p className="flex-1 text-sm font-medium text-foreground">{cat.name}</p>
            {cat.is_default ? (
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border">Default</span>
            ) : (
              <button onClick={() => handleDelete(cat)} className="text-muted-foreground transition-colors hover:text-destructive active:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding ? (
        <div className="mx-4 mt-3 rounded-2xl border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Kategori baru</p>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" onClick={() => setNewEmoji(e)}
                className={cn('h-9 w-9 rounded-lg border text-lg transition-colors',
                  newEmoji === e ? 'border-primary bg-primary/10' : 'border-border bg-muted/30')}>
                {e}
              </button>
            ))}
          </div>
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Nama kategori" autoFocus
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <button onClick={() => setAdding(false)} className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground">Batal</button>
            <button onClick={handleAdd} disabled={saving || !newName.trim()}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 mt-3">
          <button onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary active:bg-muted/40">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </button>
        </div>
      )}
    </div>
  )
}
