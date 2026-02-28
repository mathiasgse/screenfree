import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '@/components/Container'
import { RichTextRenderer } from '@/components/RichTextRenderer'
import type { About } from '@/payload-types'

export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
  let about: About | null = null
  try {
    const payload = await getPayload({ config })
    about = await payload.findGlobal({ slug: 'about' }) as About
  } catch {
    // Payload unavailable
  }

  const description = about?.seoDescription || 'Stille Orte ist eine kuratierte Sammlung stiller Orte im Alpenraum — für Menschen, die bewusst abschalten wollen.'

  return {
    title: about?.heading || 'Über Stille Orte',
    description,
    alternates: { canonical: '/ueber' },
    openGraph: {
      title: about?.heading || 'Über Stille Orte',
      description,
      url: '/ueber',
    },
  }
}

export default async function UeberPage() {
  let about: About | null = null

  try {
    const payload = await getPayload({ config })
    about = await payload.findGlobal({ slug: 'about' }) as About
  } catch {
    // Payload unavailable
  }

  return (
    <main>
      <section className="pt-28 pb-16">
        <Container>
          <h1 className="heading-accent font-serif text-3xl sm:text-4xl">
            {about?.heading || 'Über Stille Orte'}
          </h1>
          <div className="mt-8 max-w-2xl space-y-4 text-stone-600">
            {about?.content ? (
              <RichTextRenderer data={about.content} />
            ) : (
              <>
                <p>
                  Stille Orte ist eine kuratierte Sammlung stiller Orte im Alpenraum — handverlesene Unterkünfte
                  für Menschen, die bewusst abschalten wollen.
                </p>
                <p>
                  Kein Algorithmus, keine gesponserten Platzierungen. Nur Orte, die wir selbst besucht
                  oder sorgfältig recherchiert haben.
                </p>
                <p className="text-stone-400">
                  Diese Seite wird bald erweitert.
                </p>
              </>
            )}
          </div>
        </Container>
      </section>
    </main>
  )
}
