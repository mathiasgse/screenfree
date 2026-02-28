import type { CollectionConfig } from 'payload'

export const CandidatePlaces: CollectionConfig = {
  slug: 'candidate-places',
  admin: {
    useAsTitle: 'name',
    group: 'Discovery',
    defaultColumns: ['name', 'regionGuess', 'qualityScore', 'status', 'updatedAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    // Identity
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'websiteUrl',
      type: 'text',
      required: true,
    },
    {
      name: 'openWebsite',
      type: 'ui',
      admin: {
        components: {
          Field: '@/discovery/admin/components/OpenWebsiteButton',
        },
      },
    },
    {
      name: 'mapsUrl',
      type: 'text',
    },
    {
      name: 'contactEmail',
      type: 'text',
      label: 'Kontakt-Email',
    },
    {
      name: 'snippet',
      type: 'textarea',
    },
    {
      name: 'coordinates',
      type: 'point',
      label: 'Koordinaten',
    },
    {
      name: 'regionGuess',
      type: 'text',
      label: 'Region (Guess)',
    },
    {
      name: 'source',
      type: 'text',
      label: 'Quelle',
      admin: { position: 'sidebar' },
    },

    // Scoring
    {
      name: 'qualityScore',
      type: 'number',
      label: 'Quality Score',
      min: 0,
      max: 100,
      admin: { position: 'sidebar' },
    },
    {
      name: 'reasons',
      type: 'json',
      label: 'Score Reasons',
    },
    {
      name: 'riskFlags',
      type: 'json',
      label: 'Risk Flags',
    },
    {
      name: 'confidence',
      type: 'number',
      label: 'Confidence',
      min: 0,
      max: 1,
      admin: { position: 'sidebar' },
    },

    // Rating
    {
      name: 'ratingValue',
      type: 'number',
      label: 'Bewertung',
    },
    {
      name: 'reviewCount',
      type: 'number',
      label: 'Anzahl Bewertungen',
    },

    // Workflow
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Maybe', value: 'maybe' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'rejectionReason',
      type: 'text',
      label: 'Rejection Reason',
      admin: {
        condition: (data) => data?.status === 'rejected',
      },
    },
    {
      name: 'generatedEmail',
      type: 'textarea',
      label: 'Outreach Email',
      admin: {
        condition: (data) => data?.status === 'accepted',
        description: 'Auto-generiert bei Acceptance',
      },
    },
    {
      name: 'calibrationLabel',
      type: 'select',
      label: 'Calibration',
      options: [
        { label: 'Perfect', value: 'perfect' },
        { label: 'Good', value: 'good' },
        { label: 'Borderline', value: 'borderline' },
        { label: 'Wrong', value: 'wrong' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'needsManualCheck',
      type: 'checkbox',
      label: 'Needs Manual Check',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },

    // Relations
    {
      name: 'dedupeKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'discoveryRunId',
      type: 'relationship',
      relationTo: 'discovery-runs',
      label: 'Discovery Run',
      admin: { position: 'sidebar' },
    },
    {
      name: 'acceptedPlaceId',
      type: 'relationship',
      relationTo: 'places',
      label: 'Accepted Place',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.status === 'accepted',
      },
    },

    // Data
    {
      name: 'images',
      type: 'json',
      label: 'Discovered Images',
    },
    {
      name: 'rawData',
      type: 'json',
      label: 'Raw Data',
      admin: {
        description: 'Original SERP + enrichment data',
      },
    },
  ],
}
