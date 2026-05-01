---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260429-143500
context_saturation_estimate: ~32%
---

# ATT_1 -- PLAN: Nen Shell Pi Code Chat Productionization

## Task Statement

Verify the fully implemented but untested Pi Code chat bridge end-to-end:
Nenshell Android UI -> HTTP bridge client -> bridge server -> Pi CLI -> response to UI.
Verification-first: each step produces pass/fail evidence. Stop at first failure.



## End-to-End Data Flow (5 Layers)

Layer 1  UI          AgentInput.tsx -> setText() + onSend(clean)
Layer 2  Context     NenShellContext.tsx.sendMessage() -> dispatch -> piBridge.sendAgentMessage()
Layer 3  Client      httpPiBridge.ts -> fetch(http://10.0.2.2:31415/agent/message)
Layer 4  Server      server.cjs handleAgentMessage() -> invokePi() -> spawn(piCommand, args)
Layer 5  Pi CLI      node <cli.js> --provider google-gemini-cli --model gemini-2.5-flash --no-tools -p <prompt>
Layer 4  Server      -> json(res, 200, { reply: { text: stdout }, auditEntries })
Layer 3  Client      -> normalizeAgentTurn(payload) ?? mockPiBridge.sendAgentMessage()  [STEALTH FALLBACK]
Layer 2  Context     -> dispatch(SEND_MESSAGE_SUCCESS) -> reducer sets state.latestReply
Layer 1  UI          -> HomeScreen.tsx renders state.latestReply.text

## Invariants

1. PiBridgeClient interface must not change shape
2. Bridge endpoints: GET /health, POST /agent/message, GET /agent/tasks, POST /agent/approve, POST /agent/reject, GET /agent/audit, GET /scheduler/jobs
3. POST /agent/message response must parse through normalizeAgentTurn(); mismatch = silent mock fallback
4. Safe Mode ON by default, functional
5. Permission broker must not be bypassed
6. Pi CLI safe defaults: --no-tools --no-extensions --no-skills --no-session
7. Mock fallback must NOT fire during successful flow
8. npm run typecheck passes after all changes
9. Android emulator: 10.0.2.2 -> host 127.0.0.1:31415
10. Bridge server binds 127.0.0.1:31415

## Success Criteria

1. Pi CLI smoke: returns pi-cli-live sentinel
2. Bridge server starts: prints Listening on http://127.0.0.1:31415
3. GET /health returns 200 with metadata
4. POST /agent/message valid -> 200, reply.text has sentinel, auditEntries[0].title = Pi CLI invoked
5. POST /agent/message empty -> 400
6. npm run typecheck passes
7. adb devices shows emulator
8. npx expo start works
9. PRIMARY: User types in AgentInput, app POSTs to 10.0.2.2:31415, bridge invokes real Pi, normalizeAgentTurn parses (no mock), real Pi text on HomeScreen. NOT containing "I can hold this calmly:"
10. UI labels de-mocked per Step 10


## Implementation Steps

Each step ordered cheapest-to-expensive. Stop at first failure before continuing.

---

### Step 1: Pi CLI Direct Smoke (Layer 5)

Purpose: Prove Pi CLI installed, provider/model functional.

Command (PowerShell):
    cd C:/Users/doner/nen-shell
    pi --provider google-gemini-cli --model gemini-2.5-flash --mode text --no-tools --no-extensions --no-skills --no-session -p "Reply with exactly: pi-cli-live"

Expected: stdout contains pi-cli-live. Exit 0.

Remediation:
- pi not found: verify CLI JS at AppData path. Run node <path> directly.
- Provider/model unknown: pi --help. Set PI_BRIDGE_PI_MODEL.
- Empty stdout: check provider connectivity.

---

### Step 2: Bridge Server Startup (Layer 4)

Command (new terminal):
    cd C:/Users/doner/nen-shell
    npm run bridge

Expected: [pi-bridge] Listening on http://127.0.0.1:31415

Remediation:
- Port in use: netstat -ano | findstr :31415, kill process or set PI_BRIDGE_PORT
- Node < 18: upgrade
- Syntax error: verify server.cjs integrity

---

### Step 3: Health Endpoint (Layer 4->3)

Command (separate terminal, bridge running):
    curl http://127.0.0.1:31415/health

Expected: 200 JSON with status, transport, endpointBase, piCommand, piProvider, piModel, safeDefaults, activePiCalls, maxConcurrent.

---

### Step 4: Bridge Server Chat Smoke -- Real Pi (Layer 4->5->4)

Purpose: Critical no-mock proof. Bridge -> Pi CLI -> response from host.

Command:
    curl -X POST http://127.0.0.1:31415/agent/message -H "Content-Type: application/json" -d "{"message":"Reply with exactly: nen-shell-bridge-live","context":{}}"

Expected: 200 JSON. reply.text has nen-shell-bridge-live. reply.role is assistant. reply.id starts reply_. auditEntries[0].title is Pi CLI invoked. suggestedActions is [].

CRITICAL: Must NOT contain I can hold this calmly or Mock Pi Code replied.

Remediation:
| Status | error.code | Cause | Fix |
|--------|-----------|-------|-----|
| 504 | timeout | Pi >120s | Increase PI_BRIDGE_TIMEOUT_MS |
| 502 | pi_failed | Pi non-zero exit | Check stderr; return to Step 1 |
| 502 | empty_output | Pi blank stdout | Provider connectivity |
| 502 | spawn_error | node/CLI path wrong | Verify process.execPath, config.piCliJs |
| 429 | bridge_busy | Call in flight | Wait, retry |

---

### Step 5: Bad Input Validation (Layer 4)

Command:
    curl -i -X POST http://127.0.0.1:31415/agent/message -H "Content-Type: application/json" -d "{"message":"","context":{}}"

Expected: 400 with error code bad_request, message is required.

---

### Step 6: Typecheck

Command: cd C:/Users/doner/nen-shell; npm run typecheck
Expected: Zero errors. Re-run after any code changes.

---

### Step 7: Android Emulator Availability

Command: adb devices
Expected: device state device. If none: boot NenShell_API35 or API 35+ image.

---

### Step 8: Expo / Metro Startup

Command (separate terminal, emulator booted, bridge running):
    cd C:/Users/doner/nen-shell
    npx expo start --android

Expected: Metro starts, app builds and installs. Port 8081 busy -> --port 8082.

---

### Step 9: Full Integration -- Real Chat Through UI (PRIMARY)

Prerequisites: Steps 1-8 all passing.

Procedure:
1. Open Nenshell on emulator, Home tab
2. In AgentInput type: What is 2+2? Reply in one sentence.
3. Tap Send
4. Button shows Holding briefly, then Send
5. Reply card appears below input
6. If real: genuine Pi answer (e.g. "2 + 2 equals 4.")
7. If mock: text has I can hold this calmly: -- bridge NOT working

Stealth fallback in httpPiBridge.ts triggers two ways:
  Way 1: fetch throws -> catch -> mock (network failure)
  Way 2: normalizeAgentTurn returns undefined -> ?? -> mock (parse failure)

Diagnostic:
1. Check bridge server console for incoming request
2. If server got request: parse issue, log raw payload in httpPiBridge.ts ~line 157
3. If server got NO request: emulator networking. adb shell curl http://10.0.2.2:31415/health
   If fails but host curl works: set PI_BRIDGE_HOST=0.0.0.0, restart bridge

---

### Step 10: UI Label + Audit Message Update (Post-Verification)

Only execute if Step 9 passed.

File: src/screens/HomeScreen.tsx
  Line ~79: Ask Pi Code through the mock bridge -> Ask Pi Code
  Line ~85: Latest mock reply -> Latest Pi Code reply

File: src/state/NenShellContext.tsx
  Line ~69: Mock bridge turn failed -> Bridge turn failed
  Line ~73: Unknown mock bridge failure. -> Unknown bridge failure.
  Line ~150: Mock approval recorded -> Approval recorded

After changes: npm run typecheck.

---

### Step 11: Final Typecheck + Invariant Audit

Commands:
    npm run typecheck
    npm run bridge (verify starts)
    curl http://127.0.0.1:31415/health

Also verify:
- Safe Mode toggle works in UI
- Permission broker blocks risky actions with Safe Mode ON
- Bridge server returns 400 for empty messages


## Handoff Notes

### Critical File Map

| File | Layer | Role |
|------|-------|------|
| src/components/AgentInput.tsx | 1-UI | Chat input, calls onSend(clean) |
| src/screens/HomeScreen.tsx | 1-UI | Renders reply, needs label update (Step 10) |
| src/state/NenShellContext.tsx | 2-Context | sendMessage() -> piBridge.sendAgentMessage(); needs audit update (Step 10) |
| src/state/reducer.ts | 2-Context | SEND_MESSAGE_SUCCESS sets state.latestReply |
| src/bridge/httpPiBridge.ts | 3-Client | HTTP fetch + normalizeAgentTurn + stealth fallback |
| src/bridge/bridgeClient.ts | 3-Client | Active export: piBridge = httpPiBridge |
| src/bridge/piBridge.types.ts | 3-Client | PiBridgeClient contract |
| src/bridge/mockPiBridge.ts | 3-Client | Mock (must NOT fire during success) |
| src/agent/piCodeBridge.ts | 3-Client | Re-exports piBridge |
| tools/pi-bridge-server/server.cjs | 4-Server | HTTP server, spawns Pi CLI |
| docs/pi-bridge.md | -- | Reference |
| package.json | -- | Scripts: bridge, android, typecheck |

### WARNING: Stealth Failure Mode

HIGHEST-RISK ISSUE in this system.

In httpPiBridge.ts sendAgentMessage():
  try { return normalizeAgentTurn(payload) ?? mockPiBridge.sendAgentMessage(input); }
  catch { return mockPiBridge.sendAgentMessage(input); }

Two silent fallthrough paths:
1. Network failure (fetch throws -> catch -> mock)
2. Normalization failure (server 200 but normalizeAgentTurn returns undefined -> ?? -> mock)

Both produce plausible response with ZERO indication bridge failed.
Mock text pattern: I can hold this calmly:

Server response shape vs normalizeAgentTurn: CONFIRMED COMPATIBLE.
  isRecord(value): YES
  isRecord(value.reply): YES
  stringValue(value.reply.text): YES
  suggestedActions key found: YES
  auditEntries key found: YES

If bridge reachable and returns 200, parsing WILL succeed. Mock in Step 9 = network failure.

### How to Distinguish Real vs Mock

| Indicator | Real Pi Bridge | Mock Fallback |
|-----------|---------------|---------------|
| reply.text | Genuine Pi answer | I can hold this calmly: ... |
| auditEntries[0].title | Pi CLI invoked | Mock agent turn summarized |
| suggestedActions.length | 0 | 2 |
| reply.summary | First line of Pi output | Mock Pi Code replied locally... |

### Environment Variables

PI_BRIDGE_HOST (default 127.0.0.1; use 0.0.0.0 for emulator access)
PI_BRIDGE_PORT (default 31415)
PI_BRIDGE_PI_PROVIDER (default google-gemini-cli)
PI_BRIDGE_PI_MODEL (default gemini-2.5-flash)
PI_BRIDGE_TIMEOUT_MS (default 120000)
PI_BRIDGE_ALLOW_TOOLS (unset -> --no-tools; set 1 to enable, UNSAFE)
PI_BRIDGE_ALLOW_EXTENSIONS (unset -> --no-extensions)
PI_BRIDGE_ALLOW_SKILLS (unset -> --no-skills)

### Known-Good Baseline (2026-04-29)

- Pi CLI JS at AppData path: EXISTS
- npm run typecheck: PASSES (0 errors)
- server.cjs: 14,194 bytes
- Response shape vs normalizeAgentTurn: COMPATIBLE

---

[PLANNER CONTEXT -- END]
self_estimate: ~32%
