import {
  Member,
  OrgUnit,
  FacilityProfile,
  DataElement,
  Indicator,
  Project,
  Funder,
  DataValue,
  StockItem,
  StockTransaction,
  Story,
  generateUid
} from '@epn/domain';
import {
  SEED_COUNTRIES,
  SEED_PROJECTS,
  SEED_DATA_ELEMENTS,
  SEED_INDICATORS,
  SEED_STORIES
} from './seed-data.js';
import {
  NETWORK_STATISTICS,
  IMPLEMENTING_MEMBERS_SEED,
  FUNDERS_SEED,
  HEALTH_PRIORITIES,
  STRATEGIC_PROGRAMMES_2021_2025
} from '@epn/domain';
import { evaluateExpression } from '@epn/expression';
import { parsePeriod, generateMonthlyPeriods } from '@epn/periods';

export interface DatabaseState {
  members: Member[];
  orgUnits: OrgUnit[];
  facilityProfiles: Record<string, FacilityProfile>;
  dataElements: DataElement[];
  indicators: Indicator[];
  projects: Project[];
  funders: Funder[];
  dataValues: DataValue[];
  stockItems: StockItem[];
  stockTransactions: StockTransaction[];
  stories: Story[];
}

class EpnDatabase {
  private state: DatabaseState = {
    members: [],
    orgUnits: [],
    facilityProfiles: {},
    dataElements: [],
    indicators: [],
    projects: [],
    funders: [],
    dataValues: [],
    stockItems: [],
    stockTransactions: [],
    stories: []
  };

  private initialized = false;

  constructor() {
    this.initializeData();
  }

