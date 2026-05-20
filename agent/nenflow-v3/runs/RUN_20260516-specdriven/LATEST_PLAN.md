---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260516-specdriven
context_saturation_estimate: ~12%
context_handoff_threshold_percent: 65
threshold_source: default
---

## Task Statement
Convert the ecological spec-driven development intake methodology at C:/Users/doner/Downloads/intake_ecological_sdd.md into a Pi global skill /spec_driven_ecology that works standalone AND as an alternative intake mode within NenFlow v3, with a new dedicated pev-intake-ecological subagent, without modifying NenFlow core beyond adding the mode option.

## Invariants
- NenFlow existing routes (A-E) must not break and the existing orchestrator INTAKE path must remain fully functional
- The skill must work standalone without NenFlow when invoked as /spec_driven_ecology
- Raw user prompt must be preserved verbatim before any interpretation (Phase 0/1)
- No implementation during intake must be enforced at all times during the intake conversation
- Existing agent JSON files (pev-planner, pev-executor, pev-verifier, pev-researcher) and their corresponding PEV skill files must not be modified
- The Observer role from the ecological methodology is folded into the Verifier; no separate Observer agent is created
- Spelling is spec_driven_ecology (single c) throughout all file names and references
## Success Criteria
1. Skill file exists at ~/.pi/agent/skills/spec-driven-ecology/SKILL.md with valid YAML frontmatter containing name: spec-driven-ecology and a description field
2. SKILL.md covers all 15 ecological phases (Raw Prompt Capture through Final Intake Spec Synthesis), adapted for Pi agent context with appropriate tool references
3. SKILL.md includes the conversation protocol (Reflect -> Separate -> Ask Material Questions -> Offer Provisional Structure -> Let Human Correct -> Synthesize), material question filter, and LLM first response template from the source methodology
4. SKILL.md includes depth selection guidance for Minimal, Standard, and Deep modes with clear trigger conditions for each
5. SKILL.md includes standalone invocation instructions so a user typing /spec_driven_ecology gets the ecological intake experience without NenFlow
6. References directory exists at ~/.pi/agent/skills/spec-driven-ecology/references/ containing Planner handoff, Executor handoff, and Verifier handoff templates adapted from methodology Sections 11-13
7. Agent definition exists at ~/.pi/agent/agents/pev-intake-ecological.json following the pev-planner.json schema with tools: read,bash,write and skills: [spec-driven-ecology]
8. nenflow-v3 SKILL.md is additively modified to include ecological intake as a mode option with pev-intake-ecological subagent spawning logic
9. Ecological intake produces ATT_0_INTAKE.md in NenFlow-compatible format (same frontmatter schema) with ecological supplements the Planner/Executor/Verifier can consume without format changes
10. Existing NenFlow routes are not broken: a standard non-ecological /nenflow-v3 run still produces ATT_0_INTAKE.md via the Orchestrator, routes correctly, and all subagents remain unchanged
## Implementation Steps

### Stage 1: Create the Skill Directory and SKILL.md

**Step 1.1** -- Create directories:
- ~/.pi/agent/skills/spec-driven-ecology/
- ~/.pi/agent/skills/spec-driven-ecology/references/

**Step 1.2** -- Write SKILL.md YAML frontmatter:


**Step 1.3** -- Write SKILL.md body: Skill Purpose and Orientation (Sections 1-2)
Adapt the ecological methodology core claim: a user prompt is an opening perturbation in a development ecology. Include the progression chain (raw prompt -> clarified intent -> situated purpose -> ... -> planning-ready spec) and core principle (intake succeeds when next agent can act without hidden context).

**Step 1.4** -- Write SKILL.md body: Operating Modes (Section 3)
Minimal: small/reversible/low-risk, ask only 5 core questions. Standard: normal feature work, all main phases with limited material questions. Deep: complex/multi-agent/architectural/high-risk, all phases fully including perturbation tests and explicit handoff contracts.

**Step 1.5** -- Write SKILL.md body: Roles (Section 4, adapted)
Adapt for Pi/NenFlow: Human role unchanged. Intake LLM guides the current Pi agent. Planner/Executor/Verifier roles noted as conceptual in standalone mode, mapped to subagents in NenFlow mode. Observer folded into Verifier per design decision.

**Step 1.6** -- Write SKILL.md body: Global Invariants (Section 5)
All 7 invariants exactly as methodology: No Implementation During Intake, Preserve Raw Prompt, Separate Facts/Inferences/Assumptions/Unknowns, Ask Only Material Questions, Produce Durable Handoff, Verification Designed Before Execution, Reality Contact Over Coherence.

