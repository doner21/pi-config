---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260430-212712
context_saturation_estimate: "~40%"
---

# PLAN - Standalone Android Nen Shell with Embedded DeepSeek V4

## Task Statement

Migrate the Nen Shell Expo/React Native app from a desktop bridge-server architecture to a **standalone Android APK** that calls the DeepSeek V4 API directly from the device. Introduce a new bridge implementation (deepseekBridge) that sends chat messages to https://api.deepseek.com/chat/completions, normalizes the OpenAI-format response into the existing AgentTurnResult shape, and delegates all non-chat endpoints to mockPiBridge. Switch the bridge export point, embed the API key via EXPO_PUBLIC_DEEPSEEK_API_KEY, produce a debug-signed APK via npx expo run:android, and pass the npm run typecheck gate while preserving Safe Mode, the permission broker, and audit logging intact.

## Invariants

Carried forward from INTAKE (I1-I7) plus additional discovered during codebase inspection (I8-I10):

| # | Invariant | Source |
|---|-----------|--------|
| I1 | No external server process required at runtime - standalone only | INTAKE |
| I2 | DeepSeek V4 API key must be functional in-app | INTAKE |
| I3 | Safe Mode must still block risky actions (safetyPolicy.ts: riskySafeModeRisks + blockedSafeModeKinds) | INTAKE |
| I4 | npm run typecheck must pass after all changes | INTAKE |
| I5 | usesCleartextTraffic: true must remain in app.json for dev convenience | INTAKE |
| I6 | The PiBridgeClient interface in src/bridge/piBridge.types.ts must be honored (7 methods + 2 aliases) | INTAKE |
| I7 | No app-launcher buttons or open-app destinations | INTAKE |
| I8 | NenShellContext.tsx consumers must NOT require changes - bridge consumed via piBridge export only | Codebase |
| I9 | safetyPolicy.ts and permissionBroker.ts operate at state/dispatch level and must NOT be modified | Codebase |
| I10 | mockPiBridge.ts must remain unchanged - canonical fallback for all non-chat endpoints | Codebase |

## Success Criteria

1. npm run typecheck exits 0 with no errors.
2. New file src/bridge/deepseekBridge.ts exists, implements PiBridgeClient, exports createDeepseekBridge().
3. src/bridge/bridgeClient.ts imports and re-exports createDeepseekBridge() as the active piBridge.
4. sendAgentMessage() sends POST to https://api.deepseek.com/chat/completions with Authorization: Bearer <key> and returns valid AgentTurnResult.
5. All non-chat methods (getHealth, getAgentTasks, approveAgentTask, rejectAgentTask, getAgentAudit, getSchedulerSnapshot, plus aliases) delegate to mockPiBridge.
6. .env exists at repo root containing EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-74e05635ca1242d5877ba8fc900e9dc2.
7. .env is listed in .gitignore.
8. npx expo run:android succeeds and produces APK at android/app/build/outputs/apk/debug/app-debug.apk.
9. Manual runtime: app on Android phone sends message, receives DeepSeek V4 reply with suggested actions in approval queue.
10. Safe Mode ON blocks risky-action approvals per existing evaluateApproval logic.
11. No tools/pi-bridge-server/server.cjs process is running during any of the above.

## Implementation Steps

### Step 1: Create .env with the API key

Create file C:/Users/doner/nen-shell/.env containing:

EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-74e05635ca1242d5877ba8fc900e9dc2

### Step 2: Add .env to .gitignore

Edit C:/Users/doner/nen-shell/.gitignore. Append after the existing # local env files block:

.env

Note: The existing .env*.local rule does NOT match .env. Explicit entry is required.

### Step 3: Create src/bridge/deepseekBridge.ts

Create new file C:/Users/doner/nen-shell/src/bridge/deepseekBridge.ts.


#### 3a. Imports

Import from:
- ../types/domain: AgentTurnResult, SuggestedAction
- ../utils/ids: makeId
- ../utils/time: nowIso
- ./mockPiBridge: mockPiBridge
- ./piBridge.types: PiBridgeClient, SendAgentMessageInput

#### 3b. DeepSeek API response types

Define types matching OpenAI-compatible shape:

    type DeepSeekMessage = { role: string; content: string };
    type DeepSeekChoice = { index: number; message: DeepSeekMessage; finish_reason: string };
    type DeepSeekCompletion = {
      id: string;
      object: string;
      created: number;
      model: string;
      choices: DeepSeekChoice[];
      usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
    };

#### 3c. API key resolution

Read from EXPO_PUBLIC_DEEPSEEK_API_KEY env var with hardcoded fallback:

    const DEEPSEEK_API_KEY: string =
      (typeof process !== 'undefined' &&
        (process.env as Record<string, string | undefined>).EXPO_PUBLIC_DEEPSEEK_API_KEY) ||
      'sk-74e05635ca1242d5877ba8fc900e9dc2';

#### 3d. System prompt

