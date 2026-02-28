import type { GlobalConfig } from 'payload'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'Über-Seite',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      defaultValue: 'Über Stille Orte',
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Inhalt',
    },
    {
      name: 'seoDescription',
      type: 'textarea',
      label: 'SEO-Description',
      defaultValue:
        'Stille Orte ist eine kuratierte Sammlung stiller Orte im Alpenraum — für Menschen, die bewusst abschalten wollen.',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
