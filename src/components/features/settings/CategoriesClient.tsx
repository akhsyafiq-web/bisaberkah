'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Search, X, Pencil, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Switch } from '@/components/ui/switch'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'
import type { Category, CategoryType } from '@/types/database'

const EMOJI_OPTIONS = ['🍜','🛒','⚡','💧','🚗','🏠','💊','🎓','🎮','✈️','👕','💆','📱','🐕','🎬','💪','🌿','🍕','☕','📚','🚌','💼','💰','💳','🎁','🏥','⛽','📦']

type OriginFilter = 'all' | 'default' | 'custom'

const ORIGIN_FILTERS: { label: string; value: OriginFilter }[] = [
  { label: 'Semua',   value: 'all' },
  { label: 'Default', value: 'default' },
  { label: 'Kustom',  value: 'custom' },
]

function disabledKey(id: string) { return `bb_disabled_cats_${id}` }
function getDisabled(id: string): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(disabledKey(id)) ?? '[]')) }
  catch { return new Set() }
}
function saveDisabled(id: string, ids: Set<string>) {
  localStorage.setItem(disabledKey(id), JSON.stringify([...ids]))
}

interface CategoriesClientProps { householdId: string }

interface EditState {
  cat: Category
  name: string
  emoji: string
  customEmoji: string
}

