## FEATURE ADDITION: Plotting dari Dompet "Tidak Dianggarkan"

### Konteks Fitur

Tambahan subfitur pada dompet sistem "Tidak Dianggarkan". Jika dompet ini memiliki
saldo > 0 DAN user sudah memiliki minimal 1 dompet custom lain, maka user dapat
memindahkan (plotting) sebagian atau seluruh saldo "Tidak Dianggarkan" ke dompet
anggaran lain secara manual.

Ini adalah aksi TRANSFER INTERNAL antar dompet — bukan pemasukan baru, bukan pengeluaran.
Saldo akun utama TIDAK berubah. Hanya distribusi antar dompet yang berubah.

---

### Syarat Fitur Aktif (semua harus terpenuhi)

1. Dompet "Tidak Dianggarkan" memiliki saldo > 0
2. User memiliki minimal 1 dompet custom aktif selain "Tidak Dianggarkan"

Jika salah satu syarat tidak terpenuhi:

- Saldo = 0 → sembunyikan opsi plotting, tampilkan empty state
- Tidak ada dompet lain → tampilkan prompt "Buat dompet anggaran dulu untuk mulai memilah"
  dengan tombol "+ Buat Dompet"

---

### Data Model (Tambahan)

**WalletTransfer (Transfer Internal antar Dompet)**

- id: string
- user_id: string
- bulan: string (YYYY-MM — bulan aktif saat transfer dilakukan)
- from_wallet_id: string (FK → BudgetWallet; selalu "Tidak Dianggarkan" untuk fitur ini)
- to_wallet_id: string (FK → BudgetWallet; dompet tujuan)
- nominal: number (> 0, <= saldo from_wallet saat transaksi)
- catatan: string | null (opsional, ditulis user)
- created_at: timestamp

Aturan:

- nominal transfer TIDAK BOLEH melebihi saldo from_wallet saat itu (validasi backend)
- Saldo from_wallet setelah transfer >= 0 (tidak boleh minus)
- Transfer hanya berlaku dalam bulan yang sama (tidak bisa transfer lintas bulan)
- Transfer bisa dilakukan berkali-kali selama saldo "Tidak Dianggarkan" masih > 0

---

### ALUR: Plotting dari "Tidak Dianggarkan"

ENTRY POINT:
User membuka halaman Anggaran → tap kartu dompet "Tidak Dianggarkan"

HALAMAN DETAIL "TIDAK DIANGGARKAN":
Tampilkan:

- Saldo saat ini: Rp X
- Riwayat transaksi masuk (alokasi pemasukan yang tidak dipilah)
- Riwayat transaksi keluar (pengeluaran tanpa dompet + transfer keluar)
- Riwayat transfer ke dompet lain (dari WalletTransfer)

Jika syarat plotting terpenuhi → tampilkan tombol CTA:
[ Pilah ke Dompet Lain ]

Jika saldo = 0 → tombol tidak tampil, tampilkan:
"Tidak ada dana yang bisa dipilah saat ini."

Jika tidak ada dompet lain → tombol tidak tampil, tampilkan:
"Buat dompet anggaran terlebih dahulu untuk mulai memilah dana ini."

- tombol [ + Buat Dompet ]

---

### UI FLOW: Pilah ke Dompet Lain

LANGKAH 1 — Pilih Dompet Tujuan & Nominal

Tampilkan list semua dompet custom aktif bulan ini (KECUALI "Tidak Dianggarkan"):
┌─────────────────────────────────────────────────┐
│ 🍽 Makan Saldo: Rp 2.000 │
│ Rencana: Rp 10.000 | Kekurangan: Rp 8.000 │
│ Masukkan: [________] [Penuh] [Parsial] [Lewati] │
├─────────────────────────────────────────────────┤
│ 💡 Listrik Saldo: Rp 0 │
│ Rencana: Rp 30.000 | Kekurangan: Rp 30.000 │
│ Masukkan: [________] [Penuh] [Parsial] [Lewati] │
├─────────────────────────────────────────────────┤
│ 🍇 Buah Saldo: Rp 5.000 │
│ Rencana: Rp 10.000 | Kekurangan: Rp 5.000 │
│ Masukkan: [________] [Penuh] [Parsial] [Lewati] │
└─────────────────────────────────────────────────┘

Pilihan per dompet:

- PENUH → isi otomatis sebesar kekurangan dari rencana (nominal_rencana - saldo_saat_ini)
  Jika saldo "Tidak Dianggarkan" tidak cukup untuk "Penuh" → cap di saldo yang tersisa,
  tampilkan hint: "Saldo tidak cukup untuk penuh. Diisi Rp X (maks tersedia)."
- PARSIAL → user input manual nominal (tidak boleh melebihi saldo tersisa "Tidak Dianggarkan")
- LEWATI → default, tidak ada transfer ke dompet ini

Running total di bagian bawah (sticky):
┌─────────────────────────────────────────────────┐
│ Saldo Tidak Dianggarkan : Rp 15.000 │
│ Total dipilah : Rp 13.000 │
│ Sisa setelah dipilah : Rp 2.000 │
│ │
│ [ Konfirmasi Pilah ] │
└─────────────────────────────────────────────────┘

