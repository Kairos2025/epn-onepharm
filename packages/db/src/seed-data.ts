import {
  NETWORK_STATISTICS,
  MEMBER_CATEGORIES,
  HEALTH_PRIORITIES,
  STRATEGIC_PROGRAMMES_2021_2025,
  IMPLEMENTING_MEMBERS_SEED,
  FUNDERS_SEED,
  ACCESS_TIERS,
  generateUid
} from '@epn/domain';

export const SEED_COUNTRIES = [
  { code: 'KE', name: 'Kenya', lat: -0.0236, lng: 37.9062, epnPresence: true },
  { code: 'NG', name: 'Nigeria', lat: 9.0820, lng: 8.6753, epnPresence: true },
  { code: 'TZ', name: 'Tanzania', lat: -6.3690, lng: 34.8888, epnPresence: true },
  { code: 'RW', name: 'Rwanda', lat: -1.9403, lng: 29.8739, epnPresence: true },
  { code: 'TD', name: 'Chad', lat: 15.4542, lng: 18.7322, epnPresence: true },
  { code: 'CM', name: 'Cameroon', lat: 7.3697, lng: 12.3547, epnPresence: true },
  { code: 'LS', name: 'Lesotho', lat: -29.6099, lng: 28.2336, epnPresence: true },
  { code: 'LR', name: 'Liberia', lat: 6.4281, lng: -9.4295, epnPresence: true },
  { code: 'SL', name: 'Sierra Leone', lat: 8.4606, lng: -11.7799, epnPresence: true },
  { code: 'GN', name: 'Guinea', lat: 9.9456, lng: -9.6966, epnPresence: true },
  { code: 'BI', name: 'Burundi', lat: -3.3731, lng: 29.9189, epnPresence: true },
  { code: 'CD', name: 'Democratic Republic of Congo', lat: -4.0383, lng: 21.7587, epnPresence: true },
  { code: 'UG', name: 'Uganda', lat: 1.3733, lng: 32.2903, epnPresence: true },
  { code: 'NE', name: 'Niger', lat: 17.6078, lng: 8.0817, epnPresence: true },
  { code: 'MW', name: 'Malawi', lat: -13.2543, lng: 34.3015, epnPresence: true },
  { code: 'ZM', name: 'Zambia', lat: -13.1339, lng: 27.8493, epnPresence: true },
  { code: 'MG', name: 'Madagascar', lat: -18.7669, lng: 46.8691, epnPresence: true },
  { code: 'SS', name: 'South Sudan', lat: 6.8770, lng: 31.3070, epnPresence: true }
];

export const SEED_PROJECTS = [
  {
    code: 'ACCESS_II',
    name: 'ACCESS Phase II (2022–2025)',
    description: 'Strengthening pharmaceutical supply chains and rational medicine use across 100 mission health facilities.',
    funder: 'Bread for the World (Brot für die Welt)',
    countries: ['KE', 'TZ', 'ZM', 'CM', 'LS'],
    facilitiesCount: 100,
    healthWorkersTrained: 381,
    budget: 1200000,
    status: 'COMPLETED'
  },
  {
    code: 'ACCESS_III',
    name: 'ACCESS Phase III (from April 2025)',
    description: 'Institutionalizing pharmacy systems, clinical governance, and champion training in Central and West Africa.',
    funder: 'Bread for the World (Brot für die Welt)',
    countries: ['TD', 'CM', 'LS'],
    facilitiesCount: 75,
    healthWorkersTrained: 160,
    budget: 950000,
    status: 'ACTIVE'
  },
  {
    code: 'IMPACT',
    name: 'IMPACT - Continuous Clinical & Supply Chain Training',
    description: 'Targeted continuous education for faith-based pharmacists and facility store managers.',
    funder: 'German Federal Ministry for Economic Cooperation and Development (BMZ) via action medeor',
    countries: ['KE', 'TZ', 'RW'],
    facilitiesCount: 53,
    healthWorkersTrained: 106,
    budget: 680000,
    status: 'ACTIVE'
  },
  {
    code: 'MNCH_FBO',
    name: 'MNCH: Scaling Up Product Introduction via FBO Sector',
    description: 'Accelerating availability and rational use of essential maternal, newborn and child therapeutics.',
    funder: 'Bill & Melinda Gates Foundation',
    countries: ['KE', 'NG'],
    facilitiesCount: 250,
    healthWorkersTrained: 467,
    budget: 1850000,
    status: 'ACTIVE'
  },
  {
    code: 'MINILAB_NET',
    name: 'Minilab Screening Network for Medicine Quality',
    description: 'Post-marketing surveillance detecting substandard and falsified antimicrobials across Central/East/West Africa.',
    funder: 'Difaem (German Institute for Medical Mission)',
    countries: ['CD', 'CM', 'TD', 'NG', 'KE', 'SL', 'LR'],
    facilitiesCount: 42,
    healthWorkersTrained: 94,
    budget: 450000,
    status: 'ACTIVE'
  },
  {
    code: 'SAFER',
    name: 'SAFER Project',
    description: 'Safety, Antimicrobial Stewardship and Essential Therapeutics in Faith-Based Care.',
    funder: 'Plan:g',
    countries: ['MW'],
    facilitiesCount: 30,
    healthWorkersTrained: 65,
    budget: 320000,
    status: 'ACTIVE'
  }
];

