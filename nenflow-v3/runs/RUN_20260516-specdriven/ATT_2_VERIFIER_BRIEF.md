---
artifact_type: VERIFIER_BRIEF
role: EXECUTOR
run_id: RUN_20260516-specdriven
context_saturation_estimate: "~12%"
---

# ATT_2 — VERIFIER BRIEF

Each Success Criterion from the Plan is listed with direct evidence and a concrete verification command the Verifier should run independently.

---

## SC-1: Skill file exists with valid YAML frontmatter

**Criterion:** Skill file exists at `~/.pi/agent/skills/spec-driven-ecology/SKILL.md` with valid YAML frontmatter containing `name: spec-driven-ecology` and a description field.

**Evidence:**
- File path: `~/.pi/agent/skills/spec-driven-ecology/SKILL.md`
- File size: 27,527 bytes (4,102 words)
- Frontmatter lines 1-4 contain `---`, `name: spec-driven-ecology`, `description: ...` (comprehensive description), `---`

**Verification command:**
```bash
head -4 ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** Line 2 must be `name: spec-driven-ecology`. Line 3 must start with `description:`. Frontmatter must be valid YAML (starting and ending with `---`).

---

## SC-2: SKILL.md covers all 15 ecological phases adapted for Pi agent context

**Criterion:** SKILL.md covers all 15 ecological phases (Raw Prompt Capture through Final Intake Spec Synthesis), adapted for Pi agent context with appropriate tool references.

**Evidence:**
- 16 phase headers present (Phases 0-15): Session Start, Raw Prompt Capture, Intent Clarification, Purpose Clarification, Context Mapping, Epistemic Separation, Invariant Discovery, Constraint Mapping, Affordance Mapping, Attractor and Failure-Mode Analysis, Scope and Boundary Setting, Representative Environment Design, Perturbation Tests, Success Criteria and Falsifiers, Human Gate Before Planning, Final Intake Spec Synthesis
- Phase 4 (Context Mapping) includes Pi tool guidance: "Use `read` to inspect source-of-truth files. Use `bash` to list directory structures, check git history, or verify file existence. Use `ls`, `rg` (ripgrep), and `find` for context mapping. Do not write or edit files during intake."

**Verification commands:**
```bash
grep "^### Phase" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -c "Pi tool guidance" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** 16 phase headers (0-15). At least 1 Pi tool reference.

---

## SC-3: Conversation protocol, material question filter, and LLM first response template present

**Criterion:** SKILL.md includes the conversation protocol (Reflect → Separate → Ask Material Questions → Offer Provisional Structure → Let Human Correct → Synthesize), material question filter, and LLM first response template from the source methodology.

**Evidence:**
- "## Conversation Protocol" section with 6 numbered steps (Step 1: Reflect through Step 6: Synthesize)
- "## Material Question Filter" section with 10-item filter list
- "## LLM First Response Templates" section with Full Template and Short Template

**Verification commands:**
```bash
grep -c "Conversation Protocol" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -c "Material Question Filter" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -c "LLM First Response Templates" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -c "Step [1-6]:" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** 1 for each section header. 6 for step counts.

---

## SC-4: Depth selection guidance with clear triggers for Minimal, Standard, Deep

**Criterion:** SKILL.md includes depth selection guidance for Minimal, Standard, and Deep modes with clear trigger conditions for each.

**Evidence:**
- "## Operating Modes" section
- Minimal Mode: "small, reversible, and low risk"
- Standard Mode: "normal feature work, UI work, agent prompts, repo modifications, documentation systems, or workflow design"
- Deep Mode: "complex systems, multi-agent orchestration, architectural changes, data pipelines, business-critical workflows, security-sensitive work, or anything that may cause costly drift"
- Phase 0 includes depth selection guidance with trigger conditions

**Verification commands:**
```bash
grep -A1 "Minimal Mode" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -A1 "Standard Mode" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep -A1 "Deep Mode" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** Each mode has trigger condition text describing when to use it.

---

## SC-5: Standalone invocation instructions

