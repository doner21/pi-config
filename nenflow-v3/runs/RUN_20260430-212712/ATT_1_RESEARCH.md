---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260430-212712
context_saturation_estimate: "~45%"
---

# RESEARCH — Primitives for Standalone Android Nen Shell with Embedded DeepSeek V4

## Investigation Scope

Per INTAKE: mapped all six investigation areas against the codebase at `C:/Users/doner/nen-shell/`, official DeepSeek API docs at `https://api-docs.deepseek.com/`, and Expo documentation at `https://docs.expo.dev/`. Checked the bridge server source (`tools/pi-bridge-server/server.cjs`) to understand the existing Pi CLI -> DeepSeek path and confirm what the direct REST API must replace.

## Key Findings

### 1. DeepSeek V4 Chat Completions API

Source: `https://api-docs.deepseek.com/` (official docs, accessed 2026-04-30)

| Property | Value |
|----------|-------|
| **Endpoint URL** | `https://api.deepseek.com/chat/completions` |
| **Base URL (OpenAI format)** | `https://api.deepseek.com` |
| **Auth header** | `Authorization: Bearer sk-...` |
| **Content-Type** | `application/json` |
| **API format** | Fully OpenAI-compatible |
| **Active models** | `deepseek-v4-flash`, `deepseek-v4-pro` |
| **Deprecated aliases** | `deepseek-chat` = V4 Flash non-thinking; `deepseek-reasoner` = V4 Flash thinking (removed 2026/07/24) |
| **Context length** | 1M tokens (both models) |
| **Max output** | 384K tokens |
| **Thinking mode** | `"thinking": {"type": "enabled"}` or `{"type": "disabled"}` |
| **Reasoning effort** | `"reasoning_effort": "high"` (also "medium", "low") |
| **Rate limits** | Dynamic concurrency limiting; HTTP 429 on limit; 10-min idle timeout |

**Request body (non-streaming, non-thinking — recommended for mobile):**
```json
{
  "model": "deepseek-v4-flash",
  "messages": [
    {"role": "system", "content": "You are Nen Shell, a calm mobile agent..."},
    {"role": "user", "content": "user message here"}
  ],
  "stream": false,
  "thinking": {"type": "disabled"}
}
```

**Response body (OpenAI-compatible):**
```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1712345678,
  "model": "deepseek-v4-flash",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "The reply text..."},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 25, "completion_tokens": 100, "total_tokens": 125}
}
```

**Model recommendation:** `deepseek-v4-flash` with thinking disabled. The bridge server already uses `deepseek-v4-flash` with `--thinking off`. V4 Pro is 3x the cost and unnecessary for mobile chat. Use V4 Flash non-thinking mode for fast responses.

**Pricing (per 1M tokens):**
- V4 Flash: $0.14 input, $0.28 output
- V4 Pro: $0.435 input, $0.87 output (75% off until 2026/05/31)

### 2. Calling REST APIs from React Native / Expo

**Standard `fetch` works.** The codebase already uses `fetch` in `src/bridge/httpPiBridge.ts` with AbortController timeouts. No additional dependencies needed. React Native built-in `fetch` handles HTTPS natively.

**Android network permissions:** No `INTERNET` permission needed — Expo SDK 54 adds it automatically.

**`usesCleartextTraffic: true`:** Already in `app.json` (line 15). This allows HTTP to 10.0.2.2 for emulator dev but is unnecessary for HTTPS calls to `api.deepseek.com`. **Keep it** for dev convenience (I5).

**Expo-specific considerations:** None blocking. The existing `fetch`-based pattern in `httpPiBridge.ts` (lines 85-110) demonstrates AbortController with timeout, JSON request/response handling, and error normalization. This ports directly to DeepSeek API calls.

**Key code reference (`src/bridge/httpPiBridge.ts`, lines 85-110):**
```typescript
const createFetchJson = (baseUrl: string) =>
  async (path: string, options: FetchJsonOptions = {}): Promise<unknown> => {
    const controller = new AbortController();
    const timeoutId = options.timeoutMs
      ? setTimeout(() => controller.abort(), options.timeoutMs)
      : undefined;
    try {
      const response = await fetch(joinUrl(baseUrl, path), {
        method: options.method ?? "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: controller.signal,
      });
      // ...
```

