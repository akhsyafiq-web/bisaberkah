## FEATURE REVISION: Budget / Plotting — Envelope-Based Mental Model

### Perubahan Paradigma Inti

Fitur anggaran ini BUKAN lagi sekadar "kategori pengeluaran".
Ini adalah sistem AMPLOP DIGITAL — user memilah dana nyata dari pemasukan
ke dalam "dompet" anggaran masing-masing. Mirip metode cash envelope budgeting.

Konsep utama:

- Anggaran = amplop/dompet yang punya SALDO NYATA (bukan hanya rencana)
- Saldo anggaran berasal dari ALOKASI PEMASUKAN, bukan otomatis dari rencana
- Pengeluaran mengurangi SALDO ANGGARAN yang dipilih, bukan saldo utama langsung
- Saldo utama akun = total dari semua saldo anggaran yang ada
- Saldo dompet TIDAK PERNAH minus — nilai minimum saldo dompet adalah 0

---

### Data Model (Revisi)

**BudgetTemplate (Rencana Bulanan)**

- id: string
- user_id: string
- nama: string (contoh: "Makan", "Listrik", "Buah")
- nominal_rencana: number (target alokasi bulanan; 0 untuk dompet sistem)
- urutan: number (untuk display ordering)
- aktif: boolean
- is_system: boolean
  → TRUE hanya untuk dompet "Tidak Dianggarkan" (tidak bisa dihapus, tidak bisa diubah namanya)

**BudgetWallet (Dompet / Realisasi per Bulan)**

- id: string
- template_id: string (FK → BudgetTemplate)
- user_id: string
- bulan: string (YYYY-MM)
- saldo: number (>= 0, TIDAK BOLEH negatif)
- nominal_rencana: number (snapshot dari template saat bulan dibuat; 0 untuk "Tidak Dianggarkan")
- created_at: timestamp

**IncomeAllocation (Alokasi Pemasukan ke Dompet)**

- id: string
- pemasukan_id: string (FK → Transaksi Pemasukan)
- wallet_id: string (FK → BudgetWallet)
- nominal_dialokasikan: number
- created_at: timestamp

**ExpenseFromWallet (Pengeluaran dari Dompet)**

- id: string
- pengeluaran_id: string (FK → Transaksi Pengeluaran)
- wallet_id: string (FK → BudgetWallet)
- nominal: number
- is_overflow: boolean
  → TRUE jika pengeluaran ini menghabiskan saldo dompet sampai 0 namun nominal pengeluaran
  melebihi saldo yang tersedia (selisihnya dicatat di overflow_note)
- overflow_note: string | null
  → Catatan otomatis: "Saldo dompet tidak mencukupi. Kekurangan Rp X ditutup dari [sumber]."
- created_at: timestamp

---

### Dompet Sistem: "Tidak Dianggarkan"

Aturan:

- Dibuat otomatis oleh sistem saat user pertama kali setup akun / fitur anggaran
- TIDAK BISA dihapus, TIDAK BISA diubah namanya, TIDAK BISA diubah nominal_rencana-nya
- Selalu muncul paling bawah di list dompet, dengan visual berbeda (abu-abu / secondary style)
- Fungsinya sebagai "penampung default":
  1. Sisa pemasukan yang tidak dipilah ke dompet manapun → otomatis masuk ke sini
  2. Pengeluaran yang tidak memilih dompet manapun → otomatis diambil dari sini
  3. Jika saldo "Tidak Dianggarkan" tidak cukup untuk pengeluaran tanpa dompet →
     saldo menjadi 0, dan kekurangan dicatat sebagai overflow_note

Tampilan kartu dompet "Tidak Dianggarkan":
┌─────────────────────────────────────┐
│ 📂 Tidak Dianggarkan [SYS] │
│ Saldo: Rp 5.000 │
│ (Dana yang belum dipilah ke dompet) │
└─────────────────────────────────────┘

- Tidak ada progress bar (tidak ada nominal_rencana)
- Tidak ada label "Rencana"
- Badge [SYS] atau label kecil "Otomatis" untuk membedakan dari dompet user

---

### ALUR 1: Setup Anggaran (Perencanaan)

User membuat template anggaran bulanan:

- Nama dompet + nominal rencana per bulan
- Ini adalah TARGET, bukan saldo
- Template ini dipakai setiap bulan sebagai acuan alokasi
- User bisa edit template kapan saja (tidak mempengaruhi bulan yang sudah berjalan)
- Dompet "Tidak Dianggarkan" selalu ada, tidak perlu dibuat

Tampilan di halaman Anggaran:

- List dompet user (custom) → diurutkan sesuai preferensi user
- Dompet "Tidak Dianggarkan" → selalu paling bawah, tampilan dibedakan
- Tombol "+ Tambah Dompet Anggaran"

