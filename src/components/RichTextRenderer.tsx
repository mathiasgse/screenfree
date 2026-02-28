import { RichText } from '@payloadcms/richtext-lexical/react'
import type { JSXConverters, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

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

export function RichTextRenderer({ data, converters }: {
  data: RichTextData | null | undefined
  converters?: JSXConverters | JSXConvertersFunction
}) {
  if (!data) return null

  return (
    <div className="prose prose-stone prose-lg max-w-none">
      <RichText data={data} {...(converters ? { converters } : {})} />
    </div>
  )
}
