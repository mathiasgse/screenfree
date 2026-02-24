import { Container } from '@/components/Container'

interface IntroSectionProps {
  text: string
}

export function IntroSection({ text }: IntroSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <p className="font-serif text-lg leading-relaxed text-stone-600 md:text-xl">
            {text}
          </p>
        </div>
      </Container>
    </section>
  )
}