**Step 1.7** -- Write SKILL.md body: Ecological Concepts (Section 6)
Definitions for: Invariants, Constraints (8 types), Affordances, Attractors (good and bad lists), Perturbations, Representative Environment. Adapted as instructional definitions for Pi agent consumption.

**Step 1.8** -- Write SKILL.md body: Full 15-Phase End-to-End Process (Section 7)**
Core of the skill. For each phase (0-15), include: Human Experience description, LLM Action instructions, Output template (markdown block), LLM Rules (constraints), and Question banks (where applicable). Preserve exact question banks from source methodology.

Phases:
- 0: Session Start -- record prompt, identify depth with rationale
- 1: Raw Prompt Capture -- verbatim, first reading, immediate unknowns
- 2: Intent Clarification -- 7-question bank, clarified intent output
- 3: Purpose Clarification -- 5-question bank, purpose/need/value output
- 4: Context Mapping -- 9-question bank, full context map with actors/tools/limits
- 5: Epistemic Separation -- Known/Inferred/Assumed/Unknown/Material Unknowns
- 6: Invariant Discovery -- 7-question bank, invariants with why-it-matters and verification-method
- 7: Constraint Mapping -- 8 categories (Technical, Design, Human, Organisational, Security, Tooling, Time/Cost, Verification)
- 8: Affordance Mapping -- per-role landscape (Human, Intake LLM, Planner, Executor, Verifier), actions to block
- 9: Attractor and Failure-Mode Analysis -- good/bad attractors, counter-constraints, early warning signs
- 10: Scope and Boundary Setting -- In/Out/Deferred scope, requires human gate
- 11: Representative Environment Design -- real use context, realistic inputs/edge cases, misleading toy conditions
- 12: Perturbation Tests -- 6 standard tests (vague/overloaded/contradiction/context-loss/verification-weakness/scope-creep)
- 13: Success Criteria and Falsifiers -- criteria with evidence and verification method, falsifiers with invalidation reason
- 14: Human Gate Before Planning -- approval block with understanding summary, settled/open decisions, carried assumptions
- 15: Final Intake Spec Synthesis -- complete structured spec with all ecological sections
**Step 1.9** -- Write SKILL.md body: Conversation Protocol (Section 8)
6-step loop: Reflect (state current reading), Separate (Known/Inferred/Unknown), Ask Material Questions (1-5 per pass), Offer Provisional Structure, Let Human Correct the Frame, Synthesize (produce final intake spec when clarity exists).

**Step 1.10** -- Write SKILL.md body: Material Question Filter (Section 9)
10-item filter: only ask if answer could change scope, architecture, implementation path, risk, verification, UX, data handling, human approval, agent handoff, or source-of-truth selection.

**Step 1.11** -- Write SKILL.md body: LLM First Response Templates (Section 10)
Full template: "I will treat this as an intake rather than an implementation request..." with interpretation, known/inferred/unknown, 1-3 material questions, and no-implementation commitment. Short template (for Minimal mode): interpretation, 3 key clarifications.

**Step 1.12** -- Write SKILL.md body: Intake Readiness Checklist (Section 15)
16-item checklist exactly as methodology Section 15. If any critical item is missing, mark Planning Readiness: Not Ready.

**Step 1.13** -- Write SKILL.md body: Spec Quality Tests (Section 16)
All 5 tests: Fresh Agent Test, Verification Contact Test, Scope Stability Test, Invariant Preservation Test, Representative Use Test. Each with failure condition.

**Step 1.14** -- Write SKILL.md body: Standalone Invocation Instructions
User types /spec_driven_ecology or says "use ecological intake". Skill instructs Pi agent to begin Phase 0 immediately, record raw prompt, identify depth, start conversation loop. At completion, produce Final Intake Spec (Phase 15) in current working directory or user-specified path.

**Step 1.15** -- Write SKILL.md body: NenFlow Mode Instructions
When used within NenFlow v3: orchestrator spawns pev-intake-ecological. Subagent uses this skill to guide ecological intake. Output written as ATT_0_INTAKE.md in run directory with NenFlow-compatible frontmatter (artifact_type: INTAKE, role: ORCHESTRATOR, run_id, etc.). Ecological sections added as supplements: Epistemic Map, Affordance Landscape, Attractors, Perturbation Tests, Representative Environment, Falsifiers, Human Gates. Observability duties fold into Verifier.

**Step 1.16** -- Write SKILL.md body: Example Micro-Intake (Section 17)
Include the worked example from the methodology (booking dashboard) as a concrete demonstration of how the intake produces output from a raw prompt.
### Stage 2: Create Handoff Templates in references/

