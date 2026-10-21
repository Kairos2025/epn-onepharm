import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parsePeriod, resolveRelativePeriod } from './index.js';

describe('Period calculations and formatting', () => {
  it('parses monthly periods accurately', () => {
    const p = parsePeriod('202610');
    assert.strictEqual(p.iso, '202610');
    assert.strictEqual(p.type, 'MONTHLY');
    assert.strictEqual(p.startDate, '2026-10-01');
    assert.strictEqual(p.endDate, '2026-10-31');
    assert.strictEqual(p.nameEn, 'October 2026');
    assert.strictEqual(p.nameFr, 'Octobre 2026');
  });

  it('parses quarterly periods accurately', () => {
    const q = parsePeriod('2026Q3');
    assert.strictEqual(q.iso, '2026Q3');
    assert.strictEqual(q.type, 'QUARTERLY');
    assert.strictEqual(q.startDate, '2026-07-01');
    assert.strictEqual(q.endDate, '2026-09-30');
    assert.strictEqual(q.nameEn, 'Q3 2026');
    assert.strictEqual(q.nameFr, 'T3 2026');
  });

  it('resolves relative periods', () => {
    const ref = new Date('2026-10-15T00:00:00Z');
    const thisMonth = resolveRelativePeriod('THIS_MONTH', ref);
    assert.deepStrictEqual(thisMonth, ['202610']);

    const last3 = resolveRelativePeriod('LAST_3_MONTHS', ref);
    assert.strictEqual(last3.length, 3);
    assert.strictEqual(last3[2], '202610');
    assert.strictEqual(last3[1], '202609');
    assert.strictEqual(last3[0], '202608');
  });
});
