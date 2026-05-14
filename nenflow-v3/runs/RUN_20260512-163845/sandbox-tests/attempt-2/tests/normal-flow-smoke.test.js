const { runId, spawnNode } = require('./helpers.js');

exports.tests = [
  {
    name: 'existing validator smoke passes representative PLAN artifact',
    fn: ({ assert, path, RUNTIME_ROOT, RUN_ID }) => {
      const planPath = path.join(RUNTIME_ROOT, 'runs', RUN_ID, 'ATT_2_PLAN.md');
      const result = spawnNode([path.join(RUNTIME_ROOT, 'validator.js'), planPath, 'PLANNER', 'PLAN']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /PASS: ATT_2_PLAN\.md validated as role=PLANNER artifact_type=PLAN/);
    },
  },
  {
    name: 'existing validator smoke passes representative EXECUTION_REPORT artifact',
    fn: ({ assert, fs, path, FIXTURES_DIR, RUNTIME_ROOT }) => {
      const id = runId('301');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      fs.mkdirSync(runDir, { recursive: true });
      const execPath = path.join(runDir, 'ATT_4_EXECUTION.md');
      fs.writeFileSync(execPath, `---\nartifact_type: EXECUTION_REPORT\nrole: EXECUTOR\nrun_id: ${id}\ncontext_saturation_estimate: "~10%"\n---\n\n# Representative Execution Report\n\nSandbox smoke artifact.\n`, 'utf8');
      const result = spawnNode([path.join(RUNTIME_ROOT, 'validator.js'), execPath, 'EXECUTOR', 'EXECUTION_REPORT']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /validated as role=EXECUTOR artifact_type=EXECUTION_REPORT/);
    },
  },
  {
    name: 'existing validator smoke passes representative VERIFICATION_REPORT artifact',
    fn: ({ assert, fs, path, FIXTURES_DIR, RUNTIME_ROOT }) => {
      const id = runId('302');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      fs.mkdirSync(runDir, { recursive: true });
      const verificationPath = path.join(runDir, 'ATT_5_VERIFICATION.md');
      fs.writeFileSync(verificationPath, `---\nartifact_type: VERIFICATION_REPORT\nrole: VERIFIER\nrun_id: ${id}\nverdict: PASS\ncontext_saturation_estimate: "~10%"\n---\n\n# Representative Verification Report\n\nSandbox smoke artifact.\n\nVERDICT: PASS\n`, 'utf8');
      const result = spawnNode([path.join(RUNTIME_ROOT, 'validator.js'), verificationPath, 'VERIFIER', 'VERIFICATION_REPORT']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      assert.match(result.stdout, /validated as role=VERIFIER artifact_type=VERIFICATION_REPORT/);
    },
  },
];
