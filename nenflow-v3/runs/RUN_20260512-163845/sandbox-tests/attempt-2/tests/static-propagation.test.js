exports.tests = [
  {
    name: 'active Pi orchestrator skill includes Route D, RUN_CONFIG, threshold propagation, and resume helper',
    fn: ({ assert, fs, path, PRODUCT_ROOT }) => {
      const orchPath = path.join(PRODUCT_ROOT, 'skills/nenflow-v3/SKILL.md');
      const orch = fs.readFileSync(orchPath, 'utf8');
      assert.match(orch, /## Route D — Context Handoff Continuation/);
      assert.match(orch, /RUN_CONFIG\.json/);
      assert.match(orch, /context_handoff_threshold_percent/);
      assert.match(orch, /buildContinuationResumePrompt\(\)/);
      assert.match(orch, /After every `pev-researcher`, `pev-planner`, `pev-executor`, or `pev-verifier` subagent returns/);
      assert.match(orch, /exact continuation path/);
      assert.match(orch, /five continuation attempts/);
    },
  },
  {
    name: 'role skills use configured threshold and exact continuation path instead of hard-coded At ~65% language',
    fn: ({ assert, fs, path, PRODUCT_ROOT }) => {
      const roleSkills = [
        ['RESEARCHER', 'nenflow-pev-researcher'],
        ['PLANNER', 'nenflow-pev-planner'],
        ['EXECUTOR', 'nenflow-pev-executor'],
        ['VERIFIER', 'nenflow-pev-verifier'],
      ];
      for (const [role, dir] of roleSkills) {
        const file = path.join(PRODUCT_ROOT, `skills/${dir}/SKILL.md`);
        const txt = fs.readFileSync(file, 'utf8');
        assert.equal(txt.includes('At ~65% self-estimated saturation'), false, `${role} still has old hard-coded phrase`);
        assert.equal(/Protocol when you reach 65%/.test(txt), false, `${role} still has hard-coded protocol heading`);
        assert.match(txt, /RUN_CONFIG\.json/, `${role} missing RUN_CONFIG instruction`);
        assert.match(txt, /context_handoff_threshold_percent/, `${role} missing configured threshold token`);
        assert.match(txt, /threshold_source/, `${role} missing threshold_source propagation`);
        assert.match(txt, /exact continuation path/, `${role} missing exact continuation path instruction`);
        assert.match(txt, /The threshold is configurable per run; do not hard-code any single percentage/, `${role} missing non-hard-code instruction`);
      }
    },
  },
];
