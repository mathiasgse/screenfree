import { slugify } from '@/lib/slugify'
import type { CollectionBeforeValidateHook } from 'payload'

export const slugFromTitle: CollectionBeforeValidateHook = ({ data }) => {
  if (data) {
    if (!data.slug && data.title) {
      data.slug = slugify(data.title)
    } else if (data.slug) {
      data.slug = slugify(data.slug)
    }
  }
  return data
}
