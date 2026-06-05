
const fs = require('fs');
const outPath = 'C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260603-000000/ATT_1_PLAN.md';
const plan = fs.readFileSync('C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260603-000000/plan_source.txt', 'utf8');
fs.writeFileSync(outPath, plan, 'utf8');
console.log('Plan written:', plan.length, 'chars');