**Step 2.1** -- Create references/planner-handoff.md
Adapt methodology Section 11. Content: Source attribution, Approved Intent/Purpose/Scope, Non-Negotiable Invariants, Constraints, Affordances to Preserve, Known Context, Assumptions, Open Questions, Required Deliverables, Suggested Planning Focus, Verification Requirements, Human Gates, Do Not Do section, Planner Instruction ("Create a staged plan. Do not implement. Preserve invariants.").

**Step 2.2** -- Create references/executor-handoff.md
Adapt methodology Section 12. Content: Build Objective, Approved Tasks, Files Likely Affected/Not to Touch, Invariants, Implementation Constraints, Source-of-Truth Materials, Required Checks, Evidence Required, Human Approval Required Before, Do Not Do section, Executor Instruction ("Implement only approved tasks. Use small diffs. Read before editing.").

**Step 2.3** -- Create references/verifier-handoff.md
Adapt methodology Section 13. Content: Verification Objective, Invariants to Test, Success Criteria, Falsifiers, Required Evidence, Runtime Checks, Screenshots/Logs/Test Output Required, Claims to Verify, Failure Conditions, Verification Report Format (Result/Evidence/Verified Claims/Unverified Claims/Failed Criteria/Drift Observed/Recommended Next Action), Verifier Instruction ("Do not accept completion claims without evidence.").

### Stage 3: Create the Agent Definition

**Step 3.1** -- Create ~/.pi/agent/agents/pev-intake-ecological.json
Schema matching pev-planner.json exactly. Fields:
- name: "pev-intake-ecological"
- description: about ecological spec-driven intake with 15 phases across 3 depth modes
- systemPrompt: instructs agent to guide through ecological intake phases, prohibits implementation/planning, requires raw prompt preservation, epistemic separation, material-only questions, output to exact task-specified path
- tools: "read,bash,write" (write needed for INTAKE artifact; read/bash for context mapping inspections)
- skills: ["spec-driven-ecology"]

### Stage 4: Modify nenflow-v3 SKILL.md for Ecological Intake Mode

**Step 4.1** -- Read ~/.pi/agent/skills/nenflow-v3/SKILL.md fully before any edits.

**Step 4.2** -- Insert ecological mode detection section after Required Orchestration Shape but before detailed phase descriptions. Content:
- Keywords that trigger ecological mode: "ecological", "spec-driven ecology", "ecological intake", "deep spec", "/spec_driven_ecology", or user explicitly asking for 15-phase ecological process
- In ecological mode, Orchestrator spawns pev-intake-ecological subagent instead of performing INTAKE itself
- Pass raw prompt, run id, RUN_CONFIG.json path, context_handoff_threshold_percent, exact ATT_0_INTAKE.md path, and exact continuation path
- Subagent produces NenFlow-compatible ATT_0_INTAKE.md with enriched ecological sections
- After ecological intake, Orchestrator reads produced INTAKE, validates it, continues to RESEARCH or PLAN normally
- If unclear whether user wants ecological mode, Orchestrator explicitly asks rather than auto-detecting from ambiguous prompts

**Step 4.3** -- Update subagent invocation section to include pev-intake-ecological with note "only for ecological intake mode".

**Step 4.4** -- Add note to INTAKE Format section: when ecological intake used, ATT_0_INTAKE.md includes additional ecological sections (Epistemic Map, Affordance Landscape, Attractors and Failure Modes, Perturbation Tests, Representative Environment, Falsifiers, Human Gates) as supplements to the standard format (Task Summary, Task Type, User Intent, Goal Attractor, Constraints, Invariants, Success Criteria, Ambiguities, Routing Decision).

**Step 4.5** -- Preservation rule: modifications must be additive only. No existing section text, procedure, or rule removed or rewritten. Three insertions: new ecological mode section, extended subagent list, INTAKE format note. Everything else stays exactly as-is.

### Stage 5: Validation

**Step 5.1** -- Verify all created files:
- SKILL.md at ~/.pi/agent/skills/spec-driven-ecology/SKILL.md with YAML frontmatter (name, description), covers all 15 phases, includes conversation protocol, material filter, first response templates, depth guidance, standalone/NenFlow instructions
- references/planner-handoff.md, references/executor-handoff.md, references/verifier-handoff.md all exist with content matching methodology Sections 11-13
- pev-intake-ecological.json at ~/.pi/agent/agents/ with all 5 fields, skills includes spec-driven-ecology
- nenflow-v3 SKILL.md has original content intact plus ecological mode section with pev-intake-ecological reference
- Example micro-intake included in SKILL.md
## Handoff Notes

