import path from 'path'
import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['react-map-gl'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'api.mapbox.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-map-gl/mapbox': path.resolve(
        process.cwd(),
        'node_modules/react-map-gl/dist/mapbox.js',
      ),
    }
    return config
  },
}

export default withPayload(nextConfig)
