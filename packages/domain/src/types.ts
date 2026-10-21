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
