import Image from 'next/image'
import { getImageUrl, getImageAlt } from '@/lib/media'
import type { Media } from '@/payload-types'

interface AtmosphereSectionProps {
  media: string | Media | null | undefined
  text?: string
}

export function AtmosphereSection({ media, text }: AtmosphereSectionProps) {
  const imageUrl = getImageUrl(media, 'hero')

  return (
    <section className="relative aspect-[21/9] md:aspect-[3/1]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={getImageAlt(media)}
          fill
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-stone-300" />
      )}
      <div className="absolute inset-0 bg-stone-900/40" />
      {text && (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <p
            className={`max-w-3xl text-center font-serif text-2xl italic leading-tight md:text-4xl lg:text-5xl ${
              imageUrl ? 'text-white' : 'text-stone-600'
            }`}
          >
            {text}
          </p>
        </div>
      )}
    </section>
  )
}
