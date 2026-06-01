'use client'

import { useState } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { useDebts } from '@/hooks/useDebts'

interface DebtFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  householdId: string
  onSuccess: () => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function DebtForm({ open, onOpenChange, householdId, onSuccess }: DebtFormProps) {
  const { loading, createDebt } = useDebts(householdId)
  const [creditor, setCreditor] = useState('')
  const [amount, setAmount] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')

  async function handleSave() {
    if (!creditor.trim() || amount <= 0) return
    const ok = await createDebt({
      creditor_name: creditor.trim(),
      total_amount: amount,
      due_date: dueDate || undefined,
      note: note || undefined,
    })
    if (ok) {
      setCreditor(''); setAmount(0); setDueDate(''); setNote('')
      onOpenChange(false)
      onSuccess()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Catat Hutang</DrawerTitle>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-2">
          <div className="space-y-1.5">
            <Label>Kepada siapa / dari mana</Label>
            <input
              type="text"
              value={creditor}
              onChange={e => setCreditor(e.target.value)}
              placeholder="Nama orang / institusi"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Total hutang</Label>
            <CurrencyInput value={amount} onChange={setAmount} />
          </div>

          <div className="space-y-1.5">
            <Label>Jatuh tempo <span className="text-muted-foreground">(opsional)</span></Label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Catatan <span className="text-muted-foreground">(opsional)</span></Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Bank, nomor rekening, dll…"
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleSave} disabled={loading || !creditor.trim() || amount <= 0} className="h-12">
            {loading ? 'Menyimpan…' : 'Catat Hutang'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Batal</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
