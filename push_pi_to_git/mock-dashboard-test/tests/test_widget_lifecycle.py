"""Tests for the deterministic dashboard widget lifecycle state machine.

Covers:
- Normal lifecycle: show → update → clear
- Error-path cleanup
- Abort-path cleanup
- Overlay detection (must fail)
- No-auto-show guard
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))

from dashboard_mock.widget_lifecycle import (  # noqa: E402
    CLEANUP_GUARANTEED_STATES,
    WidgetLifecycle,
    WidgetState,
    validate_invariants,
)


class NormalLifecycleTests(unittest.TestCase):
    """show → update → clear: the happy path."""

    def test_show_update_clear_lifecycle(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        self.assertEqual(w.state, WidgetState.IDLE)

        with w.show_command() as shown:
            self.assertEqual(shown.state, WidgetState.SHOWING)
            shown.update()
            self.assertEqual(shown.state, WidgetState.SHOWING)
            shown.clear()
            self.assertEqual(shown.state, WidgetState.CLEARED)

        # After the context manager exits, cleanup ran
        self.assertEqual(w.state, WidgetState.CLEARED)
        self.assertEqual(w._cleanup_count, 1)

    def test_normal_lifecycle_passes_all_invariants(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            shown.update()
            shown.clear()

        violations = validate_invariants(w)
        self.assertEqual(violations, [], f"unexpected invariant violations: {violations}")

    def test_multiple_full_lifecycles_in_sequence(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        for i in range(3):
            with w.show_command() as shown:
                shown.update()
                shown.clear()
            self.assertEqual(w._show_count, i + 1)
            self.assertEqual(w._cleanup_count, i + 1)
            w.reset()
            self.assertEqual(w.state, WidgetState.IDLE)

        violations = validate_invariants(w)
        self.assertEqual(violations, [])


class ErrorPathCleanupTests(unittest.TestCase):
    """Error during show must still trigger cleanup."""

    def test_error_path_guarantees_cleanup(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            self.assertEqual(shown.state, WidgetState.SHOWING)
            shown.update()
            shown.error("widget render failed")

        # Cleanup must have run even though we hit an error
        self.assertEqual(w.state, WidgetState.ERROR)
        self.assertEqual(w._cleanup_count, 1)
        self.assertIn("widget render failed", w.history[-2])

    def test_error_path_passes_invariants(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            shown.error("something broke")

        violations = validate_invariants(w)
        self.assertEqual(violations, [])


class AbortPathCleanupTests(unittest.TestCase):
    """Explicit abort must still trigger cleanup."""

    def test_abort_path_guarantees_cleanup(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            self.assertEqual(shown.state, WidgetState.SHOWING)
            shown.abort()

        self.assertEqual(w.state, WidgetState.ABORTED)
        self.assertEqual(w._cleanup_count, 1)

    def test_abort_path_passes_invariants(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            shown.abort()

        violations = validate_invariants(w)
        self.assertEqual(violations, [])

    def test_implicit_abort_when_no_exit_called(self) -> None:
        """If the context exits without clear/error/abort, cleanup
        runs and state transitions to ABORTED."""
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            shown.update()  # no explicit exit

        # Cleanup ran, auto-transitioned to ABORTED
        self.assertEqual(w.state, WidgetState.ABORTED)
        self.assertEqual(w._cleanup_count, 1)


class OverlayDetectionTests(unittest.TestCase):
    """set_widget(overlay=True) must raise."""

    def test_set_widget_overlay_rejected(self) -> None:
        w = WidgetLifecycle()
        with self.assertRaises(ValueError) as ctx:
            w.set_widget(overlay=True)
        self.assertIn("overlay", str(ctx.exception).lower())

    def test_overlay_violates_invariants(self) -> None:
        w = WidgetLifecycle()
        try:
            w.set_widget(overlay=True)
        except ValueError:
            pass
        # _overlay_used flag is set even after exception
        violations = validate_invariants(w)
        self.assertTrue(any("overlay" in v.lower() for v in violations))

    def test_show_after_overlay_then_reject_does_not_leak(self) -> None:
        """Even after overlay is rejected, normal lifecycle still works."""
        w = WidgetLifecycle()
        try:
            w.set_widget(overlay=True)
        except ValueError:
            pass

        # Still IDLE, normal lifecycle should work
        self.assertEqual(w.state, WidgetState.IDLE)
        # But invariants should flag the overlay attempt
        violations = validate_invariants(w)
        self.assertTrue(len(violations) > 0)


class NoAutoShowGuardTests(unittest.TestCase):
    """session_start must never trigger show."""

    def test_session_start_does_not_transition_to_showing(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)

        self.assertEqual(w.state, WidgetState.IDLE)
        w.session_start()
        # Must still be IDLE — no auto-show
        self.assertEqual(w.state, WidgetState.IDLE)

    def test_session_start_while_showing_is_illegal(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            self.assertEqual(shown.state, WidgetState.SHOWING)
            with self.assertRaises(RuntimeError) as ctx:
                shown.session_start()
            self.assertIn("auto-show", str(ctx.exception).lower())

        self.assertEqual(w._auto_show_attempts, 1)

    def test_auto_show_violates_invariants(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command() as shown:
            try:
                shown.session_start()  # triggers auto-show guard
            except RuntimeError:
                pass

        violations = validate_invariants(w)
        self.assertTrue(any("auto-show" in v.lower() for v in violations))


class InvalidTransitionTests(unittest.TestCase):
    """Guard rails against invalid state transitions."""

    def test_cannot_update_when_idle(self) -> None:
        w = WidgetLifecycle()
        with self.assertRaises(RuntimeError):
            w.update()

    def test_cannot_clear_when_idle(self) -> None:
        w = WidgetLifecycle()
        with self.assertRaises(RuntimeError):
            w.clear()

    def test_cannot_error_when_idle(self) -> None:
        w = WidgetLifecycle()
        with self.assertRaises(RuntimeError):
            w.error()

    def test_cannot_show_while_already_showing(self) -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()

        with w.show_command():
            with self.assertRaises(RuntimeError):
                with w.show_command():
                    pass


class CleanupGuaranteedStatesTests(unittest.TestCase):
    """All exit paths from SHOWING land in CLEANUP_GUARANTEED_STATES."""

    def test_clear_error_abort_are_all_guaranteed(self) -> None:
        self.assertIn(WidgetState.CLEARED, CLEANUP_GUARANTEED_STATES)
        self.assertIn(WidgetState.ERROR, CLEANUP_GUARANTEED_STATES)
        self.assertIn(WidgetState.ABORTED, CLEANUP_GUARANTEED_STATES)

    def test_idle_is_not_cleanup_guaranteed(self) -> None:
        self.assertNotIn(WidgetState.IDLE, CLEANUP_GUARANTEED_STATES)

    def test_showing_is_not_cleanup_guaranteed(self) -> None:
        self.assertNotIn(WidgetState.SHOWING, CLEANUP_GUARANTEED_STATES)


if __name__ == "__main__":
    unittest.main()
