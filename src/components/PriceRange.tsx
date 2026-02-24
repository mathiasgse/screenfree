const priceMap: Record<string, number> = {
  budget: 1,
  mid: 2,
  premium: 3,
  luxury: 4,
}

export function PriceRange({ range }: { range: string }) {
  const count = priceMap[range] || 1

  return (
    <span className="text-stone-500">
      {'€'.repeat(count)}
      <span className="text-stone-300">{'€'.repeat(4 - count)}</span>
    </span>
  )
}
