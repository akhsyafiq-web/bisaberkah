'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { DeleteConfirmSheet } from './DeleteConfirmSheet'

interface TransactionDetailActionsProps {
  transactionId: string
  householdId: string
}

export function TransactionDetailActions({ transactionId, householdId }: TransactionDetailActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <div className="flex gap-2 px-4 pb-6 pt-2">
        <Link
          href={`/transactions/${transactionId}/edit`}
          className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 h-11')}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </Link>
        <Button
          variant="destructive"
          className="flex-1 h-11"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
      </div>

      <DeleteConfirmSheet
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        transactionId={transactionId}
        householdId={householdId}
      />
    </>
  )
}