Define inline (replaces what the bridge server / Pi CLI previously provided):

    You are Nen Shell, a calm, safety-first mobile agent running on an Android phone.
    You help the user manage their digital life through short, actionable replies.
    Keep responses concise (1-3 sentences). Suggest concrete next actions where appropriate.
    Never execute risky operations without explicit user approval.

#### 3e. buildSuggestedActions helper

Replicate the heuristic from mockPiBridge.ts lines 29-57. Returns SuggestedAction[]:
- Always produces a draft_reply action (risk: requires_confirmation)
- Always produces a send_message action (risk: risky_send)
- send_message source = Telegram if text contains "telegram", else Gmail
- send_message title = "Draft a calendar update" if text contains "calendar", else "Prepare a quiet outbound reply"

#### 3f. normalizeDeepSeekTurn normalizer

Signature: (payload: unknown, inputText: string) => AgentTurnResult | null

Logic:
1. Guard: payload must be a non-null object
2. Cast to Record<string, unknown>, extract choices array
3. Guard: choices must be non-empty array
4. Extract choices[0].message.content as string, trim
5. Guard: content must be non-empty; return null if empty
6. Build AgentTurnResult:
   - reply.id = makeId('reply')
   - reply.role = 'assistant'
   - reply.text = content
   - reply.summary = content.slice(0, 200) + (content.length > 200 ? '...' : '')
   - reply.created_at = reply.createdAt = nowIso()
   - suggestedActions = buildSuggestedActions(content)
   - auditEntries: two entries (summary + draft), both source = 'Pi Code'


#### 3g. Factory function createDeepseekBridge(): PiBridgeClient

**sendAgentMessage(input):**
1. Extract userText = (input.message ?? input.text ?? '').trim()
2. Create AbortController + setTimeout(120000) for timeout
3. fetch POST to https://api.deepseek.com/chat/completions with:
   - headers: Content-Type: application/json, Authorization: Bearer DEEPSEEK_API_KEY
   - body: { model: 'deepseek-v4-flash', messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: userText }], stream: false, thinking: { type: 'disabled' } }
4. Check response.ok; throw on non-200
5. Parse JSON, call normalizeDeepSeekTurn(json, userText)
6. If normalizeDeepSeekTurn returns null, throw
7. Return the turn
8. On any error (catch block): return mockPiBridge.sendAgentMessage(input)
9. finally: clearTimeout(timeoutId)

**All other methods delegate directly to mockPiBridge:**
- getHealth: () => mockPiBridge.getHealth()
- getAgentTasks: () => mockPiBridge.getAgentTasks()
- approveAgentTask: (task) => mockPiBridge.approveAgentTask(task)
- rejectAgentTask: (task) => mockPiBridge.rejectAgentTask(task)
- getAgentAudit: () => mockPiBridge.getAgentAudit()
- getSchedulerSnapshot: () => mockPiBridge.getSchedulerSnapshot()
- approveAction: (task) => mockPiBridge.approveAction(task)
- rejectAction: (task) => mockPiBridge.rejectAction(task)

#### 3h. Default singleton export

    export const deepseekBridge = createDeepseekBridge();

### Step 4: Switch src/bridge/bridgeClient.ts

Edit C:/Users/doner/nen-shell/src/bridge/bridgeClient.ts. Replace contents:

**BEFORE (current):**

    import { httpPiBridge } from './httpPiBridge';
    export const piBridge = httpPiBridge;
    export { createHttpPiBridge } from './httpPiBridge';

**AFTER:**

    import { deepseekBridge } from './deepseekBridge';
    export const piBridge = deepseekBridge;
    export { createDeepseekBridge } from './deepseekBridge';

### Step 5: Typecheck pass

    cd C:/Users/doner/nen-shell && npm run typecheck

Must exit 0. Fix any errors before proceeding. Likely issues:
- Missing SuggestedAction import in deepseekBridge.ts
- Unused imports (remove them)

### Step 6: Build the APK (local build, primary path)

    cd C:/Users/doner/nen-shell && npx expo run:android

This generates android/ directory (if not present), runs gradle assembleDebug, outputs:
android/app/build/outputs/apk/debug/app-debug.apk

Expected first-build time: 5-15 minutes. Subsequent builds: 1-3 minutes.

**FALLBACK (EAS Build) - only if local build fails:**

First ensure C:/Users/doner/nen-shell/eas.json exists:

    {
      "cli": { "version": ">= 0.0.0" },
      "build": {
        "preview": {
          "android": {
            "buildType": "apk"
          }
        }
      }
    }

Then run:

    cd C:/Users/doner/nen-shell && npx eas login && npx eas build -p android --profile preview

Download the APK from the URL provided by EAS.

### Step 7: Verify APK exists

    ls -la C:/Users/doner/nen-shell/android/app/build/outputs/apk/debug/app-debug.apk

File should be non-zero (30-100 MB typical for debug Expo build).


