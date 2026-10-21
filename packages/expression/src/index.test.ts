import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ExpressionParser, evaluateExpression } from './index.js';

describe('DHIS2 Expression Parser & Evaluator', () => {
  it('parses and evaluates basic arithmetic with correct precedence', () => {
    const expr = '10 + 5 * 2 - 4 / 2'; // 10 + 10 - 2 = 18
    const result = evaluateExpression(expr, { dataValues: {} });
    assert.strictEqual(result, 18);
  });

  it('correctly substitutes data elements and category option combos', () => {
    const expr = '(#{deAmoxAvailable} / #{deTracerCount}) * 100';
    const ctx = {
      dataValues: {
        deAmoxAvailable: 45,
        deTracerCount: 50
      }
    };
    const result = evaluateExpression(expr, ctx);
    assert.strictEqual(result, 90);
  });

  it('safely returns null on division by zero without throwing or returning Infinity', () => {
    const expr = '#{deCount} / 0';
    const ctx = { dataValues: { deCount: 100 } };
    const result = evaluateExpression(expr, ctx);
    assert.strictEqual(result, null);
  });

  it('evaluates comparison and if() logic', () => {
    const expr = 'if(#{stockDays} < 7, 1, 0)';
    assert.strictEqual(evaluateExpression(expr, { dataValues: { stockDays: 3 } }), 1);
    assert.strictEqual(evaluateExpression(expr, { dataValues: { stockDays: 14 } }), 0);
  });

  it('evaluates coalesce and math functions', () => {
    const expr = 'coalesce(#{missingVal}, round(sqrt(64)))';
    const result = evaluateExpression(expr, { dataValues: {} });
    assert.strictEqual(result, 8);
  });

  it('detects and prevents cycles in nested indicator definitions', () => {
    const ctx = {
      dataValues: {},
      nestedIndicators: {
        indA: 'I{indB} + 5',
        indB: 'I{indA} * 2'
      }
    };
    assert.throws(() => {
      evaluateExpression('I{indA}', ctx);
    }, /Cycle detected in indicator reference/);
  });
});
