import { z } from 'zod';

export const UIDSchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9]{10}$/, 'Must be an 11-character DHIS2-style alphanumeric UID starting with a letter');

export const MemberCreateSchema = z.object({
  name: z.string().min(2),
  abbreviation: z.string().optional(),
  member_type: z.enum(['CHA', 'HSS', 'DSO', 'CHI', 'INDIVIDUAL', 'OTHER']),
  is_organisation: z.boolean().default(true),
  home_country: z.string().length(2),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  strategic_plan_title: z.string().optional(),
  strategic_plan_start: z.string().optional(),
  strategic_plan_end: z.string().optional(),
  plan_alignment_notes: z.string().optional(),
  subscription_status: z.enum(['ACTIVE', 'LAPSED', 'SUSPENDED', 'PENDING']).default('ACTIVE'),
  registration_date: z.string()
});

export const OrgUnitCreateSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(2),
  short_name: z.string().optional(),
  kind: z.enum(['NETWORK', 'COUNTRY', 'MEMBER', 'FACILITY', 'SUBNATIONAL']),
  parent_id: z.string().uuid().optional(),
  member_id: z.string().uuid().optional(),
  country: z.string().length(2).optional(),
  opening_date: z.string().optional(),
  closed_date: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const FacilityProfileSchema = z.object({
  org_unit_id: z.string().uuid(),
  facility_level: z.enum(['DISPENSARY', 'HEALTH_CENTRE', 'HOSPITAL', 'REFERRAL_HOSPITAL', 'OTHER']),
  ownership: z.string().default('FAITH_BASED'),
  bed_capacity: z.number().int().nonnegative().optional(),
  catchment_population: z.number().int().nonnegative().optional(),
  catchment_description: z.string().optional(),
  national_facility_code: z.string().optional(),
  dhis2_org_unit_uid: z.string().optional(),
  contact_person: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  has_pharmacy: z.boolean().default(true),
  has_lab: z.boolean().default(false),
  services: z.array(z.string()).default([]),
  epn_support_status: z.enum(['SUPPORTED', 'PREVIOUSLY_SUPPORTED', 'UNSUPPORTED']).default('UNSUPPORTED')
});

export const DataValueWriteSchema = z.object({
  data_element_id: z.string(),
  period_iso: z.string(),
  org_unit_id: z.string(),
  coc_id: z.string().optional(),
  aoc_id: z.string().optional(),
  value: z.string(),
  comment: z.string().optional(),
  follow_up: z.boolean().optional(),
  force: z.boolean().optional()
});

export const DataValueSetSchema = z.object({
  dataSet: z.string().optional(),
  period: z.string().optional(),
  orgUnit: z.string().optional(),
  attributeOptionCombo: z.string().optional(),
  completeDate: z.string().optional(),
  dataValues: z.array(
    z.object({
      dataElement: z.string(),
      period: z.string().optional(),
      orgUnit: z.string().optional(),
      categoryOptionCombo: z.string().optional(),
      attributeOptionCombo: z.string().optional(),
      value: z.string(),
      comment: z.string().optional(),
      followUp: z.boolean().optional()
    })
  )
});

export const StockTransactionSchema = z.object({
  client_id: z.string().uuid().optional(),
  org_unit_id: z.string(),
  location_id: z.string(),
  item_id: z.string(),
  batch_no: z.string().optional(),
  expiry_date: z.string().optional(),
  kind: z.enum([
    'RECEIPT',
    'ISSUE',
    'DISPENSE',
    'TRANSFER_OUT',
    'TRANSFER_IN',
    'ADJUST_PLUS',
    'ADJUST_MINUS',
    'EXPIRED',
    'DAMAGED',
    'COUNT'
  ]),
  qty: z.number().positive(),
  unit_cost: z.number().nonnegative().optional(),
  occurred_at: z.string().datetime().or(z.string()),
  reason: z.string().optional()
});