### 3. Expo EAS Build for Standalone Android APK

Source: `https://docs.expo.dev/build-reference/apk/` (official docs)

**Two paths exist:**

| Path | Command | Requirements | Output |
|------|---------|-------------|--------|
| **EAS Build (cloud)** | `eas build -p android --profile preview` | Expo account (free), `eas.json` with `android.buildType: "apk"` | `.apk` download URL |
| **Local build** | `npx expo run:android` | Android SDK already installed | `.apk` from gradle output |

**EAS Build eas.json for APK (not AAB):**
```json
{ "build": { "preview": { "android": { "buildType": "apk" } } } }
```

**EAS Build requires an Expo account** (free tier sufficient). Login with `npx eas login`. The user already has Android SDK installed so local build is also an option.

**EAS Build workflow:**
1. `npm install -g eas-cli`
2. `npx eas login`
3. Configure `eas.json` as above
4. `npx eas build -p android --profile preview`
5. Download `.apk` from the provided URL
6. Install on phone: `adb install <file.apk>` or open URL on device

**Local build** (`npx expo run:android`) produces a debug APK directly in `android/app/build/outputs/apk/debug/`. No Expo account needed. This is likely the fastest path for initial testing.

**Output format:** `.apk` (not `.aab`) when `android.buildType: "apk"` is set. Default EAS behavior is `.aab` — must explicitly configure for APK.

**Standalone vs development:** The distinction is the build profile. EAS `production` profile signs with release keystore; `preview`/`development` profiles use debug keystore. For initial testing, debug signing is fine.

### 4. API Key Embedding in Expo/React Native

Source: `https://docs.expo.dev/guides/environment-variables/` (official docs)

**Three options, ordered by security:**

| Method | Security | Complexity | Recommended? |
|--------|----------|-----------|--------------|
| `EXPO_PUBLIC_DEEPSEEK_KEY` in `.env` | Low (plaintext in bundle) | Trivial | Yes, per user demand |
| EAS Secrets + `eas env:pull` | Medium (server-side) | Medium | No — requires EAS account |
| Hardcoded in source | Lowest | Trivial | No — worse than .env |

**`EXPO_PUBLIC_*` mechanism:**
- Variables prefixed `EXPO_PUBLIC_` in `.env` are **inlined at build time** into the JavaScript bundle as string literals.
- Accessed via `process.env.EXPO_PUBLIC_DEEPSEEK_KEY` in source.
- Expo docs explicitly warn: *"Do not store sensitive info, such as private keys, in EXPO_PUBLIC_ variables. These variables will be visible in plain-text in your compiled application."*
- The codebase already uses this pattern: `EXPO_PUBLIC_BRIDGE_URL` in `src/bridge/httpPiBridge.ts` line 15.

**Recommended approach (per user explicit demand to embed key):**
1. Create `.env` (or `.env.local`) with: `EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-74e05635ca1242d5877ba8fc900e9dc2`
2. Reference as `process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY` in the bridge.
3. Add `.env` and `.env.local` to `.gitignore` (already configured: `.env*.local` is in `.gitignore`).

**Risk acknowledgment:** A determined user can extract the API key from the APK via `apktool` decompilation. This is inherent to any client-side key embedding. Since the user explicitly requested this approach and this is a personal/testing app, we proceed. The risk is: API key exposure, unauthorized usage, billing impact. The Planner should note this as a known risk.

### 5. Mock Data Migration Strategy

**Current state:**
- `src/bridge/bridgeClient.ts` exports `httpPiBridge` as `piBridge`
- `httpPiBridge.ts` calls external bridge server for ALL endpoints
- On failure, each method falls back to `mockPiBridge` (already implemented)
- `mockPiBridge.ts` provides deterministic local mock data for everything