### Source Materials (already inspected by Planner)
- Ecological methodology: C:/Users/doner/Downloads/intake_ecological_sdd.md -- 18 sections covering full intake process, conversation protocol, question banks, handoff templates for all roles, readiness checklist, and spec quality tests. This is the canonical source.
- NenFlow v3 orchestrator: ~/.pi/agent/skills/nenflow-v3/SKILL.md -- performs INTAKE itself, spawns pev-planner/pev-executor/pev-verifier/pev-researcher, uses Route D. Must be modified additively only.
- Existing agent template: ~/.pi/agent/agents/pev-planner.json -- JSON schema pattern: name, description, systemPrompt, tools, skills.
- Disabled intake agent: ~/.pi/agent/agents/pev-intake.json.disabled -- previous standard intake definition, different purpose.
- All existing PEV skill files inspected: nenflow-pev-planner, nenflow-pev-executor, nenflow-pev-verifier, nenflow-pev-researcher (imperative form, context self-assessment, output requirements).

### Key Design Decisions (from INTAKE)
1. New dedicated subagent pev-intake-ecological -- Orchestrator does NOT perform ecological intake itself
2. Observer folded into Verifier -- no separate Observer agent; Verifier independence rule covers drift-watching
3. All three depths supported: Minimal (5 questions), Standard (all phases, limited questions), Deep (all phases fully)
4. Handoff supplements existing NenFlow formats -- ecological sections added, not replacing standard sections
5. Spelling: spec_driven_ecology with single c throughout
6. Scope boundary: create skill + agent + NenFlow mode; do NOT modify NenFlow core (validator, context-policy, continuation templates, existing PEV skills)

### Skill File Structure (SKILL.md outline)
- YAML frontmatter (name, description)
- Skill Purpose and Core Orientation
- Operating Modes (Minimal/Standard/Deep with triggers)
- Roles (Human, Intake LLM, Planner, Executor, Verifier)
- Global Invariants (7 items)
- Ecological Concepts (Invariants, Constraints, Affordances, Attractors, Perturbations, Representative Environment)
- End-to-End Intake Process (Phases 0-15 with output templates and question banks)
- Conversation Protocol (6-step loop)
- Material Question Filter (10-item checklist)
- LLM First Response Templates (full and short)
- Intake Readiness Checklist (16 items)
- Spec Quality Tests (5 tests)
- Standalone Invocation Instructions
- NenFlow v3 Integration Mode
- Example Micro-Intake

### NenFlow Modification Scope
Surgical additive changes only to ~/.pi/agent/skills/nenflow-v3/SKILL.md:
- INSERT ecological mode section after Required Orchestration Shape
- APPEND pev-intake-ecological to subagent list (with ecological-mode-only note)
- APPEND ecological enrichment note to INTAKE Format section
- DO NOT TOUCH: Route D logic, artifact naming rules, validation rules, context-policy integration, health file, continuation protocol, any existing procedural text

### Files Summary
| Action | Path | Description |
|--------|------|-------------|
| CREATE | ~/.pi/agent/skills/spec-driven-ecology/SKILL.md | Full 15-phase ecological intake skill |
| CREATE | ~/.pi/agent/skills/spec-driven-ecology/references/planner-handoff.md | Planner handoff template |
| CREATE | ~/.pi/agent/skills/spec-driven-ecology/references/executor-handoff.md | Executor handoff template |
| CREATE | ~/.pi/agent/skills/spec-driven-ecology/references/verifier-handoff.md | Verifier handoff template |
| CREATE | ~/.pi/agent/agents/pev-intake-ecological.json | Ecological intake subagent definition |
| MODIFY | ~/.pi/agent/skills/nenflow-v3/SKILL.md | Add ecological intake mode |

### Risk Notes
- SKILL.md will be large (~8-12k words) due to 15-phase completeness requirement -- intentional, methodology is comprehensive by design
- Handoff templates in references/ keep SKILL.md leaner per progressive disclosure principle from skill-creator
- NenFlow modification risk is minimal (three additive insertions, no rewrites of existing content)
- No existing spec-driven-ecology directory exists, so no risk of overwriting user content
- The Observer role being folded into Verifier means the Observer Report Template (Section 14) and Observer role description (Section 4.6) from the methodology are NOT included in the skill or any agent definition
- The Executor must read the full nenflow-v3 SKILL.md before making changes to confirm exact insertion points

### Planner Shortcut Notes for Executor
- All source files have been read and their contents are known; the Executor should reference the methodology file directly for exact question bank wording
- The SKILL.md is the largest file; all other files are small templates or JSON definitions
- The nenflow-v3 modification is 3 insertions; preserve the exact text of the orchestrator between insertion points
- The pev-intake-ecological agent definition can be created by adapting pev-planner.json with different name/description/systemPrompt/tools/skills values