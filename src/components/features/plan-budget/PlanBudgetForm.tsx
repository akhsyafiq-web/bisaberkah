'use client'

import { useState, useEffect } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { usePlanBudget } from '@/hooks/usePlanBudget'
import type { PlanBudgetWithUsage } from '@/types/database'

const COLOR_PALETTE = [
  '#07835A','#079455','#1570EF','#7839EE','#D92D20',
  '#D6900F','#0891B2','#DB2777','#65A30D','#EA580C',
]

interface PlanBudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  userId: string
  bulan: string
  editTarget?: PlanBudgetWithUsage | null
  onSuccess: () => void
}

export function PlanBudgetForm({
  open, onOpenChange, householdId, userId, bulan, editTarget, onSuccess,
}: PlanBudgetFormProps) {
  const { loading, createBudget, updateBudget, deleteBudget } = usePlanBudget(householdId, userId)
  const [nama, setNama] = useState('')
  const [nominal, setNominal] = useState(0)
  const [warna, setWarna] = useState(COLOR_PALETTE[0])
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const isEdit = !!editTarget

  useEffect(() => {
    if (open) {
      setNama(editTarget?.nama ?? '')
      setNominal(editTarget?.nominal_rencana ?? 0)
      setWarna(editTarget?.warna ?? COLOR_PALETTE[0])
    }
  }, [open, editTarget])

  async function handleSave() {
    if (!nama.trim() || nominal <= 0) return
    let ok: boolean | null
    if (isEdit) {
      ok = await updateBudget(editTarget!.id, { nama, nominal_rencana: nominal, warna })
    } else {
      ok = !!(await createBudget({ nama, nominal_rencana: nominal, bulan, warna }))
    }
    if (ok) { onOpenChange(false); onSuccess() }
  }

  async function handleDelete() {
    if (!editTarget) return
    const ok = await deleteBudget(editTarget.id)
    if (ok) { setDeleteConfirm(false); onOpenChange(false); onSuccess() }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{isEdit ? 'Edit Anggaran' : 'Tambah Anggaran'}</DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-4 px-4 pb-2">
            <div className="space-y-1.5">
              <Label>Nama Anggaran</Label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Makan & Minum, Kebutuhan Rumah…"
                autoFocus={!isEdit}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Nominal Rencana</Label>
              <CurrencyInput value={nominal} onChange={setNominal} autoFocus={isEdit} />
            </div>

            <div className="space-y-2">
              <Label>Warna</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setWarna(c)}
                    className="h-8 w-8 rounded-full border-2 transition-transform active:scale-90"
                    style={{
                      background: c,
                      borderColor: warna === c ? '#101828' : 'transparent',
                      transform: warna === c ? 'scale(1.15)' : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter className="pt-2">
            <Button
              onClick={handleSave}
              disabled={loading || !nama.trim() || nominal <= 0}
              className="h-12"
            >
              {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Anggaran'}
            </Button>
            {isEdit && (
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(true)}
                disabled={loading}
                className="h-11 text-destructive border-destructive/30"
              >
                Hapus Anggaran
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Batal</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={deleteConfirm}
        onOpenChange={setDeleteConfirm}
        title={`Hapus anggaran "${editTarget?.nama}"?`}
        description="Anggaran dan semua tautan transaksinya akan dihapus. Transaksi itu sendiri tidak terpengaruh."
        confirmLabel="Ya, Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
