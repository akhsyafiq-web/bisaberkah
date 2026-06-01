'use client'

import { useState } from 'react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { useGoals } from '@/hooks/useGoals'

interface AddSavingSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goalId: string
  goalName: string
  householdId: string
  onSuccess?: () => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function AddSavingSheet({ open, onOpenChange, goalId, goalName, householdId, onSuccess }: AddSavingSheetProps) {
  const { loading, addSaving } = useGoals(householdId)
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  async function handleSave() {
    if (amount <= 0) return
    const ok = await addSaving(goalId, amount, date, note)
    if (ok) {
      setAmount(0)
      setNote('')
      setDate(todayISO())
      onOpenChange(false)
      onSuccess?.()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Tambah Tabungan</DrawerTitle>
          <p className="text-sm text-muted-foreground">{goalName}</p>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-2">
          <div className="space-y-1.5">
            <Label>Nominal</Label>
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>Tanggal</Label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Catatan <span className="text-muted-foreground">(opsional)</span></Label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Catatan…"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleSave} disabled={loading || amount <= 0} className="h-12">
            {loading ? 'Menyimpan…' : 'Simpan Tabungan'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12">
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
