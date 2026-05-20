---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260429-130311
context_saturation_estimate: "~12%"
---

# Nen Shell Expo/React Native UI Plan

## Task Statement
Build the first working mobile-first Expo/React Native vertical slice for Nen Shell in the empty `C:/Users/doner/nen-shell` repo. The app must present a calm, safe-by-default agentic shell: Home -> agent input -> mock Pi Code reply -> suggested action -> approval queue -> audit log, with Home, Brief, Tasks, and System screens and a modular bridge that can later be replaced by a real Pi Code HTTP/WebSocket bridge.

## Context Found During Planning
- Intake read: `C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260429-130311/ATT_0_INTAKE.md`.
- Repo path: `C:/Users/doner/nen-shell`; currently empty, with no `package.json`, source files, or Graphify artifacts.
- Capati registry checked; `nen-shell` is not a linked Capati project, so no existing project memory applies.
- Frontend-design guidance applies: use an intentional, refined visual direction, not a generic AI dashboard.

## Invariants
- Implement only inside `C:/Users/doner/nen-shell`; do not modify unrelated project/source files.
- Use Expo/React Native TypeScript; avoid native Android code for this first slice.
- Use local/mock state, mock connectors, and mock Pi Code bridge only.
- Do not implement real Gmail/Telegram/Calendar auth, root actions, app shortcuts, notification listener, or app-opening controls.
- Gmail/Telegram/Calendar may appear only as passive source labels/statuses; never as destinations to open.
- No launcher grid, no addictive notification feed, no infinite feed, no red urgency badges.
- Safe Mode defaults ON and blocks sending, deleting/modifying files, root, and system-state changes.
- Root/system actuator remains locked by default and cannot trigger a real action.
- Approval/rejection/block/failure events must be audit logged; audit also records checks, summaries, drafts, and permission requests.
- Mock bridge must expose replaceable endpoint-like boundaries for future HTTP/WebSocket Pi Code integration.
- UI must be mobile-first, dark, calm, restrained, with soft cards, large type, quiet accent colors, and generous spacing.
- Preserve TypeScript type safety across UI, bridge, scheduler, connectors, permissions, and audit log.

## Success Criteria
1. Repo contains a minimal Expo TypeScript scaffold with scripts: `start`, `android`, `ios`, `web`, `typecheck`.
2. App launches through Expo after dependency install.
3. Home shows greeting, today summary, attention counts, schedule summary, priorities, agent input, voice placeholder, and latest mock reply.
4. Sending a message produces a deterministic mock Pi Code response without network access.
5. A suggested action is created and appears in the Tasks approval queue.
6. Brief shows calm digest content with Gmail/Telegram/Calendar as source labels only.
7. Tasks supports approve/reject and shows pending, approved/rejected/blocked states.
8. With Safe Mode ON, approval of risky send/file/system/root actions is blocked and audit logged.
9. System shows bridge health, scheduler heartbeat/jobs, connector statuses, autonomy/permission state, Safe Mode toggle, locked root actuator, and audit timeline.
10. Required TODOs exist for Android kiosk mode, notification listener, Gmail API, Telegram connector, Calendar connector, and real Pi Code bridge.
11. `npm run typecheck` passes.
12. Manual inspection confirms no app grid, no open-app buttons, no real connector side effects, and no unsafe sending/deleting/root behavior.

## Implementation Steps

### 1. Scaffold the Expo app
1. From `C:/Users/doner/nen-shell`, scaffold a blank TypeScript Expo app:
   ```bash
   cd C:/Users/doner/nen-shell
   npx create-expo-app@latest . --template blank-typescript
   ```
2. If the scaffold command refuses due the existing directory, manually create the equivalent minimal Expo files (`package.json`, `app.json`, `tsconfig.json`, `App.tsx`) using compatible versions from `create-expo-app`/`expo install` rather than hand-pinning stale React Native versions.
3. Keep the first slice dependency-light: no React Navigation, no Expo Router, no Zustand/Redux. Use React local state/context and custom tabs.
4. Ensure `package.json` scripts include:
   - `start`: `expo start`
   - `android`: `expo start --android`
   - `ios`: `expo start --ios`
   - `web`: `expo start --web`
   - `typecheck`: `tsc --noEmit`

