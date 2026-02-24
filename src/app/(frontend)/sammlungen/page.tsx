import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/Container'
import { getImageUrl, getImageAlt } from '@/lib/media'
import type { Collection as CollectionType } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Sammlungen',
  description: 'Kuratierte Sammlungen stiller Orte im Alpenraum — thematisch zusammengestellt.',
  alternates: { canonical: '/sammlungen' },
  openGraph: {
    title: 'Sammlungen',
    description: 'Kuratierte Sammlungen stiller Orte im Alpenraum — thematisch zusammengestellt.',
    url: '/sammlungen',
  },
}

export const revalidate = 60

export default async function SammlungenPage() {
  let collections: CollectionType[] = []

  try {
    const payload = await getPayload({ config })
    const collectionsResult = await payload.find({
      collection: 'collections',
      limit: 100,
      depth: 2,
    })
    collections = collectionsResult.docs as CollectionType[]
  } catch {
    // Payload unavailable — render empty state
  }

  return (
    <main>
      <section className="pt-28 pb-16">
        <Container>
          <h1 className="heading-accent font-serif text-3xl sm:text-4xl">Sammlungen</h1>
          <p className="mt-3 text-stone-500">
            Kuratierte Zusammenstellungen stiller Orte.
          </p>

          {collections.length > 0 ? (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => {
                const imageUrl = getImageUrl(collection.heroImage, 'card')
                const placeCount = Array.isArray(collection.places)
                  ? collection.places.length
                  : 0
                return (
                  <Link
                    key={collection.id}
                    href={`/sammlungen/${collection.slug}`}
                    className="group block"
                  >
                    <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-stone-200">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={getImageAlt(collection.heroImage)}
                          fill
                          className="object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-90"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      )}
                    </div>
                    <h2 className="mt-3 font-serif text-lg text-stone-900 transition-colors group-hover:text-accent">
                      {collection.title}
                    </h2>
                    {collection.intro && (
                      <p className="mt-1 text-sm text-stone-500 line-clamp-2">
                        {collection.intro}
                      </p>
                    )}
                    {placeCount > 0 && (
                      <p className="mt-1 text-xs text-stone-400">
                        {placeCount} {placeCount === 1 ? 'Ort' : 'Orte'}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="mt-10 text-stone-400">
              Noch keine Sammlungen vorhanden.
            </p>
          )}
        </Container>
      </section>
    </main>
  )
}
