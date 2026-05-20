---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260430-185425
context_saturation_estimate: "~8%"
---

# PLAN — Physical Android Phone Bridge and Tool Enablement

## Task Statement

Fix three issues preventing Nen Shell from running on a physical Android 16 phone:
(1) the HTTP bridge client hardcodes an emulator-only address (`10.0.2.2`),
(2) the bridge server binds to `127.0.0.1`, rejecting off-machine connections,
(3) Windows Firewall blocks inbound TCP 31415.
Make the bridge URL configurable while preserving emulator compatibility as the fallback.

## Invariants

- `npm run typecheck` must pass after all TypeScript changes
- All 7 bridge endpoints must return 200 on localhost after restart
- The emulator path (`10.0.2.2`) must remain the fallback default for the bridge client URL
- `createHttpPiBridge(baseUrl)` factory must remain exportable and accept an explicit URL override
- `PI_BRIDGE_HOST` env var on the server must remain honored (do not remove or rename it)
- Bridge server must not bind to `0.0.0.0` by default — only when explicitly configured via `PI_BRIDGE_HOST`
- Safe Mode and permissionBroker code paths must not be touched
- DeepSeek API key must remain server-side only (in `~/.pi/agent/auth.json`, never in client code)
- Pi tools (read, bash, edit, write, grep, find, web_search, web_fetch) must remain enabled by default (no `PI_BRIDGE_DISABLE_TOOLS=1`)
- The `mockPiBridge` fallback must remain as-is — only used as a fallback for malformed/missing bridge responses, not as a replacement

## Success Criteria

1. Bridge server binds to 0.0.0.0:31415. Verify with `netstat -an | Select-String "31415.*LISTEN"` showing 0.0.0.0:31415 after restart with `$env:PI_BRIDGE_HOST="0.0.0.0"`.
2. HTTP bridge client URL is configurable via Expo env var. Setting `EXPO_PUBLIC_BRIDGE_URL=http://192.168.0.110:31415` before `npm run android` causes the app to connect to that address; omitting it causes the app to connect to `http://10.0.2.2:31415`.
3. Windows Firewall allows inbound TCP 31415 on Private profile. `Get-NetFirewallRule -DisplayName "Nen Shell Pi Bridge"` returns an Enabled rule with Direction=Inbound, Protocol=TCP, LocalPort=31415, Action=Allow, Profile=Private.
4. Physical phone can reach the bridge. Browsing `http://192.168.0.110:31415/health` from the phone browser returns a 200 JSON response with "transport":"http".
5. App loads without stalling on physical phone. Health check resolves immediately (no 5-second timeout hang), BridgeHealth.status is "degraded" (not "offline").
6. DeepSeek model responds with full tool access. Sending a chat message from the phone triggers a real Pi RPC invocation that completes and returns `auditEntries[0].title === "Pi RPC invoked"`.
7. TypeScript typecheck passes. `npm run typecheck` exits with code 0.
8. All 7 bridge endpoints return 200 locally. Each of /health (GET), /agent/message (POST), /agent/tasks (GET), /agent/approve (POST), /agent/reject (POST), /agent/audit (GET), /scheduler/jobs (GET) returns HTTP 200 when curled from localhost.

## Implementation Steps

### Step 1: Make bridge client URL configurable via Expo env var

**File:** `src/bridge/httpPiBridge.ts`, line 24

Change:
```ts
const DEFAULT_PI_BRIDGE_BASE_URL = "http://10.0.2.2:31415";
```

To:
```ts
const DEFAULT_PI_BRIDGE_BASE_URL =
  process.env.EXPO_PUBLIC_BRIDGE_URL || "http://10.0.2.2:31415";
```

**Rationale:** EXPO_PUBLIC_* env vars are compiled into the React Native bundle at build time by Expo. When unset, the emulator default is preserved. When building for the physical phone, set `EXPO_PUBLIC_BRIDGE_URL=http://192.168.0.110:31415`.

No other changes needed in this file — `createHttpPiBridge()` (line 317) already accepts an optional `baseUrl` parameter, and the singleton `httpPiBridge` (line 408) calls it with no arguments, picking up the updated default.

### Step 2: Re-export createHttpPiBridge from bridgeClient

**File:** `src/bridge/bridgeClient.ts`

Add:
```ts
export { createHttpPiBridge } from "./httpPiBridge";
```

Existing exports remain unchanged. The existing `piBridge` singleton continues to work for all current callers.

### Step 3: Verify server already supports PI_BRIDGE_HOST (no code change)

**File:** `tools/pi-bridge-server/server.cjs`, line 23

The existing code `host: process.env.PI_BRIDGE_HOST || "127.0.0.1"` already reads the env var. No code change required. Set at runtime:

```powershell
$env:PI_BRIDGE_HOST="0.0.0.0"
npm run bridge
```

**Do NOT change the default from 127.0.0.1 to 0.0.0.0** — that would be a security regression (broadcast bind without explicit intent).

### Step 4: Add Windows Firewall rule

Run PowerShell **as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "Nen Shell Pi Bridge" -Direction Inbound -Protocol TCP -LocalPort 31415 -Action Allow -Profile Private
```

Verify:

```powershell
Get-NetFirewallRule -DisplayName "Nen Shell Pi Bridge" | Format-Table Name, Enabled, Direction, Action
```

Expected: rule is Enabled with Direction=Inbound and Action=Allow.

### Step 5: Verify host LAN IP

```powershell
ipconfig | Select-String "IPv4"
```

Confirm the IP is 192.168.0.110. If it has changed (DHCP), update `EXPO_PUBLIC_BRIDGE_URL` accordingly.

### Step 6: Restart bridge server with 0.0.0.0 bind

Stop any running bridge server, then:

```powershell
cd C:\\Users\\doner\\nen-shell
$env:PI_BRIDGE_HOST="0.0.0.0"
npm run bridge
```

Verify the server log shows `Listening on http://0.0.0.0:31415`.

