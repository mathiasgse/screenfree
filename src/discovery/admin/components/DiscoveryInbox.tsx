import React from 'react'
import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { DiscoveryInboxClient } from './DiscoveryInboxClient'

const DiscoveryInbox: React.FC<AdminViewServerProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  // Suppress unused variable warnings for params/searchParams
  void params
  void searchParams

  const { req, permissions, visibleEntities } = initPageResult

  const result = await req.payload.find({
    collection: 'candidate-places',
    where: {
      status: {
        in: ['new', 'maybe'],
      },
    },
    sort: '-qualityScore',
    limit: 50,
  })

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={undefined}
      params={params instanceof Promise ? await params : params}
      payload={req.payload}
      permissions={permissions}
      searchParams={searchParams instanceof Promise ? await searchParams : searchParams}
      user={req.user || undefined}
      visibleEntities={visibleEntities}
    >
      <DiscoveryInboxClient
        initialCandidates={result.docs}
        totalCount={result.totalDocs}
      />
    </DefaultTemplate>
  )
}

export default DiscoveryInbox
