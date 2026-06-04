'use client'

import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { useEnvelope, type TransferPick } from '@/hooks/useEnvelope'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { WalletWithMeta } from '@/types/database'

type Mode = 'lewati' | 'penuh' | 'parsial'
interface RowState { mode: Mode; nominal: number }

interface PlotFundsSheetProps {
  systemWallet: WalletWithMeta
  customWallets: WalletWithMeta[]
  householdId: string
  userId: string
  bulan: string
  onClose: () => void
  onSuccess: () => void
}

export function PlotFundsSheet({
  systemWallet, customWallets, householdId, userId, bulan, onClose, onSuccess,
}: PlotFundsSheetProps) {
  const { plotFunds, loading } = useEnvelope(householdId, userId)
  const [step, setStep] = useState<1 | 2>(1)
  const [rows, setRows] = useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {}
    customWallets.forEach(w => { init[w.id] = { mode: 'lewati', nominal: 0 } })
    return init
  })

  const available = systemWallet.saldo
  const totalDipilah = Object.values(rows).reduce((s, r) => s + r.nominal, 0)
  const sisa = available - totalDipilah
  const kekurangan = (w: WalletWithMeta) => Math.max(0, w.nominal_rencana - w.saldo)

  function otherTotal(excludeId: string) {
    return Object.entries(rows).filter(([id]) => id !== excludeId)
      .reduce((s, [, r]) => s + r.nominal, 0)
  }

  function setMode(w: WalletWithMeta, mode: Mode) {
    setRows(prev => {
      const remaining = Math.max(0, available - otherTotal(w.id))
      let nominal = 0
      if (mode === 'penuh') nominal = Math.min(kekurangan(w), remaining)
      else if (mode === 'parsial') nominal = Math.min(prev[w.id]?.nominal || 0, remaining)
      return { ...prev, [w.id]: { mode, nominal } }
    })
  }

  function setParsial(w: WalletWithMeta, val: number) {
    setRows(prev => {
      const remaining = Math.max(0, available - otherTotal(w.id))
      return { ...prev, [w.id]: { mode: 'parsial', nominal: Math.min(val, remaining) } }
    })
  }

  const picks: TransferPick[] = Object.entries(rows)
    .filter(([, r]) => r.nominal > 0)
    .map(([toWalletId, r]) => ({ toWalletId, nominal: r.nominal }))

  const canConfirm = picks.length > 0 && totalDipilah > 0 && totalDipilah <= available

  async function handleConfirm() {
    const ok = await plotFunds(systemWallet.id, picks, bulan)
    if (ok) onSuccess()
  }

  const namaById = new Map(customWallets.map(w => [w.id, w.nama]))

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center"
      style={{ background: 'rgba(12,17,29,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl bg-card max-h-[88vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b shrink-0">
          <div>
            <p className="font-bold text-foreground">
              {step === 1 ? 'Pilah ke Dompet Lain' : 'Konfirmasi Pilah Dana'}
            </p>
            <p className="text-xs text-muted-foreground">dari Tidak Dianggarkan</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground"><X className="h-5 w-5" /></button>
        </div>

        {step === 1 ? (
          <>
            {/* List dompet tujuan */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2.5">
              {customWallets.map(w => {
                const row = rows[w.id] ?? { mode: 'lewati', nominal: 0 }
                const kurang = kekurangan(w)
                const remaining = Math.max(0, available - otherTotal(w.id))
                const cappedPenuh = row.mode === 'penuh' && kurang > remaining
                return (
                  <div key={w.id} className="rounded-xl border bg-card p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{w.nama}</p>
                        <p className="text-[11px] text-muted-foreground tabular-nums">
                          Saldo {formatCurrency(w.saldo)} · Kurang {formatCurrency(kurang)}
                        </p>
                      </div>
                      {row.nominal > 0 && (
                        <span className="shrink-0 text-sm font-bold tabular-nums text-income">
                          +{formatCurrency(row.nominal)}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-1.5">
                      {(['penuh','parsial','lewati'] as Mode[]).map(m => (
                        <button key={m} type="button" onClick={() => setMode(w, m)}
                          disabled={m === 'penuh' && kurang === 0}
                          className={cn('flex-1 rounded-lg border py-1.5 text-[11px] font-semibold transition-colors disabled:opacity-40',
                            row.mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                          {m === 'penuh' ? 'Penuh' : m === 'parsial' ? 'Parsial' : 'Lewati'}
                        </button>
                      ))}
                    </div>

                    {row.mode === 'parsial' && (
                      <CurrencyInput value={row.nominal} onChange={v => setParsial(w, v)} />
                    )}
                    {cappedPenuh && (
                      <p className="text-[11px] text-[#B54708]">
                        Saldo tidak cukup untuk penuh. Diisi {formatCurrency(row.nominal)} (maks tersedia).
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Sticky running total */}
            <div className="border-t px-5 py-3 space-y-2 shrink-0">
              <div className="space-y-0.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Saldo Tidak Dianggarkan</span><span className="font-semibold tabular-nums">{formatCurrency(available)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total dipilah</span><span className="font-semibold tabular-nums text-income">{formatCurrency(totalDipilah)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sisa setelah dipilah</span><span className="font-semibold tabular-nums">{formatCurrency(sisa)}</span></div>
              </div>
              <Button onClick={() => setStep(2)} disabled={!canConfirm} className="w-full h-11">
                Lanjut <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 — konfirmasi */}
            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              <div className="rounded-xl bg-muted/40 px-4 py-3">
                <p className="text-xs text-muted-foreground">Dari</p>
                <p className="text-sm font-semibold text-foreground">Tidak Dianggarkan ({formatCurrency(available)})</p>
              </div>
              <div className="space-y-2">
                {picks.map(p => (
                  <div key={p.toWalletId} className="flex items-center justify-between rounded-xl border px-4 py-2.5">
                    <span className="text-sm font-medium text-foreground">→ {namaById.get(p.toWalletId)}</span>
                    <span className="text-sm font-bold tabular-nums text-income">+{formatCurrency(p.nominal)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-0.5 text-xs rounded-xl bg-muted/40 px-4 py-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Total dipilah</span><span className="font-semibold tabular-nums">{formatCurrency(totalDipilah)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Sisa Tidak Dianggarkan</span><span className="font-semibold tabular-nums">{formatCurrency(sisa)}</span></div>
              </div>
            </div>
            <div className="border-t px-5 py-3 flex gap-3 shrink-0">
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading} className="flex-1 h-11">Kembali</Button>
              <Button onClick={handleConfirm} disabled={loading} className="flex-1 h-11">
                {loading ? 'Memproses…' : 'Pilah Sekarang'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
