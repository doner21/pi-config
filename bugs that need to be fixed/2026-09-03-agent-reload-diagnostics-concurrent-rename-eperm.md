# Agent reload diagnostics concurrent writes fail Windows rename

Date observed: 2026-09-03
Status: fixed

## Evidence

The new public-command-dispatch behavioral test produced overlapping polling
and shutdown diagnostics writes. Windows rejected replacement renames with
`EPERM`, leaving the canonical document at `phase: polling` after the reload
had been confirmed.

## Impact

A successful reload could be reported as unconfirmed because concurrent
read/merge/write operations raced and Windows refused an atomic replacement.

## Fix

`agent/extensions/agent-reload/index.ts` now serializes diagnostics operations
through a module-scoped promise queue. Atomic rename remains the primary path;
when Windows rejects replacement, the writer copies the complete temp file over
the destination and removes the temp file in a `finally` cleanup.

## Verification

`agent/extensions/agent-reload/public-command-dispatch.test.mjs` now passes with
`phase: done`, `reloadConfirmed: true`, and
`confirmedBy: session_shutdown:reload`, with no rename error.
