# Graph Report - .  (2026-06-03)

## Corpus Check
- Corpus is ~10,443 words - fits in a single context window. You may not need a graph.

## Summary
- 79 nodes · 86 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 85% EXTRACTED · 15% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Mock Orchestration Tests|Mock Orchestration Tests]]
- [[_COMMUNITY_NenFlow v3 Pipeline|NenFlow v3 Pipeline]]
- [[_COMMUNITY_Ledger Contract Validation|Ledger Contract Validation]]
- [[_COMMUNITY_Routing & Intake System|Routing & Intake System]]
- [[_COMMUNITY_Dashboard & Orchestrate Core|Dashboard & Orchestrate Core]]
- [[_COMMUNITY_Substrate & Subagents|Substrate & Subagents]]
- [[_COMMUNITY_Calculator Mock Modules|Calculator Mock Modules]]
- [[_COMMUNITY_AST Call Graph Edges|AST Call Graph Edges]]

## God Nodes (most connected - your core abstractions)
1. `LedgerContractTests` - 9 edges
2. `NenFlow v3 orchestrator skill` - 9 edges
3. `orchestrate tool` - 8 edges
4. `validate_contract()` - 6 edges
5. `summarize_run()` - 5 edges
6. `Dashboard widget persists-breaking-Pi-input` - 5 edges
7. `main()` - 4 edges
8. `TaskRecord` - 4 edges
9. `main()` - 4 edges
10. `deterministic model routing check` - 4 edges

## Surprising Connections (you probably didn't know these)
- `setWidget/clear lifecycle` --conceptually_related_to--> `orchestrate tool`  [EXTRACTED]
  DASHBOARD_POSTMORTEM.md → pi-orchestrator-extension/src/index.ts
- `deterministic model routing check` --conceptually_related_to--> `Intake normalizer model override bug`  [INFERRED]
  pi-orchestrator-extension/src/shapes/plan-execute-verify.ts → HANDOFF.md
- `Dashboard widget persists-breaking-Pi-input` --conceptually_related_to--> `orchestrate tool`  [EXTRACTED]
  DASHBOARD_POSTMORTEM.md → pi-orchestrator-extension/src/index.ts
- `Intake normalizer model override bug` --conceptually_related_to--> `inferModelRoutingFromTask`  [EXTRACTED]
  HANDOFF.md → pi-orchestrator-extension/src/index.ts
- `validator.js (NenFlow)` --references--> `Route D Context Handoff Continuation`  [EXTRACTED]
  ~/.pi/agent/nenflow-v3/validator.js → nenflow-v3/SKILL.md

## Hyperedges (group relationships)
- **Orchestration Bug Taxonomy** — dashboard_widget_bug, intake_normalizer_bug, executor_report_vs_code, verifier_trusts_text, jiti_cache_issue, routing_check [INFERRED 0.85]
- **NenFlow v3 PEV Pipeline** — nenflow_v3_skill, pev_researcher, pev_planner, pev_executor, pev_verifier, intake_contract [EXTRACTED 1.00]
- **Dashboard Root Cause Analysis** — dashboard_widget_bug, nenflow_orchestration_panel, setwidget_lifecycle, pi_tui_widget_api, orchestration_state, jiti_cache_issue [EXTRACTED 1.00]

## Communities (10 total, 2 thin omitted)

### Community 0 - "Mock Orchestration Tests"
Cohesion: 0.14
Nodes (10): Deterministic mock project used to verify orchestration behavior., Small deterministic orchestration ledger.  The data here mirrors the mock orches, Return a stable summary of the orchestration ledger., summarize_run(), main(), CLI entry point for the mock orchestration project., Print a deterministic JSON summary for validators., main() (+2 more)

### Community 1 - "NenFlow v3 Pipeline"
Cohesion: 0.15
Nodes (15): context-policy.js (NenFlow), executor output contract, executor produces reports not code, nenflow-orchestration-panel.ts (DISABLED), NenFlow v3 orchestrator skill, ORCHESTRATION_HEADER.json, ORCHESTRATION_STATE.json, pev-executor subagent (+7 more)

### Community 2 - "Ledger Contract Validation"
Cohesion: 0.18
Nodes (7): A single planned orchestration subagent task., Return human-readable contract violations, or an empty list when valid., TaskRecord, validate_contract(), LedgerContractTests, Automated tests for the deterministic orchestration mock project., Verify that the mock ledger preserves the orchestration contract.

### Community 3 - "Routing & Intake System"
Cohesion: 0.22
Nodes (9): buildRoutingRequirements, intake contract (ATT_0_INTAKE), Intake normalizer model override bug, inferModelRoutingFromTask, NormalizedParams type, NaturalLanguageOrchestrationControls, Plan-Execute-Verify orchestration shape, deterministic model routing check (+1 more)

### Community 4 - "Dashboard & Orchestrate Core"
Cohesion: 0.22
Nodes (10): agentEnded guard (post-termination error fix), Dashboard widget persists-breaking-Pi-input, fake-pi.cjs (test harness), jiti module cache staleness, Multi-Verify-Vote orchestration shape, orchestrate tool, Pi TUI setWidget API, setWidget/clear lifecycle (+2 more)

### Community 6 - "Calculator Mock Modules"
Cohesion: 0.67
Nodes (3): Advanced calculator module, Calculator module, nenflow-test-mock-project

## Knowledge Gaps
- **28 isolated node(s):** `Stdlib validation script for the mock orchestration project.  This script is int`, `Run deterministic validation checks and print a JSON result.`, `Small deterministic orchestration ledger.  The data here mirrors the mock orches`, `A single planned orchestration subagent task.`, `Return a stable summary of the orchestration ledger.` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `NenFlow v3 orchestrator skill` connect `NenFlow v3 Pipeline` to `Routing & Intake System`?**
  _High betweenness centrality (0.104) - this node is a cross-community bridge._
- **Why does `orchestrate tool` connect `Dashboard & Orchestrate Core` to `Routing & Intake System`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `LedgerContractTests` connect `Ledger Contract Validation` to `Mock Orchestration Tests`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `validate_contract()` (e.g. with `main()` and `main()`) actually correct?**
  _`validate_contract()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `summarize_run()` (e.g. with `main()` and `main()`) actually correct?**
  _`summarize_run()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Stdlib validation script for the mock orchestration project.  This script is int`, `Run deterministic validation checks and print a JSON result.`, `Small deterministic orchestration ledger.  The data here mirrors the mock orches` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Mock Orchestration Tests` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._