### Step 7: Validate bridge from localhost (all 7 endpoints)

Each must return HTTP 200:

```powershell
# Health check
curl http://127.0.0.1:31415/health

# Chat smoke test (proves real Pi, not mock)
curl -X POST http://127.0.0.1:31415/agent/message -H "Content-Type: application/json" -d "{"message":"Reply with exactly: nen-shell-bridge-live","context":{}}"

# Tasks
curl http://127.0.0.1:31415/agent/tasks

# Audit
curl http://127.0.0.1:31415/agent/audit

# Scheduler
curl http://127.0.0.1:31415/scheduler/jobs

# Approve (with body)
curl -X POST http://127.0.0.1:31415/agent/approve -H "Content-Type: application/json" -d "{"taskId":"test-001"}"

# Reject (with body)
curl -X POST http://127.0.0.1:31415/agent/reject -H "Content-Type: application/json" -d "{"taskId":"test-001"}"
```

### Step 8: Run TypeScript typecheck

```powershell
cd C:\\Users\\doner\\nen-shell
npm run typecheck
```

Must exit with code 0.

### Step 9: Build and deploy to physical phone

```powershell
cd C:\\Users\\doner\\nen-shell
$env:EXPO_PUBLIC_BRIDGE_URL="http://192.168.0.110:31415"
npm run android
```

If Metro port 8081 is busy:

```powershell
npx expo start --android --port 8082
```

### Step 10: Validate end-to-end from physical phone

1. Phone browser: navigate to `http://192.168.0.110:31415/health` — must return JSON with "transport":"http".
2. Launch Nen Shell app — Home screen loads without stalling (health resolves fast, no 5-second timeout).
3. Send test message "What is 2+2?" — app returns real DeepSeek response via bridge.
4. Send tool-requiring message "List files in current directory" — DeepSeek invokes bash tool and returns results.

### Step 11: Update documentation

**File:** `docs/pi-bridge.md`

Add or replace the physical-phone section with:

```markdown
## Physical phone configuration

Set the Expo environment variable before building:

```powershell
$env:EXPO_PUBLIC_BRIDGE_URL="http://192.168.0.110:31415"
npm run android
```

The app reads this at build time. When unset, the emulator default `http://10.0.2.2:31415` is used.
```

## Handoff Notes

### Key files and what to change

| File | Change |
|------|--------|
| `src/bridge/httpPiBridge.ts` | Line 24: add `EXPO_PUBLIC_BRIDGE_URL` env var support |
| `src/bridge/bridgeClient.ts` | Add `createHttpPiBridge` re-export |
| `tools/pi-bridge-server/server.cjs` | No code change; use env var at runtime |
| `docs/pi-bridge.md` | Add EXPO_PUBLIC_BRIDGE_URL physical phone section |
| Windows Firewall | Add inbound TCP 31415 rule (requires Admin) |

### Design decisions

- **Expo env var over runtime URL detection:** EXPO_PUBLIC_* is the standard Expo pattern for build-time config in React Native. This avoids adding AsyncStorage or a settings screen for a network topology concern. The user rebuilds when switching between emulator and phone.
- **Server default stays 127.0.0.1:** Changing the default to 0.0.0.0 would be a security regression. PI_BRIDGE_HOST=0.0.0.0 must be set explicitly.
- **createHttpPiBridge re-export:** Exposing the factory gives future consumers full control over the bridge URL without touching httpPiBridge.ts again.

### Known unknowns / risks

- **DHCP:** If host IP changes from 192.168.0.110, EXPO_PUBLIC_BRIDGE_URL must be updated and app rebuilt. Verify current IP before building.
- **Metro port 8081 conflict:** Use --port 8082 or kill conflicting process.
- **Android device firewall/VPN:** Some devices block LAN traffic. Check phone network settings if phone still cannot reach bridge.
- **Expo SDK version:** EXPO_PUBLIC_* requires Expo SDK 49+. If project uses older SDK, fall back to inline URL or `extra` in `app.config.js`.
- **Pi RPC process readiness:** The bridge health endpoint always returns "status":"degraded" (line 469 of server.cjs) in RPC mode. This is intentional — the real health signal is whether /agent/message returns real Pi output vs. mock fallback. BridgeHealth.status of "degraded" is a success condition for this task.

### Other facts

- Bridge server uses RPC mode (persistent Pi process) with thinking disabled (PI_BRIDGE_THINKING=off) for fast mobile responses.
- DeepSeek API key is in ~/.pi/agent/auth.json, read by the Pi CLI process, never exposed to the app.
- The health check timeout in httpPiBridge.ts is 5000ms (line 396). After the fix, this resolves in milliseconds over LAN.
- All 7 bridge endpoint handlers are in server.cjs: handleHealth (l 460), handleAgentMessage (l 505), handleTasks (l 610), handleDecision (l 620 for approve and reject), handleAudit (l 642), handleScheduler (l 646).

### Validation

The validator at C:/Users/doner/.pi/agent/nenflow-v3/validator.js checks:
- File exists and is readable
- YAML frontmatter starts with ---
- Required fields: artifact_type, role, run_id
- Role matches expected (PLANNER)
- Artifact type matches expected (PLAN)

Run with: `node C:/Users/doner/.pi/agent/nenflow-v3/validator.js <plan-path> PLANNER PLAN`