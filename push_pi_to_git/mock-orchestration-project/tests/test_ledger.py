"""Automated tests for the deterministic orchestration mock project."""

from __future__ import annotations

import json
import os
import subprocess
import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))

from orchestration_mock.ledger import (  # noqa: E402
    EXECUTION_VERIFICATION_MODEL,
    MAX_SUBAGENTS,
    PLANNING_MODEL,
    TASKS,
    TaskRecord,
    summarize_run,
    validate_contract,
)


class LedgerContractTests(unittest.TestCase):
    """Verify that the mock ledger preserves the orchestration contract."""

    def test_summary_matches_expected_orchestration_shape(self) -> None:
        summary = summarize_run()

        self.assertEqual(summary["task_count"], 6)
        self.assertEqual(summary["max_subagents"], MAX_SUBAGENTS)
        self.assertTrue(summary["within_limit"])
        self.assertEqual(summary["role_counts"], {"planning": 2, "execution": 2, "verifier": 2})
        self.assertEqual(summary["task_ids"], [f"task-{index}" for index in range(1, 7)])

    def test_contract_is_valid_for_default_tasks(self) -> None:
        self.assertEqual(validate_contract(), [])

    def test_model_routing_matches_requested_roles(self) -> None:
        for task in TASKS:
            if task.role == "planning":
                self.assertEqual(task.model, PLANNING_MODEL)
            elif task.role in {"execution", "verifier"}:
                self.assertEqual(task.model, EXECUTION_VERIFICATION_MODEL)
            else:
                self.fail(f"unexpected role {task.role!r} in {task.task_id}")

    def test_dependencies_only_reference_known_prior_tasks(self) -> None:
        seen: set[str] = set()
        for task in TASKS:
            self.assertTrue(set(task.depends_on).issubset(seen), f"{task.task_id} has invalid dependencies")
            seen.add(task.task_id)

    def test_validator_reports_model_and_dependency_errors(self) -> None:
        invalid_tasks = (
            TaskRecord("task-1", "planning", "wrong-model", ()),
            TaskRecord("task-2", "execution", EXECUTION_VERIFICATION_MODEL, ("missing-task",)),
        )

        errors = validate_contract(invalid_tasks)

        self.assertIn("task-1 planning model mismatch: wrong-model", errors)
        self.assertIn("task-2 depends on unknown task missing-task", errors)

    def test_cli_outputs_deterministic_valid_json_summary(self) -> None:
        env = os.environ.copy()
        env["PYTHONPATH"] = str(SRC_DIR)
        result = subprocess.run(
            [sys.executable, "-m", "orchestration_mock"],
            cwd=PROJECT_ROOT,
            env=env,
            check=True,
            capture_output=True,
            text=True,
        )

        payload = json.loads(result.stdout)
        self.assertEqual(payload["errors"], [])
        self.assertEqual(payload["task_count"], 6)
        self.assertTrue(payload["within_limit"])


if __name__ == "__main__":
    unittest.main()
