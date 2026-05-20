# Graph Report - .  (2026-05-12)

## Corpus Check
- 110 files · ~35,000 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 303 nodes · 454 edges · 53 communities (28 shown, 25 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.9)
- Token cost: 103,265 input · 5,521 output

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
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]

## God Nodes (most connected - your core abstractions)
1. `ATT_4_EXECUTION.md Attempt 1 Execution` - 24 edges
2. `ATT_2_PLAN.md Implementation Plan` - 18 edges
3. `ATT_8_EXECUTION.md Attempt 2 Execution` - 18 edges
4. `ATT_7_PLAN.md Retry Plan Attempt 2` - 17 edges
5. `context-policy.js Shared Policy Module` - 15 edges
6. `ATT_5_TEST_BUILDER_EXECUTION.md Attempt 1 Test Builder` - 12 edges
7. `sandbox-tests attempt-1` - 12 edges
8. `Flexible User-Configurable Thresholds 65 45 35 20 40` - 11 edges
9. `sandbox-tests attempt-2` - 11 edges
10. `ATT_0_INTAKE.md Intake Definition` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Attempt 1 Static Propagation Tests` ----> `pev-executor Skill`  [EXTRACTED]
  run/sandbox-tests/attempt-1/tests/static-propagation.test.js -> ../../.pi/agent/skills/nenflow-pev-executor/SKILL.md
- `Attempt 1 Static Propagation Tests` ----> `pev-planner Skill`  [EXTRACTED]
  run/sandbox-tests/attempt-1/tests/static-propagation.test.js -> ../../.pi/agent/skills/nenflow-pev-planner/SKILL.md
- `Attempt 1 Static Propagation Tests` ----> `pev-researcher Skill`  [EXTRACTED]
  run/sandbox-tests/attempt-1/tests/static-propagation.test.js -> ../../.pi/agent/skills/nenflow-pev-researcher/SKILL.md
- `Attempt 1 Static Propagation Tests` ----> `pev-verifier Skill`  [EXTRACTED]
  run/sandbox-tests/attempt-1/tests/static-propagation.test.js -> ../../.pi/agent/skills/nenflow-pev-verifier/SKILL.md
- `pev-executor Skill` ----> `context_handoff_threshold_percent`  [EXTRACTED]
  ../../.pi/agent/skills/nenflow-pev-executor/SKILL.md -> context-policy.js

## Hyperedges (group relationships)
- **PEV Orchestration Loop** -- intake_Orchestrator, intake_Researcher, intake_Planner, intake_Executor, intake_Verifier [EXTRACTED 0.95]
- **Continuation / Handoff Protocol** -- intake_ContinuationContract, intake_HandoffThreshold, intake_AtomicUnit, intake_HandoffMechanism, intake_RouteD, executor_ContinuationProtocol, planner_ContinuationProtocol, verifier_ContinuationProtocol, researcher_ContinuationProtocol [EXTRACTED 0.95]
- **NenFlow v3 Artifact Suite** -- intake_IntakeArtifact, intake_ResearchArtifact, intake_PlanArtifact, intake_ExecutionReport, intake_VerifierBrief, intake_VerificationReport, skill_LATESTAliases [EXTRACTED 0.95]
- **Context Health Monitoring System** -- skill_ContextHealthFile, intake_HandoffThreshold, intake_ContextWindowSaturation, intake_ContextHealthTelemetry, intake_HealthBands, intake_ContextSaturationEstimate, executor_ContextSelfAssessment, planner_ContextSelfAssessment, verifier_ContextSelfAssessment, researcher_ContextSelfAssessment [EXTRACTED 0.90]
- **Artifact Validation System** -- validator_CLI, validator_FrontmatterCheck, validator_RoleCheck, validator_ArtifactTypeCheck, validator_VerdictCheck, validator_ContinuationCheck, policy_validateContinuationContract, policy_parseFrontmatter, policy_getSection, policy_looksPlaceholder [EXTRACTED 0.95]
- **Dual Runtime Architecture (Pi vs Claude Code)** -- intake_PiRuntime, intake_ClaudeCodeRuntime, intake_NenFlowV3Extension, skill_NenFlowV3Skill, audit_NoEnforcementExtension [EXTRACTED 0.90]
- **Three-Tier Threshold Configuration System** -- intake_WarningThreshold, intake_HandoffThreshold, intake_HardRiskThreshold, intake_ThresholdConfig, intake_RUNConfig, policy_buildContextPolicy, policy_DefaultThreshold [EXTRACTED 0.95]
- **Context Policy Function Suite** -- policy_parseFrontmatter, policy_parseContextThreshold, policy_thresholdFromIntakeFrontmatter, policy_buildContextPolicy, policy_buildRunConfig, policy_validateRunConfig, policy_writeRunConfig, policy_readRunConfig, policy_buildContinuationPath, policy_findContinuation, policy_buildContinuationResumePrompt, policy_validateContinuationContract, policy_getSection, policy_looksPlaceholder, policy_inferRunDir, policy_isInside, policy_isValidPercent, policy_parsePercentValue, policy_continuationMatchFor [EXTRACTED 0.95]
- **Continuation Contract Document Structure** -- continuation_Frontmatter, continuation_WorkCompleted, continuation_WorkRemaining, continuation_CriticalContext, continuation_ResumeInstruction, intake_ContinuationContract [EXTRACTED 0.95]
- **Route D Continuation Detection and Resume Loop** -- intake_RouteD, skill_RouteDContextHandoff, skill_FiveAttemptLimit, skill_ContinuationResumePrompt, intake_ContinuationContract, intake_Subagent, intake_HandoffMechanism [EXTRACTED 0.95]
- **PEV Role Skill Set** -- executor_ExecRole, planner_PlannerRole, verifier_VerifierRole, researcher_ResearcherRole, executor_ContextSelfAssessment, planner_ContextSelfAssessment, verifier_ContextSelfAssessment, researcher_ContextSelfAssessment, executor_ContinuationProtocol, planner_ContinuationProtocol, verifier_ContinuationProtocol, researcher_ContinuationProtocol [EXTRACTED 0.95]
- **Gap Cluster - Missing Infrastructure for Context Handoff** -- audit_NoEnforcementExtension, audit_ThresholdMismatch, audit_ValidatorGap, audit_NoContinuationArtifacts, audit_ValidatorTooLoose, audit_ImplementationPlanNeeded [EXTRACTED 0.95]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** --  [INFERRED]
- **** -- s1_run, s1_parser, s1_validator, s1_route_d, s1_static, s1_smoke, s1_helpers, s1_summary [INFERRED]
- **** -- s2_run, s2_parser, s2_validator, s2_route_d, s2_static, s2_smoke, s2_helpers, s2_summary [INFERRED]
- **** -- latest_intake, latest_research, latest_plan, latest_impl_exec, latest_impl_vbrief, latest_tb_exec, latest_tb_evidence, latest_vbrief, latest_run_plan [INFERRED]
- **** -- context_policy_js, validator_js, orch_skill, pev_exec, pev_plan, pev_res, pev_ver [INFERRED]
- **** -- c_Route_D, c_threshold, c_RUN_CONFIG, c_continuation, c_parseThreshold, c_thresholdSource [INFERRED]
- **** -- fixtures_continuation, fixtures_run_config, fixtures_simulated, fixtures_readme [INFERRED]
- **** -- pev_exec, pev_plan, pev_res, pev_ver, c_threshold, c_Route_D [INFERRED]

## Communities (53 total, 25 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (46): Threshold Mismatch (65% hard-coded), Executor Context Self-Assessment, Executor Continuation Protocol, Evidence Standard (observable proof), Executor Role, Implementation Steps, Verifier Brief (ATT_n_VERIFIER_BRIEF.md), Execution Report (ATT_n_EXECUTION.md) (+38 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (34): Implementation Plan Needed (7 items), Infrastructure Audit, Zero Continuation Artifacts Found, No Enforcing Pi Extension, Validator Completeness Gap, Validator Too Loose (no body enforcement), Audit Verdict - Not Sufficient, nenflow-v3.ts (no-op extension) (+26 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (41): Attempt 1 Result FAIL, ATT_10_ORCHESTRATION_RESULT.md Final PASS Verdict, ATT_1_RESEARCH_DIAGNOSTIC.md Diagnostic Report, ATT_2_PLAN.md Implementation Plan, ATT_4_EXECUTION.md Attempt 1 Execution, ATT_4_VERIFIER_BRIEF.md Attempt 1 Verifier Brief, ATT_5_TEST_EVIDENCE.md Attempt 1 Test Evidence, ATT_6_PLANNER_HANDOFF.md Planner Handoff (+33 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (30): RUN_CONFIG.json Schema, Route D Context Handoff, CONTINUATION_CONTRACT Artifact, context_handoff_threshold_percent, Sample Valid Continuation Contract Fixture, Sample RUN_CONFIG 40% Fixture, Simulated Run Directories Fixture, Orchestrator Skill SKILL.md (+22 more)

### Community 4 - "Community 4"
Cohesion: 0.17
Nodes (20): threshold_source (user_prompt|intake|default), buildContextPolicy(), buildRunConfig(), continuationMatchFor(), getSection(), hasInvalidTokenBoundary(), hasSeparatedSignBefore(), inferRunDir() (+12 more)

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (17): Attempt 2 Result PASS, ATT_3_RUN_PLAN.md Run Plan, ATT_5_TEST_BUILDER_EXECUTION.md Attempt 1 Test Builder, ATT_5_VERIFIER_BRIEF.md Attempt 1 Verifier Brief, ATT_9_TEST_BUILDER_EXECUTION.md Attempt 2 Test Builder, ATT_9_VERIFIER_BRIEF.md Attempt 2 Verifier Brief, Bounded Retry Strategy, normal-flow-smoke.test.js (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.18
Nodes (11): Constraints Identified Section, Researcher Context Self-Assessment, Researcher Continuation Protocol, Existing Patterns Section, Investigation Scope, Key Findings Section, Recommendations Section, Research Artifact (ATT_n_RESEARCH.md) (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (11): ATT_0_INTAKE.md Intake Definition, ATT_1_RESEARCH.md Research Findings, Context-Health Handoff Mechanism, Context Health Telemetry Pi APIs, Continuation Contract Artifact Type, CONTINUATION.md Contract Template, run contracts folder, RESEARCHER Role (+3 more)

### Community 8 - "Community 8"
Cohesion: 0.25
Nodes (9): LATEST Implementation Execution (ATT_8), LATEST Implementation Verifier Brief, LATEST INTAKE (ATT_0), LATEST PLAN (ATT_7), LATEST Research (ATT_1), LATEST Run Plan (ATT_3), LATEST Test Evidence (ATT_9), LATEST Test Builder Execution (ATT_9) (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.43
Nodes (7): Executor Agent, Google Gemma Model, Intake: Rebuild Local Google Gemma Model Configuration for Pi Harness, Llama Installation, Pi Coding Harness, Research Agent, Turbo Quant / KV-cache compression

### Community 10 - "Community 10"
Cohesion: 0.6
Nodes (3): runId(), spawnNode(), writeContinuation()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (5): Critical Context Section, Continuation Contract Frontmatter, Resume Instruction Section, Work Completed Section, Work Remaining Section

### Community 12 - "Community 12"
Cohesion: 0.83
Nodes (3): discoverTestModules(), ensureCleanGeneratedFixtures(), main()

### Community 13 - "Community 13"
Cohesion: 0.83
Nodes (3): discoverTestModules(), ensureCleanGeneratedFixtures(), main()

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (3): Claude Code Hooks Work in Isolation, Context Health Telemetry, Task 2 - Capability Audit

## Knowledge Gaps
- **93 isolated node(s):** `Llama Installation`, `Pi Coding Harness`, `NenFlow v3`, `Context-Health Handoff Infrastructure`, `Handoff Mechanism` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** -- run `graphify query` to explore isolated nodes.