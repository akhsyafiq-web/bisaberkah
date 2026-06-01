import * as XLSX from 'xlsx'
import type { Category } from '@/types/database'

export interface ImportRow {
  date: string        // YYYY-MM-DD
  type: 'income' | 'expense'
  category: string
  amount: number
  note: string
  category_id?: string
  error?: string
}

export function generateTemplate(): void {
  const wb = XLSX.utils.book_new()

  const expenseRows = [
    ['Tanggal', 'Kategori', 'Nominal', 'Catatan'],
    ['2026-06-01', 'Makan', 50000, 'Makan siang'],
    ['2026-06-02', 'Transportasi', 30000, 'Ojek'],
  ]
  const incomeRows = [
    ['Tanggal', 'Kategori', 'Nominal', 'Catatan'],
    ['2026-06-01', 'Gaji', 5000000, 'Gaji bulanan'],
  ]
  const guideRows = [
    ['Panduan Import BisaBerkah'],
    [''],
    ['1. Isi sheet Pengeluaran dan/atau Pemasukan'],
    ['2. Kolom Tanggal: format YYYY-MM-DD (contoh: 2026-06-01)'],
    ['3. Kolom Kategori: harus sesuai nama kategori yang ada di app'],
    ['4. Kolom Nominal: angka tanpa titik/koma (contoh: 50000)'],
    ['5. Kolom Catatan: opsional'],
  ]

  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expenseRows), 'Pengeluaran')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomeRows), 'Pemasukan')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(guideRows), 'Panduan')

  XLSX.writeFile(wb, 'Template_BisaBerkah.xlsx')
}

export function parseImportFile(
  file: File,
  categories: Category[]
): Promise<ImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array' })
        const catMap = new Map(categories.map(c => [c.name.toLowerCase().trim(), c]))
        const rows: ImportRow[] = []

        for (const [sheetName, type] of [['Pengeluaran', 'expense'], ['Pemasukan', 'income']] as const) {
          const ws = wb.Sheets[sheetName]
          if (!ws) continue
          const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

          for (const r of raw) {
            const dateRaw = String(r['Tanggal'] ?? '').trim()
            const catRaw = String(r['Kategori'] ?? '').trim()
            const amtRaw = r['Nominal']
            const noteRaw = String(r['Catatan'] ?? '').trim()

            const row: ImportRow = {
              date: dateRaw,
              type,
              category: catRaw,
              amount: Number(amtRaw) || 0,
              note: noteRaw,
            }

            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRaw)) {
              row.error = `Tanggal tidak valid: "${dateRaw}"`
            } else if (!catRaw) {
              row.error = 'Kategori kosong'
            } else if (!catMap.has(catRaw.toLowerCase())) {
              row.error = `Kategori tidak ditemukan: "${catRaw}"`
            } else if (row.amount <= 0) {
              row.error = `Nominal tidak valid: "${amtRaw}"`
            } else {
              row.category_id = catMap.get(catRaw.toLowerCase())!.id
            }

            rows.push(row)
          }
        }
        resolve(rows)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
