'use client'

import { Container } from '@/components/Container'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex min-h-[60vh] items-center">
      <Container>
        <h1 className="font-serif text-4xl">Etwas ist schiefgelaufen.</h1>
        <p className="mt-4 text-stone-500">
          Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.
        </p>
        <button
          onClick={reset}
          className="group mt-8 inline-flex items-center gap-3 rounded-sm bg-accent-dark px-8 py-4 text-sm tracking-wide text-white transition-all duration-300 hover:bg-accent"
        >
          Erneut versuchen
          <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
        </button>
      </Container>
    </main>
  )
}
