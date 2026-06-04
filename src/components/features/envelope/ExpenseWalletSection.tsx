'use client'

import { useEffect, useRef, useState } from 'react'
import { useEnvelope, type SpendPick } from '@/hooks/useEnvelope'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { WalletWithMeta } from '@/types/database'

interface RowState { selected: boolean; nominal: number }

interface ExpenseWalletSectionProps {
  householdId: string
  userId: string
  bulan: string
  totalAmount: number
  onChange: (picks: SpendPick[]) => void
}

export function ExpenseWalletSection({
  householdId, userId, bulan, totalAmount, onChange,
}: ExpenseWalletSectionProps) {
  const { getWallets } = useEnvelope(householdId, userId)
  const [wallets, setWallets] = useState<WalletWithMeta[]>([])
  const [rows, setRows] = useState<Record<string, RowState>>({})
  const [loading, setLoading] = useState(true)
  const getWalletsRef = useRef(getWallets)
  getWalletsRef.current = getWallets
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    let cancelled = false
    getWalletsRef.current(bulan).then(all => {
      if (cancelled) return
      setWallets(all)
      // Default: ambil dari system wallet sebesar min(total, saldo)
      const sys = all.find(w => w.is_system)
      const init: Record<string, RowState> = {}
      all.forEach(w => { init[w.id] = { selected: false, nominal: 0 } })
      if (sys) init[sys.id] = { selected: true, nominal: Math.min(totalAmount, sys.saldo) }
      setRows(init)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [bulan])

  const covered = Object.values(rows).reduce((s, r) => s + (r.selected ? r.nominal : 0), 0)
  const shortfall = Math.max(0, totalAmount - covered)

  useEffect(() => {
    const picks: SpendPick[] = Object.entries(rows)
      .filter(([, r]) => r.selected && r.nominal > 0)
      .map(([walletId, r]) => ({ walletId, nominal: r.nominal }))
    onChangeRef.current(picks)
  }, [rows])

  function toggle(w: WalletWithMeta) {
    setRows(prev => {
      const cur = prev[w.id]
      if (cur.selected) {
        return { ...prev, [w.id]: { selected: false, nominal: 0 } }
      }
      // Saat dipilih: isi otomatis sebesar min(sisa kekurangan, saldo)
      const coveredOther = Object.entries(prev)
        .filter(([id]) => id !== w.id)
        .reduce((s, [, r]) => s + (r.selected ? r.nominal : 0), 0)
      const need = Math.max(0, totalAmount - coveredOther)
      return { ...prev, [w.id]: { selected: true, nominal: Math.min(need, w.saldo) } }
    })
  }

  function setNominal(w: WalletWithMeta, val: number) {
    setRows(prev => ({ ...prev, [w.id]: { selected: true, nominal: Math.min(val, w.saldo) } }))
  }

  if (loading) return <p className="text-xs text-muted-foreground">Memuat dompet…</p>

  return (
    <div className="space-y-2.5">
      {wallets.map(w => {
        const row = rows[w.id] ?? { selected: false, nominal: 0 }
        const habis = w.saldo <= 0
        return (
          <div key={w.id} className={cn(
            'rounded-xl border p-3 transition-colors',
            row.selected ? 'border-primary bg-primary/5' : 'border-border bg-card',
            habis && !row.selected && 'opacity-50'
          )}>
            <button
              type="button"
              onClick={() => toggle(w)}
              disabled={habis}
              className="flex w-full items-center gap-3 text-left disabled:cursor-not-allowed"
            >
              <span className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                row.selected ? 'border-primary bg-primary' : 'border-border'
              )}>
                {row.selected && <span className="text-[10px] font-bold text-primary-foreground">✓</span>}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {w.is_system ? '📂 ' : ''}{w.nama}
                </p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  Saldo {formatCurrency(w.saldo)}{habis ? ' · habis' : ''}
                </p>
              </div>
              {row.selected && (
                <span className="shrink-0 text-sm font-bold tabular-nums text-expense">
                  −{formatCurrency(row.nominal)}
                </span>
              )}
            </button>

            {row.selected && (
              <div className="mt-2">
                <CurrencyInput value={row.nominal} onChange={v => setNominal(w, v)} />
                <p className="mt-1 text-[10px] text-muted-foreground">Maksimal {formatCurrency(w.saldo)}</p>
              </div>
            )}
          </div>
        )
      })}

      {/* Running total + overflow warning */}
      <div className="rounded-xl bg-muted/40 px-3 py-2.5 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Terpenuhi dari dompet</span>
          <span className="font-semibold tabular-nums">{formatCurrency(covered)} dari {formatCurrency(totalAmount)}</span>
        </div>
        {shortfall > 0 && (
          <p className="text-[11px] font-semibold text-[#B54708]">
            ⚠️ Kekurangan {formatCurrency(shortfall)} tidak tertutup dompet manapun. Pengeluaran tetap dicatat &amp; saldo akun utama berkurang.
          </p>
        )}
        {shortfall === 0 && covered > 0 && (
          <p className="text-[11px] text-income">Seluruh pengeluaran tercakup dompet ✓</p>
        )}
      </div>
    </div>
  )
}
