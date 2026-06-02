'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

interface SummaryCardsProps {
  totalIncome: number
  totalExpense: number
}

export function SummaryCards({ totalIncome, totalExpense }: SummaryCardsProps) {
  const saldo = totalIncome - totalExpense
  const isPositive = saldo >= 0
  const [open, setOpen] = useState(false)

  // Lock body scroll when dialog open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Cards — tap any to open dialog */}
      <div className="grid grid-cols-3 gap-2 px-4">
        {[
          { label: 'Pemasukan',   value: formatCurrency(totalIncome),      color: 'text-income' },
          { label: 'Pengeluaran', value: formatCurrency(totalExpense),      color: 'text-expense' },
          { label: 'Saldo',       value: `${isPositive ? '' : '−'}${formatCurrency(Math.abs(saldo))}`, color: isPositive ? 'text-income' : 'text-expense' },
        ].map(card => (
          <button
            key={card.label}
            onClick={() => setOpen(true)}
            className="min-w-0 rounded-xl border bg-card p-3 shadow-sm text-left transition-colors active:bg-muted/60"
          >
            <p className="text-[10px] text-muted-foreground">{card.label}</p>
            <p className={cn('mt-0.5 text-sm font-bold leading-tight truncate', card.color)}>
              {card.value}
            </p>
          </button>
        ))}
      </div>

      {/* Dialog with overlay */}
      {open && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center px-6"
          style={{ background: 'rgba(12,17,29,0.55)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
          onClick={() => setOpen(false)}
        >
          {/* Card — stop propagation so tapping inside doesn't close */}
          <div
            className="w-full max-w-sm rounded-3xl bg-card shadow-2xl overflow-hidden"
            style={{ boxShadow: '0 20px 40px -8px rgba(12,17,29,0.35)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b">
              <p className="text-base font-bold text-foreground">Ringkasan Keuangan</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tap di luar untuk menutup</p>
            </div>

            {/* Rows */}
            <div className="divide-y">
              <DetailRow
                label="Pemasukan"
                value={formatCurrency(totalIncome)}
                color="#079455"
                emoji="↓"
                bg="#ECFDF3"
              />
              <DetailRow
                label="Pengeluaran"
                value={formatCurrency(totalExpense)}
                color="#101828"
                emoji="↑"
                bg="#F2F4F7"
              />
              <DetailRow
                label="Saldo Bersih"
                value={`${isPositive ? '' : '−'}${formatCurrency(Math.abs(saldo))}`}
                color={isPositive ? '#07835A' : '#D92D20'}
                emoji={isPositive ? '✓' : '!'}
                bg={isPositive ? '#E3FAF0' : '#FEF3F2'}
                bold
              />
            </div>

            {/* Close button */}
            <div className="px-6 py-4">
              <button
                onClick={() => setOpen(false)}
                className="w-full rounded-xl bg-muted py-3 text-sm font-semibold text-foreground transition-colors active:bg-muted/70"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function DetailRow({
  label, value, color, emoji, bg, bold,
}: {
  label: string
  value: string
  color: string
  emoji: string
  bg: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{ background: bg, color }}
      >
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={cn('text-base tabular-nums mt-0.5', bold ? 'font-extrabold' : 'font-semibold')}
          style={{ color, letterSpacing: '-0.01em' }}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
