---
artifact_type: INTAKE
role: ORCHESTRATOR
run_id: RUN_20260429-184500
clarification_needed: false
recommended_next_step: PLAN
context_saturation_estimate: "~20%"
---

# INTAKE — Nen Shell Physical Phone Bridge Timeout

## Task Summary

The Nen Shell Pi Code bridge works on the host (curl tests pass) and on the Android emulator (10.0.2.2) but **fails on a physical Android phone** over LAN WiFi. The phone can reach the bridge server (app loads, `/health` presumably works), but sending a chat message shows "Reasoning…" then aborts with mock fallback after the 60s client-side timeout.

Root cause: Pi CLI cold-start is ~15-20 seconds for trivial prompts, longer for real ones. The current architecture spawns a new `pi` child process per request, incurring Node.js + Pi CLI startup overhead each time. On a physical phone over WiFi, the combined latency exceeds the 60s client timeout. The bridge server has a 120s timeout, but the client cuts off at 60s.

## Task Type

**Performance + reliability fix.** The bridge server must handle Pi CLI invocations faster so responses arrive within the client timeout window, even on physical devices over WiFi.

## User Intent

The user wants to use Nen Shell on a **physical Android phone** over LAN WiFi, type messages into the chat interface, and receive real Pi Code responses without timeout/abort.

## Goal Attractor

A physical Android phone on the same LAN sends a chat message, the bridge server responds with real Pi CLI output within 30 seconds, and the reply appears on the phone screen — no timeout, no mock fallback.

## Constraints

1. Safe Mode + permission broker must remain intact
2. Pi CLI safe defaults (--no-tools, --no-skills, etc.) must be preserved
3. Bridge server must remain a simple Node.js process (no complex process manager)
4. Must work on Windows host + Android phone over LAN WiFi
5. Client timeout should be reasonable (60s is already generous for a chat UI)
6. Windows Firewall must allow inbound 31415
7. Bridge must bind to 0.0.0.0 (not 127.0.0.1) for LAN access

## Invariants

1. PiBridgeClient interface unchanged
2. All bridge endpoints functional
3. npm run typecheck passes
4. Bridge server still works on emulator (10.0.2.2)
5. Pi CLI still invoked with --no-tools --no-extensions --no-skills --no-session

## Success Criteria

1. Bridge server starts and logs readiness
2. Physical phone can reach `http://<host-lan-ip>:31415/health`
3. POST /agent/message from phone returns within 30s
4. No mock fallback exercised
5. Real Pi Code text visible on phone screen
6. Windows Firewall allows inbound 31415 (either by rule or verified open)
7. npm run typecheck clean

## Ambiguities

1. **Pi CLI performance**: Can cold-start be improved? Can we keep a persistent Pi process?
2. **Windows Firewall**: Is port 31415 open for inbound LAN connections?
3. **Phone network**: Is the phone on the same LAN subnet? Is there a VPN or AP isolation?
4. **Pi CLI server mode**: Does Pi support a long-running stdin/stdout mode or HTTP server mode?

## Routing Decision

**recommended_next_step: PLAN**

Multiple approaches possible:
- A. Keep-alive: spawn Pi CLI once and reuse via stdin/stdout pipe
- B. Pre-warm: send a no-op prompt at bridge startup to cache Pi CLI startup
- C. Timeout tuning: increase client timeout, decrease server timeout
- D. Pi HTTP mode: if Pi supports `--serve` or `--api` mode

A structured plan should evaluate these options, pick the best, and provide clear implementation steps.

## Clarification Questions

None — the problem is well-characterized from the HANDOFF, prior execution, and user report.
