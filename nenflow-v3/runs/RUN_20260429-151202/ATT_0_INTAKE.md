---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260429-151202
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~10%"
---

# Task Summary
Complete the actual local bridge for Nen Shell so Android emulator chat input reaches a real local Pi/Pi Code-backed process and returns visible chat output in the app. Previous work only implemented the app-side HTTP client and mock fallback; that is insufficient.

# Task Type
End-to-end implementation and validation: local HTTP socket/server + Pi CLI invocation + app integration/docs/scripts + proof that `/agent/message` produces a non-mock Pi response.

# User Intent
The user wants to talk to Nen Shell directly through Pi Code from the Android emulator. Success is not a typecheck-only or mock-fallback result. It must complete the socket that the app client already points at (`http://10.0.2.2:31415`) and produce real chat output.

# Goal Attractor
A runnable local bridge server in the repo, started from an npm script, listening on host port 31415, exposing the bridge endpoints, and using the installed `pi` CLI in non-interactive mode for `POST /agent/message`. The app-side Android emulator URL `10.0.2.2:31415` should hit this server, receive a normalized chat response, and render it in Nen Shell.

# Constraints
- Work in `C:/Users/doner/nen-shell`.
- Preserve the app invariant: Nen Shell must not become an app launcher.
- Preserve Safe Mode and permission broker behavior.
- Do not count mock fallback as success for chat output.
- A `pi` CLI is installed at `C:/Users/doner/AppData/Roaming/npm/pi(.cmd)` and supports `pi -p` non-interactive output.
- Avoid unsafe phone-triggered file mutation by default. If invoking Pi CLI from the bridge, use safe/default arguments unless explicit environment config opts into tools.
- The app already calls `POST /agent/message` via `src/bridge/httpPiBridge.ts` default base URL `http://10.0.2.2:31415`.
- Need validation commands that can be run locally: bridge health, bridge chat POST, typecheck, and preferably emulator reachability.

# Invariants
- `src/bridge/piBridge.types.ts` remains the app contract.
- `src/bridge/bridgeClient.ts` should continue to point at `httpPiBridge`.
- `sendAgentMessage` response shape must contain assistant reply fields plus `suggestedActions` and `auditEntries` arrays.
- Existing app safety gates remain the mechanism for approval of risky actions.

# Success Criteria
- Repo contains a runnable local bridge server, e.g. under `tools/pi-bridge-server/`.
- `package.json` contains a script to start it, e.g. `npm run bridge`.
- Server binds to `0.0.0.0:31415` or equivalent host-reachable address and exposes at least `/health`, `/agent/message`, `/agent/tasks`, `/agent/approve`, `/agent/reject`, `/agent/audit`, `/scheduler/jobs`.
- `POST /agent/message` invokes real Pi CLI, not `mockPiBridge`, and returns the CLI output as `reply.text`.
- Server has clear error behavior if Pi CLI fails, without pretending mock success.
- Docs explain how to run bridge + Expo + emulator.
- Validation includes `npm run typecheck` and a direct `POST /agent/message` smoke test that returns a real bridge response. If possible, include Android emulator reachability evidence using `10.0.2.2:31415`.

# Ambiguities
- Exact desired Pi CLI arguments for phone chat are not fixed. Default should be safe/non-mutating. Provide environment variables for advanced users to opt into different command/args/model.
- End-to-end UI automation in emulator may be limited, but bridge socket and app client URL should be testable.

# Routing Decision
Use RESEARCH before PLAN to confirm the installed `pi` CLI surface, repo scripts, and feasible local test strategy. Then PLAN and EXECUTE.

# Clarification Questions
None required; proceed with a safe default bridge and document how to run it.
