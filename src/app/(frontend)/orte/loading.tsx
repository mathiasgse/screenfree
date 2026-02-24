import { Container } from '@/components/Container'
import { PlaceCardSkeleton } from '@/components/PlaceCardSkeleton'

export default function Loading() {
  return (
    <main>
      <section className="py-16">
        <Container>
          <div className="animate-pulse">
            <div className="h-9 w-40 rounded bg-stone-200" />
            <div className="mt-3 h-5 w-24 rounded bg-stone-200" />
          </div>
          <div className="mt-8 flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 w-28 animate-pulse rounded bg-stone-200" />
            ))}
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  )
}
