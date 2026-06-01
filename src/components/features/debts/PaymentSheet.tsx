'use client'

import { useState } from 'react'
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { useDebts } from '@/hooks/useDebts'
import { formatCurrency } from '@/lib/utils/currency'
import type { Debt } from '@/types/database'

interface PaymentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  debt: Debt
  householdId: string
  onSuccess: () => void
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PaymentSheet({ open, onOpenChange, debt, householdId, onSuccess }: PaymentSheetProps) {
  const { loading, addPayment } = useDebts(householdId)
  const [amount, setAmount] = useState(0)
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')

  const remaining = Math.max(0, Number(debt.total_amount) - Number(debt.paid_amount))

  async function handleSave() {
    if (amount <= 0) return
    const ok = await addPayment(debt.id, amount, date, note || undefined)
    if (ok) {
      setAmount(0); setNote(''); setDate(todayISO())
      onOpenChange(false)
      onSuccess()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bayar Hutang</DrawerTitle>
          <p className="text-sm text-muted-foreground">{debt.creditor_name}</p>
        </DrawerHeader>

        <div className="flex flex-col gap-4 px-4 pb-2">
          <div className="flex justify-between rounded-xl bg-muted/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Sisa hutang</span>
            <span className="font-bold tabular-nums text-foreground">{formatCurrency(remaining)}</span>
          </div>

          <div className="space-y-1.5">
            <Label>Nominal pembayaran</Label>
            <CurrencyInput value={amount} onChange={setAmount} autoFocus />
          </div>

          <div className="space-y-1.5">
            <Label>Tanggal bayar</Label>
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
              placeholder="Transfer BCA, tunai, dll…"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <Button onClick={handleSave} disabled={loading || amount <= 0} className="h-12">
            {loading ? 'Menyimpan…' : 'Catat Pembayaran'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11">Batal</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
