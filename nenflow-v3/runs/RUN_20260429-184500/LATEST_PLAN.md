---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260429-184500
context_saturation_estimate: "~15%"
---

# PLAN — Pi Bridge Server: Persistent RPC Mode

## Task Statement

Rewrite `tools/pi-bridge-server/server.cjs` to use `pi --mode rpc` with a single persistent child process instead of spawning a new `pi --mode text` process per request. This eliminates the 15-20s Pi CLI cold-start latency, bringing physical-phone chat response time under 30s and preventing the 60s client-side timeout from aborting to mock fallback.

## Invariants

- PiBridgeClient TypeScript interface (src/bridge/piBridge.types.ts) must not change
- All seven bridge endpoints must remain functional
- npm run typecheck must pass
- Pi CLI must still be invoked with --no-tools --no-extensions --no-skills --no-session
- Server must bind to 0.0.0.0 for LAN access
- Emulator reachability via 10.0.2.2 must continue to work
- No external process manager — pure Node.js in server.cjs
- Server timeout stays at 120000ms; client timeout increases to match (Step 7)

## Success Criteria

1. Bridge server starts and logs readiness including Pi RPC process connected message
2. GET /health returns 200 from host, emulator, and physical phone
3. POST /agent/message from physical phone returns HTTP 200 within 30 seconds
4. No mock fallback exercised on physical phone
5. Real Pi Code output visible on phone screen
6. Windows Firewall allows inbound TCP port 31415
7. npm run typecheck exits 0
8. Concurrent requests while Pi is busy return 429
9. If Pi RPC process crashes, server auto-restarts and next request succeeds

## Implementation Steps

### Step 1: Add Pi RPC process lifecycle to server.cjs

**File**: `tools/pi-bridge-server/server.cjs`

Add a persistent Pi RPC child process that starts at server boot and restarts on crash. Replace the per-request `spawn()` in `invokePi()` with stdin/stdout communication to the persistent process.

**New module-level state** (add near where `activePiCalls` is declared):

```js
let piProc = null;        // child_process handle
let piProcReady = false;  // true after first response received
let currentRequest = null; // { resolve, reject, fullText, timer, started }
```

**New function `startPiRpc()`**: Spawns `pi --mode rpc` with the same safe flags, attaches JSONL readers, and sets `piProcReady = true` once the process is accepting commands. On process `close`/`error`, sets `piProc = null`, `piProcReady = false`, and schedules a restart after 2s.

**New function `ensurePiRpc()`**: Returns a Promise that resolves when `piProcReady === true`. If `piProc` is null, calls `startPiRpc()` and waits. Use a `piReadyResolve` pattern to signal readiness.

**Call `startPiRpc()` at server start** — before `server.listen()`.

**Pi RPC spawn command** (replaces current `buildPiArgs` for the persistent process):

```js
const rpcArgs = [];
if (!process.env.PI_BRIDGE_PI_COMMAND) rpcArgs.push(config.piCliJs);
rpcArgs.push('--mode', 'rpc');  // KEY CHANGE from 'text'
rpcArgs.push('--provider', config.piProvider);
rpcArgs.push('--model', config.piModel);
rpcArgs.push('--no-tools', '--no-extensions', '--no-skills', '--no-session');
if (process.env.PI_BRIDGE_ALLOW_PROMPT_TEMPLATES !== '1') rpcArgs.push('--no-prompt-templates');
if (process.env.PI_BRIDGE_ALLOW_THEMES !== '1') rpcArgs.push('--no-themes');
if (process.env.PI_BRIDGE_ALLOW_CONTEXT_FILES !== '1') rpcArgs.push('--no-context-files');
// NO -p flag — prompts are sent via stdin JSONL
```

### Step 2: Implement LF-delimited JSONL reader (no readline)

**File**: `tools/pi-bridge-server/server.cjs`

Add helper `attachJsonlReader(stream, onLine)` following the pattern from rpc.md:

```js
const { StringDecoder } = require('node:string_decoder');

const attachJsonlReader = (stream, onLine) => {
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += typeof chunk === 'string' ? chunk : decoder.write(chunk);
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.length > 0) onLine(line);
    }
  });

  stream.on('end', () => {
    buffer += decoder.end();
    if (buffer.length > 0) {
      let line = buffer.endsWith('\r') ? buffer.slice(0, -1) : buffer;
      if (line.length > 0) onLine(line);
    }
  });
};
```

