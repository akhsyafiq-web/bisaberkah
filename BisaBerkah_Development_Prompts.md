# BisaBerkah — Step-by-Step Development Prompts
### Panduan Prompt untuk VSCode + Claude AI

> **Cara pakai dokumen ini:**
> Ikuti setiap FASE secara berurutan. Setiap prompt sudah siap di-copy-paste ke Claude di VSCode (via Claude Code atau Copilot Chat). Bagian `[KONTEKS]` adalah catatan untukmu — tidak perlu dikirim ke Claude.

---

## PERSIAPAN SEBELUM MULAI

Pastikan kamu sudah install:
- Node.js v20+
- Git
- VSCode
- Extension: **Claude** (Anthropic) atau **Cursor**
- Akun Supabase (gratis)
- Akun Vercel (gratis)

---

---

# ═══════════════════════════════════════
# FASE 0 — PROJECT SETUP & KONFIGURASI
# ═══════════════════════════════════════

---

## PROMPT 0.1 — Inisialisasi Project Next.js + shadcn/ui

```
Bantu aku setup project Next.js 14 baru untuk aplikasi mobile web bernama "BisaBerkah" — aplikasi pencatatan keuangan keluarga.

Jalankan langkah-langkah ini secara berurutan:

1. Buat project Next.js dengan App Router:
   npx create-next-app@latest bisaberkah --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

2. Masuk ke folder project:
   cd bisaberkah

3. Inisialisasi shadcn/ui dengan preset nova (clean, modern):
   npx shadcn@latest init --preset base-nova

4. Install semua dependencies yang dibutuhkan:
   npm install @supabase/supabase-js @supabase/ssr
   npm install zustand
   npm install recharts
   npm install date-fns
   npm install xlsx
   npm install sonner
   npm install lucide-react
   npm install clsx tailwind-merge

5. Buat struktur folder berikut di dalam src/:
   src/
   ├── app/
   │   ├── (auth)/
   │   │   ├── login/
   │   │   └── register/
   │   ├── (app)/
   │   │   ├── dashboard/
   │   │   ├── transactions/
   │   │   ├── reports/
   │   │   ├── budget/
   │   │   ├── debts/
   │   │   ├── goals/
   │   │   └── settings/
   │   └── api/
   ├── components/
   │   ├── ui/          ← shadcn components (auto-generated)
   │   ├── layout/      ← bottom nav, header, shell
   │   ├── features/    ← feature-specific components
   │   └── shared/      ← reusable components
   ├── lib/
   │   ├── supabase/
   │   ├── utils/
   │   └── validations/
   ├── hooks/
   ├── stores/          ← zustand stores
   └── types/

Setelah selesai, tampilkan struktur folder yang terbentuk dan konfirmasi tidak ada error.
```

---

## PROMPT 0.2 — Konfigurasi Tema Warna Hijau (BisaBerkah Brand)

```
Aku sudah setup shadcn/ui dengan preset nova. Sekarang aku perlu mengubah warna primary dari hitam/default menjadi hijau seperti Supabase (hijau #3ECF8E atau setara).

Yang perlu diubah:
1. Edit file globals.css (atau tailwind CSS variable file dari shadcn) — ubah CSS variable --primary dan --primary-foreground:

   Untuk light mode:
   --primary: 152 69% 50%;        /* Hijau Supabase-style, HSL */
   --primary-foreground: 0 0% 100%;

   Untuk dark mode (jika ada):
   --primary: 152 69% 45%;
   --primary-foreground: 0 0% 100%;

2. Tambahkan juga custom CSS variable brand berikut di :root:
   --brand-green: #3ECF8E;
   --brand-green-dark: #16A34A;
   --brand-green-light: #DCFCE7;
   --income-color: #16A34A;
   --expense-color: #DC2626;
   --amal-color: #7C3AED;

3. Pastikan warna hijau ini HANYA muncul di komponen tertentu saja:
   - Button (variant="default")
   - Badge (variant="default")
   - Checkbox saat checked
   - Switch saat aktif
   - Progress bar
   
   Elemen lain tetap pakai warna netral (putih, abu-abu, hitam untuk text).

4. Buat file src/lib/utils/cn.ts jika belum ada, berisi:
   import { clsx, type ClassValue } from "clsx"
   import { twMerge } from "tailwind-merge"
   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }

Tampilkan isi final dari file globals.css dan konfirmasi perubahan sudah benar.
```

---

## PROMPT 0.3 — Setup Supabase Client & TypeScript Types

```
Setup koneksi Supabase untuk project BisaBerkah. Buat file-file berikut:

1. File .env.local di root project:
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000

2. File src/lib/supabase/client.ts — untuk client-side:
   import { createBrowserClient } from '@supabase/ssr'
   export const createClient = () => createBrowserClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )

3. File src/lib/supabase/server.ts — untuk server-side (Next.js App Router):
   Gunakan createServerClient dari @supabase/ssr dengan cookie handling yang benar untuk Next.js App Router.

4. File src/lib/supabase/middleware.ts — untuk refresh session:
   Buat updateSession function yang dipakai di middleware.ts root.

5. File middleware.ts di root project:
   Protect semua route /app/* — redirect ke /login jika belum auth.
   Route /login dan /register bisa diakses tanpa auth.

6. File src/types/database.ts — TypeScript types untuk semua tabel Supabase:
   Buat interface untuk:
   - Profile
   - Household
   - Category (dengan type: 'income' | 'expense')
   - Transaction
   - Budget
   - Debt
   - DebtPayment
   - Goal
   - GoalSaving

   Juga buat type Database yang menggabungkan semua tabel untuk Supabase generics.

Pastikan semua file menggunakan TypeScript yang strict dan tidak ada any type.
```

---

## PROMPT 0.4 — Database Schema di Supabase

