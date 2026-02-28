import type { BasePayload } from 'payload'
import { slugify } from '@/lib/slugify'

/**
 * Match a regionGuess string to an existing Payload Region.
 * Strategy: exact title match → slug contains → title contains.
 */
export async function matchRegion(
  regionGuess: string,
  payload: BasePayload,
): Promise<string | null> {
  if (!regionGuess) return null

  const normalized = regionGuess.toLowerCase().trim()

  // Fetch all regions (small collection, safe to load all)
  const regions = await payload.find({
    collection: 'regions',
    limit: 100,
  })

  // 1. Exact title match
  for (const region of regions.docs) {
    if (region.title.toLowerCase() === normalized) {
      return String(region.id)
    }
  }

  // 2. Slug match (regionGuess may contain "Südtirol / Vinschgau" → try each part)
  const parts = normalized.split(/[\/,;|–—-]/).map((p) => p.trim()).filter(Boolean)
  for (const part of parts) {
    const partSlug = slugify(part)
    for (const region of regions.docs) {
      if (region.slug === partSlug) {
        return String(region.id)
      }
    }
  }

  // 3. Contains match (region title appears in regionGuess or vice versa)
  for (const region of regions.docs) {
    const regionLower = region.title.toLowerCase()
    if (normalized.includes(regionLower) || regionLower.includes(normalized)) {
      return String(region.id)
    }
    // Also check parts
    for (const part of parts) {
      if (part.includes(regionLower) || regionLower.includes(part)) {
        return String(region.id)
      }
    }
  }

  return null
}

/**
 * Generate whyDisconnect bullets from scoring reasons.
 * Transforms technical scoring reasons into editorial-sounding bullets.
 */
export function generateWhyDisconnect(
  reasons: string[],
  offgridCues: string[],
): { reason: string }[] {
  const bullets: { reason: string }[] = []

  const cueToEditorial: Record<string, string> = {
    alleinlage: 'Absolute Alleinlage — kein Nachbar weit und breit',
    abgelegen: 'Abseits der ausgetretenen Pfade gelegen',
    abgeschieden: 'Wunderbar abgeschieden in der Natur',
    funkloch: 'Natürliches Funkloch — digitale Auszeit garantiert',
    'kein wlan': 'Bewusst kein WLAN — echte Offline-Zeit',
    'kein wifi': 'Bewusst kein WiFi — echte Offline-Zeit',
    'digital detox': 'Digital-Detox-Konzept als Teil der Philosophie',
    offline: 'Offline-Erlebnis steht im Mittelpunkt',
    ruhe: 'Absolute Ruhe als höchstes Gut',
    stille: 'Stille, die man förmlich spüren kann',
    ruhig: 'Ein Ort der Ruhe und Besinnung',
    einsam: 'Wohltuende Einsamkeit inmitten der Natur',
    fernab: 'Fernab vom Trubel des Alltags',
    naturverbunden: 'Naturverbundenes Erleben im Alpenraum',
    refugium: 'Ein echtes Refugium für Ruhesuchende',
    hideaway: 'Verstecktes Hideaway mit Charakter',
    'adults only': 'Nur für Erwachsene — ungestörte Atmosphäre',
    boutique: 'Liebevoll geführtes Boutique-Haus mit Persönlichkeit',
    designhotel: 'Durchdachtes Design trifft alpine Tradition',
    architektur: 'Bemerkenswerte Architektur, die zur Landschaft passt',
    'wenige zimmer': 'Wenige Zimmer garantieren Exklusivität und Ruhe',
    familiengeführt: 'Familiär geführt — persönlich und authentisch',
    retreat: 'Rückzugsort für bewusste Entschleunigung',
    entschleunigung: 'Entschleunigung ist hier gelebte Philosophie',
    geheimtipp: 'Ein echter Geheimtipp unter Kennern',
    'kleine unterkunft': 'Kleine, feine Unterkunft mit persönlicher Note',
  }

  // Map discovered cues to editorial bullets
  for (const cue of offgridCues) {
    const editorial = cueToEditorial[cue.toLowerCase()]
    if (editorial && bullets.length < 5) {
      bullets.push({ reason: editorial })
    }
  }

  // If we don't have enough from cues, create generic ones from reasons
  if (bullets.length < 2) {
    for (const r of reasons) {
      if (r.toLowerCase().includes('small accommodation') && bullets.length < 5) {
        bullets.push({ reason: 'Überschaubare Größe für ein intimes Erlebnis' })
      }
      if (r.toLowerCase().includes('good rating') && bullets.length < 5) {
        bullets.push({ reason: 'Hervorragend bewertet von Gästen' })
      }
    }
  }

  // Ensure at least one bullet
  if (bullets.length === 0) {
    bullets.push({ reason: 'Ruhige Lage in den Alpen' })
  }

  return bullets.slice(0, 5)
}

/**
 * Suggest Place attributes based on discovered offgrid cues.
 */
export function suggestAttributes(offgridCues: string[]): string[] {
  const attributes = new Set<string>()

  const cueToAttribute: Record<string, string> = {
    funkloch: 'funkloch',
    'kein wlan': 'funkloch',
    'kein wifi': 'funkloch',
    'digital detox': 'funkloch',
    offline: 'funkloch',
    wald: 'wald',
    berge: 'berge',
    see: 'see',
    boutique: 'boutique',
    designhotel: 'design',
    architektur: 'design',
    'adults only': 'adults-only',
    'nur erwachsene': 'adults-only',
    eco: 'eco',
    nachhaltig: 'eco',
    retreat: 'retreat',
    entschleunigung: 'retreat',
    refugium: 'retreat',
    chalet: 'chalet',
    almhütte: 'chalet',
  }

  for (const cue of offgridCues) {
    const attr = cueToAttribute[cue.toLowerCase()]
    if (attr) {
      attributes.add(attr)
    }
  }

  return Array.from(attributes).slice(0, 5)
}

/**
 * Generate SEO title and description for a candidate.
 */
export function generateSeo(
  name: string,
  regionGuess: string,
  offgridCues: string[],
): { seoTitle: string; seoDescription: string } {
  const region = regionGuess.split('/')[0]?.trim() || 'Alpen'

  const seoTitle = `${name} — Ruhiges Hideaway in ${region} | Stille Orte`

  const cueSnippet = offgridCues.length > 0
    ? ` ${offgridCues.slice(0, 2).join(', ')}.`
    : ''

  const seoDescription = `${name} in ${region}: Ein handverlesener Rückzugsort für alle, die Ruhe und Disconnection suchen.${cueSnippet} Entdecke mehr auf Stille Orte.`

  return {
    seoTitle: seoTitle.slice(0, 70),
    seoDescription: seoDescription.slice(0, 160),
  }
}
