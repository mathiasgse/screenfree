import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://still.place'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/karte`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ueber`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  try {
    const payload = await getPayload({ config })

    const [places, collections, regions, blogPosts] = await Promise.all([
      payload.find({
        collection: 'places',
        where: { _status: { equals: 'published' } },
        limit: 1000,
      }),
      payload.find({
        collection: 'collections',
        limit: 1000,
      }),
      payload.find({
        collection: 'regions',
        limit: 1000,
      }),
      payload.find({
        collection: 'blog-posts',
        where: { _status: { equals: 'published' } },
        limit: 1000,
      }),
    ])

    for (const place of places.docs) {
      entries.push({
        url: `${SITE_URL}/orte/${place.slug}`,
        lastModified: place.updatedAt ? new Date(place.updatedAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      })
    }

    for (const collection of collections.docs) {
      entries.push({
        url: `${SITE_URL}/sammlungen/${collection.slug}`,
        lastModified: collection.updatedAt ? new Date(collection.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    for (const region of regions.docs) {
      entries.push({
        url: `${SITE_URL}/region/${region.slug}`,
        lastModified: region.updatedAt ? new Date(region.updatedAt) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }

    for (const post of blogPosts.docs) {
      entries.push({
        url: `${SITE_URL}/journal/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return entries
}
