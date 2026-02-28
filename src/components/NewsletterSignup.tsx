'use client'

import { useState } from 'react'

export function NewsletterSignup({
  heading = 'Neue stille Orte, direkt in deinem Postfach.',
}: {
  heading?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="border-t border-stone-200 bg-stone-100 py-20 md:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-accent">Bleib informiert</p>
        <h2 className="mt-4 font-serif text-3xl text-stone-800 sm:text-4xl">
          {heading}
        </h2>
        {status === 'success' ? (
          <p className="mt-6 text-stone-600">Danke! Du hörst bald von uns.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex gap-3 sm:mx-auto sm:max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
              className="flex-1 border-b border-stone-300 bg-transparent px-1 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-stone-600 focus:outline-none"
            />
            <button
              type="submit"
              className="text-sm tracking-wide text-accent transition-colors hover:text-accent-dark"
            >
              Anmelden
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-stone-500">
            Etwas ist schiefgelaufen. Versuche es später erneut.
          </p>
        )}
      </div>
    </section>
  )
}
