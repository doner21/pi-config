---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260430-212712
clarification_needed: false
recommended_next_step: RESEARCH
context_saturation_estimate: "~25%"
---

# INTAKE — Standalone Android Nen Shell with Embedded DeepSeek V4

## Task Summary

Convert the existing Nen Shell Expo/React Native prototype from an **emulator-based, USB-bridged architecture** into a **standalone Android APK** that runs directly on a physical Android phone with DeepSeek V4 API calls embedded in-app (no external bridge server).

## Task Type

**Architecture migration + build pipeline + API integration.** This task spans:
- Removing the desktop bridge-server dependency
- Implementing direct DeepSeek API chat-completion calls from React Native
- Embedding the existing DeepSeek API key
- Building a standalone Android APK via Expo EAS Build (or local gradle build)
- Preserving all existing safety invariants (Safe Mode, permission broker, audit logging)

## User Intent

The user is frustrated by the USB-debugger dependency. They want to **test Nen Shell on their actual Android phone** as a real installed app, not through an emulator. They explicitly state:
- **"standalone"** — repeated 3× for emphasis
- **"I can't have this running through a USB debugger"**
- **"This needs to be a standalone Android app that I can test on the Android operating system"**
- DeepSeek V4 with their existing API key must be embedded
- They have "high code" installed on their phone (interpreted as: they can sideload APKs / have developer mode)

## Goal Attractor

A **single APK file** that, when installed on an Android phone:
1. Launches the full Nen Shell UI (Home/Brief/Tasks/System screens)
2. Sends chat messages directly to DeepSeek V4 API (no bridge server)
3. Displays agent replies and suggested actions
4. Preserves Safe Mode, approval queue, and audit logging
5. Works with only an internet connection — no USB, no desktop dependency

## Current Architecture (for context)

```
[Android Phone via USB/Emulator]
    └── Nen Shell Expo App (React Native)
            └── HTTP fetch to http://10.0.2.2:31415
                    └── [Desktop: pi-bridge-server/server.cjs]
                            └── Spawns Pi CLI process (--mode rpc)
                                    └── DeepSeek V4 Flash API
```

### Key facts:
- **Bridge server:** `tools/pi-bridge-server/server.cjs` — Node.js HTTP server on desktop
- **Bridge client:** `src/bridge/httpPiBridge.ts` — `fetch`-based client implementing `PiBridgeClient`
- **Bridge types:** `src/bridge/piBridge.types.ts` — interface contract
- **API key:** `~/.pi/agent/auth.json` → `deepseek.key: "sk-74e05635ca1242d5877ba8fc900e9dc2"`
- **Bridge contract methods:** `getHealth`, `sendAgentMessage`, `getAgentTasks`, `approveAgentTask`, `rejectAgentTask`, `getAgentAudit`, `getSchedulerSnapshot`
- **Context calls:** `src/state/NenShellContext.tsx` calls `piBridge.sendAgentMessage({ message, context: {} })`
- **Permissions:** `src/permissions/safetyPolicy.ts` + `src/permissions/permissionBroker.ts`
- **App config:** `app.json` — Expo SDK 54, `usesCleartextTraffic: true`
- **Dependencies:** expo ~54.0.33, react 19.1.0, react-native 0.81.5

## Constraints

1. **Standalone only.** No external bridge server, no desktop dependency, no USB.
2. **DeepSeek V4 required.** Must use existing API key (`sk-74e05635ca1242d5877ba8fc900e9dc2`).
3. **API key embedded in-app.** The app must carry the key internally; no user setup.
4. **Preserve all safety invariants.** Safe Mode default ON, permission broker, audit logging, root lock.
5. **Do not add app-launcher behavior.** As per HANDOFF.md: "Nen Shell should not become an app launcher."
6. **Build target:** Android APK (physical phone, not emulator).
7. **No backend services (tasks/audit/scheduler).** The bridge server currently provides mock data for tasks, audit, scheduler snapshots, and health. These must be handled locally in-app after the bridge is removed.

## Invariants

| # | Invariant | Rationale |
|---|-----------|-----------|
| I1 | No external server process required at runtime | User's core demand: standalone |
| I2 | DeepSeek V4 API key must be functional in-app | User's core demand |
| I3 | Safe Mode must still block risky actions | Safety invariant from HANDOFF.md |
| I4 | `npm run typecheck` must pass after changes | Existing quality gate |
| I5 | `usesCleartextTraffic: true` must remain | DeepSeek API is HTTPS, but we may need cleartext for dev |
| I6 | The `PiBridgeClient` interface contract must be honored | Existing code depends on this interface |
| I7 | No app-launcher buttons or open-app destinations | Product invariant from HANDOFF.md |

## Success Criteria

1. A standalone APK is produced that installs and runs on a physical Android phone
2. The Home screen accepts text input, sends it to DeepSeek V4, and displays the AI reply
3. Suggested actions are parsed from the DeepSeek response and appear in the approval queue
4. Safe Mode toggle works and blocks sends when ON
5. `npm run typecheck` passes
6. No desktop bridge server is running during any of the above
7. The `.apk` file is available at a known path for sideloading

## Ambiguities

1. **"High code" on phone — exact meaning?** Interpreted as: the user has developer mode / USB debugging enabled and can sideload APKs. May also refer to a specific app. Not blocking — we just need to produce an APK.

2. **DeepSeek API chat completions endpoint?** The bridge server currently calls DeepSeek through the Pi CLI. We need the direct REST endpoint. Likely: `https://api.deepseek.com/v1/chat/completions` (OpenAI-compatible API). Research needed to confirm.

3. **Mock data migration.** The bridge server currently provides mock data for `/agent/tasks`, `/agent/audit`, `/scheduler/jobs`, and `/health`. After the bridge is removed, these need local mock implementations. Should we keep the existing `mockPiBridge` as the sole provider for non-chat endpoints?

4. **Expo EAS Build vs local gradle build.** Standalone APK can be built via `eas build -p android` (requires Expo account) or `npx expo run:android` with local Android SDK. Which path is preferred given the user already has Android SDK installed?

5. **API key security in standalone APK.** Embedding an API key in a client-side mobile app is generally not secure (can be extracted from APK). The user explicitly asked for this, so we proceed, but should the key be obfuscated or plaintext in source?

## Routing Decision

**RECOMMENDED NEXT STEP: RESEARCH**

Several architectural primitives need verification before planning:
- DeepSeek V4 direct API endpoint and format (OpenAI-compatible?)
- React Native HTTP client options for chat completions (streaming or non-streaming?)
- Expo EAS Build workflow for standalone APK
- API key embedding strategy in Expo/React Native
- Whether to use EAS secrets or inline the key

## Clarification Questions

None needed. The user's intent is clear and the technical unknowns are research questions, not ambiguity about what to build.
