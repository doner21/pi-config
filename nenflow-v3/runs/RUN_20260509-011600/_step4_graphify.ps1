$file = 'C:/Users/doner/.pi/agent/extensions/graphify.ts'
$content = [System.IO.File]::ReadAllText($file)

# Old pattern: from "if (!match) continue;" through the report block and wiki block, ending before "break;"
$oldPattern = @'
      if (!match) continue;

      const reportPath = path.join(BRAIN_DIR, entry.name, "GRAPH_REPORT.md");
      if (fs.existsSync(reportPath)) {
        const report = fs.readFileSync(reportPath, "utf-8");
        const sections = extractSections(report, [
          "God Nodes",
          "Surprising Connections",
          "Suggested Questions",
        ]);
        parts.push(
          `\n## Active Project Graph: ${meta.displayName ?? entry.name}`,
          `(Saved ${meta.savedAt})`,
          `\n${sections}`,
        );
      }

      const wikiIndex = path.join(BRAIN_DIR, entry.name, "wiki", "index.md");
'@

$newPattern = @'
      if (!match) continue;

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
                `\n## Active Project Graph: ${meta.displayName ?? entry.name}`,
                `⚠️ safeToInject is false — GRAPH_REPORT not injected. Run /memory verify to re-enable.`,
              );
              skipReport = true;
            } else if (verifiedStatus !== undefined && verifiedStatus !== "verified") {
              parts.push(
                `\n## Active Project Graph: ${meta.displayName ?? entry.name}`,
                `⚠️ verifiedStatus=${verifiedStatus}. GRAPH_REPORT content may be stale or unverified.`,
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
            `\n## Active Project Graph: ${meta.displayName ?? entry.name}`,
            `(Saved ${meta.savedAt})`,
            `\n${sections}`,
          );
        }
      }

      const wikiIndex = path.join(BRAIN_DIR, entry.name, "wiki", "index.md");
'@

if ($content.Contains($oldPattern)) {
    $content = $content.Replace($oldPattern, $newPattern)
    Write-Host "graphify.ts: brainContextForCwd gating REPLACED"
} else {
    Write-Host "ERROR: oldPattern not found"
    # Debug: show what's around the match area
    $idx = $content.IndexOf('if (!match) continue;')
    if ($idx -ge 0) {
        $snippet = $content.Substring($idx, [Math]::Min(500, $content.Length - $idx))
        Write-Host ($snippet -replace "`r", '\r' -replace "`n", '\n')
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "graphify.ts written"
