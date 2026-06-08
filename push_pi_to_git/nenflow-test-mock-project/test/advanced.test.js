/**
 * advanced.test.js — Tests for advanced math operations.
 * Executor #2 (deepseek-v4-flash), NenFlow v3 run RUN_TEST_DEEPSEEK.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { power, squareRoot, factorial } = require('../src/advanced');

describe('advanced', () => {
  it('power', () => {
    assert.strictEqual(power(2, 3), 8);
    assert.strictEqual(power(5, 0), 1);
    assert.strictEqual(power(0, 0), 1);
    assert.strictEqual(power(3, 2), 9);
  });

  it('squareRoot', () => {
    assert.strictEqual(squareRoot(16), 4);
    assert.strictEqual(squareRoot(2), Math.sqrt(2));
    assert.strictEqual(squareRoot(0), 0);
  });

  it('squareRoot negative throws', () => {
    assert.throws(() => squareRoot(-1), /negative/);
  });

  it('factorial', () => {
    assert.strictEqual(factorial(0), 1);
    assert.strictEqual(factorial(1), 1);
    assert.strictEqual(factorial(5), 120);
    assert.strictEqual(factorial(10), 3628800);
  });

  it('factorial negative throws', () => {
    assert.throws(() => factorial(-1), /non-negative/);
  });

  it('factorial non-integer throws', () => {
    assert.throws(() => factorial(2.5), /non-negative/);
  });
});
