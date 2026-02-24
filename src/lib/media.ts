import type { Media } from '@/payload-types'

type MediaOrString = string | Media | null | undefined

export function getImageUrl(
  media: MediaOrString,
  size?: 'thumbnail' | 'card' | 'hero',
): string | null {
  if (!media) return null
  if (typeof media === 'string') return null

  if (size && media.sizes?.[size]?.url) {
    return media.sizes[size].url!
  }

  return media.url ?? null
}

export function getImageAlt(media: MediaOrString): string {
  if (!media || typeof media === 'string') return ''
  return media.alt || ''
}
