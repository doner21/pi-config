---
artifact_type: PLAN
role: PLANNER
run_id: NENFLOW_ORCHESTRATE_TEST
context_saturation_estimate: "~1%"
---

[PLANNER CONTEXT — START]
self_estimate: ~1%
context_handoff_threshold_percent: 65
threshold_source: default
health: HEALTHY
[PLANNER CONTEXT — END]

## Task Statement

Implement a single-file Node.js CLI at `/tmp/nenflow-echo-test/index.js` (under 100 lines) that accepts three commands (`echo <msg>`, `history`, `clear`) and an optional `--port <n>` flag (accepted but ignored — no real server). The CLI persists command history to `history.json` in the current working directory and loads it on startup. A companion test suite at `/tmp/nenflow-echo-test/test.js` must verify all commands, exit codes, persistence, and edge cases.

## Invariants

- File-system access is available
- Node.js v16+ is present (confirmed: v24.14.0)
- The existing scaffold files MUST NOT be deleted or renamed: `package.json`, `PROJECT_SPEC.md`, `.gitignore`
- No external npm dependencies for core CLI functionality (`index.js` may use only Node.js built-in modules: `fs`, `path`, `process`)
- The `--port` flag exists only to satisfy the CLI contract; no HTTP/TCP server is started
- Exit code `0` on success, exit code `1` on unknown command or missing required arguments
- History file is named exactly `history.json` in the current working directory
- `history.json` is excluded from version control (already in `.gitignore`)

## Success Criteria

1. `node index.js echo hello` → prints `hello` to stdout, exits with code `0`, appends an entry to history
2. `node index.js history` → prints the full history array as formatted JSON to stdout, exits with code `0`
3. `node index.js clear` → clears history, exits with code `0`; subsequent `node index.js history` prints `[]`
4. `history.json` is written to disk and survives across separate `node index.js` invocations (history is loaded on startup)
5. `node index.js --port 3000 echo test` works: the `--port` flag is accepted but ignored, message is echoed, exits with code `0`
6. `node index.js foo` → exits with code `1` and prints a helpful error message to stderr
7. `node index.js echo` (missing message argument) → exits with code `1` and prints a helpful error message to stderr
8. `node test.js` passes all tests (exit code `0`), covering all three commands, persistence, port flag acceptance, and error cases

## Implementation Steps

### Step 1: Create `/tmp/nenflow-echo-test/index.js`

Create the main CLI entry point. The file must:

- Use only Node.js built-in modules (`fs`, `path`)
- Parse command-line arguments: `process.argv.slice(2)`
- Handle the `--port <n>` flag by consuming it (skip the flag and its numeric argument) before dispatching the command
- Implement three commands:
  - `echo <msg>` — print `<msg>` to stdout, append `{ command: "echo", message: "<msg>", timestamp: "<ISO-8601>" }` to in-memory history array, write full history to `history.json`
  - `history` — print `JSON.stringify(history, null, 2)` to stdout
  - `clear` — set history to `[]`, write `[]` to `history.json`
- On startup, load existing history from `history.json` if the file exists; if not, start with `[]`
- After every mutating command (`echo`, `clear`), write the full history array to `history.json`
- On unknown command or missing required arguments, print `"Usage: node index.js [--port <n>] <command> [<args>]"` to stderr and `process.exit(1)`
- Keep the implementation under 100 lines of JavaScript
- Example structure:

```js
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const HISTORY_FILE = "history.json";

function loadHistory() {
  // read and parse HISTORY_FILE, return [] on any error
}

function saveHistory(history) {
  // write JSON.stringify(history, null, 2) to HISTORY_FILE
}

function main() {
  const args = process.argv.slice(2);
  // handle --port flag
  // dispatch command
  const history = loadHistory();
  // ...
}

main();
```

### Step 2: Create `/tmp/nenflow-echo-test/test.js`

Create a test suite using Node.js built-in `assert` module (no external test framework). The test file must:

