import { Container } from '@/components/Container'
import { PlaceCardSkeleton } from '@/components/PlaceCardSkeleton'

export default function Loading() {
  return (
    <main>
      <Container className="py-12 md:py-16">
        <div className="animate-pulse">
          <div className="h-10 w-1/3 rounded bg-stone-200" />
          <div className="mt-4 h-5 w-2/3 rounded bg-stone-200" />
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PlaceCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </main>
  )
}
