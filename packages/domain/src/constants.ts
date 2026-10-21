export const NETWORK_STATISTICS = {
  totalMembers: 149,
  totalCountries: 38,
  africanCountries: 29,
  populationServed: 300_000_000,
  networkFacilities: 25_000,
  asOf: 'December 2025'
} as const;

export const MEMBER_CATEGORIES = [
  { code: 'CHA', name: 'Christian Health Association', count: 35 },
  { code: 'HSS', name: 'Health Systems Strengthening', count: 26 },
  { code: 'DSO', name: 'Drug Supply Organisation', count: 19 },
  { code: 'CHI', name: 'Church Health Institution', count: 18 },
  { code: 'INDIVIDUAL', name: 'Individual Member', count: 49 },
  { code: 'OTHER', name: 'Other Partner', count: 2 }
] as const;

export const HEALTH_PRIORITIES = [
  {
    code: 'MNCH_RH',
    name: 'Maternal, Newborn, Child & Reproductive Health',
    description: 'Scaling up life-saving commodities, EmONC training, and quality maternal care in faith-based health networks.',
    color: '#0284c7'
  },
  {
    code: 'IPC_AMR',
    name: 'Infection Prevention & Control / Antimicrobial Resistance',
    description: 'AMS stewardship committees, hospital-acquired infection tracking, and Minilab surveillance.',
    color: '#059669'
  },
  {
    code: 'NCDS',
    name: 'Non-Communicable Diseases',
    description: 'Strengthening reliable supply chains and screening protocols for hypertension, diabetes, and oncology.',
    color: '#d97706'
  },
  {
    code: 'NTDS',
    name: 'Neglected Tropical Diseases',
    description: 'Targeted mass administration support and availability of essential therapeutics in marginalized rural clinics.',
    color: '#7c3aed'
  }
] as const;

export const STRATEGIC_PROGRAMMES_2021_2025 = [
  {
    code: 'PROG_1',
    name: 'Training and Capacity Development',
    description: 'Ecumenical Scholarship Programme, continuous LMS e-learning, in-person clinical and supply chain training.',
    sortOrder: 1
  },
  {
    code: 'PROG_2',
    name: 'Pharmaceutical Systems Strengthening',
    description: 'Functional Drug & Therapeutics Committees, AMT availability monitoring, and Drug Revolving Fund (DRF) establishment.',
    sortOrder: 2
  },
  {
    code: 'PROG_3',
    name: 'Supply Chain and Quality Assurance',
    description: 'DSO maturity assessments, pooled procurement (EACPP), Minilab screening network for counterfeit medicine detection.',
    sortOrder: 3
  },
  {
    code: 'PROG_4',
    name: 'Member Engagement',
    description: 'Governance, regional collaboration forums, annual general meetings, and bilateral peer bench-learning.',
    sortOrder: 4
  },
  {
    code: 'PROG_5',
    name: 'Donor Partnerships and Sustainability',
    description: 'Mobilizing diversified philanthropic and multilateral support for faith-based pharmaceutical networks.',
    sortOrder: 5
  }
] as const;

