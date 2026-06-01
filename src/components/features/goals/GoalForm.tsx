'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGoals } from '@/hooks/useGoals'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'

const EMOJI_OPTIONS = ['🎯', '✈️', '🕌', '📷', '🏠', '🚗', '💊', '🎓', '💍', '🛒', '💻', '🎮', '🌴', '⚽', '🎸']

interface GoalFormProps {
  householdId: string
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function GoalForm({ householdId }: GoalFormProps) {
  const router = useRouter()
  const { loading, createGoal } = useGoals(householdId)

  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [target, setTarget] = useState(0)
  const [existing, setExisting] = useState(0)
  const [hasExisting, setHasExisting] = useState(false)
  const [months, setMonths] = useState(12)
  const [note, setNote] = useState('')

  // Real-time calculation
  const remaining = Math.max(0, target - existing)
  const perMonth = months > 0 ? remaining / months : 0
  const deadline = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    const ID_MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    return `${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
  })()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || target <= 0 || months <= 0) return

    const result = await createGoal({
      name: name.trim(),
      emoji,
      target_amount: target,
      saved_amount: hasExisting ? existing : 0,
      duration_months: months,
      start_date: todayISO(),
      note: `emoji:${emoji}${note ? ` ${note}` : ''}`,
    })

    if (result) {
      router.push('/goals')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pb-6">
      {/* Emoji picker */}
      <div className="space-y-2">
        <Label>Ikon Goal</Label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                'h-10 w-10 rounded-xl border text-xl transition-colors',
                emoji === e ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'
              )}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label>Nama Goal</Label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Contoh: Umroh Keluarga, Beli Kamera…"
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Target */}
      <div className="space-y-1.5">
        <Label>Target Nominal</Label>
        <CurrencyInput value={target} onChange={setTarget} />
      </div>

      {/* Existing savings toggle */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHasExisting(v => !v)}
            className={cn(
              'relative h-6 w-11 rounded-full border-2 transition-colors',
              hasExisting ? 'border-primary bg-primary' : 'border-border bg-muted'
            )}
          >
            <span className={cn(
              'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
              hasExisting ? 'translate-x-5' : 'translate-x-0.5'
            )} />
          </button>
          <Label className="cursor-pointer" onClick={() => setHasExisting(v => !v)}>
            Sudah punya tabungan?
          </Label>
        </div>
        {hasExisting && (
          <CurrencyInput value={existing} onChange={setExisting} placeholder="Nominal yang sudah ada" />
        )}
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <Label>Durasi Menabung: <span className="font-bold text-foreground">{months} bulan</span></Label>
        <input
          type="range"
          min={1}
          max={120}
          value={months}
          onChange={e => setMonths(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>1 bln</span><span>5 thn</span><span>10 thn</span>
        </div>
      </div>

      {/* Real-time summary */}
      {target > 0 && months > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-primary">Ringkasan Goal</p>
          <div className="space-y-1 text-xs text-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sisa yang perlu ditabung</span>
              <span className="font-medium">{formatCurrency(remaining)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target per bulan</span>
              <span className="font-bold text-income text-sm">{formatCurrency(perMonth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimasi selesai</span>
              <span className="font-medium">{deadline}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total durasi</span>
              <span className="font-medium">{months} bulan</span>
            </div>
          </div>
        </div>
      )}

      {/* Note */}
      <div className="space-y-1.5">
        <Label>Catatan <span className="text-muted-foreground">(opsional)</span></Label>
        <Textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Catatan tambahan…"
          rows={2}
          className="resize-none"
        />
      </div>

      <Button type="submit" disabled={loading || !name.trim() || target <= 0} className="h-12 text-base font-semibold">
        {loading ? 'Menyimpan…' : 'Buat Goal'}
      </Button>
    </form>
  )
}
