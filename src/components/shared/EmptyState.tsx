import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  emoji: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ emoji, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 py-16 px-8 text-center', className)}>
      <span className="text-4xl" role="img">{emoji}</span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors active:opacity-80"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
