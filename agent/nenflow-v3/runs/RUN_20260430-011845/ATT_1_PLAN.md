---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260430-011845
context_saturation_estimate: "~30%"
---

# PLAN — Nen Shell Tool & Model Enablement

## Task Statement

Enable full Pi Code tool parity and runtime model selection in the Nen Shell mobile app by (a) removing the --no-tools / --no-extensions / --no-skills flags from the Pi RPC process startup so all built-in tools (read, bash, edit, write, grep, find, web_search, web_fetch) are available, (b) adding model/provider preference fields to the bridge contract so the app can send a model selection to the bridge server, which forwards it as a set_model RPC command, and (c) adding a model picker UI to the System screen wired through app state.

## Invariants

Carried forward from INTAKE, plus codebase-specific additions:

1. **App typechecks** — npm run typecheck (i.e. tsc --noEmit) MUST pass with zero errors
2. **All existing endpoints preserved** — /health, /agent/message, /agent/tasks, /agent/approve, /agent/reject, /agent/audit, /scheduler/jobs must return 2xx and structurally valid JSON responses as before
3. **Safe Mode gates remain effective** — SafeMode (toggled via permission.safeMode) must still block send_message, modify_file, delete_file, system_change, and root_command actions at the app level, even though Pi internals now have tools available
4. **permissionBroker unchanged** — evaluateApproval() in src/permissions/permissionBroker.ts must not be modified; it is the app-side safety gate
5. **Mock fallback preserved** — mockPiBridge must remain available and the PiBridgeClient interface must not be broken
6. **Bridge server single-process** — the bridge must continue using one persistent Pi RPC process (maxConcurrent: 1); no per-request spawn
7. **Android emulator networking** — 10.0.2.2:31415 must still work; no changes to host/port binding defaults
8. **PiBridgeClient interface** — must remain the single interface type; all changes to SendAgentMessageInput must be backward-compatible (optional new fields only)
9. **--thinking off default** — keep thinking disabled by default for fast mobile responses; configurable via existing PI_BRIDGE_THINKING env var

## Success Criteria

Extended from INTAKE with codebase-specific verification targets:

1. **Model preference round-trips** — the app can call piBridge.sendAgentMessage({ message: "...", model: "openai/gpt-4o" }) and the bridge server receives model in the request body, sends a set_model JSONL command to the Pi RPC process, then sends the prompt
2. **Tools are enabled at startup** — the Pi RPC process is spawned WITHOUT --no-tools, --no-extensions, --no-skills, --no-prompt-templates, --no-themes, --no-context-files. Verify via /health response: safeDefaults.toolsDisabled is false
3. **Tools can be disabled via env var** — setting PI_BRIDGE_DISABLE_TOOLS=1 before npm run bridge re-adds --no-tools to the Pi invocation
4. **Internet search works** — sending a prompt like "search the web for current UTC time" through the bridge results in the model using web_search and returning real web results (observable in the reply text)
5. **File read/write works** — sending a prompt like "create a file test.txt with hello in the repo root then read it back" results in the file being created and read (observable in reply)
6. **Safe Mode still blocks** — with Safe Mode ON, approveTask() for a risky_file action returns evaluateApproval.allowed === false, and BLOCK_TASK is dispatched
7. **Model picker appears in UI** — the System screen shows a model picker component listing available models (at least: deepseek-v4-flash, gpt-4o, gpt-4o-mini, claude-sonnet-4-20250514, gemini-2.5-flash)
8. **Selecting a model persists** — selecting a model in the picker updates state.selectedModel; subsequent sendMessage() calls include the selected model in the bridge request
9. **Typecheck passes** — npm run typecheck exits 0
10. **Mock bridge still works** — the app boots with mock fallback and responds to messages as before
11. **Existing endpoints unchanged** — curl http://127.0.0.1:31415/health returns 200 with the updated safeDefaults shape; POST /agent/message with {"message":"test"} returns 200 with a real Pi reply (not mock)

## Implementation Steps

### Step 1: Extend SendAgentMessageInput in src/bridge/piBridge.types.ts

Add optional model and provider fields to the input type. These are optional — backward-compatible.

### Step 2: Update the bridge server tools/pi-bridge-server/server.cjs

**2a. Invert tool-flag logic** — Replace PI_BRIDGE_ALLOW_* (opt-in) with PI_BRIDGE_DISABLE_* (opt-out). Tools are now ON by default. Each flag is gated by === "1" so only an explicit env var disables them.

**2b. Track current model** — Add let currentModel near currentRequest, initialized to config.piProvider/config.piModel.

**2c. Read model/provider from request body** — In handleAgentMessage, extract body.model and body.provider as optional strings.

**2d. Send set_model before prompt if model differs** — In invokePi, if model/provider differ from currentModel, write {"type":"set_model","model":"..."} to stdin before the prompt.

**2e. Update /health response** — Change safeDefaults to use PI_BRIDGE_DISABLE_* vars. Add currentModel to health payload.

**2f. Update startup log** — Change from "Safe defaults enabled" to "Tools enabled. Set PI_BRIDGE_DISABLE_TOOLS=1 to disable."

### Step 3: Update HTTP bridge client src/bridge/httpPiBridge.ts

In sendAgentMessage, spread input.model and input.provider into the request body.