  public initializeData(mode: 'epn' | 'demo' = 'demo') {
    if (this.initialized && mode !== 'demo') return;

    // 1. Root OrgUnit (EPN Network)
    const rootId = '00000000-0000-0000-0000-000000000001';
    const rootOrgUnit: OrgUnit = {
      id: rootId,
      uid: 'epnNetwork1',
      code: 'EPN_NETWORK',
      name: 'Ecumenical Pharmaceutical Network',
      short_name: 'EPN',
      kind: 'NETWORK',
      tree: 'ORG',
      path: 'epn',
      level: 1,
      is_synthetic: false
    };

    const orgUnits: OrgUnit[] = [rootOrgUnit];
    const members: Member[] = [];
    const facilityProfiles: Record<string, FacilityProfile> = {};

    // 2. Funders
    const funders: Funder[] = FUNDERS_SEED.map((f, idx) => ({
      id: `f0000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
      uid: generateUid(),
      name: f.name,
      funder_type: f.type,
      country: f.country,
      website: f.website
    }));

    // 3. Programmes & Projects
    const projects: Project[] = SEED_PROJECTS.map((p, idx) => ({
      id: `p0000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
      uid: generateUid(),
      code: p.code,
      name: p.name,
      description: p.description,
      programme_id: 'prog1',
      start_date: '2022-01-01',
      status: p.status as any,
      budget_total: p.budget,
      currency: 'USD',
      countries: p.countries,
      facilities_count: p.facilitiesCount
    }));

    // 4. Countries (Level 2 Org Units)
    const countryMap = new Map<string, OrgUnit>();
    SEED_COUNTRIES.forEach((c, idx) => {
      const countryId = `c0000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
      const ou: OrgUnit = {
        id: countryId,
        uid: generateUid(),
        code: `CTRY_${c.code}`,
        name: c.name,
        short_name: c.code,
        kind: 'COUNTRY',
        tree: 'ORG',
        parent_id: rootId,
        path: `epn.${c.code.toLowerCase()}`,
        level: 2,
        country: c.code,
        latitude: c.lat,
        longitude: c.lng,
        is_synthetic: false
      };
      orgUnits.push(ou);
      countryMap.set(c.code, ou);
    });

    // 5. Implementing Members (Level 3 Org Units)
    IMPLEMENTING_MEMBERS_SEED.forEach((m, idx) => {
      const memberId = `m0000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
      const countryOu = countryMap.get(m.country);
      
      const memberRecord: Member = {
        id: memberId,
        uid: generateUid(),
        name: m.name,
        abbreviation: m.abbreviation,
        member_type: m.type as any,
        is_organisation: true,
        home_country: m.country,
        subscription_status: 'ACTIVE',
        registration_date: '2020-01-01',
        is_synthetic: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      members.push(memberRecord);

      // OrgUnit for member chapter
      const memberOu: OrgUnit = {
        id: `mo000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
        uid: generateUid(),
        code: `MEM_${m.abbreviation.replace(/[^a-zA-Z0-9]/g, '_')}_${m.country}`,
        name: `${m.name} (${m.abbreviation})`,
        short_name: m.abbreviation,
        kind: 'MEMBER',
        tree: 'ORG',
        parent_id: countryOu ? countryOu.id : rootId,
        path: `epn.${m.country.toLowerCase()}.${m.abbreviation.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        level: 3,
        member_id: memberId,
        country: m.country,
        latitude: countryOu?.latitude,
        longitude: countryOu?.longitude,
        is_synthetic: false
      };
      orgUnits.push(memberOu);
    });

    // 6. Facilities (Level 4 Org Units)
    // Seed authentic/demo facilities across Kenya (CHAK, MEDS), Nigeria (CHAN), Tanzania (CSSC), Cameroon (CBCHS)
    const facilitySeed = [
      { name: 'Kilome Mission Hospital', member: 'CHAK', country: 'KE', level: 'HOSPITAL', beds: 120, pop: 85000, lat: -1.789, lng: 37.345, supported: true },
      { name: 'Kijabe Hospital & Satellite Dispensaries', member: 'CHAK', country: 'KE', level: 'REFERRAL_HOSPITAL', beds: 360, pop: 220000, lat: -0.932, lng: 36.589, supported: true },
      { name: 'Maua Methodist Hospital', member: 'CHAK', country: 'KE', level: 'HOSPITAL', beds: 240, pop: 140000, lat: 0.231, lng: 37.938, supported: true },
      { name: 'St. Mary’s Mission Hospital Mumias', member: 'CHAK', country: 'KE', level: 'HOSPITAL', beds: 150, pop: 95000, lat: 0.334, lng: 34.489, supported: true },
      { name: 'MEDS Central Distribution & Quality Control Lab', member: 'MEDS', country: 'KE', level: 'OTHER', beds: 0, pop: 5000000, lat: -1.332, lng: 36.892, supported: true },
      { name: 'St. Gerard Catholic Hospital Kaduna', member: 'CHAN', country: 'NG', level: 'HOSPITAL', beds: 210, pop: 180000, lat: 10.512, lng: 7.432, supported: true },
      { name: 'ECWA Hospital Egbe', member: 'CHAN', country: 'NG', level: 'HOSPITAL', beds: 180, pop: 110000, lat: 8.214, lng: 5.512, supported: true },
      { name: 'Bumbuli Lutheran Hospital', member: 'CSSC', country: 'TZ', level: 'HOSPITAL', beds: 130, pop: 75000, lat: -4.921, lng: 38.389, supported: true },
      { name: 'Mvumi Hospital Dodoma', member: 'CSSC', country: 'TZ', level: 'HOSPITAL', beds: 200, pop: 130000, lat: -6.412, lng: 35.892, supported: true },
      { name: 'Mbingo Baptist Hospital', member: 'CBCHS', country: 'CM', level: 'REFERRAL_HOSPITAL', beds: 310, pop: 250000, lat: 6.098, lng: 10.276, supported: true },
      { name: 'Banso Baptist Hospital', member: 'CBCHS', country: 'CM', level: 'HOSPITAL', beds: 240, pop: 160000, lat: 6.212, lng: 10.689, supported: true }
    ];

    facilitySeed.forEach((f, idx) => {
      const facId = `fac00000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`;
      const parentMemberOu = orgUnits.find(o => o.kind === 'MEMBER' && o.short_name === f.member);
      
      const facOu: OrgUnit = {
        id: facId,
        uid: generateUid(),
        code: `FAC_${f.member}_${String(idx + 1).padStart(3, '0')}`,
        name: f.name,
        short_name: f.name.split(' ')[0],
        kind: 'FACILITY',
        tree: 'ORG',
        parent_id: parentMemberOu?.id,
        path: parentMemberOu ? `${parentMemberOu.path}.fac_${idx + 1}` : `epn.fac_${idx + 1}`,
        level: 4,
        member_id: parentMemberOu?.member_id,
        country: f.country,
        latitude: f.lat,
        longitude: f.lng,
        is_synthetic: false
      };
      orgUnits.push(facOu);

      facilityProfiles[facId] = {
        org_unit_id: facId,
        facility_level: f.level as any,
        ownership: 'FAITH_BASED',
        bed_capacity: f.beds,
        catchment_population: f.pop,
        has_pharmacy: true,
        has_lab: true,
        services: ['OUTPATIENT', 'INPATIENT', 'PHARMACY', 'MATERNITY', 'LABORATORY', 'AMR_SURVEILLANCE'],
        epn_support_status: f.supported ? 'SUPPORTED' : 'UNSUPPORTED'
      };
    });

    // 7. Data Elements & Indicators
    const dataElements: DataElement[] = SEED_DATA_ELEMENTS.map(de => ({
      id: generateUid(),
      uid: de.uid,
      code: de.code,
      name: de.name,
      short_name: de.shortName,
      domain: 'AGGREGATE',
      value_type: de.valueType as any,
      aggregation_type: de.aggregationType as any,
      category_combo_id: 'default_combo',
      data_category: de.category as any,
      data_subcategory: de.subcategory,
      zero_is_significant: false
    }));

    const indicators: Indicator[] = SEED_INDICATORS.map(ind => ({
      id: generateUid(),
      uid: ind.uid,
      code: ind.code,
      name: ind.name,
      short_name: ind.shortName,
      indicator_type_id: 'ind_type_pct',
      factor: ind.factor,
      numerator: ind.numerator,
      numerator_description: ind.numeratorDescription,
      denominator: ind.denominator,
      denominator_description: ind.denominatorDescription,
      decimals: ind.decimals,
      annualized: false,
      baseline: ind.baseline,
      target: ind.target
    }));

    // 8. Monthly Data Values for Facilities over last 12 months
    const periods = generateMonthlyPeriods(12);
    const dataValues: DataValue[] = [];

    // Pre-populate realistic performance metrics per facility
    facilitySeed.forEach((_, fIdx) => {
      const facId = `fac00000-0000-0000-0000-${String(fIdx + 1).padStart(12, '0')}`;
      
      periods.forEach((p, pIdx) => {
        // Trend: availability improving over time from 65% to 88%
        const progress = pIdx / periods.length;
        const totalTracer = 50;
        const availTracer = Math.round(32 + progress * 12 + (Math.sin(pIdx + fIdx) * 2));
        const stockoutDays = Math.max(1, Math.round(18 - progress * 14 + (Math.cos(pIdx) * 2)));

        dataValues.push({
          data_element_id: 'deTracerAvail',
          period_type: 'MONTHLY',
          period_start: p.startDate,
          period_iso: p.iso,
          org_unit_id: facId,
          coc_id: 'default_coc',
          aoc_id: 'default_aoc',
          value: String(availTracer),
          value_num: availTracer,
          follow_up: false,
          stored_by: 'system_seed',
          source: 'FORM',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        dataValues.push({
          data_element_id: 'deTracerTotal',
          period_type: 'MONTHLY',
          period_start: p.startDate,
          period_iso: p.iso,
          org_unit_id: facId,
          coc_id: 'default_coc',
          aoc_id: 'default_aoc',
          value: String(totalTracer),
          value_num: totalTracer,
          follow_up: false,
          stored_by: 'system_seed',
          source: 'FORM',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        dataValues.push({
          data_element_id: 'deStockoutDays',
          period_type: 'MONTHLY',
          period_start: p.startDate,
          period_iso: p.iso,
          org_unit_id: facId,
          coc_id: 'default_coc',
          aoc_id: 'default_aoc',
          value: String(stockoutDays),
          value_num: stockoutDays,
          follow_up: false,
          stored_by: 'system_seed',
          source: 'FORM',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        dataValues.push({
          data_element_id: 'deFacilityDays',
          period_type: 'MONTHLY',
          period_start: p.startDate,
          period_iso: p.iso,
          org_unit_id: facId,
          coc_id: 'default_coc',
          aoc_id: 'default_aoc',
          value: '30',
          value_num: 30,
          follow_up: false,
          stored_by: 'system_seed',
          source: 'FORM',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        dataValues.push({
          data_element_id: 'deDtcFunctional',
          period_type: 'MONTHLY',
          period_start: p.startDate,
          period_iso: p.iso,
          org_unit_id: facId,
          coc_id: 'default_coc',
          aoc_id: 'default_aoc',
          value: progress > 0.3 ? '1' : '0',
          value_num: progress > 0.3 ? 1 : 0,
          follow_up: false,
          stored_by: 'system_seed',
          source: 'FORM',
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });
    });

    // 9. Medstock Items & Transactions
    const stockItems: StockItem[] = [
      {
        id: 'item1',
        uid: generateUid(),
        code: 'MED_AMOX_500',
        name: 'Amoxicillin 500mg Capsules',
        generic_name: 'Amoxicillin',
        atc_code: 'J01CA04',
        dosage_form: 'Capsule',
        strength: '500mg',
        pack_size: 100,
        unit: 'Pack',
        category: 'MEDICINE',
        is_tracer: true,
        on_eml: true,
        min_months_stock: 1.5,
        max_months_stock: 3.5,
        active: true
      },
      {
        id: 'item2',
        uid: generateUid(),
        code: 'MED_AL_20_120',
        name: 'Artemether + Lumefantrine 20/120mg Tablets',
        generic_name: 'Artemether + Lumefantrine',
        atc_code: 'P01BF01',
        dosage_form: 'Tablet',
        strength: '20mg/120mg',
        pack_size: 24,
        unit: 'Blister',
        category: 'MEDICINE',
        is_tracer: true,
        on_eml: true,
        min_months_stock: 2.0,
        max_months_stock: 4.0,
        active: true
      },
      {
        id: 'item3',
        uid: generateUid(),
        code: 'MED_OXYTOCIN_10',
        name: 'Oxytocin 10 IU/ml Injection',
        generic_name: 'Oxytocin',
        atc_code: 'H01BB02',
        dosage_form: 'Ampoule',
        strength: '10 IU/ml',
        pack_size: 10,
        unit: 'Ampoule',
        category: 'MEDICINE',
        is_tracer: true,
        on_eml: true,
        min_months_stock: 2.0,
        max_months_stock: 4.0,
        active: true
      },
      {
        id: 'item4',
        uid: generateUid(),
        code: 'MED_CEFTRIAXONE_1G',
        name: 'Ceftriaxone 1g Powder for Injection',
        generic_name: 'Ceftriaxone',
        atc_code: 'J01DD04',
        dosage_form: 'Vial',
        strength: '1g',
        pack_size: 1,
        unit: 'Vial',
        category: 'MEDICINE',
        is_tracer: true,
        on_eml: true,
        min_months_stock: 1.0,
        max_months_stock: 3.0,
        active: true
      }
    ];

    const stockTransactions: StockTransaction[] = [
      {
        id: 'st1',
        org_unit_id: 'fac00000-0000-0000-0000-000000000001',
        location_id: 'loc_main_pharmacy',
        item_id: 'item1',
        batch_no: 'AMX-2026-08',
        expiry_date: '2028-04-30',
        kind: 'RECEIPT',
        qty: 500,
        unit_cost: 4.5,
        occurred_at: '2026-10-02T08:30:00Z',
        recorded_by: 'pharm_clerk',
        reason: 'Monthly requisition fulfilled by MEDS'
      },
      {
        id: 'st2',
        org_unit_id: 'fac00000-0000-0000-0000-000000000001',
        location_id: 'loc_main_pharmacy',
        item_id: 'item1',
        batch_no: 'AMX-2026-08',
        kind: 'DISPENSE',
        qty: 85,
        unit_cost: 4.5,
        occurred_at: '2026-10-15T16:00:00Z',
        recorded_by: 'pharm_clerk',
        reason: 'Outpatient pediatric clinic dispensation'
      }
    ];

    // 10. Stories
    const stories: Story[] = SEED_STORIES.map(s => ({
      id: generateUid(),
      uid: generateUid(),
      slug: s.slug,
      title: s.title,
      summary: s.summary,
      body: s.body,
      status: s.status as any,
      consent_recorded: s.consentRecorded,
      published_at: '2026-09-15T10:00:00Z'
    }));

    this.state = {
      members,
      orgUnits,
      facilityProfiles,
      dataElements,
      indicators,
      projects,
      funders,
      dataValues,
      stockItems,
      stockTransactions,
      stories
    };

    this.initialized = true;
  }

  // Repository Getters
  public getMembers(): Member[] {
    return this.state.members;
  }

  public getMemberById(id: string): Member | undefined {
    return this.state.members.find(m => m.id === id || m.uid === id || m.abbreviation === id);
  }

  public getOrgUnits(level?: number, parentId?: string): OrgUnit[] {
    let result = this.state.orgUnits;
    if (level !== undefined) {
      result = result.filter(o => o.level === level);
    }
    if (parentId !== undefined) {
      result = result.filter(o => o.parent_id === parentId);
    }
    return result;
  }

  public getOrgUnitById(id: string): OrgUnit | undefined {
    return this.state.orgUnits.find(o => o.id === id || o.uid === id || o.code === id);
  }

  public getFacilities(): Array<OrgUnit & { profile?: FacilityProfile }> {
    return this.state.orgUnits
      .filter(o => o.kind === 'FACILITY')
      .map(o => ({
        ...o,
        profile: this.state.facilityProfiles[o.id]
      }));
  }

  public getFacilityById(id: string): (OrgUnit & { profile?: FacilityProfile; stockSummary?: any }) | undefined {
    const fac = this.state.orgUnits.find(o => o.id === id || o.uid === id || o.code === id);
    if (!fac) return undefined;
    return {
      ...fac,
      profile: this.state.facilityProfiles[fac.id],
      stockSummary: {
        totalItemsTracked: this.state.stockItems.length,
        tracerAvailabilityPct: 88.5,
        stockoutDaysLastMonth: 2,
        activeRevolvingFund: true
      }
    };
  }

  public getProjects(): Project[] {
    return this.state.projects;
  }

  public getFunders(): Funder[] {
    return this.state.funders;
  }

  public getIndicators(): Indicator[] {
    return this.state.indicators;
  }

  public getDataElements(): DataElement[] {
    return this.state.dataElements;
  }

  public getDataValues(ouId?: string, periodIso?: string): DataValue[] {
    return this.state.dataValues.filter(dv => {
      if (ouId && dv.org_unit_id !== ouId) return false;
      if (periodIso && dv.period_iso !== periodIso) return false;
      return true;
    });
  }

  public recordDataValue(entry: Partial<DataValue>): DataValue {
    const newVal: DataValue = {
      data_element_id: entry.data_element_id!,
      period_type: entry.period_type || 'MONTHLY',
      period_start: entry.period_start || new Date().toISOString().substring(0, 10),
      period_iso: entry.period_iso!,
      org_unit_id: entry.org_unit_id!,
      coc_id: entry.coc_id || 'default_coc',
      aoc_id: entry.aoc_id || 'default_aoc',
      value: String(entry.value),
      value_num: parseFloat(String(entry.value)) || undefined,
      comment: entry.comment,
      follow_up: !!entry.follow_up,
      stored_by: entry.stored_by || 'web_user',
      source: 'FORM',
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const existingIdx = this.state.dataValues.findIndex(
      dv => dv.data_element_id === newVal.data_element_id &&
            dv.period_iso === newVal.period_iso &&
            dv.org_unit_id === newVal.org_unit_id
    );

    if (existingIdx >= 0) {
      newVal.version = this.state.dataValues[existingIdx].version + 1;
      this.state.dataValues[existingIdx] = newVal;
    } else {
      this.state.dataValues.push(newVal);
    }
    return newVal;
  }

  public getStockItems(): StockItem[] {
    return this.state.stockItems;
  }

  public getStockTransactions(facilityId?: string): StockTransaction[] {
    if (!facilityId) return this.state.stockTransactions;
    return this.state.stockTransactions.filter(t => t.org_unit_id === facilityId);
  }

  public recordStockTransaction(txn: StockTransaction): StockTransaction {
    this.state.stockTransactions.unshift(txn);
    return txn;
  }

  public getStories(): Story[] {
    return this.state.stories;
  }

  public getPublicSummary() {
    return {
      network: NETWORK_STATISTICS,
      healthPriorities: HEALTH_PRIORITIES,
      programmes: STRATEGIC_PROGRAMMES_2021_2025,
      totalImplementingMembers: IMPLEMENTING_MEMBERS_SEED.length,
      headlineMetrics: [
        {
          key: 'tracer_availability',
          name: 'Tracer Medicine Availability',
          value: '84.2%',
          trend: '+12.4%',
          positive: true,
          benchmark: 'Target: 85.0%'
        },
        {
          key: 'stockout_reduction',
          name: 'Stock-out Rate',
          value: '6.8%',
          trend: '-21.2%',
          positive: true,
          benchmark: 'Down from 28.0%'
        },
        {
          key: 'dtc_functional',
          name: 'Functional Pharmacy & Therapeutics Committees',
          value: '78.5%',
          trend: '+36.5%',
          positive: true,
          benchmark: '400+ Network Committees'
        },
        {
          key: 'revenue_tracking',
          name: 'Facilities with Active Revolving Funds (DRF)',
          value: '73.0%',
          trend: '+6.0%',
          positive: true,
          benchmark: '250 Active Accounts'
        }
      ]
    };
  }

  public getAnalytics(dx: string[], pe: string[], ou: string[]) {
    // Formats result conforming to DHIS2 analytics response schema
    const rows: string[][] = [];
    const metaItems: Record<string, { name: string }> = {};

    dx.forEach(dataItem => {
      const ind = this.state.indicators.find(i => i.uid === dataItem || i.code === dataItem);
      const de = this.state.dataElements.find(d => d.uid === dataItem || d.code === dataItem);
      metaItems[dataItem] = { name: ind?.name || de?.name || dataItem };

      pe.forEach(period => {
        metaItems[period] = { name: parsePeriod(period).nameEn };

        ou.forEach(orgUnit => {
          const org = this.getOrgUnitById(orgUnit);
          metaItems[orgUnit] = { name: org?.name || orgUnit };

          let calculatedValue = '78.4';
          if (ind) {
            // Collect matching values
            const valuesForOu = this.state.dataValues.filter(v => v.period_iso === period);
            const contextValues: Record<string, number | null> = {};
            valuesForOu.forEach(v => {
              contextValues[v.data_element_id] = v.value_num ?? null;
            });
            const evalResult = evaluateExpression(ind.numerator, { dataValues: contextValues });
            if (evalResult !== null) {
              calculatedValue = evalResult.toFixed(ind.decimals);
            }
          }
          rows.push([dataItem, period, orgUnit, calculatedValue]);
        });
      });
    });

    return {
      headers: [
        { name: 'dx', column: 'Data', valueType: 'TEXT' },
        { name: 'pe', column: 'Period', valueType: 'TEXT' },
        { name: 'ou', column: 'Organisation unit', valueType: 'TEXT' },
        { name: 'value', column: 'Value', valueType: 'NUMBER' }
      ],
      metaData: {
        items: metaItems,
        dimensions: { dx, pe, ou }
      },
      rows,
      width: 4,
      height: rows.length
    };
  }
}

export * from './seed-data.js';
export * from './facility-importer.js';
export * from './dhis2-connector.js';
export const db = new EpnDatabase();
