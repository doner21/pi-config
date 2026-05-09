$file = 'C:/Users/doner/.pi/agent/extensions/subagent.ts'
$content = [System.IO.File]::ReadAllText($file)

# Fix 1: ensureCliPath body
$oldEnsure = "function ensureCliPath(): string {`r`n`tif (existsSync(cliPath)) return cliPath;`r`n`tthrow new Error(`$""Pi CLI not found at `${cliPath}""`$);`r`n}"
$newEnsure = "function ensureCliPath(): string {`r`n`treturn resolveCliPath();`r`n}"

if ($content.Contains($oldEnsure)) {
    $content = $content.Replace($oldEnsure, $newEnsure)
    Write-Host "ensureCliPath: REPLACED"
} else {
    Write-Host "ensureCliPath: NOT FOUND - searching for pattern..."
    $idx = $content.IndexOf("function ensureCliPath")
    if ($idx -ge 0) {
        $snippet = $content.Substring($idx, [Math]::Min(120, $content.Length - $idx))
        Write-Host "Found at $idx :"
        Write-Host ($snippet -replace "`r", '\r' -replace "`n", '\n' -replace "`t", '\t')
    }
}

# Fix 2: error return metadata
$oldError = "`t`t`t`tcontent: [{ type: `"text`", text: error?.message || `$""Subagent `${agent.name}`` failed""`$ }],`r`n`t`t`t`tisError: true,`r`n`t`t`t`tdetails: { agent: agent.name, sourceFile: agent.sourceFile },`r`n`t`t`t};"
$newError = "`t`t`t`tcontent: [{ type: `"text`", text: error?.message || `$""Subagent `${agent.name}`` failed""`$ }],`r`n`t`t`t`tisError: true,`r`n`t`t`t`tdetails: { agent: agent.name, sourceFile: agent.sourceFile },`r`n`t`t`t`tmetadata: { agent: agent.name, sourceFile: agent.sourceFile },`r`n`t`t`t};"

if ($content.Contains($oldError)) {
    $content = $content.Replace($oldError, $newError)
    Write-Host "error metadata: REPLACED"
} else {
    Write-Host "error metadata: NOT FOUND"
    $idx = $content.IndexOf("} catch (error: any)")
    if ($idx -ge 0) {
        $snippet = $content.Substring($idx, [Math]::Min(250, $content.Length - $idx))
        Write-Host ($snippet -replace "`r", '\r' -replace "`n", '\n' -replace "`t", '\t')
    }
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "Done"
