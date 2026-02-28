import React from 'react'
import { slugify } from './slugify'
import type { JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'

export type TocItem = { id: string; text: string; level: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractText(node: any): string {
  if (node.type === 'text') return node.text ?? ''
  if (node.children) {
    return node.children.map(extractText).join('')
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractHeadings(data: any): TocItem[] {
  const root = data?.root
  if (!root?.children) return []

  const headings: TocItem[] = []
  for (const node of root.children) {
    if (node.type === 'heading' && (node.tag === 'h2' || node.tag === 'h3')) {
      const text = extractText(node)
      if (text.trim()) {
        headings.push({
          id: slugify(text),
          text: text.trim(),
          level: node.tag === 'h2' ? 2 : 3,
        })
      }
    }
  }
  return headings
}

export const headingConvertersWithIds: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const text = extractText(node)
    const id = slugify(text)
    const Tag = node.tag as keyof React.JSX.IntrinsicElements

    return React.createElement(Tag, { id, className: 'scroll-mt-24', key: id }, ...children)
  },
})
