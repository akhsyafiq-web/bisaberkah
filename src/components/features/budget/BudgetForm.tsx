'use client'

import { useState, useEffect } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { useBudgets, type BudgetWithActual } from '@/hooks/useBudgets'
import { cn } from '@/lib/utils/cn'
import type { Category } from '@/types/database'

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  year: number
  month: number
  editTarget?: BudgetWithActual | null
  onSuccess: () => void
}

function monthRange(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { start, end }
}

export function BudgetForm({ open, onOpenChange, householdId, year, month, editTarget, onSuccess }: BudgetFormProps) {
  const { loading, createBudget, updateBudget, deleteBudget, getExpenseCategories } = useBudgets(householdId)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCat, setSelectedCat] = useState('')
  const [amount, setAmount] = useState(0)
  const isEdit = !!editTarget

  useEffect(() => {
    if (open) {
      getExpenseCategories().then(setCategories)
      if (editTarget) {
        setSelectedCat(editTarget.category_id)
        setAmount(editTarget.amount)
      } else {
        setSelectedCat('')
        setAmount(0)
      }
    }
  }, [open, editTarget])

  async function handleSave() {
    if (!isEdit && (!selectedCat || amount <= 0)) return
    if (isEdit && amount <= 0) return

    let ok: boolean
    if (isEdit) {
      ok = await updateBudget(editTarget!.id, amount)
    } else {
      const { start, end } = monthRange(year, month)
      ok = await createBudget({ category_id: selectedCat, amount, period_start: start, period_end: end })
    }
    if (ok) { onOpenChange(false); onSuccess() }
  }

  async function handleDelete() {
    if (!editTarget) return
    const ok = await deleteBudget(editTarget.id)
    if (ok) { onOpenChange(false); onSuccess() }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Edit Anggaran' : 'Tambah Anggaran'}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-2">
          {!isEdit && (
            <div className="space-y-2">
              <Label>Kategori</Label>
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCat(cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-xl border p-2 transition-colors',
                      selectedCat === cat.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-muted/30'
                    )}
                  >
                    <span className="text-2xl leading-none">{cat.icon}</span>
                    <span className="text-[10px] text-center leading-tight line-clamp-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEdit && (
            <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-4 py-3">
              <span className="text-2xl">
                {(Array.isArray(editTarget?.categories) ? editTarget?.categories[0] : editTarget?.categories)?.icon ?? '📦'}
              </span>
              <p className="font-semibold">
                {(Array.isArray(editTarget?.categories) ? editTarget?.categories[0] : editTarget?.categories)?.name ?? 'Kategori'}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Nominal Anggaran</Label>
            <CurrencyInput value={amount} onChange={setAmount} autoFocus={isEdit} />
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button
            onClick={handleSave}
            disabled={loading || (!isEdit && (!selectedCat || amount <= 0)) || (isEdit && amount <= 0)}
            className="h-12"
          >
            {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Anggaran'}
          </Button>
          {isEdit && (
            <Button variant="outline" onClick={handleDelete} disabled={loading} className="h-11 text-destructive border-destructive/30">
              Hapus Anggaran
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Batal</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
