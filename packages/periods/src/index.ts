import { PeriodType } from '@epn/domain';

export interface PeriodInfo {
  iso: string;
  type: PeriodType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  nameEn: string;
  nameFr: string;
}

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Format a Date to YYYY-MM-DD
 */
export function formatDate(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO period string into structured PeriodInfo
 */
export function parsePeriod(iso: string): PeriodInfo {
  // Monthly: e.g. 202610
  if (/^\d{6}$/.test(iso)) {
    const year = parseInt(iso.substring(0, 4), 10);
    const month = parseInt(iso.substring(4, 6), 10); // 1-indexed
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));
    return {
      iso,
      type: 'MONTHLY',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      nameEn: `${MONTH_NAMES_EN[month - 1]} ${year}`,
      nameFr: `${MONTH_NAMES_FR[month - 1]} ${year}`
    };
  }

  // Quarterly: e.g. 2026Q3
  const qMatch = iso.match(/^(\d{4})Q([1-4])$/);
  if (qMatch) {
    const year = parseInt(qMatch[1], 10);
    const quarter = parseInt(qMatch[2], 10);
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(Date.UTC(year, startMonth, 1));
    const endDate = new Date(Date.UTC(year, startMonth + 3, 0));
    return {
      iso,
      type: 'QUARTERLY',
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      nameEn: `Q${quarter} ${year}`,
      nameFr: `T${quarter} ${year}`
    };
  }

  // Yearly: e.g. 2026
  if (/^\d{4}$/.test(iso)) {
    const year = parseInt(iso, 10);
    return {
      iso,
      type: 'YEARLY',
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      nameEn: `${year}`,
      nameFr: `${year}`
    };
  }

  // Fallback default
  return {
    iso,
    type: 'MONTHLY',
    startDate: `${iso.substring(0, 4) || '2026'}-01-01`,
    endDate: `${iso.substring(0, 4) || '2026'}-12-31`,
    nameEn: iso,
    nameFr: iso
  };
}

/**
 * Generate a sequence of monthly periods between two dates or for the last N months
 */
export function generateMonthlyPeriods(count: number = 12, referenceDate: Date = new Date()): PeriodInfo[] {
  const periods: PeriodInfo[] = [];
  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth(); // 0-indexed

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(refYear, refMonth - i, 1));
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const iso = `${y}${String(m).padStart(2, '0')}`;
    periods.push(parsePeriod(iso));
  }
  return periods;
}

/**
 * Generate quarterly periods
 */
export function generateQuarterlyPeriods(count: number = 8, referenceDate: Date = new Date()): PeriodInfo[] {
  const periods: PeriodInfo[] = [];
  const refYear = referenceDate.getUTCFullYear();
  const refQuarter = Math.floor(referenceDate.getUTCMonth() / 3) + 1;

  for (let i = count - 1; i >= 0; i--) {
    let q = refQuarter - i;
    let y = refYear;
    while (q <= 0) {
      q += 4;
      y -= 1;
    }
    const iso = `${y}Q${q}`;
    periods.push(parsePeriod(iso));
  }
  return periods;
}

/**
 * Relative period resolver for analytics queries
 */
export function resolveRelativePeriod(code: string, refDate: Date = new Date()): string[] {
  switch (code) {
    case 'THIS_MONTH': {
      const y = refDate.getUTCFullYear();
      const m = String(refDate.getUTCMonth() + 1).padStart(2, '0');
      return [`${y}${m}`];
    }
    case 'LAST_MONTH': {
      const d = new Date(Date.UTC(refDate.getUTCFullYear(), refDate.getUTCMonth() - 1, 1));
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      return [`${y}${m}`];
    }
    case 'LAST_3_MONTHS': {
      return generateMonthlyPeriods(3, refDate).map(p => p.iso);
    }
    case 'LAST_6_MONTHS': {
      return generateMonthlyPeriods(6, refDate).map(p => p.iso);
    }
    case 'LAST_12_MONTHS': {
      return generateMonthlyPeriods(12, refDate).map(p => p.iso);
    }
    case 'THIS_QUARTER': {
      const y = refDate.getUTCFullYear();
      const q = Math.floor(refDate.getUTCMonth() / 3) + 1;
      return [`${y}Q${q}`];
    }
    case 'LAST_4_QUARTERS': {
      return generateQuarterlyPeriods(4, refDate).map(p => p.iso);
    }
    case 'THIS_YEAR': {
      return [`${refDate.getUTCFullYear()}`];
    }
    case 'LAST_YEAR': {
      return [`${refDate.getUTCFullYear() - 1}`];
    }
    case 'LAST_5_YEARS': {
      const y = refDate.getUTCFullYear();
      return [y - 4, y - 3, y - 2, y - 1, y].map(String);
    }
    default:
      return [code];
  }
}
