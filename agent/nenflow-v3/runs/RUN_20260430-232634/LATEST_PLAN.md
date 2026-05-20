---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260430-232634
context_saturation_estimate: "~28%"
---

# PLAN — Session Context, Scrollable Output, Copy/Paste, File System

## Task Statement

Fix four blockers in the standalone Android Nen Shell app: (1) DeepSeek calls are stateless so every message starts a fresh session — conversation history must flow through the bridge so the AI maintains context across the full app lifecycle; (2) only the single `latestReply` is shown — all `state.messages` must be rendered in a scrollable conversation view; (3) AI reply text has no `selectable` prop — users cannot copy; (4) the app has no file-write capability — `expo-file-system` must be integrated via the bridge/actions API.

## Invariants

| # | Invariant | Source |
|---|----------|--------|
| I1 | Conversation history accumulates in-memory in `state.messages` for the app lifecycle; cleared only on app restart | INTAKE I1, RESEARCH §4 |
| I2 | Full conversation history sent to DeepSeek on every `sendAgentMessage` call: `[system, ...history, currentUserMessage]` | INTAKE I2 |
| I3 | All messages (user + assistant) displayed in chronological order in a scrollable area on Home screen | INTAKE I3 |
| I4 | AI reply text components carry `selectable={true}` for long-press copy on Android | INTAKE I4 |
| I5 | `writeFile(filename, content)` is callable via `ShellActionsApi` and `PiBridgeClient`, writing to app sandbox via `expo-file-system` | INTAKE I5 |
| I6 | Safe Mode and permission broker remain intact; no changes to `blockedKinds`, `permissionBroker.ts`, or `initialState.ts` | INTAKE constraint §6 |
| I7 | `npm run typecheck` passes after every fix | INTAKE I7 |
| I8 | `PiBridgeClient` interface contract preserved — new methods added, no existing signatures broken | INTAKE I8 |
| I9 | `SendAgentMessageInput` is backward-compatible: `conversation` is optional, absence = single-message behavior | Research C1 |
| I10 | No nested `FlatList` inside parent `ScrollView` — render a plain `.map()` instead | Research C4 |

## Success Criteria

1. **Context persistence:** Sending three related messages (e.g., "My name is Alice", "What is my name?", "What did I just ask?") produces a reply to the third that references "Alice", proving the AI received the full conversation history.
2. **Full conversation visible:** All user messages and all assistant replies appear on the Home screen in chronological order, with distinct visual styling for each role.
3. **Scrollability:** When conversation content exceeds the viewport height, the outer `ScrollView` scrolls to reveal all content. New messages auto-scroll to bottom.
4. **Copy works:** Long-pressing any AI reply text on an Android device shows the native text-selection handles and copy action.
5. **File write works:** Calling `actions.writeFile("test.txt", "hello")` creates `test.txt` in the app document directory. Reading the file back confirms the content.
6. **Typecheck passes:** `npx tsc --noEmit` exits 0 with no errors.
7. **APK builds:** `npx expo run:android` (or equivalent) produces a release APK successfully.

## Implementation Steps

---

### Step 1 — Install expo-file-system

**Command:**
```bash
cd C:/Users/doner/nen-shell
npx expo install expo-file-system
```

**Expected result:** `expo-file-system` (version ~19.0.22) added to `package.json` dependencies and installed into `node_modules/`. Verify with `npm ls expo-file-system`.

**Quality gate:** `npm run typecheck` still passes (no code changes yet).

---

### Step 2 — Add `conversation` field to `SendAgentMessageInput` and `writeFile` to `PiBridgeClient`

**File:** `src/bridge/piBridge.types.ts`

**Import to add** (extend the existing import from `../types/domain`):
```ts
import { AgentMessage, AgentTask, AgentTurnResult, ApprovalTask, AuditEntry, BridgeHealth, SchedulerSnapshot } from '../types/domain';
```

**Before (SendAgentMessageInput):**
```ts
export type SendAgentMessageInput = {
  message: string;
  context?: Record<string, unknown>;
  /** UI compatibility; normalized to message by mock bridge. */
  text?: string;
  /** Optional model selection, e.g. "openai/gpt-4o". Sent to bridge as the desired model. */
  model?: string;
  /** Optional provider selection, e.g. "openai". Sent alongside model for set_model RPC. */
  provider?: string;
};
```