export function CategoriesClient({ householdId }: CategoriesClientProps) {
  const router = useRouter()
  const [tab, setTab] = useState<CategoryType>('expense')
  const [origin, setOrigin] = useState<OriginFilter>('all')
  const [search, setSearch] = useState('')
  const [cats, setCats] = useState<Category[]>([])
  const [fetching, setFetching] = useState(true)
  const [disabled, setDisabled] = useState<Set<string>>(new Set())

  // Add form state
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('📦')
  const [newCustomEmoji, setNewCustomEmoji] = useState('')
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editState, setEditState] = useState<EditState | null>(null)
  const [editSaving, setEditSaving] = useState(false)

  // Dialog state
  const [toggleTarget, setToggleTarget] = useState<{ cat: Category; willDisable: boolean } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [deleteUsageCount, setDeleteUsageCount] = useState<number | null>(null) // null=checking
  const [deleteChecking, setDeleteChecking] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const householdRef = useRef(householdId)

  useEffect(() => { setDisabled(getDisabled(householdId)) }, [householdId])

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    setSearch('')
    setOrigin('all')
    createClient()
      .from('categories').select('*')
      .eq('household_id', householdRef.current).eq('type', tab)
      .order('is_default', { ascending: false }).order('name')
      .then(res => {
        if (!cancelled) { setCats((res.data as unknown as Category[] | null) ?? []); setFetching(false) }
      })
    return () => { cancelled = true }
  }, [tab])

  // ── Client-side filtering ───────────────────────────────────────────
  const filtered = cats.filter(cat => {
    const matchOrigin = origin === 'all' || (origin === 'default' && cat.is_default) || (origin === 'custom' && !cat.is_default)
    const matchSearch = !search.trim() || cat.name.toLowerCase().includes(search.toLowerCase())
    return matchOrigin && matchSearch
  })
  const defaultCount = cats.filter(c => c.is_default).length
  const customCount  = cats.filter(c => !c.is_default).length

  // ── Toggle enable/disable ──────────────────────────────────────────
  function confirmToggle() {
    if (!toggleTarget) return
    const { cat, willDisable } = toggleTarget
    setDisabled(prev => {
      const next = new Set(prev)
      willDisable ? next.add(cat.id) : next.delete(cat.id)
      saveDisabled(householdId, next)
      return next
    })
    toast.success(willDisable ? `"${cat.name}" dinonaktifkan` : `"${cat.name}" diaktifkan`)
    setToggleTarget(null)
  }

  // ── Delete: check usage first ──────────────────────────────────────
  async function handleDeleteRequest(cat: Category) {
    setDeleteChecking(true)
    setDeleteTarget(cat)
    setDeleteUsageCount(null)
    const res = await createClient()
      .from('transactions')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', cat.id)
    setDeleteUsageCount(res.count ?? 0)
    setDeleteChecking(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    const res = await createClient().from('categories').delete().eq('id', deleteTarget.id)
    setDeleteLoading(false)
    if (res.error) { toast.error('Gagal menghapus kategori'); return }
    setCats(prev => prev.filter(c => c.id !== deleteTarget.id))
    toast.success('Kategori dihapus')
    setDeleteTarget(null)
    setDeleteUsageCount(null)
  }

  // ── Add category ───────────────────────────────────────────────────
  const finalNewEmoji = newCustomEmoji.trim() || newEmoji

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    const res = await (createClient().from('categories') as any).insert({
      household_id: householdId, name: newName.trim(), icon: finalNewEmoji,
      type: tab, is_default: false, color: null,
    }).select('*').single()
    const cat = res.data as unknown as Category | null
    if (cat) {
      setCats(prev => [...prev, cat].sort((a, b) => {
        if (a.is_default !== b.is_default) return a.is_default ? -1 : 1
        return a.name.localeCompare(b.name)
      }))
      setNewName(''); setNewEmoji('📦'); setNewCustomEmoji(''); setAdding(false)
      toast.success('Kategori ditambahkan')
    } else {
      toast.error(res.error?.message ?? 'Gagal menambah kategori')
    }
    setSaving(false)
  }

  // ── Edit category ──────────────────────────────────────────────────
  function openEdit(cat: Category) {
    setEditState({ cat, name: cat.name, emoji: cat.icon, customEmoji: '' })
  }

  const finalEditEmoji = editState ? (editState.customEmoji.trim() || editState.emoji) : ''

  async function handleEditSave() {
    if (!editState || !editState.name.trim()) return
    setEditSaving(true)
    const res = await (createClient().from('categories') as any)
      .update({ name: editState.name.trim(), icon: finalEditEmoji })
      .eq('id', editState.cat.id)
    setEditSaving(false)
    if (res.error) { toast.error('Gagal mengubah kategori'); return }
    setCats(prev => prev.map(c =>
      c.id === editState.cat.id ? { ...c, name: editState.name.trim(), icon: finalEditEmoji } : c
    ))
    toast.success('Kategori diperbarui')
    setEditState(null)
  }

  // Whether delete is blocked by existing transactions
  const deleteBlocked = deleteUsageCount !== null && deleteUsageCount > 0
  const deleteReady   = deleteUsageCount === 0

  return (
    <div className="pb-6">
      {/* Type tabs */}
      <div className="flex gap-2 px-4 py-3">
        {(['expense', 'income'] as CategoryType[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setEditState(null); setAdding(false) }}
            className={cn('flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors',
              tab === t
                ? t === 'expense' ? 'border-[#D92D20] bg-[#FEF3F2] text-[#D92D20]' : 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground'
            )}>
            {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-4 pb-2 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari kategori…"
          className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-9 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-7 top-1/2 -translate-y-1/2 text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Origin filter chips */}
      <div className="flex gap-2 px-4 pb-3">
        {ORIGIN_FILTERS.map(f => {
          const count = f.value === 'default' ? defaultCount : f.value === 'custom' ? customCount : cats.length
          return (
            <button key={f.value} onClick={() => setOrigin(f.value)}
              className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                origin === f.value ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground'
              )}>
              {f.label}
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                origin === f.value ? 'bg-white/20' : 'bg-muted')}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {!fetching && <p className="px-4 pb-2 text-xs text-muted-foreground">{filtered.length} kategori{search ? ' ditemukan' : ''}</p>}

      {/* Category list */}
      <div className="px-4 space-y-2">
        {fetching ? (
          [0,1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="text-2xl">🔍</p>
            <p className="text-sm text-muted-foreground">{search ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori kustom'}</p>
          </div>
        ) : filtered.map(cat => {
          const isOff = disabled.has(cat.id)
          const isEditing = editState?.cat.id === cat.id
          return (
            <div key={cat.id} className="rounded-xl border bg-card overflow-hidden">
              {/* Row */}
              <div className={cn('flex items-center gap-3 px-4 py-3 transition-opacity', isOff && 'opacity-50')}>
                <span className="text-xl shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{cat.name}</p>
                  <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5',
                    cat.is_default ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary')}>
                    {cat.is_default ? 'Default' : 'Kustom'}
                  </span>
                </div>

                <Switch checked={!isOff} onCheckedChange={checked => setToggleTarget({ cat, willDisable: !checked })} />

                {/* Edit — custom only */}
                {!cat.is_default && (
                  <button
                    onClick={() => isEditing ? setEditState(null) : openEdit(cat)}
                    className={cn('shrink-0 transition-colors ml-1', isEditing ? 'text-primary' : 'text-muted-foreground active:text-primary')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                )}

                {/* Delete — custom only */}
                {!cat.is_default && (
                  <button
                    onClick={() => handleDeleteRequest(cat)}
                    disabled={deleteChecking}
                    className="shrink-0 text-muted-foreground transition-colors active:text-destructive ml-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Inline edit form — custom categories */}
              {isEditing && editState && (
                <div className="border-t px-4 pt-3 pb-4 space-y-3 bg-muted/20">
                  {/* Warning */}
                  <div className="flex items-start gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-800">
                      Mengubah nama atau ikon akan mempengaruhi tampilan pada semua transaksi yang menggunakan kategori ini.
                    </p>
                  </div>

                  {/* Emoji grid */}
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} type="button"
                        onClick={() => setEditState(s => s ? { ...s, emoji: e, customEmoji: '' } : s)}
                        className={cn('h-9 w-9 rounded-lg border text-lg transition-colors',
                          finalEditEmoji === e && !editState.customEmoji ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
                        )}>
                        {e}
                      </button>
                    ))}
                  </div>

                  {/* Custom emoji */}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={editState.customEmoji}
                      onChange={e => setEditState(s => s ? { ...s, customEmoji: [...e.target.value].slice(0, 2).join('') } : s)}
                      placeholder="😊"
                      className="h-10 w-14 rounded-md border border-input bg-background text-center text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    {editState.customEmoji && (
                      <button type="button" onClick={() => setEditState(s => s ? { ...s, customEmoji: '' } : s)}
                        className="text-xs text-muted-foreground underline">Reset</button>
                    )}
                    <p className="text-xs text-muted-foreground">Preview: <span className="text-xl">{finalEditEmoji}</span></p>
                  </div>

                  {/* Name input */}
                  <input
                    type="text"
                    value={editState.name}
                    onChange={e => setEditState(s => s ? { ...s, name: e.target.value } : s)}
                    placeholder="Nama kategori"
                    autoFocus
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />

                  <div className="flex gap-2">
                    <button onClick={() => setEditState(null)}
                      className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground">Batal</button>
                    <button onClick={handleEditSave} disabled={editSaving || !editState.name.trim()}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                      {editSaving ? 'Menyimpan…' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add form */}
      {adding ? (
        <div className="mx-4 mt-3 rounded-2xl border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Kategori baru</p>
          <div className="flex flex-wrap gap-1.5">
            {EMOJI_OPTIONS.map(e => (
              <button key={e} type="button" onClick={() => { setNewEmoji(e); setNewCustomEmoji('') }}
                className={cn('h-9 w-9 rounded-lg border text-lg transition-colors',
                  finalNewEmoji === e && !newCustomEmoji ? 'border-primary bg-primary/10' : 'border-border bg-muted/30')}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <input type="text" value={newCustomEmoji}
              onChange={e => setNewCustomEmoji([...e.target.value].slice(0, 2).join(''))}
              placeholder="😊"
              className="h-10 w-14 rounded-md border border-input bg-background text-center text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {newCustomEmoji && <button type="button" onClick={() => setNewCustomEmoji('')} className="text-xs text-muted-foreground underline">Reset</button>}
            <p className="text-xs text-muted-foreground">Preview: <span className="text-xl">{finalNewEmoji}</span></p>
          </div>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Nama kategori" autoFocus
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <button onClick={() => { setAdding(false); setNewName(''); setNewCustomEmoji(''); setNewEmoji('📦') }}
              className="flex-1 rounded-xl border py-2.5 text-sm font-semibold text-muted-foreground">Batal</button>
            <button onClick={handleAdd} disabled={saving || !newName.trim()}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {saving ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </div>
      ) : (
        <div className="px-4 mt-3">
          <button onClick={() => { setAdding(true); setEditState(null) }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary active:bg-muted/40">
            <Plus className="h-4 w-4" /> Tambah Kategori
          </button>
        </div>
      )}

      {disabled.size > 0 && (
        <p className="mt-3 px-4 text-center text-xs text-muted-foreground">
          {disabled.size} kategori dinonaktifkan · tidak muncul saat tambah transaksi
        </p>
      )}

      {/* Toggle confirm */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={open => { if (!open) setToggleTarget(null) }}
        title={toggleTarget?.willDisable ? `Nonaktifkan "${toggleTarget?.cat.name}"?` : `Aktifkan "${toggleTarget?.cat.name}"?`}
        description={toggleTarget?.willDisable ? 'Kategori tidak akan muncul saat menambah transaksi.' : 'Kategori akan kembali muncul saat menambah transaksi.'}
        confirmLabel={toggleTarget?.willDisable ? 'Nonaktifkan' : 'Aktifkan'}
        confirmVariant="default"
        onConfirm={confirmToggle}
        cancelLabel="Batal"
      />

      {/* Delete — BLOCKED: ada transaksi terkait */}
      <AlertDialog
        open={!!deleteTarget && deleteBlocked}
        onOpenChange={open => { if (!open) { setDeleteTarget(null); setDeleteUsageCount(null) } }}
        title={`Kategori "${deleteTarget?.name}" tidak bisa dihapus`}
        description={`Ada ${deleteUsageCount} transaksi yang masih menggunakan kategori ini. Hapus atau pindahkan transaksi tersebut terlebih dahulu.`}
        cancelLabel="Tutup"
      >
        <button
          onClick={() => {
            setDeleteTarget(null)
            setDeleteUsageCount(null)
            router.push(`/transactions`)
          }}
          className="w-full rounded-xl border border-primary py-2.5 text-sm font-semibold text-primary active:bg-primary/5"
        >
          Lihat Transaksi →
        </button>
      </AlertDialog>

      {/* Delete — CLEAR: tidak ada transaksi */}
      <AlertDialog
        open={!!deleteTarget && deleteReady}
        onOpenChange={open => { if (!open) { setDeleteTarget(null); setDeleteUsageCount(null) } }}
        title={`Hapus kategori "${deleteTarget?.name}"?`}
        description="Kategori ini akan dihapus permanen. Tidak ada transaksi yang terpengaruh."
        confirmLabel="Ya, Hapus"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        loading={deleteLoading}
        cancelLabel="Batal"
      />
    </div>
  )
}
