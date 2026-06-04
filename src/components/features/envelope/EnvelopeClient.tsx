'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Wallet } from 'lucide-react'
import { useEnvelope, currentMonthStr } from '@/hooks/useEnvelope'
import { WalletCard } from './WalletCard'
import { WalletForm } from './WalletForm'
import { WalletDetailSheet } from './WalletDetailSheet'
import { PlotFundsSheet } from './PlotFundsSheet'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import type { WalletWithMeta } from '@/types/database'

const ID_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function formatBulan(bulan: string) {
  const [y, m] = bulan.split('-')
  return `${ID_MONTHS[Number(m) - 1]} ${y}`
}
function navigateBulan(bulan: string, dir: -1 | 1): string {
  const [y, m] = bulan.split('-').map(Number)
  const d = new Date(y, m - 1 + dir, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

interface EnvelopeClientProps {
  householdId: string
  userId: string
}

export function EnvelopeClient({ householdId, userId }: EnvelopeClientProps) {
  const [bulan, setBulan] = useState(currentMonthStr())
  const [wallets, setWallets] = useState<WalletWithMeta[]>([])
  const [fetching, setFetching] = useState(true)
  const [migrationNeeded, setMigrationNeeded] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WalletWithMeta | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WalletWithMeta | null>(null)
  const [detailTarget, setDetailTarget] = useState<WalletWithMeta | null>(null)
  const [plotOpen, setPlotOpen] = useState(false)

  const { getWallets, deleteTemplate, loading } = useEnvelope(householdId, userId)
  const getWalletsRef = useRef(getWallets)
  getWalletsRef.current = getWallets

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    getWalletsRef.current(bulan)
      .then(data => { if (!cancelled) { setWallets(data); setFetching(false); setMigrationNeeded(false) } })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('budget_templates') || msg.includes('budget_wallets') || msg.includes('schema cache') || msg.includes('relation') || msg.includes('does not exist')) {
            setMigrationNeeded(true)
          }
          setWallets([]); setFetching(false)
        }
      })
    return () => { cancelled = true }
  }, [bulan])

  function reload() {
    setFetching(true)
    getWalletsRef.current(bulan)
      .then(data => { setWallets(data); setFetching(false) })
      .catch(() => { setWallets([]); setFetching(false) })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const ok = await deleteTemplate(deleteTarget.template_id, bulan)
    if (ok) { setDeleteTarget(null); reload() }
  }

  if (migrationNeeded) {
    return (
      <div className="mx-4 mt-6 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚙️</span>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Setup diperlukan</p>
            <p className="text-sm text-muted-foreground">
              Fitur Dompet Anggaran memerlukan tabel baru. Jalankan migration di <strong>Supabase → SQL Editor</strong>:
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3 font-mono text-xs text-foreground break-all">
          src/lib/supabase/migrations/003_envelope_budget.sql
        </div>
        <button onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground">
          Refresh Halaman
        </button>
      </div>
    )
  }

  const totalSaldo = wallets.reduce((s, w) => s + w.saldo, 0)
  const systemWallet = wallets.find(w => w.is_system)
  const userWallets = wallets.filter(w => !w.is_system)
  const mepet = userWallets.filter(w => w.status === 'mepet' || w.status === 'habis')
    .sort((a, b) => a.saldo - b.saldo)[0]

  return (
    <div className="pb-6">
      {/* Month navigator */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={() => setBulan(b => navigateBulan(b, -1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-card active:bg-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-base font-bold text-foreground">{formatBulan(bulan)}</p>
        <button onClick={() => setBulan(b => navigateBulan(b, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border bg-card active:bg-muted">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Total saldo overview */}
      {!fetching && (
        <div className="mx-4 mb-4 rounded-2xl border p-4 shadow-sm"
          style={{ background: '#09533B', boxShadow: '0 12px 24px -6px rgba(7,131,90,0.25)' }}>
          <div className="flex items-center gap-2 text-white/80">
            <Wallet className="h-4 w-4" />
            <p className="text-xs font-medium">Total Saldo Semua Dompet</p>
          </div>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-white">{formatCurrency(totalSaldo)}</p>
          {mepet && (
            <p className="mt-1 text-[11px] text-white/70">
              Paling mepet: {mepet.nama} — sisa {formatCurrency(mepet.saldo)}
            </p>
          )}
        </div>
      )}

      {/* Wallet list */}
      <div className="space-y-3 px-4">
        {fetching ? (
          [0,1,2].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            {userWallets.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-3xl">💼</p>
                <p className="text-sm font-semibold text-foreground">Belum ada dompet anggaran</p>
                <p className="text-xs text-muted-foreground max-w-[260px]">
                  Buat dompet untuk memilah pemasukanmu ke pos-pos pengeluaran.
                </p>
              </div>
            )}
            {userWallets.map(w => (
              <WalletCard
                key={w.id}
                wallet={w}
                onEdit={t => { setEditTarget(t); setFormOpen(true) }}
                onDetail={setDetailTarget}
              />
            ))}
            {/* System wallet selalu paling bawah */}
            {systemWallet && <WalletCard wallet={systemWallet} onDetail={setDetailTarget} />}
          </>
        )}
      </div>

      {/* Add button */}
      <div className="px-4 mt-4">
        <button onClick={() => { setEditTarget(null); setFormOpen(true) }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary active:bg-muted/40">
          <Plus className="h-4 w-4" /> Tambah Dompet Anggaran
        </button>
      </div>

      <WalletForm
        open={formOpen}
        onOpenChange={setFormOpen}
        householdId={householdId}
        userId={userId}
        bulan={bulan}
        editTarget={editTarget}
        onSuccess={() => { setEditTarget(null); reload() }}
        onRequestDelete={w => { setEditTarget(null); setDeleteTarget(w) }}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        title={`Hapus dompet "${deleteTarget?.nama}"?`}
        description={
          deleteTarget && deleteTarget.saldo > 0
            ? `Saldo ${formatCurrency(deleteTarget.saldo)} akan otomatis dipindahkan ke dompet "Tidak Dianggarkan".`
            : 'Dompet ini akan dihapus permanen.'
        }
        confirmLabel="Ya, Hapus"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        loading={loading}
      />

      {/* Detail dompet + riwayat */}
      {detailTarget && (
        <WalletDetailSheet
          wallet={detailTarget}
          householdId={householdId}
          userId={userId}
          bulan={bulan}
          customWalletCount={userWallets.length}
          onClose={() => setDetailTarget(null)}
          onRequestPlot={() => setPlotOpen(true)}
          onRequestCreateWallet={() => { setDetailTarget(null); setEditTarget(null); setFormOpen(true) }}
        />
      )}

      {/* Flow pilah dana (di atas detail) */}
      {plotOpen && systemWallet && (
        <PlotFundsSheet
          systemWallet={systemWallet}
          customWallets={userWallets}
          householdId={householdId}
          userId={userId}
          bulan={bulan}
          onClose={() => setPlotOpen(false)}
          onSuccess={() => {
            setPlotOpen(false)
            setDetailTarget(null)
            reload()
          }}
        />
      )}
    </div>
  )
}
