'use client'

import { Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { WalletWithMeta } from '@/types/database'

const STATUS_CONFIG = {
  normal: { bar: '#079455', tint: '' },
  mepet:  { bar: '#F79009', tint: '' },
  habis:  { bar: '#98A2B3', tint: 'opacity-70' },
}

interface WalletCardProps {
  wallet: WalletWithMeta
  onEdit?: (w: WalletWithMeta) => void
  onDetail?: (w: WalletWithMeta) => void
}

export function WalletCard({ wallet, onEdit, onDetail }: WalletCardProps) {
  // ── Dompet sistem "Tidak Dianggarkan": tampilan beda, tanpa progress
  if (wallet.is_system) {
    return (
      <button
        type="button"
        onClick={() => onDetail?.(wallet)}
        className="w-full rounded-2xl border bg-muted/40 p-4 text-left transition-colors active:bg-muted"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📂</span>
          <p className="flex-1 text-sm font-semibold text-foreground">{wallet.nama}</p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
            OTOMATIS
          </span>
        </div>
        <p className="mt-2 text-xl font-extrabold tabular-nums text-foreground">
          {formatCurrency(wallet.saldo)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">Dana yang belum dipilah ke dompet · ketuk untuk detail</p>
      </button>
    )
  }

  // ── Dompet user normal
  const cfg = STATUS_CONFIG[wallet.status]
  const pct = wallet.nominal_rencana > 0
    ? Math.min(100, Math.round((wallet.saldo / wallet.nominal_rencana) * 100))
    : 0

  return (
    <div className={cn('rounded-2xl border bg-card p-4 shadow-sm space-y-2.5', cfg.tint)}>
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={() => onDetail?.(wallet)} className="min-w-0 text-left flex-1">
          <p className="font-semibold text-foreground truncate">{wallet.nama}</p>
          <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
            Rencana {formatCurrency(wallet.nominal_rencana)}/bulan
          </p>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {wallet.status === 'habis' && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Habis</span>
          )}
          {onEdit && (
            <button onClick={() => onEdit(wallet)} className="text-muted-foreground active:text-primary">
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <button type="button" onClick={() => onDetail?.(wallet)} className="w-full text-left space-y-2.5">
        {/* Saldo besar */}
        <p className="text-xl font-extrabold tabular-nums" style={{ color: cfg.bar }}>
          {formatCurrency(wallet.saldo)}
        </p>

        {/* Progress bar saldo vs rencana */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: cfg.bar }} />
        </div>

        <p className="text-xs text-muted-foreground tabular-nums">
          Sudah dipakai {formatCurrency(wallet.terpakai)} · {pct}% dari rencana
        </p>
      </button>
    </div>
  )
}
