import type { CollectionConfig } from 'payload'
import { ATTRIBUTE_OPTIONS, AUDIENCE_OPTIONS, QUIETNESS_LEVELS, QUIETNESS_TRAIT_OPTIONS } from '@/lib/constants'
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
      name: 'audience',
      type: 'select',
      hasMany: true,
      label: 'Für wen geeignet',
      options: [...AUDIENCE_OPTIONS],
      admin: {
        description: 'Zielgruppe auswählen',
      },
    },
    {
      type: 'collapsible',
      label: 'Ruheprofil',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'quietnessLevel',
          type: 'select',
          label: 'Ruhe-Level',
          options: QUIETNESS_LEVELS.map((l) => ({
            label: `${l.value} — ${l.label}`,
            value: String(l.value),
          })),
          admin: {
            description: '1 = Ruhig, 2 = Sehr ruhig, 3 = Absolut still',
          },
        },
        {
          name: 'quietnessTraits',
          type: 'select',
          hasMany: true,
          label: 'Ruhe-Merkmale',
          options: [...QUIETNESS_TRAIT_OPTIONS],
          admin: {
            description: 'Konkrete Merkmale, die den Ort ruhig machen',
          },
        },
      ],
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
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Kontakt-E-Mail (für Anfragen)',
      admin: {
        description: 'Wird für Buchungsanfragen verwendet — nie öffentlich sichtbar',
        position: 'sidebar',
      },
    },
    {
      name: 'whyDisconnectHeading',
      type: 'text',
      label: 'Überschrift "Warum hier abschalten"',
      admin: {
        description: 'Optional — Standard: "Warum hier abschalten"',
      },
    },
    {
      name: 'ctaLabel',
      type: 'text',
      label: 'CTA-Text (Website besuchen)',
      admin: {
        description: 'Optional — Standard: "Website besuchen"',
      },
    },
  ],
}
