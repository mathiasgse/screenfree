import type { CollectionConfig } from 'payload'

export const DiscoveryRuns: CollectionConfig = {
  slug: 'discovery-runs',
  admin: {
    useAsTitle: 'preset',
    group: 'Discovery',
    defaultColumns: ['preset', 'region', 'status', 'startedAt', 'completedAt'],
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'preset',
      type: 'text',
      label: 'Preset',
    },
    {
      name: 'query',
      type: 'text',
      label: 'Query',
    },
    {
      name: 'region',
      type: 'text',
      label: 'Region',
    },
    {
      name: 'startedAt',
      type: 'date',
      label: 'Started At',
    },
    {
      name: 'completedAt',
      type: 'date',
      label: 'Completed At',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'running',
      options: [
        { label: 'Running', value: 'running' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'stats',
      type: 'group',
      label: 'Statistics',
      fields: [
        {
          name: 'candidatesFound',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'newCandidates',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'duplicatesSkipped',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'errorCount',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'progress',
      type: 'group',
      label: 'Progress',
      fields: [
        {
          name: 'phase',
          type: 'select',
          options: [
            { label: 'Searching', value: 'searching' },
            { label: 'Processing', value: 'processing' },
            { label: 'Finalizing', value: 'finalizing' },
          ],
        },
        {
          name: 'processed',
          type: 'number',
          defaultValue: 0,
        },
        {
          name: 'total',
          type: 'number',
          defaultValue: 0,
        },
      ],
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      label: 'Error Message',
    },
  ],
}
