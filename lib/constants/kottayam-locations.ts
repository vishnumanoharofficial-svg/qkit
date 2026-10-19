/**
 * Kottayam District Location Master Data — Phase 1
 * Properties restricted to Kottayam District, Kerala, India
 *
 * Sources (official):
 * - https://kottayam.nic.in/en/administrative-setup/
 * - https://kottayam.nic.in/en/blocks-and-panchayats/
 * - https://lsgkerala.gov.in/en/know-the-lsgis/
 * - Kerala Local Self Government Department records
 *
 * Stats: 5 Taluks | 11 Block Panchayats | 71 Grama Panchayats | 6 Municipalities
 *
 * NOTE: Official spelling is "Changanassery" (not Changanacherry).
 *       "Pala" is also written as "Palai" in older documents.
 *       Kumarakom belongs to Kottayam district (Ettumanoor block), NOT Alappuzha.
 *       Erumely (Erumeli) is in Kottayam district — major Sabarimala route town.
 *       Thiruvalla is NOT in Kottayam — it belongs to Pathanamthitta district.
 */

// ─── Fixed Phase 1 constants ──────────────────────────────────────────────────

export const DISTRICT = 'Kottayam';
export const STATE    = 'Kerala';
export const COUNTRY  = 'India';

// ─── Revenue Divisions (2) ────────────────────────────────────────────────────

export const REVENUE_DIVISIONS = ['Kottayam Revenue Division', 'Pala Revenue Division'] as const;

// ─── Taluks (5 Revenue Taluks) ────────────────────────────────────────────────

export const TALUKS = [
  'Kottayam',
  'Changanassery',    // Official spelling — also known as Changanacherry
  'Vaikom',
  'Meenachil',        // Headquarters: Pala
  'Kanjirappally',
] as const;

export type Taluk = typeof TALUKS[number];

// Alias map for search/matching
export const TALUK_ALIASES: Record<string, string> = {
  'changanacherry': 'Changanassery',
  'changanassery':  'Changanassery',
  'pala taluk':     'Meenachil',
  'meenachil':      'Meenachil',
};

// ─── Municipalities (6 Urban Local Bodies) ────────────────────────────────────

export const MUNICIPALITIES = [
  { name: 'Kottayam',       taluk: 'Kottayam',       wards: 53, aliases: [] },
  { name: 'Changanassery',  taluk: 'Changanassery',  wards: 37, aliases: ['Changanacherry'] },
  { name: 'Ettumanoor',     taluk: 'Kottayam',       wards: 36, aliases: [] },
  { name: 'Erattupetta',    taluk: 'Meenachil',      wards: 29, aliases: [] },
  { name: 'Pala',           taluk: 'Meenachil',      wards: 26, aliases: ['Palai'] },
  { name: 'Vaikom',         taluk: 'Vaikom',         wards: 27, aliases: [] },
];

// ─── Block Panchayats & Grama Panchayats (11 blocks, 71 GPs) ─────────────────

export interface BlockData {
  block: string;
  taluk: string;
  panchayats: string[];
}

