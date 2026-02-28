export const OFFGRID_KEYWORDS: Record<string, number> = {
  alleinlage: 8,
  abgelegen: 6,
  abgeschieden: 6,
  funkloch: 7,
  'kein wlan': 7,
  'kein wifi': 7,
  'digital detox': 7,
  offline: 5,
  ruhe: 4,
  stille: 5,
  ruhig: 4,
  einsam: 5,
  'fernab': 5,
  naturverbunden: 4,
  'mitten in der natur': 5,
  'keine nachbarn': 6,
  'off grid': 7,
  entschleunigung: 5,
  retreat: 4,
  refugium: 5,
  hideaway: 5,
  geheimtipp: 4,
  'adults only': 3,
  'nur erwachsene': 3,
  boutique: 3,
  designhotel: 3,
  architektur: 3,
  'kleine unterkunft': 4,
  familiengeführt: 3,
  'wenige zimmer': 5,
  handverlesen: 4,
}

export const RESORT_PENALTIES: Record<string, number> = {
  resort: -15,
  'all inclusive': -12,
  'all-inclusive': -12,
  familienhotel: -12,
  kinderhotel: -15,
  'kids club': -15,
  animationsprogramm: -15,
  wasserpark: -15,
  erlebnisbad: -12,
  'wellness tempel': -10,
  therme: -8,
  'grosses hotel': -10,
  'großes hotel': -10,
  kettenhotel: -15,
  'best western': -15,
  accor: -15,
  hilton: -15,
  marriott: -15,
  ramada: -12,
  ibis: -15,
  hostel: -10,
  jugendherberge: -15,
  campingplatz: -10,
  'über 50 zimmer': -10,
  'über 100 zimmer': -15,
  massentourismus: -15,
  skigebiet: -5,
  partyhotel: -15,
}

export const SMALL_ACCOMMODATION_BONUS = 10
export const GOOD_RATING_BONUS = 8
export const RATING_THRESHOLD = 4.5
export const REVIEW_COUNT_MIN = 10
export const BASE_SCORE = 50
export const MAX_OFFGRID_BONUS = 30
export const MAX_RESORT_PENALTY = -40

// Accommodation verification scoring
export const ACCOMMODATION_SCHEMA_BONUS = 8
export const BOOKING_SIGNALS_BONUS = 5
export const NO_ACCOMMODATION_PENALTY = -15

// Snippet scoring
export const SNIPPET_WEIGHT = 0.5
export const MAX_SNIPPET_BONUS = 10
export const MAX_SNIPPET_PENALTY = -15