Use this on `piProc.stdout` to deserialize events. Pipe `piProc.stderr` only for crash diagnostics (log to `console.error`).

**CRITICAL**: Do NOT use Node `readline` — it splits on Unicode separators U+2028/U+2029 which are valid inside JSON strings.

### Step 3: Rewrite invokePi() to use RPC instead of spawn-per-request

**File**: `tools/pi-bridge-server/server.cjs`

Replace current `invokePi(message, context)` with an RPC-based version.

**Architecture**: Use shared `currentRequest` object:

```js
let currentRequest = null; // { resolve, reject, fullText, timer, started }
```

The global JSONL `onLine` handler inspects every parsed event. If `currentRequest` is set, routes to request processing logic. When `agent_end` fires, resolve with accumulated text.

**Request flow**:
1. `invokePi()` checks `piProcReady`, sets `currentRequest`, writes `{"type":"prompt","message":prompt}\n` to stdin
2. `onLine` receives `{"type":"response","command":"prompt","success":true}` — prompt accepted
3. `onLine` receives `message_update` events — accumulates `assistantMessageEvent.text_delta`
4. `onLine` receives `agent_end` — calls `currentRequest.resolve({ text, durationMs })`, clears `currentRequest`

**Timeout**: If 120s elapses, send `{"type":"abort"}\n` to Pi process and reject request. The Pi process is NOT killed — only the current prompt is cancelled; the process stays alive for the next request.

### Step 4: Handle Pi process crash/restart

**File**: `tools/pi-bridge-server/server.cjs`

In `startPiRpc()`, add close/error handlers on the child process:

```js
child.on('close', (code, signal) => {
  console.error(`[pi-bridge] Pi RPC process exited (code=${code}, signal=${signal})`);
  piProc = null;
  piProcReady = false;
  if (currentRequest) {
    currentRequest.reject({ kind: 'rpc_crashed', message: 'Pi RPC process exited during request' });
    currentRequest = null;
  }
  setTimeout(() => {
    console.log('[pi-bridge] Restarting Pi RPC process...');
    startPiRpc();
  }, 2000);
});
```

If the process exits during a request, reject with `rpc_crashed`. The next request triggers restart via `ensurePiRpc()`.

### Step 5: Update docs/pi-bridge.md

**File**: `docs/pi-bridge.md`

Add new section after "Start the bridge":

```markdown
## RPC Mode (persistent Pi process)

The bridge server now uses `pi --mode rpc` instead of spawning a new `pi --mode text`
process per request. This means:

- One persistent Pi CLI process starts at server boot
- Chat prompts are sent as JSON-RPC commands over stdin/stdout
- Responses stream in real time with no cold-start penalty
- Typical response time drops from 15–30s to 2–8s

If the Pi RPC process crashes, the server automatically restarts it within 2 seconds.
In-flight requests during a crash will receive a 502 error; retry the message.
```

Update "What `/agent/message` does" section: replace `--mode text -p <message>` with `--mode rpc` and note that prompts are sent via stdin JSONL (`{"type":"prompt","message":"..."}`), not via `-p`.

### Step 6: Add Windows Firewall check for LAN access

**File**: `docs/pi-bridge.md`

Add new section before "Run the Android app":

```markdown
## Windows Firewall — allow inbound port 31415

For physical phone testing over LAN WiFi, Windows Firewall must allow inbound
TCP traffic on port 31415.

**Check if port is reachable (from another machine on LAN):**

```powershell
Test-NetConnection -ComputerName <HOST-LAN-IP> -Port 31415
```

Expected: `TcpTestSucceeded : True`

**If blocked, add a firewall rule:**

Run PowerShell as Administrator:

```powershell
New-NetFirewallRule -DisplayName "Nen Shell Pi Bridge" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 31415 `
  -Action Allow `
  -Profile Private
```

**Verify the rule exists:**

```powershell
Get-NetFirewallRule -DisplayName "Nen Shell Pi Bridge" | Format-Table Name, Enabled, Direction, Action
```

**Check your LAN IP:**

```powershell
ipconfig | Select-String "IPv4"
```

Use the result (e.g., `192.168.0.110`) as the bridge URL on the physical phone.
```

