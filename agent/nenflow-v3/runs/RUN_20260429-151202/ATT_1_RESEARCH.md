---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260429-151202
context_saturation_estimate: "~18%"
---

## Investigation Scope
Investigated the existing Nen Shell bridge contract/client, repo scripts/dependencies, installed `pi` CLI non-interactive surface, safe invocation options, required local bridge endpoints, and Android emulator reachability to host port `31415`. No repo code was modified.

## Key Findings
- Active app bridge is already HTTP-backed: `src/bridge/bridgeClient.ts` exports `httpPiBridge`; `src/bridge/httpPiBridge.ts` defaults to `http://10.0.2.2:31415` and falls back to `mockPiBridge` on network errors, non-2xx, invalid JSON, or malformed chat payloads.
- Required chat response shape is enforced by `normalizeAgentTurn()` in `src/bridge/httpPiBridge.ts`: root object must contain `reply.text` as a string. The client then normalizes/fills `reply.id`, `reply.role`, `summary`, `created_at`, `createdAt`, plus `suggestedActions` and `auditEntries` arrays.
- App contract remains `src/bridge/piBridge.types.ts`: endpoints expected are `GET /health`, `POST /agent/message`, `GET /agent/tasks`, `POST /agent/approve`, `POST /agent/reject`, `GET /agent/audit`, `GET /scheduler/jobs`.
- `package.json` has no bridge script and no server dependency (no Express). It is suitable for a no-dependency Node server using built-ins (`node:http`, `node:child_process`, `node:crypto`). Repo is not ESM (`package.json` has no `type`), so a `.cjs` bridge server is the lowest-friction implementation. `npm run typecheck` currently passes.
- Installed CLI surface: `pi --help` confirms `pi -p/--print` non-interactive mode, `--no-session`, `--no-tools`, `--tools`, `--no-extensions`, `--no-skills`, `--no-context-files`, and `--mode text|json|rpc`.
- Safe/non-interactive invocation works: `pi --no-tools --no-extensions --no-skills --no-prompt-templates --no-themes --no-context-files --no-session -p "Reply with exactly: minimal-check"` exits `0`, prints only `minimal-check` to stdout, and no stderr. With only `--no-tools --no-session`, a local extension printed `[playwright-mcp] Registered...` to stderr, so disabling extensions is cleaner for server use.
- `--mode json` emits event-stream JSON lines plus possible stderr noise; text mode is easier for bridge v1. If JSON mode is used, the server must parse `message_end`/`turn_end` events and ignore stderr.
- Pi executable paths exist at `C:/Users/doner/AppData/Roaming/npm/pi` and `pi.cmd`; shell `which pi` resolves to the npm shim.
- Android emulator is running (`adb devices`: `emulator-5554 device`). `10.0.2.2` is the correct host alias; `adb shell nc -z 10.0.2.2 31415` currently fails when no server is listening. A temporary host Node server was reachable from the emulator when bound to either `127.0.0.1:31415` or `0.0.0.0:31415` (`nc_exit:0` for both).

## Constraints Identified
- Do not rely on mock fallback for success: direct `POST /agent/message` must return a real Pi CLI-derived `reply.text`.
- Because app `sendAgentMessage()` catches bridge failures and falls back to mock, validation should inspect direct curl response and/or include an audit marker from the server (e.g. `title: "Pi CLI invoked"`) so a real bridge response is distinguishable in the UI.
- Safe default Pi invocation should prevent phone-triggered file mutation: use `--no-tools --no-session --no-extensions --no-skills --no-prompt-templates --no-themes --no-context-files` by default. Expose env config only for explicit opt-in to tools/model/provider/system prompt.
- `BridgeHealth.status` currently accepts only `'mock-online' | 'offline' | 'degraded'`; a true `'online'` value would be normalized to `degraded` unless the app type/normalizer is extended. For bridge-only implementation, return one of the existing values or plan a careful app enum extension.
- Since no `@types/node` dev dependency exists, a TypeScript server would require dependency/config changes. A CommonJS `.cjs` server avoids this.

## Existing Patterns
- `docs/pi-bridge.md` already documents the app-side base URL, Android emulator `10.0.2.2` rule, endpoint list, and minimal chat request/response, but states the real server is future work.
- Suggested actions from bridge responses flow through the existing reducer into approval tasks; Safe Mode/permission broker (`src/permissions/*`) blocks risky send/file/system/root approvals. The bridge server should not execute approvals as real side effects in v1; it can record/echo decisions.
- Mock bridge response shape in `src/bridge/mockPiBridge.ts` is a good template: `reply`, `suggestedActions`, `auditEntries`, plus separate task/audit/scheduler placeholder endpoints.

## Recommended Implementation Shape
- Add `tools/pi-bridge-server/server.cjs` using only Node built-ins.
- Add `npm run bridge` script, e.g. `node tools/pi-bridge-server/server.cjs`.
- Server config via env: `PI_BRIDGE_HOST` (default can be `127.0.0.1` for safer emulator reachability, or `0.0.0.0` to satisfy broader host reachability), `PI_BRIDGE_PORT=31415`, `PI_BRIDGE_PI_COMMAND=pi`, optional `PI_BRIDGE_PI_ARGS`/`PI_BRIDGE_TOOLS`/`PI_BRIDGE_MODEL` for explicit advanced opt-in.
- `POST /agent/message`: validate JSON body and non-empty `message`; spawn `pi` with safe default args in text mode; set cwd to repo root; enforce timeout; capture stdout as `reply.text`; return normalized shape with empty `suggestedActions` by default and an audit entry proving Pi CLI invocation. On CLI failure/timeout, return a non-2xx JSON error for direct validation rather than mock data.
- Placeholder endpoints: return JSON-compatible empty/task/audit/scheduler structures that the existing client normalizers accept. Approval/rejection endpoints should echo `{ taskId, status, message }` with no external side effects.
- Include docs update showing two terminals: `npm run bridge`, `npm run android`, plus host/emulator smoke tests.

## Risks
- App fallback can mask server failure in UI; direct curl and audit marker are important. Planner may consider changing chat fallback behavior later, but bridge v1 can succeed without app code changes if Pi returns 200.
- `pi` calls can be slow/costly and concurrent phone taps can spawn multiple model calls. Server should serialize or cap concurrent `/agent/message` requests and apply a timeout.
- Binding to `0.0.0.0` exposes the bridge beyond the emulator/LAN firewall boundary. Binding `127.0.0.1` was empirically reachable via emulator `10.0.2.2` here and is safer; physical-phone testing needs LAN bind/IP.
- If advanced env enables mutation tools, phone-originated prompts could alter files. Keep mutation tools disabled unless explicit.

## Validation Commands
```bash
# current baseline
cd C:/Users/doner/nen-shell
npm run typecheck

# after implementation, terminal 1
npm run bridge

# host health
curl -sS http://127.0.0.1:31415/health

# host chat smoke: should include real Pi CLI text in .reply.text, not mock wording
curl -sS -X POST http://127.0.0.1:31415/agent/message \
  -H 'Content-Type: application/json' \
  -d '{"message":"Reply with exactly: nen-shell-bridge-live","context":{}}'

# emulator TCP reachability to host bridge
adb shell 'nc -z 10.0.2.2 31415 >/dev/null 2>&1; echo nc_exit:$?'

# optional emulator HTTP if a curl-capable image/tool is available
adb shell 'curl -sS http://10.0.2.2:31415/health'
```
