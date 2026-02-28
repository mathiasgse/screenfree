import type { CollectionConfig } from 'payload'
import { slugFromTitle } from '@/hooks/slugFromTitle'

export const Regions: CollectionConfig = {
  slug: 'regions',
  hooks: {
    beforeValidate: [slugFromTitle],
  },
  admin: {
    useAsTitle: 'title',
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
  ],
}
