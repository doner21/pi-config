# `ssi-single-writer-exclusive-lane` operations and usage log

Status: **usable deterministic shape** (`canary_passed`, production-proven)

Canonical lifecycle state: [`ssi-single-writer-exclusive-lane.json`](./ssi-single-writer-exclusive-lane.json)

## What this shape is for

Use this shape for integrated SSI DAW work in a shared dirty checkout when source mutation must be owned by one logical writer and machine-sensitive gates must not overlap. It is designed for work involving combinations of:

- CMake/Ninja or native-host builds;
- Cmajor performer/runtime changes;
- Electron/Playwright control-room tests;
- process, named-pipe, lock, or lifecycle cleanup;
- WASAPI/device gates;
- a coherent commit and verified push only after all ordinary gates pass.

Do **not** use it for small documentation-only changes, isolated TypeScript edits, exploratory research, or work that genuinely requires multiple concurrent writers. Do not use it to make optional concurrent-rebuild stress a normal product-acceptance gate.

## Deterministic topology

1. Three independent diagnoses run concurrently with `tools=[read]`.
2. One read-only synthesis produces the smallest plan and ordered gate manifest.
3. One allowlisted logical writer mutates source with `tools=[read,edit,write]` and no bash.
4. Two source reviewers run concurrently with `tools=[read]` and strict JSON verdicts.
5. Exactly one machine verifier acquires `pi-orchestrator-ssi-machine-resource.lock` and runs all build/native/Electron/WASAPI commands serially.
6. Concrete findings may trigger exactly one repair through the same writer tuple.
7. The machine verifier reacquires the lock and performs one serialized retest.
8. Only a strict final PASS with cleanup proof launches the same-writer finalizer; it may inspect/stage/commit/push but may not edit source.
9. The parent verifies local HEAD against `git ls-remote` before reporting PASS.

The shape fingerprints tracked and nonignored untracked working-file contents around machine-only and finalizer phases. Malformed review/machine/finalizer JSON, source mutation from a non-writer phase, a surviving SSI process, a stale machine lock, or a local/remote hash mismatch fails closed.

## Executor routing contract

Allowed executor routes:

- `openai-codex/gpt-5.6-sol`
- `openai-codex/gpt-5.5`
- direct `zai/glm-5.2`

DeepSeek executors, every OpenRouter executor route, and any unlisted executor route are rejected before the first subagent spawn. Planner and verifier routes remain caller-configurable.

## Invocation

Use the explicit paradigm; it is not the default generic shape:

```json
{
  "task": "<authoritative SSI task; include the exact serial ordinary-gate manifest and cleanup requirements>",
  "paradigm": "ssi-single-writer-exclusive-lane",
  "cwd": "<project-root>",
  "plannerAgent": "planner",
  "executorAgent": "coder",
  "verifierAgent": "reviewer",
  "plannerModel": "gpt-5.6-sol",
  "plannerProvider": "openai-codex",
  "executorModel": "gpt-5.6-sol",
  "executorProvider": "openai-codex",
  "verifierModel": "gpt-5.6-sol",
  "verifierProvider": "openai-codex",
  "maxSubagents": 11,
  "maxRetries": 0,
  "preflight": true
}
```

The task should identify which gates are ordinary product acceptance and which stress/developer experiments are explicitly excluded. A same-shape continuation should target the decisive strict finding from the preceding result rather than widening scope.

## Operational history

| Date (UTC) | Run | Result | What the shape established |
|---|---|---|---|
| 2026-07-29 09:45 | `orc-ms5wfluj-stqu` | Canary PASS | Fresh extension runtime discovered the shape; zero subprocesses, locks, Git operations, or mutations. Evidence: `~/.pi/agent/orchestration-builder/runs/RUN_20260729-085620/canary-result.json`. |
| 2026-07-29 09:47–10:44 | `orc-ms5wiyv2-q692` | FAIL | Correctly blocked finalization after exposing retained performer-A accounting and lifecycle/launcher cleanup defects. No commit or push. |
| 2026-07-29 10:52–11:25 | `orc-ms5ytgrs-flsf` | FAIL | Proved the musical path, production IPC, Electron 43/43, device gates, exact dispatch 12/A 7/B 5, and zero cleanup; correctly blocked on the remaining native-build-lock worker failure. No commit or push. |
| 2026-07-29 11:29–12:21 | `orc-ms605rjj-zcrr` | **PASS** | One bounded repair followed by all ten serialized ordinary gates passing, including control-room unit 487/487, production IPC, native Electron 43/43, both device gates, exact 96,000-frame fade, and zero surviving resources/processes. Finalized commit `04be11042608f7b42ad8ccfd2b3e89c70ccfb948`, independently matched to `origin/master`. Evidence: `~/.pi/agent/orchestration-builder/runs/RUN_20260729-085620/retry2-result.json`. |
| 2026-07-29 13:06 | `orc-ms63mbqs-d7bx` | Runtime-discovery FAIL | The already-running Pi TUI still held the pre-registration local-package registry and rejected the paradigm before spawning work. This is the known Pi local-package reload-cache defect, not a shape verdict. A full Pi process restart is required for an existing stale TUI. |

## Why it replaced the generic shared-cwd loop for this class of SSI work

Earlier generic runs mixed product failures with orchestration failures: multiple/shared writers, provider result loss after mutation, predicted-write-set noise, subagent ceilings, and parallel CMake/Ninja/native/device verification. This shape confines parallelism to read-only analysis and review, while one writer and one locked machine lane own all side effects. It is intentionally slower but produces materially cleaner failure signals.

## Runtime caveat

Pi local-package `/reload` can retain stale transitive extension modules even when reload diagnostics say success. If the runtime reports `Unknown orchestration paradigm "ssi-single-writer-exclusive-lane"`:

1. Do not substitute another shape or execute the SSI task directly.
2. Confirm the on-disk registry and run the zero-spawn canary in a fresh extension/Pi process.
3. Fully restart Pi; `/reload` or `/new` alone may not refresh the package registry.
4. Re-run `SHAPE_CANARY:ssi-single-writer-exclusive-lane` before product work.

Tracked bug: `~/.pi/bugs that need to be fixed/2026-07-22-pi-reload-keeps-stale-local-package-extension-modules.md`.

## Maintenance rule

Append each meaningful production invocation to **Operational history** with its run id, strict result, decisive finding, and durable result path. Keep failures: they explain the shape's operating envelope. Update the lifecycle JSON only from direct discovery/canary evidence; never infer usability from source registration or an executor narrative alone.
