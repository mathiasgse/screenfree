import type { Metadata } from 'next'
import { Container } from '@/components/Container'

export const metadata: Metadata = {
  title: 'Über STILL',
  description: 'STILL ist eine kuratierte Sammlung stiller Orte im Alpenraum — für Menschen, die bewusst abschalten wollen.',
  alternates: { canonical: '/ueber' },
  openGraph: {
    title: 'Über STILL',
    description: 'STILL ist eine kuratierte Sammlung stiller Orte im Alpenraum — für Menschen, die bewusst abschalten wollen.',
    url: '/ueber',
  },
}

export default function UeberPage() {
  return (
    <main>
      <section className="pt-28 pb-16">
        <Container>
          <h1 className="heading-accent font-serif text-3xl sm:text-4xl">Über STILL</h1>
          <div className="mt-8 max-w-2xl space-y-4 text-stone-600">
            <p>
              STILL ist eine kuratierte Sammlung stiller Orte im Alpenraum — handverlesene Unterkünfte
              für Menschen, die bewusst abschalten wollen.
            </p>
            <p>
              Kein Algorithmus, keine gesponserten Platzierungen. Nur Orte, die wir selbst besucht
              oder sorgfältig recherchiert haben.
            </p>
            <p className="text-stone-400">
              Diese Seite wird bald erweitert.
            </p>
          </div>
        </Container>
      </section>
    </main>
  )
}
