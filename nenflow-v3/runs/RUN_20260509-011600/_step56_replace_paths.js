const fs = require('fs');
const baseDir = 'C:/Users/doner/.pi/agent';

// Step 5: Fix 5 skill files
const skillReplacements = [
  {
    file: 'skills/nenflow-pev-executor/SKILL.md',
    oldPath: 'C:/Users/doner/nenflow_v3/',
    newPath: '~/.pi/agent/nenflow-v3/',
  },
  {
    file: 'skills/nenflow-pev-planner/SKILL.md',
    oldPath: 'C:/Users/doner/nenflow_v3/',
    newPath: '~/.pi/agent/nenflow-v3/',
  },
  {
    file: 'skills/nenflow-pev-researcher/SKILL.md',
    oldPath: 'C:/Users/doner/nenflow_v3/',
    newPath: '~/.pi/agent/nenflow-v3/',
  },
  {
    file: 'skills/nenflow-pev-verifier/SKILL.md',
    oldPath: 'C:/Users/doner/nenflow_v3/',
    newPath: '~/.pi/agent/nenflow-v3/',
  },
  {
    file: 'skills/nenflow-v3/SKILL.md',
    oldPath: 'C:/Users/doner/.pi/agent/nenflow-v3/',
    newPath: '~/.pi/agent/nenflow-v3/',
  },
];

let totalCount = 0;
for (const r of skillReplacements) {
  const fpath = `${baseDir}/${r.file}`;
  let content = fs.readFileSync(fpath, 'utf8');
  const before = content;
  content = content.split(r.oldPath).join(r.newPath);
  const count = (before.length - content.length) / (r.oldPath.length - r.newPath.length);
  totalCount += count;
  fs.writeFileSync(fpath, content);
  console.log(`${r.file}: ${count} replacements`);
}
console.log(`Step 5 total: ${totalCount} replacements`);

// Step 6: Fix 2 prompt files
const promptReplacements = [
  {
    file: 'prompts/pev.md',
    oldPath: 'C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md',
    newPath: '~/.pi/agent/skills/nenflow-v3/SKILL.md',
  },
  {
    file: 'prompts/nenflow_v3.md',
    oldPath: 'C:/Users/doner/.pi/agent/skills/nenflow-v3/SKILL.md',
    newPath: '~/.pi/agent/skills/nenflow-v3/SKILL.md',
  },
];

let promptTotal = 0;
for (const r of promptReplacements) {
  const fpath = `${baseDir}/${r.file}`;
  let content = fs.readFileSync(fpath, 'utf8');
  const before = content;
  content = content.split(r.oldPath).join(r.newPath);
  const count = (before.length - content.length) / (r.oldPath.length - r.newPath.length);
  promptTotal += count;
  fs.writeFileSync(fpath, content);
  console.log(`${r.file}: ${count} replacements`);
}
console.log(`Step 6 total: ${promptTotal} replacements`);
console.log('All markdown files updated.');
