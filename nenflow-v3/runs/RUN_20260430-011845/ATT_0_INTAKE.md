---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260430-011845
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~85%"
---

# INTAKE — Nen Shell Tool & Model Enablement

## Task Summary

The user wants to extend the Nen Shell Pi bridge to allow:
1. **Model switching from within the mobile app** — the user can select which LLM model the bridge uses
2. **Tool calls enabled** — the model should be able to use Pi Code's built-in tools (`read`, `bash`, `edit`, `write`, `grep`, `find`)
3. **Internet search** — the model should be able to search the web
4. **File changes to Android system** — the model should be able to modify files
5. **Full Pi Code tool parity** — all tools the Pi harness provides should be available

## Task Type

**Capability expansion / bridge reconfiguration.** This is not a new feature from scratch; it's about unlocking capabilities that Pi already supports but the bridge currently disables via `--no-tools`, `--no-extensions`, `--no-skills`, and `--no-context-files` flags.

## User Intent

The user wants Nen Shell to be a full-fidelity Pi Code client on mobile. Currently the bridge is in "safe mode" with all tools/thinking disabled. The user wants to graduate from safe defaults to full capability, with the ability to switch models dynamically.

## Goal Attractor

A Nen Shell app where:
- The user can select which Pi model/provider to use from within the app UI
- The model responds with full tool-calling capability (read files, run bash, search internet, edit files, etc.)
- The bridge server reconfigures itself per-request or per-session based on app-provided preferences

## Constraints

1. **Safety still matters** — Nen Shell's own `SafeMode` and `permissionBroker` should still gate risky actions on the app side
2. **Bridge server is single-process** — currently `maxConcurrent: 1`, uses one persistent Pi RPC process
3. **Model switching at Pi level** — Pi RPC supports `set_model` command to switch models at runtime
4. **Tool enablement is startup-only** — Pi's `--no-tools` etc. are CLI flags set at process start; enabling tools mid-stream requires restarting the Pi RPC process
5. **Android emulator networking** — `10.0.2.2` reaches host from emulator
6. **Existing bridge contract** — `PiBridgeClient` interface in `src/bridge/piBridge.types.ts` must be preserved; HTTP endpoints must remain compatible

## Invariants

1. App typechecks (`npm run typecheck`) must continue to pass
2. Existing endpoints (`/health`, `/agent/message`, `/agent/tasks`, `/agent/approve`, `/agent/reject`, `/agent/audit`, `/scheduler/jobs`) must continue to work
3. Safe Mode in the app must still block send/file/system/root actions
4. Mock fallback must remain available for offline/degraded mode
5. Bridge server must remain compatible with the Android emulator

## Success Criteria

1. The app can send a model preference (e.g., `model: "openai/gpt-4o"`) to the bridge
2. The bridge reconfigures the Pi RPC process or uses a different process for that model
3. Pi tools are enabled and the model can use `read`, `bash`, `edit`, `write`, `grep`, `find`, `web_search`, `web_fetch`
4. Internet search works end-to-end (app → bridge → Pi → web → response → app)
5. File operations work end-to-end (app → bridge → Pi → file read/write → response → app)
6. Nen Shell typecheck passes

## Ambiguities

1. **Model switching granularity** — per-request or per-session? Pi RPC's `set_model` supports per-request switching, but tool flags (`--no-tools`) are process-level. We need to start Pi without the disabling flags and let the user toggle tools at the app level.

2. **Tool enablement approach** — Should we simply remove all `--no-*` flags from the Pi invocation and let all tools be available? Or should we add per-request tool control?

3. **Internet search mechanism** — Pi has `web_search` and `web_fetch` built-in tools. These require Ollama to be running locally. Is Ollama available? The user already has web_search capability in their Pi configuration.

4. **File change scope** — "file changes to the Android system" — does this mean the Android OS files or files within the app sandbox? On Android, Pi runs on the host (Windows), not on the phone. File changes would be to the host filesystem, not the phone. We should clarify scope but can proceed with host filesystem access first.

5. **Extension/Skill loading** — Pi has extensions and skills (like `nenflow-v3`, `internet-research`). Should these also be made available, or just built-in tools?

## Routing Decision

**SKIP RESEARCH → GO TO PLAN.** The task domain is well-understood: we know Pi's RPC protocol, the bridge architecture, the app's bridge contract, and the Android networking constraints. No external research is needed — this is an implementation task within a known codebase.

## Key Files

- `tools/pi-bridge-server/server.cjs` — bridge server (must be modified to remove `--no-*` flags and add model switching)
- `src/bridge/piBridge.types.ts` — bridge client type definitions (may need model selection added)
- `src/bridge/httpPiBridge.ts` — HTTP bridge client (may need model/config passing)
- `src/screens/HomeScreen.tsx` — where the agent input lives
- `src/components/AgentInput.tsx` — user input component
- `src/state/NenShellContext.tsx` — state management calling piBridge
- `src/permissions/safetyPolicy.ts` — safety constraints
- `docs/pi-bridge.md` — bridge documentation
