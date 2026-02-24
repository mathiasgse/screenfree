import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const secret = searchParams.get('secret')
  const collection = searchParams.get('collection')
  const slug = searchParams.get('slug')

  if (secret !== process.env.PAYLOAD_SECRET) {
    return new Response('Invalid secret', { status: 401 })
  }

  if (!collection || !slug) {
    return new Response('Missing collection or slug', { status: 400 })
  }

  const pathMap: Record<string, string> = {
    places: `/orte/${slug}`,
    collections: `/sammlungen/${slug}`,
    'blog-posts': `/journal/${slug}`,
  }

  const path = pathMap[collection]
  if (!path) {
    return new Response('Unknown collection', { status: 400 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
