# Mock Dashboard Test Project

A small deterministic Python project (stdlib-only, Python >= 3.10) that
models a dashboard widget lifecycle with strict invariant enforcement.

## Purpose

Validates that orchestration agents can create, test, and verify a real
runnable project that exercises dashboard widget lifecycle invariants:

1. **setWidget never uses overlay** — any `overlay=True` is rejected.
2. **Every show is paired with guaranteed cleanup** — leaving SHOWING
   always runs cleanup via a finally-equivalent context manager.
3. **Auto-show is never triggered** — `session_start` does NOT
   implicitly call `show`.

## Structure

- `src/dashboard_mock/widget_lifecycle.py` — deterministic state machine
  with show/update/clear/error/abort transitions and invariant enforcement.
- `tests/test_widget_lifecycle.py` — stdlib `unittest` covering normal
  lifecycle, error-path cleanup, abort-path cleanup, overlay detection,
  and no-auto-show guard.
- `scripts/validate.py` — dependency-free JSON-output validator.
- `pyproject.toml` — minimal project metadata.

## Validation

From this directory, run the dependency-free validator:

```bash
python scripts/validate.py
```

Expected result: a JSON payload with `"status": "pass"` and an empty
`failures` list.

To run the automated test suite with no third-party dependencies:

```bash
python -m unittest discover -s tests
```

The tests assert that the mock dashboard enforces all three invariants,
rejects overlay mode, guarantees cleanup on all exit paths, and never
auto-shows widgets without explicit command.
