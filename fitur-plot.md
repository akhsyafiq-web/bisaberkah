## Feature: Budget Planning (Penganggaran Bulanan)

### Konteks Fitur

Tambahkan fitur penganggaran bulanan berbasis kebiasaan pendapatan user. Fitur ini bersifat OPSIONAL dan hanya memberikan gambaran visual/teks tentang alokasi dana — bukan mempengaruhi logika saldo utama secara langsung (pengurangan saldo tetap murni dari transaksi pengeluaran).

---

### Data Model

**Budget (Anggaran)**

- id: string (uuid)
- user_id: string
- nama: string (contoh: "Makan & Minum", "Kebutuhan", "Tabungan")
- nominal_rencana: number (contoh: 5000000)
- bulan: string (format: YYYY-MM, contoh: "2025-06")
- warna: string (opsional, hex color untuk visual)
- created_at: timestamp
- updated_at: timestamp

**BudgetUsage (relasi pengeluaran ke anggaran)**

- id: string
- budget_id: string (FK → Budget)
- transaksi_id: string (FK → Transaksi/Pengeluaran)
- nominal: number (nominal pengeluaran tersebut)
- created_at: timestamp

---

### Logic Inti

1. **Setup Anggaran**
   - User bisa membuat template anggaran berdasarkan perkiraan pendapatan bulanan
   - Setiap bulan, anggaran bisa di-generate ulang dari template, atau dibuat manual
   - Tidak ada validasi total anggaran harus = pendapatan (fleksibel)

2. **Kalkulasi Real-time per Anggaran**
   - nominal_terpakai = SUM(BudgetUsage.nominal) WHERE budget_id = X AND bulan = current_month
   - sisa_anggaran = nominal_rencana - nominal_terpakai
   - status: "aman" | "mepet" (< 20% sisa) | "minus" (sisa < 0)

3. **Integrasi saat Input Pengeluaran**
   - Saat user menginput pengeluaran, tambahkan field OPSIONAL: "Dari anggaran apa?" (dropdown pilih budget bulan ini)
   - Jika dipilih → buat record BudgetUsage
   - Jika tidak dipilih → pengeluaran tetap tercatat normal, hanya tidak terhubung ke budget manapun
   - Saldo utama TETAP berkurang terlepas dari pilihan ini

4. **Kondisi Minus**
   - Jika sisa_anggaran < 0 setelah transaksi → tampilkan warning/catatan pada transaksi tersebut
   - Catatan: "Anggaran [nama] bulan ini minus Rp [jumlah minus]. Pengeluaran ini melebihi sisa anggaran."
   - Tetap izinkan transaksi (tidak diblock)

---

### UI/UX Requirements

**Halaman Anggaran (Budget Page)**

- List kartu anggaran bulan ini, tiap kartu menampilkan:
  - Nama anggaran
  - Progress bar: nominal_terpakai / nominal_rencana
  - Teks: "Rp X dari Rp Y terpakai · Sisa Rp Z"
  - Jika minus: teks dan progress bar berubah warna merah, sisa tampil "- Rp Z"
- Tombol "+ Tambah Anggaran"
- Opsi "Salin dari bulan lalu" untuk kemudahan repeat setup

**Detail Anggaran (per kartu)**

- List transaksi pengeluaran yang terhubung ke anggaran ini (bulan ini)
- Urutkan: terbaru di atas
- Tiap item: nama transaksi, tanggal, nominal
- Total di bawah

**Form Input Pengeluaran (modifikasi)**

- Tambahkan field opsional: "Masukkan ke anggaran" (dropdown, default: "Tidak ada / Skip")
- Tampilkan sisa anggaran di bawah dropdown jika dipilih (real-time hint)
- Jika sisa anggaran setelah input akan minus → tampilkan inline warning (bukan error, user tetap bisa submit)

**Warning Minus saat Input:**

> "⚠️ Anggaran Makan & Minum akan minus Rp 50.000 setelah pengeluaran ini."

**Catatan di detail transaksi (jika terhubung anggaran yang minus):**

> "Pengeluaran ini menyebabkan anggaran Makan & Minum bulan ini minus Rp 50.000."

---

### Edge Cases yang Harus Ditangani

- User hapus anggaran yang sudah punya BudgetUsage → soft delete, transaksi tetap ada tapi "anggaran dihapus"
- User edit nominal_rencana anggaran → recalculate sisa real-time
- User hapus pengeluaran yang terhubung anggaran → hapus juga BudgetUsage terkait → recalculate
- Ganti bulan → anggaran bulan baru kosong, tidak auto-carry kecuali user pilih "Salin dari bulan lalu"
- Pendapatan tidak harus diinput untuk menggunakan fitur ini (bersifat mandiri)

---

### Catatan Penting

- Fitur ini DISPLAY/TRACKING only — tidak memblokir transaksi apapun
- Saldo utama user TIDAK dipengaruhi oleh logika budget (saldo tetap dikurangi oleh transaksi)
- Budget hanya memberikan konteks visual: "dari total pengeluaranmu, sekian untuk kategori X"
- Semua keterkaitan transaksi-budget bersifat OPSIONAL dari sisi user
