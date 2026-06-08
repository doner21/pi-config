/**
 * calculator.test.js — Tests for basic arithmetic operations.
 * Executor #1 (deepseek-v4-flash), NenFlow v3 run RUN_TEST_DEEPSEEK.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { add, subtract, multiply, divide } = require('../src/calculator');

describe('calculator', () => {
  it('add', () => {
    assert.strictEqual(add(2, 3), 5);
  });

  it('subtract', () => {
    assert.strictEqual(subtract(5, 2), 3);
  });

  it('multiply', () => {
    assert.strictEqual(multiply(4, 3), 12);
  });

  it('divide', () => {
    assert.strictEqual(divide(10, 2), 5);
  });

  it('divide by zero throws', () => {
    assert.throws(() => divide(1, 0), /Division by zero/);
  });
});
