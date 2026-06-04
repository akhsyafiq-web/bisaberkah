'use client'

import { useEffect, useState } from 'react'
import { X, Plus, ArrowRightLeft } from 'lucide-react'
import { useEnvelope } from '@/hooks/useEnvelope'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'
import type { WalletWithMeta, WalletHistoryItem, WalletHistoryKind } from '@/types/database'

const KIND_META: Record<WalletHistoryKind, { icon: string; sign: string; color: string }> = {
  in:           { icon: '➕', sign: '+', color: 'text-income' },
  out:          { icon: '➖', sign: '−', color: 'text-expense' },
  transfer_in:  { icon: '🔄', sign: '+', color: 'text-income' },
  transfer_out: { icon: '🔄', sign: '−', color: 'text-muted-foreground' },
}

interface WalletDetailSheetProps {
  wallet: WalletWithMeta
  householdId: string
  userId: string
  bulan: string
  /** jumlah dompet custom aktif (untuk cek syarat plotting) */
  customWalletCount: number
  onClose: () => void
  onRequestPlot: () => void   // buka flow pilah
  onRequestCreateWallet: () => void
}

export function WalletDetailSheet({
  wallet, householdId, userId, bulan, customWalletCount,
  onClose, onRequestPlot, onRequestCreateWallet,
}: WalletDetailSheetProps) {
  const { getWalletHistory } = useEnvelope(householdId, userId)
  const [history, setHistory] = useState<WalletHistoryItem[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    let cancelled = false
    getWalletHistory(wallet.id, bulan).then(items => {
      if (!cancelled) { setHistory(items); setFetching(false) }
    }).catch(() => { if (!cancelled) setFetching(false) })
    return () => { cancelled = true }
  }, [wallet.id, bulan])

  // Syarat plotting (hanya untuk dompet sistem)
  const canPlot = wallet.is_system && wallet.saldo > 0 && customWalletCount > 0
  const noOtherWallet = wallet.is_system && customWalletCount === 0
  const emptySaldo = wallet.is_system && wallet.saldo <= 0

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end justify-center"
      style={{ background: 'rgba(12,17,29,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl bg-card max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b shrink-0">
          <div className="min-w-0">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              {wallet.is_system && '📂'} {wallet.nama}
            </p>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-foreground">
              {formatCurrency(wallet.saldo)}
            </p>
            {!wallet.is_system && (
              <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                Rencana {formatCurrency(wallet.nominal_rencana)} · dipakai {formatCurrency(wallet.terpakai)}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground shrink-0"><X className="h-5 w-5" /></button>
        </div>

        {/* Plotting CTA / state — hanya dompet sistem */}
        {wallet.is_system && (
          <div className="px-5 py-3 border-b shrink-0">
            {canPlot && (
              <button
                onClick={onRequestPlot}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground active:opacity-90"
              >
                <ArrowRightLeft className="h-4 w-4" /> Pilah ke Dompet Lain
              </button>
            )}
            {emptySaldo && (
              <p className="text-center text-sm text-muted-foreground">Tidak ada dana yang bisa dipilah saat ini.</p>
            )}
            {noOtherWallet && (
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground">Buat dompet anggaran terlebih dahulu untuk mulai memilah dana ini.</p>
                <button
                  onClick={onRequestCreateWallet}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary active:bg-primary/5"
                >
                  <Plus className="h-4 w-4" /> Buat Dompet
                </button>
              </div>
            )}
          </div>
        )}

        {/* Riwayat */}
        <div className="overflow-y-auto flex-1">
          <p className="px-5 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Riwayat</p>
          {fetching ? (
            <div className="space-y-2 p-4">
              {[0,1,2].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-2xl">📋</p>
              <p className="text-sm text-muted-foreground">Belum ada aktivitas pada dompet ini.</p>
            </div>
          ) : (
            <div className="divide-y">
              {history.map(item => {
                const meta = KIND_META[item.kind]
                return (
                  <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="text-base shrink-0">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(item.date)}{item.catatan ? ` · ${item.catatan}` : ''}
                      </p>
                    </div>
                    <p className={cn('shrink-0 text-sm font-semibold tabular-nums', meta.color)}>
                      {meta.sign}{formatCurrency(item.nominal)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