### 2. Create source structure
Create this structure:
```text
src/
  app/NenShellApp.tsx
  bridge/{bridgeClient.ts,mockPiBridge.ts,piBridge.types.ts}
  components/{AgentInput.tsx,ApprovalCard.tsx,AuditTimeline.tsx,BottomNav.tsx,CalmCard.tsx,ConnectorRow.tsx,FieldPill.tsx,LockedActuatorCard.tsx,MetricTile.tsx,SafeModeBanner.tsx,SchedulerPanel.tsx,StatusPill.tsx,ToggleRow.tsx}
  connectors/{calendarConnector.ts,gmailConnector.ts,telegramConnector.ts}
  data/{initialState.ts,mockBrief.ts}
  permissions/{permissionBroker.ts,safetyPolicy.ts}
  scheduler/mockScheduler.ts
  screens/{BriefScreen.tsx,HomeScreen.tsx,SystemScreen.tsx,TasksScreen.tsx}
  state/{actions.ts,reducer.ts,NenShellContext.tsx,selectors.ts}
  theme/tokens.ts
  types/domain.ts
  utils/{ids.ts,time.ts}
```
Keep `App.tsx` thin: it should import and render `src/app/NenShellApp.tsx`.

### 3. Define domain types first
Implement `src/types/domain.ts` before UI code. Include:
- `TabId = 'home' | 'brief' | 'tasks' | 'system'`.
- `SourceLabel = 'Gmail' | 'Telegram' | 'Calendar' | 'Pi Code' | 'System' | 'Scheduler'`.
- `ConnectorStatus`, `BridgeHealth`, `SchedulerJob`, `SchedulerSnapshot`.
- `AgentMessage`, `AgentReply`, `AgentTurnResult`.
- `ActionKind = 'summarize' | 'draft_reply' | 'send_message' | 'modify_file' | 'delete_file' | 'schedule_reminder' | 'system_change' | 'root_command'`.
- `ActionRisk = 'low' | 'requires_confirmation' | 'risky_send' | 'risky_file' | 'risky_system' | 'root'`.
- `SuggestedAction`, `ApprovalTask`, `AuditEntry`, `PermissionState`, and `ShellState`.
Do not include app URIs, package names, deep links, or destination/open fields in connector/source types.

### 4. Theme and visual direction
Implement `src/theme/tokens.ts` with a cohesive dark calm palette:
- Ink/graphite backgrounds: `#080A0D`, `#10151A`, `#151B21`.
- Restrained accents: moss/sage `#9FB7A1`, warm amber `#D6B16A`.
- Text: soft ivory/slate `#F1EDE3`, `#AAB2B8`, `#6F7A82`.
- Muted amber/stone for blocked/risky states; avoid red badges.
- Spacing, radius, shadow/elevation, typography sizes, and touch target sizes.
Design direction: “quiet cockpit / monastic command surface” — refined dark cards, small luminous status dots, calm hierarchy, no dopamine UI.

### 5. Mock Pi Code bridge boundary
Implement endpoint-like interfaces in `src/bridge/piBridge.types.ts` and `src/bridge/mockPiBridge.ts`:
- `GET /health` -> `getHealth(): Promise<BridgeHealth>`.
- `POST /agent/message` -> `sendAgentMessage(input): Promise<AgentTurnResult>`.
- `GET /scheduler/jobs` -> `getSchedulerSnapshot(): Promise<SchedulerSnapshot>`.
- `POST /actions/:id/approve` -> `approveAction(task): Promise<ActionDecisionResult>`.
- `POST /actions/:id/reject` -> `rejectAction(task): Promise<ActionDecisionResult>`.
`mockPiBridge.ts` should use no network, simulate short latency, return deterministic replies, and always return at least one `SuggestedAction`. Include a risky `send_message` action often enough to demonstrate Safe Mode blocking. Export the selected bridge from `src/bridge/bridgeClient.ts`. Add `TODO(real-pi-code-bridge): replace mock with local HTTP/WebSocket Pi Code bridge.`