export const BLOCKS_AND_PANCHAYATS: BlockData[] = [
  {
    block: 'Vaikom',
    taluk: 'Vaikom',
    panchayats: [
      'Chempu',
      'Maravanthuruthu',
      'T.V. Puram',
      'Thalayazham',
      'Udayanapuram',
      'Vechoor',
    ],
  },
  {
    block: 'Kaduthuruthy',
    taluk: 'Vaikom',
    panchayats: [
      'Kaduthuruthy',
      'Kallara',
      'Mulakkulam',
      'Njeezhoor',
      'Thalayolaparambu',
      'Velloor',
    ],
  },
  {
    block: 'Ettumanoor',
    taluk: 'Kottayam',
    panchayats: [
      'Arpookkara',
      'Athirampuzha',
      'Aymanam',
      'Kumarakom',
      'Neendoor',
      'Thiruvarppu',
    ],
  },
  {
    block: 'Uzhavoor',
    taluk: 'Meenachil',
    panchayats: [
      'Kadaplamattom',
      'Kanakkary',
      'Kuravilangad',
      'Manjoor',
      'Marangattupally',
      'Monippally',
      'Ramapuram',
      'Uzhavoor',
      'Veliyannoor',
    ],
  },
  {
    block: 'Lalam',
    taluk: 'Meenachil',
    panchayats: [
      'Bharananganam',
      'Kadanadu',
      'Karoor',
      'Kozhuvanal',
      'Meenachil',
      'Mutholy',
    ],
  },
  {
    block: 'Erattupetta',
    taluk: 'Meenachil',
    panchayats: [
      'Melukavu',
      'Monnilavu',
      'Poonjar',
      'Poonjar Thekkekkara',
      'Thalanadu',
      'Thalappalam',
      'Thekkoy',
      'Thidanadu',
    ],
  },
  {
    block: 'Pampady',
    taluk: 'Kottayam',
    panchayats: [
      'Akalakkunnam',
      'Elikkulam',
      'Kidangoor',
      'Kooroppada',
      'Manarcadu',
      'Meenadom',
      'Pallickathodu',
      'Pampady',
    ],
  },
  {
    block: 'Pallom',
    taluk: 'Changanassery',
    panchayats: [
      'Ayarkunnam',
      'Kurichy',
      'Panachicadu',
      'Puthuppally',
      'Vijayapuram',
    ],
  },
  {
    block: 'Madappally',
    taluk: 'Changanassery',
    panchayats: [
      'Madappally',
      'Paippadu',
      'Thrikkodithanam',
      'Vakathanam',
      'Vazhappally',
    ],
  },
  {
    block: 'Vazhoor',
    taluk: 'Changanassery',
    panchayats: [
      'Chirakkadavu',
      'Kangazha',
      'Karukachal',
      'Nedumkunnam',
      'Vazhoor',
      'Vellavoor',
    ],
  },
  {
    block: 'Kanjirappally',
    taluk: 'Kanjirappally',
    panchayats: [
      'Erumely',
      'Kanjirappally',
      'Koottickal',
      'Koruthodu',
      'Manimala',
      'Mundakkayam',
      'Parathodu',
    ],
  },
];

// ─── Flat lists ───────────────────────────────────────────────────────────────

export const ALL_GRAMA_PANCHAYATS: string[] = BLOCKS_AND_PANCHAYATS
  .flatMap(b => b.panchayats)
  .sort((a, b) => a.localeCompare(b));

export const ALL_MUNICIPALITY_NAMES: string[] = MUNICIPALITIES.map(m => m.name);

// ─── Key towns, junctions and areas ──────────────────────────────────────────

export const KOTTAYAM_KEY_LOCALITIES: string[] = [
  // Kottayam city / town areas
  'Kottayam Town', 'Baker Junction', 'Thirunakkara', 'Nagampadom',
  'Collectorate Junction', 'Chingavanam', 'Kumaranalloor', 'Thellakom',
  'Nattakom', 'Gandhinagar', 'Manorama Junction', 'KK Road',
  'MC Road', 'Perunna', 'SH Mount', 'Pallimukku', 'Kanjikuzhy',
  // Changanassery / Changanacherry areas
  'Changanassery Town', 'Changanacherry Town', 'Peroor Junction',
  'Malekunnu', 'Perunna East', 'Perunna West', 'Railway Station Changanassery',
  // Ettumanoor areas
  'Ettumanoor Town', 'Thellakom Junction', 'Kariyattappuzha',
  // Erattupetta areas
  'Erattupetta Town', 'Aruvithura', 'Chirappara',
  // Pala areas
  'Pala Town', 'Palai Town', 'Plathanam', 'Pala Market', 'Lalam Junction',
  // Vaikom areas
  'Vaikom Town', 'Vaikom Jetty',
  // Kanjirappally areas
  'Kanjirappally Town', 'Erumeli', 'Erumely Junction',
  // Kuravilangad
  'Kuravilangad Town', 'Kuravilangad Junction',
  // Puthuppally
  'Puthuppally Junction', 'Puthuppally Church Area',
  // Kumarakom (backwaters)
  'Kumarakom', 'Kumarakom Boat Jetty', 'Kumarakom Lake',
  // Kaduthuruthy
  'Kaduthuruthy Town', 'Kaduthuruthy Junction',
  // Mundakkayam
  'Mundakkayam Town', 'Mundakkayam Estate Area',
  // Other key locations
  'Bharananganam', 'Manarcadu (Manarcad)', 'Kidangoor',
  'Marangattupally', 'Uzhavoor', 'Kangazha', 'Karukachal',
  'Vazhoor Junction', 'Nedumkunnam', 'Chirakkadavu',
  'Vellavoor', 'Kanakkary', 'Ramapuram', 'Monippally',
  'Thalayolaparambu', 'Njeezhoor', 'Velloor', 'Mulakkulam',
  'Kadaplamattom', 'Kozhuvanal', 'Mutholy', 'Meenachil',
  'Poonjar', 'Melukavu', 'Thidanadu', 'Thalanadu',
  'Aymanam', 'Athirampuzha', 'Arpookkara', 'Thiruvarppu',
  'Neendoor', 'Maravanthuruthu', 'T.V. Puram',
  'Chempu', 'Udayanapuram', 'Vechoor',
  'Ayarkunnam', 'Kurichy', 'Panachicadu', 'Vijayapuram',
  'Vakathanam', 'Paippadu', 'Madappally', 'Vazhappally', 'Thrikkodithanam',
  'Kooroppada', 'Elikkulam', 'Akalakkunnam', 'Pallickathodu',
  'Meenadom', 'Pampady', 'Manarcadu',
  'Koottickal', 'Koruthodu', 'Manimala', 'Parathodu',
].sort((a, b) => a.localeCompare(b));

