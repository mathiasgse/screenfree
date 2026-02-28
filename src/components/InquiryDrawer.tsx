'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { fromISODateString } from '@/lib/date-utils'
import { DatePicker } from '@/components/DatePicker'
import type { Media } from '@/payload-types'

type Status = 'idle' | 'submitting' | 'success' | 'error'

interface InquiryDrawerProps {
  isOpen: boolean
  onClose: () => void
  placeId: string
  placeTitle: string
  heroImage?: Media | string | null
}

export function InquiryDrawer({ isOpen, onClose, placeId, placeTitle, heroImage }: InquiryDrawerProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)

  const triggerClose = useCallback(() => {
    setIsClosing(true)
  }, [])

  const handleAnimationEnd = useCallback(() => {
    if (isClosing) {
      setIsClosing(false)
      onClose()
    }
  }, [isClosing, onClose])

  // Focus close button on open
  useEffect(() => {
    if (isOpen && !isClosing) {
      closeRef.current?.focus()
    }
  }, [isOpen, isClosing])

  // Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') triggerClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, triggerClose])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    if (checkIn && checkOut && checkIn >= checkOut) {
      setErrorMsg('Das Abreisedatum muss nach dem Anreisedatum liegen.')
      setStatus('error')
      return
    }

    try {
      const res = await fetch('/api/place-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          placeId,
          ...(checkIn ? { checkIn } : {}),
          ...(checkOut ? { checkOut } : {}),
        }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.error || 'Etwas ist schiefgelaufen.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Verbindung fehlgeschlagen. Bitte versuche es erneut.')
      setStatus('error')
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Anfrage senden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-stone-900/50 ${
          isClosing ? 'animate-overlay-fade-out' : 'animate-overlay-fade-in'
        }`}
        onClick={triggerClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute inset-y-0 right-0 w-full max-w-md bg-stone-50 ${
          isClosing ? 'animate-overlay-slide-out-right' : 'animate-overlay-slide-in-right'
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flex h-full flex-col overflow-y-auto px-6 py-6 sm:px-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Anfrage</p>
              <h2 className="mt-1 font-serif text-2xl text-stone-900">{placeTitle}</h2>
            </div>
            <button
              ref={closeRef}
              onClick={triggerClose}
              className="flex h-10 w-10 items-center justify-center text-stone-400 transition-colors hover:text-stone-700"
              aria-label="Schließen"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2 2l16 16M18 2L2 18"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {(() => {
            const imageUrl = getImageUrl(heroImage, 'thumbnail')
            return imageUrl ? (
              <div className="relative mt-4 h-40 w-full overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={getImageAlt(heroImage)}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            ) : null
          })()}

          {status === 'success' ? (
            <div className="mt-12 flex flex-1 flex-col">
              <p className="text-xs font-medium uppercase tracking-widest text-accent">Gesendet</p>
              <h3 className="mt-3 font-serif text-3xl text-stone-900">Vielen Dank.</h3>
              <p className="mt-4 leading-relaxed text-stone-600">
                Deine Anfrage wurde übermittelt. Du erhältst in Kürze eine Antwort per E-Mail.
              </p>
              <button
                onClick={triggerClose}
                className="mt-8 text-left text-sm tracking-wide text-accent transition-colors hover:text-accent-dark"
              >
                Schließen
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-1 flex-col gap-6">
              <div>
                <label htmlFor="inquiry-name" className="block text-xs font-medium uppercase tracking-widest text-stone-500">
                  Name
                </label>
                <input
                  id="inquiry-name"
                  type="text"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-600 focus:outline-none"
                  placeholder="Dein Name"
                />
              </div>

              <div>
                <label htmlFor="inquiry-email" className="block text-xs font-medium uppercase tracking-widest text-stone-500">
                  E-Mail
                </label>
                <input
                  id="inquiry-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-600 focus:outline-none"
                  placeholder="deine@email.com"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DatePicker
                  id="inquiry-checkin"
                  label="Anreise"
                  value={checkIn}
                  onChange={(val) => {
                    setCheckIn(val)
                    if (checkOut && val >= checkOut) setCheckOut('')
                  }}
                  minDate={new Date()}
                  placeholder="Datum wählen"
                />
                <DatePicker
                  id="inquiry-checkout"
                  label="Abreise"
                  value={checkOut}
                  onChange={setCheckOut}
                  minDate={checkIn ? fromISODateString(checkIn) : new Date()}
                  placeholder="Datum wählen"
                  align="right"
                  highlightDate={checkIn ? fromISODateString(checkIn) : undefined}
                />
              </div>

              <div>
                <label htmlFor="inquiry-message" className="block text-xs font-medium uppercase tracking-widest text-stone-500">
                  Nachricht
                </label>
                <textarea
                  id="inquiry-message"
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 w-full resize-none border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-600 focus:outline-none"
                  placeholder="Deine Nachricht an den Ort ..."
                />
              </div>

              {status === 'error' && (
                <p className="text-sm text-stone-500">{errorMsg}</p>
              )}

              <div className="mt-auto space-y-4 pb-4">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full rounded-sm bg-accent-dark px-8 py-4 text-sm tracking-wide text-white transition-all duration-300 hover:bg-accent disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Wird gesendet ...' : 'Anfrage absenden'}
                </button>

                <p className="text-xs leading-relaxed text-stone-400">
                  Deine Daten werden ausschließlich zur Bearbeitung deiner Anfrage verwendet.{' '}
                  <a href="/datenschutz" className="underline transition-colors hover:text-stone-600">
                    Datenschutz
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
