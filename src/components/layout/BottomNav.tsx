'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, ChartNoAxesColumn, Plus, Target, User } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: House,              label: 'Beranda' },
  { href: '/reports',   icon: ChartNoAxesColumn,  label: 'Laporan' },
  { href: '/transactions/new', icon: Plus,        label: 'Tambah', isFab: true },
  { href: '/goals',     icon: Target,             label: 'Tujuan' },
  { href: '/settings',  icon: User,               label: 'Akun' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-[430px] -translate-x-1/2 items-end justify-around px-4"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
        paddingTop: '8px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #F2F4F7',
      }}
    >
      {tabs.map(({ href, icon: Icon, label, isFab }) => {
        const isActive = isFab
          ? false
          : pathname === href || pathname.startsWith(href + '/')

        if (isFab) {
          return (
            <Link
              key={href}
              href={href}
              className="mb-0.5 flex h-14 w-14 -translate-y-2 items-center justify-center rounded-full transition-transform active:scale-95"
              style={{
                background: '#07835A',
                boxShadow: '0 8px 18px -4px rgba(7,131,90,0.50)',
                border: '4px solid white',
              }}
              aria-label={label}
            >
              <Icon className="h-6 w-6 text-white" strokeWidth={2.4} />
            </Link>
          )
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-1 transition-colors"
            style={{ color: isActive ? '#07835A' : '#98A2B3' }}
            aria-label={label}
          >
            <Icon className="h-6 w-6" strokeWidth={isActive ? 2.2 : 1.8} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: isActive ? '#07835A' : '#98A2B3' }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
