import { ArrowDownLeft, ArrowUpRight, Sprout } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { currentMonthRange } from '@/lib/utils/date'

interface SaldoCardProps {
  householdId: string
}

export async function SaldoCard({ householdId }: SaldoCardProps) {
  const supabase = await createClient()
  const { start, end } = currentMonthRange()

  const result = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('household_id', householdId)
    .gte('date', start)
    .lte('date', end)

  const rows = result.data as unknown as Array<{ type: string; amount: number }> | null

  let totalIncome = 0
  let totalExpense = 0
  for (const row of rows ?? []) {
    if (row.type === 'income') totalIncome += Number(row.amount)
    else totalExpense += Number(row.amount)
  }
  const saldo = totalIncome - totalExpense

  return (
    <div className="mx-4">
      {/* Gradient-strip credit card — Berkah Green brand card */}
      <div
        className="relative overflow-hidden rounded-3xl p-5 text-white"
        style={{
          background: '#09533B',
          boxShadow: '0 12px 24px -6px rgba(7,131,90,0.35)',
        }}
      >
        {/* Diagonal gradient strip */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(115deg,transparent 30%,rgba(34,185,129,.45) 46%,rgba(14,159,110,.22) 60%,transparent 72%)',
          }}
        />
        {/* Radial glow orb */}
        <div
          className="pointer-events-none absolute"
          style={{
            right: -40, top: -50, width: 180, height: 180,
            borderRadius: '50%',
            background: 'radial-gradient(circle,rgba(79,211,160,.35),transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 text-sm font-bold opacity-90">
            <Sprout className="h-4 w-4" />
            <span>Saldo Bulan Ini</span>
          </div>

          <p className="mt-5 text-[2rem] font-extrabold tabular-nums" style={{ letterSpacing: '-0.02em' }}>
            {saldo < 0 ? '−' : ''}{formatCurrency(Math.abs(saldo))}
          </p>

          <div className="mt-4 flex gap-6">
            <div>
              <p className="flex items-center gap-1 text-[11px] opacity-75">
                <ArrowDownLeft className="h-3 w-3" />Masuk
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums">+{formatCurrency(totalIncome)}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-[11px] opacity-75">
                <ArrowUpRight className="h-3 w-3" />Keluar
              </p>
              <p className="mt-0.5 text-sm font-bold tabular-nums">−{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
