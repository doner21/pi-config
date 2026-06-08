# Mock Orchestration Project

A tiny deterministic Python project created to exercise the orchestration workflow.

## Purpose

The project records a six-step orchestration contract and exposes helpers that summarize the run and validate the core constraints:

- exactly six planned subagents
- no more than eight subagents
- planning tasks use `GPT 5.5 codecs`
- execution and verification tasks use `deep-seek V4 flash`
- dependency edges refer only to known task IDs

## Structure

- `src/orchestration_mock/ledger.py` - deterministic orchestration contract and validation helpers
- `src/orchestration_mock/__main__.py` - CLI entry point that prints the contract summary as JSON
- `tests/test_ledger.py` - stdlib `unittest` coverage for the ledger, dependency chain, role/model routing, and CLI JSON output
- `scripts/validate.py` - dependency-free validation script for verifiers
- `pyproject.toml` - minimal project metadata

## Validation

From this directory, run the dependency-free validator:

```bash
python scripts/validate.py
```

Expected result: a JSON payload with `"status": "pass"` and an empty `errors` list.

To run the automated test suite without third-party dependencies:

```bash
python -m unittest discover -s tests
```

The tests assert that the mock orchestration uses six subagents, stays below the maximum of eight, routes planning tasks to `GPT 5.5 codecs`, routes execution/verifier tasks to `deep-seek V4 flash`, and exposes deterministic CLI output.
