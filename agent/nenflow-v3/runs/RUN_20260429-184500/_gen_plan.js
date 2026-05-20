const fs=require("fs");
const p="C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260429-184500/ATT_1_PLAN.md";
var a=fs.appendFileSync;
fs.writeFileSync(p,"");
a(p,"## Invariants

");
a(p,"- PiBridgeClient TypeScript interface (src/bridge/piBridge.types.ts) must not change
");
a(p,"- All seven bridge endpoints must remain functional
");
a(p,"- npm run typecheck must pass
");
a(p,"- Pi CLI must still be invoked with --no-tools --no-extensions --no-skills --no-session
");
a(p,"- Server must bind to 0.0.0.0 for LAN access
");
a(p,"- Emulator reachability via 10.0.2.2 must continue to work
");
a(p,"- No external process manager — pure Node.js in server.cjs
");
a(p,"- Server timeout stays at 120000ms; client timeout increases to match (Step 7)
");
