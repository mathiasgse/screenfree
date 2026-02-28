import type { GlobalConfig } from 'payload'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Homepage',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Hero-Bild',
            },
            {
              name: 'heroLabel',
              type: 'text',
              label: 'Hero Label',
              defaultValue: 'Still — Alpenraum',
            },
            {
              name: 'heroHeadline',
              type: 'textarea',
              label: 'Hero Headline',
              defaultValue: 'Orte, an denen dein\nKopf leise wird.',
            },
            {
              name: 'heroSubheadline',
              type: 'text',
              label: 'Hero Subheadline',
              defaultValue: 'Eine kuratierte Sammlung stiller Unterkünfte im Alpenraum.',
            },
            {
              name: 'heroCTALabel',
              type: 'text',
              label: 'Hero CTA Text',
              defaultValue: 'Entdecken',
            },
          ],
        },
        {
          label: 'Sektionen',
          fields: [
            {
              name: 'placesLabel',
              type: 'text',
              label: 'Orte — Label',
              defaultValue: 'Entdecken',
            },
            {
              name: 'placesHeading',
              type: 'text',
              label: 'Orte — Überschrift',
              defaultValue: 'Ausgewählte Orte',
            },
            {
              name: 'placesCTALabel',
              type: 'text',
              label: 'Orte — CTA Text',
              defaultValue: 'Alle Orte entdecken',
            },
            {
              name: 'collectionsLabel',
              type: 'text',
              label: 'Sammlungen — Label',
              defaultValue: 'Kuratiert',
            },
            {
              name: 'collectionsHeading',
              type: 'text',
              label: 'Sammlungen — Überschrift',
              defaultValue: 'Sammlungen',
            },
            {
              name: 'journalLabel',
              type: 'text',
              label: 'Journal — Label',
              defaultValue: 'Journal',
            },
            {
              name: 'journalHeading',
              type: 'text',
              label: 'Journal — Überschrift',
              defaultValue: 'Aus dem Journal',
            },
            {
              name: 'journalCTALabel',
              type: 'text',
              label: 'Journal — CTA Text',
              defaultValue: 'Zum Journal',
            },
            {
              name: 'trustOrteLabel',
              type: 'text',
              label: 'Trust-Metrik — Orte',
              defaultValue: 'handverlesene Orte',
            },
            {
              name: 'trustRegionenLabel',
              type: 'text',
              label: 'Trust-Metrik — Regionen',
              defaultValue: 'Regionen',
            },
            {
              name: 'trustSammlungenLabel',
              type: 'text',
              label: 'Trust-Metrik — Sammlungen',
              defaultValue: 'Sammlungen',
            },
            {
              name: 'regionEmptyMessage',
              type: 'text',
              label: 'Region — Leere Nachricht',
              defaultValue: 'Bald mehr Orte in dieser Region.',
            },
          ],
        },
        {
          label: 'Karte',
          fields: [
            {
              name: 'mapHeading',
              type: 'text',
              label: 'Karte — Überschrift',
              defaultValue: 'Stille Orte, verteilt im Alpenraum.',
            },
            {
              name: 'mapSubheading',
              type: 'text',
              label: 'Karte — Unterzeile',
              defaultValue: 'Manchmal hilft es, sie zu sehen.',
            },
            {
              name: 'mapCTALabel',
              type: 'text',
              label: 'Karte — CTA Text',
              defaultValue: 'Karte entdecken',
            },
          ],
        },
        {
          label: 'Newsletter',
          fields: [
            {
              name: 'newsletterHeading',
              type: 'text',
              label: 'Newsletter — Überschrift',
              defaultValue: 'Neue stille Orte, direkt in deinem Postfach.',
            },
          ],
        },
        {
          label: 'Atmosphere',
          fields: [
            {
              name: 'introText',
              type: 'textarea',
              required: true,
              label: 'Intro-Text',
              defaultValue:
                'Wir suchen Orte, die leise sind. Unterkünfte im Alpenraum, in denen nichts um deine Aufmerksamkeit kämpft — kein Programm, kein Lärm, nur Landschaft und Ruhe.',
            },
            {
              name: 'atmosphereImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Atmosphere-Bild',
            },
            {
              name: 'atmosphereText',
              type: 'text',
              label: 'Atmosphere-Text',
              defaultValue: 'Weniger Lärm. Mehr Landschaft.',
            },
          ],
        },
      ],
    },
  ],
}