export const SEED_DATA_ELEMENTS = [
  {
    uid: 'deTracerAvail',
    code: 'TRACER_AVAIL_COUNT',
    name: 'Tracer Medicines Available On Day of Assessment',
    shortName: 'Tracer Available',
    valueType: 'INTEGER',
    aggregationType: 'AVERAGE_SUM_ORG_UNIT',
    category: 'PHARMACEUTICAL',
    subcategory: 'Availability'
  },
  {
    uid: 'deTracerTotal',
    code: 'TRACER_TOTAL_COUNT',
    name: 'Total Tracer Medicines Assessed',
    shortName: 'Tracer Total',
    valueType: 'INTEGER',
    aggregationType: 'AVERAGE_SUM_ORG_UNIT',
    category: 'PHARMACEUTICAL',
    subcategory: 'Availability'
  },
  {
    uid: 'deStockoutDays',
    code: 'STOCKOUT_DAYS_COUNT',
    name: 'Facility-Days with Stock-out of Any Tracer Item',
    shortName: 'Stockout Days',
    valueType: 'INTEGER',
    aggregationType: 'SUM',
    category: 'PHARMACEUTICAL',
    subcategory: 'Stockouts'
  },
  {
    uid: 'deFacilityDays',
    code: 'FACILITY_DAYS_OBSERVED',
    name: 'Facility-Days Observed in Period',
    shortName: 'Days Observed',
    valueType: 'INTEGER',
    aggregationType: 'SUM',
    category: 'PHARMACEUTICAL',
    subcategory: 'Stockouts'
  },
  {
    uid: 'deDtcFunctional',
    code: 'DTC_FUNCTIONAL_FLAG',
    name: 'Drug & Therapeutics Committee Functional (Met within Quarter)',
    shortName: 'DTC Functional',
    valueType: 'BOOLEAN',
    aggregationType: 'LAST',
    category: 'FACILITY',
    subcategory: 'Governance'
  },
  {
    uid: 'deIpcFunctional',
    code: 'IPC_FUNCTIONAL_FLAG',
    name: 'Infection Prevention & Control Committee Functional',
    shortName: 'IPC Functional',
    valueType: 'BOOLEAN',
    aggregationType: 'LAST',
    category: 'FACILITY',
    subcategory: 'Governance'
  },
  {
    uid: 'deAmsFunctional',
    code: 'AMS_FUNCTIONAL_FLAG',
    name: 'Antimicrobial Stewardship Committee Functional',
    shortName: 'AMS Functional',
    valueType: 'BOOLEAN',
    aggregationType: 'LAST',
    category: 'FACILITY',
    subcategory: 'Governance'
  },
  {
    uid: 'deRevTracking',
    code: 'REVENUE_TRACKING_FLAG',
    name: 'Facility Systematically Tracking Pharmacy Revenue',
    shortName: 'Revenue Tracking',
    valueType: 'BOOLEAN',
    aggregationType: 'LAST',
    category: 'FINANCIAL',
    subcategory: 'DRF'
  },
  {
    uid: 'deDrfActive',
    code: 'DRF_ACCOUNT_ACTIVE',
    name: 'Dedicated Drug Revolving Fund (DRF) Bank Account Active',
    shortName: 'DRF Active',
    valueType: 'BOOLEAN',
    aggregationType: 'LAST',
    category: 'FINANCIAL',
    subcategory: 'DRF'
  },
  {
    uid: 'deEmlSize',
    code: 'EML_ITEM_COUNT',
    name: 'Essential Medicines List Size (Items Adopted)',
    shortName: 'EML Size',
    valueType: 'INTEGER',
    aggregationType: 'LAST',
    category: 'PHARMACEUTICAL',
    subcategory: 'Policy'
  },
  {
    uid: 'deHcwTrainedTotal',
    code: 'HCW_TRAINED_TOTAL',
    name: 'Healthcare Workers Trained in EPN Programmes',
    shortName: 'HCWs Trained',
    valueType: 'INTEGER',
    aggregationType: 'SUM',
    category: 'WORKFORCE',
    subcategory: 'Training'
  },
  {
    uid: 'deHcwTrainedFemale',
    code: 'HCW_TRAINED_FEMALE',
    name: 'Female Healthcare Workers Trained in EPN Programmes',
    shortName: 'Female HCWs Trained',
    valueType: 'INTEGER',
    aggregationType: 'SUM',
    category: 'WORKFORCE',
    subcategory: 'Training'
  }
];

