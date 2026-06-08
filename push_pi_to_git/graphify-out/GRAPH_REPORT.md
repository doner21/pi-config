# Graph Report - .  (2026-06-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 517 nodes · 808 edges · 37 communities (18 shown, 19 thin omitted)
- Extraction: 79% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 165 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c8131c3a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `WidgetLifecycle` - 43 edges
2. `subagent.ts Extension (subagent lifecycle management)` - 16 edges
3. `pi-orchestrator-extension/src/shapes/composable-pipeline.ts — Composable Pipeline Shape` - 16 edges
4. `Orchestration Status Dashboard Widget` - 14 edges
5. `CLEANUP_GUARANTEED_STATES frozenset` - 14 edges
6. `ISSUE-4: Executor tasks too large, produce reports not code` - 13 edges
7. `WidgetState Enum` - 13 edges
8. `11 Files Modified in Sprint across 4 categories` - 12 edges
9. `ISSUE-3: Verifier trusts executor text output, not files` - 11 edges
10. `Orchestration Safety Parameters — collective guardrails preventing empty-run failures: truncation, escape clauses, budget estimation, exhaustion detection, artifact verification, fallback models` - 11 edges

## Surprising Connections (you probably didn't know these)
- `src/substrate.ts` --semantically_similar_to--> `pi-orchestrator-extension/src/substrate.ts — Subagent Substrate`  [EXTRACTED] [semantically similar]
  HANDOFF.md → pi-orchestrator-extension/src/substrate.ts
- `nenflow-orchestration-panel.ts.disabled` --semantically_similar_to--> `nenflow-orchestration-panel.ts — Panel Extension`  [EXTRACTED] [semantically similar]
  DASHBOARD_POSTMORTEM.md → ~/.pi/agent/extensions/nenflow-orchestration-panel.ts
- `ValidationReport dataclass — full validation report` --semantically_similar_to--> `VERIFICATION_REPORT.json — independent verifier confirmation`  [INFERRED] [semantically similar]
  mock-dashboard-test/scripts/validate.py → mock-dashboard-test/VERIFICATION_REPORT.json
- `_(No assistant text captured.)_ symptom for large-prompt tasks` --conceptually_related_to--> `Verifier/Reviewer Subagent`  [INFERRED]
  HANDOFF_VERIFIER_FIX.md → HANDOFF.md
- `ctx.ui.custom() with overlay:true — Overlay API (Modal)` --semantically_similar_to--> `ctx.ui.setWidget(name, lines) — Widget API`  [EXTRACTED] [semantically similar]
  DASHBOARD_POSTMORTEM.md → DASHBOARD_REBUILD_BRIEF.md

