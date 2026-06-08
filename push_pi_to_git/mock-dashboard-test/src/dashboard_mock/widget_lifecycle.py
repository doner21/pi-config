"""Deterministic widget lifecycle state machine.

Models the dashboard widget show/update/clear/error/abort lifecycle
and enforces three invariants from the dashboard rebuild brief and
postmortem:

1. setWidget never uses overlay — any attempt to create a widget
   with overlay=True is rejected.
2. Every show is paired with guaranteed cleanup — when a widget
   leaves SHOWING state (whether via clear, error, or abort), the
   cleanup routine is always executed with no bypass possible.
3. Auto-show is never triggered without an explicit command —
   session_start and other lifecycle hooks never implicitly call
   show(); only explicit show_command() triggers SHOWING.
"""

from __future__ import annotations

from contextlib import contextmanager
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Callable, Generator, Optional


class WidgetState(Enum):
    """All possible widget lifecycle states."""

    IDLE = auto()       # Not yet shown, or reset after lifecycle
    SHOWING = auto()   # Actively visible; cleanup expected on exit
    CLEARED = auto()   # Clean exit via clear(); cleanup ran
    ERROR = auto()     # Error during show; cleanup ran
    ABORTED = auto()   # Explicit abort; cleanup ran


# States in which cleanup is confirmed to have run.
# Every path out of SHOWING must land in one of these.
CLEANUP_GUARANTEED_STATES: frozenset[WidgetState] = frozenset({
    WidgetState.CLEARED,
    WidgetState.ERROR,
    WidgetState.ABORTED,
})

# Allowed deterministic transitions.
ALLOWED_TRANSITIONS: dict[WidgetState, frozenset[WidgetState]] = {
    WidgetState.IDLE:     frozenset({WidgetState.SHOWING}),
    WidgetState.SHOWING:  frozenset({WidgetState.CLEARED, WidgetState.ERROR, WidgetState.ABORTED}),
    WidgetState.CLEARED:  frozenset({WidgetState.IDLE}),
    WidgetState.ERROR:    frozenset({WidgetState.IDLE}),
    WidgetState.ABORTED:  frozenset({WidgetState.IDLE}),
}


