---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260429-151202
context_saturation_estimate: "~15%"
---

## Task Statement
Build the real local Nen Shell Pi bridge server so the Android app's existing HTTP bridge (`http://10.0.2.2:31415`) reaches a host-side process that invokes the installed `pi` CLI for `POST /agent/message` and returns chat-shaped JSON. This must prove real Pi output, not mock fallback, while preserving the app's no-launcher and Safe Mode/permission-broker safety invariants.

## Invariants
- Work in `C:/Users/doner/nen-shell` for repo changes.
- Do not implement app-launcher behavior or any phone-triggered real actuator for opening apps, sending messages, mutating files, system changes, or root commands.
- Preserve Safe Mode and the existing permission broker (`src/permissions/permissionBroker.ts`, `src/permissions/safetyPolicy.ts`).
- Preserve `src/bridge/piBridge.types.ts` and `src/bridge/bridgeClient.ts` unless absolutely necessary; `bridgeClient.ts` should keep exporting `httpPiBridge`.
- Do not count `mockPiBridge` fallback as success. Direct `curl` to the server must prove real `pi` CLI invocation.
- No new runtime dependencies. Use a no-dependency Node CommonJS server with Node built-ins only.
- Default Pi invocation must be non-interactive and non-mutating: tools/extensions/skills/prompt templates/themes/context files disabled unless env explicitly opts in.
- Approval/rejection endpoints in bridge v1 record/echo only; no external side effects.

## Success Criteria
1. `tools/pi-bridge-server/server.cjs` exists and runs with Node CJS built-ins only.
2. `package.json` has `"bridge": "node tools/pi-bridge-server/server.cjs"` without adding dependencies.
3. `npm run bridge` listens on port `31415` and is reachable from the emulator via `10.0.2.2:31415`.
4. Server exposes JSON endpoints: `GET /health`, `POST /agent/message`, `GET /agent/tasks`, `POST /agent/approve`, `POST /agent/reject`, `GET /agent/audit`, `GET /scheduler/jobs`.
5. `POST /agent/message` invokes real installed `pi` in print/non-interactive mode and returns root `reply.text` plus `suggestedActions` and `auditEntries` arrays.
6. Pi failure, timeout, empty output, bad input, or bridge-busy returns non-2xx JSON error, never mock success.
7. Docs explain bridge + Expo/emulator run and validation.
8. `npm run typecheck` passes.
9. No app launcher/safety behavior is changed.

## Implementation Steps

### 1. Add the bridge server
Create `C:/Users/doner/nen-shell/tools/pi-bridge-server/server.cjs`.

Use CommonJS built-ins only: `node:http`, `node:child_process`, `node:path`, optionally `node:crypto`. Compute `repoRoot = path.resolve(__dirname, '..', '..')` and run Pi with that `cwd`.

Configuration:
- `PI_BRIDGE_HOST`: default `127.0.0.1`. Research showed emulator `10.0.2.2` reaches this; document `PI_BRIDGE_HOST=0.0.0.0` for LAN/physical phone testing.
- `PI_BRIDGE_PORT`: default `31415`.
- `PI_BRIDGE_PI_COMMAND`: default `pi`; if direct Windows spawn is unreliable, use `pi.cmd`. Use `spawn(command, args, { cwd: repoRoot, shell: process.platform === 'win32' })` for npm shim compatibility.
- `PI_BRIDGE_TIMEOUT_MS`: default `120000`.
- `PI_BRIDGE_MAX_BODY_BYTES`: default `65536`.
- `PI_BRIDGE_MAX_CONCURRENT`: default `1`.
- `PI_BRIDGE_SYSTEM_PROMPT`: optional default instruction: reply to Nen Shell in plain text, do not perform external actions or mutate files.
- Explicit unsafe opt-ins: `PI_BRIDGE_ALLOW_TOOLS=1`, `PI_BRIDGE_ALLOW_EXTENSIONS=1`, `PI_BRIDGE_ALLOW_SKILLS=1`, `PI_BRIDGE_ALLOW_CONTEXT_FILES=1`, plus optional JSON-array extra args such as `PI_BRIDGE_EXTRA_PI_ARGS_JSON='["--some-flag"]'`.

