---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260430-202148
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~90%"
---

# INTAKE — Clear Safe Mode & Approval UX

## Task Summary

The user wants two things:
1. **A real way to disable Safe Mode** — not buried in Settings, but accessible from where they actually use the app
2. **A much clearer approval and permissions setup** — the current flow is confusing and fragmented

## Current State — The Problem

### Safe Mode Toggle Location
The Safe Mode toggle lives ONLY on the **System** tab (4th tab), inside the "Autonomy and permissions" card, as a `ToggleRow` Switch. To disable Safe Mode, the user must:
1. Navigate to System tab
2. Scroll past bridge health, scheduler, connectors, model picker
3. Find "Autonomy and permissions" card
4. Flip the switch

### Blocked Approval Flow
1. User sends message on Home → Pi responds with suggested actions
2. Actions queue as pending tasks in Tasks tab
3. User taps "Approve" on a task → `evaluateApproval` runs → checks Safe Mode
4. If Safe Mode is ON and risk is `risky_send/file/system/root` → status changes to "blocked"
5. The `ApprovalCard` shows `status: "blocked"` with a reason text like "Safe Mode is on..."
6. **But there's no way to fix this from the Tasks screen** — user must navigate to System, find the toggle, flip it, then return

### SafeModeBanner is Passive
Both `HomeScreen` and `TasksScreen` render `<SafeModeBanner enabled={state.permission.safeMode} />` which shows a colored card saying "Safe Mode is on/off" — but it's purely informational. No toggle.

### UX Fragmentation
- **Home**: Shows status, allows sending messages (sendMessage doesn't check Safe Mode — only message SENDING works, but approving actions gets blocked)
- **Tasks**: Shows approval queue with Approve/Reject — approvals get silently blocked
- **System**: Has the actual Safe Mode toggle buried in a card

## What The User Actually Wants

1. **One-tap Safe Mode disable** — from Home or Tasks, without navigating to System
2. **Clear feedback when blocked** — understand WHY it's blocked and HOW to unblock
3. **Obvious approval flow** — know what's pending, what's blocked, and what actions are available
4. **Confirmation before disabling** — a warning explaining what risks are being opened

## Goal Attractor

Nen Shell where:
- The Home screen banner has a **toggle switch** to disable Safe Mode directly
- The Tasks screen shows a **"Disable Safe Mode to approve"** call-to-action on blocked items
- Disabling Safe Mode shows a brief **confirmation/warning** explaining what becomes possible
- The System screen retains the detailed control for power users
- `ApprovalCard` for blocked tasks shows a **direct link to disable Safe Mode**

## Constraints

1. Safe Mode must still default ON
2. Permission broker logic (`evaluateApproval`, `isRiskBlockedBySafeMode`) must not change
3. Root actuator must remain locked regardless of Safe Mode
4. TypeScript typecheck must pass
5. No new dependencies
6. Keep the existing System toggle as authoritative control

## Invariants

1. `npm run typecheck` passes
2. Safe Mode defaults to ON on fresh app install
3. Blocked dangerous actions cannot be approved without disabling Safe Mode
4. Root commands remain locked even when Safe Mode is off
5. All audit entries still record

## Success Criteria

1. Safe Mode can be toggled directly from the Home screen banner
2. Safe Mode can be toggled directly from the Tasks screen banner
3. Disabling Safe Mode shows a clear warning/confirmation about what's being enabled
4. Blocked approval cards show a "Disable Safe Mode" action
5. After disabling Safe Mode, previously-blocked actions can be approved
6. System screen toggle still works and stays in sync
7. Typecheck passes

## Routing Decision

**GO TO PLAN.** The problem and solution are well-understood — component-level UX changes with no new infrastructure.

## Key Files

| File | Role |
|------|------|
| `src/components/SafeModeBanner.tsx` | **Primary change** — add toggle, make interactive |
| `src/screens/HomeScreen.tsx` | Uses SafeModeBanner — pass toggle handler |
| `src/screens/TasksScreen.tsx` | Uses SafeModeBanner + ApprovalCard — pass toggle handler |
| `src/components/ApprovalCard.tsx` | Add "Disable Safe Mode" CTA for blocked tasks |
| `src/screens/SystemScreen.tsx` | Keep existing toggle — no changes needed |
| `src/permissions/safetyPolicy.ts` | NO changes — logic stays same |
| `src/permissions/permissionBroker.ts` | NO changes — logic stays same |
| `src/state/actions.ts` | May need `setSafeMode` or keep using `toggleSafeMode` |
| `src/state/NenShellContext.tsx` | Keep existing `toggleSafeMode` — may need a `setSafeMode(boolean)` action |
