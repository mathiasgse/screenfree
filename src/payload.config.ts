import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig, type Plugin } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Places } from './collections/Places'
import { StillCollections } from './collections/StillCollections'
import { Regions } from './collections/Regions'
import { BlogPosts } from './collections/BlogPosts'
import { Homepage } from './globals/Homepage'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const plugins: Plugin[] = []

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
  },
  collections: [Users, Media, Places, StillCollections, Regions, BlogPosts],
  globals: [Homepage],
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
