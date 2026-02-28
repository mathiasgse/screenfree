'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DayPicker } from 'react-day-picker'
import { de } from 'react-day-picker/locale'
import { formatGermanDate, fromISODateString, toISODateString } from '@/lib/date-utils'

interface DatePickerProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  minDate?: Date
  placeholder?: string
  align?: 'left' | 'right'
  /** Date to highlight (e.g. check-in date shown in checkout picker) */
  highlightDate?: Date
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  minDate,
  placeholder = 'Datum wählen',
  align = 'left',
  highlightDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = value ? fromISODateString(value) : undefined

  const handleSelect = useCallback(
    (day: Date | undefined) => {
      if (day) {
        onChange(toISODateString(day))
      }
      setOpen(false)
    },
    [onChange],
  )

  // Click outside closes
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Escape closes & returns focus
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Scroll into view on open
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-widest text-stone-500"
      >
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 flex w-full items-center justify-between border-b border-stone-300 bg-transparent px-1 py-2 text-left text-sm transition-colors focus:border-stone-600 focus:outline-none"
      >
        <span className={selected ? 'text-stone-800' : 'text-stone-400'}>
          {selected ? formatGermanDate(selected) : placeholder}
        </span>
        {/* Calendar icon — thin 1px strokes matching drawer X icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="shrink-0 text-stone-400"
        >
          <rect x="2" y="3.5" width="14" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
          <path d="M2 7.5h14" stroke="currentColor" strokeWidth="1.25" />
          <path d="M5.5 1.5v3M12.5 1.5v3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className={`animate-calendar-fade-in absolute z-50 mt-2 rounded-lg border border-stone-200 bg-stone-50 p-3 shadow-sm ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <DayPicker
            mode="single"
            locale={de}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected || minDate || new Date()}
            disabled={minDate ? { before: minDate } : undefined}
            modifiers={{
              ...(highlightDate ? { highlight: highlightDate } : {}),
            }}
            modifiersClassNames={{
              highlight: '!bg-stone-200 !text-stone-700 !font-semibold',
            }}
            classNames={{
              months: 'flex flex-col',
              month_caption: 'flex justify-center items-center mb-2',
              caption_label: 'font-serif text-base text-stone-900',
              nav: 'flex items-center justify-between absolute top-3 left-3 right-3 pointer-events-none',
              button_previous: 'p-1 text-stone-400 transition-colors hover:text-stone-700 pointer-events-auto',
              button_next: 'p-1 text-stone-400 transition-colors hover:text-stone-700 pointer-events-auto',
              weekdays: 'flex',
              weekday: 'w-9 text-center text-[10px] uppercase tracking-wide text-stone-400 font-medium pb-1',
              weeks: 'flex flex-col',
              week: 'flex',
              day: 'flex items-center justify-center',
              day_button:
                'h-9 w-9 rounded-full text-sm text-stone-700 transition-colors hover:bg-stone-200 focus:outline-none focus:ring-1 focus:ring-accent',
              selected: '!bg-accent [&>button]:!text-white hover:!bg-accent-dark',
              today: 'font-semibold !text-accent',
              disabled: '!text-stone-300/60 !line-through !cursor-not-allowed hover:!bg-transparent',
              outside: 'text-stone-300',
              hidden: 'invisible',
            }}
            components={{
              Chevron: ({ orientation }) => (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className={orientation === 'right' ? 'rotate-180' : ''}
                >
                  <path
                    d="M10 4L6 8l4 4"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ),
            }}
          />
        </div>
      )}
    </div>
  )
}