**After:**
```ts
export type SendAgentMessageInput = {
  message: string;
  context?: Record<string, unknown>;
  /** Full conversation history (user + assistant turns) for multi-turn sessions. */
  conversation?: AgentMessage[];
  /** UI compatibility; normalized to message by mock bridge. */
  text?: string;
  /** Optional model selection, e.g. "openai/gpt-4o". Sent to bridge as the desired model. */
  model?: string;
  /** Optional provider selection, e.g. "openai". Sent alongside model for set_model RPC. */
  provider?: string;
};
```

**Before (PiBridgeClient, end of interface):**
```ts
  /** Backwards-compatible aliases used by the first UI slice. */
  approveAction(task: ApprovalTask): Promise<ActionDecisionResult>;
  rejectAction(task: ApprovalTask): Promise<ActionDecisionResult>;
};
```

**After:**
```ts
  /** Write a string to a file in the app's document directory. */
  writeFile(filename: string, content: string): Promise<void>;

  /** Backwards-compatible aliases used by the first UI slice. */
  approveAction(task: ApprovalTask): Promise<ActionDecisionResult>;
  rejectAction(task: ApprovalTask): Promise<ActionDecisionResult>;
};
```

**Quality gate:** `npm run typecheck` — expect errors in `deepseekBridge.ts` and `mockPiBridge.ts` because they do not yet implement `writeFile`. These errors will be resolved in Steps 3 and 4.

---

### Step 3 — Implement conversation history and writeFile in deepseekBridge

**File:** `src/bridge/deepseekBridge.ts`

**Import to add** (after ):
```ts
import * as FileSystem from 'expo-file-system';
```

**Before (sendAgentMessage, body construction):**
```ts
          body: JSON.stringify({
            model: 'deepseek-v4-flash',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: userText },
            ],
            stream: false,
            thinking: { type: 'disabled' },
          }),
```

**After:**
```ts
          body: JSON.stringify({
            model: 'deepseek-v4-flash',
            messages: (() => {
              const history: { role: string; content: string }[] = [
                { role: 'system', content: SYSTEM_PROMPT },
              ];
              // Append prior conversation turns if available
              if (input.conversation && input.conversation.length > 0) {
                for (const msg of input.conversation) {
                  history.push({ role: msg.role, content: msg.text });
                }
              }
              // Append the current user message as the final turn
              history.push({ role: 'user', content: userText });
              return history;
            })(),
            stream: false,
            thinking: { type: 'disabled' },
          }),
```

**Add `writeFile` method** after the `sendAgentMessage` block and before `getHealth`:

```ts
    async writeFile(filename: string, content: string): Promise<void> {
      const path = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(path, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    },
```

**Quality gate:** `npm run typecheck` — `deepseekBridge.ts` should now type-check. `mockPiBridge.ts` may still error for missing `writeFile`.

---

### Step 4 — Add writeFile to mockPiBridge

**File:** `src/bridge/mockPiBridge.ts`

**The mock `sendAgentMessage` needs no functional changes** — it is deterministic and does not call an LLM. The `input` parameter already accepts `SendAgentMessageInput` which now includes optional `conversation`. The mock silently ignores it, which is correct.

**Add `writeFile` method** after `rejectAction` and before the closing `};` of the `mockPiBridge` object:

```ts
  async writeFile(_filename: string, _content: string): Promise<void> {
    // Mock no-op: no real file system access in mock mode
    return;
  },
```

**Quality gate:** `npm run typecheck` must now pass with zero errors. If not, fix any remaining type mismatches.

---

### Step 5 — Add writeFile to ShellActionsApi, ShellAction union, and reducer

**File:** `src/state/actions.ts`

**Add to `ShellAction` union** (before the closing `;`):
```ts
  | { type: 'WRITE_FILE_REQUEST'; filename: string; content: string }
  | { type: 'WRITE_FILE_SUCCESS'; filename: string }
  | { type: 'WRITE_FILE_FAILURE'; filename: string; error: string; audit: AuditEntry }
```

**Add to `ShellActionsApi`** (before the closing `};`):
```ts
  writeFile(filename: string, content: string): Promise<void>;
```

**File:** `src/state/reducer.ts`

