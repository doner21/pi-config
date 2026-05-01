---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260429-130311
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~8%"
---

# Task Summary
Build the first working mobile-first UI wrapper for Nen Shell, a calm agentic Android shell concept that avoids app-launcher patterns and communicates with Pi Code through a replaceable local bridge. The repository is currently empty, so create a minimal runnable app scaffold plus modular source structure.

# Task Type
Frontend implementation / React Native Expo prototype / agentic-system architecture skeleton.

# User Intent
The user wants a simplest working vertical slice: Home → agent input → mock Pi Code reply → suggested action → approval queue → audit log, with screens for Home, Brief, Tasks, and System. The result should be phone-first, calm, non-addictive, and safe-by-default.

# Goal Attractor
A runnable Expo React Native app in `C:/Users/doner/nen-shell` with clean separation of UI components, agent bridge logic, mock connectors/data, scheduler, permission broker, and audit log. It should be easy to replace the mock bridge with a real Pi Code HTTP/WebSocket bridge and later evolve into an Android launcher/kiosk app.

# Constraints
- Empty starting repo.
- Use local/mock state and connectors for this first build.
- Do not implement real Gmail/Telegram auth, root control, app shortcuts, unsafe sending, or app-opening buttons.
- Safe Mode defaults on and blocks sending/deleting/root/system modifications.
- Actions that send messages, modify files, or change system state require explicit confirmation and audit logging.
- Mobile-first dark calm interface with restrained accent colors, soft cards, large type, no red badges, no infinite feed, no app grid.
- Follow frontend-design skill: intentional, refined aesthetic rather than generic AI layout.

# Invariants
- Gmail/Telegram/Calendar must never be presented as destinations to open; source labels only.
- No launcher grid or addictive notification feed.
- Root/system actuator remains locked by default.
- Mock bridge interface must mirror specified endpoints and be easy to swap.
- Audit log should record checks, summaries, drafts, permission requests, approvals/rejections, and failures.

# Success Criteria
- App can run on mobile via Expo.
- Home screen shows greeting, today summary, attention counts, schedule summary, priorities, input, and voice placeholder.
- User can send a message and receive a mock agent response.
- Suggested action appears in/feeds approval queue.
- Tasks screen supports approve/reject and Safe Mode blocks risky actions.
- System screen shows bridge health, scheduler heartbeat/jobs, connector statuses, autonomy/permission state, Safe Mode toggle, locked root actuator, and audit log.
- Code follows requested `/src` structure and contains TODOs for Android kiosk mode, notification listener, Gmail API, Telegram connector, and real Pi Code bridge.

# Ambiguities
- Whether Expo dependencies are already installed is unknown; create standard package metadata and test with available Node/npm.
- Exact visual direction is open; choose quiet refined dark design suitable for a calm assistant.

# Routing Decision
Proceed directly to PLAN. Research is not necessary because the repo is empty, technical path is clear, and implementation can be validated locally through TypeScript/Expo checks.
