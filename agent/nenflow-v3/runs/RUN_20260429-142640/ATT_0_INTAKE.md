---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260429-142640
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~8%"
---

# Task Summary
Read `C:/Users/doner/nen-shell/HANDOFF.md` as the operational handle and begin the first concrete movement toward linking Nen Shell with real Pi Code / pycode so the app receives proper chat-flow output instead of only mock bridge responses.

# Task Type
Code implementation with orchestration. The plan must be shaped so execution can be split across two executor subagents, either in parallel or sequentially.

# User Intent
The user wants practical progress, not just analysis: add the first real local bridge integration path for chat output. The intended immediate implementation is an HTTP bridge client for the Expo / React Native app that can call a local bridge service and preserve a mock fallback.

# Goal Attractor
A typechecked Expo TypeScript codebase where the existing Home chat flow can call a real local HTTP Pi bridge endpoint via the existing `PiBridgeClient` contract, receiving assistant replies in the expected shape. The mock bridge remains available as resilience/fallback. No app-launcher behavior is introduced.

# Constraints
- Work in `C:/Users/doner/nen-shell`.
- Preserve the product invariant: Nen Shell is not an app launcher. Do not add Gmail/Telegram/Calendar open buttons or app grids.
- Preserve Safe Mode and permission broker behavior.
- Existing UI vertical slice calls `piBridge.sendAgentMessage({ message, context: {} })`; do not break this call path.
- The bridge contract is defined in `src/bridge/piBridge.types.ts`.
- Current active bridge export is `src/bridge/bridgeClient.ts`.
- Recommended next implementation from HANDOFF: add `src/bridge/httpPiBridge.ts` using fetch against a local bridge URL, with Android emulator host URL `http://10.0.2.2:<port>`.
- Keep `mockPiBridge` available as fallback.
- Run `npm run typecheck` after changes.
- Context-health instruction: any subagent whose context-health estimate rises above 40% should be replaced by a new subagent for the next unit of work.

# Invariants
- `PiBridgeClient` interface remains the contract for app-side bridge integrations.
- App chat flow continues: AgentInput -> HomeScreen -> `actions.sendMessage` -> `piBridge.sendAgentMessage` -> reducer success -> reply displayed and suggested actions queued.
- Response shape must include reply fields expected by the state/UI (`id`, `role: assistant`, `text`, `summary`, `created_at`, `createdAt`) and arrays for `suggestedActions` and `auditEntries`.
- Approval/rejection and safety/audit flows remain intact.

# Success Criteria
- A concrete HTTP bridge client exists and implements all `PiBridgeClient` methods.
- `src/bridge/bridgeClient.ts` exports the HTTP bridge client rather than the mock-only client, while preserving fallback behavior.
- Network failures or malformed/partial responses do not break the UI; the client can fall back to mock behavior.
- Android emulator host note is encoded in defaults or comments/config.
- `npm run typecheck` passes.
- Executor reports include what changed, validation evidence, and whether additional pycode server work remains.

# Ambiguities
- The exact local bridge server/pycode process and port are not yet present in the handoff. Use a reasonable default and make it easy to configure.
- Whether to implement the backend bridge server in this first movement is uncertain; the handoff specifically recommends the app-side HTTP client as the next step.

# Routing Decision
Proceed directly to PLAN. Separate RESEARCH is not required because the handoff, existing memory, and graph artifacts provide enough constraints for the first implementation movement. The planner should produce a two-lane execution plan suitable for two executor subagents:

- Executor A: inspect bridge types/mock usage and implement `src/bridge/httpPiBridge.ts` plus bridge export wiring.
- Executor B: inspect validation/docs/config needs, run typecheck, and adjust/fix integration issues. If executed sequentially, B verifies and hardens A's output. If executed in parallel, B can prepare validation expectations and then re-run after A lands changes.

# Clarification Questions
None required before beginning.
