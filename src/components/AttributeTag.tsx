const labels: Record<string, string> = {
  funkloch: 'Funkloch',
  see: 'See',
  berge: 'Berge',
  wald: 'Wald',
  design: 'Design',
  'adults-only': 'Adults Only',
  eco: 'Eco',
  retreat: 'Retreat',
  chalet: 'Chalet',
  boutique: 'Boutique',
}

export function AttributeTag({ attribute }: { attribute: string }) {
  return (
    <span className="inline-block rounded-full border border-stone-200 px-3 py-1 text-xs tracking-wide text-stone-600 transition-colors hover:border-accent hover:text-accent">
      {labels[attribute] || attribute}
    </span>
  )
}
