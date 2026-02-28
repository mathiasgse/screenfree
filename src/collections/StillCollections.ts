import type { CollectionConfig } from 'payload'
import { slugFromTitle } from '@/hooks/slugFromTitle'

export const StillCollections: CollectionConfig = {
  slug: 'collections',
  hooks: {
    beforeValidate: [slugFromTitle],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', '_status', 'updatedAt'],
    preview: (doc) => {
      const slug = doc?.slug as string | undefined
      if (!slug) return ''
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return `${baseUrl}/api/draft?secret=${process.env.PAYLOAD_SECRET}&collection=collections&slug=${slug}`
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
      name: 'intro',
      type: 'textarea',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Kurzbeschreibung',
      admin: {
        description: '4–6 Sätze für Listings und SEO',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhalt',
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'places',
      type: 'relationship',
      relationTo: 'places',
      hasMany: true,
      label: 'Orte',
      admin: {
        description: 'Kuratierte Auswahl von Orten (Reihenfolge beachten)',
      },
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
      name: 'relatedCollections',
      type: 'relationship',
      relationTo: 'collections',
      hasMany: true,
      label: 'Verwandte Sammlungen',
    },
  ],
}