```
Buatkan SQL migration script lengkap untuk Supabase. Script ini akan aku jalankan di Supabase SQL Editor.

Buat file src/lib/supabase/migrations/001_initial_schema.sql dengan isi:

1. Tabel profiles (extends auth.users):
   - id uuid PRIMARY KEY REFERENCES auth.users(id)
   - display_name text
   - avatar_url text
   - household_id uuid
   - created_at timestamptz DEFAULT now()

2. Tabel households:
   - id uuid PRIMARY KEY DEFAULT gen_random_uuid()
   - name text NOT NULL
   - created_by uuid REFERENCES auth.users(id)
   - created_at timestamptz DEFAULT now()

3. Tabel categories:
   - id, household_id, name, type (income/expense), icon (emoji), is_default boolean, color text, created_at

4. Tabel transactions:
   - id, household_id, user_id, type (income/expense), amount numeric(15,2), category_id, date, note, receipt_url, created_at, updated_at

5. Tabel budgets:
   - id, household_id, category_id, amount, period_type (monthly/weekly), period_start, period_end, created_at

6. Tabel debts:
   - id, household_id, creditor_name, total_amount, paid_amount DEFAULT 0, due_date, status (active/paid), note, created_at, updated_at

7. Tabel debt_payments:
   - id, debt_id (FK ke debts ON DELETE CASCADE), amount, paid_at date, note, created_at

8. Tabel goals:
   - id, household_id, name, target_amount, saved_amount DEFAULT 0, duration_months int, start_date, deadline_date (GENERATED dari start_date + duration_months), status (active/achieved/paused), note, created_at, updated_at

9. Tabel goal_savings:
   - id, goal_id (FK ke goals ON DELETE CASCADE), amount, saved_at date, note, created_at

10. Setelah semua tabel, tambahkan:
    - Enable Row Level Security (RLS) untuk SEMUA tabel
    - RLS Policy untuk setiap tabel: user hanya bisa akses data dari household mereka sendiri
    - Trigger: otomatis buat profile dan household saat user baru register
    - Insert default categories untuk household baru (Makan, Listrik, Air, Transportasi, Gaji, dll — minimal 15 kategori)

11. Index yang diperlukan:
    - transactions(household_id, date)
    - transactions(household_id, category_id)
    - transactions(household_id, type)

Tampilkan SQL lengkap yang siap dijalankan di Supabase SQL Editor.
```

---

---

# ═══════════════════════════════════════
# FASE 1 — LAYOUT & AUTENTIKASI
# ═══════════════════════════════════════

---

## PROMPT 1.1 — Layout Shell Mobile (Bottom Navigation)

```
Buat layout utama untuk app BisaBerkah yang mobile-first. Ini adalah komponen paling penting karena menjadi shell seluruh aplikasi.

Spesifikasi:
- Max width: 430px, centered di tengah layar (agar terlihat bagus di desktop juga)
- Background page: #FAFAF9 (warm off-white)
- Bottom Navigation Bar: fixed di bawah, 5 tab

Buat file-file berikut:

1. src/components/layout/AppShell.tsx
   - Wrapper utama dengan max-w-[430px] mx-auto
   - Min-height: 100dvh (dynamic viewport height, penting untuk mobile)
   - Padding bottom sesuai tinggi bottom nav (pb-20)
   - Safe area inset untuk iPhone notch: env(safe-area-inset-bottom)

2. src/components/layout/BottomNav.tsx
   - 5 tab: Home (🏠), Laporan (📊), Tambah (+), Goals (🎯), Akun (👤)
   - Tab tengah "+" adalah FAB yang lebih besar dan berwarna hijau (primary)
   - Active state: icon dan label berwarna primary (hijau), inactive: muted
   - Fixed bottom, background putih, border-top tipis
   - Gunakan Next.js Link untuk navigasi
   - usePathname() untuk detect active tab

3. src/components/layout/PageHeader.tsx
   - Header sederhana per halaman: title, optional back button, optional action button (kanan)
   - Sticky top, background sama dengan page, blur effect

4. src/app/(app)/layout.tsx
   - Wrap semua halaman app dengan AppShell + BottomNav
   - Cek auth, redirect ke /login jika tidak ada session

5. src/app/(auth)/layout.tsx
   - Layout sederhana tanpa bottom nav
   - Centered content

Gunakan komponen shadcn/ui yang sudah ada. Pastikan semua komponen mobile-responsive dengan touch target minimal 44px (Fitts's Law). Gunakan Lucide React icons.
```

---

## PROMPT 1.2 — Halaman Login & Register

```
Buat halaman Login dan Register untuk BisaBerkah. Desain harus clean, mobile-first, dan menggunakan warna brand hijau di CTA button.

1. src/app/(auth)/login/page.tsx
   Layout:
   - Logo BisaBerkah + tagline "Catat, Rencanakan, Berkah" di atas
   - Form: Email + Password
   - Tombol "Masuk" (variant="default" = hijau)
   - Link "Lupa password?"
   - Divider "atau"
   - Tombol "Masuk dengan Google" (variant="outline")
   - Link ke halaman Register di bawah

2. src/app/(auth)/register/page.tsx
   Layout:
   - Heading "Buat Akun Baru"
   - Form: Nama Lengkap, Email, Password, Konfirmasi Password
   - Tombol "Daftar Sekarang" (hijau)
   - Divider + Google OAuth
   - Link kembali ke Login

3. src/lib/validations/auth.ts
   Zod schema untuk:
   - loginSchema: email valid, password min 6 char
   - registerSchema: name min 2 char, email, password min 8 char, confirmPassword harus match

4. src/hooks/useAuth.ts
   Custom hook dengan fungsi:
   - signInWithEmail(email, password)
   - signUpWithEmail(name, email, password)
   - signInWithGoogle()
   - signOut()
   - Gunakan Supabase client dari src/lib/supabase/client.ts
   - Handle loading state dan error state
   - Setelah register, redirect ke /app/dashboard
   - Setelah login, redirect ke /app/dashboard

5. Error states yang harus di-handle:
   - Email tidak ditemukan
   - Password salah
   - Email sudah terdaftar
   - Network error
   Tampilkan sebagai toast (gunakan sonner) DAN inline di form.

Gunakan shadcn/ui: Card, Input, Button, Label, Separator. Semua form harus accessible dengan proper aria labels.
```

