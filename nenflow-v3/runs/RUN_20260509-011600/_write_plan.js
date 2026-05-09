
const fs = require('fs');
const P = 'C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260509-011600/ATT_1_PLAN.md';
const body = fs.readFileSync('C:/Users/doner/.pi/agent/nenflow-v3/runs/RUN_20260509-011600/_plan_body.md', 'utf-8');
const header = fs.readFileSync(P, 'utf-8');
fs.writeFileSync(P, header + '
' + body, 'utf-8');
console.log('Plan assembled');
