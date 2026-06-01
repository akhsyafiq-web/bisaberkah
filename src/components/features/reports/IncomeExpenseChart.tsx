'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatCompact } from '@/lib/utils/currency'
import type { DailyBar } from '@/hooks/useReports'

interface IncomeExpenseChartProps {
  bars: DailyBar[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border bg-card px-3 py-2 shadow-md text-xs space-y-1">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}: {formatCompact(p.value)}
        </p>
      ))}
    </div>
  )
}

export function IncomeExpenseChart({ bars }: IncomeExpenseChartProps) {
  if (bars.length === 0) {
    return (
      <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
        Tidak ada data
      </div>
    )
  }

  const showLabel = bars.length <= 14

  return (
    <div className="px-4">
      <p className="mb-2 text-sm font-semibold text-foreground">Pemasukan vs Pengeluaran</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={bars} barSize={bars.length > 20 ? 4 : 8} barCategoryGap="30%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval={showLabel ? 0 : Math.ceil(bars.length / 7)}
          />
          <YAxis
            tickFormatter={v => formatCompact(v)}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', radius: 4 }} />
          <Bar dataKey="income" fill="#16A34A" radius={[3, 3, 0, 0]} name="income" />
          <Bar dataKey="expense" fill="#DC2626" radius={[3, 3, 0, 0]} name="expense" />
          <Legend
            formatter={v => (
              <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))' }}>
                {v === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
            )}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
