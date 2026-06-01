import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { TransactionDetailActions } from '@/components/features/transactions/TransactionDetailActions'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDayDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { Transaction } from '@/types/database'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TransactionDetailPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profileRes = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  const profile = profileRes.data as unknown as { household_id: string | null } | null
  const householdId = profile?.household_id
  if (!householdId) redirect('/dashboard')

  const txRes = await supabase
    .from('transactions')
    .select('id, type, amount, category_id, date, note, receipt_url, user_id, household_id, created_at, updated_at, categories(name, icon, color)')
    .eq('id', id)
    .eq('household_id', householdId)
    .single()

  const tx = txRes.data as unknown as Transaction | null
  if (!tx) notFound()

  const isIncome = tx.type === 'income'

  return (
    <main>
      <PageHeader title="Detail Transaksi" showBack />

      <div className="px-4 pt-4 space-y-4">
        {/* Amount hero */}
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
          <span className="text-4xl">{tx.categories?.icon ?? '💸'}</span>
          <p className="mt-3 text-xs text-muted-foreground">
            {tx.categories?.name ?? 'Transaksi'}
          </p>
          <p className={cn(
            'mt-1 text-3xl font-bold',
            isIncome ? 'text-income' : 'text-expense'
          )}>
            {isIncome ? '+' : '−'}{formatCurrency(tx.amount)}
          </p>
          <span className={cn(
            'mt-2 inline-block rounded-full px-3 py-0.5 text-xs font-medium',
            isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
          </span>
        </div>

        {/* Details */}
        <div className="rounded-xl border bg-card divide-y">
          <DetailRow label="Tanggal" value={formatDayDate(tx.date)} />
          {tx.note && <DetailRow label="Catatan" value={tx.note} />}
        </div>
      </div>

      <TransactionDetailActions transactionId={tx.id} householdId={householdId} />
    </main>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}
