/**
 * Client-safe preset constants for the Discovery admin UI.
 * This file intentionally avoids importing from constants.ts (server-only).
 * Keep in sync with REGION_PRESETS in constants.ts.
 */

export const PRESET_OPTIONS = [
  // Austria
  { key: 'burgenland', label: 'Burgenland', country: 'AT' },
  { key: 'carinthia', label: 'Kärnten', country: 'AT' },
  { key: 'lower-austria', label: 'Niederösterreich', country: 'AT' },
  { key: 'upper-austria', label: 'Oberösterreich', country: 'AT' },
  { key: 'salzburg', label: 'Salzburger Land', country: 'AT' },
  { key: 'styria', label: 'Steiermark', country: 'AT' },
  { key: 'tyrol', label: 'Tirol', country: 'AT' },
  { key: 'vorarlberg', label: 'Vorarlberg', country: 'AT' },
  // Switzerland
  { key: 'berner-oberland', label: 'Berner Oberland', country: 'CH' },
  { key: 'graubuenden', label: 'Graubünden', country: 'CH' },
  { key: 'eastern-switzerland', label: 'Ostschweiz', country: 'CH' },
  { key: 'ticino', label: 'Tessin', country: 'CH' },
  { key: 'valais', label: 'Wallis', country: 'CH' },
  { key: 'central-switzerland', label: 'Zentralschweiz', country: 'CH' },
  // Germany
  { key: 'allgaeu', label: 'Allgäu', country: 'DE' },
  { key: 'bavarian-alps', label: 'Bayerische Alpen', country: 'DE' },
  { key: 'lake-constance', label: 'Bodensee & Oberschwaben', country: 'DE' },
  { key: 'black-forest', label: 'Schwarzwald', country: 'DE' },
  // Italy
  { key: 'aosta-valley', label: 'Aostatal', country: 'IT' },
  { key: 'dolomiti-belluno', label: 'Dolomiti Bellunesi', country: 'IT' },
  { key: 'south-tyrol', label: 'Südtirol', country: 'IT' },
  { key: 'trentino', label: 'Trentino', country: 'IT' },
] as const

export const COUNTRY_OPTIONS = [
  { code: 'AT', label: 'Österreich' },
  { code: 'CH', label: 'Schweiz' },
  { code: 'DE', label: 'Deutschland' },
  { code: 'IT', label: 'Italien' },
] as const