## Hyperedges (group relationships)
- **Systemic Verification Gap** — bug-issue3-verifier-trusts-text, bug-issue4-tasks-too-large, bug-issue5-no-artifact-verification [INFERRED]
- **Model Routing Fragility** — bug-issue1-routing-fights-planner, bug-issue2-intake-overrides-model, bug-issue7-pt-regex-false-match [INFERRED]
- **ENAMETOOLONG Fix Chain** — bug-enametoolong-stdin-regression, bug-stdio-ignore-blocked-stdin, fix-optionA-prompt-file, fix-optionB-placeholder-stdin, fix-optionC-tempfile-stdin, fix-applied-pipeStdin [INFERRED]
- **Orchestration Failure Cascade** — bug-issue1-routing-fights-planner, bug-issue4-tasks-too-large, bug-issue3-verifier-trusts-text, bug-issue5-no-artifact-verification, evidence-zero-files, concept-planner-workaround-agent-coder [INFERRED]
- **Subagent Process Lifecycle Events** — event-agent_end, event-message_end, concept-agentEnded-flag, fix-issue6-agentEnded, bug-issue6-post-agent-end-error, func-spawnSubagent [INFERRED]
- **Intake Contract Processing System** — sys-intake-normalizer, func-inferModelRoutingFromTask, func-applyRoutingAlias, func-modelAliasFromText, concept-intake-contract-governing, concept-first-found-alias-wins, concept-model-routing-constraint [INFERRED]
- **Hard Blocker Triad — Three problems that together made Pi unusable** —  [INFERRED]
- **Design Issue Quad — Four reliability problems in widget implementation** —  [INFERRED]
- **Orchestrator Reliability Quad — Four systemic orchestration bugs** —  [INFERRED]
- **Dashboard Helper Functions — Inline functions for widget lifecycle** —  [INFERRED]
- **Compounding Failure Stack — Three independent problems stacked** —  [INFERRED]
- **Critical Fixes Triad — Three essential fixes for dashboard viability** —  [INFERRED]
- **Harness Architectural Subsystems** — n3-core-orchestration-subsystem, n3-safety-guardrails-subsystem, n3-subagent-infrastructure-subsystem, n3-browser-automation-subsystem, n3-memory-system-subsystem [INFERRED]
- **NenFlow v3 Skill Family (5 skills modified)** — n3-nenflow-v3-orchestrator-skill, n3-pev-researcher-skill, n3-pev-planner-skill, n3-pev-executor-skill, n3-pev-verifier-skill [INFERRED]
- **Hardcoded Path Portability Fixes (SC1-SC4)** — n3-portability-fix-sc1, n3-portability-fix-sc2, n3-portability-fix-sc3, n3-portability-fix-sc4, n3-hardcoded-paths-bug [INFERRED]
- **Graphify Memory Safety Gates (SC5-SC6)** — n3-graphify-safety-gate-sc5, n3-graphify-safety-gate-sc6, n3-run-meta-json, n3-skip-report-guard, n3-safety-gate-warning-mode, n3-try-catch-degradation [INFERRED]
- **NenFlow v3 Roles and Corresponding Artifacts** — n3-nenflow-orchestrator-role, n3-nenflow-research-role, n3-nenflow-planner-role, n3-nenflow-executor-role, n3-nenflow-verifier-role, n3-intake-artifact-att0, n3-research-artifact-att1, n3-plan-artifact-att1or2, n3-execution-artifact-attn, n3-verifier-brief-artifact, n3-verification-artifact [INFERRED]
- **Deferred Improvement Areas (needs pi-core or more work)** — n3-deferred-bash-read-only, n3-deferred-run-ledger, n3-deferred-progressive-mcp, n3-deferred-capability-registry, n3-deferred-evidence-verification, n3-deferred-destructive-patterns, n3-deferred-secret-scanning, n3-deferred-subagent-transcript-logging, n3-deferred-architecture-wiki [INFERRED]
- **Four Extensions Modified in Sprint** — n3-subagent-ext, n3-playwright-mcp-ext, n3-graphify-ext, n3-git-checkpoint-ext [INFERRED]
- **Orchestration Contract System** — mop-concept-orchestration-contract, mop-constant-tasks, mop-dataclass-taskrecord, mop-concept-role-distribution, mop-concept-task-linear-chain [EXTRACTED 1.00]
- **Model Routing Validation Ecosystem** — mop-concept-model-routing, mop-constant-planning-model, mop-constant-exec-verify-model, mop-func-validate-contract, mop-test-model-routing [EXTRACTED 1.00]
- **Verification Evidence Chain** — mop-att6-verification, mop-concept-verification-criteria, mop-concept-pass-verdict, mop-concept-verifier-independence, mop-func-validate-script-main [EXTRACTED 1.00]
- **Test Coverage of Orchestration Contract** — mop-class-ledger-contract-tests, mop-test-summary-shape, mop-test-contract-valid, mop-test-model-routing, mop-test-dependencies, mop-test-validator-errors, mop-test-cli-json [EXTRACTED 1.00]
- **Subagent Limit and Contract Constraint Enforcement** — mop-concept-subagent-limit, mop-constant-max-subagents, mop-func-validate-contract, mop-func-summarize-run, mop-func-validate-script-main [EXTRACTED 1.00]
- **Semantic Error Guard Triad — all three functions validate inputs and throw descriptive errors for invalid values before computation** — division-by-zero-guard, negative-sqrt-guard, factorial-input-validation [INFERRED 0.85]
- **Arithmetic Zero Edge Case Triplet — each tests boundary behavior where zero input yields a defined non-error result (0^0=1, sqrt(0)=0, 0!=1)** — edge-case-power-zero-zero, edge-case-sqrt-zero, edge-case-factorial-zero [EXTRACTED 1.00]
- **PEV Executor Dual Assignment — both Calculator and Advanced modules are assigned to Executor roles using the same deepseek-v4-flash model under RUN_TEST_DEEPSEEK** — pev-executor-role-1, pev-executor-role-2, deepseek-v4-flash-executor [EXTRACTED 1.00]
- **Modular Composition Chain — advanced module builds factorial on top of calculator's multiply, demonstrating layered arithmetic architecture** — calculator-module, advanced-module, factorial-composition-pattern, multiply-function [EXTRACTED 1.00]
- **Systemic Verification Gap** — bug-issue3-verifier-trusts-text, bug-issue4-tasks-too-large, bug-issue5-no-artifact-verification [INFERRED]
- **Model Routing Fragility** — bug-issue1-routing-fights-planner, bug-issue2-intake-overrides-model, bug-issue7-pt-regex-false-match [INFERRED]
- **ENAMETOOLONG Fix Chain** — bug-enametoolong-stdin-regression, bug-stdio-ignore-blocked-stdin, fix-optionA-prompt-file, fix-optionB-placeholder-stdin, fix-optionC-tempfile-stdin, fix-applied-pipeStdin [INFERRED]
- **Orchestration Failure Cascade** — bug-issue1-routing-fights-planner, bug-issue4-tasks-too-large, bug-issue3-verifier-trusts-text, bug-issue5-no-artifact-verification, evidence-zero-files, concept-planner-workaround-agent-coder [INFERRED]
- **Subagent Process Lifecycle Events** — event-agent_end, event-message_end, concept-agentEnded-flag, fix-issue6-agentEnded, bug-issue6-post-agent-end-error, func-spawnSubagent [INFERRED]
- **Intake Contract Processing System** — sys-intake-normalizer, func-inferModelRoutingFromTask, func-applyRoutingAlias, func-modelAliasFromText, concept-intake-contract-governing, concept-first-found-alias-wins, concept-model-routing-constraint [INFERRED]
- **Hard Blocker Triad — Three problems that together made Pi unusable** —  [INFERRED]
- **Design Issue Quad — Four reliability problems in widget implementation** —  [INFERRED]
- **Orchestrator Reliability Quad — Four systemic orchestration bugs** —  [INFERRED]
- **Dashboard Helper Functions — Inline functions for widget lifecycle** —  [INFERRED]
- **Compounding Failure Stack — Three independent problems stacked** —  [INFERRED]
- **Critical Fixes Triad — Three essential fixes for dashboard viability** —  [INFERRED]
- **Harness Architectural Subsystems** — n3-core-orchestration-subsystem, n3-safety-guardrails-subsystem, n3-subagent-infrastructure-subsystem, n3-browser-automation-subsystem, n3-memory-system-subsystem [INFERRED]
- **NenFlow v3 Skill Family (5 skills modified)** — n3-nenflow-v3-orchestrator-skill, n3-pev-researcher-skill, n3-pev-planner-skill, n3-pev-executor-skill, n3-pev-verifier-skill [INFERRED]
- **Hardcoded Path Portability Fixes (SC1-SC4)** — n3-portability-fix-sc1, n3-portability-fix-sc2, n3-portability-fix-sc3, n3-portability-fix-sc4, n3-hardcoded-paths-bug [INFERRED]
- **Graphify Memory Safety Gates (SC5-SC6)** — n3-graphify-safety-gate-sc5, n3-graphify-safety-gate-sc6, n3-run-meta-json, n3-skip-report-guard, n3-safety-gate-warning-mode, n3-try-catch-degradation [INFERRED]
- **NenFlow v3 Roles and Corresponding Artifacts** — n3-nenflow-orchestrator-role, n3-nenflow-research-role, n3-nenflow-planner-role, n3-nenflow-executor-role, n3-nenflow-verifier-role, n3-intake-artifact-att0, n3-research-artifact-att1, n3-plan-artifact-att1or2, n3-execution-artifact-attn, n3-verifier-brief-artifact, n3-verification-artifact [INFERRED]
- **Deferred Improvement Areas (needs pi-core or more work)** — n3-deferred-bash-read-only, n3-deferred-run-ledger, n3-deferred-progressive-mcp, n3-deferred-capability-registry, n3-deferred-evidence-verification, n3-deferred-destructive-patterns, n3-deferred-secret-scanning, n3-deferred-subagent-transcript-logging, n3-deferred-architecture-wiki [INFERRED]
- **Four Extensions Modified in Sprint** — n3-subagent-ext, n3-playwright-mcp-ext, n3-graphify-ext, n3-git-checkpoint-ext [INFERRED]
- **Orchestration Contract System** — mop-concept-orchestration-contract, mop-constant-tasks, mop-dataclass-taskrecord, mop-concept-role-distribution, mop-concept-task-linear-chain [EXTRACTED 1.00]
- **Model Routing Validation Ecosystem** — mop-concept-model-routing, mop-constant-planning-model, mop-constant-exec-verify-model, mop-func-validate-contract, mop-test-model-routing [EXTRACTED 1.00]
- **Verification Evidence Chain** — mop-att6-verification, mop-concept-verification-criteria, mop-concept-pass-verdict, mop-concept-verifier-independence, mop-func-validate-script-main [EXTRACTED 1.00]
- **Test Coverage of Orchestration Contract** — mop-class-ledger-contract-tests, mop-test-summary-shape, mop-test-contract-valid, mop-test-model-routing, mop-test-dependencies, mop-test-validator-errors, mop-test-cli-json [EXTRACTED 1.00]
- **Subagent Limit and Contract Constraint Enforcement** — mop-concept-subagent-limit, mop-constant-max-subagents, mop-func-validate-contract, mop-func-summarize-run, mop-func-validate-script-main [EXTRACTED 1.00]
- **Semantic Error Guard Triad — all three functions validate inputs and throw descriptive errors for invalid values before computation** — division-by-zero-guard, negative-sqrt-guard, factorial-input-validation [INFERRED 0.85]
- **Arithmetic Zero Edge Case Triplet — each tests boundary behavior where zero input yields a defined non-error result (0^0=1, sqrt(0)=0, 0!=1)** — edge-case-power-zero-zero, edge-case-sqrt-zero, edge-case-factorial-zero [EXTRACTED 1.00]
- **PEV Executor Dual Assignment — both Calculator and Advanced modules are assigned to Executor roles using the same deepseek-v4-flash model under RUN_TEST_DEEPSEEK** — pev-executor-role-1, pev-executor-role-2, deepseek-v4-flash-executor [EXTRACTED 1.00]
- **Modular Composition Chain — advanced module builds factorial on top of calculator's multiply, demonstrating layered arithmetic architecture** — calculator-module, advanced-module, factorial-composition-pattern, multiply-function [EXTRACTED 1.00]
- **Orchestration Safety Parameter System (11 guardrails)** — safety-prompt-truncation, safety-proportional-truncation, safety-output-contract, safety-escape-clause, safety-budget-estimation, safety-exhaustion-detection, safety-phase-bug-reporting, safety-fallback-model, safety-task-size-cap, safety-artifact-evidence, safety-file-artifact-gate [INFERRED]
- **Safety Features Covering HANDOFF.md Orchestration Bugs** — safety-output-contract, safety-artifact-evidence, safety-file-artifact-gate, safety-phase-bug-reporting, safety-task-size-cap, safety-prompt-truncation, safety-budget-estimation, safety-exhaustion-detection, safety-escape-clause, safety-fallback-model, bug-issue3-verifier-trusts-text, bug-issue4-tasks-too-large, bug-issue5-no-artifact-verification, bug-issue6-post-agent-end-error [INFERRED]
- **Composable Pipeline Safety Architecture** — safety-composable-pipeline-shape, func-detectExhaustion, func-scanEscapeClauses, func-rewriteEscapeClauses, func-buildExecutorPrompt-pipeline, constant-MAX_TASK_WORDS, constant-PHASE_FALLBACK_MODEL, concept-output-type-contract-system [INFERRED]

