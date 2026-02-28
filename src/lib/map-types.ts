export interface MapPlace {
  id: string
  title: string
  slug: string
  coordinates: [number, number] // [lng, lat]
  region: { title: string; slug: string }
  attributes: string[]
  heroImageUrl: string | null
  heroImageAlt: string
  priceRange: string | null
  outboundUrl: string | null
  whyDisconnect: string[]
  quietnessLevel: number | null
  quietnessTraits: string[]
}
