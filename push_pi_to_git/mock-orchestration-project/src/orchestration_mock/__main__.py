"""CLI entry point for the mock orchestration project."""

from __future__ import annotations

import json

from .ledger import summarize_run, validate_contract


def main() -> None:
    """Print a deterministic JSON summary for validators."""

    payload = summarize_run()
    payload["errors"] = validate_contract()
    print(json.dumps(payload, sort_keys=True))


if __name__ == "__main__":
    main()
