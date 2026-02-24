export function FaqSection({
  items,
}: {
  items: { question: string; answer: string }[]
}) {
  if (!items || items.length === 0) return null

  return (
    <div className="rounded-md bg-stone-100 px-8 py-10 md:px-12 md:py-14">
      <h2 className="heading-accent font-serif text-2xl">Häufige Fragen</h2>
      <dl className="mt-6 space-y-6">
        {items.map((item, i) => (
          <div key={i}>
            <dt className="font-serif text-lg text-stone-900">{item.question}</dt>
            <dd className="mt-2 text-stone-600 leading-relaxed">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
