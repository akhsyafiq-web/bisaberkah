import { cn } from '@/lib/utils/cn'

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="flex min-h-dvh justify-center bg-muted/30">
      <div
        className={cn(
          'relative flex w-full max-w-[430px] flex-col bg-background',
          'pb-[calc(5rem+env(safe-area-inset-bottom))]',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
