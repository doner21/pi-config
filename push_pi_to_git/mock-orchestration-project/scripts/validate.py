"""Stdlib validation script for the mock orchestration project.

This script is intentionally dependency-free so verifiers can run it even when
pytest or packaging tools are unavailable.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))

from orchestration_mock.ledger import TASKS, summarize_run, validate_contract  # noqa: E402


EXPECTED_ROLES = {"planning": 2, "execution": 2, "verifier": 2}
EXPECTED_TASK_IDS = [f"task-{index}" for index in range(1, 7)]


def main() -> int:
    """Run deterministic validation checks and print a JSON result."""

    summary = summarize_run(TASKS)
    errors = validate_contract(TASKS)

    if summary["task_count"] != 6:
        errors.append(f"expected 6 tasks, found {summary['task_count']}")
    if not summary["within_limit"]:
        errors.append("task count exceeds max subagent limit")
    if summary["role_counts"] != EXPECTED_ROLES:
        errors.append(f"role counts mismatch: {summary['role_counts']}")
    if summary["task_ids"] != EXPECTED_TASK_IDS:
        errors.append(f"task IDs mismatch: {summary['task_ids']}")

    payload = {"status": "pass" if not errors else "fail", "summary": summary, "errors": errors}
    print(json.dumps(payload, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