- Use `require("assert")` and `require("child_process").execSync`
- Define a helper `run(args)` that calls `node index.js <args>` via `execSync`, captures stdout/stderr and exit code
- Implement and run the following test cases (each as a named function or inline):

  1. **Test: echo basic** — run `node index.js echo hello`, assert stdout contains `hello`, assert exit code is `0`
  2. **Test: history after echo** — run `node index.js echo world`, then `node index.js history`, assert stdout is valid JSON array with at least 1 entry
  3. **Test: clear** — run `node index.js clear`, then `node index.js history`, assert stdout is `[]`
  4. **Test: persistence across invocations** — run `node index.js echo p1`, then in a separate invocation `node index.js history`, assert at least one entry survives
  5. **Test: port flag accepted** — run `node index.js --port 3000 echo port-test`, assert exit code `0`, assert stdout contains `port-test`
  6. **Test: unknown command** — run `node index.js foo`, assert exit code is `1`, assert stderr is non-empty
  7. **Test: missing echo argument** — run `node index.js echo`, assert exit code is `1`, assert stderr is non-empty

- After all tests, clean up by running `node index.js clear`
- Count passes and failures; if any test fails, `process.exit(1)`; otherwise print summary and `process.exit(0)`

Example skeleton:

```js
const assert = require("assert");
const { execSync } = require("child_process");
const fs = require("fs");

function run(args) {
  try {
    const stdout = execSync(`node index.js ${args}`, { encoding: "utf8" });
    return { stdout, stderr: "", status: 0 };
  } catch (e) {
    return { stdout: e.stdout || "", stderr: e.stderr || "", status: e.status };
  }
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS: ${name}`);
  } catch (e) {
    failed++;
    console.error(`FAIL: ${name} — ${e.message}`);
  }
}

// Test cases here ...

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
```

### Step 3: Run the test suite

After writing both files, run:

```
cd /tmp/nenflow-echo-test
node test.js
```

Confirm all tests pass with exit code `0`.

### Step 4: Manual smoke test

Run the following commands from `/tmp/nenflow-echo-test/` to verify end-to-end behavior:

```sh
node index.js echo hello           # expect: "hello" printed
node index.js history              # expect: JSON array with echo entry
node index.js clear && node index.js history  # expect: []
node index.js --port 3000 echo test  # expect: "test" printed, exit 0
node index.js foo || echo "exit 1"    # expect: error message, exit 1
node index.js echo || echo "exit 1"   # expect: error message, exit 1
```

## Handoff Notes

### Key Facts

- **Project directory**: `/tmp/nenflow-echo-test/`
- **Files already present**: `package.json` (name: `echo-cli`, test script: `node test.js`), `PROJECT_SPEC.md`, `.gitignore` (excludes `node_modules/` and `history.json`)
- **Node.js version**: v24.14.0 (satisfies v16+ invariant)
- **No npm install needed**: all dependencies are Node.js built-ins (`fs`, `path`, `assert`, `child_process`)
- **Files to create**: `index.js` (CLI entry point) and `test.js` (test suite)
- **Output artifact**: `history.json` in the project directory (excluded from git)

### Decisions

- The `history.json` file uses pretty-printed JSON (`JSON.stringify(history, null, 2)`) for readability
- History entries include `command`, `message`, and `timestamp` (ISO-8601) fields
- `echo` without a message argument is treated as an error (exit 1) — consistent with the requirement for "missing required arguments"
- The `--port` flag is parsed by skipping two array elements (`--port` and the numeric value); if `--port` is followed by a non-numeric or nothing, it should still be handled gracefully (treat as error or fall back to default)
- The test suite cleans up history at the end to leave a clean state

### Unknowns / Edge Cases

- If `history.json` exists but contains invalid JSON, the CLI should treat it as an empty array (graceful degradation)
- If `fs.writeFileSync` fails (disk full, permissions), the error should not be silently swallowed — it's acceptable to let it propagate

### For the Executor

- Read `ATT_0_INTAKE.md` for the full context before starting
- Read `PROJECT_SPEC.md` at `/tmp/nenflow-echo-test/PROJECT_SPEC.md` for the authoritative CLI contract
- Produce `ATT_2_EXECUTION.md` (Execution Report) and `ATT_2_VERIFIER_BRIEF.md` (Verifier Brief) after implementation
- Model routing note: Executor runs as DeepSeek V4 Flash (`deepseek-v4-flash`)

[PLANNER CONTEXT — END]
self_estimate: ~1%
