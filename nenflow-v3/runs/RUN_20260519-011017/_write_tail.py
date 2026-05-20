from pathlib import Path
import sys
plan_path = Path(sys.argv[1])
with open(plan_path, "a", encoding="utf-8") as pf:
    pf.write(sys.argv[2])
print("ok")