### 6. Permission broker and safety policy
Implement `src/permissions/safetyPolicy.ts`:
- `isRiskBlockedBySafeMode(action, safeMode)` returns true when Safe Mode is ON and risk is `risky_send`, `risky_file`, `risky_system`, or `root`.
- Also block kinds `send_message`, `modify_file`, `delete_file`, `system_change`, and `root_command`.
Implement `src/permissions/permissionBroker.ts`:
- `evaluateApproval({ action, safeMode, rootLocked })` returns `{ allowed: boolean; reason?: string }`.
- Root/system actions are blocked when `rootLocked` is true.
- Safe Mode blocks risky actions with calm human-readable reasons.
- Broker performs no side effects.

### 7. Mock connectors and scheduler
Implement connector status modules:
- `src/connectors/gmailConnector.ts` with mock status and `TODO(gmail-api): implement OAuth/API connector without open-app launcher behavior.`
- `src/connectors/telegramConnector.ts` with mock status and `TODO(telegram-connector): implement Telegram connector with explicit permissions.`
- `src/connectors/calendarConnector.ts` with mock status and `TODO(calendar-connector): implement Calendar connector with read-only default.`
Implement `src/scheduler/mockScheduler.ts` with heartbeat timestamp and 2-3 jobs such as Morning brief, Calendar drift check, Approval queue sweep. Add `TODO(android-notification-listener): integrate Android notification listener after permission design.`

### 8. Initial state and reducer
Implement `src/data/initialState.ts` with:
- `safeMode: true`, `rootLocked: true`.
- Mock bridge health, connector statuses, scheduler snapshot.
- Brief sections, priorities, attention counts.
- Initial audit entries for boot/checks/summary.
- Empty or small initial approval queue.
Implement reducer/context in `src/state/` using `React.createContext` + `useReducer`:
- Actions: set active tab, send message request/success/failure, add audit, approve task, reject task, block task, toggle Safe Mode, refresh status.
- On agent success: add reply, convert each `SuggestedAction` to `ApprovalTask(status: 'pending')`, audit summary/draft/permission request.
- On approval: call permission broker first. If blocked, mark blocked and audit `blocked`/`failure`; if allowed, mark approved and audit `approval` only (still mock-only).
- On reject: mark rejected and audit `rejection`.

### 9. Reusable components
Build typed, side-effect-free components:
- `CalmCard`: shared surface.
- `StatusPill`: subtle status indicator.
- `FieldPill`: passive source label pill.
- `MetricTile`: attention/schedule metric.
- `BottomNav`: Home, Brief, Tasks, System; subtle counts only, no red badges.
- `AgentInput`: text input, send button, loading state, non-functional voice placeholder.
- `ApprovalCard`: action details, risk explanation, approve/reject buttons, status.
- `AuditTimeline`: chronological audit entries.
- `SafeModeBanner`, `ToggleRow`, `ConnectorRow`, `SchedulerPanel`, `LockedActuatorCard`.
Use `SafeAreaView`, `ScrollView`, `KeyboardAvoidingView`, large touch targets, and phone portrait spacing.

### 10. Screens
`HomeScreen.tsx` must show greeting, today summary, attention counts, schedule summary, priorities, agent input, voice placeholder, latest reply, and suggested next action preview. Send flow: validate input -> dispatch loading -> call bridge -> dispatch success -> add task/audit; on failure audit `failure`.

`BriefScreen.tsx` must show daily digest sections and passive source labels for Gmail/Telegram/Calendar. It must not include open buttons, message feed, or launcher controls.

`TasksScreen.tsx` must show pending approvals first, then completed/rejected/blocked. Approve/reject via `ApprovalCard`. With Safe Mode ON, approving risky actions must visibly block and audit the block.

`SystemScreen.tsx` must show bridge health, scheduler heartbeat/jobs, connector statuses, Safe Mode toggle, autonomy/permission state, locked root actuator, and audit timeline. Add `TODO(android-kiosk-mode): evaluate launcher/kiosk mode without app-grid UX.`

