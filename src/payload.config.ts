import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig, type Plugin } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Places } from './collections/Places'
import { StillCollections } from './collections/StillCollections'
import { Regions } from './collections/Regions'
import { BlogPosts } from './collections/BlogPosts'
import { CandidatePlaces } from './collections/CandidatePlaces'
import { DiscoveryRuns } from './collections/DiscoveryRuns'
import { BookingInquiries } from './collections/BookingInquiries'
import { Homepage } from './globals/Homepage'
import { About } from './globals/About'
import { JournalPage } from './globals/JournalPage'
import { SammlungenPage } from './globals/SammlungenPage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins: Plugin[] = [
  seoPlugin({
    collections: ['places', 'collections', 'regions', 'blog-posts'],
    uploadsCollection: 'media',
    tabbedUI: true,
    generateTitle: ({ doc }) => `${doc.title as string} | Stille Orte`,
    generateDescription: ({ doc }) => {
      const d = doc as Record<string, unknown>
      return (d.excerpt ?? d.intro ?? '') as string
    },
  }),
]

if (process.env.BLOB_READ_WRITE_TOKEN) {
  plugins.push(
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      afterNavLinks: ['@/discovery/admin/components/DiscoveryNavLink#DiscoveryNavLink'],
      views: {
        'discovery-inbox': {
          Component: '@/discovery/admin/components/DiscoveryInbox',
          path: '/discovery-inbox',
        },
      },
    },
  },
  collections: [Users, Media, Places, StillCollections, Regions, BlogPosts, CandidatePlaces, DiscoveryRuns, BookingInquiries],
  globals: [Homepage, About, JournalPage, SammlungenPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  sharp,
  plugins,
})
