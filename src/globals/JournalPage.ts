import type { GlobalConfig } from 'payload'

export const JournalPage: GlobalConfig = {
  slug: 'journal-page',
  label: 'Journal-Seite',
  fields: [
    {
      name: 'label',
      type: 'text',
      label: 'Label',
      defaultValue: 'Journal',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Überschrift',
      defaultValue: 'Stille Orte Journal',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Beschreibung',
      defaultValue: 'Geschichten über stille Orte, Regionen und bewusstes Reisen.',
    },
  ],
}