---

---

# ═══════════════════════════════════════
# FASE 2 — DASHBOARD HOME
# ═══════════════════════════════════════

---

## PROMPT 2.1 — Halaman Dashboard

```
Buat halaman Dashboard utama BisaBerkah di src/app/(app)/dashboard/page.tsx

Dashboard harus menampilkan overview keuangan bulan ini. Desain: clean card-based, mobile-first, warna hijau hanya di elemen yang menunjukkan nilai positif/utama.

Komponen yang harus ada di dashboard (urut dari atas ke bawah):

1. HEADER SECTION
   - Greeting: "Assalamu'alaikum, [Nama]! 👋"
   - Tanggal hari ini (format: "Rabu, 20 Mei 2026")
   - Icon bell untuk notifikasi (kosong dulu)

2. SALDO OVERVIEW CARD (Card utama, paling prominent)
   - Label: "Saldo Bulan Ini"
   - Nominal saldo bersih (pemasukan - pengeluaran bulan ini) — besar, bold
   - Jika positif: warna hijau (#16A34A)
   - Jika negatif: warna merah (#DC2626)
   - Sub-info: "↑ Pemasukan: Rp X.XXX.XXX" dan "↓ Pengeluaran: Rp X.XXX.XXX"
   - Background card: gradient hijau muda ke putih atau solid putih

3. QUICK ACTION BUTTONS
   - 4 tombol icon horizontal: "+ Pengeluaran", "+ Pemasukan", "Hutang", "Goals"
   - Rounded, outline style, icon + label kecil
   - Tap langsung buka form yang sesuai

4. TRANSAKSI TERBARU
   - Heading: "Transaksi Terbaru" + link "Lihat Semua →"
   - List 5 transaksi terakhir (tanggal, kategori, nominal)
   - Pengeluaran: nominal merah dengan tanda "−"
   - Pemasukan: nominal hijau dengan tanda "+"
   - Jika kosong: empty state "Belum ada transaksi. Yuk mulai catat!"

5. WIDGET GOALS AKTIF
   - Heading: "Goals Tabungan" + link "Lihat Semua →"
   - Card goals aktif (max 2 ditampilkan): nama goal, progress bar hijau, persentase
   - Jika kosong: CTA buat goal pertama

6. WIDGET AMAL BULAN INI
   - Card kecil dengan background ungu muda (#EDE9FE)
   - Icon 🤲 + "Amal Bulan Ini"
   - Total sedekah + zakat + infaq bulan ini
   - Label "Semoga berkah 🌿"

Buat juga:
- src/components/features/dashboard/SaldoCard.tsx
- src/components/features/dashboard/QuickActions.tsx
- src/components/features/dashboard/RecentTransactions.tsx
- src/components/features/dashboard/GoalsWidget.tsx
- src/components/features/dashboard/AmalWidget.tsx
- src/hooks/useDashboardData.ts — fetch semua data dashboard dari Supabase

Data dashboard diambil dari Supabase dengan query:
- Total income bulan ini dari transactions WHERE type='income' AND date dalam bulan ini
- Total expense bulan ini
- 5 transaksi terbaru
- Goals aktif
- Total amal (categories dengan name IN ('Sedekah','Zakat','Infaq','Wakaf'))

Gunakan shadcn: Card, Badge, Progress, Skeleton (untuk loading state).
```

---

---

# ═══════════════════════════════════════
# FASE 3 — TRANSAKSI (CORE FEATURE)
# ═══════════════════════════════════════

---

## PROMPT 3.1 — Form Tambah Transaksi

```
Buat form tambah transaksi untuk BisaBerkah. Ini adalah fitur paling sering digunakan, jadi UX harus semudah mungkin.

File yang dibuat:
1. src/app/(app)/transactions/new/page.tsx
2. src/components/features/transactions/TransactionForm.tsx
3. src/lib/validations/transaction.ts (Zod schema)
4. src/hooks/useTransactions.ts

Spesifikasi form:

STEP 1 - Toggle Tipe Transaksi (di atas form)
- Dua tab besar: "PENGELUARAN" dan "PEMASUKAN"
- Aktif: background merah (expense) atau hijau (income)
- Ini mengubah tampilan/warna form dan daftar kategori

FIELD FORM:
1. Nominal (field paling atas, paling besar)
   - Input number dengan format Rupiah otomatis
   - Keyboard numeric di mobile (inputMode="decimal")
   - Placeholder: "Rp 0"
   - Auto-format: 50000 → "Rp 50.000"

2. Kategori
   - Grid icon + label (bukan dropdown biasa)
   - Tampil dalam 4 kolom, scrollable horizontal atau grid wrap
   - Kategori berubah sesuai tipe (expense/income)
   - Ada tombol "+ Kategori Baru" di ujung grid
   - Selected state: border hijau + background hijau muda

3. Tanggal
   - Default: hari ini
   - Tap untuk buka date picker
   - Gunakan shadcn Calendar atau native date input

4. Catatan (opsional)
   - Textarea kecil, max 255 karakter
   - Placeholder: "Catatan tambahan (opsional)"

5. Upload Foto Struk (opsional)
   - Tombol kamera icon
   - Preview foto jika sudah dipilih
   - Upload ke Supabase Storage

TOMBOL SIMPAN:
- Full width, variant="default" (hijau)
- Loading state saat submit
- Teks: "Simpan Transaksi"

Setelah simpan berhasil:
- Toast: "✓ Transaksi berhasil dicatat"
- Kembali ke halaman sebelumnya atau dashboard

Juga buat src/app/(app)/transactions/page.tsx:
- List semua transaksi dengan grouping per tanggal
- Filter: Semua | Pemasukan | Pengeluaran
- Search bar di atas
- Pull to refresh (atau tombol refresh)
- Pagination / infinite scroll (10 item per page)
- Tap item → buka detail/edit
- Swipe kiri atau long-press → opsi hapus (dengan konfirmasi)

Hook useTransactions harus punya:
- getTransactions(filter) — dengan filter date range, type, category
- createTransaction(data)
- updateTransaction(id, data)
- deleteTransaction(id)
- importTransactions(array) — untuk Excel import
```

