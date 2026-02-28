/**
 * Word-boundary keyword matching.
 * Prevents false positives like "ruhig" matching inside "unruhig"
 * or "resort" matching inside "Almresort" (unless intended).
 */
export function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escaped}\\b`, 'i')
  return regex.test(text)
}
