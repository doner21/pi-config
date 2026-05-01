---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260430-202148
context_saturation_estimate: "~18%"
---

## Task Statement

Make Safe Mode toggleable directly from Home and Tasks screens via the SafeModeBanner Switch, add a "Disable Safe Mode" call-to-action on blocked ApprovalCard items, and show a confirmation Alert before disabling while preserving the existing System screen toggle unchanged and without modifying permission broker or safety policy logic.

## Invariants

- npm run typecheck passes with zero errors
- Safe Mode defaults to ON on fresh app install (no changes to src/data/initialState.ts)
- Blocked dangerous actions cannot be approved without disabling Safe Mode (permission broker logic in src/permissions/permissionBroker.ts and src/permissions/safetyPolicy.ts is NOT modified)
- Root commands remain locked regardless of Safe Mode (rootLocked check in evaluateApproval is NOT modified)
- All audit entries still record (existing audit dispatch pattern is preserved; SET_SAFE_MODE also writes an audit entry)
- The System screen ToggleRow for Safe Mode continues to use actions.toggleSafeMode and works identically
- No new npm dependencies are introduced
- SafeModeBanner still renders correctly when enabled is true AND when enabled is false (existing styling is retained)

## Success Criteria

1. Home screen banner toggle: SafeModeBanner on Home renders a Switch; toggling it OFF shows an Alert.alert confirmation; confirming disables Safe Mode; toggling ON disables immediately without confirmation
2. Tasks screen banner toggle: SafeModeBanner on Tasks renders a Switch with identical confirmation behaviour
3. Disable Safe Mode confirmation: the Alert explains what becomes possible when Safe Mode is disabled (outbound sends, file changes, system changes become possible)
4. Blocked ApprovalCard CTA: when ApprovalCard renders a task with status blocked, it shows a "Disable Safe Mode to approve" button; tapping it shows the same confirmation Alert; confirming calls the onDisableSafeMode callback
5. Unblock + approve flow: after disabling Safe Mode via the ApprovalCard CTA, the user can tap Approve on the now-unblocked task (the task must be re-approvable by calling actions.approveTask after Safe Mode is off)
6. System screen parity: the System screen ToggleRow for Safe Mode still works, stays in sync with the state, and does NOT show a confirmation dialog
7. Typecheck passes: npm run typecheck exits 0

## Implementation Steps

### Step 1: Add SET_SAFE_MODE action type

File: src/state/actions.ts

Add to the ShellAction discriminated union, after TOGGLE_SAFE_MODE:

    | { type: "SET_SAFE_MODE"; enabled: boolean }

Also add setSafeMode to ShellActionsApi:

    setSafeMode(enabled: boolean): void;

The complete ShellActionsApi after edit will be:

    export type ShellActionsApi = {
      setActiveTab(tab: TabId): void;
      sendMessage(text: string): Promise<void>;
      approveTask(task: ApprovalTask): Promise<void>;
      rejectTask(task: ApprovalTask): Promise<void>;
      toggleSafeMode(): void;
      setSafeMode(enabled: boolean): void;   // NEW
      setModelPreference(model?: string, provider?: string): void;
      refreshStatus(): Promise<void>;
    };

### Step 2: Handle SET_SAFE_MODE in the reducer

File: src/state/reducer.ts

Add a case before SET_MODEL_PREFERENCE:

    case "SET_SAFE_MODE":
      return {
        ...state,
        permission: {
          ...state.permission,
          safeMode: action.enabled,
        },
      };

### Step 3: Implement setSafeMode in the context provider

File: src/state/NenShellContext.tsx

In the actions useMemo, add after toggleSafeMode():

    setSafeMode(enabled: boolean) {
      dispatch({ type: "SET_SAFE_MODE", enabled });
      dispatch({
        type: "ADD_AUDIT",
        entry: audit({
          category: "check",
          title: "Safe Mode changed",
          detail: enabled ? "Safe Mode was turned on." : "Safe Mode was turned off for review.",
          source: "System",
        }),
      });
    },

Add setSafeMode to the return object in the useMemo, between toggleSafeMode and setModelPreference. No dependency array changes needed (dispatch and audit are stable).

### Step 4: Make SafeModeBanner interactive with confirmation

File: src/components/SafeModeBanner.tsx

Replace the entire component. The new version:

- Import Switch and Alert from react-native in addition to existing imports
- Accept onToggle: () => void prop alongside enabled: boolean
- Render a row (flexDirection row, justifyContent space-between, alignItems center) with the title text and a Switch
- Switch uses trackColor={{ false: colors.line, true: colors.mossDim }} and thumbColor={enabled ? colors.moss : colors.stone}
- When enabled is true and Switch is flipped to false: show Alert.alert with title "Disable Safe Mode?", message "Outbound sends, file changes, and system changes will become possible. Root commands remain locked regardless. Audit entries will still be recorded for every action.", cancel button "Keep On" (style cancel), confirm button "Disable" (style destructive, calls onToggle)
- When enabled is false and Switch is flipped to true: call onToggle immediately
- Body text renders below the row as before
- Existing banner/bannerLoose/title/body styles remain; add a row style: flexDirection row, alignItems center, justifyContent space-between

