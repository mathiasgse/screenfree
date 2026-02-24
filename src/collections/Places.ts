import type { CollectionConfig } from 'payload'
import { ATTRIBUTE_OPTIONS } from '@/lib/constants'
import { slugFromTitle } from '@/hooks/slugFromTitle'

export const Places: CollectionConfig = {
  slug: 'places',
  hooks: {
    beforeValidate: [slugFromTitle],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'region', '_status', 'updatedAt'],
    preview: (doc) => {
      const slug = doc?.slug as string | undefined
      if (!slug) return ''
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      return `${baseUrl}/api/draft?secret=${process.env.PAYLOAD_SECRET}&collection=places&slug=${slug}`
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
      name: 'region',
      type: 'relationship',
      relationTo: 'regions',
      required: true,
    },
    {
      name: 'coordinates',
      type: 'point',
      label: 'Koordinaten',
      admin: {
        description: 'Längengrad, Breitengrad — Pflicht für Karten-Anzeige',
        position: 'sidebar',
      },
    },
    {
      name: 'shortStory',
      type: 'richText',
      label: 'Kurzgeschichte',
    },
    {
      name: 'whyDisconnect',
      type: 'array',
      label: 'Warum hier abschalten',
      minRows: 1,
      maxRows: 5,
      fields: [
        {
          name: 'reason',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'attributes',
      type: 'select',
      hasMany: true,
      label: 'Merkmale',
      options: [...ATTRIBUTE_OPTIONS],
      admin: {
        description: '3–5 Merkmale auswählen',
      },
    },
    {
      name: 'priceRange',
      type: 'select',
      label: 'Preisklasse',
      options: [
        { label: '€ (unter 150€)', value: 'budget' },
        { label: '€€ (150–300€)', value: 'mid' },
        { label: '€€€ (300–500€)', value: 'premium' },
        { label: '€€€€ (über 500€)', value: 'luxury' },
      ],
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },
    {
      name: 'outboundUrl',
      type: 'text',
      label: 'Website',
      admin: {
        description: 'Link zur offiziellen Website',
      },
    },
  ],
}
