import Image from 'next/image'
import { getImageUrl, getImageAlt } from '@/lib/media'
import type { Media } from '@/payload-types'

export function HeroImage({
  media,
  priority = false,
}: {
  media: string | Media | null | undefined
  priority?: boolean
}) {
  const url = getImageUrl(media, 'hero')
  if (!url) return null

  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-200">
      <Image
        src={url}
        alt={getImageAlt(media)}
        fill
        className="object-cover"
        sizes="100vw"
        priority={priority}
        placeholder="empty"
      />
    </div>
  )
}