Add small helpers: ISO time, JSON response writer, JSON body reader with size limit, ID maker, text shortener, bounded in-memory audit store.

### 2. Implement endpoint behavior
Match the app normalizers in `src/bridge/httpPiBridge.ts`.

- `GET /health`: return HTTP 200 JSON with app-compatible `status: "degraded"` (the type currently allows only `mock-online | offline | degraded`), `transport: "http"`, `endpointBase`, `checkedAt`, `latencyMs`, and optional diagnostic fields like `piCommand` and `safeDefaults`. Do not add an `online` enum unless updating all related app types/normalizers deliberately; it is not needed.

- `POST /agent/message`:
  - Parse JSON; accept `message` primarily and optional `text` for compatibility.
  - Blank/missing message -> HTTP 400 JSON error `{ error: { code: "bad_request", message: "message is required" } }`.
  - If active Pi processes >= `PI_BRIDGE_MAX_CONCURRENT`, return HTTP 429 `bridge_busy`; do not queue unbounded requests.
  - Build safe default args:
    ```text
    --mode text
    --no-tools
    --no-extensions
    --no-skills
    --no-prompt-templates
    --no-themes
    --no-context-files
    --no-session
    -p <prompt>
    ```
    Omit a `--no-*` only when the matching explicit env opt-in is set. Append validated JSON-array extra args before `-p` only if configured.
  - Prompt may wrap the user text with the safe system instruction, but must still allow smoke input `Reply with exactly: nen-shell-bridge-live` to return that visible token.
  - Spawn the real `pi` command, capture stdout/stderr, enforce timeout, and kill the child on timeout.
  - Success requires non-empty trimmed stdout. Return HTTP 200:
    ```json
    {
      "reply": {
        "id": "reply_...",
        "role": "assistant",
        "text": "<pi stdout>",
        "summary": "<short summary>",
        "created_at": "...",
        "createdAt": "..."
      },
      "suggestedActions": [],
      "auditEntries": [
        {
          "id": "audit_...",
          "category": "summary",
          "title": "Pi CLI invoked",
          "detail": "pi -p completed in <N>ms with safe defaults enabled.",
          "source": "Pi Code",
          "createdAt": "..."
        }
      ]
    }
    ```
  - Store that audit entry for `GET /agent/audit`.
  - Non-zero exit -> HTTP 502 JSON error with exit status, duration, and clipped stdout/stderr.
  - Timeout -> HTTP 504 JSON error and `failure` audit entry.
  - Empty stdout -> HTTP 502 `empty_output`.

- `GET /agent/tasks`: return `{ "tasks": [] }`; do not invent mock tasks.
- `POST /agent/approve`: parse optional body, return `{ "taskId": "<body id/taskId or unknown>", "status": "approved", "message": "Bridge approval recorded locally. No external side effect was executed." }`, and record approval audit only.
- `POST /agent/reject`: same shape with `status: "rejected"`, rejection audit only.
- `GET /agent/audit`: return `{ "auditEntries": [...] }` from in-memory store; empty array is valid.
- `GET /scheduler/jobs`: return `{ "heartbeatAt": "...", "status": "steady", "jobs": [] }`.
- Unknown path -> HTTP 404 JSON error. Wrong method -> HTTP 405 JSON error with `Allow` header where straightforward. Optional `OPTIONS` 204/CORS is acceptable for debugging.

### 3. Update npm scripts
Edit `C:/Users/doner/nen-shell/package.json` and add:
```json
"bridge": "node tools/pi-bridge-server/server.cjs"
```
Keep existing scripts unchanged and do not add dependencies/devDependencies.