---

## PROMPT 3.2 — Halaman Detail & Edit Transaksi

```
Buat halaman detail dan edit transaksi untuk BisaBerkah.

1. src/app/(app)/transactions/[id]/page.tsx
   - Fetch transaksi by ID dari Supabase
   - Tampilkan detail: nominal (besar), tipe, kategori (icon + nama), tanggal, catatan, foto struk jika ada
   - Tombol "Edit" di header kanan
   - Tombol "Hapus" dengan warna merah — konfirmasi via bottom sheet sebelum hapus
   
2. src/app/(app)/transactions/[id]/edit/page.tsx
   - Gunakan kembali TransactionForm yang sama
   - Pre-fill semua field dengan data existing
   - Tombol simpan berubah jadi "Perbarui Transaksi"

3. Buat komponen src/components/features/transactions/TransactionItem.tsx
   - Card item untuk list transaksi
   - Kiri: icon kategori (dalam circle berwarna), nama kategori, tanggal
   - Kanan: nominal (merah untuk expense, hijau untuk income)
   - Desain compact, touch-friendly

4. Buat komponen src/components/features/transactions/DeleteConfirmSheet.tsx
   - Gunakan shadcn Drawer/Sheet dari bawah
   - Pesan: "Yakin ingin menghapus transaksi ini? Tindakan ini tidak bisa dibatalkan."
   - Tombol: "Batalkan" (outline) + "Hapus" (merah, destructive)

Pastikan ada proper loading skeleton saat fetch data.
```

---

---

# ═══════════════════════════════════════
# FASE 4 — LAPORAN KEUANGAN
# ═══════════════════════════════════════

---

## PROMPT 4.1 — Halaman Laporan

```
Buat halaman Laporan Keuangan untuk BisaBerkah di src/app/(app)/reports/page.tsx

Ini halaman analitik. Harus informatif tapi tetap sederhana dan tidak overwhelming.

Komponen yang dibutuhkan:

1. PERIOD SELECTOR (Tab Chip di atas)
   - Harian | Mingguan | Bulanan | Tahunan | Custom
   - Active chip: background hijau muda, text hijau tua
   - "Custom" membuka date range picker (dari-sampai)
   - Default: Bulanan (bulan ini)

2. SUMMARY CARDS (3 card horizontal scroll atau grid)
   - Card 1: Total Pemasukan (hijau) + angka
   - Card 2: Total Pengeluaran (merah) + angka
   - Card 3: Saldo Bersih (hijau/merah tergantung nilai)

3. BAR CHART — Pemasukan vs Pengeluaran
   - Menggunakan Recharts BarChart
   - X axis: tanggal/minggu/bulan tergantung periode
   - 2 bar: hijau (income) + merah (expense)
   - Responsive, touch-friendly tooltip
   - Warna sesuai brand: #16A34A dan #DC2626

4. PIE CHART / DONUT CHART — Breakdown Pengeluaran per Kategori
   - Menggunakan Recharts PieChart
   - Legend di bawah chart
   - Tap slice → highlight + tampilkan nominal
   - Warna tiap kategori berbeda (generate dari palette)

5. DAFTAR BREAKDOWN PER KATEGORI
   - List item: icon kategori, nama, progress bar, nominal + persentase
   - Sort: terbesar ke terkecil
   - Warna progress bar sesuai persentase (hijau → kuning → merah jika dominan)

6. WIDGET AMAL PERIODE INI
   - Summary: total sedekah, zakat, infaq, wakaf
   - Small card dengan background ungu muda

Buat juga:
- src/components/features/reports/PeriodSelector.tsx
- src/components/features/reports/SummaryCards.tsx
- src/components/features/reports/IncomeExpenseChart.tsx
- src/components/features/reports/CategoryBreakdown.tsx
- src/hooks/useReports.ts — fetch dan aggregate data laporan dari Supabase

Query Supabase di useReports:
- SELECT category_id, SUM(amount), COUNT(*) FROM transactions 
  WHERE household_id = X AND date BETWEEN start AND end AND type = 'expense'
  GROUP BY category_id
- Sama untuk income
- JOIN dengan categories untuk nama dan icon

Semua chart harus responsive dan tampil baik di lebar 375px.
```

---

---

# ═══════════════════════════════════════
# FASE 5 — GOALS TABUNGAN
# ═══════════════════════════════════════

---

## PROMPT 5.1 — Halaman Goals

