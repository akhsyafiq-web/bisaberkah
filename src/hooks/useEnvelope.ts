'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type {
  BudgetTemplate, BudgetWallet, WalletWithMeta, WalletStatus, WalletHistoryItem,
} from '@/types/database'

export const SYSTEM_WALLET_NAME = 'Tidak Dianggarkan'

export function currentMonthStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function prevMonthStr(bulan: string): string {
  const [y, m] = bulan.split('-').map(Number)
  if (m === 1) return `${y - 1}-12`
  return `${y}-${String(m - 1).padStart(2, '0')}`
}

function walletStatus(saldo: number, rencana: number): WalletStatus {
  if (saldo <= 0) return 'habis'
  if (rencana > 0 && saldo / rencana <= 0.2) return 'mepet'
  return 'normal'
}

export interface AllocationPick { walletId: string; nominal: number }
export interface SpendPick { walletId: string; nominal: number }
export interface TransferPick { toWalletId: string; nominal: number; catatan?: string }

export function useEnvelope(householdId: string, userId: string) {
  const [loading, setLoading] = useState(false)

  // ── Pastikan template sistem + wallet bulan ini ada (get-or-create + carry-over)
  async function ensureMonthSetup(bulan: string): Promise<void> {
    const supabase = createClient()

    // 1. Pastikan template sistem "Tidak Dianggarkan" ada
    const sysRes = await supabase
      .from('budget_templates')
      .select('*')
      .eq('household_id', householdId)
      .eq('is_system', true)
      .maybeSingle()
    if (sysRes.error) throw new Error(sysRes.error.message)

    let systemTemplate = sysRes.data as unknown as BudgetTemplate | null
    if (!systemTemplate) {
      const ins = await (supabase.from('budget_templates') as any).insert({
        household_id: householdId, user_id: userId,
        nama: SYSTEM_WALLET_NAME, nominal_rencana: 0, urutan: 9999,
        aktif: true, is_system: true,
      }).select('*').single()
      if (ins.error) throw new Error(ins.error.message)
      systemTemplate = ins.data as unknown as BudgetTemplate
    }

    // 2. Ambil semua template aktif
    const tplRes = await supabase
      .from('budget_templates')
      .select('*')
      .eq('household_id', householdId)
      .eq('aktif', true)
    if (tplRes.error) throw new Error(tplRes.error.message)
    const templates = (tplRes.data as unknown as BudgetTemplate[] | null) ?? []

    // 3. Ambil wallet yang sudah ada bulan ini + bulan lalu (untuk carry-over)
    const prev = prevMonthStr(bulan)
    const [thisRes, prevRes] = await Promise.all([
      supabase.from('budget_wallets').select('*').eq('household_id', householdId).eq('bulan', bulan),
      supabase.from('budget_wallets').select('*').eq('household_id', householdId).eq('bulan', prev),
    ])
    const thisWallets = (thisRes.data as unknown as BudgetWallet[] | null) ?? []
    const prevWallets = (prevRes.data as unknown as BudgetWallet[] | null) ?? []

    const haveTemplateIds = new Set(thisWallets.map(w => w.template_id))
    const prevSaldoByTemplate = new Map(prevWallets.map(w => [w.template_id, Number(w.saldo)]))

    // 4. Buat wallet untuk template yang belum punya wallet bulan ini
    const toCreate = templates
      .filter(t => !haveTemplateIds.has(t.id))
      .map(t => ({
        household_id: householdId,
        template_id: t.id,
        bulan,
        saldo: prevSaldoByTemplate.get(t.id) ?? 0,   // carry-over
        nominal_rencana: Number(t.nominal_rencana),  // snapshot
      }))

    if (toCreate.length > 0) {
      const ins = await (supabase.from('budget_wallets') as any).insert(toCreate)
      if (ins.error) throw new Error(ins.error.message)
    }
  }

  // ── Ambil wallet bulan ini + terpakai, terurut (custom by urutan, sistem terakhir)
  async function getWallets(bulan: string): Promise<WalletWithMeta[]> {
    const supabase = createClient()
    await ensureMonthSetup(bulan)

    const wRes = await supabase
      .from('budget_wallets')
      .select('*, budget_templates(nama, is_system, urutan)')
      .eq('household_id', householdId)
      .eq('bulan', bulan)
    if (wRes.error) throw new Error(wRes.error.message)
    const rows = (wRes.data as unknown as Array<BudgetWallet & {
      budget_templates: { nama: string; is_system: boolean; urutan: number } | null
    }> | null) ?? []

    // Hitung terpakai per wallet
    const walletIds = rows.map(r => r.id)
    const usageMap = new Map<string, number>()
    if (walletIds.length > 0) {
      const eRes = await supabase
        .from('expense_from_wallets')
        .select('wallet_id, nominal')
        .in('wallet_id', walletIds)
      const expenses = (eRes.data as unknown as Array<{ wallet_id: string; nominal: number }> | null) ?? []
      for (const e of expenses) {
        usageMap.set(e.wallet_id, (usageMap.get(e.wallet_id) ?? 0) + Number(e.nominal))
      }
    }

    const wallets: WalletWithMeta[] = rows.map(r => {
      const meta = r.budget_templates
      const saldo = Number(r.saldo)
      const rencana = Number(r.nominal_rencana)
      return {
        ...r,
        saldo,
        nominal_rencana: rencana,
        nama: meta?.nama ?? 'Dompet',
        is_system: meta?.is_system ?? false,
        urutan: meta?.urutan ?? 0,
        terpakai: usageMap.get(r.id) ?? 0,
        status: walletStatus(saldo, rencana),
      }
    })

    // Urutkan: custom dulu (by urutan, lalu nama), sistem paling bawah
    wallets.sort((a, b) => {
      if (a.is_system !== b.is_system) return a.is_system ? 1 : -1
      if (a.urutan !== b.urutan) return a.urutan - b.urutan
      return a.nama.localeCompare(b.nama)
    })
    return wallets
  }

  async function getTemplates(): Promise<BudgetTemplate[]> {
    const supabase = createClient()
    const res = await supabase
      .from('budget_templates')
      .select('*')
      .eq('household_id', householdId)
      .eq('aktif', true)
      .order('is_system')
      .order('urutan')
    return (res.data as unknown as BudgetTemplate[] | null) ?? []
  }

  // ── Tambah dompet baru (template + wallet bulan ini saldo 0)
  async function createTemplate(nama: string, nominalRencana: number, bulan: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const tplIns = await (supabase.from('budget_templates') as any).insert({
        household_id: householdId, user_id: userId,
        nama: nama.trim(), nominal_rencana: nominalRencana, urutan: 0,
        aktif: true, is_system: false,
      }).select('*').single()
      if (tplIns.error) throw new Error(tplIns.error.message)
      const tpl = tplIns.data as unknown as BudgetTemplate

      const walIns = await (supabase.from('budget_wallets') as any).insert({
        household_id: householdId, template_id: tpl.id, bulan,
        saldo: 0, nominal_rencana: nominalRencana,
      })
      if (walIns.error) throw new Error(walIns.error.message)

      toast.success('Dompet anggaran dibuat')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membuat dompet')
      return false
    } finally { setLoading(false) }
  }

  // ── Edit template (hanya berlaku bulan depan; saldo bulan ini tidak diubah)
  async function updateTemplate(id: string, nama: string, nominalRencana: number): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const res = await (supabase.from('budget_templates') as any)
        .update({ nama: nama.trim(), nominal_rencana: nominalRencana })
        .eq('id', id).eq('is_system', false)
      if (res.error) throw new Error(res.error.message)
      toast.success('Dompet diperbarui (berlaku bulan depan)')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui dompet')
      return false
    } finally { setLoading(false) }
  }

  // ── Hapus dompet custom: saldo bulan ini pindah ke "Tidak Dianggarkan"
  async function deleteTemplate(templateId: string, bulan: string): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()

      // Wallet yang dihapus (bulan ini) + system wallet (bulan ini)
      const wRes = await supabase
        .from('budget_wallets')
        .select('*, budget_templates(is_system)')
        .eq('household_id', householdId)
        .eq('bulan', bulan)
      const rows = (wRes.data as unknown as Array<BudgetWallet & { budget_templates: { is_system: boolean } | null }> | null) ?? []

      const target = rows.find(r => r.template_id === templateId)
      const system = rows.find(r => r.budget_templates?.is_system)

      // Pindahkan saldo target → system wallet
      if (target && system && Number(target.saldo) > 0) {
        const newSaldo = Number(system.saldo) + Number(target.saldo)
        const upd = await (supabase.from('budget_wallets') as any)
          .update({ saldo: newSaldo }).eq('id', system.id)
        if (upd.error) throw new Error(upd.error.message)
      }

      // Hapus template (cascade hapus wallet-nya)
      const del = await supabase.from('budget_templates').delete().eq('id', templateId).eq('is_system', false)
      if (del.error) throw new Error(del.error.message)

      toast.success('Dompet dihapus, saldonya dipindah ke Tidak Dianggarkan')
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menghapus dompet')
      return false
    } finally { setLoading(false) }
  }

  // ── Alokasi pemasukan ke dompet (pilah). Sisa → Tidak Dianggarkan.
  async function allocateIncome(
    pemasukanId: string, totalNominal: number, picks: AllocationPick[], bulan: string,
  ): Promise<boolean> {
    try {
      const supabase = createClient()
      await ensureMonthSetup(bulan)

      // Ambil semua wallet bulan ini untuk saldo terkini + system wallet
      const wRes = await supabase
        .from('budget_wallets')
        .select('*, budget_templates(is_system)')
        .eq('household_id', householdId).eq('bulan', bulan)
      const rows = (wRes.data as unknown as Array<BudgetWallet & { budget_templates: { is_system: boolean } | null }> | null) ?? []
      const system = rows.find(r => r.budget_templates?.is_system)
      const saldoById = new Map(rows.map(r => [r.id, Number(r.saldo)]))

      const allocated = picks.reduce((s, p) => s + p.nominal, 0)
      const leftover = totalNominal - allocated

      // Sisa otomatis ke system wallet
      const finalPicks = [...picks]
      if (leftover > 0 && system) {
        finalPicks.push({ walletId: system.id, nominal: leftover })
      }

      // Insert allocations + increment saldo per wallet
      for (const p of finalPicks) {
        if (p.nominal <= 0) continue
        await (supabase.from('income_allocations') as any).insert({
          pemasukan_id: pemasukanId, wallet_id: p.walletId, nominal_dialokasikan: p.nominal,
        })
        const newSaldo = (saldoById.get(p.walletId) ?? 0) + p.nominal
        await (supabase.from('budget_wallets') as any).update({ saldo: newSaldo }).eq('id', p.walletId)
        saldoById.set(p.walletId, newSaldo)
      }
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memilah pemasukan')
      return false
    }
  }

  // ── Pengeluaran ambil dari dompet. Saldo dompet dijaga >= 0 lewat RPC.
  //    Mengembalikan { covered, shortfall }.
  async function spendExpense(
    pengeluaranId: string, totalNominal: number, picks: SpendPick[], bulan: string,
  ): Promise<{ covered: number; shortfall: number }> {
    try {
      const supabase = createClient()
      await ensureMonthSetup(bulan)

      // Default: jika tidak ada pick, ambil dari system wallet
      let finalPicks = picks
      if (finalPicks.length === 0) {
        const sysRes = await supabase
          .from('budget_wallets')
          .select('id, budget_templates!inner(is_system)')
          .eq('household_id', householdId).eq('bulan', bulan)
          .eq('budget_templates.is_system', true)
          .maybeSingle()
        const sys = sysRes.data as unknown as { id: string } | null
        if (sys) finalPicks = [{ walletId: sys.id, nominal: totalNominal }]
      }

      if (finalPicks.length === 0) return { covered: 0, shortfall: totalNominal }

      // Panggil RPC (server-side guard saldo >= 0). RPC tidak ada di typed
      // schema, jadi cast ke any.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpc = await (supabase as any).rpc('spend_from_wallets', {
        p_pengeluaran_id: pengeluaranId,
        p_picks: finalPicks.map(p => ({ wallet_id: p.walletId, nominal: p.nominal })),
      })
      if (rpc.error) throw new Error(rpc.error.message)

      const covered = Number(rpc.data ?? 0)
      return { covered, shortfall: Math.max(0, totalNominal - covered) }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mencatat pengeluaran dari dompet')
      return { covered: 0, shortfall: totalNominal }
    }
  }

  // ── Pilah (transfer internal) dari satu dompet ke beberapa dompet (atomic via RPC)
  async function plotFunds(
    fromWalletId: string, transfers: TransferPick[], bulan: string,
  ): Promise<boolean> {
    setLoading(true)
    try {
      const supabase = createClient()
      const valid = transfers.filter(t => t.nominal > 0)
      if (valid.length === 0) throw new Error('Tidak ada dompet yang dipilih')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rpc = await (supabase as any).rpc('plot_from_unbudgeted', {
        p_from_wallet_id: fromWalletId,
        p_bulan: bulan,
        p_transfers: valid.map(t => ({
          to_wallet_id: t.toWalletId, nominal: t.nominal, catatan: t.catatan ?? null,
        })),
      })
      if (rpc.error) throw new Error(rpc.error.message)

      toast.success(`Dana berhasil dipilah ke ${valid.length} dompet`)
      return true
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal memilah dana. Tidak ada perubahan disimpan.')
      return false
    } finally { setLoading(false) }
  }

  // ── Riwayat gabungan satu dompet: alokasi masuk, pengeluaran, transfer masuk/keluar
  async function getWalletHistory(walletId: string, bulan: string): Promise<WalletHistoryItem[]> {
    const supabase = createClient()

    // Peta nama dompet untuk label transfer
    const wRes = await supabase
      .from('budget_wallets')
      .select('id, budget_templates(nama)')
      .eq('household_id', householdId).eq('bulan', bulan)
    const nameById = new Map<string, string>()
    for (const r of (wRes.data as unknown as Array<{ id: string; budget_templates: { nama: string } | null }> | null) ?? []) {
      nameById.set(r.id, r.budget_templates?.nama ?? 'Dompet')
    }

    const [inRes, outRes, tOutRes, tInRes] = await Promise.all([
      supabase.from('income_allocations')
        .select('id, nominal_dialokasikan, created_at, transactions(date, note)')
        .eq('wallet_id', walletId),
      supabase.from('expense_from_wallets')
        .select('id, nominal, created_at, overflow_note, transactions(date, note, categories(name))')
        .eq('wallet_id', walletId),
      supabase.from('wallet_transfers')
        .select('id, nominal, created_at, catatan, to_wallet_id')
        .eq('from_wallet_id', walletId),
      supabase.from('wallet_transfers')
        .select('id, nominal, created_at, catatan, from_wallet_id')
        .eq('to_wallet_id', walletId),
    ])

    const items: WalletHistoryItem[] = []

    for (const r of (inRes.data as unknown as Array<{ id: string; nominal_dialokasikan: number; created_at: string; transactions: { date: string; note: string | null } | null }> | null) ?? []) {
      items.push({
        id: `in-${r.id}`, kind: 'in', label: 'Alokasi pemasukan',
        nominal: Number(r.nominal_dialokasikan),
        date: r.transactions?.date ?? r.created_at, catatan: r.transactions?.note,
      })
    }
    for (const r of (outRes.data as unknown as Array<{ id: string; nominal: number; created_at: string; overflow_note: string | null; transactions: { date: string; note: string | null; categories: { name: string } | null } | null }> | null) ?? []) {
      items.push({
        id: `out-${r.id}`, kind: 'out',
        label: r.transactions?.categories?.name ?? 'Pengeluaran',
        nominal: Number(r.nominal),
        date: r.transactions?.date ?? r.created_at,
        catatan: r.transactions?.note ?? r.overflow_note,
      })
    }
    for (const r of (tOutRes.data as unknown as Array<{ id: string; nominal: number; created_at: string; catatan: string | null; to_wallet_id: string | null }> | null) ?? []) {
      items.push({
        id: `tout-${r.id}`, kind: 'transfer_out',
        label: `Dipilah ke ${r.to_wallet_id ? nameById.get(r.to_wallet_id) ?? 'dompet lain' : 'dompet lain'}`,
        nominal: Number(r.nominal), date: r.created_at.slice(0, 10), catatan: r.catatan,
      })
    }
    for (const r of (tInRes.data as unknown as Array<{ id: string; nominal: number; created_at: string; catatan: string | null; from_wallet_id: string | null }> | null) ?? []) {
      items.push({
        id: `tin-${r.id}`, kind: 'transfer_in',
        label: `Dipilah dari ${r.from_wallet_id ? nameById.get(r.from_wallet_id) ?? 'dompet lain' : 'dompet lain'}`,
        nominal: Number(r.nominal), date: r.created_at.slice(0, 10), catatan: r.catatan,
      })
    }

    items.sort((a, b) => b.date.localeCompare(a.date))
    return items
  }

  return {
    loading,
    ensureMonthSetup,
    getWallets,
    getTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    allocateIncome,
    spendExpense,
    plotFunds,
    getWalletHistory,
  }
}
