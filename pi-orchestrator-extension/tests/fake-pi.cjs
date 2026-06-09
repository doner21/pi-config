#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");

const args = process.argv.slice(2);
let stdin = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  stdin += chunk;
});
process.stdin.on("end", main);

function argValue(flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function agentNameFromSystemPrompt() {
  const systemPromptPath = argValue("--append-system-prompt") || "unknown-system-prompt.txt";
  return path.basename(systemPromptPath).replace(/-system-prompt\.txt$/, "") || "unknown";
}

function promptText() {
  if (stdin.trim()) return stdin;
  const last = args[args.length - 1];
  return last && !last.startsWith("--") ? last : "";
}

function extractIntake(prompt) {
  const marker = "INTAKE CONTRACT:\n";
  const start = prompt.indexOf(marker);
  if (start < 0) return null;
  const bodyStart = start + marker.length;
  const terminators = ["\n\nRules:", "\n\nFull plan:", "\n\nPlan:"];
  const bodyEnd = terminators
    .map((terminator) => prompt.indexOf(terminator, bodyStart))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0] ?? prompt.length;
  try {
    return JSON.parse(prompt.slice(bodyStart, bodyEnd).trim());
  } catch {
    return null;
  }
}

function assistantTextFor(prompt) {
  if (prompt.includes("Plan the following task")) {
    const intake = extractIntake(prompt);
    const researcherCount = intake?.orchestration_controls?.researcherCount || 0;
    if (researcherCount) {
      return JSON.stringify({
        tasks: [
          {
            id: "task-1",
            description: "Research perspective A: inspect routing/intake normalization and explain why model routing can default incorrectly.",
            dependsOn: [],
            agent: "researcher",
            role: "routing-intake-researcher"
          },
          {
            id: "task-2",
            description: "Research perspective B: inspect orchestration language controls and map natural-language knobs to structured fields.",
            dependsOn: [],
            agent: "researcher",
            role: "orchestration-language-researcher"
          }
        ].slice(0, researcherCount),
        notes: `Created ${researcherCount} researcher task(s) because the intake contract requested researcher coverage.`
      });
    }
    const defaultTask = {
      id: "task-1",
      description: "Execute the requested work while preserving the intake constraints and routing contract.",
      dependsOn: [],
      agent: "coder",
      role: "implementation"
    };
    if (process.env.FAKE_PI_CONFLICT_EXECUTOR_ROUTE === "1") {
      defaultTask.provider = "deepseek";
      defaultTask.model = "deepseek-v4-flash";
    }
    return JSON.stringify({
      tasks: [defaultTask],
      notes: "Created one default coder executor task."
    });
  }
  if (prompt.includes("Verify the orchestration result")) {
    const status = process.env.FAKE_PI_VERIFIER_STATUS === "fail" ? "fail" : "pass";
    return JSON.stringify({
      status,
      reasons: [
        status === "pass"
          ? "deterministic fake verifier accepted outputs and routing evidence"
          : "deterministic fake verifier forced failure"
      ]
    });
  }
  return "research complete";
}

function main() {
  const prompt = promptText();
  const intake = extractIntake(prompt);
  const record = {
    agentName: agentNameFromSystemPrompt(),
    provider: argValue("--provider") || null,
    model: argValue("--model") || null,
    promptHasIntake: Boolean(intake),
    orchestrationControls: intake && intake.orchestration_controls ? intake.orchestration_controls : null,
    routingRequirements: intake && intake.routing_requirements ? intake.routing_requirements : null,
    intakeSnapshot: intake ? {
      constraints: intake.constraints || [],
      invariants: intake.invariants || [],
      successCriteria: intake.success_criteria || [],
      failureCriteria: intake.failure_criteria || [],
      executorOutputContract: intake.executor_output_contract || null,
      originalTask: intake.original_task || null
    } : null,
    promptIncludesExecutorOutputContract: prompt.includes("Executor output contract (highest priority):"),
    promptIncludesNoGenericReportRule: prompt.includes("Do not add generic report sections."),
    promptSnippet: prompt.slice(0, 240)
  };
  if (process.env.FAKE_PI_LOG) {
    fs.appendFileSync(process.env.FAKE_PI_LOG, `${JSON.stringify(record)}\n`, "utf8");
  }

  const text = assistantTextFor(prompt);
  console.log(JSON.stringify({ type: "message_start" }));
  console.log(JSON.stringify({
    type: "message_end",
    message: { role: "assistant", content: [{ type: "text", text }] }
  }));
  console.log(JSON.stringify({ type: "agent_end" }));
}
