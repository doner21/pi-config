/**
 * advanced.js — Advanced math operations.
 * Executor #2 (deepseek-v4-flash), NenFlow v3 run RUN_TEST_DEEPSEEK.
 * Uses multiply from calculator.js for factorial computation.
 */

const { multiply } = require('./calculator');

/**
 * Returns base raised to the power of exp.
 * @param {number} base
 * @param {number} exp
 * @returns {number}
 */
function power(base, exp) {
  return base ** exp;
}

/**
 * Returns the square root of n.
 * @param {number} n
 * @returns {number}
 * @throws {Error} if n is negative
 */
function squareRoot(n) {
  if (n < 0) {
    throw new Error('Cannot take square root of negative number');
  }
  return Math.sqrt(n);
}

/**
 * Returns the factorial of a non-negative integer n.
 * Uses calculator.multiply for multiplication.
 * @param {number} n
 * @returns {number}
 * @throws {Error} if n is negative or not an integer
 */
function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Factorial requires non-negative integer');
  }
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result = multiply(result, i);
  }
  return result;
}

module.exports = { power, squareRoot, factorial };
