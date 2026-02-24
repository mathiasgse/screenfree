export function PlaceCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/2] rounded-md bg-stone-200" />
      <div className="mt-3">
        <div className="h-5 w-3/4 rounded bg-stone-200" />
        <div className="mt-2 h-4 w-1/2 rounded bg-stone-200" />
      </div>
    </div>
  )
}
