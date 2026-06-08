"""Small deterministic orchestration ledger.

The data here mirrors the mock orchestration plan.  The functions are pure so a
follow-on verifier can validate the project without network access or external
services.
"""

from __future__ import annotations

from dataclasses import dataclass

MAX_SUBAGENTS = 8
PLANNING_MODEL = "GPT 5.5 codecs"
EXECUTION_VERIFICATION_MODEL = "deep-seek V4 flash"


@dataclass(frozen=True)
class TaskRecord:
    """A single planned orchestration subagent task."""

    task_id: str
    role: str
    model: str
    depends_on: tuple[str, ...]


TASKS: tuple[TaskRecord, ...] = (
    TaskRecord("task-1", "planning", PLANNING_MODEL, ()),
    TaskRecord("task-2", "planning", PLANNING_MODEL, ("task-1",)),
    TaskRecord("task-3", "execution", EXECUTION_VERIFICATION_MODEL, ("task-2",)),
    TaskRecord("task-4", "execution", EXECUTION_VERIFICATION_MODEL, ("task-3",)),
    TaskRecord("task-5", "verifier", EXECUTION_VERIFICATION_MODEL, ("task-4",)),
    TaskRecord("task-6", "verifier", EXECUTION_VERIFICATION_MODEL, ("task-5",)),
)


def summarize_run(tasks: tuple[TaskRecord, ...] = TASKS) -> dict[str, object]:
    """Return a stable summary of the orchestration ledger."""

    role_counts: dict[str, int] = {}
    for task in tasks:
        role_counts[task.role] = role_counts.get(task.role, 0) + 1

    return {
        "task_count": len(tasks),
        "max_subagents": MAX_SUBAGENTS,
        "within_limit": len(tasks) <= MAX_SUBAGENTS,
        "role_counts": role_counts,
        "task_ids": [task.task_id for task in tasks],
    }


def validate_contract(tasks: tuple[TaskRecord, ...] = TASKS) -> list[str]:
    """Return human-readable contract violations, or an empty list when valid."""

    errors: list[str] = []
    task_ids = {task.task_id for task in tasks}

    if len(tasks) > MAX_SUBAGENTS:
        errors.append(f"uses {len(tasks)} subagents, exceeding limit {MAX_SUBAGENTS}")

    for task in tasks:
        if task.role == "planning" and task.model != PLANNING_MODEL:
            errors.append(f"{task.task_id} planning model mismatch: {task.model}")
        if task.role in {"execution", "verifier"} and task.model != EXECUTION_VERIFICATION_MODEL:
            errors.append(f"{task.task_id} {task.role} model mismatch: {task.model}")
        for dependency in task.depends_on:
            if dependency not in task_ids:
                errors.append(f"{task.task_id} depends on unknown task {dependency}")

    return errors