export const IMPLEMENTING_MEMBERS_SEED = [
  { name: 'Christian Health Association of Kenya', abbreviation: 'CHAK', country: 'KE', type: 'CHA' },
  { name: 'Mission for Essential Drugs and Supplies', abbreviation: 'MEDS', country: 'KE', type: 'DSO' },
  { name: 'Christian Health Association of Nigeria', abbreviation: 'CHAN', country: 'NG', type: 'CHA' },
  { name: 'CHAN Medi-Pharm Ltd', abbreviation: 'CHAN Medi-Pharm', country: 'NG', type: 'DSO' },
  { name: 'Christian Social Services Commission', abbreviation: 'CSSC', country: 'TZ', type: 'CHA' },
  { name: 'Bureau des Formations Médicales Agréées du Rwanda', abbreviation: 'BUFMAR', country: 'RW', type: 'DSO' },
  { name: 'Association Évangélique pour la Santé au Tchad', abbreviation: 'AEST', country: 'TD', type: 'CHA' },
  { name: 'Cameroon Baptist Convention Health Services', abbreviation: 'CBCHS', country: 'CM', type: 'CHI' },
  { name: 'Presbyterian Church in Cameroon Health Services', abbreviation: 'PCC', country: 'CM', type: 'CHI' },
  { name: 'Christian Health Association of Lesotho', abbreviation: 'CHAL', country: 'LS', type: 'CHA' },
  { name: 'Christian Health Association of Liberia', abbreviation: 'CHAL', country: 'LR', type: 'CHA' },
  { name: 'Christian Health Association of Sierra Leone', abbreviation: 'CHASL', country: 'SL', type: 'CHA' },
  { name: 'Réseau Confessionnel d’Appui à la Santé en Guinée', abbreviation: 'RECOSAC-G', country: 'GN', type: 'CHA' },
  { name: 'Réseau Confessionnel pour le Bien-être des Indigents au Burundi', abbreviation: 'RCBIF', country: 'BI', type: 'CHA' },
  { name: 'Communauté Baptiste au Centre de l’Afrique', abbreviation: 'CBCA', country: 'CD', type: 'CHI' },
  { name: 'Département des Œuvres Médicales de l’ECC', abbreviation: 'DOM-ECC', country: 'CD', type: 'HSS' },
  { name: 'Uganda Protestant Medical Bureau', abbreviation: 'UPMB', country: 'UG', type: 'CHA' },
  { name: 'Uganda Catholic Medical Bureau', abbreviation: 'UCMB', country: 'UG', type: 'CHA' },
  { name: 'Mutuelle Islamique et Chrétienne de Santé de Niger', abbreviation: 'MUSH', country: 'NE', type: 'HSS' }
] as const;

export const FUNDERS_SEED = [
  { name: 'Bread for the World (Brot für die Welt)', type: 'BILATERAL_FBO', country: 'DE', website: 'https://www.brot-fuer-die-welt.de' },
  { name: 'Bill & Melinda Gates Foundation', type: 'PHILANTHROPIC', country: 'US', website: 'https://www.gatesfoundation.org' },
  { name: 'German Federal Ministry for Economic Cooperation and Development (BMZ) via action medeor', type: 'GOVERNMENT', country: 'DE', website: 'https://www.medeor.de' },
  { name: 'Difaem (German Institute for Medical Mission)', type: 'FAITH_BASED', country: 'DE', website: 'https://difaem.de' },
  { name: 'BEGECA eG', type: 'PROCUREMENT_COOP', country: 'DE', website: 'https://www.begeca.de' },
  { name: 'Plan:g', type: 'FOUNDATION', country: 'AT', website: 'https://www.plan-g.at' },
  { name: 'Fresenius Kabi', type: 'CORPORATE', country: 'DE', website: 'https://www.fresenius-kabi.com' },
  { name: 'HORIZONT3000', type: 'NGO', country: 'AT', website: 'https://www.horizont3000.at' },
  { name: 'Apotheker Helfen e.V.', type: 'NGO', country: 'DE', website: 'https://www.apotheker-helfen.de' }
] as const;

export const ACCESS_TIERS = [
  {
    tier: 'PUBLIC',
    name: 'Public',
    description: 'Headline figures, Africa map, strategic programmes, published stories. No login required.',
    granularity: 'Country & Network totals',
    export: 'None'
  },
  {
    tier: 'REGISTERED',
    name: 'Registered Community',
    description: 'Free account unlocking indicator trends and member directory contacts.',
    granularity: 'Country & Member aggregates',
    export: 'Summary CSV'
  },
  {
    tier: 'BASIC',
    name: 'Basic Subscriber',
    description: 'Self-serve time-boxed or monthly pass for aggregated analytics, charts, maps, and scorecards.',
    granularity: 'Country & Member aggregates',
    export: 'CSV, PNG'
  },
  {
    tier: 'PRO',
    name: 'Pro Professional',
    description: 'Full analytics access down to consented facility-level indicators with pivot builder and scheduled reports.',
    granularity: 'Facility (Consented)',
    export: 'CSV, Excel, API'
  },
  {
    tier: 'FULL',
    name: 'Full Institutional Partner',
    description: 'Governed access under data-sharing agreements with raw data sets and DHIS2 interoperability endpoints.',
    granularity: 'Facility & Micro aggregates',
    export: 'All formats'
  }
] as const;
