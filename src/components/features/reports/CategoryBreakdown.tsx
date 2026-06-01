'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { CategoryStat } from '@/hooks/useReports'

const PALETTE = [
  '#16A34A', '#DC2626', '#7C3AED', '#2563EB', '#D97706',
  '#DB2777', '#0891B2', '#65A30D', '#EA580C', '#6366F1',
]

interface CategoryBreakdownProps {
  categories: CategoryStat[]
  totalExpense: number
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CategoryStat
  return (
    <div className="rounded-xl border bg-card px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-medium">{d.icon} {d.name}</p>
      <p className="text-muted-foreground">{formatCurrency(d.total)} ({d.percentage}%)</p>
    </div>
  )
}

export function CategoryBreakdown({ categories, totalExpense }: CategoryBreakdownProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (categories.length === 0) {
    return (
      <div className="px-4">
        <p className="mb-2 text-sm font-semibold text-foreground">Pengeluaran per Kategori</p>
        <p className="text-sm text-muted-foreground">Belum ada pengeluaran</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4">
      <p className="text-sm font-semibold text-foreground">Pengeluaran per Kategori</p>

      {/* Donut Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={categories}
            dataKey="total"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            onClick={(_, idx) => setActiveIdx(idx === activeIdx ? null : idx)}
          >
            {categories.map((entry, i) => (
              <Cell
                key={entry.category_id}
                fill={PALETTE[i % PALETTE.length]}
                opacity={activeIdx === null || activeIdx === i ? 1 : 0.4}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat, i) => {
          const color = PALETTE[i % PALETTE.length]
          const pct = cat.percentage
          const barColor = pct >= 50 ? '#DC2626' : pct >= 30 ? '#D97706' : '#16A34A'

          return (
            <div key={cat.category_id} className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="flex-1 text-xs font-medium text-foreground">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{pct}%</span>
                <span className="text-xs font-semibold text-foreground tabular-nums">
                  {formatCurrency(cat.total)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: barColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
