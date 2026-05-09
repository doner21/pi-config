const fs = require('fs');
let content = fs.readFileSync('C:/Users/doner/.pi/agent/extensions/graphify.ts', 'utf8');

// The old block: from 'if (!match) continue;' through (not including) 'const wikiIndex = ...'
const startIdx = content.indexOf('if (!match) continue;');
const endIdx = content.indexOf('const wikiIndex = path.join(BRAIN_DIR, entry.name, "wiki", "index.md");');
const oldBlock = content.substring(startIdx, endIdx);

const newBlock = `if (!match) continue;

      // Read run-meta for safety gating
      let safeToInject = true;
      let verifiedStatus: string | undefined;
      let skipReport = false;

      try {
        const lastRunId = meta.lastRunId;
        if (lastRunId) {
          const runMetaPath = path.join(BRAIN_DIR, entry.name, "runs", lastRunId, "run-meta.json");
          if (fs.existsSync(runMetaPath)) {
            const runMeta = JSON.parse(fs.readFileSync(runMetaPath, "utf-8"));
            safeToInject = runMeta.safeToInject !== false;
            verifiedStatus = typeof runMeta.verifiedStatus === "string" ? runMeta.verifiedStatus : undefined;

            if (safeToInject === false) {
              parts.push(
                \`\\n## Active Project Graph: \${meta.displayName ?? entry.name}\`,
                \`⚠️ safeToInject is false — GRAPH_REPORT not injected. Run /memory verify to re-enable.\`,
              );
              skipReport = true;
            } else if (verifiedStatus !== undefined && verifiedStatus !== "verified") {
              parts.push(
                \`\\n## Active Project Graph: \${meta.displayName ?? entry.name}\`,
                \`⚠️ verifiedStatus=\${verifiedStatus}. GRAPH_REPORT content may be stale or unverified.\`,
              );
            }
          }
        }
      } catch {
        // Fall through — skip gating on read failure
      }

      if (!skipReport) {
        const reportPath = path.join(BRAIN_DIR, entry.name, "GRAPH_REPORT.md");
        if (fs.existsSync(reportPath)) {
          const report = fs.readFileSync(reportPath, "utf-8");
          const sections = extractSections(report, [
            "God Nodes",
            "Surprising Connections",
            "Suggested Questions",
          ]);
          parts.push(
            \`\\n## Active Project Graph: \${meta.displayName ?? entry.name}\`,
            \`(Saved \${meta.savedAt})\`,
            \`\\n\${sections}\`,
          );
        }
      }

`;

if (content.includes(oldBlock)) {
  content = content.replace(oldBlock, newBlock);
  console.log('REPLACED successfully');
} else {
  console.log('ERROR: oldBlock not found in content');
  // Debug: show oldBlock
  console.log('oldBlock:', JSON.stringify(oldBlock.substring(0, 100)));
  process.exit(1);
}

fs.writeFileSync('C:/Users/doner/.pi/agent/extensions/graphify.ts', content);
console.log('graphify.ts written');
