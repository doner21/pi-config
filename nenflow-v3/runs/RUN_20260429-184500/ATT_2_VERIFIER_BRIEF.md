---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260429-184500
target_role: VERIFIER
---

# VERIFIER BRIEF — RUN_20260429-184500

## What was implemented

Three files changed to switch the Pi bridge server from spawn-per-request (`--mode text`) to a persistent `--mode rpc` child process:

1. **`tools/pi-bridge-server/server.cjs`** — Major rewrite (~400 lines)
2. **`src/bridge/httpPiBridge.ts`** — Single-line timeout change (line 340: `60000` → `120000`)
3. **`docs/pi-bridge.md`** — Documentation additions (RPC Mode, Windows Firewall sections, updated agent/message description)

## What to verify

### A. Static checks (can verify without running bridge)

| Check | How | Expected |
|-------|-----|----------|
| Node syntax | `node -c tools/pi-bridge-server/server.cjs` | Exit 0 |
| TypeScript compilation | `npm run typecheck` | Exit 0, no errors |
| No Node readline usage | `rg "readline" tools/pi-bridge-server/server.cjs` | No matches |
| StringDecoder import present | `rg "StringDecoder" tools/pi-bridge-server/server.cjs` | At least 1 match |
| JSONL reader uses indexOf('\n') | `rg "indexOf.*\\\\n" tools/pi-bridge-server/server.cjs` | At least 1 match |
| RPC mode in spawn args | `rg "\-\-mode.*rpc" tools/pi-bridge-server/server.cjs` | At least 1 match |
| startPiRpc called before listen | Check line ordering near end of file | `startPiRpc()` before `server.listen()` |
| Crash restart timeout | `rg "2000" tools/pi-bridge-server/server.cjs` near close handler | `setTimeout(..., 2000)` |
| Client timeout 120000 | `rg "timeoutMs: 120000" src/bridge/httpPiBridge.ts` | 1 match |
| No old buildPiArgs | `rg "buildPiArgs" tools/pi-bridge-server/server.cjs` | 0 matches |
| No old spawn in invokePi | `rg "spawn\(config" tools/pi-bridge-server/server.cjs` in invokePi context | 0 matches |

### B. Live bridge tests (run while `npm run bridge` is active)

| Check | Command | Expected |
|-------|---------|----------|
| Health endpoint | `curl http://127.0.0.1:31415/health` | HTTP 200, `"mode":"rpc"`, `piProcReady:true` |
| RPC ready message in server logs | Check terminal running bridge | `[pi-bridge] Pi RPC process connected and ready` |
| Chat request (host) | `curl -X POST http://127.0.0.1:31415/agent/message -H "Content-Type: application/json" -d '{"message":"Reply with exactly: nen-shell-rpc-live-2026","context":{}}'` | HTTP 200, `reply.text` contains `nen-shell-rpc-live-2026`, NOT mock text |
| Chat request (empty message) | `curl -i -X POST http://127.0.0.1:31415/agent/message -H "Content-Type: application/json" -d '{"message":""}'` | HTTP 400 |
| Audit entry title | Look at audit entry in chat response | `"title":"Pi RPC invoked"` (not "Pi CLI invoked") |
| Diagnostics mode field | Look at diagnostics in chat response | `"mode":"rpc"` |
| Emulator test | `npm run android`, send "Reply with exactly: emu-rpc-live-2026" | Real Pi response within seconds, no mock fallback |
| Physical phone test | Phone on same LAN, bridge bound to `0.0.0.0`, firewall port 31415 open | Real Pi response within 30s, no mock fallback |

### C. Concurrency / crash recovery (harder to test directly, verify by code review)

| Behavior | Where to check | Expected |
|----------|---------------|----------|
| 429 when busy | `handleAgentMessage` in server.cjs | Returns 429 when `activePiCalls >= maxConcurrent` |
| Crash rejects in-flight request | `child.on('close', ...)` handler | `currentRequest.reject({ kind: 'rpc_crashed' })` if `currentRequest` is set |
| Crash restarts after 2s | `child.on('close', ...)` handler | `setTimeout(() => { startPiRpc(); }, 2000)` |
| Timeout sends abort to Pi | `invokePi` timeout handler | `piProc.stdin.write(JSON.stringify({ type: 'abort' }) + '\n')` |
| Timeout does NOT kill process | `invokePi` timeout handler | No `piProc.kill()` call |

### D. Documentation

| Check | File | Expected |
|-------|------|----------|
| RPC Mode section exists | `docs/pi-bridge.md` | Section "RPC Mode (persistent Pi process)" after "Start the bridge" |
| Windows Firewall section exists | `docs/pi-bridge.md` | Section "Windows Firewall — allow inbound port 31415" before "Run the Android app" |
| Agent/message docs show RPC | `docs/pi-bridge.md` | References `--mode rpc`, stdin JSONL, text_delta events, no cold-start penalty |

## Key invariants from the Plan

1. **PiBridgeClient interface unchanged** — `src/bridge/piBridge.types.ts` was not modified
2. **All 7 endpoints functional** — Route handlers untouched structurally
3. **npm run typecheck passes** — Verified, exit 0
4. **Pi CLI safe flags preserved** — `--no-tools`, `--no-extensions`, `--no-skills`, `--no-session` all present in RPC spawn args
5. **Server binds to 0.0.0.0** — Config host defaults to `127.0.0.1`, overridable via env
6. **Emulator (10.0.2.2) works** — Binding unchanged, route handlers unchanged
7. **No external process manager** — Pure Node.js `child_process.spawn` in server.cjs
8. **Server timeout 120000ms; client timeout 120000ms** — Both now match

## Potential pitfalls to watch for

1. **Pi RPC process cold-start on first boot**: The persistent process still takes ~15s to initialize at server start. This is a one-time cost. If `piProcReady` is `false` when the first request arrives, the server returns 502. Verify the server log shows "Pi RPC process connected and ready" before sending the first curl request.

2. **Zombie aborts**: If `invokePi` times out and sends abort, but the Pi process has already emitted `agent_end` between the timeout firing and the currentRequest being cleared, a race exists. The `currentRequest` null check on both sides should prevent double-resolution, but verify with repeated rapid-fire requests.

3. **--no-context-files must stay**: The plan explicitly calls this out. Verify it's in the spawn args. The env var `PI_BRIDGE_ALLOW_CONTEXT_FILES=1` can toggle it.

4. **Stderr draining**: Pi RPC stderr is piped and logged. If Pi writes a lot to stderr and the bridge never reads it, the pipe buffer could fill. This is mitigated by the `stderr.on('data', ...)` handler but worth noting.

## Files to compare against

- `C:/Users/doner/nen-shell/tools/pi-bridge-server/server.cjs` — current (post-implementation)
- `C:/Users/doner/nen-shell/src/bridge/httpPiBridge.ts` — line 340 only
- `C:/Users/doner/nen-shell/docs/pi-bridge.md` — lines 46-57, 59-91, 116-128
- `C:/Users/doner/AppData/Roaming/npm/node_modules/@mariozechner/pi-coding-agent/docs/rpc.md` — RPC protocol reference (read-only, for cross-checking event types)
- `C:/Users/doner/nen-shell/src/bridge/piBridge.types.ts` — unchanged (negative check: diff should be empty)
