export type MemberType = 'CHA' | 'HSS' | 'DSO' | 'CHI' | 'INDIVIDUAL' | 'OTHER';
export type SubscriptionStatus = 'ACTIVE' | 'LAPSED' | 'SUSPENDED' | 'PENDING';
export type OrgUnitKind = 'NETWORK' | 'COUNTRY' | 'MEMBER' | 'FACILITY' | 'SUBNATIONAL';
export type FacilityLevel = 'DISPENSARY' | 'HEALTH_CENTRE' | 'HOSPITAL' | 'REFERRAL_HOSPITAL' | 'OTHER';
export type EPNSupportStatus = 'SUPPORTED' | 'PREVIOUSLY_SUPPORTED' | 'UNSUPPORTED';
export type PeriodType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SIXMONTHLY' | 'YEARLY' | 'FINANCIAL_JULY' | 'FINANCIAL_APRIL';
export type ValueType = 'NUMBER' | 'INTEGER' | 'POSITIVE_INTEGER' | 'PERCENTAGE' | 'BOOLEAN' | 'TRUE_ONLY' | 'TEXT' | 'LONG_TEXT' | 'DATE' | 'OPTION_SET' | 'CURRENCY';
export type AggregationType = 'SUM' | 'AVERAGE' | 'AVERAGE_SUM_ORG_UNIT' | 'LAST' | 'LAST_IN_PERIOD' | 'MIN' | 'MAX' | 'COUNT' | 'NONE';
export type DataCategory = 'MEMBERSHIP' | 'PROJECT' | 'FACILITY' | 'PHARMACEUTICAL' | 'WORKFORCE' | 'FINANCIAL' | 'IMPACT';
export type AccessTier = 'PUBLIC' | 'REGISTERED' | 'BASIC' | 'PRO' | 'FULL';
export type UserKind = 'STAFF' | 'MEMBER_USER' | 'FACILITY_USER' | 'FUNDER' | 'SUBSCRIBER' | 'EXTERNAL_PARTNER';