**Criterion:** SKILL.md includes standalone invocation instructions so a user typing `/spec_driven_ecology` gets the ecological intake experience without NenFlow.

**Evidence:**
- "## Standalone Invocation" section with subsections: Triggering the Skill, Standalone Behavior (5 numbered steps), Standalone Output
- Trigger: "Invoke this skill standalone by typing `/spec_driven_ecology` or saying 'use ecological intake'"
- Instruction: "Begin Phase 0 immediately. Record the user's raw prompt verbatim. Identify the appropriate intake depth..."

**Verification command:**
```bash
grep -c "Standalone Invocation" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** 1.

---

## SC-6: References directory with all three handoff templates

**Criterion:** References directory exists at `~/.pi/agent/skills/spec-driven-ecology/references/` containing Planner handoff, Executor handoff, and Verifier handoff templates adapted from methodology Sections 11-13.

**Evidence:**
- Directory exists: `~/.pi/agent/skills/spec-driven-ecology/references/`
- `planner-handoff.md` (718 bytes): Source, Approved Intent/Purpose/Scope, Non-Negotiable Invariants, Constraints, Affordances to Preserve, Planner Instruction
- `executor-handoff.md` (695 bytes): Build Objective, Approved Tasks, Files Affected/Not to Touch, Invariants, Executor Instruction
- `verifier-handoff.md` (934 bytes): Verification Objective, Invariants to Test, Success Criteria, Falsifiers, Verification Report Format, drift-watching duties

**Verification commands:**
```bash
ls -la ~/.pi/agent/skills/spec-driven-ecology/references/
for f in planner-handoff.md executor-handoff.md verifier-handoff.md; do
  echo "=== $f ==="
  head -3 ~/.pi/agent/skills/spec-driven-ecology/references/$f
done
```

**Expected:** 3 files present with non-trivial content.

---

## SC-7: Agent definition at pev-intake-ecological.json following pev-planner.json schema

**Criterion:** Agent definition exists at `~/.pi/agent/agents/pev-intake-ecological.json` following the pev-planner.json schema with tools: read,bash,write and skills: [spec-driven-ecology].

**Evidence:**
- File path: `~/.pi/agent/agents/pev-intake-ecological.json` (1,272 bytes)
- JSON schema matches pev-planner.json: `name`, `description`, `systemPrompt`, `tools`, `skills` — all 5 fields present
- `tools: "read,bash,write"`
- `skills: ["spec-driven-ecology"]`
- Valid JSON (parseable)

**Verification commands:**
```bash
cat ~/.pi/agent/agents/pev-intake-ecological.json | python3 -c "import json,sys; d=json.load(sys.stdin); print('Fields:', list(d.keys())); print('Has spec-driven-ecology:', 'spec-driven-ecology' in d.get('skills',[]))"
```

**Expected:** 5 fields printed. "Has spec-driven-ecology: True".

---

## SC-8: nenflow-v3 SKILL.md additively modified with ecological intake mode

**Criterion:** nenflow-v3 SKILL.md is additively modified to include ecological intake as a mode option with pev-intake-ecological subagent spawning logic.

**Evidence:**
- "## Ecological Intake Mode (Alternative INTAKE)" section present with trigger detection, ecological mode behavior (4 steps), after-ecological-intake flow
- Subagent list now includes `- \`pev-intake-ecological\` (only for ecological intake mode)`
- "**Ecological INTAKE enrichment:**" paragraph added to INTAKE Format section
- 3 mentions of `pev-intake-ecological` in the file
- All original content intact (Route D, validator, context-policy, health file, all original subagents, "Do not call pev-intake")

**Verification commands:**
```bash
grep -c "Ecological Intake Mode" ~/.pi/agent/skills/nenflow-v3/SKILL.md
grep -c "pev-intake-ecological" ~/.pi/agent/skills/nenflow-v3/SKILL.md
grep -c "Ecological INTAKE enrichment" ~/.pi/agent/skills/nenflow-v3/SKILL.md
grep -c "Route D" ~/.pi/agent/skills/nenflow-v3/SKILL.md
```

**Expected:** 1, 3, 1, 5 respectively.