## Communities (37 total, 19 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (31): Deterministic widget lifecycle state machine.  Models the dashboard widget show/, Update widget while SHOWING — no state change., Clean shutdown — signals a successful lifecycle., Error path — still guarantees cleanup ran., Explicit abort — still guarantees cleanup ran., Return to IDLE for another lifecycle., Check all three invariants against a WidgetLifecycle instance.      Returns a li, All possible widget lifecycle states. (+23 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (51): ISSUE-1: Routing check fights planner role assignments, ISSUE-3: Verifier trusts executor text output, not files, ISSUE-4: Executor tasks too large, produce reports not code, ISSUE-5: No post-execution artifact verification, Agent-name-based routing vs phase-based routing, Context window saturation (reports vs code), Dashboard sidebar panel (original task goal), Model routing constraint (provider+model per role) (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (48): abort() — explicit abort with guaranteed cleanup, AbortPathCleanupTests — abort triggers cleanup, Auto-Show Guard — session_start must not trigger show, CheckResult dataclass — single validation check, finally block in show_command — guaranteed cleanup gate, CLEANUP_GUARANTEED_STATES frozenset, CleanupGuaranteedStatesTests — all exit paths in guaranteed set, _show_count/_cleanup_count parity enforcement (+40 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (48): ctx.ui.setStatus(name, text) — Status Line API, ctx.ui.setWidget(name, lines) — Widget API, DI-1: Widget set but never explicitly cleared, DI-2: setTimeout-based cleanup is unreliable, DI-3: Widget placement defaults to aboveEditor, pushes editor off-screen, HB-2: No cleanup on session_start — Widget persists between sessions, OI-1: Verifier trusts executor text output, not file artifacts, OI-2: Executor tasks >200 words cause narrative reports instead of code (+40 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (38): 11 Files Modified in Sprint across 4 categories, Agency Enforcement Gap (research bash CAN write via shell), read-only Agency Level (read,grep,find,ls), research Agency Level (read,bash,grep,find,ls), write-enabled Agency Level (read,bash,edit,write), coder.json Subagent Definition, Deferred: Bash Read-Only Enforcement (needs pi-core policy engine), Deferred: Full Run Ledger Infrastructure (transcript logging) (+30 more)

