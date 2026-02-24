import { RichText } from '@payloadcms/richtext-lexical/react'

type RichTextData = {
  root: {
    type: string
    children: { type: string; version: number; [k: string]: unknown }[]
    direction: ('ltr' | 'rtl') | null
    format: 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' | ''
    indent: number
    version: number
  }
  [k: string]: unknown
}

export function RichTextRenderer({ data }: { data: RichTextData | null | undefined }) {
  if (!data) return null

  return (
    <div className="prose prose-stone prose-lg max-w-none">
      <RichText data={data} />
    </div>
  )
}
