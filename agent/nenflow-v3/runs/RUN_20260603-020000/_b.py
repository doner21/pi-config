import sys
OUT = r"C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260603-020000/HYPOTHESIS_ANALYSIS.md"
lines = []
def L(s): lines.append(str(s))
def B(): lines.append("")

# Title and codebase context
L("# Multi-Hypothesis Analysis: Orchestrator Resilience Improvements")
B()
L("## Codebase Under Analysis")
L("- **Entry point**: C:/Users/doner/pi-orchestrator-extension/src/index.ts (2187 lines)")
L("- **Shape**: C:/Users/doner/pi-orchestrator-extension/src/shapes/plan-execute-verify.ts (1828 lines)")
L("- **Substrate**: C:/Users/doner/pi-orchestrator-extension/src/substrate.ts (~717 lines)")
L("- **Types**: C:/Users/doner/pi-orchestrator-extension/src/types.ts")
B()
L("**Note on code duplication**: Shape is canonical. All insertion points reference the shape.")
B()
