---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260429-143500
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~15%"
---

# INTAKE — Nen Shell Pi Code Chat Productionization

## Task Summary

Nen Shell currently has a fully implemented but untested end-to-end Pi Code chat bridge. The bridge client (`src/bridge/httpPiBridge.ts`) calls a local Node.js bridge server (`tools/pi-bridge-server/server.cjs`) which invokes the installed Pi CLI. The bridge client is already the active export in `bridgeClient.ts`. The task is to **verify the full production chat flow works end-to-end** — from the Nenshell mobile app UI through the bridge server to Pi Code and back — and fix any gaps discovered during verification.

## Task Type

**Infrastructure verification + gap-fill productionization.** The implementation is written but unvalidated. Primary focus: end-to-end testing, gap identification, and remediation.

## User Intent

The user wants the Pi Code link to be "no longer a mark but full production" — meaning they can open Nen Shell on their Android emulator or device, type a message into the chat interface, and receive a real Pi Code response (not mock fallback). The user wants to "see it working."

## Goal Attractor

A **visible, working chat interface** on Nen Shell where:
1. User types a message into `AgentInput`
2. The app calls `http://10.0.2.2:31415/agent/message` via the HTTP bridge client
3. The bridge server invokes Pi CLI and returns a real AI response
4. The response is displayed on the Home screen
5. The entire flow uses real infrastructure (no mock fallback)

## Constraints

1. **Safe Mode** must remain functional and ON by default
2. **Permission broker** must not be bypassed
3. No app-launcher behavior added
4. Android emulator networking uses `10.0.2.2` to reach host
5. Bridge server binds to `127.0.0.1:31415` by default
6. Pi CLI invoked with `--no-tools --no-extensions --no-skills --no-session` by default (safe, read-only)
7. Mock fallback in `httpPiBridge.ts` should remain as resilience but NOT be exercised during successful flow
8. Must preserve existing typecheck passing (`npm run typecheck`)

## Invariants

1. `PiBridgeClient` interface contract must not change shape
2. Bridge server endpoints must match the client's expected paths:
   - `GET /health`
   - `POST /agent/message`
   - `GET /agent/tasks`
   - `POST /agent/approve`
   - `POST /agent/reject`
   - `GET /agent/audit`
   - `GET /scheduler/jobs`
3. `POST /agent/message` response shape must parse correctly through `normalizeAgentTurn()`
4. Android emulator must be able to reach `10.0.2.2:31415`
5. Pi CLI must be installed and functional at the expected path

## Success Criteria

1. ✅ Bridge server starts without errors on `npm run bridge`
2. ✅ `GET /health` returns HTTP 200 with bridge metadata
3. ✅ `POST /agent/message` with a simple prompt returns HTTP 200 with `reply.text` containing Pi's real output (not mock)
4. ✅ Bad input (`message: ""`) returns HTTP 400 (not mock fallback)
5. ✅ `npm run typecheck` passes after any changes
6. ✅ Android emulator is reachable and the app can be launched
7. ✅ **Primary**: User sends a message through the Nen Shell UI and sees a real Pi Code response displayed

## Key Artifacts

| File | Status | Role |
|------|--------|------|
| `src/bridge/httpPiBridge.ts` | ✅ Implemented | HTTP client with mock fallback |
| `src/bridge/bridgeClient.ts` | ✅ Imports httpPiBridge | Active bridge export |
| `src/bridge/piBridge.types.ts` | ✅ Contract defined | Type interface |
| `tools/pi-bridge-server/server.cjs` | ✅ Implemented | Bridge server |
| `docs/pi-bridge.md` | ✅ Written | Documentation |
| `package.json` (bridge script) | ✅ `"bridge"` script present | Runner |

## Ambiguities

1. **Pi CLI path**: Server defaults to `%APPDATA%/npm/node_modules/@mariozechner/pi-coding-agent/dist/cli.js`. Need to verify this path exists.
2. **Pi CLI arguments**: Uses `--provider google-gemini-cli --model gemini-2.5-flash`. Need to verify this provider/model combo is installed and working.
3. **Android emulator state**: Need to verify emulator `NenShell_API35` is available and bootable.
4. **Expo/Metro**: Need to verify the Expo dev server starts correctly and the app can run.

## Routing Decision

**recommended_next_step: PLAN**

This task benefits from a structured plan that sequences verification steps and identifies likely failure points before execution. Risk of skip-to-execute: high — untested infrastructure crossing Node.js child_process, Pi CLI installation, Android emulator networking, and Expo dev server is brittle. Plan first.

## Clarification Questions

None — the HANDOFF.md and pi-bridge.md are thorough.