### Step 8: Regression safety check

Verify safety layer files are untouched:

    git diff --name-only src/permissions/safetyPolicy.ts src/permissions/permissionBroker.ts src/bridge/mockPiBridge.ts

Expected: empty output (no changes to any of these three files).

### Step 9: Final typecheck (sanity gate)

    cd C:/Users/doner/nen-shell && npm run typecheck

Must exit 0. Repeats Step 5 to catch any build-time drift.

## Handoff Notes

### Key facts for the Executor

- **Bridge interface contract:** src/bridge/piBridge.types.ts defines 7 core methods plus 2 aliases (approveAction, rejectAction). All must be implemented.
- **Bridge consumers:** Only src/state/NenShellContext.tsx imports piBridge from bridgeClient (line 2). No other files consume the bridge directly. The change is a drop-in replacement.
- **mockPiBridge.ts is the canonical fallback** for all non-chat methods. It returns sensible defaults for tasks, audit, scheduler, health, and approvals. Do NOT modify it.
- **Existing bridge files do NOT need deletion.** httpPiBridge.ts can remain for reference but will be dead code after the switch.
- **normalizeAgentTurn in httpPiBridge.ts** expects value.reply.text (flat shape from bridge server). DeepSeek returns choices[0].message.content. The new normalizer in deepseekBridge.ts maps this correctly.
- **The API key** is hardcoded as fallback in the bridge source AND placed in .env. The bridge reads the env var first, falls back to the hardcoded value. This dual-path ensures it works even if .env build-time inlining behaves unexpectedly.
- **usesCleartextTraffic: true** in app.json is already set and must remain.
- **No INTERNET permission declaration needed.** Expo SDK 54 adds it automatically to the generated AndroidManifest.xml.
- **deepseek-v4-flash with thinking disabled** is the chosen model. V4 Pro is 3x cost and unnecessary. The model parameter from NenShellContext is unused by the new bridge; acceptable for V1 standalone.
- **npm run typecheck** maps to tsc --noEmit (package.json line 9).

### Decisions made

1. **Non-streaming, non-thinking mode** for DeepSeek API calls. Streaming adds SSE parsing complexity in React Native; thinking mode adds latency.
2. **Heuristic suggested actions** (replicating mockPiBridge pattern) rather than JSON mode prompt engineering. The mock bridge generates meaningful actions from text content; preserves UI compatibility and avoids prompt fragility.
3. **Local build (npx expo run:android)** as primary path. EAS Build as documented fallback. User already has Android SDK installed.
4. **Debug keystore** for signing. Sufficient for sideloading. No release keystore needed.
5. **.env (not .env.local)** as key storage file per user specification. Added to .gitignore to prevent accidental commits.
6. **Fallback to mockPiBridge.sendAgentMessage()** on any DeepSeek API error (network, auth, rate-limiting, malformed response). Ensures app never presents broken state.
7. **System prompt inline in bridge source.** No external file dependency. Replaces bridge server / Pi CLI prompt context.


### Unknowns / risks

- **DeepSeek API latency on mobile:** Could be 2-5 seconds vs ~750ms from desktop. The 120s timeout (matching existing httpPiBridge value) is generous enough.
- **Expo env var inlining:** EXPO_PUBLIC_* vars are baked into the JS bundle at build time. The hardcoded fallback in source guards against any env var resolution failure during development.
- **First npx expo run:android build time:** 5-15 minutes is typical. The Executor should not treat a slow build as a failure.
- **API key extraction risk:** The key is embedded in the APK and can be extracted via apktool decompilation. The user explicitly accepted this risk.
- **Rate limiting (HTTP 429):** DeepSeek API uses dynamic concurrency limiting. The bridge has no retry logic; rate-limit errors fall through to the mock fallback. Acceptable for V1 single-user testing.

### Files changed (summary)

| File | Action | Purpose |
|------|--------|---------|
| .env | CREATE | Store EXPO_PUBLIC_DEEPSEEK_API_KEY |
| .gitignore | EDIT | Add .env to prevent key leakage |
| src/bridge/deepseekBridge.ts | CREATE | New bridge: DeepSeek API + mock fallbacks |
| src/bridge/bridgeClient.ts | EDIT | Switch export from httpPiBridge to deepseekBridge |

### Files explicitly NOT changed

- src/bridge/piBridge.types.ts - interface unchanged
- src/bridge/mockPiBridge.ts - canonical fallback, untouched
- src/bridge/httpPiBridge.ts - left for reference, dead code
- src/state/NenShellContext.tsx - consumes via piBridge export, no change needed
- src/permissions/safetyPolicy.ts - bridge-independent, untouched
- src/permissions/permissionBroker.ts - bridge-independent, untouched
- app.json - usesCleartextTraffic already present, no change needed
- package.json - scripts unchanged
- tsconfig.json - unchanged

---

[PLANNER CONTEXT - END]
self_estimate: ~45%
