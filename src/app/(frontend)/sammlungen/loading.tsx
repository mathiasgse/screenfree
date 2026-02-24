import { Container } from '@/components/Container'

export default function Loading() {
  return (
    <main>
      <section className="py-16">
        <Container>
          <div className="animate-pulse">
            <div className="h-9 w-48 rounded bg-stone-200" />
            <div className="mt-3 h-5 w-64 rounded bg-stone-200" />
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/2] rounded-md bg-stone-200" />
                <div className="mt-3 h-5 w-3/4 rounded bg-stone-200" />
                <div className="mt-2 h-4 w-full rounded bg-stone-200" />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  )
}
