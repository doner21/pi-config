"""Dependency-free JSON validation script for the dashboard mock project.

A verifier can run this script directly with `python scripts/validate.py`
to check all dashboard widget lifecycle invariants:

1. setWidget never uses overlay
2. Every show is paired with guaranteed cleanup in a finally-equivalent state
3. Auto-show is never triggered without explicit command

Outputs a JSON report to stdout.  Exit code 0 = PASS, 1 = FAIL.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = PROJECT_ROOT / "src"
sys.path.insert(0, str(SRC_DIR))

from dashboard_mock.widget_lifecycle import (  # noqa: E402
    CLEANUP_GUARANTEED_STATES,
    WidgetLifecycle,
    WidgetState,
    validate_invariants,
)


@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str = ""
    exception: Optional[str] = None


@dataclass
class ValidationReport:
    status: str  # "pass" | "fail"
    checks: list[dict[str, Any]] = field(default_factory=list)
    invariant_results: dict[str, bool] = field(default_factory=dict)
    test_summary: dict[str, Any] = field(default_factory=dict)
    failures: list[dict[str, str]] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "checks": self.checks,
            "invariant_results": self.invariant_results,
            "test_summary": self.test_summary,
            "failures": self.failures,
        }


def run_check(name: str, fn) -> CheckResult:
    """Run a single check, catching exceptions."""
    try:
        fn()
        return CheckResult(name=name, passed=True)
    except AssertionError as e:
        return CheckResult(name=name, passed=False, detail=str(e))
    except Exception as e:
        return CheckResult(
            name=name, passed=False, detail=str(e), exception=type(e).__name__
        )


def main() -> int:
    report = ValidationReport(status="pass")
    checks: list[CheckResult] = []

    # ── normal lifecycle: show → update → clear ────────────────
    def check_normal_lifecycle() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.update()
            shown.clear()
        assert w.state == WidgetState.CLEARED, f"expected CLEARED, got {w.state.name}"
        assert w._cleanup_count == 1, f"cleanup_count={w._cleanup_count}, expected 1"
        assert w._show_count == 1, f"show_count={w._show_count}, expected 1"

    checks.append(run_check("normal lifecycle: show→update→clear", check_normal_lifecycle))

    # ── error-path cleanup ─────────────────────────────────────
    def check_error_cleanup() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.error("test error")
        assert w.state == WidgetState.ERROR, f"expected ERROR, got {w.state.name}"
        assert w._cleanup_count == 1, "cleanup did not run on error path"

    checks.append(run_check("error-path guarantees cleanup", check_error_cleanup))

    # ── abort-path cleanup ─────────────────────────────────────
    def check_abort_cleanup() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.abort()
        assert w.state == WidgetState.ABORTED, f"expected ABORTED, got {w.state.name}"
        assert w._cleanup_count == 1, "cleanup did not run on abort path"

    checks.append(run_check("abort-path guarantees cleanup", check_abort_cleanup))

    # ── overlay detection ──────────────────────────────────────
    def check_overlay_rejected() -> None:
        w = WidgetLifecycle()
        try:
            w.set_widget(overlay=True)
            assert False, "set_widget(overlay=True) should have raised ValueError"
        except ValueError:
            pass

    checks.append(run_check("set_widget rejects overlay", check_overlay_rejected))

    # ── no-auto-show guard ─────────────────────────────────────
    def check_no_auto_show() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        assert w.state == WidgetState.IDLE
        w.session_start()
        assert w.state == WidgetState.IDLE, (
            f"session_start caused auto-show: state={w.state.name}"
        )

    checks.append(run_check("session_start does not auto-show", check_no_auto_show))

    # ── implicit abort on context exit ─────────────────────────
    def check_implicit_abort() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.update()
            # no explicit clear/error/abort → auto-abort + cleanup
        assert w.state == WidgetState.ABORTED, (
            f"expected ABORTED on context exit without explicit exit, got {w.state.name}"
        )
        assert w._cleanup_count == 1, "cleanup not run on implicit abort"

    checks.append(run_check("implicit abort on context exit", check_implicit_abort))

    # ── invariant validation ───────────────────────────────────
    def check_invariant_normal() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.update()
            shown.clear()
        v = validate_invariants(w)
        assert v == [], f"unexpected violations in normal lifecycle: {v}"

    checks.append(run_check("all invariants pass (normal lifecycle)", check_invariant_normal))

    def check_invariant_error() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.error("boom")
        v = validate_invariants(w)
        assert v == [], f"unexpected violations in error path: {v}"

    checks.append(run_check("all invariants pass (error path)", check_invariant_error))

    def check_invariant_abort() -> None:
        w = WidgetLifecycle()
        w.set_widget(overlay=False)
        w.session_start()
        with w.show_command() as shown:
            shown.abort()
        v = validate_invariants(w)
        assert v == [], f"unexpected violations in abort path: {v}"

    checks.append(run_check("all invariants pass (abort path)", check_invariant_abort))

    # ── compile report ─────────────────────────────────────────
    all_passed = all(c.passed for c in checks)

    report.status = "pass" if all_passed else "fail"
    report.checks = [
        {
            "name": c.name,
            "passed": c.passed,
            "detail": c.detail,
            "exception": c.exception,
        }
        for c in checks
    ]

    # Invariant results summary
    report.invariant_results = {
        "no_overlay": any("overlay" in c.name.lower() and c.passed for c in checks),
        "guaranteed_cleanup": (
            checks[1].passed and checks[2].passed and checks[5].passed
        ),
        "no_auto_show": checks[4].passed,
        "all_invariants_normal": checks[6].passed,
        "all_invariants_error": checks[7].passed,
        "all_invariants_abort": checks[8].passed,
    }

    # Test summary
    passed_count = sum(1 for c in checks if c.passed)
    failed_count = sum(1 for c in checks if not c.passed)
    report.test_summary = {
        "total": len(checks),
        "passed": passed_count,
        "failed": failed_count,
    }

    # Failures detail
    report.failures = [
        {"name": c.name, "detail": c.detail}
        for c in checks
        if not c.passed
    ]

    print(json.dumps(report.to_dict(), indent=2, sort_keys=True))
    return 0 if all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
