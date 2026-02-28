export interface ScrapedHut {
  name: string
  platformUrl: string
  ownWebsiteUrl: string | null
  region: string
  coordinates: [number, number] | null
  elevation: string | null
  capacity: string | null
  price: string | null
  description: string
  images: string[]
  rating: number | null
  reviewCount: number | null
  source: 'huetten.com' | 'huettenland.com'
}
