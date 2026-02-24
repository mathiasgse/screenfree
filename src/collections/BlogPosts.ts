import type { CollectionConfig } from 'payload'
import { BLOG_CATEGORIES } from '@/lib/constants'
import { slugFromTitle } from '@/hooks/slugFromTitle'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  hooks: {
    beforeValidate: [slugFromTitle],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', '_status', 'updatedAt'],
    preview: (doc) => {
      const slug = doc?.slug as string | undefined
      if (!slug) return ''
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return `${baseUrl}/api/draft?secret=${process.env.PAYLOAD_SECRET}&collection=blog-posts&slug=${slug}`
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [...BLOG_CATEGORIES],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Kurzbeschreibung',
      admin: {
        description: '4–6 Sätze für Listing und SEO',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhalt',
    },
    {
      name: 'faq',
      type: 'array',
      label: 'FAQ',
      minRows: 0,
      maxRows: 5,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          label: 'Frage',
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          label: 'Antwort',
        },
      ],
    },
    {
      name: 'seoTitle',
      type: 'text',
      label: 'SEO-Titel',
      admin: {
        position: 'sidebar',
        description: 'Überschreibt den <title>-Tag',
      },
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO-Description',
      admin: {
        position: 'sidebar',
        description: 'Überschreibt die Meta-Description',
      },
    },
    {
      name: 'relatedPlaces',
      type: 'relationship',
      relationTo: 'places',
      hasMany: true,
      label: 'Verknüpfte Orte',
      admin: {
        description: '2–8 Orte verknüpfen',
      },
    },
    {
      name: 'relatedCollections',
      type: 'relationship',
      relationTo: 'collections',
      hasMany: true,
      label: 'Verknüpfte Sammlungen',
    },
    {
      name: 'relatedRegions',
      type: 'relationship',
      relationTo: 'regions',
      hasMany: true,
      label: 'Verknüpfte Regionen',
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      label: 'Tags',
      admin: {
        description: 'Freie Tags für Filterung und SEO',
      },
    },
  ],
}