### 4. Update docs
Edit `C:/Users/doner/nen-shell/docs/pi-bridge.md`:
- Replace the "Server status" future-work note with real server instructions.
- Document two terminals: `npm run bridge`, then `npm run android` or `npx expo start --android --port 8082` if Metro 8081 is busy.
- Keep default app URL `http://10.0.2.2:31415`.
- Explain host bind default, `PI_BRIDGE_HOST=0.0.0.0` for LAN/physical phone, safe Pi defaults, and explicit unsafe env opt-ins.
- Include direct host curl tests and emulator `adb shell nc` reachability.
- Warn that app fallback can mask bridge failures; direct curl is the authoritative no-mock proof.

### 5. Preserve app safety
Do not modify `App.tsx`, navigation, launch intents, manifests, `src/permissions/*`, or `src/bridge/bridgeClient.ts`. Do not remove `mockPiBridge`; it remains an offline fallback, but validation must not rely on it. Prefer no changes to `src/bridge/piBridge.types.ts` or `src/types/domain.ts`; server `/health` can use `degraded` to fit the current type.

## Validation Commands
Run from `C:/Users/doner/nen-shell` after implementation.

1. Typecheck:
   ```bash
   npm run typecheck
   ```

2. Confirm direct Pi CLI safe mode:
   ```bash
   pi --no-tools --no-extensions --no-skills --no-prompt-templates --no-themes --no-context-files --no-session -p "Reply with exactly: pi-cli-live"
   ```
   Expected: stdout contains `pi-cli-live` without interaction.

3. Start bridge in terminal 1:
   ```bash
   npm run bridge
   ```
   Expected: listening on `127.0.0.1:31415` unless env overrides host/port.

4. Host health:
   ```bash
   curl -sS http://127.0.0.1:31415/health
   ```
   Expected: JSON with `transport: "http"` and app-compatible status, likely `degraded`.

5. Host chat smoke proving real Pi invocation:
   ```bash
   curl -sS -X POST http://127.0.0.1:31415/agent/message \
     -H 'Content-Type: application/json' \
     -d '{"message":"Reply with exactly: nen-shell-bridge-live","context":{}}'
   ```
   Expected: HTTP 200 JSON where `reply.text` visibly contains `nen-shell-bridge-live`, `suggestedActions` is an array, and an audit entry title is `Pi CLI invoked`. This is the primary no-mock proof.

6. Error behavior:
   ```bash
   curl -i -sS -X POST http://127.0.0.1:31415/agent/message \
     -H 'Content-Type: application/json' \
     -d '{"message":""}'
   ```
   Expected: non-2xx JSON error, not mock output.

7. Emulator reachability while bridge is running:
   ```bash
   adb devices
   adb shell 'nc -z 10.0.2.2 31415 >/dev/null 2>&1; echo nc_exit:$?'
   ```
   Expected: `nc_exit:0`. If the image lacks `nc`, document that and use any available emulator HTTP tool, e.g.:
   ```bash
   adb shell 'curl -sS http://10.0.2.2:31415/health'
   ```

8. Optional app run:
   ```bash
   npm run android
   # if Metro 8081 is occupied:
   npx expo start --android --port 8082
   ```
   In-app chat should render Pi-derived text. Because fallback can hide server failure, direct curl remains authoritative.

## Handoff Notes
- Research confirmed `pi -p` works non-interactively with safe flags and the installed CLI is available via shell `pi` / `C:/Users/doner/AppData/Roaming/npm/pi(.cmd)`.
- The app already targets `http://10.0.2.2:31415`; the server only needs to satisfy the existing JSON contract.
- `reply.text` is the one required chat field; the client fills some missing reply metadata, but the server should return full metadata plus arrays for clarity.
- `BridgeHealth.status` lacks `online`; return `degraded` from `/health` to avoid app type changes.
- Bridge v1 should be conservative: chat invokes Pi text output; approval/rejection/task/scheduler endpoints are local placeholders with no side effects.
- Split for two executors if useful:
  - Executor A: `tools/pi-bridge-server/server.cjs`, `package.json`, host curl validation.
  - Executor B: `docs/pi-bridge.md`, emulator/app validation, final typecheck.
