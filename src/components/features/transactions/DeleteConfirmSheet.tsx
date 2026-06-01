'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/hooks/useTransactions'

interface DeleteConfirmSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transactionId: string
  householdId: string
}

export function DeleteConfirmSheet({ open, onOpenChange, transactionId, householdId }: DeleteConfirmSheetProps) {
  const router = useRouter()
  const { loading, deleteTransaction } = useTransactions(householdId)

  async function handleDelete() {
    const ok = await deleteTransaction(transactionId)
    if (ok) {
      onOpenChange(false)
      router.push('/transactions')
      router.refresh()
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Hapus transaksi?</DrawerTitle>
          <DrawerDescription>
            Transaksi ini akan dihapus secara permanen dan tidak dapat dikembalikan.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="pt-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="h-12"
          >
            {loading ? 'Menghapus…' : 'Ya, Hapus'}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12">
            Batal
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
