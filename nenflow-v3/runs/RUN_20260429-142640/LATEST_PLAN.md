---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260429-142640
context_saturation_estimate: "~16%"
---

## Task Statement
Add the first real app-side path from Nen Shell to local Pi Code / pycode chat output. Implement an HTTP `PiBridgeClient` in the Expo React Native app, wire `piBridge` to it, and keep mock fallback so the current Home chat flow still works without a running server.

## Invariants
- Work in `C:/Users/doner/nen-shell`.
- Do not turn Nen Shell into an app launcher: no open-app buttons, app grids, `Linking.openURL`, or Gmail/Telegram/Calendar destination UI.
- Preserve Safe Mode and permission broker behavior in `src/permissions/safetyPolicy.ts`, `src/permissions/permissionBroker.ts`, and the approval flow in `src/state/NenShellContext.tsx`.
- Keep `PiBridgeClient` in `src/bridge/piBridge.types.ts` as the bridge contract.
- Preserve the current chat path: `AgentInput/HomeScreen` -> `actions.sendMessage` -> `piBridge.sendAgentMessage({ message: clean, context: {} })` -> reducer success -> reply displayed and actions queued.
- `sendAgentMessage` must return an assistant reply with `id`, `role: 'assistant'`, `text`, `summary`, `created_at`, `createdAt`, plus array `suggestedActions` and `auditEntries`.
- Keep `mockPiBridge` usable as fallback.
- Do not implement a backend bridge server in this movement.
- Context-health guard: any executor estimating context health above 40% must finish the current atomic unit, stop, and ask for a fresh executor for the next unit.

## Success Criteria
1. `src/bridge/httpPiBridge.ts` exists and exports `httpPiBridge` implementing all `PiBridgeClient` methods.
2. `src/bridge/bridgeClient.ts` exports `httpPiBridge`, not mock-only `mockPiBridge`.
3. HTTP method/path mapping exists for `GET /health`, `POST /agent/message`, `GET /agent/tasks`, `POST /agent/approve`, `POST /agent/reject`, `GET /agent/audit`, and `GET /scheduler/jobs`.
4. Offline bridge, non-2xx responses, invalid JSON, and malformed/partial chat responses do not crash the UI; methods return mock fallback or degraded health.
5. Android emulator host URL `http://10.0.2.2:<port>` is encoded as the default or documented near config; physical-phone LAN-IP alternative is noted.
6. Safe Mode still blocks risky send/file/system/root actions through the existing approval flow.
7. `npm run typecheck` passes.
8. Executor reports list changed files, validation evidence, and remaining pycode server work.

## Implementation Steps

### Split points
- Preferred: Executor A first, Executor B second.
- If simultaneous: B may inspect and prepare validation/docs, but must not edit `src/bridge/httpPiBridge.ts` or `src/bridge/bridgeClient.ts` until A lands changes; B must re-read A's files before fixing.

### Executor A: bridge client implementation/wiring
1. Read before editing: `HANDOFF.md`, `src/bridge/piBridge.types.ts`, `src/bridge/mockPiBridge.ts`, `src/bridge/bridgeClient.ts`, `src/types/domain.ts`, `src/state/NenShellContext.tsx`.
2. Create `src/bridge/httpPiBridge.ts`.
3. Import `mockPiBridge`, bridge types, needed domain types, and `makeId`/`nowIso` for normalization.
4. Add a default base URL such as `const DEFAULT_PI_BRIDGE_BASE_URL = 'http://10.0.2.2:31415';` with a comment: Android emulator uses `10.0.2.2` for the Windows host; physical devices need the host LAN IP. Avoid `process.env` if strict TypeScript typings complain.
5. Add helpers:
   - URL join helper for base URL + endpoint path.
   - `fetchJson` helper using global `fetch`, JSON headers, optional JSON body, non-2xx rejection, and `unknown` return type.
   - Narrow type guards/normalizers; do not trust raw JSON as typed.
