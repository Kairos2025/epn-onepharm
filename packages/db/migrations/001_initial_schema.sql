-- EPN OnePharm Core DDL Schema (PostgreSQL 16 + PostGIS)

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS citext;

-- Members
CREATE TABLE IF NOT EXISTS members (
  id              uuid PRIMARY KEY,
  uid             char(11) UNIQUE NOT NULL,
  name            text NOT NULL,
  abbreviation    text,
  member_type     text NOT NULL CHECK (member_type IN ('CHA','HSS','DSO','CHI','INDIVIDUAL','OTHER')),
  is_organisation boolean NOT NULL DEFAULT true,
  home_country    char(2) NOT NULL,
  website         text,
  description     text,
  strategic_plan_title  text,
  strategic_plan_start  date,
  strategic_plan_end    date,
  plan_alignment_notes  text,
  subscription_status   text NOT NULL DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE','LAPSED','SUSPENDED','PENDING')),
  registration_date     date NOT NULL,
  is_synthetic    boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (name, home_country)
);

-- Organisation units (Primary Tree + Geographic tree)
CREATE TABLE IF NOT EXISTS org_units (
  id          uuid PRIMARY KEY,
  uid         char(11) UNIQUE NOT NULL,
  code        text UNIQUE,
  name        text NOT NULL,
  short_name  text,
  kind        text NOT NULL CHECK (kind IN ('NETWORK','COUNTRY','MEMBER','FACILITY','SUBNATIONAL')),
  tree        text NOT NULL DEFAULT 'ORG' CHECK (tree IN ('ORG','GEO')),
  parent_id   uuid REFERENCES org_units(id),
  path        ltree NOT NULL,
  level       smallint NOT NULL,
  member_id   uuid REFERENCES members(id),
  country     char(2),
  opening_date date,
  closed_date date,
  geometry    geometry(Geometry, 4326),
  is_synthetic boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Facility Profiles
CREATE TABLE IF NOT EXISTS facility_profiles (
  org_unit_id        uuid PRIMARY KEY REFERENCES org_units(id),
  facility_level     text CHECK (facility_level IN ('DISPENSARY','HEALTH_CENTRE','HOSPITAL','REFERRAL_HOSPITAL','OTHER')),
  ownership          text DEFAULT 'FAITH_BASED',
  bed_capacity       integer,
  catchment_population integer,
  catchment_description text,
  national_facility_code text,
  dhis2_org_unit_uid  text,
  admin_unit_id      uuid REFERENCES org_units(id),
  contact_person     text,
  contact_email      text,
  contact_phone      text,
  has_pharmacy       boolean DEFAULT true,
  has_lab            boolean DEFAULT false,
  services           text[] NOT NULL DEFAULT '{}',
  epn_support_status text NOT NULL DEFAULT 'UNSUPPORTED' CHECK (epn_support_status IN ('SUPPORTED','PREVIOUSLY_SUPPORTED','UNSUPPORTED')),
  last_profile_review date
);

-- Org Unit Groups & Sets
CREATE TABLE IF NOT EXISTS org_unit_groups (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  code text UNIQUE,
  color text,
  symbol text
);

CREATE TABLE IF NOT EXISTS org_unit_group_members (
  group_id uuid REFERENCES org_unit_groups(id),
  org_unit_id uuid REFERENCES org_units(id),
  PRIMARY KEY (group_id, org_unit_id)
);

CREATE TABLE IF NOT EXISTS org_unit_group_sets (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  compulsory boolean DEFAULT false,
  data_dimension boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS org_unit_group_set_groups (
  group_set_id uuid REFERENCES org_unit_group_sets(id),
  group_id uuid REFERENCES org_unit_groups(id),
  PRIMARY KEY (group_set_id, group_id)
);

-- Strategic Plans, Pillars, Programmes, Priorities
CREATE TABLE IF NOT EXISTS strategic_plans (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  start_year int NOT NULL,
  end_year int NOT NULL,
  is_current boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS pillars (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  plan_id uuid NOT NULL REFERENCES strategic_plans(id),
  name text NOT NULL,
  description text,
  sort_order int
);

CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  pillar_id uuid REFERENCES pillars(id),
  name text NOT NULL,
  description text,
  parent_programme_id uuid REFERENCES programmes(id),
  sort_order int,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS health_priorities (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  color text,
  sort_order int
);

-- Funders, Projects, Funding
CREATE TABLE IF NOT EXISTS funders (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  funder_type text,
  country char(2),
  contact_person text,
  contact_email text UNIQUE,
  website text
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  description text,
  programme_id uuid NOT NULL REFERENCES programmes(id),
  start_date date NOT NULL,
  end_date date,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PLANNED','ACTIVE','COMPLETED','SUSPENDED')),
  budget_total numeric(18,2),
  currency char(3) DEFAULT 'USD',
  lead_member_id uuid REFERENCES members(id)
);

CREATE TABLE IF NOT EXISTS project_priorities (
  project_id uuid REFERENCES projects(id),
  priority_id uuid REFERENCES health_priorities(id),
  PRIMARY KEY (project_id, priority_id)
);

CREATE TABLE IF NOT EXISTS project_countries (
  project_id uuid REFERENCES projects(id),
  country char(2),
  PRIMARY KEY (project_id, country)
);

CREATE TABLE IF NOT EXISTS project_org_units (
  project_id uuid REFERENCES projects(id),
  org_unit_id uuid REFERENCES org_units(id),
  role text,
  start_date date,
  end_date date,
  PRIMARY KEY (project_id, org_unit_id)
);

CREATE TABLE IF NOT EXISTS funding (
  id uuid PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES projects(id),
  funder_id uuid NOT NULL REFERENCES funders(id),
  amount numeric(18,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'USD',
  period_start date NOT NULL,
  period_end date,
  disbursed numeric(18,2) DEFAULT 0,
  notes text
);

-- Category Combo & Disaggregations
CREATE TABLE IF NOT EXISTS category_options (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  code text
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  data_dimension_type text DEFAULT 'DISAGGREGATION' CHECK (data_dimension_type IN ('DISAGGREGATION','ATTRIBUTE'))
);

CREATE TABLE IF NOT EXISTS category_category_options (
  category_id uuid REFERENCES categories(id),
  option_id uuid REFERENCES category_options(id),
  sort_order int,
  PRIMARY KEY (category_id, option_id)
);

CREATE TABLE IF NOT EXISTS category_combos (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  is_default boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS category_combo_categories (
  combo_id uuid REFERENCES category_combos(id),
  category_id uuid REFERENCES categories(id),
  sort_order int,
  PRIMARY KEY (combo_id, category_id)
);

CREATE TABLE IF NOT EXISTS category_option_combos (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  combo_id uuid NOT NULL REFERENCES category_combos(id),
  name text NOT NULL,
  options uuid[] NOT NULL
);

-- Data Elements
CREATE TABLE IF NOT EXISTS data_elements (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  short_name text NOT NULL,
  description text,
  domain text NOT NULL DEFAULT 'AGGREGATE' CHECK (domain IN ('AGGREGATE','EVENT')),
  value_type text NOT NULL CHECK (value_type IN ('NUMBER','INTEGER','POSITIVE_INTEGER','PERCENTAGE','BOOLEAN','TRUE_ONLY','TEXT','LONG_TEXT','DATE','OPTION_SET','CURRENCY')),
  aggregation_type text NOT NULL DEFAULT 'SUM' CHECK (aggregation_type IN ('SUM','AVERAGE','AVERAGE_SUM_ORG_UNIT','LAST','LAST_IN_PERIOD','MIN','MAX','COUNT','NONE')),
  category_combo_id uuid NOT NULL REFERENCES category_combos(id),
  option_set_id uuid,
  data_category text NOT NULL CHECK (data_category IN ('MEMBERSHIP','PROJECT','FACILITY','PHARMACEUTICAL','WORKFORCE','FINANCIAL','IMPACT')),
  data_subcategory text,
  zero_is_significant boolean NOT NULL DEFAULT false,
  url text,
  comment_option_set_id uuid
);

-- Data Sets
CREATE TABLE IF NOT EXISTS data_sets (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  short_name text,
  period_type text NOT NULL CHECK (period_type IN ('DAILY','WEEKLY','MONTHLY','BIMONTHLY','QUARTERLY','SIXMONTHLY','YEARLY','FINANCIAL_JULY','FINANCIAL_APRIL')),
  open_future_periods int DEFAULT 0,
  expiry_days int DEFAULT 0,
  timely_days int DEFAULT 15,
  approval_workflow_id uuid,
  category_combo_id uuid REFERENCES category_combos(id),
  data_entry_form jsonb
);

CREATE TABLE IF NOT EXISTS data_set_sections (
  id uuid PRIMARY KEY,
  data_set_id uuid REFERENCES data_sets(id),
  name text,
  sort_order int,
  show_row_totals boolean DEFAULT false,
  show_column_totals boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS data_set_elements (
  data_set_id uuid REFERENCES data_sets(id),
  data_element_id uuid REFERENCES data_elements(id),
  section_id uuid REFERENCES data_set_sections(id),
  sort_order int,
  PRIMARY KEY (data_set_id, data_element_id)
);

CREATE TABLE IF NOT EXISTS data_set_org_units (
  data_set_id uuid REFERENCES data_sets(id),
  org_unit_id uuid REFERENCES org_units(id),
  PRIMARY KEY (data_set_id, org_unit_id)
);

-- Data Values
CREATE TABLE IF NOT EXISTS data_values (
  data_element_id uuid NOT NULL REFERENCES data_elements(id),
  period_type     text NOT NULL,
  period_start    date NOT NULL,
  period_iso      text NOT NULL,
  org_unit_id     uuid NOT NULL REFERENCES org_units(id),
  coc_id          uuid NOT NULL REFERENCES category_option_combos(id),
  aoc_id          uuid NOT NULL REFERENCES category_option_combos(id),
  value           text NOT NULL,
  value_num       numeric(20,4),
  comment         text,
  follow_up       boolean NOT NULL DEFAULT false,
  stored_by       uuid NOT NULL,
  source          text NOT NULL DEFAULT 'FORM' CHECK (source IN ('FORM','IMPORT','API','MEDSTOCK','DHIS2','PREDICTOR','SYNC')),
  version         integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (data_element_id, period_iso, org_unit_id, coc_id, aoc_id, period_start)
);

-- Indicators & Rules
CREATE TABLE IF NOT EXISTS indicator_types (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  name text NOT NULL,
  factor integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS indicators (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  short_name text NOT NULL,
  description text,
  indicator_type_id uuid NOT NULL REFERENCES indicator_types(id),
  numerator text NOT NULL,
  numerator_description text,
  denominator text NOT NULL DEFAULT '1',
  denominator_description text,
  decimals smallint DEFAULT 1,
  annualized boolean DEFAULT false,
  data_category text,
  programme_id uuid REFERENCES programmes(id),
  priority_id uuid REFERENCES health_priorities(id),
  legend_set_id uuid,
  baseline numeric,
  target numeric
);

-- Medstock Inventory
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  code text UNIQUE,
  name text NOT NULL,
  generic_name text,
  atc_code text,
  dosage_form text,
  strength text,
  pack_size int NOT NULL DEFAULT 1,
  unit text NOT NULL,
  category text CHECK (category IN ('MEDICINE','CONSUMABLE','DIAGNOSTIC','EQUIPMENT','OTHER')),
  is_tracer boolean DEFAULT false,
  on_eml boolean DEFAULT false,
  min_months_stock numeric DEFAULT 1,
  max_months_stock numeric DEFAULT 3,
  active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS stock_locations (
  id uuid PRIMARY KEY,
  org_unit_id uuid NOT NULL REFERENCES org_units(id),
  name text NOT NULL,
  kind text CHECK (kind IN ('MAIN_STORE','PHARMACY','WARD','DISPENSARY','QUARANTINE')),
  UNIQUE (org_unit_id, name)
);

CREATE TABLE IF NOT EXISTS batches (
  id uuid PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES items(id),
  batch_no text NOT NULL,
  expiry_date date,
  manufacturer text,
  unit_cost numeric(18,4),
  UNIQUE (item_id, batch_no)
);

CREATE TABLE IF NOT EXISTS stock_txns (
  id uuid PRIMARY KEY,
  client_id uuid UNIQUE,
  org_unit_id uuid NOT NULL REFERENCES org_units(id),
  location_id uuid NOT NULL REFERENCES stock_locations(id),
  item_id uuid NOT NULL REFERENCES items(id),
  batch_id uuid REFERENCES batches(id),
  kind text NOT NULL CHECK (kind IN ('RECEIPT','ISSUE','DISPENSE','TRANSFER_OUT','TRANSFER_IN','ADJUST_PLUS','ADJUST_MINUS','EXPIRED','DAMAGED','COUNT')),
  qty numeric(18,3) NOT NULL CHECK (qty >= 0),
  unit_cost numeric(18,4),
  counterpart_location_id uuid,
  requisition_id uuid,
  reference text,
  reason text,
  occurred_at timestamptz NOT NULL,
  recorded_by uuid NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  device_id text
);

CREATE TABLE IF NOT EXISTS stock_balances (
  location_id uuid REFERENCES stock_locations(id),
  item_id uuid REFERENCES items(id),
  batch_id uuid,
  qty numeric(18,3),
  as_of timestamptz,
  PRIMARY KEY (location_id, item_id, batch_id)
);

-- Users, Roles, Plans & Subscriptions
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  uid char(11) UNIQUE NOT NULL,
  email citext UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text,
  mfa_secret_enc bytea,
  locale text DEFAULT 'en',
  member_id uuid REFERENCES members(id),
  kind text NOT NULL CHECK (kind IN ('STAFF','MEMBER_USER','FACILITY_USER','FUNDER','SUBSCRIBER','EXTERNAL_PARTNER')),
  disabled boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY,
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('REGISTERED','BASIC','PRO','FULL')),
  billing text NOT NULL CHECK (billing IN ('HOURLY','DAILY','MONTHLY','ANNUAL')),
  price_minor integer NOT NULL,
  currency char(3) NOT NULL,
  entitlements jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  plan_id uuid NOT NULL REFERENCES plans(id),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED','PENDING_PAYMENT')),
  provider text,
  provider_ref text,
  auto_renew boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS audit_log (
  id bigserial PRIMARY KEY,
  at timestamptz DEFAULT now(),
  actor_id uuid,
  actor_ip inet,
  action text NOT NULL,
  object_type text,
  object_id text,
  before jsonb,
  after jsonb,
  request_id text
);
