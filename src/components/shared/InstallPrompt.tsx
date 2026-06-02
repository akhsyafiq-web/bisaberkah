'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const VISIT_KEY = 'bb_visit_count'
const DISMISSED_KEY = 'bb_install_dismissed'

export function InstallPrompt() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem(DISMISSED_KEY)) return

    const count = Number(localStorage.getItem(VISIT_KEY) ?? 0) + 1
    localStorage.setItem(VISIT_KEY, String(count))

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      if (count >= 3) setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setShow(false)
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-24 left-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 px-4">
      <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-lg" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <span className="text-2xl">🌿</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Tambahkan ke layar utama</p>
          <p className="text-xs text-muted-foreground">Akses BisaBerkah lebih mudah</p>
        </div>
        <button onClick={handleInstall} className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          Pasang
        </button>
        <button onClick={handleDismiss} className="shrink-0 text-muted-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
