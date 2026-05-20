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
    name: 'explicit invalid, signed, negative, malformed, empty, and unrelated percentages reject/default safely',
    fn: ({ assert, policy }) => {
      const invalidCases = [
        ['context threshold -4%', '-4%'],
        ['context threshold - 4%', '- 4%'],
        ['context threshold -40%', '-40%'],
        ['context threshold +4%', '+4%'],
        ['context threshold + 40%', '+ 40%'],
        ['context threshold 0%', '0%'],
        ['context threshold 100%', '100%'],
        ['context threshold 101%', '101%'],
        ['context threshold 4%%', '4%%'],
        ['context threshold 4.5.6%', '4.5.6%'],
        ['context threshold %40', '%40'],
        ['context threshold abc4%', 'abc4%'],
        ['context threshold 4%abc', '4%abc'],
        ['context threshold --4%', '--4%'],
        ['context threshold ++4%', '++4%'],
        ['', 'empty text'],
        ['this text has no relevant threshold', 'unrelated empty-threshold text'],
        ['marketing conversion is 40% this week', 'unrelated 40%'],
      ];
      for (const [raw, label] of invalidCases) {
        assert.equal(policy.parseContextThreshold(raw), null, `parseContextThreshold should reject ${label}`);
        const got = policy.buildContextPolicy(raw, '');
        assert.equal(got.handoff_threshold_percent, 65, `handoff threshold ${label}`);
        assert.equal(got.threshold_source, 'default', `threshold source ${label}`);
      }
      const mixed = policy.buildContextPolicy('context threshold -4%; later use context handoff threshold 40%', '');
      assert.equal(mixed.handoff_threshold_percent, 40, 'separate valid threshold should still be accepted');
      assert.equal(mixed.threshold_source, 'user_prompt');
    },
  },
  {
    name: 'RUN_CONFIG read/write/default behavior, clean string values, and invalid config rejection',
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

      const stringCfg = {
        schema_version: 1,
        run_id: id,
        context_handoff: {
          handoff_threshold_percent: '40%',
          warning_threshold_percent: '35',
          hard_risk_threshold_percent: '~45%',
          threshold_source: 'user_prompt',
        },
      };
      assert.equal(policy.validateRunConfig(stringCfg, id).ok, true, 'clean whole-field string percent values should validate');
      const stringCfgPath = path.join(dir, 'STRING_RUN_CONFIG.json');
      policy.writeRunConfig(stringCfgPath, stringCfg);
      assert.deepEqual(policy.readRunConfig(stringCfgPath, id), stringCfg);

      const invalidPath = path.join(dir, 'INVALID_RUN_CONFIG.json');
      fs.writeFileSync(invalidPath, JSON.stringify({ schema_version: 1, run_id: id, context_handoff: { handoff_threshold_percent: 100, warning_threshold_percent: 0, hard_risk_threshold_percent: 105, threshold_source: 'bad' } }, null, 2), 'utf8');
      assert.throws(() => policy.readRunConfig(invalidPath, id), /Invalid RUN_CONFIG\.json/);
      assert.equal(policy.validateRunConfig({ schema_version: 1, run_id: 'OTHER', context_handoff: { handoff_threshold_percent: 40, warning_threshold_percent: 35, hard_risk_threshold_percent: 45, threshold_source: 'user_prompt' } }, id).ok, false);

      for (const bad of ['-4%', '- 4%', '+4%', '+ 40%', 'abc4%', '4%abc', '4%%', '0%', '100%']) {
        const badCfg = { ...stringCfg, context_handoff: { ...stringCfg.context_handoff, handoff_threshold_percent: bad } };
        assert.equal(policy.validateRunConfig(badCfg, id).ok, false, `bad RUN_CONFIG threshold ${bad}`);
      }
    },
  },
  {
    name: 'intake frontmatter threshold fields accept clean values and reject signed or malformed fields',
    fn: ({ assert, policy }) => {
      for (const [raw, expected] of [['40', 40], ['40%', 40], ['~41%', 41]]) {
        const intake = `---\ncontext_handoff_threshold_percent: ${raw}\n---\n\nBody without other thresholds.\n`;
        const got = policy.buildContextPolicy('', intake);
        assert.equal(got.handoff_threshold_percent, expected, raw);
        assert.equal(got.threshold_source, 'intake', raw);
      }
      for (const bad of ['-4%', '- 4%', '+4%', '+ 40%', 'abc4%', '4%abc', '4%%', '0%', '100%']) {
        const intake = `---\ncontext_handoff_threshold_percent: ${bad}\n---\n\nBody without other thresholds.\n`;
        const got = policy.buildContextPolicy('', intake);
        assert.equal(got.handoff_threshold_percent, 65, bad);
        assert.equal(got.threshold_source, 'default', bad);
      }
    },
  },
];