**Add cases to `shellReducer` switch** (before `default`):
```ts
    case 'WRITE_FILE_REQUEST':
      return { ...state };

    case 'WRITE_FILE_SUCCESS':
      return {
        ...state,
        auditLog: sortAudit([
          {
            id: makeId('audit'),
            category: 'check',
            title: 'File written',
            detail: ,
            source: 'System',
            createdAt: nowIso(),
          },
          ...state.auditLog,
        ]),
      };

    case 'WRITE_FILE_FAILURE':
      return {
        ...state,
        auditLog: sortAudit([action.audit, ...state.auditLog]),
      };
```

**Quality gate:** `npm run typecheck` — expect error that `writeFile` is not implemented in `NenShellContext.tsx`. Resolved in next step.

---

### Step 6 — Implement writeFile and pass conversation in NenShellContext

**File:** `src/state/NenShellContext.tsx`

**Import to add** (after ):
```ts
import * as FileSystem from 'expo-file-system';
```

**Before (sendMessage, the bridge call):**
```ts
          const result = await piBridge.sendAgentMessage({
            message: clean,
            context: {},
            ...(state.selectedModel ? { model: state.selectedModel } : {}),
            ...(state.selectedProvider ? { provider: state.selectedProvider } : {}),
          });
```

**After (snap messages BEFORE dispatch, pass as conversation):**
```ts
          // Snap conversation history BEFORE SEND_MESSAGE_REQUEST appends the user message
          const conversationSnapshot = [...state.messages];

          const result = await piBridge.sendAgentMessage({
            message: clean,
            context: {},
            conversation: conversationSnapshot,
            ...(state.selectedModel ? { model: state.selectedModel } : {}),
            ...(state.selectedProvider ? { provider: state.selectedProvider } : {}),
          });
```

> **Critical detail:** `state.messages` at this point does NOT yet include the current user message because we snapshot BEFORE dispatching `SEND_MESSAGE_REQUEST`. The current message (`clean`) is sent as `message` and appended separately in the bridge messages array. The snapshot contains only prior turns. This avoids double-sending the current message.

**Add `writeFile` to the `actions` memo** (after `setModelPreference` and before the closing `}),` of `useMemo`):

```ts
      async writeFile(filename: string, content: string) {
        dispatch({ type: 'WRITE_FILE_REQUEST', filename, content });
        try {
          await piBridge.writeFile(filename, content);
          dispatch({ type: 'WRITE_FILE_SUCCESS', filename });
        } catch (error) {
          const detail = error instanceof Error ? error.message : 'Unknown file system error.';
          dispatch({
            type: 'WRITE_FILE_FAILURE',
            filename,
            error: detail,
            audit: audit({
              category: 'failure',
              title: 'File write failed',
              detail: ,
              source: 'System',
            }),
          });
        }
      },
```

**Quality gate:** `npm run typecheck` must pass with zero errors.

---

### Step 7 — Replace "Latest Pi Code reply" card with scrollable Conversation view (Fixes 2 + 3)

**File:** `src/screens/HomeScreen.tsx`

**Remove the entire block:**
```tsx
      {state.latestReply ? (
        <CalmCard style={styles.stack}>
          <Text style={styles.cardTitle}>Latest Pi Code reply</Text>
          <Text style={styles.cardBody}>{state.latestReply.text}</Text>
          <Text style={styles.muted}>{state.latestReply.summary}</Text>
        </CalmCard>
      ) : null}
```

**Replace with:**
```tsx
      {state.messages.length > 0 ? (
        <View style={styles.conversation}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          {state.messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={styles.messageRole}>
                {msg.role === 'user' ? 'You' : 'Pi Code'}
              </Text>
              <Text
                style={[
                  styles.messageText,
                  msg.role === 'user' ? styles.userText : styles.assistantText,
                ]}
                selectable={msg.role === 'assistant'}
              >
                {msg.text}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
```

**Add new styles to the `styles` StyleSheet object** (after the existing styles):

```ts
  conversation: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.ivory,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  messageBubble: {
    padding: spacing.md,
    borderRadius: radius.md,
    maxWidth: '90%',
    gap: spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.lifted,
    borderWidth: 1,
    borderColor: colors.line,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.graphite,
    borderWidth: 1,
    borderColor: colors.mossDim,
  },
  messageRole: {
    color: colors.moss,
    fontSize: typography.micro,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  messageText: {
    fontSize: typography.body,
    lineHeight: 22,
  },
  userText: {
    color: colors.ivory,
  },
  assistantText: {
    color: colors.textSecondary,
  },
```

