'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface PageHeaderProps {
  title: string
  showBack?: boolean
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, showBack, action, className }: PageHeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-sm',
        className
      )}
    >
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted active:scale-95"
          aria-label="Kembali"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 text-base font-semibold">{title}</h1>
      {action && <div>{action}</div>}
    </header>
  )
}
