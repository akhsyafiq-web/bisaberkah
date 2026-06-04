import Link from 'next/link'
import { Wallet, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import type { BudgetWallet } from '@/types/database'

interface EnvelopeSummaryWidgetProps {
  householdId: string
}

function currentMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export async function EnvelopeSummaryWidget({ householdId }: EnvelopeSummaryWidgetProps) {
  const supabase = await createClient()
  const bulan = currentMonthStr()

  // Read-only — jangan trigger setup di server render
  const res = await supabase
    .from('budget_wallets')
    .select('id, saldo, nominal_rencana, budget_templates(nama, is_system)')
    .eq('household_id', householdId)
    .eq('bulan', bulan)

  // Tabel belum di-migrate atau belum ada dompet → jangan tampilkan apa-apa
  if (res.error) return null
  const rows = (res.data as unknown as Array<
    Pick<BudgetWallet, 'id' | 'saldo' | 'nominal_rencana'> & {
      budget_templates: { nama: string; is_system: boolean } | null
    }
  > | null) ?? []

  if (rows.length === 0) return null

  const totalSaldo = rows.reduce((s, r) => s + Number(r.saldo), 0)
  const systemSaldo = rows.find(r => r.budget_templates?.is_system)?.saldo ?? 0

  // Dompet user paling mepet (saldo terkecil relatif rencana, bukan sistem)
  const userWallets = rows.filter(r => !r.budget_templates?.is_system && Number(r.nominal_rencana) > 0)
  const mepet = userWallets
    .slice()
    .sort((a, b) => Number(a.saldo) - Number(b.saldo))[0]

  return (
    <Link href="/budget" className="mx-4 mt-4 block">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </span>
            <p className="text-sm font-semibold text-foreground">Dompet Anggaran</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground">Total saldo semua dompet</p>
            <p className="text-lg font-extrabold tabular-nums text-foreground">{formatCurrency(totalSaldo)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Tidak dianggarkan</p>
            <p className="text-sm font-semibold tabular-nums text-muted-foreground">{formatCurrency(Number(systemSaldo))}</p>
          </div>
        </div>

        {mepet && mepet.budget_templates && (
          <p className="mt-2 rounded-lg bg-[#FFFAEB] px-2.5 py-1.5 text-[11px] text-[#B54708]">
            Paling mepet: <strong>{mepet.budget_templates.nama}</strong> — sisa {formatCurrency(Number(mepet.saldo))}
          </p>
        )}
      </div>
    </Link>
  )
}
