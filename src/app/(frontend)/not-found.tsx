import Link from 'next/link'
import { Container } from '@/components/Container'

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] items-center">
      <Container>
        <h1 className="font-serif text-4xl">Stille.</h1>
        <p className="mt-4 text-stone-500">
          Diese Seite gibt es nicht — aber vielleicht findest du hier deinen Ort.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm tracking-wide text-accent transition-colors hover:text-stone-700"
        >
          Zur Startseite &rarr;
        </Link>
      </Container>
    </main>
  )
}
