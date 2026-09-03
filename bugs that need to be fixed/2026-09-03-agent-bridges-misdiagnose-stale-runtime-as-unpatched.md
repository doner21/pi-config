# Agent bridges patch the modular runtime while Pi executes the bundle

Date observed: 2026-09-03
Status: fixed — live public new-session dispatch verified

## Evidence

- Pi is `0.84.4` and `package.json` maps the `pi` binary to
  `dist/bundle/cli.js`.
- The npm shim also launches `dist/bundle/cli.js`.
- `reapply-pi-core-patch.mjs check` reports 11/11 edits applied, but all
  `pi.executeCommand` edits are under `dist/core/extensions/*`.
- The active bundle contains `expandPromptTemplates` and extension-command
  dispatch, but no `runtime.executeCommand` patch sentinel.
- The live `agent_new_session` tool therefore reported
  `pi.executeCommand is not available` despite the static 11/11 result.
- Reapplying the same patch could not help. `/reload` rebuilds resources and
  extension instances but cannot inject modular dist/core edits into the
  already-loaded bundle.

## Impact

The patch command produced a false-green result for the actual CLI entrypoint,
causing repeated patch attempts and blocking autonomous new-session/reload
workflows.

## Root cause

Pi 0.84.3 changed the Node CLI to a bundled entrypoint. The compatibility
patcher continued validating only unbundled modular files. Meanwhile Pi 0.84.2
had already added the supported public bridge:

```ts
pi.sendUserMessage("/registered-extension-command", {
  expandPromptTemplates: true,
});
```

The local bridges still depended on the obsolete private patch.

## Fix on disk

- `agent-new-session` and `agent-reload` retain their stable-idle polls but now
  dispatch their registered commands through the public expanded-command API.
- Removed tool execution gates that rejected runtimes without
  `pi.executeCommand`.
- Kept `session_shutdown:new|reload` as the authoritative success signal.
- Updated the core-patch slash wrapper so a successful `apply` automatically
  calls `ctx.reload()` and returns, activating the durable extension bridge.
- Updated patcher output and skills to explain modular-vs-bundled scope and
  stop prescribing repeated patch applications.
- Updated registration verification to inspect the real `bin.pi` bundle,
  confirm public command expansion, and reject false bundled-runtime claims.
- Added behavioral tests proving both bridges work with no `pi.executeCommand`
  property.
- Serialized reload diagnostics writes and added a Windows copy fallback after
  the new test exposed concurrent rename `EPERM` failures.

## Machine verification

Passing on disk:

- `agent/extensions/agent-new-session/public-command-dispatch.test.mjs`
- `agent/extensions/agent-reload/public-command-dispatch.test.mjs`
- `agent/extensions/agent-new-session/diagnostics-isolation.test.mjs`
- `agent/extensions/agent-reload/_verify-static.mjs`
- `agent/core-patch/verify-patch-command-registration.mjs`
- core patch `check` and `verify`

## Live acceptance verified

A fresh scheduled `agent_new_session` handoff completed successfully through
the public expanded-command bridge:

- request: `new-1788471189400-sgnfr3`
- `requested`: `2026-09-03T21:33:09.400Z`
- `confirmedAt`: `2026-09-03T21:33:15.534Z`
- `phase`: `done`
- `newSessionConfirmed`: `true`
- `newSessionSilentlyFailed`: `false`
- `executeCommandRejected`: `false`
- `confirmedBy`: `session_shutdown:new`

This confirms that the fresh Pi session launched successfully without relying
on the obsolete private `pi.executeCommand` patch.