---

## SC-9: Ecological intake produces ATT_0_INTAKE.md in NenFlow-compatible format

**Criterion:** Ecological intake produces ATT_0_INTAKE.md in NenFlow-compatible format (same frontmatter schema) with ecological supplements the Planner/Executor/Verifier can consume without format changes.

**Evidence:**
- SKILL.md "## NenFlow v3 Integration Mode" section states: "The subagent produces ATT_0_INTAKE.md in NenFlow-compatible format with the standard frontmatter schema plus enriched ecological sections"
- Ecological supplements listed: Epistemic Map, Affordance Landscape, Attractors and Failure Modes, Perturbation Tests, Representative Environment, Falsifiers, Human Gates
- Stated: "These supplements are additive — the Planner, Executor, and Verifier consume the same format without changes"
- Same statement in nenflow-v3 SKILL.md INTAKE Format section

**Verification command:**
```bash
grep -A8 "Ecological INTAKE enrichment" ~/.pi/agent/skills/nenflow-v3/SKILL.md
```

**Expected:** 7 supplement sections listed. "additive" and "without breaking compatibility" language present.

---

## SC-10: Existing NenFlow routes not broken

**Criterion:** Existing NenFlow routes are not broken: a standard non-ecological /nenflow-v3 run still produces ATT_0_INTAKE.md via the Orchestrator, routes correctly, and all subagents remain unchanged.

**Evidence:**
- All original nenflow-v3 content preserved: Required Orchestration Shape (steps 1-6 intact), Run Setup, Artifact Rules, Validation, INTAKE Format (standard format intact), Subagent Invocation Pattern (all original subagents + pev-intake-ecological added), Route D (all 7 steps intact), User-Facing Behavior, Completion
- "ORCHESTRATOR INTAKE in current session" (step 1) still the default path
- "Do not call pev-intake" still present
- Existing agent JSONs (pev-planner, pev-executor, pev-verifier, pev-researcher) unchanged
- Existing PEV skill files (nenflow-pev-planner, nenflow-pev-executor, nenflow-pev-verifier, nenflow-pev-researcher) unchanged

**Verification commands:**
```bash
grep "analyse the raw task ecologically yourself" ~/.pi/agent/skills/nenflow-v3/SKILL.md
grep "Do not call \`pev-intake\`" ~/.pi/agent/skills/nenflow-v3/SKILL.md
ls ~/.pi/agent/agents/pev-planner.json ~/.pi/agent/agents/pev-executor.json ~/.pi/agent/agents/pev-verifier.json ~/.pi/agent/agents/pev-researcher.json
ls ~/.pi/agent/skills/nenflow-pev-planner/SKILL.md ~/.pi/agent/skills/nenflow-pev-executor/SKILL.md ~/.pi/agent/skills/nenflow-pev-verifier/SKILL.md ~/.pi/agent/skills/nenflow-pev-researcher/SKILL.md
```

**Expected:** All grep results return matches. All files exist.

---

## Additional Checks for Verifier

### Observer Folded into Verifier
```bash
grep "folded into the Verifier" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
grep "Observer Report" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** First returns 1 (Observer folded). Second returns 0 (no separate Observer Report Template).

### Spelling Consistency
```bash
grep -n "spec_ddriven" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md ~/.pi/agent/skills/nenflow-v3/SKILL.md ~/.pi/agent/agents/pev-intake-ecological.json 2>/dev/null
```

**Expected:** No matches (no double-c instances).

### No Existing Agent Files Modified
```bash
stat -c "%Y %n" ~/.pi/agent/agents/pev-planner.json ~/.pi/agent/agents/pev-executor.json ~/.pi/agent/agents/pev-verifier.json ~/.pi/agent/agents/pev-researcher.json
```

**Expected:** Modification timestamps should predate this run (2026-05-16 00:58 UTC+).

### Intake Readiness Checklist Completeness
```bash
grep -c "\- \[ \]" ~/.pi/agent/skills/spec-driven-ecology/SKILL.md
```

**Expected:** 16 unchecked checklist items.
