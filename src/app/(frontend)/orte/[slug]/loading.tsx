import { Container } from '@/components/Container'

export default function Loading() {
  return (
    <main>
      <div className="animate-pulse">
        <div className="h-[60vh] w-full bg-stone-200" />
      </div>
      <Container className="py-12 md:py-16">
        <div className="animate-pulse">
          <div className="h-4 w-24 rounded bg-stone-200" />
          <div className="mt-4 h-10 w-2/3 rounded bg-stone-200" />
          <div className="mt-8 max-w-2xl space-y-3">
            <div className="h-4 w-full rounded bg-stone-200" />
            <div className="h-4 w-5/6 rounded bg-stone-200" />
            <div className="h-4 w-4/6 rounded bg-stone-200" />
          </div>
        </div>
      </Container>
    </main>
  )
}