Also emphasize in the physical phone section:

```markdown
For physical phone testing, bind to all interfaces:

```powershell
$env:PI_BRIDGE_HOST="0.0.0.0"
npm run bridge
```
```

### Step 7: Increase client timeout to 120s

**File**: `src/bridge/httpPiBridge.ts`

Change line in `sendAgentMessage`:

```diff
-       timeoutMs: 60000,
+       timeoutMs: 120000,
```

Rationale: RPC mode removes the 15-20s cold-start penalty, so responses now arrive in 2-8s typically. The 120s timeout matches the server's `PI_BRIDGE_TIMEOUT_MS` and provides generous safety margin for unusual LLM latency or network congestion.

### Step 8: Verification steps

**8a. Host curl test** (run in PowerShell while `npm run bridge` is active):

```powershell
curl http://127.0.0.1:31415/health

curl -X POST http://127.0.0.1:31415/agent/message `
  -H "Content-Type: application/json" `
  -d '{"message":"Reply with exactly: nen-shell-rpc-live-2026","context":{}}'
```

Expected: HTTP 200, `reply.text` contains the passphrase, NOT mock text.

**8b. Emulator test**:

```powershell
# Terminal 1
npm run bridge
# Terminal 2
npm run android
# In emulator app: send "Reply with exactly: emu-rpc-live-2026"
# Expected: real Pi response within seconds

**8c. Physical phone test**:

Prerequisites: phone on same LAN WiFi, Windows Firewall port 31415 open (Step 6).

```powershell
$env:PI_BRIDGE_HOST="0.0.0.0"
npm run bridge
```

On phone: configure bridge URL to http://HOST-LAN-IP:31415. Send a chat message.
Expected: real Pi Code response within 30 seconds. No mock fallback.

### Step 9: Typecheck

```powershell
npm run typecheck
```

Must exit 0. Note: server.cjs is CommonJS and not typechecked by tsc, but httpPiBridge.ts is (the file changed in Step 7).

## Handoff Notes

### Key files
- tools/pi-bridge-server/server.cjs — primary modification target (~500 lines of substantive change)
- src/bridge/httpPiBridge.ts — single-line timeout change (line ~149 in sendAgentMessage)
- docs/pi-bridge.md — documentation additions
- C:/Users/doner/AppData/Roaming/npm/node_modules/@mariozechner/pi-coding-agent/docs/rpc.md — RPC protocol reference (read-only)

### Pi CLI RPC spawn args
pi --mode rpc --provider google-gemini-cli --model gemini-2.5-flash --no-tools --no-extensions --no-skills --no-session [--no-prompt-templates] [--no-themes] [--no-context-files]

### JSONL framing — MUST NOT use Node readline
Use raw StringDecoder + indexOf newline as shown in Step 2. Do NOT import readline — it splits on Unicode separators U+2028/U+2029 which are valid inside JSON strings.

### RPC event flow for a prompt
1. Write prompt JSON to stdin
2. Pi responds with acceptance
3. Events stream: message_update with assistantMessageEvent.text_delta deltas
4. Final event: agent_end with messages array

### Concurrency model
Existing activePiCalls + maxConcurrent=1 + 429 response stays. RPC mode is inherently single-conversation (one prompt at a time). The bridge queues at HTTP level (returns 429), not at RPC level.

### Crash recovery
Crash -> reject in-flight request -> wait 2s -> respawn. Next request handles restart transparently via ensurePiRpc().

### Ambiguities resolved
- Approach selected: Option A (persistent RPC) — confirmed by INTAKE's discovery of --mode rpc
- Client timeout: Increase to 120s (Step 7), maintaining generous safety margin
- Firewall: Documented verification + fix (Step 6), not automated (Windows admin requirement)
- Phone subnet: Not server's concern — documented in Step 8c as prerequisite

### Potential pitfalls
- Pi RPC process startup takes ~15s on first boot — one-time cost at server start
- If pi --mode rpc hangs or never emits agent_end, the 120s timeout will abort and restart
- The --no-context-files flag prevents file reading; env var toggle exists if needed
- The existing buildPiArgs function becomes dead code after the rewrite — remove or comment out

[PLANNER CONTEXT — END]
self_estimate: ~15%