---

### ALUR 2: Input Pemasukan → Pemilahan ke Dompet

Saat user menginput PEMASUKAN, tampilkan langkah opsional:
"Pilah pemasukan ini ke dompet anggaran kamu"

UI Flow:

1. User masukkan nominal pemasukan (misal: 50.000 dari Gaji)
2. Sistem tampilkan seluruh dompet anggaran bulan ini (KECUALI "Tidak Dianggarkan") dengan:
   - Nama dompet
   - Nominal rencana (target)
   - Saldo saat ini
   - Kekurangan dari rencana = nominal_rencana - saldo_saat_ini
3. Setiap dompet punya pilihan: [Penuh] [Parsial] [Lewati]
   - PENUH → isi kekurangan dari rencana (nominal_rencana - saldo_saat_ini)
   - PARSIAL → user input manual berapa yang mau dimasukkan
   - LEWATI → tidak dialokasikan ke dompet ini
4. Tampilkan running total: "Sudah dialokasikan: Rp X dari Rp Y"
5. Sisa yang tidak dipilah ke dompet manapun → OTOMATIS masuk ke dompet "Tidak Dianggarkan"
   Tampilkan: "Sisa Rp Z → masuk ke Tidak Dianggarkan"
6. TIDAK ADA dana yang "hilang" — semua pemasukan selalu punya dompet tujuan

VALIDASI:

- Total alokasi ke semua dompet TIDAK BOLEH melebihi nominal pemasukan
- Sistem hitung real-time sisa yang bisa dialokasikan
- Jika user coba alokasikan lebih dari sisa → disable input / tampilkan error inline

---

### ALUR 3: Carry-Over Saldo Bulan Baru

Saat masuk ke bulan baru (otomatis, atau saat user membuka app di bulan baru):

1. Sistem buat BudgetWallet baru untuk bulan ini berdasarkan BudgetTemplate aktif
2. Saldo awal tiap dompet = saldo akhir dompet bulan lalu (carry-over, termasuk dompet "Tidak Dianggarkan")
3. Saldo awal SELALU >= 0 (tidak ada kemungkinan bawa negatif karena saldo tidak pernah minus)
4. Tampilkan notifikasi/banner: "Bulan baru dimulai. Sisa anggaran bulan lalu sudah dipindahkan."
5. User bisa lihat breakdown: "Saldo awal = Rp X (sisa bulan lalu)"

Edge case:

- Dompet baru yang belum ada di bulan lalu → saldo awal = 0
- Template yang dihapus → tidak dibuat dompet baru, dompet lama tetap ada untuk histori
- Jika user belum pernah setup → bulan baru dimulai dengan saldo 0 (semua dompet)

---

### ALUR 4: Input Pengeluaran → Ambil dari Dompet

Saat user input PENGELUARAN:

1. User input nominal pengeluaran (misal: 45.000 untuk Makan Siang)
2. DEFAULT: pengeluaran otomatis diambil dari dompet "Tidak Dianggarkan"
   User bisa override dengan memilih dompet lain
3. Tampilkan list dompet dengan saldo masing-masing (termasuk "Tidak Dianggarkan")

Skenario A — SALDO CUKUP:

- User pilih 1 dompet, saldo dompet >= nominal pengeluaran
- Saldo dompet berkurang, saldo >= 0
- Selesai

Skenario B — SALDO TIDAK CUKUP (satu dompet):

- User pilih dompet A, saldo dompet A < nominal pengeluaran
- Sistem tampilkan:
  "Saldo dompet ini hanya Rp X. Kekurangan Rp Y perlu ditutup dari dompet lain."
- Saldo dompet A habis menjadi 0
- Sistem otomatis catat overflow_note pada ExpenseFromWallet:
  "Saldo dompet [nama] tidak mencukupi. Kekurangan Rp Y ditutup dari [dompet lain]."
- User diminta pilih dompet tambahan untuk menutup kekurangan
- Ulangi sampai total terpenuhi = nominal pengeluaran

Skenario C — SPLIT dari beberapa dompet (manual):

- User bisa pilih lebih dari 1 dompet sejak awal
- Sistem tampilkan running total: "Terpenuhi: Rp X | Sisa kekurangan: Rp Y"
- Setiap dompet yang dipilih: user tentukan ambil berapa (PENUH atau PARSIAL)
- Tidak boleh ambil lebih dari saldo dompet tersebut (input di-cap otomatis)
- Lanjut tambah dompet sampai kekurangan = 0

Skenario D — TOTAL SEMUA DOMPET TIDAK CUKUP:

