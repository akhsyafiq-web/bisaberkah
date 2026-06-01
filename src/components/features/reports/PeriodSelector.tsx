'use client'

import { cn } from '@/lib/utils/cn'
import type { PeriodType } from '@/hooks/useReports'

interface PeriodSelectorProps {
  active: PeriodType
  onChange: (type: PeriodType) => void
  customStart?: string
  customEnd?: string
  onCustomChange?: (start: string, end: string) => void
}

const TABS: { label: string; value: PeriodType }[] = [
  { label: 'Harian', value: 'daily' },
  { label: 'Mingguan', value: 'weekly' },
  { label: 'Bulanan', value: 'monthly' },
  { label: 'Tahunan', value: 'yearly' },
  { label: 'Custom', value: 'custom' },
]

export function PeriodSelector({ active, onChange, customStart, customEnd, onCustomChange }: PeriodSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto px-4 py-1 no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
              active === tab.value
                ? 'border-green-600 bg-green-50 text-green-700'
                : 'border-border bg-background text-muted-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'custom' && onCustomChange && (
        <div className="flex items-center gap-2 px-4">
          <input
            type="date"
            value={customStart ?? ''}
            onChange={e => onCustomChange(e.target.value, customEnd ?? '')}
            className="flex h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className="text-xs text-muted-foreground">s/d</span>
          <input
            type="date"
            value={customEnd ?? ''}
            onChange={e => onCustomChange(customStart ?? '', e.target.value)}
            className="flex h-9 flex-1 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  )
}
