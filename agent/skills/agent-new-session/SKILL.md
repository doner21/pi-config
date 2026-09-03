---
name: agent-new-session
description: Agent-operated new-session workflow for Pi coding agent. Use when the agent needs to start a fresh session with a clean context window (equivalent to the human `/new` command) and continue afterward by scheduling a near-future wake-up with agent_scheduler BEFORE triggering the new-session tool.
---

# Agent New Session

Starts a clean Pi session while preserving a concise continuation on disk.

## Current architecture (Pi 0.84.2+)

`agent_new_session` is an LLM-callable tool, while `ctx.newSession()` is only
available to extension command handlers. The bridge is:

1. `agent_new_session` starts a background poll.
2. The poll waits for two stable idle ticks: `ctx.isIdle()` and no pending
   messages.
3. It dispatches the registered `/agent-new-session` extension command with:

   ```ts
   pi.sendUserMessage("/agent-new-session", {
     expandPromptTemplates: true,
   });
   ```

4. The command calls `ctx.newSession()`.
5. `session_shutdown { reason: "new" }` is the authoritative success signal.

The idle poll is essential. With `expandPromptTemplates: true`, Pi dispatches
extension commands before its streaming/follow-up queue logic, so calling this
path directly from an active tool turn can run the command too early.

The `expandPromptTemplates: true` option is also essential. Without it,
`pi.sendUserMessage()` sends literal slash-command text to the model.

## Why the private core patch is no longer required

Pi 0.84.2 added supported extension-command dispatch through
`pi.sendUserMessage(..., { expandPromptTemplates: true })`. Pi 0.84.3+ launches
the Node CLI from `dist/bundle/cli.js`; the legacy patcher edited only
`dist/core/*`, so an 11/11 static result did not mean the active CLI contained
`pi.executeCommand`.

The new-session bridge now uses the supported public API and survives Pi npm
updates. The legacy core patch remains only for modular-runtime compatibility
and unrelated historical patches.

## Procedure (follow in order)

### 1. Prepare the continuation

Create a concise message beginning exactly:

```text
RESUME AFTER NEW SESSION:
```

Include:

- cwd
- prior task
- concrete next steps
- relevant paths/run IDs
- critical decisions or state
- the diagnostics read as the first action

Example:

```text
RESUME AFTER NEW SESSION:
cwd: C:/Users/doner/project
Prior task: Finished the parser fix and tests.
First action: Read C:/Users/doner/.pi/agent/agent-new-session-diagnostics.json and verify phase/newSessionConfirmed/newSessionSilentlyFailed/executeCommandRejected/confirmedBy.
Next steps: Continue the integration test and report the result.
Relevant files: src/parser.ts, tests/parser.test.ts
```

### 2. Schedule the continuation first

Call `agent_scheduler` in a separate tool call and confirm it succeeds.

Use `delaySeconds: 75-90` when the continuation will verify canonical
diagnostics. Use exactly 15 seconds only for a short workflow that does not
need the longer diagnostics window.

Never batch scheduling and `agent_new_session` in parallel.

### 3. Trigger the tool

After scheduling succeeds, call:

```json
{}
```

with `agent_new_session`.

A successful tool response says the new session was deferred and gives a
request ID. The switch occurs after the current turn ends and Pi becomes idle.

### 4. Stop immediately

After calling `agent_new_session`:

- call no more tools
- write no files
- start no tasks
- end the turn

The old session is about to be destroyed.

## Diagnostics

Canonical path:

```text
<PI_HOME>/agent/agent-new-session-diagnostics.json
```

Default on this host:

```text
C:/Users/doner/.pi/agent/agent-new-session-diagnostics.json
```

Interpretation:

- **Success:** `phase: "done"`, `newSessionConfirmed: true`, and
  `confirmedBy: "session_shutdown:new"`.
- **Failure:** `phase: "failed"` with `newSessionSilentlyFailed: true` and no
  authoritative confirmation. Tell the user to type `/agent-new-session`.
- **Historical fields:** `executeCommandAvailable`,
  `executeCommandRejected`, and `executeCommandDurationMs` remain in the
  diagnostics schema for compatibility. In bridge v4 they no longer imply a
  dependency on the private core patch.
- Confirmation wins over late timeout/rejection metadata.

## Recovery

If the loaded `agent_new_session` tool still says `pi.executeCommand is not
available`, that is the pre-v4 extension still resident in memory. Type
`/reload` once (or restart Pi) to load the updated extension. Do not reapply the
legacy core patch; it cannot patch the bundled CLI.

If the public-dispatch bridge fails after the updated extension is loaded, use
`/agent-new-session` manually and inspect the canonical diagnostics.

## Safety invariants

- Schedule first.
- Dispatch only after stable idle.
- Always set `expandPromptTemplates: true`.
- Treat `session_shutdown:new` as authoritative.
- Use only the replacement context inside `withSession`.
- Do not await a replacement-session LLM turn from the old command handler.
- Stop immediately after the tool call.