```
Buat fitur Goals Tabungan untuk BisaBerkah. Ini fitur paling emosional — pengguna punya impian yang ingin dicapai.

File yang dibuat:
1. src/app/(app)/goals/page.tsx
2. src/app/(app)/goals/new/page.tsx
3. src/app/(app)/goals/[id]/page.tsx
4. src/components/features/goals/GoalCard.tsx
5. src/components/features/goals/GoalForm.tsx
6. src/components/features/goals/GoalSummaryBadge.tsx
7. src/hooks/useGoals.ts

HALAMAN LIST GOALS (goals/page.tsx):
- Header: "Goals Tabungan 🎯"
- Tombol "+ Buat Goal" (hijau, di kanan atas atau FAB)
- Filter chip: Semua | Aktif | Tercapai | Ditunda
- List GoalCard
- Empty state jika kosong: ilustrasi + "Tetapkan impianmu! Buat goal pertamamu."

GOALCARD COMPONENT:
- Nama goal (bold)
- Emoji/icon tujuan (opsional, bisa dipilih saat buat)
- Progress bar tebal (hijau)
- "Rp X.XXX.XXX dari Rp XX.XXX.XXX (XX%)"
- "Target per bulan: Rp X.XXX.XXX"
- "Jatuh tempo: Desember 2027"
- Badge status: Aktif (hijau) / Tercapai (biru) / Ditunda (abu)
- Tombol "+ Tambah Tabungan" di dalam card

FORM BUAT GOAL BARU (goals/new/page.tsx):
Field:
1. Nama Goal — teks bebas (contoh: "Umroh Keluarga", "Beli Kamera", "Liburan Bali")
2. Pilih Emoji/Icon — grid emoji pilihan (✈️ 🕌 📷 🏠 🚗 💊 🎓 dll)
3. Target Nominal — input Rupiah (auto-format)
4. Sudah Punya Tabungan? — toggle + input nominal jika ya
5. Durasi Menabung — slider atau input angka (dalam bulan)

KALKULASI OTOMATIS (real-time saat user mengisi form):
Tampilkan kotak "Ringkasan Goal" yang update real-time:
- "Sisa yang perlu ditabung: Rp XX.XXX.XXX"
- "Target per bulan: Rp X.XXX.XXX" (bold, hijau)
- "Estimasi selesai: [Bulan Tahun]"
- "Total [X] bulan menabung"

Formula:
sisa = target - sudah_ada
per_bulan = sisa / durasi_bulan
deadline = hari_ini + durasi_bulan

HALAMAN DETAIL GOAL (goals/[id]/page.tsx):
- Nama + emoji besar di atas
- Progress ring/circle besar di tengah (persentase)
- Detail: target, terkumpul, sisa, per bulan, deadline
- Riwayat tabungan (list tanggal + nominal)
- Tombol "+ Tambah Tabungan" (buka bottom sheet)
- Tombol "Tandai Tercapai 🎉" jika sudah 100%

Bottom sheet "+ Tambah Tabungan":
- Input nominal
- Tanggal (default hari ini)
- Catatan (opsional)
- Tombol Simpan

Hook useGoals:
- getGoals()
- createGoal(data)
- updateGoal(id, data)
- addSaving(goalId, amount, date, note)
- deleteGoal(id)
- calculateGoalStats(goal) → { perMonth, deadline, percentage, remaining }
```

---

---

# ═══════════════════════════════════════
# FASE 6 — BUDGET & HUTANG
# ═══════════════════════════════════════

---

## PROMPT 6.1 — Perencanaan Budget

```
Buat fitur Budget/Perencanaan Keuangan untuk BisaBerkah.

File:
1. src/app/(app)/budget/page.tsx
2. src/components/features/budget/BudgetCard.tsx
3. src/components/features/budget/BudgetForm.tsx
4. src/hooks/useBudgets.ts

HALAMAN BUDGET:
- Header: "Anggaran Bulan Ini" + bulan/tahun aktif + tombol ganti bulan ←→
- Total overview: "Total Dianggarkan: Rp X | Terpakai: Rp X | Sisa: Rp X"
- Progress bar keseluruhan (hijau → kuning → merah jika >80%)
- List BudgetCard per kategori
- Tombol "+ Tambah Anggaran" 

BUDGET CARD:
- Icon + Nama Kategori
- Progress bar: actual/budget
- Nominal: "Rp X.XXX dari Rp X.XXX.XXX"
- Persentase
- Status badge: "Aman" (hijau) | "Hampir habis" (kuning, >75%) | "Terlampaui!" (merah, >100%)
- Tap untuk edit

BUDGET FORM (Bottom Sheet):
- Pilih Kategori (hanya expense)
- Nominal Anggaran
- Periode: bulan ini (default)
- Simpan

LOGIKA:
- Setiap budget card menghitung actual dari transactions bulan yang sama, kategori yang sama
- Real-time update dari useTransactions

Hook useBudgets:
- getBudgets(month, year)
- createBudget(data)
- updateBudget(id, data)
- deleteBudget(id)
- getBudgetWithActual(month, year) → budget + actual spending joined
```

---

## PROMPT 6.2 — Manajemen Hutang

```
Buat fitur Manajemen Hutang untuk BisaBerkah.

File:
1. src/app/(app)/debts/page.tsx
2. src/components/features/debts/DebtCard.tsx
3. src/components/features/debts/DebtForm.tsx
4. src/components/features/debts/PaymentForm.tsx
5. src/hooks/useDebts.ts

HALAMAN HUTANG:
- Header: "Catatan Hutang"
- Summary: Total Hutang Aktif (merah) + Total Lunas (abu)
- Tab: Aktif | Lunas
- List DebtCard
- Tombol "+ Catat Hutang"

DEBT CARD:
- Nama kreditor (kepada siapa berhutang)
- Nominal total hutang
- Progress bar pelunasan (berapa sudah dibayar)
- Nominal terbayar vs total: "Rp X dari Rp X"
- Sisa: "Sisa: Rp X" (merah jika aktif)
- Jatuh tempo (jika ada) — merah jika sudah dekat/lewat
- Badge: "Aktif" (merah) | "Lunas" ✓ (hijau)
- Tombol "Bayar" di dalam card (hanya jika status aktif)

FORM CATAT HUTANG:
- Nama/sumber hutang (kepada siapa / dari mana)
- Total nominal hutang
- Tanggal mulai
- Jatuh tempo (opsional)
- Catatan (bank, nomor rekening, dll)

FORM BAYAR HUTANG (Bottom Sheet):
- Nominal pembayaran
- Tanggal bayar (default hari ini)
- Catatan (opsional)
- Setelah simpan: update paid_amount di debt, catat di debt_payments
- Jika total paid >= total_amount: otomatis update status ke 'paid'

RIWAYAT PEMBAYARAN:
- Bisa dilihat dengan tap detail debt
- List tanggal + nominal per pembayaran

Hook useDebts:
- getDebts()
- createDebt(data)
- updateDebt(id, data)
- addPayment(debtId, amount, date, note)
- getPayments(debtId)
```

