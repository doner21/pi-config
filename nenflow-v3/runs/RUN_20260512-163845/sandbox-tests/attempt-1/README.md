# RUN_20260512-163845 Sandbox Reliability Tests — Attempt 1

These tests are an independent test-builder harness for Subagent A's NenFlow v3 context-handoff implementation.

## Rerun command

From any shell with Node available:

```bash
cd C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260512-163845/sandbox-tests/attempt-1 && node run-tests.js > results/stdout.txt 2> results/stderr.txt; code=$?; printf "%s\n" "$code" > results/exit-code.txt; exit "$code"
```

## Scope

The harness reads live implementation files under `C:/Users/doner/.pi/agent/`, but only writes sandbox artifacts under this `attempt-1/` directory.

Coverage:
- threshold parsing/propagation for 65, 45, 35, 20, 40 and safe defaults/rejection
- `RUN_CONFIG.json` write/read/default behavior
- strict continuation validation accept/reject matrix
- active Pi Route D and role-skill propagation static checks
- Route D simulation with missing normal artifact and same-role resume prompt
- normal validator smoke for PLAN, EXECUTION_REPORT, and VERIFICATION_REPORT artifacts

## Artifact layout

- `run-tests.js` — single test entrypoint
- `tests/` — test modules
- `fixtures/` — generated valid/invalid continuations, run configs, simulated run dirs
- `results/` — raw stdout/stderr/exit-code and JSON summary from the latest run
