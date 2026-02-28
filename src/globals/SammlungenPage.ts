import type { GlobalConfig } from 'payload'

export const SammlungenPage: GlobalConfig = {
  slug: 'sammlungen-page',
  label: 'Sammlungen-Seite',
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      defaultValue: 'Sammlungen',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      defaultValue: 'Kuratierte Zusammenstellungen stiller Orte.',
    },
  ],
}
