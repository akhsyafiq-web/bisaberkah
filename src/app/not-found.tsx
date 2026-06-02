import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <p className="text-5xl font-extrabold text-primary">404</p>
      <h2 className="text-base font-semibold text-foreground">Halaman tidak ditemukan</h2>
      <p className="text-sm text-muted-foreground">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
