import { DataValue } from '@epn/domain';
import { db } from './index.js';

export interface Dhis2ConnectionConfig {
  id: string;
  name: string;
  baseUrl: string;
  country: string;
  authType: 'PAT' | 'BASIC';
  tokenEncrypted: string;
  isActive: boolean;
  lastSyncAt?: string;
}

export interface Dhis2Mapping {
  connectionId: string;
  remoteOrgUnitUid: string;
  localFacilityId: string;
  remoteDataElementUid: string;
  localDataElementCode: string;
}

export interface Dhis2PullSummary {
  connectionId: string;
  pulledAt: string;
  recordsReceived: number;
  recordsMapped: number;
  recordsIgnored: number;
  errors: string[];
}

/**
 * Transforms external DHIS2 data values to EPN OnePharm format
 */
export function transformDhis2DataValueSet(
  remotePayload: { dataValues: Array<{ dataElement: string; period: string; orgUnit: string; value: string }> },
  mappings: Dhis2Mapping[]
): { values: Partial<DataValue>[]; unmappedCount: number } {
  const result: Partial<DataValue>[] = [];
  let unmappedCount = 0;

  remotePayload.dataValues.forEach(dv => {
    const mapping = mappings.find(
      m => m.remoteOrgUnitUid === dv.orgUnit && m.remoteDataElementUid === dv.dataElement
    );

    if (mapping) {
      result.push({
        data_element_id: mapping.localDataElementCode,
        period_iso: dv.period,
        org_unit_id: mapping.localFacilityId,
        value: dv.value,
        source: 'DHIS2'
      });
    } else {
      unmappedCount++;
    }
  });

  return { values: result, unmappedCount };
}

/**
 * Formats internal data values into DHIS2-compatible dataValueSet JSON (Section 10.2 Outbound)
 */
export function exportToDhis2DataValueSet(dataValues: DataValue[]) {
  return {
    dataSet: 'EPN_PHARMA_SYSTEMS',
    completeDate: new Date().toISOString(),
    period: dataValues[0]?.period_iso || '202610',
    orgUnit: dataValues[0]?.org_unit_id || 'epnNetwork1',
    dataValues: dataValues.map(dv => ({
      dataElement: dv.data_element_id,
      period: dv.period_iso,
      orgUnit: dv.org_unit_id,
      categoryOptionCombo: dv.coc_id,
      attributeOptionCombo: dv.aoc_id,
      value: dv.value,
      storedBy: dv.stored_by,
      created: dv.created_at,
      lastUpdated: dv.updated_at,
      comment: dv.comment,
      followUp: dv.follow_up
    }))
  };
}
