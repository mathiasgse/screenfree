import Image from 'next/image'
import { Link } from 'next-view-transitions'
import { getImageUrl, getImageAlt } from '@/lib/media'
import { BLOG_CATEGORIES } from '@/lib/constants'
import type { BlogPost } from '@/payload-types'

const categoryLabel = (val: string) =>
  BLOG_CATEGORIES.find((c) => c.value === val)?.label ?? val

export function BlogCard({
  post,
  variant = 'default',
}: {
  post: BlogPost
  variant?: 'default' | 'featured'
}) {
  const imageUrl = getImageUrl(post.heroImage, variant === 'featured' ? 'hero' : 'card')

  if (variant === 'featured') {
    return (
      <Link href={`/journal/${post.slug}`} className="group flex h-full flex-col">
        <div
          className="relative min-h-[350px] flex-1 overflow-hidden rounded-md bg-stone-200"
          style={{ viewTransitionName: `blog-hero-${post.slug}`, contain: 'layout' }}
        >
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={getImageAlt(post.heroImage)}
              fill
              className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent transition-opacity duration-500" />
          <div className="absolute inset-x-0 bottom-0 translate-y-2 p-6 transition-transform duration-500 group-hover:translate-y-0 md:p-8">
            {post.category && (
              <span className="mb-3 inline-block rounded-full border border-white/30 px-3 py-0.5 text-xs tracking-wide text-white/80">
                {categoryLabel(post.category)}
              </span>
            )}
            <h3 className="font-serif text-2xl text-white md:text-3xl">{post.title}</h3>
            {post.excerpt && (
              <p className="mt-2 text-sm text-white/70 line-clamp-2">{post.excerpt}</p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/journal/${post.slug}`} className="group block">
      <div
        className="relative aspect-[3/2] overflow-hidden rounded-md bg-stone-200"
        style={{ viewTransitionName: `blog-hero-${post.slug}`, contain: 'layout' }}
      >
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={getImageAlt(post.heroImage)}
            fill
            className="object-cover transition-all duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />
      </div>
      <div className="mt-3">
        {post.category && (
          <span className="inline-block rounded-full border border-stone-200 px-2.5 py-0.5 text-xs text-stone-500">
            {categoryLabel(post.category)}
          </span>
        )}
        <h3 className="mt-2 font-serif text-lg text-stone-900 transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <div className="mt-3 h-[2px] w-0 bg-accent transition-all duration-500 group-hover:w-8" />
        {post.excerpt && (
          <p className="mt-1 text-sm text-stone-500 line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  )
}