### Step 5: Pass onToggle from HomeScreen

File: src/screens/HomeScreen.tsx

Change SafeModeBanner from:

    <SafeModeBanner enabled={state.permission.safeMode} />

to:

    <SafeModeBanner enabled={state.permission.safeMode} onToggle={actions.toggleSafeMode} />

No other changes to HomeScreen.

### Step 6: Pass onToggle from TasksScreen and onDisableSafeMode to ApprovalCard

File: src/screens/TasksScreen.tsx

Change SafeModeBanner from:

    <SafeModeBanner enabled={state.permission.safeMode} />

to:

    <SafeModeBanner enabled={state.permission.safeMode} onToggle={actions.toggleSafeMode} />

Update both ApprovalCard render calls (in the Pending section and the Completed section) to pass onDisableSafeMode:

    <ApprovalCard
      key={task.id}
      task={task}
      onApprove={actions.approveTask}
      onReject={actions.rejectTask}
      onDisableSafeMode={actions.toggleSafeMode}
    />

### Step 7: Add Disable Safe Mode CTA to ApprovalCard

File: src/components/ApprovalCard.tsx

- Add onDisableSafeMode?: () => void to props destructuring
- Import Alert from react-native
- After the decisionReason render and before the pending actions block, add a blocked status block:

    {task.status === "blocked" && onDisableSafeMode ? (
      <View style={styles.blockedActions}>
        <Text style={styles.blockedHint}>
          Safe Mode is blocking this approval. Disable it to proceed.
        </Text>
        <TouchableOpacity
          style={styles.disableSafeMode}
          onPress={() => {
            Alert.alert(
              "Disable Safe Mode?",
              "Outbound sends, file changes, and system changes will become possible. Root commands remain locked regardless. Audit entries will still be recorded for every action.",
              [
                { text: "Keep On", style: "cancel" },
                { text: "Disable", style: "destructive", onPress: onDisableSafeMode },
              ],
            );
          }}
          accessibilityRole="button"
        >
          <Text style={styles.disableSafeModeText}>Disable Safe Mode to approve</Text>
        </TouchableOpacity>
      </View>
    ) : null}

- Add new styles: blockedActions (borderTopColor colors.line, borderTopWidth 1, gap spacing.sm, paddingTop spacing.md), blockedHint (color colors.amber, fontSize typography.small, lineHeight 18), disableSafeMode (alignItems center, borderColor colors.amber, borderRadius radius.xl, borderWidth 1, justifyContent center, minHeight touch.min), disableSafeModeText (color colors.amber, fontWeight 800)

### Step 8: Typecheck

Run:

    npm run typecheck

Expected: exit code 0, no errors. Fix any type errors before proceeding.

Common pitfalls:
- Forgetting to import Alert in SafeModeBanner.tsx or ApprovalCard.tsx
- Prop name mismatch between component and call site
- actions.toggleSafeMode not satisfying () => void (it does, but verify if any refactoring error occurs)

## Handoff Notes

### Files changed (7 total)

| File | Change |
|------|--------|
| src/state/actions.ts | Add SET_SAFE_MODE action type + setSafeMode API method |
| src/state/reducer.ts | Add SET_SAFE_MODE case |
| src/state/NenShellContext.tsx | Implement setSafeMode(enabled) with audit trail |
| src/components/SafeModeBanner.tsx | Add Switch toggle + confirmation Alert |
| src/screens/HomeScreen.tsx | Pass onToggle to SafeModeBanner |
| src/screens/TasksScreen.tsx | Pass onToggle to SafeModeBanner + onDisableSafeMode to ApprovalCard |
| src/components/ApprovalCard.tsx | Add onDisableSafeMode prop + blocked CTA with confirmation |

### Files NOT changed (by invariant)

- src/permissions/safetyPolicy.ts — untouched
- src/permissions/permissionBroker.ts — untouched
- src/screens/SystemScreen.tsx — untouched, continues using actions.toggleSafeMode
- src/data/initialState.ts — untouched, Safe Mode defaults ON

### Architectural notes

- The toggleSafeMode action is kept for the System screen ToggleRow Switch (it naturally toggles, no confirmation needed there — power user path)
- The new setSafeMode(bool) action exists for programmatic use but is not directly consumed by this feature UI — the callbacks use toggleSafeMode since they only need to toggle from ON to OFF when safe mode is currently ON
- Confirmation Alert text is intentionally identical between SafeModeBanner and ApprovalCard

### Risk: stale blocked state after disabling Safe Mode

After disabling Safe Mode, task statuses in approvalQueue remain blocked until the user taps Approve again. evaluateApproval then runs fresh with safeMode: false, allowing approval. This is acceptable per success criteria. The Executor should verify this flow manually.

### Unknowns

- Whether Alert.alert works identically on React Native Web, iOS, Android — assumed yes per React Native core API
- The exact evaluateApproval reason string shown on blocked ApprovalCards matches permissionBroker.ts line 35 (Safe Mode block message)
