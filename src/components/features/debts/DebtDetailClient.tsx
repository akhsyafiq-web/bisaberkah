'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDebts } from '@/hooks/useDebts'
import { PaymentSheet } from './PaymentSheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Debt, DebtPayment } from '@/types/database'

interface DebtDetailClientProps {
  debt: Debt
  householdId: string
}

export function DebtDetailClient({ debt: initialDebt, householdId }: DebtDetailClientProps) {
  const router = useRouter()
  const { getPayments, deleteDebt, loading } = useDebts(householdId)
  const [debt, setDebt] = useState(initialDebt)
  const [payments, setPayments] = useState<DebtPayment[]>([])
  const [fetching, setFetching] = useState(true)
  const [payOpen, setPayOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const paid = Number(debt.paid_amount)
  const total = Number(debt.total_amount)
  const remaining = Math.max(0, total - paid)
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0

  useEffect(() => {
    getPayments(debt.id).then(data => { setPayments(data); setFetching(false) })
  }, [debt.id])

  async function handlePaymentAdded() {
    const updated = await getPayments(debt.id)
    setPayments(updated)
    const newPaid = updated.reduce((s, p) => s + Number(p.amount), 0)
    setDebt(d => ({
      ...d,
      paid_amount: newPaid,
      status: newPaid >= Number(d.total_amount) ? 'paid' : d.status,
    }))
  }

  async function handleDelete() {
    const ok = await deleteDebt(debt.id)
    if (ok) router.push('/debts')
  }

  return (
    <div className="pb-6 space-y-4">
      {/* Hero card */}
      <div className="mx-4 mt-4 rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Status</p>
          <span className={cn(
            'rounded-full px-2.5 py-0.5 text-xs font-semibold',
            debt.status === 'paid' ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#FEF3F2] text-[#B42318]'
          )}>
            {debt.status === 'paid' ? '✓ Lunas' : 'Aktif'}
          </span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Sisa hutang</p>
          <p className="text-3xl font-extrabold tabular-nums text-foreground" style={{ letterSpacing: '-0.02em' }}>
            {debt.status === 'paid' ? 'Lunas ✓' : formatCurrency(remaining)}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>Terbayar {formatCurrency(paid)}</span>
            <span>Total {formatCurrency(total)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: debt.status === 'paid' ? '#079455' : '#07835A' }}
            />
          </div>
          <p className="text-right text-xs font-semibold text-primary">{pct}% terbayar</p>
        </div>

        <div className="divide-y divide-border rounded-xl border">
          {debt.due_date && (
            <div className="flex justify-between px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Jatuh tempo</span>
              <span className="font-medium">{formatDate(debt.due_date)}</span>
            </div>
          )}
          {debt.note && (
            <div className="flex justify-between px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Catatan</span>
              <span className="font-medium text-right max-w-[60%] break-words">{debt.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* Pay button */}
      {debt.status === 'active' && (
        <div className="px-4">
          <Button onClick={() => setPayOpen(true)} className="w-full h-12 text-base font-semibold">
            Catat Pembayaran
          </Button>
        </div>
      )}

      {/* Payment history */}
      <div className="px-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Riwayat Pembayaran</p>
        {fetching ? (
          <Skeleton className="h-16 rounded-xl" />
        ) : payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p>
        ) : (
          <div className="rounded-xl border bg-card divide-y">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold tabular-nums text-income">
                    +{formatCurrency(Number(p.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(p.paid_at)}{p.note ? ` · ${p.note}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="px-4">
        <Button
          variant="outline"
          onClick={() => setDeleteOpen(true)}
          className="w-full h-11 text-destructive border-destructive/30"
        >
          Hapus Catatan Hutang
        </Button>
      </div>

      <PaymentSheet
        open={payOpen}
        onOpenChange={setPayOpen}
        debt={debt}
        householdId={householdId}
        onSuccess={handlePaymentAdded}
      />

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setDeleteOpen(false)}>
          <div className="w-full max-w-[430px] rounded-t-2xl bg-background p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <p className="text-base font-semibold">Hapus catatan hutang?</p>
            <p className="text-sm text-muted-foreground">Semua riwayat pembayaran juga akan dihapus.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="flex-1 h-11">Batal</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading} className="flex-1 h-11">
                {loading ? 'Menghapus…' : 'Hapus'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
