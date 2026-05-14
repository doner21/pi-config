const { runId, writeContinuation } = require('./helpers.js');

exports.tests = [
  {
    name: 'Route D simulation finds valid continuation when normal artifact is missing',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const id = runId('201');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      fs.mkdirSync(runDir, { recursive: true });
      const normalOutput = path.join(runDir, 'ATT_4_EXECUTION.md');
      assert.equal(fs.existsSync(normalOutput), false, 'normal artifact must be missing to trigger Route D');

      const attempt1 = policy.buildContinuationPath(runDir, 4, 'EXECUTOR', 1);
      const attempt2 = policy.buildContinuationPath(runDir, 4, 'EXECUTOR', 2);
      writeContinuation(fs, attempt1, { runId: id, threshold: 40, saturation: '~41%' });
      writeContinuation(fs, attempt2, { runId: id, threshold: 40, saturation: '~42%' });

      const found = policy.findContinuation(runDir, 4, 'EXECUTOR');
      assert.equal(found, attempt2, 'highest attempt suffix should be preferred');
      const validation = policy.validateContinuationContract(found, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(validation.ok, true, validation.errors.join('; '));
    },
  },
  {
    name: 'Route D builds same-role minimal continuation prompt with exact current and next paths',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const id = runId('202');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      fs.mkdirSync(runDir, { recursive: true });
      const runConfigPath = path.join(runDir, 'RUN_CONFIG.json');
      const intakePath = path.join(runDir, 'ATT_0_INTAKE.md');
      const planPath = path.join(runDir, 'ATT_2_PLAN.md');
      const contractPath = policy.buildContinuationPath(runDir, 4, 'EXECUTOR', 1);
      const normalOutputPath = path.join(runDir, 'ATT_4_EXECUTION.md');
      const nextContinuationPath = policy.buildContinuationPath(runDir, 4, 'EXECUTOR', 2);
      policy.writeRunConfig(runConfigPath, policy.buildRunConfig(id, policy.buildContextPolicy('context threshold 40%', '')));
      fs.writeFileSync(intakePath, 'synthetic intake for Route D prompt simulation\n', 'utf8');
      fs.writeFileSync(planPath, 'synthetic plan for Route D prompt simulation\n', 'utf8');
      writeContinuation(fs, contractPath, { runId: id, threshold: 40 });

      const prompt = policy.buildContinuationResumePrompt({
        role: 'executor',
        runId: id,
        contractPath,
        runConfigPath,
        intakePath,
        planPath,
        normalOutputPath,
        nextContinuationPath,
      });
      assert.match(prompt, /Route D continuation for EXECUTOR/);
      for (const expected of [id, contractPath, runConfigPath, intakePath, planPath, normalOutputPath, nextContinuationPath]) {
        assert.ok(prompt.includes(expected), `prompt missing exact path/value: ${expected}`);
      }
      assert.doesNotMatch(prompt, /verifierBriefPath/);
      assert.doesNotMatch(prompt, /researchPath/);
      assert.doesNotMatch(prompt, /ORCHESTRATOR/);
      assert.match(prompt, /Resume only the remaining work/);
    },
  },
];