- Jika user memilih semua dompet yang tersedia tapi total saldo masih < nominal pengeluaran
- Semua dompet yang dipilih habis menjadi 0
- Sistem tampilkan warning konfirmasi:
  "Total saldo dompet yang dipilih tidak mencukupi. Kekurangan Rp Z tidak tertutup oleh dompet manapun."
- User konfirmasi → pengeluaran tetap dicatat, saldo akun utama tetap berkurang
- Pada transaksi ini, ditampilkan catatan: "Kekurangan Rp Z tidak tercakup anggaran."
- Dompet yang terlibat tetap menjadi 0, TIDAK minus

ATURAN KERAS — SALDO DOMPET:

- Saldo dompet minimum adalah 0
- Sistem TIDAK PERNAH membiarkan saldo dompet < 0
- Jika pengeluaran melebihi saldo dompet → saldo dompet = 0, kelebihan dicatat sebagai
  overflow_note dan ditampilkan sebagai catatan pada transaksi tersebut
- Validasi ini dijalankan di backend (bukan hanya frontend)

---

### Tampilan Catatan Overflow pada Transaksi

Di halaman detail transaksi pengeluaran, jika ada overflow:
┌─────────────────────────────────────────────────────┐
│ ⚠️ Catatan Anggaran │
│ Pengeluaran ini melebihi saldo beberapa dompet: │
│ • Makan: saldo habis (Rp 3.000 tidak tertutup) │
│ • Kekurangan Rp 3.000 ditutup dari: Tidak Dianggarkan│
└─────────────────────────────────────────────────────┘

Jika kekurangan tidak bisa ditutup dompet manapun:
┌─────────────────────────────────────────────────────┐
│ ⚠️ Catatan Anggaran │
│ Kekurangan Rp Z tidak tercakup oleh dompet apapun. │
│ Pengeluaran ini di luar kapasitas anggaran bulan ini.│
└─────────────────────────────────────────────────────┘

---

### Tampilan Halaman Anggaran (Budget Page)

Tiap kartu dompet user menampilkan:
┌─────────────────────────────────────┐
│ 🍽 Makan │
│ Rencana: Rp 10.000 / bulan │
│ Saldo: Rp 8.500 │
│ ████████████░░░ 85% │
│ Sudah dipakai: Rp 1.500 │
└─────────────────────────────────────┘

State kartu dompet user:

- Normal (saldo > 20% rencana) → warna default
- Mepet (saldo <= 20% rencana) → warna kuning/amber
- Habis (saldo = 0) → warna abu-abu, label "Habis"

State kartu "Tidak Dianggarkan":

- Selalu tampil paling bawah
- Tidak ada progress bar, tidak ada rencana
- Hanya tampilkan saldo saat ini
- Warna secondary/abu-abu untuk membedakan dari dompet utama

---

### Summary Widget di Dashboard

Tampilkan ringkasan anggaran di dashboard utama:

- Total saldo semua dompet (termasuk Tidak Dianggarkan): Rp X
- Saldo tidak dianggarkan: Rp Y
- Dompet paling mepet: [nama] — sisa Rp Z
- Link: "Lihat semua anggaran →"

---

### Edge Cases

1. User hapus dompet custom yang masih ada saldo
   → Konfirmasi dulu. Saldo dompet tersebut otomatis pindah ke "Tidak Dianggarkan"
2. User edit nominal_rencana template
   → Hanya berlaku bulan depan, tidak ubah saldo bulan ini
3. Pemasukan dihapus setelah ada alokasi
   → Tanya: hapus juga alokasi? Jika ya, kurangi saldo dompet terkait (tidak boleh < 0,
   jika pengurangan akan membuat minus → kurangi sampai 0, catat selisihnya)
4. Pengeluaran dihapus yang terhubung dompet
   → Kembalikan saldo ke dompet tersebut (reverse ExpenseFromWallet)
5. User tidak punya template anggaran selain "Tidak Dianggarkan"
   → Semua pemasukan masuk ke "Tidak Dianggarkan", semua pengeluaran keluar dari sana
6. Carry-over dari bulan lalu selalu >= 0 (tidak ada skenario carry negatif)

---

### Terminologi yang Dipakai (konsisten di semua UI)

- "Dompet" = satu slot anggaran dengan saldo nyata
- "Rencana" = nominal target bulanan dari template
- "Saldo" = dana nyata yang ada di dompet saat ini (selalu >= 0)
- "Pilah" = aksi mengalokasikan pemasukan ke dompet
- "Ambil dari" = aksi mengurangi saldo dompet saat pengeluaran
- "Tidak Dianggarkan" = dompet sistem default, penampung sisa pemasukan & pengeluaran tanpa dompet
- "Sisa bulan lalu" = carry-over otomatis ke bulan baru
- "Catatan anggaran" = overflow_note yang muncul jika pengeluaran melebihi saldo dompet
