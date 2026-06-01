'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { parseCurrency } from '@/lib/utils/currency'

interface CurrencyInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

function formatDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return new Intl.NumberFormat('id-ID').format(Number(digits))
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput({ value, onChange, placeholder = '0', className, autoFocus }, ref) {
    const [display, setDisplay] = useState(value > 0 ? formatDisplay(String(value)) : '')
    const internalRef = useRef<HTMLInputElement>(null)
    const inputRef = (ref as React.RefObject<HTMLInputElement>) ?? internalRef

    useEffect(() => {
      if (value === 0) {
        setDisplay('')
      } else {
        setDisplay(formatDisplay(String(value)))
      }
    }, [value])

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, '')
      setDisplay(raw ? formatDisplay(raw) : '')
      onChange(raw ? Number(raw) : 0)
    }

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-sm text-muted-foreground">Rp</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'flex h-12 w-full rounded-md border border-input bg-background pl-9 pr-3 text-right text-lg font-semibold',
            'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className
          )}
        />
      </div>
    )
  }
)
