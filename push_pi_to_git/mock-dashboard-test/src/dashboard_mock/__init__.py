"""Deterministic mock dashboard widget lifecycle state machine.

Enforces invariants from DASHBOARD_REBUILD_BRIEF.md and DASHBOARD_POSTMORTEM.md:
- setWidget never uses overlay
- Every show is paired with guaranteed cleanup in a finally-equivalent state
- Auto-show is never triggered without explicit command
"""

from .widget_lifecycle import (
    CLEANUP_GUARANTEED_STATES,
    ALLOWED_TRANSITIONS,
    WidgetLifecycle,
    WidgetState,
    validate_invariants,
)

__all__ = [
    "CLEANUP_GUARANTEED_STATES",
    "ALLOWED_TRANSITIONS",
    "WidgetLifecycle",
    "WidgetState",
    "validate_invariants",
]
