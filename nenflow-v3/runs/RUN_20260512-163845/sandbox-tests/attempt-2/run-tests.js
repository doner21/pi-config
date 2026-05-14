#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const SANDBOX_ROOT = __dirname;
const TESTS_DIR = path.join(SANDBOX_ROOT, 'tests');
const FIXTURES_DIR = path.join(SANDBOX_ROOT, 'fixtures');
const RESULTS_DIR = path.join(SANDBOX_ROOT, 'results');
const PRODUCT_ROOT = 'C:/Users/doner/.pi/agent';
const RUNTIME_ROOT = path.join(PRODUCT_ROOT, 'nenflow-v3');
const RUN_ID = 'RUN_20260512-163845';

function ensureCleanGeneratedFixtures() {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  for (const rel of [
    'continuations/generated',
    'run-configs/generated',
    'simulated-runs/generated',
  ]) {
    const target = path.join(FIXTURES_DIR, rel);
    fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
  }
}

function discoverTestModules() {
  return fs.readdirSync(TESTS_DIR)
    .filter((name) => name.endsWith('.test.js'))
    .sort()
    .map((name) => path.join(TESTS_DIR, name));
}

async function main() {
  ensureCleanGeneratedFixtures();
  const policy = require(path.join(RUNTIME_ROOT, 'context-policy.js'));
  const ctx = {
    assert,
    fs,
    path,
    SANDBOX_ROOT,
    TESTS_DIR,
    FIXTURES_DIR,
    RESULTS_DIR,
    PRODUCT_ROOT,
    RUNTIME_ROOT,
    RUN_ID,
    policy,
  };

  const testFiles = discoverTestModules();
  const results = [];
  console.log(`[sandbox-test-builder] root=${SANDBOX_ROOT}`);
  console.log(`[sandbox-test-builder] files=${testFiles.map((f) => path.basename(f)).join(', ')}`);

  for (const file of testFiles) {
    const mod = require(file);
    const tests = mod.tests || [];
    if (!Array.isArray(tests) || tests.length === 0) {
      throw new Error(`No tests exported by ${file}`);
    }
    for (const t of tests) {
      const started = Date.now();
      try {
        await t.fn(ctx);
        const duration_ms = Date.now() - started;
        results.push({ name: t.name, file: path.basename(file), status: 'PASS', duration_ms });
        console.log(`PASS ${path.basename(file)} :: ${t.name} (${duration_ms}ms)`);
      } catch (err) {
        const duration_ms = Date.now() - started;
        results.push({ name: t.name, file: path.basename(file), status: 'FAIL', duration_ms, error: err && (err.stack || err.message || String(err)) });
        console.error(`FAIL ${path.basename(file)} :: ${t.name} (${duration_ms}ms)`);
        console.error(err && (err.stack || err.message || String(err)));
      }
    }
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const summary = {
    run_id: RUN_ID,
    sandbox_root: SANDBOX_ROOT,
    product_root: PRODUCT_ROOT,
    total: results.length,
    passed,
    failed,
    results,
    completed_at: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  console.log(`[sandbox-test-builder] summary total=${results.length} passed=${passed} failed=${failed}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(RESULTS_DIR, 'summary.json'), JSON.stringify({ fatal: true, error: err && (err.stack || err.message || String(err)) }, null, 2) + '\n', 'utf8');
  console.error(err && (err.stack || err.message || String(err)));
  process.exitCode = 1;
});
