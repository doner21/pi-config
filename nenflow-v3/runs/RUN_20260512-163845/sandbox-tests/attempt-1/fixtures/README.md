# Fixtures

The test entrypoint creates deterministic fixtures here on each run:

- `continuations/` — valid and invalid continuation contracts
- `run-configs/` — `RUN_CONFIG.json` roundtrip fixtures
- `simulated-runs/` — synthetic NenFlow run directories used for Route D and validator smoke tests

These fixtures are sandbox-only and do not modify product/runtime files.
