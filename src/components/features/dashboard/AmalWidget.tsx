import Link from 'next/link'
import { HandCoins } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { currentMonthRange } from '@/lib/utils/date'

interface AmalWidgetProps {
  householdId: string
}

const AMAL_CATEGORIES = ['Sedekah', 'Zakat', 'Infaq', 'Wakaf']

export async function AmalWidget({ householdId }: AmalWidgetProps) {
  const supabase = await createClient()
  const { start, end } = currentMonthRange()

  const catRes = await supabase
    .from('categories')
    .select('id, name')
    .eq('household_id', householdId)
    .in('name', AMAL_CATEGORIES)

  const amalCats = catRes.data as unknown as Array<{ id: string; name: string }> | null
  const categoryIds = (amalCats ?? []).map(c => c.id)

  let totalAmal = 0
  if (categoryIds.length > 0) {
    const txRes = await supabase
      .from('transactions')
      .select('amount')
      .eq('household_id', householdId)
      .eq('type', 'expense')
      .in('category_id', categoryIds)
      .gte('date', start)
      .lte('date', end)

    const rows = txRes.data as unknown as Array<{ amount: number }> | null
    for (const row of rows ?? []) totalAmal += Number(row.amount)
  }

  return (
    <Link href="/transactions?filter=amal" className="mx-4 mt-4 block">
      {/* Barakah Gold card — reserved for zakat / sadaqah per design system */}
      <div
        className="flex items-center gap-4 rounded-2xl border px-4 py-4"
        style={{ background: '#FFF6DB', borderColor: '#FCEBB3' }}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
          <HandCoins className="h-5 w-5" style={{ color: '#B57108' }} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold" style={{ color: '#91560B' }}>
            Zakat &amp; Sedekah Bulan Ini
          </p>
          <p className="text-lg font-extrabold tabular-nums" style={{ color: '#101828', letterSpacing: '-0.01em' }}>
            {formatCurrency(totalAmal)}
          </p>
          <p className="mt-0.5 text-[10px]" style={{ color: '#B57108' }}>
            Semoga berkah 🌿
          </p>
        </div>
      </div>
    </Link>
  )
}