VALIDASI REAL-TIME:

- Jika user mencoba input nominal ke dompet tertentu yang membuat total > saldo "Tidak Dianggarkan"
  → input di-cap otomatis + tampilkan hint: "Saldo tidak mencukupi"
- Tombol "Konfirmasi Pilah" aktif hanya jika minimal 1 dompet dipilih (tidak semua LEWATI)
  dan total dipilah > 0

---

LANGKAH 2 — Konfirmasi

Tampilkan ringkasan sebelum eksekusi:
┌─────────────────────────────────────────────────┐
│ Ringkasan Pilah Dana │
│ │
│ Dari: Tidak Dianggarkan (Rp 15.000) │
│ │
│ → 🍽 Makan + Rp 8.000 │
│ → 💡 Listrik + Rp 5.000 │
│ │
│ Total dipilah : Rp 13.000 │
│ Sisa Tidak Dianggarkan : Rp 2.000 │
│ │
│ [ Batal ] [ Pilah Sekarang ] │
└─────────────────────────────────────────────────┘

---

LANGKAH 3 — Eksekusi & Feedback

Setelah konfirmasi:

1. Buat record WalletTransfer untuk setiap dompet tujuan yang dipilih
2. Kurangi saldo BudgetWallet "Tidak Dianggarkan" sebesar total transfer
3. Tambah saldo BudgetWallet masing-masing dompet tujuan
4. Semua operasi dalam satu transaksi DB (atomic) — jika salah satu gagal, semua rollback

Success state:
"✅ Dana berhasil dipilah ke [jumlah] dompet."
→ Kembali ke halaman detail "Tidak Dianggarkan" dengan saldo ter-update

Error state (gagal sebagian/semua):
"❌ Gagal memilah dana. Tidak ada perubahan yang disimpan. Coba lagi."

---

### Tampilan Riwayat Transfer di Detail Dompet

Di halaman detail dompet TUJUAN (misal: Makan):
Tampilkan entri transfer masuk sebagai item tersendiri di riwayat:
┌─────────────────────────────────────────────────┐
│ 🔄 Dipilah dari Tidak Dianggarkan + Rp 8.000 │
│ 14 Jun 2025 │
└─────────────────────────────────────────────────┘

Di halaman detail "TIDAK DIANGGARKAN":
Tampilkan entri transfer keluar:
┌─────────────────────────────────────────────────┐
│ 🔄 Dipilah ke Makan - Rp 8.000 │
│ 14 Jun 2025 │
│ 🔄 Dipilah ke Listrik - Rp 5.000 │
│ 14 Jun 2025 │
└─────────────────────────────────────────────────┘

Label transaksi di riwayat: gunakan icon 🔄 untuk membedakan dari
pemasukan (➕) dan pengeluaran (➖)

---

### Edge Cases

1. User memilih PENUH di semua dompet, tapi total kekurangan semua dompet > saldo "Tidak Dianggarkan"
   → Sistem isi dompet satu per satu dari atas ke bawah sampai saldo habis
   → Dompet berikutnya yang tidak kebagian → otomatis LEWATI + tampilkan hint per dompet:
   "Saldo tidak mencukupi untuk mengisi dompet ini."
   → User bisa adjust manual sebelum konfirmasi

2. Saldo "Tidak Dianggarkan" berubah di tengah proses (misal ada pengeluaran masuk dari background)
   → Saat konfirmasi, validasi ulang saldo di backend
   → Jika saldo sudah tidak cukup → tolak, tampilkan error + refresh saldo terkini

3. User transfer lalu ingin undo
   → Tidak ada fitur undo otomatis
   → User harus melakukan plotting balik secara manual dari dompet tujuan
   (catatan: fitur plotting balik dari dompet custom ke "Tidak Dianggarkan" adalah scope terpisah)

4. Dompet tujuan dihapus setelah transfer tapi sebelum bulan berakhir
   → Saldo dompet yang dihapus kembali ke "Tidak Dianggarkan" (lihat aturan hapus dompet)
   → WalletTransfer tetap tersimpan untuk keperluan histori

5. Transfer dilakukan di akhir bulan, saldo carry-over ke bulan baru
   → Saldo hasil transfer ikut carry-over normal ke bulan berikutnya
   → Tidak ada perlakuan khusus

---

### Terminologi Tambahan (konsisten di semua UI)

- "Pilah" = aksi memindahkan dana dari "Tidak Dianggarkan" ke dompet lain (transfer internal)
- "Dipilah dari" = label di riwayat dompet tujuan (dana masuk via transfer)
- "Dipilah ke" = label di riwayat "Tidak Dianggarkan" (dana keluar via transfer)
- "Kekurangan" = selisih antara nominal_rencana dan saldo saat ini pada dompet tujuan
- "Sisa setelah dipilah" = saldo "Tidak Dianggarkan" setelah semua transfer dikonfirmasi
