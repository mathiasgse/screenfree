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
          className="mt-8 inline-block text-sm tracking-wide text-accent transition-colors hover:text-stone-700"
        >
          Erneut versuchen &rarr;
        </button>
      </Container>
    </main>
  )
}
