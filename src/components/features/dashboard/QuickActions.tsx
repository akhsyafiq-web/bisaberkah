'use client'

import Link from 'next/link'
import { MinusCircle, PlusCircle, CreditCard, Target } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const actions = [
  {
    href: '/transactions/new?type=expense',
    icon: MinusCircle,
    label: 'Pengeluaran',
    color: 'text-[var(--expense-color)] bg-red-50',
  },
  {
    href: '/transactions/new?type=income',
    icon: PlusCircle,
    label: 'Pemasukan',
    color: 'text-[var(--income-color)] bg-green-50',
  },
  {
    href: '/debts',
    icon: CreditCard,
    label: 'Hutang',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    href: '/goals',
    icon: Target,
    label: 'Goals',
    color: 'text-[var(--amal-color)] bg-purple-50',
  },
]

export function QuickActions() {
  return (
    <div className="mt-4 grid grid-cols-4 gap-2 px-4">
      {actions.map(({ href, icon: Icon, label, color }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 transition-colors active:scale-95"
        >
          <span className={cn('flex h-10 w-10 items-center justify-center rounded-full', color)}>
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
        </Link>
      ))}
    </div>
  )
}
