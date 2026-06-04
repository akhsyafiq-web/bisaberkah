'use client'

import { useState } from 'react'
import { GoalsList } from './GoalsList'
import { EnvelopeClient } from '@/components/features/envelope/EnvelopeClient'
import { cn } from '@/lib/utils/cn'

interface RencanaClientProps {
  householdId: string
  userId: string
}

const TABS = [
  { value: 'goals',  label: 'Tujuan' },
  { value: 'budget', label: 'Anggaran' },
] as const

type Tab = 'goals' | 'budget'

export function RencanaClient({ householdId, userId }: RencanaClientProps) {
  const [tab, setTab] = useState<Tab>('goals')

  return (
    <div>
      {/* Tab bar — sticky below PageHeader */}
      <div className="sticky top-14 z-30 flex border-b bg-background">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-colors',
              tab === t.value
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'goals'
        ? <GoalsList householdId={householdId} />
        : <EnvelopeClient householdId={householdId} userId={userId} />
      }
    </div>
  )
}
