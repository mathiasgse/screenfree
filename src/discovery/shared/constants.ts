import type { RegionPreset } from './types'

export const REGION_PRESETS: RegionPreset[] = [
  // Austria
  {
    key: 'burgenland',
    label: 'Burgenland',
    country: 'AT',
    microregions: ['Neusiedler See', 'Südburgenland', 'Mittelburgenland', 'Rosalia'],
    keywords: ['Weingut', 'Boutique Hotel', 'Landhotel', 'Seehotel'],
  },
  {
    key: 'carinthia',
    label: 'Kärnten',
    country: 'AT',
    microregions: ['Nockberge', 'Lesachtal', 'Gailtal', 'Maltatal', 'Millstätter See', 'Weissensee'],
    keywords: ['Seehotel', 'Berghotel', 'Boutique Hotel', 'Chalet', 'Lodge'],
  },
  {
    key: 'lower-austria',
    label: 'Niederösterreich',
    country: 'AT',
    microregions: ['Wachau', 'Waldviertel', 'Ötscher-Tormäuer', 'Semmering', 'Mostviertel', 'Bucklige Welt'],
    keywords: ['Landhotel', 'Boutique Hotel', 'Weingut', 'Gasthof', 'Refugium'],
  },
  {
    key: 'upper-austria',
    label: 'Oberösterreich',
    country: 'AT',
    microregions: ['Salzkammergut', 'Mühlviertel', 'Pyhrn-Priel', 'Innviertel', 'Traunviertel', 'Böhmerwald'],
    keywords: ['Seehotel', 'Landhotel', 'Boutique Hotel', 'Biohotel', 'Gasthof'],
  },
  {
    key: 'salzburg',
    label: 'Salzburger Land',
    country: 'AT',
    microregions: ['Pinzgau', 'Pongau', 'Lungau', 'Tennengau', 'Gasteinertal', 'Großarltal', 'Raurisertal'],
    keywords: ['Berghotel', 'Chalet', 'Almhütte', 'Boutique Hotel', 'Lodge'],
  },
  {
    key: 'styria',
    label: 'Steiermark',
    country: 'AT',
    microregions: ['Schladming-Dachstein', 'Gesäuse', 'Ausseerland', 'Hochschwab', 'Südsteiermark', 'Murtal', 'Joglland'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Landhotel', 'Weingut', 'Almhütte'],
  },
  {
    key: 'tyrol',
    label: 'Tirol',
    country: 'AT',
    microregions: ['Ötztal', 'Stubaital', 'Wipptal', 'Sellraintal', 'Lechtal', 'Paznaun', 'Pitztal', 'Kaunertal', 'Tannheimer Tal'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Almresort', 'Refugium'],
  },
  {
    key: 'vorarlberg',
    label: 'Vorarlberg',
    country: 'AT',
    microregions: ['Bregenzerwald', 'Montafon', 'Kleinwalsertal', 'Großes Walsertal', 'Arlberg', 'Brandnertal'],
    keywords: ['Holzhotel', 'Boutique Hotel', 'Chalet', 'Berghotel', 'Architekturhotel'],
  },
  // Switzerland
  {
    key: 'berner-oberland',
    label: 'Berner Oberland',
    country: 'CH',
    microregions: ['Simmental', 'Diemtigtal', 'Kiental', 'Lauterbrunnen', 'Haslital', 'Kandertal'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Lodge'],
  },
  {
    key: 'graubuenden',
    label: 'Graubünden',
    country: 'CH',
    microregions: ['Engadin', 'Val Müstair', 'Vals', 'Safiental', 'Avers', 'Prättigau', 'Lenzerheide'],
    keywords: ['Berghotel', 'Boutique Hotel', 'Chalet', 'Refugium', 'Berggasthaus'],
  },
  {
    key: 'eastern-switzerland',
    label: 'Ostschweiz',
    country: 'CH',
    microregions: ['Appenzell', 'Alpstein', 'Toggenburg', 'Glarnerland', 'Flumserberg', 'Walensee'],
    keywords: ['Berggasthaus', 'Boutique Hotel', 'Chalet', 'Berghotel', 'Gasthof'],
  },
  {
    key: 'ticino',
    label: 'Tessin',
    country: 'CH',
    microregions: ['Verzascatal', 'Valle Maggia', 'Centovalli', 'Malcantone', 'Leventina', 'Mendrisiotto'],
    keywords: ['Boutique Hotel', 'Grotto', 'Rustico', 'Berghotel', 'Lodge'],
  },
  {
    key: 'valais',
    label: 'Wallis',
    country: 'CH',
    microregions: ['Lötschental', 'Saastal', 'Zermatt', 'Aletsch', 'Val d\'Hérens', 'Val d\'Anniviers', 'Goms'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Lodge', 'Refugium'],
  },
  {
    key: 'central-switzerland',
    label: 'Zentralschweiz',
    country: 'CH',
    microregions: ['Engelberg', 'Urnerland', 'Stoos', 'Entlebuch', 'Melchsee-Frutt', 'Vierwaldstättersee'],
    keywords: ['Berghotel', 'Boutique Hotel', 'Berggasthaus', 'Chalet', 'Seehotel'],
  },
  // Germany
  {
    key: 'allgaeu',
    label: 'Allgäu',
    country: 'DE',
    microregions: ['Oberallgäu', 'Ostallgäu', 'Kleinwalsertal', 'Tannheimer Tal', 'Bad Hindelang'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Landhotel', 'Biohotel'],
  },
  {
    key: 'bavarian-alps',
    label: 'Bayerische Alpen',
    country: 'DE',
    microregions: ['Berchtesgadener Land', 'Chiemgau', 'Werdenfelser Land', 'Tegernseer Tal', 'Mangfallgebirge'],
    keywords: ['Berghotel', 'Chalet', 'Boutique Hotel', 'Landhotel', 'Gasthof'],
  },
  {
    key: 'lake-constance',
    label: 'Bodensee & Oberschwaben',
    country: 'DE',
    microregions: ['Bodensee', 'Hegau', 'Oberschwaben', 'Linzgau'],
    keywords: ['Seehotel', 'Boutique Hotel', 'Landhotel', 'Gasthof'],
  },
  {
    key: 'black-forest',
    label: 'Schwarzwald',
    country: 'DE',
    microregions: ['Hochschwarzwald', 'Südschwarzwald', 'Nordschwarzwald', 'Kinzigtal', 'Glottertal', 'Münstertal'],
    keywords: ['Boutique Hotel', 'Landhotel', 'Gasthof', 'Chalet', 'Biohotel'],
  },
  // Italy
  {
    key: 'aosta-valley',
    label: 'Aostatal',
    country: 'IT',
    microregions: ['Gran Paradiso', 'Monte Rosa', 'Val d\'Ayas', 'Valtournenche', 'Cogne', 'La Thuile'],
    keywords: ['Chalet', 'Boutique Hotel', 'Rifugio', 'Berghotel', 'Lodge'],
  },
  {
    key: 'dolomiti-belluno',
    label: 'Dolomiti Bellunesi',
    country: 'IT',
    microregions: ['Cortina d\'Ampezzo', 'Val di Zoldo', 'Cadore', 'Agordino', 'Comelico'],
    keywords: ['Rifugio', 'Berghotel', 'Boutique Hotel', 'Chalet', 'Agriturismo'],
  },
  {
    key: 'south-tyrol',
    label: 'Südtirol',
    country: 'IT',
    microregions: ['Vinschgau', 'Passeiertal', 'Ultental', 'Ahrntal', 'Villnösstal', 'Gsieser Tal', 'Martelltal', 'Schnalstal', 'Sarntal', 'Ridnauntal'],
    keywords: ['Berghotel', 'Almhütte', 'Chalet', 'Boutique Hotel', 'Refugium', 'Garni', 'Pension'],
  },
  {
    key: 'trentino',
    label: 'Trentino',
    country: 'IT',
    microregions: ['Val di Non', 'Val di Sole', 'Val Rendena', 'Valsugana', 'Brenta Dolomiten', 'Val di Fiemme'],
    keywords: ['Berghotel', 'Agriturismo', 'Boutique Hotel', 'Rifugio', 'Chalet', 'Garni'],
  },
]

export const QUERY_TEMPLATES = [
  '{keyword} {microregion} abgelegen ruhig',
  '{keyword} {microregion} alleinlage natur',
  '{keyword} {microregion} boutique design klein',
  '{keyword} {microregion} digital detox offline',
  'kleine Unterkunft {microregion} ruhig abgeschieden',
  'geheimtipp {microregion} hotel abseits',
]

export const COUNTRY_NAMES: Record<string, string> = {
  AT: 'Österreich',
  CH: 'Schweiz',
  DE: 'Deutschland',
  IT: 'Italien',
}

export const SERPER_BASE_URL = 'https://google.serper.dev/search'

export const ENRICHMENT_TIMEOUT_MS = 10_000
export const ENRICHMENT_DELAY_MS = 500
export const AI_SCORE_THRESHOLD = 35
export const AUTO_REJECT_THRESHOLD = 25
export const AUTO_PROMOTE_THRESHOLD = 85

export const BLOCKED_DOMAINS = [
  'booking.com',
  'tripadvisor.',
  'expedia.',
  'hotels.com',
  'trivago.',
  'holidaycheck.',
  'hrs.de',
  'hotel.de',
  'kayak.',
  'agoda.',
]