### Step 4: Extend app state for model selection

**4a. ShellState (domain.ts)** — Add selectedModel?: string and selectedProvider?: string fields.

**4b. Actions (actions.ts)** — Add SET_MODEL_PREFERENCE action type with model? and provider? payload. Add setModelPreference() to ShellActionsApi.

**4c. Reducer (reducer.ts)** — Add case SET_MODEL_PREFERENCE that spreads model/provider into state.

**4d. NenShellContext.tsx** — Add setModelPreference to actions object. Update sendMessage to spread state.selectedModel / state.selectedProvider into the piBridge call. Add model fields to useMemo dependency array.

### Step 5: Add model picker UI

**5a. Create src/components/ModelPicker.tsx** — New component accepting selectedModel, selectedProvider, onSelect props. Renders pill buttons for each model using theme tokens. Hardcoded model list: DeepSeek V4 Flash, GPT-4o, GPT-4o Mini, Claude Sonnet 4, Gemini 2.5 Flash.

**5b. Integrate into src/screens/SystemScreen.tsx** — Add CalmCard with ModelPicker below Autonomy card and above LockedActuatorCard.

### Step 6: Update mock bridge src/bridge/mockPiBridge.ts

No behavior change — mock already satisfies PiBridgeClient. Just ensure typecheck passes with the extended SendAgentMessageInput.

### Step 7: Update documentation docs/pi-bridge.md

Update Pi invocation example to show tools enabled. Add model switching docs. Document PI_BRIDGE_DISABLE_* env vars. Note PI_BRIDGE_ALLOW_* deprecation.

### Step 8: Validate

Run npm run typecheck — must exit 0. Then manual smoke: curl /health to verify safeDefaults.toolsDisabled=false. curl POST /agent/message with model field to verify set_model forwarding.

## Handoff Notes

### Key file paths
- tools/pi-bridge-server/server.cjs — bridge server (RPC process start, model switching, tool flags)
- src/bridge/piBridge.types.ts — SendAgentMessageInput extension
- src/bridge/httpPiBridge.ts — pass model/provider in POST body
- src/bridge/mockPiBridge.ts — accept new input fields
- src/types/domain.ts — ShellState extension
- src/state/actions.ts — new action + action creator
- src/state/reducer.ts — new case
- src/state/NenShellContext.tsx — wire model preference through sendMessage
- src/components/ModelPicker.tsx — new component
- src/screens/SystemScreen.tsx — integrate ModelPicker
- docs/pi-bridge.md — update docs

### Critical decisions
1. **Tools enabled by default, opt-out via env vars.** The old PI_BRIDGE_ALLOW_* env vars (opt-in) are replaced with PI_BRIDGE_DISABLE_* (opt-out). Tools are ON unless explicitly disabled.
2. **Model switching is per-request.** The bridge sends set_model before the prompt only if the requested model differs from the current one. The current model is tracked in server memory (currentModel).
3. **Model preference is passed through the existing /agent/message body.** No new endpoint needed.
4. **--thinking off stays.** Fast mobile responses remain the default. Users can override with PI_BRIDGE_THINKING=high.
5. **Safe Mode and permissionBroker are NOT modified.** The apps safety gates remain the sole gate for risky actions. Pi having tools available does not mean the app will execute them without user approval.

### Unknowns / assumptions
1. **set_model RPC command format** — assumed to be {"type":"set_model","model":"provider/model"}. If Pis actual RPC protocol uses different field names (e.g., separate provider and model fields, or a different type string), the Executor should verify by checking the Pi RPC source or testing.
2. **Model availability** — the models listed in ModelPicker assume the user has the corresponding providers configured in Pi. If a model is requested that Pi doesnt have credentials for, Pi will return an error. The bridge should surface this error through the existing error path.
3. **web_search / web_fetch dependencies** — these tools may require Ollama running locally. The Executor should verify this works end-to-end; if not, note it as a prerequisite in the Execution Report.
4. **Pi RPC process restart on tool-flag change** — if the user changes PI_BRIDGE_DISABLE_TOOLS mid-session, the bridge needs restart. This is acceptable since env var changes always require a server restart.
5. **set_model during active prompt** — the Plan sends set_model BEFORE the prompt. The Executor should verify Pi RPC accepts set_model while no prompt is active (likely safe since currentRequest is null at that point).
6. **state closure in useMemo** — the sendMessage closure in NenShellContext.tsx uses state.selectedModel/state.selectedProvider. Since state is from the useReducer and the actions useMemo depends on [state.permission.rootLocked, state.permission.safeMode], adding model fields to the dependency array is necessary.

### What NOT to change
- src/permissions/safetyPolicy.ts — DO NOT TOUCH
- src/permissions/permissionBroker.ts — DO NOT TOUCH
- src/bridge/bridgeClient.ts — DO NOT TOUCH (it just re-exports httpPiBridge)
- src/screens/HomeScreen.tsx — no changes needed (model picker goes on System screen)
- src/components/AgentInput.tsx — no changes needed
- src/screens/BriefScreen.tsx, src/screens/TasksScreen.tsx — no changes needed
- src/state/selectors.ts — no changes needed
- Endpoint URLs, HTTP methods, response shapes — DO NOT CHANGE (only add optional fields)