**Quality gate:** `npm run typecheck` must pass. Note: `selectable` is a built-in React Native `Text` prop — no type errors expected.

---

### Step 8 — Add auto-scroll-to-bottom in NenShellApp

**File:** `src/shell/NenShellApp.tsx`

**Change import line from:**
```ts
import React from 'react';
```
**To:**
```ts
import React, { useEffect, useRef } from 'react';
```

**Add before the `return` statement** (after the `renderScreen` function):
```tsx
  const scrollRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive (only on home tab)
  useEffect(() => {
    if (state.activeTab === 'home' && state.messages.length > 0) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state.messages.length, state.activeTab]);
```

**Change the `ScrollView` element from:**
```tsx
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
```
**To:**
```tsx
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
```

**Quality gate:** `npm run typecheck` must pass.

---

### Step 9 — Full typecheck and APK build

**Command:**
```bash
cd C:/Users/doner/nen-shell
npm run typecheck
```

**Expected:** zero errors.

**Build release APK:**
```bash
cd C:/Users/doner/nen-shell
npx expo run:android --variant=release
```

> Note: If the project uses `eas build` instead, the Executor should check `eas.json` and use the appropriate build command. The standard Expo managed-workflow build command is shown above.

---

## Files Modified Summary

| # | File | Change |
|---|------|--------|
| 1 | `package.json` | +`expo-file-system` dep (via `npx expo install`) |
| 2 | `src/bridge/piBridge.types.ts` | +`conversation?: AgentMessage[]` to `SendAgentMessageInput`; +`writeFile()` to `PiBridgeClient`; +`AgentMessage` import |
| 3 | `src/bridge/deepseekBridge.ts` | Build messages from `input.conversation`; +`writeFile()` using `FileSystem.writeAsStringAsync`; +`import * as FileSystem` |
| 4 | `src/bridge/mockPiBridge.ts` | +`writeFile()` no-op stub |
| 5 | `src/state/actions.ts` | +`WRITE_FILE_REQUEST`/`SUCCESS`/`FAILURE` to `ShellAction`; +`writeFile()` to `ShellActionsApi` |
| 6 | `src/state/reducer.ts` | +`WRITE_FILE_*` case handlers |
| 7 | `src/state/NenShellContext.tsx` | Snapshot `state.messages` before dispatch; pass `conversation` to bridge; +`writeFile` action; +`import * as FileSystem` |
| 8 | `src/screens/HomeScreen.tsx` | Replace `latestReply` card with full conversation view; +`selectable={true}`; +bubble styles |
| 9 | `src/shell/NenShellApp.tsx` | +`useRef`/`useEffect` for auto-scroll-to-bottom on new messages |

## Files NOT Modified (preserved invariants)

| File | Reason |
|------|--------|
| `src/types/domain.ts` | `AgentMessage` type already supports `role: "user" | "assistant" | "system"` — no changes needed |
| `src/data/initialState.ts` | Safe Mode `blockedKinds` and boot audit left untouched |
| `src/permissions/permissionBroker.ts` | Not invoked by `writeFile` — direct API call, not through approval queue |
| `src/bridge/bridgeClient.ts` | `export const piBridge = deepseekBridge` unchanged |
| `src/state/selectors.ts` | No new selectors needed |
| `src/theme/tokens.ts` | No new tokens needed; HomeScreen styles use existing `colors`/`spacing`/`radius`/`typography` constants |
| `src/components/AgentInput.tsx` | No changes needed |
| `src/components/CalmCard.tsx` | Conversation view uses direct `View` components, not `CalmCard` |

## Handoff Notes

### Key Decisions

1. **Conversation snapshot timing:** The Plan snapshots `state.messages` BEFORE dispatching `SEND_MESSAGE_REQUEST`. This means the `conversation` array sent to DeepSeek contains only prior turns (not the current message, which is sent separately as the final `user` message). This avoids double-sending the current user message. The bridge then builds: `[system, ...conversation, {role:"user", content: userText}]`.

2. **No changes to `SEND_MESSAGE_REQUEST` dispatch order:** The reducer still appends the user message to `state.messages` on `SEND_MESSAGE_REQUEST`. The snapshot in `NenShellContext.tsx` happens in the same synchronous block BEFORE the dispatch, which is correct because JavaScript is single-threaded.

