---
artifact_type: RESEARCH
role: RESEARCHER
run_id: RUN_20260430-232634
context_saturation_estimate: "~12%"
---

# RESEARCH — Session Context, Scrollable Output, Copy/Paste, File System

## Investigation Scope
Per INTAKE: Investigate 5 areas to surface constraints and patterns the Planner needs.

## Key Findings

### 1. DeepSeek Multi-Turn Conversation API
**Evidence:** src/bridge/deepseekBridge.ts lines 149–155

**Current behavior:** Every sendAgentMessage call builds a fresh 2-message array with only system + userText. No conversation history is included. Root cause of session-context-loss.

**API details:**
- Endpoint: https://api.deepseek.com/chat/completions
- Format: OpenAI-compatible { role, content } message objects
- stream: false, thinking: disabled
- Multi-turn = include all prior messages in the array
- Context window: deepseek-v4-flash >= 128K tokens (consistent with DeepSeek V-series). 50 turns at 2000 chars each = ~25K tokens, well within budget.
- No API-side session management; history is client responsibility.

### 2. React Native Conversation UI Patterns
**Evidence:** src/screens/HomeScreen.tsx, src/shell/NenShellApp.tsx

**Key discovery:** NenShellApp.tsx already wraps HomeScreen in ScrollView (line 17). Rendering all messages automatically = scrollable.
- HomeScreen only renders state.latestReply in a CalmCard, not state.messages
- Text has no selectable={true} prop
- FlatList inside parent ScrollView is anti-pattern; parent ScrollView handles scrolling
- Auto-scroll-to-bottom needs a ref or callback from parent ScrollView
- selectable prop works on both iOS/Android with no permissions

### 3. expo-file-system Integration
**Evidence:** package.json, node_modules inspection

- NOT in project package.json
- NOT in node_modules (despite being expo@54 dependency at ~19.0.22)
- Install: npx expo install expo-file-system
- API: FileSystem.writeAsStringAsync(path, contents, options)
- Paths: FileSystem.documentDirectory, FileSystem.cacheDirectory
- Android permissions: None needed for app sandbox on API 29+
- ActionRisk already has 'risky_file' level

### 4. State Management for Conversation History
**Evidence:** src/types/domain.ts, src/state/reducer.ts, src/state/NenShellContext.tsx, src/bridge/piBridge.types.ts

**Critical finding:** state.messages already accumulates both user and assistant messages:
- SEND_MESSAGE_REQUEST appends user message
- SEND_MESSAGE_SUCCESS appends assistant reply
- AgentMessage type supports role: 'user'|'assistant'|'system' -- sufficient
- AgentReply extends AgentMessage with summary -- compatible
- No domain.ts type changes needed

**The gap is in the bridge, not the state:**
- NenShellContext.sendMessage() never passes state.messages to piBridge.sendAgentMessage()
- SendAgentMessageInput has no history field (only: message, context?, text?, model?, provider?)
- The context field exists but is unused

**Recommended fix:** Add conversation?: AgentMessage[] to SendAgentMessageInput in piBridge.types.ts

### 5. Additional Discoveries
- Safe Mode blocks modify_file, delete_file by default (initialState.ts)
- ScrollView already wraps all screens in NenShellApp.tsx
- No third-party deps needed beyond expo-file-system
- mockPiBridge is deterministic; adding history support is cosmetic but maintains contract

## Constraints Identified
| # | Constraint | Source |
|---|-----------|--------|
| C1 | deepseekBridge is stateless -- must receive history as parameter | deepseekBridge.ts:149-155 |
| C2 | HomeScreen has no access to NenShellApp ScrollView ref | NenShellApp.tsx:17 |
| C3 | expo-file-system not installed -- need npx expo install | node_modules |
| C4 | Parent ScrollView + nested FlatList is anti-pattern | RN best practices |
| C5 | thinking:disabled and stream:false are safe defaults | deepseekBridge.ts |
| C6 | Safe Mode blocks risky_file by default | initialState.ts |
| C7 | npm run typecheck must pass | INTAKE I7 |
| C8 | No app-launcher behavior | INTAKE constraint |

## Existing Patterns
1. **State->Bridge:** NenShellContext calls bridge with { message, context: {} } -- bridge never sees history
2. **State accumulation:** messages array accumulates both user+assistant via reducer
3. **UI rendering:** Only latestReply shown, not full messages array
4. **App-shell:** ScrollView in NenShellApp wraps all screens
5. **Safety:** Permission broker + blockedKinds gate risky operations

## Recommendations

### Fix 1: Session Context (highest priority)
1. Add conversation?: AgentMessage[] to SendAgentMessageInput in piBridge.types.ts
2. In NenShellContext.sendMessage(), capture state.messages BEFORE dispatching SEND_MESSAGE_REQUEST, then pass as conversation
3. In deepseekBridge.sendAgentMessage(), build: [system, ...conversation, user]
4. Mirror in mockPiBridge for type consistency

### Fix 2: Scrollable Conversation Display
Replace latestReply CalmCard with state.messages.map() render, each with role label and selectable={true} text. Parent ScrollView handles scrolling.

### Fix 3: Copy/Paste
Add selectable={true} to Text components rendering AI replies.

### Fix 4: File System
1. npx expo install expo-file-system
2. Add writeFile to ShellActionsApi
3. Add WRITE_FILE_SUCCESS/FAILURE action types to ShellAction
4. Implement in NenShellContext using FileSystem.writeAsStringAsync

### Approach Order
1. Fix conversation history (piBridge.types.ts, deepseekBridge.ts, NenShellContext.tsx, mockPiBridge.ts)
2. Fix UI (HomeScreen.tsx)
3. Add file system (package.json, actions.ts, reducer.ts, NenShellContext.tsx)

## Unknowns Remaining
1. DeepSeek V4 Flash exact context window (assume >= 128K)
2. Auto-scroll with keyboard visibility on Android
3. File write triggering UX (suggestedActions? new ActionKind? direct API call?)
4. System prompt in state.messages? (No -- bridge-injected only, not for display)
5. DeepSeek rate limits (behavioral concern, not code)