---

---

# ═══════════════════════════════════════
# FASE 7 — PENGATURAN & FITUR ISLAMI
# ═══════════════════════════════════════

---

## PROMPT 7.1 — Halaman Pengaturan & Profil

```
Buat halaman Pengaturan (Akun) untuk BisaBerkah.

src/app/(app)/settings/page.tsx — halaman utama settings

Tampilkan menu-menu berikut sebagai list card:

PROFIL SECTION:
- Avatar (inisial nama jika tidak ada foto)
- Nama + Email
- Tombol "Edit Profil"

MENU PENGATURAN:
1. Kelola Kategori → /settings/categories
2. Import Data Excel → /settings/import
3. Kalkulator Zakat → /settings/zakat
4. Undang Anggota Keluarga → (tampilkan info household ID, fitur v2)
5. Logout → konfirmasi bottom sheet

---

src/app/(app)/settings/categories/page.tsx

HALAMAN KATEGORI:
- Tab: Pengeluaran | Pemasukan
- List kategori (default + custom)
- Kategori default: tampilkan tapi tombol hapus di-disable, bisa edit icon/nama
- Kategori custom: bisa edit dan hapus
- Tombol "+ Tambah Kategori" → form: nama, icon (pilih emoji), tipe

---

src/app/(app)/settings/import/page.tsx

HALAMAN IMPORT EXCEL:
Step 1: Info + Tombol "Download Template Excel"
  - Penjelasan singkat cara pakai
  - Tombol download template (generate file .xlsx dengan SheetJS di client)
  
Template Excel berisi:
  - Sheet "Pemasukan": Tanggal | Kategori | Nominal | Catatan
  - Sheet "Pengeluaran": Tanggal | Kategori | Nominal | Catatan
  - Sheet "Panduan": instruksi dan daftar kategori valid

Step 2: Upload File
  - Drag & drop area atau tombol "Pilih File"
  - Hanya accept .xlsx dan .xls
  - Parse dengan SheetJS di client-side

Step 3: Preview & Validasi
  - Tabel preview data yang akan diimport
  - Baris valid: normal
  - Baris error: background merah muda + icon ⚠️ + pesan error di tooltip
  - Counter: "X baris valid, Y baris error"

Step 4: Konfirmasi Import
  - Tombol "Import X Transaksi" (hijau)
  - Progress bar saat import berlangsung
  - Hasil: "X berhasil diimport, Y dilewati"

Buat src/lib/utils/excel.ts:
- generateTemplate(): buat file Excel template dengan SheetJS
- parseImportFile(file): parse file dan return array transaksi + array error
- validateRow(row, categories): validasi satu baris
```

---

## PROMPT 7.2 — Kalkulator Zakat Maal

```
Buat halaman Kalkulator Zakat Maal untuk BisaBerkah.

src/app/(app)/settings/zakat/page.tsx

Desain: clean, informatif, dengan nuansa Islami (warna hijau tua dan ungu muda)

KONTEN HALAMAN:

1. HEADER INFORMASI
   - Judul: "Kalkulator Zakat Maal"
   - Penjelasan singkat (1-2 kalimat): "Zakat Maal wajib jika harta bersih kamu mencapai nisab dan sudah 1 tahun (haul)."

2. INPUT HARGA EMAS SAAT INI
   - Input Rupiah per gram (contoh: Rp 1.650.000/gram)
   - Tombol "Cek Harga Emas" (link ke Google/sumber referensi, open new tab)
   - Harga bisa diinput manual

3. FORM INPUT HARTA

   HARTA (Positif):
   - Uang Tunai + Tabungan (Rp)
   - Logam Mulia/Emas yang dimiliki (gram) → auto-convert ke Rp
   - Piutang yang diharapkan kembali (Rp)
   - Aset Investasi/Saham (Rp)
   
   HUTANG (Pengurang):
   - Total hutang yang harus dibayar (Rp)

4. HASIL KALKULASI (auto-update saat input berubah)
   Card hasil dengan breakdown:
   - "Total Harta: Rp X"
   - "Total Hutang: Rp X"
   - "Harta Bersih: Rp X"
   - Divider
   - "Nisab (85gr emas): Rp X" (kalkulasi dari harga emas input)
   - Status: 
     ✅ "Wajib Zakat" (jika harta bersih ≥ nisab) → background hijau muda
     ❌ "Belum Wajib Zakat" (jika di bawah nisab) → background abu
   - Jika wajib: "Zakat yang harus dibayar: Rp X" (2.5% dari harta bersih, bold hijau)

5. TOMBOL AKSI
   - "Catat sebagai Pengeluaran Zakat" → pre-fill form transaksi dengan nominal zakat

6. CATATAN DISCLAIMER
   - Kecil, abu-abu: "Kalkulator ini hanya alat bantu. Konsultasikan dengan ustaz/lembaga zakat untuk hasil yang lebih akurat."

Logika kalkulasi (TypeScript di client):
const nisab = 85 * hargaEmasPerGram
const nilaiEmas = gramEmas * hargaEmasPerGram
const totalHarta = uangTunai + nilaiEmas + piutang + investasi
const hartaBersih = totalHarta - hutang
const wajibZakat = hartaBersih >= nisab
const nominalZakat = wajibZakat ? hartaBersih * 0.025 : 0

Semua kalkulasi real-time (useState, no submit).
```

