const UMLAUT_MAP: Record<string, string> = {
  'ä': 'ae',
  'ö': 'oe',
  'ü': 'ue',
  'ß': 'ss',
  'Ä': 'Ae',
  'Ö': 'Oe',
  'Ü': 'Ue',
}

export function slugify(text: string): string {
  let slug = text
  for (const [char, replacement] of Object.entries(UMLAUT_MAP)) {
    slug = slug.replaceAll(char, replacement)
  }
  return slug
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
