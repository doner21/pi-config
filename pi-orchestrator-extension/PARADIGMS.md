# Orchestration Paradigms (Shapes)

This document describes the orchestration paradigms (shapes) available in the Pi orchestrate extension and how to add new ones.

## Available Paradigms

| Name | Description |
|------|-------------|
| `plan-execute-verify` | Classic planner → executor waves → verifier flow. Default paradigm. Supports retries with failure feedback and deterministic model routing checks. |
| `multi-verify-vote` | Planner → executor waves → multiple verifiers (odd count) → majority vote. Each verifier independently judges pass/fail; outcome is decided by majority. |

## Selecting a Paradigm

Via the tool parameter:

```json
{
  "task": "Your task description",
  "paradigm": "multi-verify-vote"
}
```

Via the slash command (see `/orchestrate` for all flags):

```
/orchestrate --paradigm multi-verify-vote "Your task description"
```

If no paradigm is specified, `plan-execute-verify` is used by default.

To list all available paradigms at runtime, use an unknown paradigm name:

```
/orchestrate --paradigm unknown-name "task"
```

This will fail with a message listing all registered paradigms.

## Architecture: Substrate and Shapes

The orchestrate extension uses a **two-layer architecture**:

### Layer A — Substrate (`substrate.ts`)

Role-agnostic safety and plumbing. The substrate **never** mentions planner, executor, verifier, verdict, or retry. It provides:

| Function/Class | Purpose |
|---|---|
| `spawnSubagent()` | Spawn a single isolated Pi subagent process |
| `runBoundedPool()` | Run a bounded pool of concurrent workers |
| `buildExecutionWaves()` | Build a topological wave schedule from items with `id`/`dependsOn` |
| `runWorkGraph()` | Run a work graph (array of waves) through a bounded pool |
| `SpawnGuard` | Monotonic spawn-ceiling guard |
| `SUBSTRATE_CAPS` | Hard non-negotiable caps (`MAX_TOTAL_SPAWNS`, `ABSOLUTE_MAX_ITERATIONS`) |
| `clampSpawnCeiling()` | Clamp shape-requested spawn ceiling through substrate hard cap |
| `clampIterations()` | Clamp shape-requested iteration count through substrate hard cap |

**Substrate guarantee:** Bounded/cannot-run-forever is a substrate-level guarantee. No shape, no matter what it requests, can run forever or spawn unbounded subagents. The substrate clamps every value.

### Layer B — Shapes (`shapes/` directory)

Each shape implements the `OrchestrationShape` interface defined in `types.ts`:

```typescript
interface OrchestrationShape {
  name: string;           // Unique identifier (used with --paradigm)
  description: string;    // Human-readable description
  run(context: OrchestrationShapeContext): Promise<OrchestrationShapeResult>;
}
```

**ONE-LINE RULE: Shapes are siblings, they stand on the substrate, they never build on each other.**

Every shape:
- Receives normalized parameters via `OrchestrationShapeContext`
- Uses only substrate primitives (`spawnSubagent`, `runBoundedPool`, etc.)
- Never imports, extends, or calls another shape
- Never assumes or depends on another shape's internal behavior

## How to Add a New Shape

1. Create a new file in `src/shapes/` (e.g., `my-custom-shape.ts`).

2. Implement `OrchestrationShape` using **only** substrate primitives:

```typescript
// my-custom-shape.ts
import { spawnSubagent, runBoundedPool, SpawnGuard, SUBSTRATE_CAPS, /* ... */ } from "../substrate";
import type { OrchestrationShape, OrchestrationShapeContext, OrchestrationShapeResult } from "../types";

export const myCustomShape: OrchestrationShape = {
  name: "my-custom-shape",
  description: "Brief description of what this shape does.",
  run: async (context: OrchestrationShapeContext): Promise<OrchestrationShapeResult> => {
    const { params, signal, onUpdate, inheritedModel, agents } = context;

    // Use spawnGuard to bound all subagent spawns
    const spawnGuard = new SpawnGuard(params.maxSubagents);

    // Phase 1: Plan
    const planResult = await spawnSubagent(params.plannerAgent, buildPrompt(params.task), { /* ... */ });

    // Phase 2: Execute using runWorkGraph / runBoundedPool
    // Phase 3: Verify / vote / etc.

    return { markdown: "...", details: { /* ... */ } };
  },
};
```

3. Register the shape in `src/index.ts`:

```typescript
import { myCustomShape } from "./shapes/my-custom-shape";
// ...
shapeRegistry.set(myCustomShape.name, myCustomShape);
```

4. That's it. The shape is now available via `--paradigm my-custom-shape`.

## Design Rules

1. **Shapes are siblings.** They stand on the substrate and never import, extend, or call each other.
2. **The substrate enforces bounds.** Always use `SpawnGuard` and clamp values through `SUBSTRATE_CAPS` helpers.
3. **Default is `plan-execute-verify`.** Unknown paradigm names list available shapes and stop with an error.
4. **Each shape owns its meaning of termination.** The substrate only enforces that iterations/spawns are finite. What "retry," "vote," or "attempt" means is entirely shape-owned.
5. **No cross-shape code reuse.** If functionality is needed by multiple shapes, it belongs in the substrate.
