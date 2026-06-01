'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { CurrencyInput } from '@/components/shared/CurrencyInput'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils/currency'

const NISAB_GRAM = 85

export default function ZakatPage() {
  const router = useRouter()
  const [hargaEmas, setHargaEmas] = useState(1650000)
  const [uangTunai, setUangTunai] = useState(0)
  const [gramEmas, setGramEmas] = useState(0)
  const [piutang, setPiutang] = useState(0)
  const [investasi, setInvestasi] = useState(0)
  const [hutang, setHutang] = useState(0)

  const nilaiEmas = gramEmas * hargaEmas
  const totalHarta = uangTunai + nilaiEmas + piutang + investasi
  const hartaBersih = Math.max(0, totalHarta - hutang)
  const nisab = NISAB_GRAM * hargaEmas
  const wajibZakat = hartaBersih >= nisab && nisab > 0
  const nominalZakat = wajibZakat ? hartaBersih * 0.025 : 0

  function handleCatatZakat() {
    router.push(`/transactions/new?type=expense&note=Zakat+Maal&amount=${Math.round(nominalZakat)}`)
  }

  return (
    <main className="pb-6">
      <PageHeader title="Kalkulator Zakat Maal" showBack />

      <div className="px-4 pt-4 space-y-5">
        {/* Info */}
        <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground" style={{ borderColor: '#FCEBB3', background: '#FFFBF0' }}>
          <p>Zakat Maal wajib jika harta bersih mencapai nisab (85 gram emas) dan sudah 1 tahun (haul).</p>
        </div>

        {/* Harga emas */}
        <div className="space-y-1.5">
          <Label>Harga emas saat ini (per gram)</Label>
          <CurrencyInput value={hargaEmas} onChange={setHargaEmas} />
          <p className="text-xs text-muted-foreground">Cek harga terbaru di Google: "harga emas hari ini"</p>
        </div>

        {/* Harta */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">Harta</p>
          {[
            { label: 'Uang tunai + tabungan', value: uangTunai, onChange: setUangTunai },
            { label: 'Piutang yang diharapkan kembali', value: piutang, onChange: setPiutang },
            { label: 'Investasi / saham', value: investasi, onChange: setInvestasi },
          ].map(f => (
            <div key={f.label} className="space-y-1.5">
              <Label>{f.label}</Label>
              <CurrencyInput value={f.value} onChange={f.onChange} />
            </div>
          ))}
          <div className="space-y-1.5">
            <Label>Logam mulia / emas yang dimiliki (gram)</Label>
            <div className="relative flex items-center">
              <input
                type="number" inputMode="decimal" min={0} step={0.1}
                value={gramEmas || ''}
                onChange={e => setGramEmas(parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="flex h-12 w-full rounded-md border border-input bg-background px-3 text-right text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <span className="absolute left-3 text-sm text-muted-foreground">gr</span>
            </div>
            {gramEmas > 0 && (
              <p className="text-xs text-muted-foreground">= {formatCurrency(nilaiEmas)}</p>
            )}
          </div>
        </div>

        {/* Hutang */}
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">Pengurang</p>
          <Label>Total hutang yang harus dibayar</Label>
          <CurrencyInput value={hutang} onChange={setHutang} />
        </div>

        {/* Result */}
        <div
          className="rounded-2xl border p-4 space-y-3"
          style={wajibZakat
            ? { background: '#F2FCF8', borderColor: '#BFF2DC' }
            : { background: '#F9FAFB', borderColor: '#EAECF0' }}
        >
          <p className="text-sm font-semibold text-foreground">Hasil Kalkulasi</p>
          <div className="space-y-1 text-sm divide-y divide-border">
            <Row label="Total Harta" value={formatCurrency(totalHarta)} />
            <Row label="Total Hutang" value={`− ${formatCurrency(hutang)}`} />
            <Row label="Harta Bersih" value={formatCurrency(hartaBersih)} bold />
            <Row label={`Nisab (${NISAB_GRAM}gr emas)`} value={formatCurrency(nisab)} />
          </div>

          <div className={`mt-2 rounded-xl px-4 py-3 text-center ${wajibZakat ? 'bg-[#E3FAF0]' : 'bg-muted'}`}>
            {nisab === 0 ? (
              <p className="text-sm text-muted-foreground">Masukkan harga emas untuk menghitung nisab</p>
            ) : wajibZakat ? (
              <>
                <p className="text-xs font-medium" style={{ color: '#086848' }}>✅ Wajib Zakat</p>
                <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color: '#07835A', letterSpacing: '-0.02em' }}>
                  {formatCurrency(nominalZakat)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#07835A' }}>2,5% dari harta bersih</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">❌ Belum wajib zakat (di bawah nisab)</p>
            )}
          </div>

          {wajibZakat && (
            <button
              onClick={handleCatatZakat}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors active:opacity-80"
              style={{ background: '#07835A' }}
            >
              Catat sebagai Pengeluaran Zakat
            </button>
          )}
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted-foreground pb-2">
          Kalkulator ini hanya alat bantu. Konsultasikan dengan ustaz atau lembaga zakat untuk hasil yang lebih akurat.
        </p>
      </div>
    </main>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'font-bold text-foreground' : 'font-medium text-foreground'}>{value}</span>
    </div>
  )
}
