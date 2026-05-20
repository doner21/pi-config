
import os
path = r"C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260519-011017/ATT_1_RESEARCH.md"
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w", encoding="utf-8") as f:
    f.write("TEST
")
print("Done")
