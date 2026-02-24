export function TrustMetrics({
  counts,
}: {
  counts: { places: number; regions: number; collections: number }
}) {
  if (counts.places <= 0) return null

  return (
    <div className="py-8 text-center text-sm tracking-wide text-stone-400">
      <span className="font-medium text-stone-700">{counts.places}</span>{' '}
      handverlesene Orte
      <span className="mx-3 text-stone-300">&middot;</span>
      <span className="font-medium text-stone-700">{counts.regions}</span>{' '}
      Regionen
      <span className="mx-3 text-stone-300">&middot;</span>
      <span className="font-medium text-stone-700">{counts.collections}</span>{' '}
      Sammlungen
    </div>
  )
}
