'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './button'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: React.ReactNode        // extra content between description and buttons
  confirmLabel?: string
  confirmVariant?: 'destructive' | 'default'
  cancelLabel?: string
  onConfirm?: () => void            // optional — omit to show only cancel button
  loading?: boolean
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = 'Ya, lanjutkan',
  confirmVariant = 'destructive',
  cancelLabel = 'Tutup',
  onConfirm,
  loading,
}: AlertDialogProps) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center px-6"
      style={{ background: 'rgba(12,17,29,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-6 space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="space-y-1.5">
          <p className="text-base font-bold text-foreground">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>

        {children}

        <div className="flex gap-3 pt-1">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className={onConfirm ? 'flex-1 h-11' : 'w-full h-11'}
          >
            {cancelLabel}
          </Button>
          {onConfirm && (
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 h-11"
            >
              {loading ? 'Memproses…' : confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
