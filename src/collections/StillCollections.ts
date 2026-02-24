import type { CollectionConfig } from 'payload'
import { slugFromTitle } from '@/hooks/slugFromTitle'

export const StillCollections: CollectionConfig = {
  slug: 'collections',
  hooks: {
    beforeValidate: [slugFromTitle],
  },
  admin: {
    useAsTitle: 'title',
    preview: (doc) => {
      const slug = doc?.slug as string | undefined
      if (!slug) return ''
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return `${baseUrl}/api/draft?secret=${process.env.PAYLOAD_SECRET}&collection=collections&slug=${slug}`
    },
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
  ],
}