3. **File write is a direct API call, not an approval-queue action.** The user asked for "agency on the phone" — programmatic file access, not a user-confirmed risky action. The `writeFile` method goes through `ShellActionsApi` -> `piBridge.writeFile()` -> `FileSystem.writeAsStringAsync()`. It writes to the app sandboxed document directory, which requires zero Android permissions on API 29+. Safe Mode and `blockedKinds` are not consulted for `writeFile` — if the Executor/Verifier believes writes should be gated behind Safe Mode, that is a design decision for a follow-up change.

4. **`selectable={true}` is a built-in React Native `Text` prop** — no third-party library, no permissions, no platform-specific code. Works on both Android and iOS. Only applied to assistant messages (not user messages, to keep the UI clean).

5. **No `FlatList` — plain `.map()` rendering.** Because the parent `ScrollView` in `NenShellApp.tsx` already provides scrolling, nesting a `FlatList` would create scroll conflicts (anti-pattern). The `.map()` renders all messages inline, and the parent `ScrollView` handles overflow.

6. **Auto-scroll uses `setTimeout(100ms)`** to wait for React Native layout to settle after state changes. This is a pragmatic choice; a more precise approach would use `onLayout` but adds complexity for marginal gain.

### Potential Risks

| Risk | Mitigation |
|------|-----------|
| Token bloat: sending full history on every call | DeepSeek V4 Flash >= 128K context window. 50 turns x 2K chars = ~25K tokens, well within budget. If it becomes a problem, implement summarization later. |
| DeepSeek rate limits with large payloads | The existing `catch` block falls back to `mockPiBridge.sendAgentMessage()`, which now accepts `conversation` without issue. |
| `npx expo install expo-file-system` may pull a version incompatible with expo@54 | `expo-file-system@~19.0.22` is the documented compatible version for SDK 54. Use `npx expo install` (not `npm install`) to get the correct version. |
| ScrollView ref type mismatch | React Native 0.81.5 ScrollView component accepts a `ref` typed as `React.RefObject<ScrollView>`. The `useRef<ScrollView>(null)` pattern is standard. |
| Message duplication if `SEND_MESSAGE_REQUEST` fires before snapshot | Not possible: the snapshot (`const conversationSnapshot = [...state.messages]`) happens on the same line before `dispatch`, synchronously, in single-threaded JS. |

### Unknowns for Executor

1. **Exact `expo-file-system` version** — `npx expo install` will resolve this. If it errors, fall back to `npm install expo-file-system@~19.0.22`.
2. **APK build command** — the project may use `eas build` or a custom Gradle pipeline. The Executor should check `eas.json`, `app.json`, or existing build scripts. If `eas build` is configured, use that; otherwise `npx expo run:android --variant=release`.
3. **`KeyboardAvoidingView` behavior with auto-scroll** — on Android with keyboard open, the `behavior="height"` may interact with `scrollToEnd`. If the scroll position is off when the keyboard is visible, it is acceptable — the user can manually scroll.

### Executor Order of Operations

1. Install expo-file-system (Step 1)
2. piBridge.types.ts (Step 2) -> causes type errors in bridge files
3. deepseekBridge.ts (Step 3) -> resolves its errors
4. mockPiBridge.ts (Step 4) -> resolves its errors; typecheck should pass
5. actions.ts + reducer.ts (Step 5) -> causes error in NenShellContext
6. NenShellContext.tsx (Step 6) -> resolves error; typecheck should pass
7. HomeScreen.tsx (Step 7) -> typecheck should pass
8. NenShellApp.tsx (Step 8) -> typecheck should pass
9. Full typecheck + APK build (Step 9)

### Verifier Guidance

- **Fix 1 (context):** The Verifier should check that `NenShellContext.tsx` snapshots `state.messages` BEFORE `dispatch({ type: "SEND_MESSAGE_REQUEST", message })`, and that `deepseekBridge.ts` reads from `input.conversation` to build the messages array.
- **Fix 2 (scroll):** The Verifier should confirm `HomeScreen.tsx` no longer renders `state.latestReply` in isolation and instead maps `state.messages`.
- **Fix 3 (copy):** The Verifier should confirm `selectable={true}` appears on at least one `Text` component rendering AI reply content.
- **Fix 4 (write):** The Verifier should confirm `expo-file-system` is in `package.json`, `PiBridgeClient` has a `writeFile` method, and `ShellActionsApi` has a `writeFile` method.
- **Typecheck:** `npm run typecheck` must exit 0.