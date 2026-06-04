'use client'

import { useEffect, useRef, useState } from 'react'
import { useEnvelope, type AllocationPick } from '@/hooks/useEnvelope'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { WalletWithMeta } from '@/types/database'

type Mode = 'lewati' | 'penuh' | 'parsial'

interface RowState { mode: Mode; nominal: number }

interface IncomeAllocationSectionProps {
  householdId: string
  userId: string
  bulan: string
  totalAmount: number
  onChange: (picks: AllocationPick[]) => void
}

export function IncomeAllocationSection({
  householdId, userId, bulan, totalAmount, onChange,
}: IncomeAllocationSectionProps) {
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
      const userWallets = all.filter(w => !w.is_system)
      setWallets(userWallets)
      const init: Record<string, RowState> = {}
      userWallets.forEach(w => { init[w.id] = { mode: 'lewati', nominal: 0 } })
      setRows(init)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [bulan])

  // Bubble up picks whenever rows change
  const allocated = Object.values(rows).reduce((s, r) => s + r.nominal, 0)
  const sisa = totalAmount - allocated

  useEffect(() => {
    const picks: AllocationPick[] = Object.entries(rows)
      .filter(([, r]) => r.nominal > 0)
      .map(([walletId, r]) => ({ walletId, nominal: r.nominal }))
    onChangeRef.current(picks)
  }, [rows])

  function kekurangan(w: WalletWithMeta) {
    return Math.max(0, w.nominal_rencana - w.saldo)
  }

  function setMode(w: WalletWithMeta, mode: Mode) {
    setRows(prev => {
      const remaining = totalAmount - Object.entries(prev)
        .filter(([id]) => id !== w.id)
        .reduce((s, [, r]) => s + r.nominal, 0)
      let nominal = 0
      if (mode === 'penuh') nominal = Math.min(kekurangan(w), Math.max(0, remaining))
      else if (mode === 'parsial') nominal = prev[w.id]?.nominal || 0
      return { ...prev, [w.id]: { mode, nominal } }
    })
  }

  function setParsial(w: WalletWithMeta, val: number) {
    setRows(prev => {
      const remaining = totalAmount - Object.entries(prev)
        .filter(([id]) => id !== w.id)
        .reduce((s, [, r]) => s + r.nominal, 0)
      const capped = Math.min(val, Math.max(0, remaining))
      return { ...prev, [w.id]: { mode: 'parsial', nominal: capped } }
    })
  }

  if (loading) {
    return <p className="text-xs text-muted-foreground">Memuat dompet…</p>
  }
  if (wallets.length === 0) {
    return (
      <p className="rounded-xl bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        Belum ada dompet anggaran. Seluruh pemasukan akan masuk ke "Tidak Dianggarkan".
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {wallets.map(w => {
        const row = rows[w.id] ?? { mode: 'lewati', nominal: 0 }
        const kurang = kekurangan(w)
        return (
          <div key={w.id} className="rounded-xl border bg-card p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{w.nama}</p>
                <p className="text-[11px] text-muted-foreground tabular-nums">
                  Saldo {formatCurrency(w.saldo)} · Kurang {formatCurrency(kurang)} dari rencana
                </p>
              </div>
              {row.nominal > 0 && (
                <span className="shrink-0 text-sm font-bold tabular-nums text-income">
                  +{formatCurrency(row.nominal)}
                </span>
              )}
            </div>

            {/* Mode toggle */}
            <div className="flex gap-1.5">
              {(['penuh','parsial','lewati'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(w, m)}
                  disabled={m === 'penuh' && kurang === 0}
                  className={cn(
                    'flex-1 rounded-lg border py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-40',
                    row.mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                  )}
                >
                  {m === 'penuh' ? 'Penuh' : m === 'parsial' ? 'Parsial' : 'Lewati'}
                </button>
              ))}
            </div>

            {row.mode === 'parsial' && (
              <CurrencyInput value={row.nominal} onChange={v => setParsial(w, v)} />
            )}
          </div>
        )
      })}

      {/* Running total */}
      <div className="rounded-xl bg-muted/40 px-3 py-2.5 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Sudah dialokasikan</span>
          <span className="font-semibold tabular-nums">{formatCurrency(allocated)} dari {formatCurrency(totalAmount)}</span>
        </div>
        {sisa > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Sisa {formatCurrency(sisa)} → otomatis masuk ke "Tidak Dianggarkan"
          </p>
        ) : sisa < 0 ? (
          <p className="text-[11px] font-semibold text-destructive">
            Alokasi melebihi pemasukan sebesar {formatCurrency(Math.abs(sisa))}
          </p>
        ) : (
          <p className="text-[11px] text-income">Seluruh pemasukan sudah dipilah ✓</p>
        )}
      </div>
    </div>
  )
}