6. Normalize `sendAgentMessage` responses:
   - Require an object with `reply.text` string; otherwise call `mockPiBridge.sendAgentMessage(input)`.
   - Force `reply.role` to `'assistant'`.
   - Fill missing `reply.id` with `makeId('reply')`.
   - Fill missing `summary`, `created_at`, and `createdAt` using response values or `nowIso()`.
   - Ensure `suggestedActions` and `auditEntries` are arrays; filter/default invalid entries instead of throwing.
7. Implement all `PiBridgeClient` methods:
   - `getHealth`: `GET /health`; return normalized `BridgeHealth` with `transport: 'http'`, endpoint base, checked time, latency. On failure return non-throwing degraded/offline health or mock health.
   - `sendAgentMessage`: `POST /agent/message` with `{ message, context }`; fallback to `mockPiBridge.sendAgentMessage(input)` on any failure/malformed result.
   - `getAgentTasks`: `GET /agent/tasks`; fallback to mock.
   - `approveAgentTask`: `POST /agent/approve`; fallback to mock.
   - `rejectAgentTask`: `POST /agent/reject`; fallback to mock.
   - `getAgentAudit`: `GET /agent/audit`; fallback to mock.
   - `getSchedulerSnapshot`: `GET /scheduler/jobs`; fallback to mock.
   - `approveAction`/`rejectAction`: delegate to approval/rejection methods.
8. Update `src/bridge/bridgeClient.ts` to:
   - `import { httpPiBridge } from './httpPiBridge';`
   - `export const piBridge = httpPiBridge;`
   - Optional comment: HTTP client contains mock fallback.
9. Do not alter permission files, reducer flow, or UI screens unless a type error directly requires it.
10. If context health allows, run `npm run typecheck` and pass any errors to Executor B.

### Executor B: validation, hardening, typecheck fixes, docs/config notes
1. Re-read A's changed files: `src/bridge/httpPiBridge.ts`, `src/bridge/bridgeClient.ts`, and any touched type/domain file.
2. Run `npm run typecheck`.
3. Fix TypeScript errors while keeping signatures exact. Prefer `unknown` + guards over `any`; avoid `@ts-ignore`; remove fragile env access if it causes missing `process` typings.
4. Harden these cases:
   - Server offline -> chat returns mock reply/actions/audit.
   - Non-2xx or invalid JSON -> no uncaught exception from public bridge methods.
   - Partial chat reply -> missing id/timestamps/summary are filled or call falls back.
   - Risky actions from HTTP still enter approval queue and are blocked by Safe Mode when approved.
5. Add concise docs/config notes. Preferred: create `docs/pi-bridge.md` with default URL, Android `10.0.2.2` rule, physical-phone LAN-IP note, expected endpoints, minimal `POST /agent/message` request/response, and note that app-side client exists but real pycode/Pi Code server remains future work. If not creating docs, ensure equivalent comments are near the base URL.
6. Confirm no app-launcher behavior was introduced; search changed files for `Linking`, `openURL`, or open-button patterns.
7. Run final `npm run typecheck` and record evidence.
8. Report changed files, typecheck result, fallback behavior, and remaining server-side work.

## Handoff Notes
- Required handoff source was read: `C:/Users/doner/nen-shell/HANDOFF.md`.
- Current active bridge is `src/bridge/bridgeClient.ts`, currently mock-only.
- Current contract is `src/bridge/piBridge.types.ts`; `SendAgentMessageInput` has `message`, optional `context`, and legacy optional `text`.
- `src/bridge/mockPiBridge.ts` is the fallback reference for output shape and method coverage.
- `BridgeHealth.status` currently allows `'mock-online' | 'offline' | 'degraded'`; prefer normalizing into that union unless a domain change is clearly necessary.
- No repo `docs/` directory currently exists; B may create `docs/pi-bridge.md`.
- Graphify artifacts are in Capati memory, not repo-local `graphify-out/`; inspected bridge/state files are sufficient for this scoped implementation.
