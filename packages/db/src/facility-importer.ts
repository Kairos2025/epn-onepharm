import { generateUid, FacilityLevel, EPNSupportStatus } from '@epn/domain';
import { db } from './index.js';

export interface RawFacilityRow {
  name: string;
  code?: string;
  level?: string;
  ownership?: string;
  beds?: number | string;
  catchmentPopulation?: number | string;
  memberAbbreviation?: string;
  country?: string;
  latitude?: number | string;
  longitude?: number | string;
}

export interface ImportSummary {
  status: 'SUCCESS' | 'PARTIAL' | 'ERROR';
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  duplicateCount: number;
  duplicatesReviewQueue: Array<{
    incoming: RawFacilityRow;
    existingName: string;
    existingId: string;
    matchReason: string;
  }>;
  errors: string[];
}

/**
 * Normalizes facility level to controlled vocabulary
 */
function normalizeFacilityLevel(levelStr?: string): FacilityLevel {
  const l = (levelStr || '').toUpperCase();
  if (l.includes('REFERRAL') || l.includes('LEVEL 5') || l.includes('LEVEL 6')) return 'REFERRAL_HOSPITAL';
  if (l.includes('HOSPITAL') || l.includes('LEVEL 4')) return 'HOSPITAL';
  if (l.includes('CENTRE') || l.includes('CENTER') || l.includes('LEVEL 3')) return 'HEALTH_CENTRE';
  if (l.includes('DISPENSARY') || l.includes('LEVEL 2')) return 'DISPENSARY';
  return 'OTHER';
}

/**
 * Calculates simple Levenshtein distance similarity (0 to 1) for duplicate detection
 */
function stringSimilarity(s1: string, s2: string): number {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  if (a === b) return 1.0;
  if (!a || !b) return 0.0;
  
  // Trigram or token intersection
  const tokensA = new Set(a.split(/\s+/));
  const tokensB = new Set(b.split(/\s+/));
  let match = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) match++;
  });
  return (2 * match) / (tokensA.size + tokensB.size);
}

/**
 * Facility Master List Importer (Section 8.10)
 */
export function importFacilityMasterList(rows: RawFacilityRow[], dryRun = false): ImportSummary {
  const existingFacilities = db.getFacilities();
  const summary: ImportSummary = {
    status: 'SUCCESS',
    totalRows: rows.length,
    importedCount: 0,
    updatedCount: 0,
    duplicateCount: 0,
    duplicatesReviewQueue: [],
    errors: []
  };

  rows.forEach((row, idx) => {
    if (!row.name || row.name.trim().length < 2) {
      summary.errors.push(`Row ${idx + 1}: Missing or invalid facility name.`);
      return;
    }

    const cleanName = row.name.trim();
    const cleanCode = row.code?.trim();

    // Duplicate detection: check code or name similarity
    let matchedExisting = existingFacilities.find(
      ef => cleanCode && (ef.code === cleanCode || ef.profile?.national_facility_code === cleanCode)
    );

    if (!matchedExisting) {
      matchedExisting = existingFacilities.find(ef => {
        const sim = stringSimilarity(ef.name, cleanName);
        return sim >= 0.8;
      });
    }

    if (matchedExisting) {
      summary.duplicateCount++;
      summary.duplicatesReviewQueue.push({
        incoming: row,
        existingName: matchedExisting.name,
        existingId: matchedExisting.id,
        matchReason: cleanCode && matchedExisting.code === cleanCode ? 'Exact Code Match' : 'High Name Similarity'
      });
      return;
    }

    // New valid facility row
    summary.importedCount++;
  });

  return summary;
}