### Community 5 - "Community 5"
Cohesion: 0.1
Nodes (35): ATT_6_VERIFICATION.md — Full verification report with 6 criteria (A-F), LedgerContractTests — unittest.TestCase with 6 test methods, Dependency Chain Validation — forward-only acyclic chain, no dangling refs, Deterministic Output — pure functions, no network, stable JSON summaries, Error Detection Capability — validator catches wrong model and missing dependency, Model Routing Pattern — planning→GPT 5.5 codecs, execution/verifier→deep-seek V4 flash, Orchestration Contract — 6 tasks, 2/2/2 role distribution, dependency chain, PASS Verdict — all 6 criteria independently verified via source inspection (+27 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (35): add() — Basic Addition, Advanced Module (advanced.js), Advanced Test Suite (advanced.test.js), Node.js assert/strict Assertion Module, Calculator Module (calculator.js), Calculator Test Suite (calculator.test.js), deepseek-v4-flash Executor Model, divide() — Basic Division (+27 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (33): ATT_n Artifact Naming Pattern (ATT_0_INTAKE, ATT_1_RESEARCH, etc.), auth.json (API keys, gitignored, never committed), confirm-destructive.ts Extension (dangerous command blocking), confirm-destructive.ts Blocked Patterns (rm -rf, mkfs, dd, truncate, sudo rm, del/rd, /dev/ redirect), .nenflow_context_health.json (shared context tracker), CONTINUATION.md Template (continuation contract), Deferred: Expanded Destructive Command Patterns (git reset, curl|sh, npm publish), Deferred: Evidence-Based Verification Enforcement in validator.js (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (31): agents.ts Extension (deprecated redirect stub), .archive/ Auto-Delete Policy (pruned/gc'd runs deleted after 30d), brain-meta.json (HeatTracker: access counts, temperatures), Core Orchestration Subsystem, Extension Layer (12 .ts files), graphify.ts Extension (knowledge graph memory), Graphify Slash Commands (/graphify, /memory, /memory-wiki subcommands), Graphify Output Artifacts (GRAPH_REPORT.md, graph.json, wiki/, obsidian/) (+23 more)

### Community 9 - "Community 9"
Cohesion: 0.09
Nodes (19): Deterministic mock dashboard widget lifecycle state machine.  Enforces invariant, Deterministic mock project used to verify orchestration behavior., Small deterministic orchestration ledger.  The data here mirrors the mock orches, A single planned orchestration subagent task., Return human-readable contract violations, or an empty list when valid., TaskRecord, validate_contract(), CLI entry point for the mock orchestration project. (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.1
Nodes (28): ctx.ui.custom() with overlay:true — Overlay API (Modal), DI-4: Jiti module cache prevents hot-reload of extensions, HB-1: ctx.ui.custom() overlay blocks text input, HB-3: findActiveRunDir() treats missing state as active, ISSUE-6: Subagent post-agent_end error noise (FIXED), nenflow-orchestration-panel.ts — Panel Extension, ORCHESTRATION_STATE.json — Run State File, pi-orchestrator-extension/src/substrate.ts — Subagent Substrate (+20 more)

### Community 11 - "Community 11"
Cohesion: 0.1
Nodes (27): ENAMETOOLONG stdin regression (verifier prompt loss), ISSUE-2: Intake normalizer overrides user model preference, ISSUE-7: PT 5.5 regex false-match for GPT routing, stdio:['ignore','pipe','pipe'] blocked stdin piping, deepseek/deepseek-v4-flash model (requested but overridden), deepseek/deepseek-v4-pro model, Fake Pi CLI test harness for no-API validation, First-found alias wins (no role-specific override) (+19 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (9): ALLOWED_TRANSITIONS — deterministic state transition table, InvalidTransitionTests — guard rails against illegal transitions, Multiple Full Lifecycles Pattern — reset→show→clear loop, NormalLifecycleTests — show→update→clear happy path, reset() — return to IDLE from terminal state, _transition_to() — validates allowed transitions, Validation Check: normal lifecycle show→update→clear, WidgetLifecycle dataclass — widget state machine (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (8): Browser Automation Subsystem, Browser Lock Recovery (zombie Chrome kill, stale LOCK clear), Deferred: Progressive-Disclosure MCP (dynamic tool registration), homedir() Portability Import (from node:os), mcp-status.ts Extension (MCP server registry), playwright-mcp.ts Extension (browser automation MCP), Playwright MCP Tools (navigate, click, snapshot, screenshot, type, fill, evaluate, etc.), SC2 Fix: homedir() import replaces hardcoded Playwright path

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (4): --prompt-file CLI flag (not supported by Pi), Fix Option A: --prompt-file temp file approach, Jiti runtime (jiti.cjs), Pi CLI binary (cli.js)

## Ambiguous Edges - Review These
- `session_start() — lifecycle hook, must not auto-show` → `WidgetState.SHOWING — Actively visible, cleanup expected`  [AMBIGUOUS]
  mock-dashboard-test/src/dashboard_mock/widget_lifecycle.py · relation: conceptually_related_to
- `add() — Basic Addition` → `Calculator Module (calculator.js)`  [AMBIGUOUS]
  nenflow-test-mock-project/src/calculator.js · relation: conceptually_related_to
- `subtract() — Basic Subtraction` → `Calculator Module (calculator.js)`  [AMBIGUOUS]
  nenflow-test-mock-project/src/calculator.js · relation: conceptually_related_to

## Knowledge Gaps
- **137 isolated node(s):** `Stdlib validation script for the mock orchestration project.  This script is int`, `Run a single check, catching exceptions.`, `Deterministic widget lifecycle state machine.  Models the dashboard widget show/`, `All possible widget lifecycle states.`, `A deterministic widget that enforces invariant rules.      Key design decisions:` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `session_start() — lifecycle hook, must not auto-show` and `WidgetState.SHOWING — Actively visible, cleanup expected`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `add() — Basic Addition` and `Calculator Module (calculator.js)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `subtract() — Basic Subtraction` and `Calculator Module (calculator.js)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `CLEANUP_GUARANTEED_STATES frozenset` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `CLEANUP_GUARANTEED_STATES frozenset` (e.g. with `WidgetState Enum` and `WidgetLifecycle`) actually correct?**
  _`CLEANUP_GUARANTEED_STATES frozenset` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Stdlib validation script for the mock orchestration project.  This script is int`, `Run a single check, catching exceptions.`, `Deterministic widget lifecycle state machine.  Models the dashboard widget show/` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._