---

---

# ═══════════════════════════════════════
# FASE 8 — POLISH, OFFLINE & DEPLOY
# ═══════════════════════════════════════

---

## PROMPT 8.1 — Shared Components & Empty States

```
Buat semua shared/reusable components yang dibutuhkan BisaBerkah.

1. src/components/shared/CurrencyInput.tsx
   - Input khusus untuk nilai Rupiah
   - Auto-format saat typing: 50000 → "50.000", tampil sebagai "Rp 50.000"
   - Simpan sebagai number di state
   - Props: value, onChange, placeholder, error
   - inputMode="decimal" untuk mobile keyboard

2. src/components/shared/EmptyState.tsx
   - Props: emoji, title, description, actionLabel, onAction
   - Desain centered, emoji besar, teks abu, tombol CTA opsional
   - Contoh penggunaan: "🧾 Belum ada transaksi. Yuk mulai catat!"

3. src/components/shared/LoadingScreen.tsx
   - Full page loading dengan logo BisaBerkah + spinner kecil

4. src/components/shared/SkeletonCard.tsx
   - Skeleton placeholder untuk card transaksi, goal, dll
   - Gunakan shadcn Skeleton component

5. src/components/shared/ConfirmSheet.tsx
   - Bottom Sheet konfirmasi reusable
   - Props: title, description, confirmLabel, confirmVariant, onConfirm, onCancel
   - Gunakan shadcn Drawer

6. src/components/shared/DateRangePicker.tsx
   - Komponen pilih rentang tanggal (dari - sampai)
   - Mobile-friendly (2 input atau calendar)

7. src/components/shared/CategoryGrid.tsx
   - Grid pemilihan kategori dengan icon emoji + label
   - Props: categories, selected, onSelect, type
   - Grid 4 kolom, scrollable jika banyak
   - Selected: border hijau + background hijau muda

8. src/lib/utils/currency.ts
   - formatCurrency(amount: number): string → "Rp 1.500.000"
   - parseCurrency(str: string): number → 1500000
   - formatCompact(amount: number): string → "Rp 1,5Jt"

9. src/lib/utils/date.ts
   - formatDate(date): "20 Mei 2026"
   - formatDateShort(date): "20 Mei"
   - getMonthRange(month, year): { start, end }
   - isToday(date): boolean

10. src/stores/useAppStore.ts (Zustand)
    Global state:
    - currentHousehold
    - userProfile
    - categories (cached)
    - setHousehold, setProfile, setCategories

Pastikan semua komponen ada TypeScript interface yang lengkap dan accessible (ARIA).
```

---

## PROMPT 8.2 — PWA & Mobile Optimization

```
Optimasi BisaBerkah sebagai Progressive Web App (PWA) yang mobile-first.

1. Buat file public/manifest.json:
   {
     "name": "BisaBerkah",
     "short_name": "BisaBerkah",
     "description": "Catatan keuangan keluarga yang berkah",
     "start_url": "/app/dashboard",
     "display": "standalone",
     "background_color": "#FAFAF9",
     "theme_color": "#16A34A",
     "icons": [
       { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
     ]
   }

2. Update src/app/layout.tsx (root layout):
   - Tambahkan metadata viewport untuk mobile:
     viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 }
   - Tambahkan theme-color meta tag: #16A34A
   - Link ke manifest.json
   - Apple touch icon
   - Prevent zoom on input focus (iOS Safari)

3. Tambahkan CSS global untuk mobile experience:
   - Hapus tap highlight biru: -webkit-tap-highlight-color: transparent
   - Smooth scroll: scroll-behavior: smooth
   - Safe area: padding-bottom: env(safe-area-inset-bottom)
   - Font rendering: -webkit-font-smoothing: antialiased
   - Prevent bounce scroll di iOS pada element tertentu

4. Buat src/components/shared/InstallPrompt.tsx
   - Banner halus di bawah yang muncul setelah 3 kali kunjungan
   - "Tambahkan BisaBerkah ke layar utama untuk akses lebih mudah!"
   - Gunakan beforeinstallprompt event
   - Bisa di-dismiss

5. Optimasi performa:
   - Tambahkan loading="lazy" pada semua Image
   - Pastikan semua page menggunakan Suspense boundary dengan Skeleton
   - Buat src/app/loading.tsx (root loading UI)
   - Buat loading.tsx di setiap route folder

6. Error boundary:
   - Buat src/app/error.tsx untuk global error UI
   - Buat src/app/not-found.tsx untuk 404

Setelah selesai, jalankan:
npm run build
Dan tampilkan output — pastikan tidak ada error.
```

---

## PROMPT 8.3 — Testing & Deploy ke Vercel

