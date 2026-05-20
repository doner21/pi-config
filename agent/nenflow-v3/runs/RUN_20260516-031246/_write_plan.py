
# Write the ATT_1_PLAN.md artifact
plan_path = r"C:\Users\doner\.pi\agent\nenflow-v3\runs\RUN_20260516-031246\ATT_1_PLAN.md"
os.makedirs(os.path.dirname(plan_path), exist_ok=True)

plan = """---
artifact_type: PLAN
role: PLANNER
run_id: RUN_20260516-031246
context_saturation_estimate: "~35%"
---

# ATT_1_PLAN \u2014 Fractal Memory System (Phases 4+5)

## Task Statement

Extend  (1781 lines) with five new  commands \u2014 , , , ,  \u2014 implementing fractal compression (community detection, supernode collapse, LLM-generated summaries,  state machine) and cross-project archetype detection (MinHash/LSH, \u22653 re-emergence threshold). All existing commands and invariants must be preserved. Compression must produce measurable savings with zero knowledge loss on the live graphify-brain at .
"""

with open(plan_path, 'w', encoding='utf-8') as f:
    f.write(plan)
print('Script prepared, length:', len(plan))