// ─── Combined autocomplete list ───────────────────────────────────────────────

export const ALL_KOTTAYAM_LOCATIONS: string[] = Array.from(new Set([
  // Most-searched first (no sort override — will be sorted below)
  ...ALL_MUNICIPALITY_NAMES,
  ...ALL_GRAMA_PANCHAYATS,
  ...KOTTAYAM_KEY_LOCALITIES,
])).sort((a, b) => a.localeCompare(b));

// ─── Helper functions ─────────────────────────────────────────────────────────

export function getBlockForPanchayat(panchayat: string): string | null {
  for (const block of BLOCKS_AND_PANCHAYATS) {
    if (block.panchayats.map(p => p.toLowerCase()).includes(panchayat.toLowerCase())) {
      return block.block;
    }
  }
  return null;
}

export function getTalukForBlock(blockName: string): string | null {
  const block = BLOCKS_AND_PANCHAYATS.find(
    b => b.block.toLowerCase() === blockName.toLowerCase()
  );
  return block?.taluk || null;
}

export function getLocationsByTaluk(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const taluk of TALUKS) {
    const locations: string[] = [];
    MUNICIPALITIES.filter(m => m.taluk === taluk).forEach(m => locations.push(m.name));
    BLOCKS_AND_PANCHAYATS.filter(b => b.taluk === taluk).forEach(b =>
      locations.push(...b.panchayats)
    );
    result[taluk] = [...new Set(locations)].sort();
  }
  return result;
}

/** Normalise a user-typed location against official names */
export function normaliseLocation(input: string): string {
  const lower = input.toLowerCase().trim();
  if (TALUK_ALIASES[lower]) return TALUK_ALIASES[lower];
  for (const m of MUNICIPALITIES) {
    if (m.aliases.some(a => a.toLowerCase() === lower)) return m.name;
  }
  return input.trim();
}

// ─── Homepage / UI display ────────────────────────────────────────────────────

export const KOTTAYAM_POPULAR_AREAS = [
  { name: 'Kottayam',       type: 'Municipality',  description: 'District headquarters' },
  { name: 'Changanassery',  type: 'Municipality',  description: 'Major commercial town' },
  { name: 'Pala',           type: 'Municipality',  description: 'Meenachil taluk HQ' },
  { name: 'Vaikom',         type: 'Municipality',  description: 'Historic backwater town' },
  { name: 'Ettumanoor',     type: 'Municipality',  description: 'Temple & commercial hub' },
  { name: 'Erattupetta',    type: 'Municipality',  description: 'Meenachil valley town' },
  { name: 'Kanjirappally',  type: 'Town',          description: 'Plantation & tourism hub' },
  { name: 'Kuravilangad',   type: 'Town',          description: 'Heritage & commercial town' },
  { name: 'Puthuppally',    type: 'Town',          description: 'Major ecclesiastical town' },
  { name: 'Kumarakom',      type: 'Locality',      description: 'Backwater & tourism' },
  { name: 'Mundakkayam',    type: 'Town',          description: 'High range gateway' },
  { name: 'Erumely',        type: 'Town',          description: 'Sabarimala pilgrim route' },
];