@dataclass
class WidgetLifecycle:
    """A deterministic widget that enforces invariant rules.

    Key design decisions:

    - set_widget is the ONLY way to configure the widget, and it
      rejects overlay (invariant 1).
    - show_command() returns a context manager; the SHOWING → exit
      transition happens in its __exit__, which acts as a finally
      block (invariant 2).
    - session_start() and any other lifecycle hook never call
      show_command() implicitly (invariant 3).
    """

    state: WidgetState = WidgetState.IDLE
    _overlay_used: bool = False
    _cleanup_count: int = 0
    _show_count: int = 0
    _auto_show_attempts: int = 0
    # Track detailed history for debugging
    history: list[str] = field(default_factory=list)

    # ── invariant 1: setWidget never uses overlay ──────────────

    def set_widget(self, *, overlay: bool = False) -> WidgetLifecycle:
        """Configure the widget.  overlay=True is rejected per the invariant."""
        if overlay:
            self._overlay_used = True
            self._log(f"set_widget REJECTED: overlay=True")
            raise ValueError("set_widget: overlay mode is forbidden per dashboard invariant")
        self._log(f"set_widget ok overlay={overlay}")
        return self

    # ── invariant 3: no auto-show ──────────────────────────────

    def session_start(self) -> WidgetLifecycle:
        """Lifecycle hook — must NOT call show_command()."""
        if self.state == WidgetState.SHOWING:
            self._auto_show_attempts += 1
            self._log("session_start ILLEGAL: already SHOWING (auto-show detected)")
            raise RuntimeError("session_start: auto-show guard — widget already SHOWING")
        self._log(f"session_start (state={self.state.name}) — no auto-show")
        return self

    # ── invariant 2: guaranteed cleanup via show_command ────────

    @contextmanager
    def show_command(self) -> Generator[WidgetLifecycle, None, None]:
        """Explicitly show the widget, guaranteeing cleanup on exit.

        The context manager's __exit__ serves as a finally block:
        no matter how the widget leaves SHOWING, cleanup runs.
        """
        if self.state != WidgetState.IDLE:
            self._log(f"show_command rejected: widget not IDLE (state={self.state.name})")
            raise RuntimeError(f"show_command: widget must be IDLE, got {self.state.name}")

        self._transition_to(WidgetState.SHOWING)
        self._show_count += 1
        self._log("show_command: entered SHOWING (cleanup guaranteed)")

        try:
            yield self
        finally:
            # Guaranteed cleanup — equivalent to a finally block.
            self._cleanup_count += 1
            # Only transition if still showing (caller may have
            # already transitioned to a terminal state).
            if self.state == WidgetState.SHOWING:
                # If the caller didn't explicitly transition, treat
                # leaving the context as an abort.
                self._transition_to(WidgetState.ABORTED)
            self._log(
                f"show_command cleanup ran (state={self.state.name}, "
                f"cleanup_count={self._cleanup_count})"
            )

    def update(self) -> WidgetLifecycle:
        """Update widget while SHOWING — no state change."""
        if self.state != WidgetState.SHOWING:
            raise RuntimeError(f"update: widget must be SHOWING, got {self.state.name}")
        self._log("update ok")
        return self

    def clear(self) -> WidgetLifecycle:
        """Clean shutdown — signals a successful lifecycle."""
        if self.state != WidgetState.SHOWING:
            raise RuntimeError(f"clear: widget must be SHOWING, got {self.state.name}")
        self._transition_to(WidgetState.CLEARED)
        self._log("clear → CLEARED")
        return self

    def error(self, message: str = "") -> WidgetLifecycle:
        """Error path — still guarantees cleanup ran."""
        if self.state != WidgetState.SHOWING:
            raise RuntimeError(f"error: widget must be SHOWING, got {self.state.name}")
        self._transition_to(WidgetState.ERROR)
        self._log(f"error → ERROR {message}" if message else "error → ERROR")
        return self

    def abort(self) -> WidgetLifecycle:
        """Explicit abort — still guarantees cleanup ran."""
        if self.state != WidgetState.SHOWING:
            raise RuntimeError(f"abort: widget must be SHOWING, got {self.state.name}")
        self._transition_to(WidgetState.ABORTED)
        self._log("abort → ABORTED")
        return self

    def reset(self) -> WidgetLifecycle:
        """Return to IDLE for another lifecycle."""
        if self.state not in (WidgetState.CLEARED, WidgetState.ERROR, WidgetState.ABORTED):
            raise RuntimeError(f"reset: widget must be in terminal state, got {self.state.name}")
        self._transition_to(WidgetState.IDLE)
        self._log("reset → IDLE")
        return self

    # ── helpers ────────────────────────────────────────────────

    def _transition_to(self, target: WidgetState) -> None:
        if target not in ALLOWED_TRANSITIONS.get(self.state, frozenset()):
            raise RuntimeError(
                f"invalid transition: {self.state.name} → {target.name}"
            )
        self.state = target

    def _log(self, msg: str) -> None:
        self.history.append(msg)


# ── standalone invariant validator ─────────────────────────────


def validate_invariants(widget: WidgetLifecycle) -> list[str]:
    """Check all three invariants against a WidgetLifecycle instance.

    Returns a list of violation descriptions (empty = all invariants hold).
    """
    violations: list[str] = []

    # invariant 1: no overlay usage
    if widget._overlay_used:
        violations.append("INVARIANT 1 VIOLATED: overlay was used via set_widget")

    # invariant 2: every show had cleanup
    if widget._show_count != widget._cleanup_count:
        violations.append(
            f"INVARIANT 2 VIOLATED: {widget._show_count} shows "
            f"but only {widget._cleanup_count} cleanups"
        )

    if widget._show_count > 0 and widget.state not in CLEANUP_GUARANTEED_STATES and widget.state != WidgetState.IDLE:
        violations.append(
            f"INVARIANT 2 VIOLATED: widget ended in {widget.state.name} "
            f"after {widget._show_count} show(s) — cleanup not confirmed"
        )

    # invariant 3: no auto-show
    if widget._auto_show_attempts > 0:
        violations.append(
            f"INVARIANT 3 VIOLATED: {widget._auto_show_attempts} "
            f"auto-show attempt(s) detected"
        )

    return violations
