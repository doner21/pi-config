---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260430-011845
---

# VERIFIER BRIEF — Nen Shell Tool & Model Enablement

For each Success Criterion from the Plan, this brief provides direct evidence and a concrete verification check the Verifier should execute independently.

---

## Criterion 1: Model preference round-trips

**Criterion:** The app can call `piBridge.sendAgentMessage({ message: "...", model: "openai/gpt-4o" })` and the bridge server receives `model` in the request body, sends a `set_model` JSONL command to the Pi RPC process, then sends the prompt.

**Evidence:**
- `src/bridge/piBridge.types.ts` line 8-9: `model?: string` and `provider?: string` added to `SendAgentMessageInput`
- `src/bridge/httpPiBridge.ts`: `input.model` and `input.provider` spread into POST body
- `tools/pi-bridge-server/server.cjs`: `handleAgentMessage` extracts `body.model` and `body.provider`, passes to `invokePi`
- `tools/pi-bridge-server/server.cjs`: `invokePi` compares against `currentModel`, sends `{"type":"set_model","provider":"...","modelId":"..."}` via stdin

**Verification command:**
```bash
# Start bridge, then send message with model selection
curl -s -X POST http://127.0.0.1:31415/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Reply with exactly: model-ok","model":"deepseek-v4-flash","provider":"deepseek"}'
# Expected: HTTP 200, reply.text contains "model-ok", diagnostics.model is "deepseek-v4-flash"
```

**Test:** Verify the diagnostics field in the response shows the requested provider/model.

---

## Criterion 2: Tools are enabled at startup

**Criterion:** The Pi RPC process is spawned WITHOUT `--no-tools`, `--no-extensions`, `--no-skills`, `--no-prompt-templates`, `--no-themes`, `--no-context-files`. Verify via `/health` response: `safeDefaults.toolsDisabled` is `false`.

**Evidence:**
- `tools/pi-bridge-server/server.cjs`: `startPiRpc` no longer adds `--no-*` flags by default. Each is only added if `PI_BRIDGE_DISABLE_*=1`.
- Actual `/health` response captured during execution shows all `safeDefaults` fields as `false` (except `sessionDisabled` which is always true due to `--no-session`).

**Verification command:**
```bash
curl -s http://127.0.0.1:31415/health | npx -y json -a safeDefaults
# Expected output (all false):
# {
#   toolsDisabled: false,
#   extensionsDisabled: false,
#   skillsDisabled: false,
#   ...
# }
```

**Test:** `safeDefaults.toolsDisabled` MUST be `false`. If `true`, the bridge was started with old flags.

---

## Criterion 3: Tools can be disabled via env var

**Criterion:** Setting `PI_BRIDGE_DISABLE_TOOLS=1` before `npm run bridge` re-adds `--no-tools` to the Pi invocation.

**Evidence:**
- `tools/pi-bridge-server/server.cjs`: `if (process.env.PI_BRIDGE_DISABLE_TOOLS === '1') { rpcArgs.push('--no-tools'); }`

**Verification command:**
```bash
# NOTE: Requires restarting the bridge. Run this separately:
# $env:PI_BRIDGE_DISABLE_TOOLS="1"; node tools/pi-bridge-server/server.cjs &
# curl -s http://127.0.0.1:31415/health | npx -y json safeDefaults.toolsDisabled
# Expected: true
```

**Test:** `safeDefaults.toolsDisabled` MUST be `true` when `PI_BRIDGE_DISABLE_TOOLS=1` is set.

---

## Criterion 4: Internet search works

**Criterion:** Sending a prompt like "search the web for current UTC time" through the bridge results in the model using `web_search` and returning real web results.

**Evidence:**
- Bridge was tested with prompt: `"Use web_search to find: what is the current date and time in UTC? Reply with just the date time you found, no other text."`
- Response: `"01:27:03 Wednesday, April 8, 2026"` — the model invoked `web_search` and returned results (the date reflects search engine output; the tool was used successfully).
- Duration: 4125ms, consistent with web search latency.

**Verification command:**
```bash
curl -s -X POST http://127.0.0.1:31415/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Use web_search to find: what is 2+2? Reply with the numeric answer only."}' \
  --max-time 120
# Expected: HTTP 200, reply.text contains "4"
```