**How `httpPiBridge` falls back today** (example from line 148):
```typescript
async sendAgentMessage(input: SendAgentMessageInput): Promise<AgentTurnResult> {
  const payload = await fetchJson("/agent/message", { method: "POST", ... });
  return normalizeAgentTurn(payload) ?? mockPiBridge.sendAgentMessage(input);
}
```

**Recommended migration path:**
1. Create `src/bridge/deepseekBridge.ts` — implements `PiBridgeClient`
2. `sendAgentMessage()` calls DeepSeek REST API directly (not bridge server)
3. All other methods delegate to `mockPiBridge`:
   - `getHealth()` → mock (no server to check)
   - `getAgentTasks()` → mock
   - `approveAgentTask()` → mock
   - `rejectAgentTask()` → mock
   - `getAgentAudit()` → mock
   - `getSchedulerSnapshot()` → mock
4. Update `src/bridge/bridgeClient.ts`:
   ```typescript
   import { createDeepseekBridge } from "./deepseekBridge";
   export const piBridge = createDeepseekBridge();
   ```
5. Keep `mockPiBridge.ts` unchanged as the fallback for non-chat endpoints
6. Keep `httpPiBridge.ts` for reference but it is no longer imported

**`mockPiBridge.ts` is sufficient as fallback** for all non-chat endpoints. It returns sensible defaults: mock tasks, audit entries, scheduler snapshots, and decision records. All UI screens that depend on these (Tasks, System) will continue to work.

### 6. Android App Signing for Standalone

**Local build (`npx expo run:android`):**
- Uses **debug keystore** automatically
- Located at `~/.android/debug.keystore`
- No configuration needed
- **Sufficient for initial testing/sideloading**
- The APK is signed with a debug certificate — any Android phone with developer options enabled can install it.

**EAS Build (cloud):**
- First build: EAS auto-generates a keystore or you can provide one
- `eas credentials` manages signing
- Debug builds use auto-generated debug keystore
- Release builds need a proper release keystore

**Recommendation:** For initial testing, use local build with debug keystore. It is the fastest path and sufficient for sideloading. The user already has Android SDK installed, so `npx expo run:android` is available immediately.

**Debug keystore limitations:**
- Cannot publish to Play Store
- Shows "untrusted developer" warning on install
- Must enable "Install from unknown sources" on phone
- Perfectly fine for personal testing

## Constraints Identified

Beyond the INTAKE listed invariants (I1-I7), these additional constraints emerged from research:

| # | Constraint | Source |
|---|-----------|--------|
| C1 | `deepseek-chat` and `deepseek-reasoner` are deprecated — must use `deepseek-v4-flash` or `deepseek-v4-pro` | DeepSeek API docs |
| C2 | `content` field in DeepSeek response is nested at `choices[0].message.content` — not the flat `reply.text` the bridge consumes | OpenAI-compatible API |
| C3 | `EXPO_PUBLIC_*` vars are baked into the JS bundle at build time — cannot be changed without rebuild | Expo docs |
| C4 | `npx expo run:android` generates native project folders (`/android`) that must be `.gitignore` (already configured) | Expo workflow |
| C5 | The existing `normalizeAgentTurn()` in `httpPiBridge.ts` expects `{ reply: { text, id, role, ... } }` — a new normalizer is needed to convert OpenAI-format responses to this shape | Codebase pattern |
| C6 | Non-chat bridge methods (`getAgentTasks`, `getAgentAudit`, etc.) currently route through the Pi CLI RPC process — in standalone mode, these must be purely local/mock | Bridge architecture |

## Existing Patterns

### Bridge Pattern (files in `src/bridge/`)

1. **Interface contract** (`piBridge.types.ts`): `PiBridgeClient` defines 7 async methods. All consumers (NenShellContext, reducer, screens) depend on this interface, not on the implementation.

2. **Pluggable implementations**: `bridgeClient.ts` is a one-line re-export point. Switching implementations is a single-line change.

3. **Method-level fallback**: Every method in `httpPiBridge.ts` has try/catch → mock fallback. New `deepseekBridge.ts` should follow the same pattern for `sendAgentMessage`.

