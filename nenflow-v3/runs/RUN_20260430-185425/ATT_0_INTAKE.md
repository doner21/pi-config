---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260430-185425
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~90%"
---

# INTAKE — Physical Android Phone Bridge & Tool Enablement

## Task Summary

The user wants Nen Shell running on their physical Android 16 phone with:
1. **DeepSeek model** using the stored API key (`sk-74e05635ca1242d5877ba8fc900e9dc2`)
2. **Full Pi Code tool scope** enabled (read, bash, edit, write, grep, find, web_search, web_fetch)
3. **Working end-to-end** — app loads, connects to bridge, sends/receives messages
4. **Currently broken** — app "stalls and doesn't load" on the physical phone

## Root Cause Analysis (3 Issues)

### Issue 1: Network Address — `10.0.2.2` is emulator-only
`src/bridge/httpPiBridge.ts` line 24:
```ts
const DEFAULT_PI_BRIDGE_BASE_URL = 'http://10.0.2.2:31415';
```
`10.0.2.2` is the Android emulator's special alias for the host machine. On a **physical phone**, this address does not exist. The phone needs the host's LAN IP: `192.168.0.110`.

### Issue 2: Bridge binds to localhost only
`tools/pi-bridge-server/server.cjs`:
```js
host: process.env.PI_BRIDGE_HOST || '127.0.0.1',
```
The bridge server listens on `127.0.0.1`, which only accepts connections from the same machine. A physical phone on the LAN cannot reach it. The server must bind to `0.0.0.0` (all interfaces).

### Issue 3: Windows Firewall blocks port 31415
No inbound firewall rule exists for TCP port 31415. Even with Issues 1 & 2 fixed, the phone's packets would be dropped.

### Stalling Behavior
When the app launches, `NenShellProvider` initializes state. On the Home screen, `refreshStatus` is called which hits `piBridge.getHealth()`. Since the bridge is unreachable (`10.0.2.2` doesn't exist on physical phone), the HTTP fetch hangs for 5 seconds (the httpPiBridge timeout) before returning `status: 'offline'`. The app may appear to "stall" during this timeout, and even after, it shows degraded/mock state.

## Task Type

**Configuration fix + network enablement.** The code changes are minimal (configurable bridge URL, server bind address). The main work is network/firewall configuration and validation.

## Goal Attractor

A Nen Shell app on the physical Android 16 phone that:
- Connects to the bridge server on the Windows host via LAN
- Uses DeepSeek V4 Flash with full tool access
- Loads without stalling and can send/receive messages with tool calls

## Constraints

1. Must preserve emulator compatibility (`10.0.2.2` should still work as fallback)
2. Safe Mode and permissionBroker must remain untouched
3. TypeScript typecheck must pass
4. Bridge server must remain secure (no open internet exposure — LAN only)
5. DeepSeek API key must not be exposed in client-side code

## Invariants

1. `npm run typecheck` passes
2. All 7 bridge endpoints return 200
3. Physical phone can reach bridge over LAN
4. Emulator path (`10.0.2.2`) still works
5. Pi tools enabled (already done from previous run)
6. Safe Mode still blocks risky actions
7. DeepSeek key remains server-side only

## Success Criteria

1. Bridge server binds to `0.0.0.0:31415` (configurable via `PI_BRIDGE_HOST`)
2. HTTP bridge client URL is configurable (env-var or runtime) and defaults to `10.0.2.2` for emulator
3. Windows Firewall allows inbound TCP 31415 on Private profile
4. Physical phone can reach `http://192.168.0.110:31415/health` from its browser
5. App loads without stalling on physical phone (health check responds quickly)
6. DeepSeek model responds to messages with full tool access
7. Web search and file operations work from the phone

## Routing Decision

**GO TO PLAN.** The problem is well-understood — three specific issues with clear fixes. No research needed.

## Key Files

- `tools/pi-bridge-server/server.cjs` — bridge server (bind address)
- `src/bridge/httpPiBridge.ts` — HTTP client (bridge URL)
- `src/bridge/bridgeClient.ts` — bridge export
- `docs/pi-bridge.md` — documentation
- Windows Firewall — needs new rule
- `~/.pi/agent/auth.json` — DeepSeek key (already configured)

## Current State Snapshot

| Item | Value |
|------|-------|
| Host LAN IP | `192.168.0.110` |
| Bridge URL (current) | `http://10.0.2.2:31415` |
| Bridge bind (current) | `127.0.0.1` |
| Firewall rule | NOT FOUND |
| DeepSeek key | Configured |
| Bridge server status | Running, Pi RPC ready |
| Pi tools | Enabled |
