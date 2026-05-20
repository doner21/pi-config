const { runId, writeContinuation, spawnNode } = require('./helpers.js');

exports.tests = [
  {
    name: 'continuation validator accepts complete valid contract through policy and CLI',
    fn: ({ assert, fs, path, FIXTURES_DIR, RUNTIME_ROOT, policy }) => {
      const id = runId('101');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      const valid = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_1.md');
      writeContinuation(fs, valid, { runId: id, threshold: 40, saturation: '~41%' });
      const result = policy.validateContinuationContract(valid, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.deepEqual(result.errors, []);
      assert.equal(result.ok, true);
      const cli = spawnNode([path.join(RUNTIME_ROOT, 'validator.js'), valid, 'EXECUTOR', 'CONTINUATION_CONTRACT']);
      assert.equal(cli.status, 0, cli.stderr || cli.stdout);
      assert.match(cli.stdout, /PASS:/);
    },
  },
  {
    name: 'continuation validator rejects missing sections and placeholders',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const id = runId('102');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      const missing = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_1.md');
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(missing, `---\nartifact_type: CONTINUATION_CONTRACT\nrole: EXECUTOR\nrun_id: ${id}\ncontinuation_from: EXECUTOR\ncontext_saturation_estimate: "~41%"\ncontext_handoff_threshold_percent: 40\nthreshold_source: user_prompt\nmeasured_at: ${new Date().toISOString()}\n---\n\n# Missing body sections\n`, 'utf8');
      const missingResult = policy.validateContinuationContract(missing, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(missingResult.ok, false);
      assert.match(missingResult.errors.join('\n'), /Work Completed/);
      assert.match(missingResult.errors.join('\n'), /Work Remaining/);

      const placeholder = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_2.md');
      writeContinuation(fs, placeholder, {
        runId: id,
        workCompleted: '- Replace this with concrete completed work and evidence.',
        workRemaining: '- TODO',
        criticalContext: '- [key constraints]',
        resumeInstruction: `Fresh EXECUTOR continuation for run ${id}: read this continuation contract and complete remaining work.`,
      });
      const placeholderResult = policy.validateContinuationContract(placeholder, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(placeholderResult.ok, false);
      assert.match(placeholderResult.errors.join('\n'), /non-empty and non-placeholder/);
    },
  },
  {
    name: 'continuation validator rejects role/run mismatch, bad name/path, invalid percentages, and stale/future cases',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const id = runId('103');
      const runDir = path.join(FIXTURES_DIR, 'simulated-runs/generated/runs', id);
      fs.mkdirSync(runDir, { recursive: true });

      const roleMismatch = path.join(runDir, 'ATT_4_CONTINUATION_PLANNER_1.md');
      writeContinuation(fs, roleMismatch, { runId: id, role: 'PLANNER' });
      assert.equal(policy.validateContinuationContract(roleMismatch, { expectedRole: 'EXECUTOR', expectedRunId: id }).ok, false);

      const runMismatch = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_1.md');
      writeContinuation(fs, runMismatch, { runId: id });
      assert.equal(policy.validateContinuationContract(runMismatch, { expectedRole: 'EXECUTOR', expectedRunId: 'RUN_20990101-999999' }).ok, false);

      const badName = path.join(runDir, 'ATT_4_HANDOFF_EXECUTOR_1.md');
      writeContinuation(fs, badName, { runId: id });
      const badNameResult = policy.validateContinuationContract(badName, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(badNameResult.ok, false);
      assert.match(badNameResult.errors.join('\n'), /filename must match/);

      const badPath = path.join(FIXTURES_DIR, 'continuations/generated/ATT_4_CONTINUATION_EXECUTOR_1.md');
      writeContinuation(fs, badPath, { runId: id });
      const badPathResult = policy.validateContinuationContract(badPath, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(badPathResult.ok, false);
      assert.match(badPathResult.errors.join('\n'), /runs\/{run_id}|run directory/);

      const badSaturation = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_2.md');
      writeContinuation(fs, badSaturation, { runId: id, saturation: '~0%' });
      assert.equal(policy.validateContinuationContract(badSaturation, { expectedRole: 'EXECUTOR', expectedRunId: id }).ok, false);

      const badThreshold = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_3.md');
      writeContinuation(fs, badThreshold, { runId: id, threshold: 100 });
      assert.equal(policy.validateContinuationContract(badThreshold, { expectedRole: 'EXECUTOR', expectedRunId: id }).ok, false);

      const stale = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_4.md');
      writeContinuation(fs, stale, { runId: id, measuredAt: '2000-01-01T00:00:00.000Z' });
      const staleResult = policy.validateContinuationContract(stale, { expectedRole: 'EXECUTOR', expectedRunId: id });
      assert.equal(staleResult.ok, false);
      assert.match(staleResult.errors.join('\n'), /stale/);

      const future = path.join(runDir, 'ATT_4_CONTINUATION_EXECUTOR_5.md');
      writeContinuation(fs, future, { runId: id, measuredAt: '2999-01-01T00:00:00.000Z' });
      assert.equal(policy.validateContinuationContract(future, { expectedRole: 'EXECUTOR', expectedRunId: id }).ok, false);
    },
  },
];