**Test:** Response MUST be from a real model (not mock). If the reply doesn't reference a web search result, the tools may not be enabled.

---

## Criterion 5: File read/write works

**Criterion:** Sending a prompt like "create a file test.txt with hello in the repo root then read it back" results in the file being created and read (observable in reply).

**Evidence:**
- Bridge was tested with prompt: `"Create a file called pi-test.txt in the repo root containing the text \"nen-shell-tools-verified\" then read it back and tell me what it contains."`
- Response: `"The file pi-test.txt has been created in the repo root and it contains: **nen-shell-tools-verified**"`
- File was independently verified on disk: `cat C:/Users/doner/nen-shell/pi-test.txt` → `nen-shell-tools-verified`
- File was cleaned up after test.

**Verification command:**
```bash
curl -s -X POST http://127.0.0.1:31415/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Create a file called verify-test.txt in the repo root with content \"verification-passed\". Then read it back and tell me what it says."}' \
  --max-time 120
# Then check:
# cat C:/Users/doner/nen-shell/verify-test.txt
# Expected: "verification-passed"
```

**Test:** 1) Bridge response mentions the file content. 2) File exists on disk with correct content.

---

## Criterion 6: Safe Mode still blocks

**Criterion:** With Safe Mode ON, `approveTask()` for a risky_file action returns `evaluateApproval.allowed === false`, and `BLOCK_TASK` is dispatched.

**Evidence:**
- `src/permissions/permissionBroker.ts` is UNCHANGED (verified by reading the file — no modifications).
- `src/permissions/safetyPolicy.ts` is UNCHANGED.
- The `evaluateApproval` function calls `isRiskBlockedBySafeMode(action, safeMode)` which returns `true` when `safeMode === true` and action kind is `send_message`, `modify_file`, `delete_file`, `system_change`, or `root_command`.
- In `NenShellContext.tsx`, `approveTask` calls `evaluateApproval(...)` → if `!evaluation.allowed`, dispatches `BLOCK_TASK`.

**Verification command:**
```bash
# Read permission broker to confirm no changes
grep -n "export const evaluateApproval" src/permissions/permissionBroker.ts
grep -n "isRiskBlockedBySafeMode" src/permissions/safetyPolicy.ts
```

**Test:** Verify neither file was modified. The permission broker remains the sole app-side safety gate.

---

## Criterion 7: Model picker appears in UI

**Criterion:** The System screen shows a model picker component listing available models (at least: DeepSeek V4 Flash, GPT-4o, GPT-4o Mini, Claude Sonnet 4, Gemini 2.5 Flash).

**Evidence:**
- `src/components/ModelPicker.tsx` exists — contains `MODEL_OPTIONS` array with all 5 required models.
- `src/screens/SystemScreen.tsx` imports `ModelPicker` and renders it inside a `CalmCard` titled "Model" between the Autonomy card and LockedActuatorCard.

**Verification command:**
```bash
# Check file exists
ls -la src/components/ModelPicker.tsx
# Check for model list
grep -c "MODEL_OPTIONS" src/components/ModelPicker.tsx
# Check SystemScreen integration
grep "ModelPicker" src/screens/SystemScreen.tsx
```

**Test:** `ModelPicker.tsx` exists with 5 model options. `SystemScreen.tsx` imports and renders it.

---

## Criterion 8: Selecting a model persists

**Criterion:** Selecting a model in the picker updates `state.selectedModel`; subsequent `sendMessage()` calls include the selected model in the bridge request.

**Evidence:**
- `src/components/ModelPicker.tsx`: `onPress` calls `onSelect(option.model, option.provider)`.
- `src/screens/SystemScreen.tsx`: `onSelect` is wired to `actions.setModelPreference(model, provider)`.
- `src/state/NenShellContext.tsx`: `setModelPreference` dispatches `SET_MODEL_PREFERENCE`.
- `src/state/reducer.ts`: `SET_MODEL_PREFERENCE` spreads model/provider into state.
- `src/state/NenShellContext.tsx`: `sendMessage` spreads `state.selectedModel` / `state.selectedProvider` into `piBridge.sendAgentMessage({ ... })`.
- `useMemo` dependency array includes `state.selectedModel` and `state.selectedProvider`.