export interface Member {
  id: string;
  uid: string;
  name: string;
  abbreviation?: string;
  member_type: MemberType;
  is_organisation: boolean;
  home_country: string;
  website?: string;
  description?: string;
  strategic_plan_title?: string;
  strategic_plan_start?: string;
  strategic_plan_end?: string;
  plan_alignment_notes?: string;
  subscription_status: SubscriptionStatus;
  registration_date: string;
  is_synthetic: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrgUnit {
  id: string;
  uid: string;
  code?: string;
  name: string;
  short_name?: string;
  kind: OrgUnitKind;
  tree: 'ORG' | 'GEO';
  parent_id?: string;
  path: string;
  level: number;
  member_id?: string;
  country?: string;
  opening_date?: string;
  closed_date?: string;
  latitude?: number;
  longitude?: number;
  is_synthetic: boolean;
  children?: OrgUnit[];
}

export interface FacilityProfile {
  org_unit_id: string;
  facility_level: FacilityLevel;
  ownership: string;
  bed_capacity?: number;
  catchment_population?: number;
  catchment_description?: string;
  national_facility_code?: string;
  dhis2_org_unit_uid?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  has_pharmacy: boolean;
  has_lab: boolean;
  services: string[];
  epn_support_status: EPNSupportStatus;
  last_profile_review?: string;
}

export interface CategoryOption {
  id: string;
  uid: string;
  name: string;
  code?: string;
}

export interface Category {
  id: string;
  uid: string;
  name: string;
  options: CategoryOption[];
}

export interface CategoryCombo {
  id: string;
  uid: string;
  name: string;
  is_default: boolean;
  categories: Category[];
  optionCombos: CategoryOptionCombo[];
}

export interface CategoryOptionCombo {
  id: string;
  uid: string;
  name: string;
  options: string[];
}

export interface DataElement {
  id: string;
  uid: string;
  code?: string;
  name: string;
  short_name: string;
  description?: string;
  domain: 'AGGREGATE' | 'EVENT';
  value_type: ValueType;
  aggregation_type: AggregationType;
  category_combo_id: string;
  data_category: DataCategory;
  data_subcategory?: string;
  zero_is_significant: boolean;
}

export interface DataSet {
  id: string;
  uid: string;
  code?: string;
  name: string;
  short_name?: string;
  period_type: PeriodType;
  expiry_days: number;
  timely_days: number;
  elements?: DataElement[];
}

export interface DataValue {
  data_element_id: string;
  period_type: PeriodType;
  period_start: string;
  period_iso: string;
  org_unit_id: string;
  coc_id: string;
  aoc_id: string;
  value: string;
  value_num?: number;
  comment?: string;
  follow_up: boolean;
  stored_by: string;
  source: 'FORM' | 'IMPORT' | 'API' | 'MEDSTOCK' | 'DHIS2' | 'PREDICTOR' | 'SYNC';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface Indicator {
  id: string;
  uid: string;
  code?: string;
  name: string;
  short_name: string;
  description?: string;
  indicator_type_id: string;
  factor: number;
  numerator: string;
  numerator_description?: string;
  denominator: string;
  denominator_description?: string;
  decimals: number;
  annualized: boolean;
  data_category?: DataCategory;
  baseline?: number;
  target?: number;
}

export interface Project {
  id: string;
  uid: string;
  code?: string;
  name: string;
  description?: string;
  programme_id: string;
  start_date: string;
  end_date?: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED';
  budget_total?: number;
  currency: string;
  lead_member_id?: string;
  priorities?: string[];
  countries?: string[];
  facilities_count?: number;
}

export interface Funder {
  id: string;
  uid: string;
  name: string;
  funder_type?: string;
  country?: string;
  contact_person?: string;
  contact_email?: string;
  website?: string;
}

export interface Funding {
  id: string;
  project_id: string;
  funder_id: string;
  amount: number;
  currency: string;
  period_start: string;
  period_end?: string;
  disbursed: number;
  notes?: string;
}

export interface StockItem {
  id: string;
  uid: string;
  code?: string;
  name: string;
  generic_name?: string;
  atc_code?: string;
  dosage_form?: string;
  strength?: string;
  pack_size: number;
  unit: string;
  category: 'MEDICINE' | 'CONSUMABLE' | 'DIAGNOSTIC' | 'EQUIPMENT' | 'OTHER';
  is_tracer: boolean;
  on_eml: boolean;
  min_months_stock: number;
  max_months_stock: number;
  active: boolean;
}

export interface StockTransaction {
  id: string;
  client_id?: string;
  org_unit_id: string;
  location_id: string;
  item_id: string;
  batch_no?: string;
  expiry_date?: string;
  kind: 'RECEIPT' | 'ISSUE' | 'DISPENSE' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUST_PLUS' | 'ADJUST_MINUS' | 'EXPIRED' | 'DAMAGED' | 'COUNT';
  qty: number;
  unit_cost?: number;
  occurred_at: string;
  recorded_by: string;
  reason?: string;
}

export interface Story {
  id: string;
  uid: string;
  slug: string;
  title: Record<string, string>;
  summary: Record<string, string>;
  body: Record<string, string>;
  status: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  consent_recorded: boolean;
  published_at?: string;
  author_id?: string;
  facility_id?: string;
  member_id?: string;
  project_id?: string;
}

export type DataProvenance = 'VALIDATED_SURVEY' | 'DHIS2_LIVE_SYNC' | 'SIMULATED_BENCHMARK';
export type EpnActorRole = 'EPN_COORDINATOR' | 'MEMBER_PHARMACIST' | 'DOCTOR' | 'PUBLIC_VIEWER';
export type UhcCommitment = 'QUALITY_IMPROVEMENT' | 'FINANCIAL_PROTECTION' | 'COVERAGE_EXTENSION';

export interface JurisdictionPartitionSummary {
  country: string;
  countryName: string;
  residencyMode: 'IN_COUNTRY_PARTITION' | 'REGIONAL_AGGREGATE_ONLY';
  dataValuesCount: number;
  stockTransactionsCount: number;
  dpaSignedMembers: number;
  totalMembers: number;
  regulatoryFramework: string;
}

export type MembershipRegionFilter = 'ALL' | 'EAST' | 'WEST' | 'CENTRAL' | 'SOUTHERN';

export interface MemberRecordDetail {
  id: string;
  code: string;
  name: string;
  category: 'CHA' | 'HSS' | 'DSO' | 'CHI' | 'INDIVIDUAL';
  votingStatus: 'ORDINARY' | 'ASSOCIATE';
  country: string;
  city?: string;
  language: 'EN' | 'FR' | 'BILINGUAL' | 'ES';
  region: 'EAST' | 'WEST' | 'CENTRAL' | 'SOUTHERN';
  facilitiesCount: number;
  approvedDate: string;
  isNew2026?: boolean;
  completenessPct: number;
  missingFields: string[];
  invoice2027: {
    status: 'PENDING' | 'ISSUED' | 'SUBMITTED' | 'ACKNOWLEDGED' | 'PAID';
    invoiceNo?: string;
    issuedDate?: string;
    amountUsd: number;
    sentToEmail?: string;
    sentAt?: string;
  };
  contacts?: {
    primaryEmail?: string;
    financeEmail?: string;
    phone?: string;
    referencePeople: Array<{ name: string; role: string; email?: string; phone?: string }>;
    lastVerifiedDate?: string;
    lastReminderSentDate?: string;
  };
  changeHistory: Array<{ date: string; note: string }>;
}

export interface MembershipDashboardData {
  region: MembershipRegionFilter;
  summary: {
    totalMembers: number;
    newOrdinary2026: string;
    ordinaryVoting: number;
    associateNoVote: number;
    feesCollected2025Usd: number;
    feesExpectedUsd: number;
    feesCollected2025Pct: number;
    membersPaid2025: number;
    membersPaid2024: number;
    financeContactOnFile: number;
    financeContactPct: number;
  };
  categories: Array<{
    code: string;
    name: string;
    ordinary: number;
    associate: number;
    total: number;
    sharePct: number;
    paid2024: number;
    paid2025: number;
  }>;
  yearlyPayments: Array<{
    year: number;
    isForumYear: boolean;
    membersPaid: number;
    amountUsd: number;
  }>;
  feeCycle2027: {
    invoiceIssued: number;
    submitted: number;
    acknowledged: number;
    paymentReceived: number;
    goodStandingList: number;
  };
  invoiceAging: Array<{ label: string; count: number; tone: string }>;
  sizeBands: Array<{ band: string; range: string; count: number; sharePct: number }>;
  contactsOnFile: Array<{ field: string; pct: number; count: number }>;
  cleanUpQueue: Array<{ label: string; count: number }>;
  countriesTop12: Array<{ country: string; count: number }>;
  languages: Array<{ label: string; count: number; color: string }>;
  feeCalendar2027: Array<{
    when: string;
    action: string;
    owner: string;
    output: string;
    status?: 'PENDING' | 'ACTIVATED';
    activatedAt?: string;
    remindersDispatched?: number;
  }>;
  roleMatrix: Array<{ role: string; membership: string; communications: string; ict: string }>;
  records: MemberRecordDetail[];
}

export type SurveillanceAlertSeverity = 'CRITICAL' | 'WARNING' | 'WATCH' | 'NORMAL';
export type SurveillanceAlertCategory =
  | 'STOCK_OUT'
  | 'AMR_SIGNAL'
  | 'REPORTING_GAP'
  | 'COLD_CHAIN'
  | 'NEAR_EXPIRY'
  | 'OUTBREAK_PREPAREDNESS';
export type SurveillanceAlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface SurveillanceAlert {
  id: string;
  code: string;
  title: string;
  category: SurveillanceAlertCategory;
  severity: SurveillanceAlertSeverity;
  country: string;
  countryName: string;
  memberCode: string;
  facilityName: string;
  indicatorCode: string;
  currentValue: string;
  threshold: string;
  recommendedAction: string;
  detectedAt: string;
  status: SurveillanceAlertStatus;
  provenance: DataProvenance;
}

export interface CountryControlScorecard {
  country: string;
  countryName: string;
  memberCount: number;
  facilitiesReporting: number;
  totalFacilities: number;
  reportingCompletenessPct: number;
  timelinessPct: number;
  tracerAvailabilityPct: number;
  stockoutRatePct: number;
  amrStewardshipScorePct: number;
  controlStatus: 'OPTIMAL' | 'WATCH' | 'ALERT';
  provenance: DataProvenance;
}

export interface SurveillanceSummary {
  networkAlertLevel: 'ROUTINE' | 'ELEVATED' | 'HIGH_ALERT';
  epiWeek: string;
  lastUpdated: string;
  provenance: DataProvenance;
  reportingCompletenessPct: number;
  timelinessPct: number;
  activeAlertsCount: number;
  criticalAlertsCount: number;
  tracerAvailabilityPct: number;
  stockoutRatePct: number;
  amrCompliancePct: number;
  alerts: SurveillanceAlert[];
  countryScorecards: CountryControlScorecard[];
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorRole: EpnActorRole;
  action: string;
  targetType: 'ALERT' | 'DATA_VALUE' | 'STOCK_TRANSACTION' | 'SHARING_POLICY' | 'DHIS2_SYNC';
  targetId: string;
  previousState?: string;
  newState: string;
  occurredAt: string;
}

export interface MemberSharingPolicy {
  memberCode: string;
  memberName: string;
  country: string;
  shareFacilityAlerts: boolean;
  shareAmrSignals: boolean;
  dpaSigned: boolean;
  updatedAt: string;
}

export interface Dhis2PullResult {
  connectionId: string;
  connectionName: string;
  country: string;
  dryRun: boolean;
  pulledAt: string;
  recordsReceived: number;
  recordsMapped: number;
  unmappedRatePct: number;
  ingestedCount: number;
  provenance: DataProvenance;
}

export interface MpesaStkPushResponse {
  status: string;
  checkoutRequestId: string;
  customerMessage: string;
}
