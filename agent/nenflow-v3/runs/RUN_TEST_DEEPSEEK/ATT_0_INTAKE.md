---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_TEST_DEEPSEEK
recommended_next_step: PLAN
context_handoff_threshold_percent: 65
threshold_source: default
---

# ATT_0_INTAKE — NenFlow v3 Orchestrator Intake

## 1. Task Summary
Build a Node.js calculator module in `src/calculator.js` exporting `add`, `subtract`, `multiply`, and `divide` functions, with corresponding tests in `test/calculator.test.js`. A second executor extends the project with `src/advanced.js` providing `power`, `squareRoot`, and `factorial` functions, with tests in `test/advanced.test.js`. The mock project is located at `~/push_pi_to_git/nenflow-test-mock-project/`.

## 2. Goal Attractor
- `npm test` passes all tests.
- Verifier issues `VERDICT: PASS`.

## 3. Constraints
- Planner subagent uses **DeepSeek V4 Pro**.
- Executor subagents (both) use **DeepSeek V4 Flash**.
- Verifier subagent uses **DeepSeek V4 Flash**.
- No existing files in the mock project may be deleted.

## 4. Invariants
- The `package.json` test script must remain exactly `"node --test test/*.test.js"`.
- The mock project directory structure (`src/`, `test/`) must be preserved.

## 5. Success Criteria
- **SC1:** `src/calculator.js` exists and exports all 4 operations (`add`, `subtract`, `multiply`, `divide`).
- **SC2:** `test/calculator.test.js` covers all 4 operations with passing test cases.
- **SC3:** `npm test` executes and passes without errors.
- **SC4:** `src/advanced.js` exists and exports `power`, `squareRoot`, and `factorial`.
- **SC5:** Both executors produce an Execution Report and a Verifier Brief artifact.
- **SC6:** The Verifier independently confirms all criteria by reading files and running commands.

## 6. Routing Decision
| Phase   | Subagent             | Model              |
|---------|----------------------|--------------------|
| PLAN    | `pev-planner`        | DeepSeek V4 Pro    |
| EXEC-1  | `pev-executor-flash` | DeepSeek V4 Flash  |
| EXEC-2  | `pev-executor-flash` | DeepSeek V4 Flash  |
| VERIFY  | `pev-verifier-flash` | DeepSeek V4 Flash  |
