const { runId } = require('./helpers.js');

exports.tests = [
  {
    name: 'thresholds 65,45,35,20,40 parse and propagate into RUN_CONFIG shape',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const cfgDir = path.join(FIXTURES_DIR, 'run-configs/generated/accepted-thresholds');
      fs.mkdirSync(cfgDir, { recursive: true });
      for (const n of [65, 45, 35, 20, 40]) {
        const parsed = policy.parseContextThreshold(`If execution context goes past ${n}% of the window, create a handoff.`);
        assert.equal(parsed.percent, n);
        const built = policy.buildContextPolicy(`context handoff threshold ${n}%`, '');
        assert.equal(built.handoff_threshold_percent, n);
        assert.equal(built.threshold_source, 'user_prompt');
        assert.equal(built.warning_threshold_percent, Math.max(1, n - 5));
        assert.equal(built.hard_risk_threshold_percent, Math.min(99, n + 5));
        const id = runId(String(n).padStart(3, '0'));
        const cfg = policy.buildRunConfig(id, built);
        assert.equal(cfg.context_handoff.handoff_threshold_percent, n);
        assert.equal(policy.validateRunConfig(cfg, id).ok, true);
        const cfgPath = path.join(cfgDir, `${id}-RUN_CONFIG.json`);
        policy.writeRunConfig(cfgPath, cfg);
        assert.deepEqual(policy.readRunConfig(cfgPath, id), cfg);
      }
    },
  },
  {
    name: 'invalid and unrelated percentages reject or default safely',
    fn: ({ assert, policy }) => {
      for (const raw of ['handoff threshold 0%', 'context above 100%', 'context threshold -4%', 'context threshold 101%']) {
        assert.equal(policy.buildContextPolicy(raw, '').handoff_threshold_percent, 65, raw);
        assert.equal(policy.buildContextPolicy(raw, '').threshold_source, 'default', raw);
      }
      assert.equal(policy.parseContextThreshold('marketing conversion is 40% this week'), null);
      assert.equal(policy.buildContextPolicy('marketing conversion is 40% this week', '').handoff_threshold_percent, 65);
      assert.equal(policy.buildContextPolicy('', '').handoff_threshold_percent, 65);
    },
  },
  {
    name: 'RUN_CONFIG read/write/default behavior and invalid config rejection',
    fn: ({ assert, fs, path, FIXTURES_DIR, policy }) => {
      const id = runId('777');
      const dir = path.join(FIXTURES_DIR, 'run-configs/generated/default-and-invalid', id);
      fs.mkdirSync(dir, { recursive: true });
      const missing = policy.readRunConfig(path.join(dir, 'MISSING_RUN_CONFIG.json'), id);
      assert.equal(missing.run_id, id);
      assert.equal(missing.context_handoff.handoff_threshold_percent, 65);
      assert.equal(missing.context_handoff.threshold_source, 'default');

      const cfg = policy.buildRunConfig(id, policy.buildContextPolicy('handoff threshold 35%', ''));
      const cfgPath = path.join(dir, 'RUN_CONFIG.json');
      policy.writeRunConfig(cfgPath, cfg);
      assert.deepEqual(policy.readRunConfig(cfgPath, id), cfg);

      const invalidPath = path.join(dir, 'INVALID_RUN_CONFIG.json');
      fs.writeFileSync(invalidPath, JSON.stringify({ schema_version: 1, run_id: id, context_handoff: { handoff_threshold_percent: 100, warning_threshold_percent: 0, hard_risk_threshold_percent: 105, threshold_source: 'bad' } }, null, 2), 'utf8');
      assert.throws(() => policy.readRunConfig(invalidPath, id), /Invalid RUN_CONFIG\.json/);
      assert.equal(policy.validateRunConfig({ schema_version: 1, run_id: 'OTHER', context_handoff: { handoff_threshold_percent: 40, warning_threshold_percent: 35, hard_risk_threshold_percent: 45, threshold_source: 'user_prompt' } }, id).ok, false);
    },
  },
];
