'use client'

import { useRef, useState } from 'react'
import { FileSpreadsheet, Download, Upload, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateTemplate, parseImportFile, type ImportRow } from '@/lib/utils/excel'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category } from '@/types/database'

interface ImportClientProps {
  householdId: string
  userId: string
  categories: Category[]
}

export function ImportClient({ householdId, userId, categories }: ImportClientProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ImportRow[]>([])
  const [step, setStep] = useState<'idle' | 'preview' | 'done'>('idle')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ ok: number; skipped: number } | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseImportFile(file, categories)
      setRows(parsed)
      setStep('preview')
    } catch {
      toast.error('Gagal membaca file. Pastikan format file .xlsx yang benar.')
    }
    e.target.value = ''
  }

  async function handleImport() {
    const valid = rows.filter(r => !r.error && r.category_id)
    if (valid.length === 0) return
    setImporting(true)

    const supabase = createClient()
    const payload = valid.map(r => ({
      household_id: householdId,
      user_id: userId,
      type: r.type,
      amount: r.amount,
      category_id: r.category_id!,
      date: r.date,
      note: r.note || null,
    }))

    const res = await (supabase.from('transactions') as any).insert(payload)
    setImporting(false)

    if (res.error) {
      toast.error('Gagal mengimpor transaksi')
    } else {
      setResult({ ok: valid.length, skipped: rows.length - valid.length })
      setStep('done')
      toast.success(`${valid.length} transaksi berhasil diimpor`)
    }
  }

  const validCount = rows.filter(r => !r.error).length
  const errorCount = rows.length - validCount

  return (
    <div className="px-4 pb-6 space-y-5">
      {/* Step 1: Info + download */}
      <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          <p className="font-semibold text-sm">Cara import</p>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Download template Excel di bawah</li>
          <li>Isi data di sheet Pengeluaran dan/atau Pemasukan</li>
          <li>Upload file yang sudah diisi</li>
          <li>Review dan konfirmasi import</li>
        </ol>
        <Button
          variant="outline"
          onClick={generateTemplate}
          className="w-full h-10 gap-2"
        >
          <Download className="h-4 w-4" />
          Download Template Excel
        </Button>
      </div>

      {/* Step 2: Upload */}
      {step === 'idle' && (
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border py-10 transition-colors active:bg-muted/40"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Pilih file Excel</p>
              <p className="text-xs text-muted-foreground mt-0.5">Format .xlsx atau .xls</p>
            </div>
          </button>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{rows.length} baris ditemukan</p>
            <div className="flex gap-3 text-xs">
              <span className="text-income font-semibold">{validCount} valid</span>
              {errorCount > 0 && <span className="text-destructive font-semibold">{errorCount} error</span>}
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden divide-y max-h-72 overflow-y-auto">
            {rows.map((row, i) => (
              <div key={i} className={`flex items-start gap-3 px-3 py-2.5 text-xs ${row.error ? 'bg-[#FEF3F2]' : ''}`}>
                {row.error
                  ? <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                  : <CheckCircle className="h-4 w-4 shrink-0 text-income mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {row.date} · {row.category} · {formatCurrency(row.amount)}
                  </p>
                  {row.error
                    ? <p className="text-destructive">{row.error}</p>
                    : <p className="text-muted-foreground">{row.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}{row.note ? ` · ${row.note}` : ''}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setRows([]); setStep('idle') }} className="flex-1 h-11">
              Ulang
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="flex-1 h-11"
            >
              {importing ? 'Mengimpor…' : `Import ${validCount} transaksi`}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 'done' && result && (
        <div className="rounded-2xl border bg-card p-6 text-center space-y-3 shadow-sm" style={{ borderColor: '#BFF2DC', background: '#F2FCF8' }}>
          <p className="text-3xl">✅</p>
          <p className="font-bold text-foreground">{result.ok} transaksi berhasil diimpor</p>
          {result.skipped > 0 && (
            <p className="text-xs text-muted-foreground">{result.skipped} baris dilewati karena error</p>
          )}
          <Button onClick={() => { setStep('idle'); setRows([]); setResult(null) }} variant="outline" className="w-full h-10">
            Import lagi
          </Button>
        </div>
      )}
    </div>
  )
}