### 11. App shell/navigation
Implement `src/app/NenShellApp.tsx`:
- Wrap children in `NenShellProvider`.
- Apply dark background and Expo status bar style.
- Render the active screen from state.
- Render persistent custom bottom nav.
- Keep layout mobile-first; avoid desktop/dashboard assumptions.

## Validation Strategy
Run from `C:/Users/doner/nen-shell` after implementation:
```bash
npm install
npm run typecheck
npm start
```
If available, also run:
```bash
npx expo-doctor
```
Manual checklist:
1. Expo app opens on phone/emulator/Expo Go.
2. Home displays required greeting, summary, counts, schedule, priorities, input, and voice placeholder.
3. Sending text creates a mock reply and a queued suggested action.
4. Tasks approve/reject works; risky approval is blocked while Safe Mode is ON and audit logged.
5. System displays bridge, scheduler, connectors, Safe Mode, permissions, locked root actuator, and audit timeline.
6. Brief uses source labels only and has no open-app controls.
7. Verify no forbidden launcher patterns:
   ```bash
   grep -Rni "Open Gmail\|Open Telegram\|Linking.openURL\|intent://\|package=" src || true
   ```
8. Verify TODOs:
   ```bash
   grep -Rni "TODO(real-pi-code-bridge)\|TODO(gmail-api)\|TODO(telegram-connector)\|TODO(calendar-connector)\|TODO(android-notification-listener)\|TODO(android-kiosk-mode)" src
   ```

## File Structure Summary
Expected final shape:
```text
C:/Users/doner/nen-shell/
  App.tsx
  app.json
  package.json
  tsconfig.json
  package-lock.json          # if npm install is used
  assets/                     # if generated by Expo
  src/
    app/NenShellApp.tsx
    bridge/{bridgeClient.ts,mockPiBridge.ts,piBridge.types.ts}
    components/{AgentInput.tsx,ApprovalCard.tsx,AuditTimeline.tsx,BottomNav.tsx,CalmCard.tsx,ConnectorRow.tsx,FieldPill.tsx,LockedActuatorCard.tsx,MetricTile.tsx,SafeModeBanner.tsx,SchedulerPanel.tsx,StatusPill.tsx,ToggleRow.tsx}
    connectors/{calendarConnector.ts,gmailConnector.ts,telegramConnector.ts}
    data/{initialState.ts,mockBrief.ts}
    permissions/{permissionBroker.ts,safetyPolicy.ts}
    scheduler/mockScheduler.ts
    screens/{BriefScreen.tsx,HomeScreen.tsx,SystemScreen.tsx,TasksScreen.tsx}
    state/{actions.ts,reducer.ts,NenShellContext.tsx,selectors.ts}
    theme/tokens.ts
    types/domain.ts
    utils/{ids.ts,time.ts}
```

## Risks and Mitigations
- **Expo version drift:** use `create-expo-app@latest` to generate compatible dependency versions.
- **Dependency bloat:** avoid navigation/state/UI libraries for the first vertical slice.
- **Accidental launcher UX:** connectors are passive labels/statuses only; grep for open-app patterns.
- **Unsafe action semantics:** broker blocks risky/root/system actions by default; all approvals remain mock-only.
- **Generic aesthetics:** follow quiet cockpit/monastic command direction with restrained color and polished spacing.
- **Mobile ergonomics:** use large touch targets, keyboard-aware input, scrollable screens, and persistent bottom nav.

## Handoff Notes
- The Executor should implement only project files in `C:/Users/doner/nen-shell`.
- This Planner intentionally did not modify project source files; only NenFlow artifacts were written.
- The repo starts empty, so no existing app conventions need preserving.
- Prioritize the vertical proof: prompt -> mock reply -> suggested action -> approval queue -> approve/reject/block -> audit log.
- All integrations are mock-only; persistence is not required.
- The most important safety proof is Safe Mode ON blocking risky actions and logging that block.
- If implementation time is limited, prioritize behavior, type safety, and safety/audit invariants over decorative polish while keeping the calm dark mobile-first direction.
