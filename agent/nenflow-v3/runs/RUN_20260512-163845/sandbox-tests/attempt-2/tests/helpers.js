const childProcess = require('node:child_process');

function runId(suffix = '001') {
  return `RUN_20990101-0000${suffix}`;
}

function writeContinuation(fs, filePath, {
  runId,
  role = 'EXECUTOR',
  measuredAt = new Date().toISOString(),
  saturation = '~41%',
  threshold = 40,
  thresholdSource = 'user_prompt',
  workCompleted = '- Completed concrete file inspection and wrote durable evidence.',
  workRemaining = '- Finish the remaining implementation work and write the normal role artifact.',
  criticalContext = '- Key constraint: all generated artifacts stay under the sandbox run directory.',
  resumeInstruction,
} = {}) {
  const instruction = resumeInstruction || `Fresh ${role} continuation for run ${runId}: read this continuation contract, then complete the remaining work and write the normal role output.`;
  const body = `---\nartifact_type: CONTINUATION_CONTRACT\nrole: ${role}\nrun_id: ${runId}\ncontinuation_from: ${role}\ncontext_saturation_estimate: "${saturation}"\ncontext_handoff_threshold_percent: ${threshold}\nthreshold_source: ${thresholdSource}\nmeasured_at: ${measuredAt}\n---\n\n# ATT_4 — CONTINUATION CONTRACT\n\n## Work Completed\n${workCompleted}\n\n## Work Remaining\n${workRemaining}\n\n## Critical Context\n${criticalContext}\n\n## Resume Instruction\n${instruction}\n`;
  fs.mkdirSync(require('node:path').dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, body, 'utf8');
  return body;
}

function spawnNode(args, options = {}) {
  return childProcess.spawnSync(process.execPath, args, { encoding: 'utf8', ...options });
}

module.exports = { runId, writeContinuation, spawnNode };
