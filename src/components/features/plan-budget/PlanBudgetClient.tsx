'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Copy } from 'lucide-react'
import { usePlanBudget, currentMonthStr, prevMonth } from '@/hooks/usePlanBudget'
import { PlanBudgetCard } from './PlanBudgetCard'
import { PlanBudgetForm } from './PlanBudgetForm'
import { PlanBudgetDetail } from './PlanBudgetDetail'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import type { PlanBudgetWithUsage } from '@/types/database'

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

interface PlanBudgetClientProps {
  householdId: string
  userId: string
}

export function PlanBudgetClient({ householdId, userId }: PlanBudgetClientProps) {
  const [bulan, setBulan] = useState(currentMonthStr())
  const [budgets, setBudgets] = useState<PlanBudgetWithUsage[]>([])
  const [fetching, setFetching] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PlanBudgetWithUsage | null>(null)
  const [detailTarget, setDetailTarget] = useState<PlanBudgetWithUsage | null>(null)
  const [copyConfirm, setCopyConfirm] = useState(false)
  const [migrationNeeded, setMigrationNeeded] = useState(false)

  const { getBudgets, copyFromLastMonth, loading } = usePlanBudget(householdId, userId)
  const getBudgetsRef = useRef(getBudgets)
  getBudgetsRef.current = getBudgets

  useEffect(() => {
    let cancelled = false
    setFetching(true)
    getBudgetsRef.current(bulan)
      .then(data => {
        if (!cancelled) { setBudgets(data); setFetching(false); setMigrationNeeded(false) }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err)
          if (msg.includes('plan_budgets') || msg.includes('schema cache') || msg.includes('relation')) {
            setMigrationNeeded(true)
          }
          setBudgets([])
          setFetching(false)
        }
      })
    return () => { cancelled = true }
  }, [bulan])

  function reload() {
    setFetching(true)
    getBudgetsRef.current(bulan)
      .then(data => { setBudgets(data); setFetching(false); setMigrationNeeded(false) })
      .catch(() => { setBudgets([]); setFetching(false) })
  }

  async function handleCopy() {
    const n = await copyFromLastMonth(bulan)
    if (n > 0) { setCopyConfirm(false); reload() }
    else setCopyConfirm(false)
  }

  const totalRencana  = budgets.reduce((s, b) => s + Number(b.nominal_rencana), 0)
  const totalTerpakai = budgets.reduce((s, b) => s + b.nominal_terpakai, 0)
  const totalSisa     = totalRencana - totalTerpakai
  const totalPct      = totalRencana > 0 ? Math.min(100, Math.round((totalTerpakai / totalRencana) * 100)) : 0
  const overallBar    = totalPct >= 100 ? '#D92D20' : totalPct >= 80 ? '#F79009' : '#079455'

  if (migrationNeeded) {
    return (
      <div className="mx-4 mt-6 rounded-2xl border bg-card p-6 space-y-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚙️</span>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Setup diperlukan</p>
            <p className="text-sm text-muted-foreground">
              Fitur Anggaran memerlukan tabel baru di database. Jalankan migration SQL berikut di{' '}
              <strong>Supabase → SQL Editor</strong>:
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-muted px-4 py-3 font-mono text-xs text-foreground break-all">
          src/lib/supabase/migrations/002_plan_budget.sql
        </div>
        <p className="text-xs text-muted-foreground">
          Setelah migration dijalankan, refresh halaman ini.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
        >
          Refresh Halaman
        </button>
      </div>
    )
  }

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

      {/* Summary overview */}
      {!fetching && budgets.length > 0 && (
        <div className="mx-4 rounded-2xl border bg-card p-4 shadow-sm space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Total Direncanakan</p>
              <p className="font-bold tabular-nums">{formatCurrency(totalRencana)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Terpakai</p>
              <p className="font-bold tabular-nums">{formatCurrency(totalTerpakai)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Sisa</p>
              <p className={cn('font-bold tabular-nums', totalSisa < 0 ? 'text-[#D92D20]' : 'text-income')}>
                {totalSisa < 0 ? `−${formatCurrency(Math.abs(totalSisa))}` : formatCurrency(totalSisa)}
              </p>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${totalPct}%`, background: overallBar }} />
          </div>
          <p className="text-right text-xs text-muted-foreground">{totalPct}% digunakan</p>
        </div>
      )}

      {/* Budget list */}
      <div className="space-y-3 px-4">
        {fetching ? (
          [0,1,2].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)
        ) : budgets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="text-4xl">📊</p>
            <p className="text-sm font-semibold text-foreground">Belum ada anggaran</p>
            <p className="text-xs text-muted-foreground max-w-[260px]">
              Buat anggaran untuk melacak pengeluaranmu per kategori bulan ini.
            </p>
            {prevMonth(bulan) && (
              <button onClick={() => setCopyConfirm(true)}
                className="flex items-center gap-1.5 rounded-xl border border-primary/40 px-4 py-2 text-sm font-semibold text-primary active:bg-primary/5">
                <Copy className="h-4 w-4" /> Salin dari bulan lalu
              </button>
            )}
          </div>
        ) : (
          budgets.map(b => (
            <PlanBudgetCard
              key={b.id}
              budget={b}
              onEdit={t => { setEditTarget(t); setFormOpen(true) }}
              onDetail={setDetailTarget}
            />
          ))
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 space-y-2">
        <button
          onClick={() => { setEditTarget(null); setFormOpen(true) }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-semibold text-primary active:bg-muted/40"
        >
          <Plus className="h-4 w-4" /> Tambah Anggaran
        </button>
        {budgets.length > 0 && (
          <button
            onClick={() => setCopyConfirm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border py-3 text-sm font-medium text-muted-foreground active:bg-muted/40"
          >
            <Copy className="h-4 w-4" /> Salin dari bulan lalu
          </button>
        )}
      </div>

      {/* Form drawer */}
      <PlanBudgetForm
        open={formOpen}
        onOpenChange={setFormOpen}
        householdId={householdId}
        userId={userId}
        bulan={bulan}
        editTarget={editTarget}
        onSuccess={() => { setEditTarget(null); reload() }}
      />

      {/* Detail sheet */}
      {detailTarget && (
        <PlanBudgetDetail
          budget={detailTarget}
          householdId={householdId}
          userId={userId}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {/* Copy confirm */}
      <AlertDialog
        open={copyConfirm}
        onOpenChange={setCopyConfirm}
        title="Salin anggaran bulan lalu?"
        description={`Semua anggaran dari ${formatBulan(navigateBulan(bulan, -1))} akan disalin ke ${formatBulan(bulan)}.`}
        confirmLabel="Ya, Salin"
        confirmVariant="default"
        onConfirm={handleCopy}
        loading={loading}
      />
    </div>
  )
}
