import { Container } from '@/components/Container'

interface IntroSectionProps {
  text: string
}

export function IntroSection({ text }: IntroSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto mb-6 h-[1px] w-12 bg-accent/40" />
          <p className="font-serif text-lg italic leading-relaxed text-stone-600 md:text-xl">
            {text}
          </p>
          <div className="mx-auto mt-6 h-[1px] w-12 bg-accent/40" />
        </div>
      </Container>
    </section>
  )
}
