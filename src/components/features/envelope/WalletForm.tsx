'use client'

import { useState, useEffect } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { useEnvelope } from '@/hooks/useEnvelope'
import type { WalletWithMeta } from '@/types/database'

interface WalletFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  userId: string
  bulan: string
  editTarget?: WalletWithMeta | null
  onSuccess: () => void
  onRequestDelete?: (w: WalletWithMeta) => void
}

export function WalletForm({
  open, onOpenChange, householdId, userId, bulan, editTarget, onSuccess, onRequestDelete,
}: WalletFormProps) {
  const { loading, createTemplate, updateTemplate } = useEnvelope(householdId, userId)
  const [nama, setNama] = useState('')
  const [rencana, setRencana] = useState(0)
  const isEdit = !!editTarget

  useEffect(() => {
    if (open) {
      setNama(editTarget?.nama ?? '')
      setRencana(editTarget?.nominal_rencana ?? 0)
    }
  }, [open, editTarget])

  async function handleSave() {
    if (!nama.trim() || rencana <= 0) return
    const ok = isEdit
      ? await updateTemplate(editTarget!.template_id, nama, rencana)
      : await createTemplate(nama, rencana, bulan)
    if (ok) { onOpenChange(false); onSuccess() }
  }

  function handleDeleteClick() {
    if (!editTarget) return
    onOpenChange(false)
    onRequestDelete?.(editTarget)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Edit Dompet' : 'Tambah Dompet Anggaran'}</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-2">
          <div className="space-y-1.5">
            <Label>Nama Dompet</Label>
            <input
              type="text"
              value={nama}
              onChange={e => setNama(e.target.value)}
              placeholder="Contoh: Makan, Listrik, Transportasi…"
              autoFocus={!isEdit}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Rencana Alokasi per Bulan</Label>
            <CurrencyInput value={rencana} onChange={setRencana} autoFocus={isEdit} />
            <p className="text-xs text-muted-foreground">
              Ini target alokasi bulanan, bukan saldo. Saldo terisi saat kamu memilah pemasukan.
            </p>
          </div>

          {isEdit && (
            <p className="rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2.5 text-xs text-yellow-800">
              Perubahan rencana hanya berlaku mulai bulan depan. Saldo bulan ini tidak berubah.
            </p>
          )}
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleSave} disabled={loading || !nama.trim() || rencana <= 0} className="h-12">
            {loading ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Buat Dompet'}
          </Button>
          {isEdit && (
            <Button variant="outline" onClick={handleDeleteClick} disabled={loading}
              className="h-11 text-destructive border-destructive/30">
              Hapus Dompet
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Batal</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
