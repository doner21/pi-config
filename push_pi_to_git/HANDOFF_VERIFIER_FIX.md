# Handoff: Fix Orchestrator Verification Failure (ENAMETOOLONG stdin regression)

## Problem

Large subagent prompts (>6000 chars, e.g. verifier prompts containing all executor outputs) silently fail because:

1. The previous `ENAMETOOLONG` fix drops the positional task argument when `task.length > 6000`
2. Instead it relies 100% on `child.stdin.write(task)` to deliver the task
3. **`pi --mode json -p` does NOT read from stdin when no positional arg is present** — the subprocess starts, receives no prompt, and exits with no output
4. The orchestrator's `parseVerifierResult()` then fails with "not parseable as required JSON"

Evidence: all executor outputs show `_(No assistant text captured.)` for large-prompt tasks; all verifier attempts fail identically.

## The exact code to fix

**File:** `C:\Users\doner\pi-orchestrator-extension\src\index.ts`

**Lines ~710-718** (inside `runSubagent`, near `args.push(task)`):

```typescript
  // Pipe the task via stdin to avoid ENAMETOOLONG on Windows.
  const safeArgLen = process.platform === "win32" ? 6000 : 128_000;
  if (task.length <= safeArgLen) {
    args.push(task);
  } else {
    options.onProgress?.(`Subagent ${profile.name}: prompt size ${task.length} chars exceeds safe arg limit ${safeArgLen}; piping via stdin only.`);
  }
```

## Required fix

When the task is too large for args, write it to a temp file and pass it via `--prompt-file <path>` if pi supports that flag. If pi does NOT support `--prompt-file`, write the task to a temp file and pass it as the positional arg using a pipe/redirect mechanism.

**Option A — check if `pi` supports `--prompt-file`:**

```bash
# Test if pi reads prompt from a file
echo "say hi" > %TEMP%/test-prompt.txt
pi --mode json -p --no-session --no-extensions --prompt-file %TEMP%/test-prompt.txt
```

If that works, the fix is:

```typescript
  if (task.length <= safeArgLen) {
    args.push(task);
  } else {
    // Write task to temp file, pass via --prompt-file
    const promptFile = path.join(tempDir, `${safeFileName(agentName)}-prompt.txt`);
    await writeFile(promptFile, task, "utf8");
    args.push("--prompt-file", promptFile);
  }
```

**Option B — if `--prompt-file` doesn't exist:**

Write to temp file, then pass a short placeholder as the positional arg and pipe the full file via stdin. But this requires confirming that pi reads BOTH the positional arg AND stdin (concatenating them). If it does, the placeholder is harmless because stdin overrides or appends to it.

**Option C — always use temp file + stdin piping:**

```typescript
  // Always write task to temp file, pipe to stdin, pass placeholder arg
  const promptFile = path.join(tempDir, `${safeFileName(agentName)}-prompt.txt`);
  await writeFile(promptFile, task, "utf8");
  args.push("--prompt-file", promptFile);  // if supported
```

## Full paths

| What | Path |
|------|------|
| Extension source | `C:\Users\doner\pi-orchestrator-extension\src\index.ts` |
| Package root | `C:\Users\doner\pi-orchestrator-extension\` |
| Agent profiles | `C:\Users\doner\.pi\agent\agents\` (planner.json, coder.json, reviewer.json) |
| Pi CLI binary | `C:\Users\doner\AppData\Roaming\npm\node_modules\@earendil-works\pi-coding-agent\dist\cli.js` |
| Pi global settings | `C:\Users\doner\.pi\agent\settings.json` |
| Pi jiti runtime | `C:\Users\doner\AppData\Roaming\npm\node_modules\@earendil-works\pi-coding-agent\node_modules\jiti\lib\jiti.cjs` |
| Test harness | Fake pi script at `C:\Users\doner\AppData\Local\Temp\<random>\fake-pi.js` (generated per test) |

## Fix applied

Updated `C:\Users\doner\pi-orchestrator-extension\src\index.ts` in `runSubagent`:

- `--prompt-file` was tested and is not supported by Pi.
- `pi --mode json -p` was tested and does read prompt text from stdin when stdin is piped.
- The regression was caused by `stdio: ["ignore", "pipe", "pipe"]`, which made the advertised stdin piping impossible.
- Large prompts now set `pipeStdin = true`, spawn with `stdio: ["pipe", "pipe", "pipe"]`, then write/end `child.stdin` with the full task.

## How to validate the fix

```bash
# After editing index.ts, reload in the running Pi session:
/reload

# Then run a test orchestration:
/orchestrate --max-retries 0 test that verifier gets its prompt
```

Check the progress logs — verifier prompts >6000 chars should show as `piping via stdin.` and executors/verifiers should produce actual text output (not `_(No assistant text captured.)_`).

### Validation result

A no-API fake Pi CLI validation was run after the fix. Result:

- PASS orchestration result was produced.
- Planner, coder, and reviewer prompts all exceeded 6000 chars and were delivered via stdin.
- Reviewer prompt length was 16831 chars and parsed successfully.
- Progress evidence included:
  - `Subagent planner: prompt size 7399 chars exceeds safe arg limit 6000; piping via stdin.`
  - `Subagent coder: prompt size 7724 chars exceeds safe arg limit 6000; piping via stdin.`
  - `Subagent reviewer: prompt size 16831 chars exceeds safe arg limit 6000; piping via stdin.`

## How to test without real API calls

The existing test harness pattern (from earlier sessions):

```bash
# Create fake pi that echoes based on prompt content
cat > %TEMP%/fake-pi.js <<'JS'
const prompt = process.argv[process.argv.length - 1] || '';
let text = 'executor done';
if (prompt.includes('Plan the following task'))
  text = JSON.stringify({tasks:[{id:'task-1',description:'do',dependsOn:[]}],notes:'ok'});
else if (prompt.includes('Verify the orchestration result'))
  text = JSON.stringify({status:'pass',reasons:['ok']});
else if (prompt.includes('is piped via'))
  text = 'ok i got the prompt';   // <-- confirms stdin actually received the task
console.log(JSON.stringify({type:'message_start'}));
console.log(JSON.stringify({type:'message_end', message:{role:'assistant', content:[{type:'text', text}]}}));
console.log(JSON.stringify({type:'agent_end'}));
JS

# Run with NODE_PATH pointing at pi's node_modules and PI_CLI_PATH pointing at the fake
set NODE_PATH=C:\Users\doner\AppData\Roaming\npm\node_modules\@earendil-works\pi-coding-agent\node_modules
set PI_CLI_PATH=%TEMP%/fake-pi.js
node -e "..."  # (load jiti, run orchestrate tool with huge task, check results)
```

Use `const { Readable } = require('stream')` to create mock child processes that return clean results without hitting real APIs.