```
Bantu aku mempersiapkan dan deploy BisaBerkah ke Vercel.

1. ENVIRONMENT VARIABLES
   Buat daftar semua env vars yang perlu diset di Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL (akan diisi URL Vercel setelah deploy)

2. VERCEL CONFIGURATION
   Buat vercel.json di root:
   {
     "framework": "nextjs",
     "regions": ["sin1"],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-XSS-Protection", "value": "1; mode=block" }
         ]
       }
     ]
   }

3. SUPABASE PRODUKSI SETUP
   Checklist yang perlu dilakukan di Supabase dashboard:
   - Enable Email confirmations (atau disable untuk development)
   - Setup Google OAuth (Client ID + Secret dari Google Cloud Console)
   - Tambahkan Vercel URL ke Supabase Auth Redirect URLs
   - Pastikan semua RLS policy sudah aktif
   - Verifikasi semua tabel dan index sudah dibuat

4. PRE-DEPLOY CHECKLIST
   Jalankan dan fix semua error dari:
   - npm run build (pastikan 0 error)
   - npx next lint
   - Cek TypeScript: npx tsc --noEmit

5. DEPLOY STEPS
   Instruksi langkah demi langkah:
   a. Push ke GitHub: git init, git add ., git commit, buat repo di GitHub, git push
   b. Connect ke Vercel: import project dari GitHub
   c. Set semua environment variables di Vercel dashboard
   d. Deploy
   e. Setelah deploy, update NEXT_PUBLIC_APP_URL di Vercel env vars
   f. Update Supabase Auth redirect URLs dengan URL Vercel yang baru

6. POST-DEPLOY TESTING
   Buat checklist testing manual:
   - [ ] Register akun baru berhasil
   - [ ] Login berhasil
   - [ ] Google OAuth berhasil
   - [ ] Tambah transaksi pengeluaran
   - [ ] Tambah transaksi pemasukan
   - [ ] Laporan menampilkan data
   - [ ] Buat goal baru + tambah tabungan
   - [ ] Catat hutang + bayar hutang
   - [ ] Buat budget + cek actual
   - [ ] Import Excel
   - [ ] Kalkulator zakat
   - [ ] Logout berhasil
   - [ ] Install PWA di HP (Add to Home Screen)

Tampilkan semua langkah dengan jelas dan berurutan.
```

---

---

# ═══════════════════════════════════════
# PROMPT TROUBLESHOOTING (GUNAKAN SESUAI KEBUTUHAN)
# ═══════════════════════════════════════

---

## PROMPT T.1 — Fix TypeScript Error

```
Aku mendapat TypeScript error berikut di BisaBerkah:

[PASTE ERROR DI SINI]

File yang terlibat: [NAMA FILE]
Konteks: [JELASKAN APA YANG SEDANG DIKERJAKAN]

Tolong:
1. Jelaskan penyebab error ini
2. Berikan fix yang benar dengan TypeScript yang strict
3. Jika ada perubahan di file lain yang diperlukan, sebutkan
```

---

## PROMPT T.2 — Fix Supabase Query

```
Query Supabase berikut tidak menghasilkan data yang benar di BisaBerkah:

[PASTE KODE QUERY]

Yang diharapkan: [JELASKAN HASIL YANG DIINGINKAN]
Yang terjadi: [JELASKAN HASIL AKTUAL / ERROR]

Tolong perbaiki query ini. Jika ada issue dengan RLS policy, jelaskan juga cara memperbaiki RLS-nya di Supabase.
```

---

## PROMPT T.3 — Perbaiki Tampilan Mobile

```
Tampilan komponen berikut tidak bagus di mobile (layar 375px):

[PASTE KODE KOMPONEN]

Masalah yang terlihat: [JELASKAN MASALAH VISUAL]

Tolong perbaiki agar:
- Tampil baik di lebar 375px - 430px
- Touch target minimal 44px
- Tidak ada overflow horizontal
- Konsisten dengan design system BisaBerkah (warna hijau primary, font system, shadcn/ui)
```

---

## PROMPT T.4 — Tambah Fitur Baru

```
Aku ingin menambahkan fitur baru ke BisaBerkah:

FITUR: [NAMA FITUR]
DESKRIPSI: [JELASKAN FITUR YANG DIINGINKAN]

Konteks project:
- Next.js 14 App Router + TypeScript
- shadcn/ui + Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Mobile-first (max width 430px)
- Primary color: hijau #16A34A

Tolong buat:
1. Perubahan database jika diperlukan (SQL)
2. TypeScript types baru
3. Hook/API call ke Supabase
4. Komponen UI
5. Integrasi ke halaman yang relevan
```

---

---

# RINGKASAN URUTAN PENGERJAAN

```
FASE 0 — Setup (1-2 hari)
  ✓ Prompt 0.1 — Init project
  ✓ Prompt 0.2 — Tema warna hijau
  ✓ Prompt 0.3 — Supabase client
  ✓ Prompt 0.4 — Database schema

FASE 1 — Layout & Auth (1-2 hari)
  ✓ Prompt 1.1 — AppShell + Bottom Nav
  ✓ Prompt 1.2 — Login & Register

FASE 2 — Dashboard (1 hari)
  ✓ Prompt 2.1 — Dashboard Home

FASE 3 — Transaksi (2-3 hari)
  ✓ Prompt 3.1 — Form Tambah Transaksi
  ✓ Prompt 3.2 — Detail & Edit Transaksi

FASE 4 — Laporan (1-2 hari)
  ✓ Prompt 4.1 — Halaman Laporan

FASE 5 — Goals (1-2 hari)
  ✓ Prompt 5.1 — Goals Tabungan

FASE 6 — Budget & Hutang (2 hari)
  ✓ Prompt 6.1 — Budget
  ✓ Prompt 6.2 — Hutang

FASE 7 — Settings & Islami (2 hari)
  ✓ Prompt 7.1 — Settings + Kategori + Import Excel
  ✓ Prompt 7.2 — Kalkulator Zakat

FASE 8 — Polish & Deploy (1-2 hari)
  ✓ Prompt 8.1 — Shared Components
  ✓ Prompt 8.2 — PWA + Mobile Optimization
  ✓ Prompt 8.3 — Deploy ke Vercel

TOTAL ESTIMASI: 2-3 minggu pengerjaan
```

---

*BisaBerkah Development Guide v1.0 — Catat, Rencanakan, Berkah.* 🌿
