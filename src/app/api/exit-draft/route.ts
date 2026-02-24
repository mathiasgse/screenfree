import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const draft = await draftMode()
  draft.disable()

  const { searchParams } = request.nextUrl
  const path = searchParams.get('path') || '/'

  redirect(path)
}
