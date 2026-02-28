export const ATTRIBUTE_OPTIONS = [
  { label: 'Funkloch', value: 'funkloch' },
  { label: 'See', value: 'see' },
  { label: 'Berge', value: 'berge' },
  { label: 'Wald', value: 'wald' },
  { label: 'Design', value: 'design' },
  { label: 'Adults Only', value: 'adults-only' },
  { label: 'Eco', value: 'eco' },
  { label: 'Retreat', value: 'retreat' },
  { label: 'Chalet', value: 'chalet' },
  { label: 'Boutique', value: 'boutique' },
] as const

export const MAP_FILTER_TAGS = [
  { label: 'Berge', value: 'berge' },
  { label: 'Wald', value: 'wald' },
  { label: 'See', value: 'see' },
  { label: 'Funkloch', value: 'funkloch' },
  { label: 'Adults Only', value: 'adults-only' },
] as const

export const PRICE_OPTIONS = [
  { label: '€', value: 'budget' },
  { label: '€€', value: 'mid' },
  { label: '€€€', value: 'premium' },
  { label: '€€€€', value: 'luxury' },
] as const

export const AUDIENCE_OPTIONS = [
  { label: 'Perfekt für 2–3 Tage Reset', value: 'reset' },
  { label: 'Gut für Paare', value: 'paare' },
  { label: 'Gut für Solo-Retreat', value: 'solo' },
  { label: 'Gut für Offsite', value: 'offsite' },
  { label: 'Hund erlaubt', value: 'hund' },
] as const

export const MAP_AUDIENCE_FILTER_TAGS = [
  { label: 'Paare', value: 'paare' },
  { label: 'Solo', value: 'solo' },
  { label: 'Offsite', value: 'offsite' },
  { label: 'Hund erlaubt', value: 'hund' },
  { label: '2–3 Tage Reset', value: 'reset' },
] as const

export const QUIETNESS_LEVELS = [
  { value: 1, label: 'Ruhig' },
  { value: 2, label: 'Sehr ruhig' },
  { value: 3, label: 'Absolut still' },
] as const

export const QUIETNESS_TRAIT_OPTIONS = [
  { value: 'no-road-noise', label: 'Keine Straße hörbar' },
  { value: 'small-house', label: 'Kleines Haus (≤20 Zimmer)' },
  { value: 'no-cell-signal', label: 'Kein Handyempfang' },
  { value: 'adults-only', label: 'Adults Only' },
  { value: 'no-wifi', label: 'Kein WLAN' },
  { value: 'nature-only', label: 'Nur Naturgeräusche' },
  { value: 'secluded', label: 'Abgeschiedene Lage' },
  { value: 'no-tv', label: 'Kein TV' },
  { value: 'digital-detox', label: 'Digital Detox Programm' },
  { value: 'silent-zones', label: 'Ruhezonen im Haus' },
] as const

export const BLOG_CATEGORIES = [
  { label: 'Region', value: 'region' },
  { label: 'Sammlung', value: 'sammlung' },
  { label: 'Editorial', value: 'editorial' },
  { label: 'Intent-SEO', value: 'intent-seo' },
] as const
