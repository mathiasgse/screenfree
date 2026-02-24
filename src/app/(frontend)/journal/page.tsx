import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Container } from '@/components/Container'
import { BlogCard } from '@/components/BlogCard'
import { ScrollReveal } from '@/components/ScrollReveal'
import { StaggerGrid, StaggerItem } from '@/components/StaggerGrid'
import { BLOG_CATEGORIES } from '@/lib/constants'
import Link from 'next/link'
import type { BlogPost } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Journal — STILL',
  description: 'Geschichten über stille Orte, Regionen und bewusstes Reisen im Alpenraum.',
  alternates: { canonical: '/journal' },
}

export const revalidate = 60

type Props = {
  searchParams: Promise<{ kategorie?: string }>
}

export default async function JournalPage({ searchParams }: Props) {
  const { kategorie } = await searchParams
  let posts: BlogPost[] = []

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'blog-posts',
      where: {
        _status: { equals: 'published' },
        ...(kategorie ? { category: { equals: kategorie } } : {}),
      },
      sort: '-createdAt',
      limit: 50,
      depth: 1,
    })
    posts = result.docs as BlogPost[]
  } catch {
    // Payload unavailable
  }

  const featured = posts[0]
  const rest = posts.slice(1)

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-28">
      <Container>
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-widest text-accent">Journal</p>
          <h1 className="heading-accent mt-3 font-serif text-4xl sm:text-5xl md:text-6xl">
            STILL Journal
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-500">
            Geschichten über stille Orte, Regionen und bewusstes Reisen.
          </p>
        </ScrollReveal>

        {/* Category filter pills */}
        <ScrollReveal>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href="/journal"
              className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
                !kategorie
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-stone-200 text-stone-500 hover:border-stone-300'
              }`}
            >
              Alle
            </Link>
            {BLOG_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={`/journal?kategorie=${cat.value}`}
                className={`rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
                  kategorie === cat.value
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </ScrollReveal>

        {posts.length === 0 && (
          <p className="mt-16 text-center text-stone-400">Noch keine Artikel vorhanden.</p>
        )}

        {/* Featured first post */}
        {featured && (
          <ScrollReveal className="mt-12 md:mt-16">
            <BlogCard post={featured} variant="featured" />
          </ScrollReveal>
        )}

        {/* Remaining posts grid */}
        {rest.length > 0 && (
          <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <StaggerItem key={post.id}>
                <BlogCard post={post} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </Container>
    </main>
  )
}
