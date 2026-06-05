---
artifact_type: PLAN
role: PLANNER
run_id: RUN_TEST_DEEPSEEK
model_used: deepseek-v4-pro
context_saturation_estimate: "~5%"
context_handoff_threshold_percent: 65
threshold_source: run_config
health: HEALTHY
---

# ATT_1_PLAN — NenFlow v3 Planner Plan

## Task Statement

Build a Node.js calculator module (`src/calculator.js`) exporting `add`, `subtract`, `multiply`, `divide` with tests in `test/calculator.test.js`, and extend with `src/advanced.js` exporting `power`, `squareRoot`, `factorial` with tests in `test/advanced.test.js`, such that `npm test` runs all tests and passes. Both modules must coexist in the same project without modifying each other's files.

## Invariants

- The `package.json` test script must remain exactly `"node --test test/*.test.js"`.
- No existing files in the mock project (`package.json`, `README.md`) may be deleted.
- The directory structure (`src/`, `test/`) must be preserved.
- Executor-1 must NOT modify `src/advanced.js` or `test/advanced.test.js` (these don't exist yet, but Executor-1 must not create them).
- Executor-2 must NOT modify `src/calculator.js` or `test/calculator.test.js` (already created by Executor-1).
- Both executors must produce Execution Reports and Verifier Briefs.
- All functions must use `module.exports` (CommonJS) for Node.js compatibility without ESM flags.

## Success Criteria

1. **SC1:** `src/calculator.js` exists and exports `add`, `subtract`, `multiply`, `divide` as callable functions.
2. **SC2:** `test/calculator.test.js` exists and contains passing test cases for all four operations using `node:test`.
3. **SC3:** Running `npm test` in the project root executes all tests and reports zero failures.
4. **SC4:** `src/advanced.js` exists and exports `power`, `squareRoot`, `factorial` as callable functions.
5. **SC5:** Both executors have produced their Execution Reports (`ATT_2_EXECUTION.md`, `ATT_3_EXECUTION.md`) and Verifier Briefs (`ATT_2_VERIFIER_BRIEF.md`, `ATT_3_VERIFIER_BRIEF.md`).
6. **SC6:** The Verifier independently confirms all criteria by reading source files, reading test files, and running `npm test` themselves.

## Implementation Steps

### Executor-1: Calculator Module (DeepSeek V4 Flash)

1. Read the INTAKE at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_0_INTAKE.md`.
2. Read this PLAN at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_1_PLAN.md`.
3. Read the RUN_CONFIG at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/RUN_CONFIG.json`.
4. Write `src/calculator.js` with module.exports containing:
   - `add(a, b)` — returns `a + b`
   - `subtract(a, b)` — returns `a - b`
   - `multiply(a, b)` — returns `a * b`
   - `divide(a, b)` — returns `a / b`; throw `Error("Division by zero")` if `b === 0`
5. Write `test/calculator.test.js` using `node:test` and `node:assert/strict`:
   ```js
   const { describe, it } = require('node:test');
   const assert = require('node:assert/strict');
   const { add, subtract, multiply, divide } = require('../src/calculator');

   describe('calculator', () => {
     it('add', () => { assert.strictEqual(add(2, 3), 5); });
     it('subtract', () => { assert.strictEqual(subtract(5, 2), 3); });
     it('multiply', () => { assert.strictEqual(multiply(4, 3), 12); });
     it('divide', () => { assert.strictEqual(divide(10, 2), 5); });
     it('divide by zero throws', () => { assert.throws(() => divide(1, 0), /Division by zero/); });
   });
   ```
6. Run `npm test` in `~/push_pi_to_git/nenflow-test-mock-project/` and capture the exact terminal output.
7. Write `ATT_2_EXECUTION.md` at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_2_EXECUTION.md` with:
   - Frontmatter: `artifact_type: EXECUTION_REPORT`, `role: EXECUTOR`, `run_id: RUN_TEST_DEEPSEEK`, `model_used: deepseek-v4-flash`
   - Body: what was implemented, any issues, the captured `npm test` output.
8. Write `ATT_2_VERIFIER_BRIEF.md` at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_2_VERIFIER_BRIEF.md` with:
   - Frontmatter: `artifact_type: VERIFIER_BRIEF`, `role: EXECUTOR`, `run_id: RUN_TEST_DEEPSEEK`, `model_used: deepseek-v4-flash`
   - Body: copy-pasteable commands for the Verifier to run (e.g., `cat src/calculator.js`, `cat test/calculator.test.js`, `node -e "const c = require('./src/calculator'); console.log(typeof c.add)"`, `npm test`).
9. Write `LATEST_EXECUTION.md` and `LATEST_VERIFIER_BRIEF.md` copies.

### Executor-2: Advanced Module (DeepSeek V4 Flash)

1. Read the INTAKE at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_0_INTAKE.md`.
2. Read this PLAN at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_1_PLAN.md`.
3. Read the RUN_CONFIG at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/RUN_CONFIG.json`.
4. Confirm `src/calculator.js` and `test/calculator.test.js` already exist — do NOT modify them.
5. Write `src/advanced.js` with module.exports containing:
   - `power(base, exp)` — returns `base ** exp` (edge case: `power(0, 0)` returns `1` per JS spec)
   - `squareRoot(n)` — returns `Math.sqrt(n)`; throw `Error("Cannot take square root of negative number")` if `n < 0`
   - `factorial(n)` — returns factorial of non-negative integer `n`; throw `Error("Factorial requires non-negative integer")` if `n < 0` or not an integer; use `calculator.multiply` from `./calculator.js` where useful (e.g., in recursive/iterative factorial)
6. Write `test/advanced.test.js` using `node:test` and `node:assert/strict`:
   ```js
   const { describe, it } = require('node:test');
   const assert = require('node:assert/strict');
   const { power, squareRoot, factorial } = require('../src/advanced');

   describe('advanced', () => {
     it('power', () => {
       assert.strictEqual(power(2, 3), 8);
       assert.strictEqual(power(5, 0), 1);
       assert.strictEqual(power(0, 0), 1);
     });
     it('squareRoot', () => {
       assert.strictEqual(squareRoot(16), 4);
       assert.strictEqual(squareRoot(2), Math.sqrt(2));
     });
     it('squareRoot negative throws', () => {
       assert.throws(() => squareRoot(-1), /negative/);
     });
     it('factorial', () => {
       assert.strictEqual(factorial(0), 1);
       assert.strictEqual(factorial(5), 120);
     });
     it('factorial negative throws', () => {
       assert.throws(() => factorial(-1), /non-negative/);
     });
   });
   ```
7. Run `npm test` in `~/push_pi_to_git/nenflow-test-mock-project/` and capture the exact terminal output (must include both calculator and advanced tests passing).
8. Write `ATT_3_EXECUTION.md` at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_3_EXECUTION.md` with:
   - Frontmatter: `artifact_type: EXECUTION_REPORT`, `role: EXECUTOR`, `run_id: RUN_TEST_DEEPSEEK`, `model_used: deepseek-v4-flash`
   - Body: what was implemented, any issues, the captured `npm test` output.
9. Write `ATT_3_VERIFIER_BRIEF.md` at `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/ATT_3_VERIFIER_BRIEF.md` with:
   - Frontmatter: `artifact_type: VERIFIER_BRIEF`, `role: EXECUTOR`, `run_id: RUN_TEST_DEEPSEEK`, `model_used: deepseek-v4-flash`
   - Body: copy-pasteable commands for the Verifier to verify the advanced module.
10. Overwrite `LATEST_EXECUTION.md` and `LATEST_VERIFIER_BRIEF.md` to point to the ATT_3 versions.

## Handoff Notes

- **Mock project root:** `~/push_pi_to_git/nenflow-test-mock-project/`
- **Run artifacts directory:** `~/.pi/agent/nenflow-v3/runs/RUN_TEST_DEEPSEEK/`
- **Node.js version:** Ensure the environment runs Node.js 18+ (needed for `node:test`). Check with `node --version`.
- **Ordering requirement:** Executor-2 depends on Executor-1 having already produced `src/calculator.js`. Executor-2 must NOT modify that file.
- **Model routing:** Executor-1 and Executor-2 must both use `model_used: deepseek-v4-flash` in their frontmatter for grep-ability. The Planner used `deepseek-v4-pro`.
- **Validator:** The Orchestrator will run `validator.js` on all artifacts. Ensure frontmatter fields are exactly as specified: `artifact_type`, `role`, `run_id`, `model_used`.
- **No ESM:** All modules use CommonJS (`require` / `module.exports`) — the `package.json` has no `"type": "module"`.
- **LATEST aliases:** Executor-1 writes `LATEST_EXECUTION.md` and `LATEST_VERIFIER_BRIEF.md`. Executor-2 overwrites them. Both point to their respective ATT_N versions via `cp` or equivalent.