4. **Normalizer pattern**: Each bridge normalizes foreign payloads into the canonical `AgentTurnResult`, `AgentTask[]`, etc. types. A new normalizer for OpenAI-format responses is needed.

5. **ENV var pattern**: `EXPO_PUBLIC_BRIDGE_URL` in `httpPiBridge.ts` shows the established convention for config via env vars.

### State Flow (from `NenShellContext.tsx`)

```
User types → actions.sendMessage(text)
  → piBridge.sendAgentMessage({ message, context, model?, provider? })
  → dispatch SEND_MESSAGE_SUCCESS with AgentTurnResult
  → UI shows reply text + suggestedActions + auditEntries
```

The `model` and `provider` fields are already passed through — the Planner can reuse these to allow model selection (V4 Flash vs V4 Pro).

### Safety Invariants (from `src/permissions/`)

- `safetyPolicy.ts` blocks sends when Safe Mode is ON
- `permissionBroker.ts` evaluates approval requests against Safe Mode + root lock
- These operate on the state level, not the bridge level — no bridge changes can bypass them.

## Recommendations

1. **Bridge implementation:** Create `src/bridge/deepseekBridge.ts` that:
   - Implements `PiBridgeClient`
   - `sendAgentMessage()`: POST to `https://api.deepseek.com/chat/completions` with `Authorization: Bearer <key>`, model `deepseek-v4-flash`, thinking disabled, non-streaming
   - Normalizes OpenAI response into `AgentTurnResult` (map `choices[0].message.content` → `reply.text`)
   - Falls back to `mockPiBridge.sendAgentMessage()` on error
   - All other methods delegate to `mockPiBridge`

2. **API key:** Use `EXPO_PUBLIC_DEEPSEEK_API_KEY` in `.env` (gitignored). Reference via `process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY` with a hardcoded fallback for convenience.

3. **Build:** Start with `npx expo run:android` (local, no Expo account needed) for fast iteration. Switch to EAS Build for shareable APK if needed.

4. **Signing:** Use debug keystore for initial testing. The local build handles this automatically.

5. **Suggested actions from DeepSeek responses:** DeepSeek returns plain text, not structured `suggestedActions`. The existing mock generates actions deterministically. For V1 standalone, we can either:
   - (A) Have DeepSeek return text only, and use a local heuristic to parse suggested actions from the text, OR
   - (B) Prompt DeepSeek to respond in a structured format and parse it
   The Planner should decide. Option (A) preserves compatibility with the current UI; option (B) gives better actions but requires prompt engineering and parsing. DeepSeek supports JSON mode (`response_format: { type: "json_object" }`).

6. **`usesCleartextTraffic: true`:** Keep in `app.json` — required for dev builds hitting 10.0.2.2, harmless in production.

## Unknowns Remaining

1. **DeepSeek response latency on mobile networks** — the existing bridge measures ~750ms from the desktop. Mobile latency + DeepSeek API latency could push this to 2-5 seconds. A 120s timeout (matching the existing `httpPiBridge.ts` value) is safe.

2. **Structured output from DeepSeek** — can we prompt-engineer the model to return JSON with `suggestedActions` and `auditEntries`? The DeepSeek API supports JSON mode (`response_format: { type: "json_object" }`) which could enforce structured output. The Planner should evaluate this.

3. **Exact build time for `npx expo run:android`** — first build generates native projects and takes 5-15 minutes. Subsequent builds are faster (1-3 minutes).

4. **EAS Build free tier limits** — Expo free tier allows a limited number of builds per month (typically 30). Not a concern for initial testing.

5. **`deepseek-v4-flash` token pricing relative to typical Nen Shell messages** — a typical message exchange (~200 input tokens + ~500 output tokens) costs approximately $0.00003 for input and $0.00014 for output — negligible for testing.

6. **Expo Go vs standalone** — the app currently runs in Expo Go. A standalone APK requires either EAS Build or local `npx expo run:android`. Expo Go does not support standalone APK output.