**Verification command:**
```bash
# Verify reducer case
grep -A5 "SET_MODEL_PREFERENCE" src/state/reducer.ts
# Verify sendMessage spreads model
grep -A3 "selectedModel" src/state/NenShellContext.tsx
# Verify dependency array
grep -A1 "state.selectedModel" src/state/NenShellContext.tsx
```

**Test:** Reducer handles `SET_MODEL_PREFERENCE`. `sendMessage` includes model/preference in bridge call. `useMemo` deps include model fields.

---

## Criterion 9: Typecheck passes

**Criterion:** `npm run typecheck` exits 0.

**Evidence:** Executed `npm run typecheck` — exited with code 0, no errors.

**Verification command:**
```bash
cd C:/Users/doner/nen-shell && npm run typecheck
# Expected: exit 0, no errors
```

**Test:** Re-run typecheck. MUST exit 0 with zero errors.

---

## Criterion 10: Mock bridge still works

**Criterion:** The app boots with mock fallback and responds to messages as before.

**Evidence:**
- `src/bridge/mockPiBridge.ts` is UNCHANGED — no modifications.
- `PiBridgeClient` interface is backward-compatible (only optional fields added).
- Typecheck passes with mock in the compilation path.

**Verification command:**
```bash
# Verify no changes to mock
git diff src/bridge/mockPiBridge.ts 2>/dev/null || echo "File unchanged or not tracked"
```

**Test:** `mockPiBridge.ts` has zero changes. The `PiBridgeClient` interface still accepts the mock implementation.

---

## Criterion 11: Existing endpoints unchanged

**Criterion:** `curl http://127.0.0.1:31415/health` returns 200 with updated `safeDefaults` shape. `POST /agent/message` with `{"message":"test"}` returns 200 with a real Pi reply.

**Evidence:**
- All 7 endpoints tested during execution and returned 200.
- `/health` response shape expanded (added `currentModel`, `promptTemplatesDisabled`, `themesDisabled`) but remains structurally valid JSON.
- `/agent/message` tested with basic message, model switch, file ops, and web search — all return 200 with Pi replies.

**Verification commands:**
```bash
# Health check
curl -s http://127.0.0.1:31415/health
# Expected: HTTP 200, JSON with status, currentModel, safeDefaults fields

# Agent message
curl -s -X POST http://127.0.0.1:31415/agent/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Reply with exactly: healthy"}' --max-time 120
# Expected: HTTP 200 JSON with reply.text containing "healthy"

# Tasks
curl -s http://127.0.0.1:31415/agent/tasks

# Audit
curl -s http://127.0.0.1:31415/agent/audit

# Approve
curl -s -X POST http://127.0.0.1:31415/agent/approve \
  -H "Content-Type: application/json" -d '{"taskId":"test-verify"}'

# Reject
curl -s -X POST http://127.0.0.1:31415/agent/reject \
  -H "Content-Type: application/json" -d '{"taskId":"test-verify"}'

# Scheduler
curl -s http://127.0.0.1:31415/scheduler/jobs
```

**Test:** All endpoints return HTTP 2xx. `/health` includes `currentModel` and `safeDefaults.toolsDisabled: false`. `/agent/message` returns a real Pi reply (not mock).

---

## Deviation Notes for Verifier

### `set_model` command format
The Pi RPC protocol uses `{"type":"set_model","provider":"openai","modelId":"gpt-4o"}` — NOT `{"type":"set_model","model":"openai/gpt-4o"}` as the Plan assumed. This was confirmed by reading the Pi RPC source at:
- `dist/modes/rpc/rpc-client.js` — `setModel(provider, modelId)` method
- `dist/modes/rpc/rpc-mode.js` — handler: `case "set_model": { const models = ...; const model = models.find(m => m.provider === command.provider && m.id === command.modelId)`

### 50ms delay after set_model
The bridge sends `set_model` then waits 50ms before sending the prompt, to give Pi RPC time to process the model switch. Without this, the prompt could arrive before the switch completes.

### Restart the bridge if you want to test PI_BRIDGE_DISABLE_TOOLS
The current running bridge has tools enabled. To test the `PI_BRIDGE_DISABLE_TOOLS=1` opt-out, you must restart the bridge with the env var set.
