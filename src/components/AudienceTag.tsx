import { AUDIENCE_OPTIONS } from '@/lib/constants'

const audienceLabels = Object.fromEntries(
  AUDIENCE_OPTIONS.map((a) => [a.value, a.label]),
)

export function AudienceTag({ value }: { value: string }) {
  return (
    <span className="inline-block rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs tracking-wide text-stone-600">
      {audienceLabels[value] || value}
    </span>
  )
}
