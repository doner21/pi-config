"""Deterministic mock project used to verify orchestration behavior."""

from .ledger import MAX_SUBAGENTS, TASKS, summarize_run, validate_contract

__all__ = ["MAX_SUBAGENTS", "TASKS", "summarize_run", "validate_contract"]
