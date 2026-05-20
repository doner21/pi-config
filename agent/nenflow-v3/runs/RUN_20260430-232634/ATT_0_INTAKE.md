---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260430-232634
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~40%"
---

# INTAKE — Session Context, Scrollable Output, Copy/Paste, File System Access

## Task Summary

Fix four interconnected issues in the standalone Android Nen Shell app:

1. **Session context is lost between messages.** Every `sendAgentMessage` call starts a new DeepSeek conversation instead of continuing the existing one. Messages must be part of one continuous Pi Code session from app launch until app close. A new session should only start when a new Nen Shell instance is opened.

2. **Large AI output is not visible or scrollable.** The HomeScreen only shows `latestReply.text` in a plain `Text` component. When the AI produces large output, the user cannot see all of it and cannot scroll through it.

3. **No copy/paste support.** Users cannot copy text from the AI output.

4. **No file system write access.** The app needs to be able to write to files and folders on the phone to have real agency.

## Task Type

**Feature implementation + bug fix.** This spans:
- Stateful conversation management (in-memory message history array)
- UI improvements (scrollable conversation view, selectable text)
- File system integration (expo-file-system)

## User Intent

The user has tested the standalone APK on their phone and found these four blockers:

- **"Every time we send a message, it starts a new Pi Code session, and therefore doesn't have any context."** — The core problem. The bridge sends a fresh `messages: [system, userText]` array on every call.
- **"When we start a session by starting Nen Shell, any messages that we send to Nen Shell should be in one Pi session. It shouldn't start a new session every time we send a message."** — Clear invariant: one session = one app lifecycle.
- **"I can't see or scroll through its output."** — Only the latest reply is displayed, not the conversation history.
- **"I need to see every bit of output that it produces. This should be scrollable."** — Need a scrollable conversation view showing all messages.
- **"I should also be able to copy and paste that output."** — Text selection needed.
- **"It needs to have as much agency on the phone as possible, so I need it to be able to write to files and folders on my phone."** — File system write access.

## Goal Attractor

A phone app where:
1. Messages accumulate in one DeepSeek conversation session per app launch
2. The full conversation history is displayed and scrollable
3. Users can select and copy text from AI replies
4. The app can write files to the phone's file system

## Current Architecture Analysis

### P1: Session Context — Root Cause

In `src/bridge/deepseekBridge.ts`, lines 149–155:

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

The `messages` array is rebuilt from scratch on every call. No conversation history is preserved between calls. This is stateless — every user message appears to the AI as the first interaction.

### P2: Scrollable Output — Root Cause

In `src/screens/HomeScreen.tsx`, lines 47–53:

```tsx
{state.latestReply ? (
  <CalmCard style={styles.stack}>
    <Text style={styles.cardTitle}>Latest Pi Code reply</Text>
    <Text style={styles.cardBody}>{state.latestReply.text}</Text>
    <Text style={styles.muted}>{state.latestReply.summary}</Text>
  </CalmCard>
) : null}
```

Only `latestReply` is rendered. The full `state.messages` array (which contains all user and assistant messages) is never displayed. Large replies get clipped because `Text` in React Native doesn't scroll internally without being in a `ScrollView`.

### P3: Copy/Paste — Root Cause

The `Text` component for the reply does not have `selectable={true}`. No copy button or gesture exists.

### P4: File System — Root Cause

The bridge contract (`PiBridgeClient`) has no method for writing files. The `ShellActionsApi` has no `writeFile` action. No file system permissions are requested.

`expo-file-system` is already in the dependency tree (seen in the build log), but is not imported or used anywhere.

## Constraints

1. One DeepSeek conversation per app lifecycle — context must persist only in-memory (no disk storage of conversation needed).
2. System prompt must be sent as the first message, followed by all user/assistant turns.
3. The conversation view must be scrollable and show all messages (user + assistant).
4. File writes must be opt-in/safe — not automatic.
5. `npm run typecheck` must still pass.
6. Safe Mode and permission broker must remain intact.
7. No app-launcher behavior.

## Invariants

| # | Invariant | Rationale |
|---|-----------|-----------|
| I1 | Conversation history accumulates in-memory for the app lifecycle | User's core demand: one session per app launch |
| I2 | Full conversation history sent to DeepSeek on each call | Needed for the AI to maintain context |
| I3 | All messages displayed in scrollable area | User must see all output |
| I4 | AI reply text is selectable/copyable | User must copy text |
| I5 | File writes are possible via a bridge or action method | User needs file write agency |
| I6 | Safe Mode may restrict file writes (risky_file) | Existing safety invariant |
| I7 | `npm run typecheck` passes | Quality gate |
| I8 | Bridge interface contract preserved | Codebase contract |

## Success Criteria

1. Sending three messages in sequence produces context-aware AI replies (the AI "remembers" earlier messages)
2. All sent messages and replies are visible on the Home screen in chronological order
3. The conversation area is scrollable when content exceeds screen height
4. Long-pressing or selecting AI reply text works for copy
5. The app can write a text file to the phone's documents directory via an explicit user action
6. `npm run typecheck` passes
7. A new release APK builds successfully

## Ambiguities

1. **File write UX.** How should the user trigger a file write? Via the approval queue? A direct action? The user didn't specify. Simplest approach: add a `writeFile` method to the bridge/actions that can be called programmatically (e.g., when the AI suggests a file write action).

2. **expo-file-system capability.** Is `expo-file-system` already installed and accessible? It appeared in the build log but isn't in `package.json`. May need to install explicitly.

3. **API key token usage.** With full conversation history being sent on every call, token usage will increase. The DeepSeek V4 Flash context window should be large enough, but this is a cost consideration.

## Routing Decision

**RECOMMENDED NEXT STEP: RESEARCH**

Need to verify:
- expo-file-system installation and API for React Native file writes
- React Native `ScrollView` + `FlatList` patterns for conversation UIs
- `selectable` prop behavior on Android
- DeepSeek API token limits for multi-turn conversations with full history
