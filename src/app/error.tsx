'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <p className="text-4xl">😕</p>
      <h2 className="text-base font-semibold text-foreground">Terjadi kesalahan</h2>
      <p className="text-sm text-muted-foreground">Sesuatu tidak berjalan semestinya. Coba lagi ya.</p>
      <Button onClick={reset} className="mt-2">Coba Lagi</Button>
    </div>
  )
}