export const SEED_INDICATORS = [
  {
    uid: 'indTracerAvail',
    code: 'IND_TRACER_AVAILABILITY_PCT',
    name: 'Tracer Medicine Availability (%)',
    shortName: 'Tracer Avail %',
    factor: 100,
    numerator: '#{deTracerAvail}',
    numeratorDescription: 'Available tracer items on day of assessment',
    denominator: '#{deTracerTotal}',
    denominatorDescription: 'Total tracer items assessed',
    decimals: 1,
    target: 85.0,
    baseline: 65.0
  },
  {
    uid: 'indStockoutRate',
    code: 'IND_STOCKOUT_RATE_PCT',
    name: 'Stock-out Rate (%)',
    shortName: 'Stock-out %',
    factor: 100,
    numerator: '#{deStockoutDays}',
    numeratorDescription: 'Facility-days with stock-out of any tracer item',
    denominator: '#{deFacilityDays}',
    denominatorDescription: 'Total facility-days observed',
    decimals: 1,
    target: 5.0,
    baseline: 28.0
  },
  {
    uid: 'indDtcFunctionality',
    code: 'IND_DTC_FUNCTIONALITY_PCT',
    name: 'Facilities with Functional DTC (%)',
    shortName: 'Functional DTC %',
    factor: 100,
    numerator: '#{deDtcFunctional}',
    numeratorDescription: 'Facilities with functional DTC meeting quarterly',
    denominator: '1',
    decimals: 1,
    target: 80.0,
    baseline: 42.0
  },
  {
    uid: 'indRevenueTracking',
    code: 'IND_REVENUE_TRACKING_PCT',
    name: 'Facilities Tracking Pharmacy Revenue (%)',
    shortName: 'Rev Tracking %',
    factor: 100,
    numerator: '#{deRevTracking}',
    numeratorDescription: 'Facilities tracking pharmacy revenue',
    denominator: '1',
    decimals: 1,
    target: 85.0,
    baseline: 67.0
  },
  {
    uid: 'indTrainingGender',
    code: 'IND_TRAINING_FEMALE_PCT',
    name: 'Training Gender Inclusivity (Female %)',
    shortName: 'Female Training %',
    factor: 100,
    numerator: '#{deHcwTrainedFemale}',
    numeratorDescription: 'Female healthcare workers trained',
    denominator: '#{deHcwTrainedTotal}',
    denominatorDescription: 'Total healthcare workers trained',
    decimals: 1,
    target: 50.0,
    baseline: 38.0
  }
];

export const SEED_STORIES = [
  {
    slug: 'eliminating-amoxicillin-stockouts-machakos',
    title: {
      en: 'Eliminating Amoxicillin Stock-outs in Rural Machakos Mission Dispensaries',
      fr: 'Élimination des ruptures d’amoxicilline dans les dispensaires de mission de Machakos'
    },
    summary: {
      en: 'How CHAK and EPN supported Kilome Mission Hospital and satellite dispensaries to achieve zero stock-outs through the Drug Revolving Fund.',
      fr: 'Comment CHAK et l’EPN ont soutenu l’hôpital de mission de Kilome pour atteindre zéro rupture de stock grâce au Fonds de Roulement.'
    },
    body: {
      en: 'Prior to the introduction of the EPN Drug Revolving Fund (DRF) training in 2023, Kilome dispensary experienced up to 18 stock-out days per month for first-line pediatric antibiotics. Following establishment of an active DTC and ring-fenced pharmacy revenues, tracer availability rose from 62% to 94%.',
      fr: 'Avant l’introduction de la formation sur le Fonds de Roulement de l’EPN en 2023, le dispensaire de Kilome connaissait jusqu’à 18 jours de rupture par mois. Après la mise en place d’un comité DTC actif, la disponibilité des médicaments traceurs est passée de 62 % à 94 %.'
    },
    consentRecorded: true,
    country: 'KE',
    status: 'PUBLISHED'
  },
  {
    slug: 'minilab-counterfeit-surveillance-cameroon',
    title: {
      en: 'Minilab Screening Intercepts Substandard Antibiotics in Northwest Cameroon',
      fr: 'Le réseau Minilab intercepte des antibiotiques non conformes dans le Nord-Ouest du Cameroun'
    },
    summary: {
      en: 'CBCHS pharmacy team identified counterfeit ceftriaxone shipments before distribution to clinical wards.',
      fr: 'L’équipe pharmaceutique de CBCHS a identifié des lots de ceftriaxone contrefaits avant leur distribution aux services cliniques.'
    },
    body: {
      en: 'Supported by Difaem and EPN, the Cameroon Baptist Convention Health Services operates two GPHF Minilab stations. In July 2024, screening detected zero active pharmaceutical ingredient (API) in a commercial batch of injectable cephalosporins, protecting over 800 surgical inpatients.',
      fr: 'Soutenu par Difaem et l’EPN, les services de santé de CBCHS exploitent deux stations Minilab. En juillet 2024, le dépistage a détecté l’absence totale de principe actif dans un lot commercial de céphalosporines injectables.'
    },
    consentRecorded: true,
    country: 'CM',
    status: 'PUBLISHED'
  }
];
