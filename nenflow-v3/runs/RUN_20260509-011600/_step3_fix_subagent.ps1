$file = 'C:/Users/doner/.pi/agent/extensions/subagent.ts'
$content = [System.IO.File]::ReadAllText($file)

# Part A: Replace cliPath constant with resolveCliPath function
$oldCliPath = @'
const cliPath = join(
	homedir(),
	"AppData",
	"Roaming",
	"npm",
	"node_modules",
	"@mariozechner",
	"pi-coding-agent",
	"dist",
	"cli.js",
);

const agencyProfiles
'@

$newResolveCliPath = @'
function resolveCliPath(): string {
	if (process.env.PI_CLI_PATH && existsSync(process.env.PI_CLI_PATH)) {
		return process.env.PI_CLI_PATH;
	}
	if (process.platform === "win32") {
		const appData = process.env.APPDATA || join(homedir(), "AppData", "Roaming");
		const winPath = join(appData, "npm", "node_modules", "@mariozechner", "pi-coding-agent", "dist", "cli.js");
		if (existsSync(winPath)) return winPath;
	} else {
		const candidates = [
			join(homedir(), ".npm-global", "lib", "node_modules", "@mariozechner", "pi-coding-agent", "dist", "cli.js"),
			"/usr/local/lib/node_modules/@mariozechner/pi-coding-agent/dist/cli.js",
			"/usr/lib/node_modules/@mariozechner/pi-coding-agent/dist/cli.js",
		];
		for (const c of candidates) {
			if (existsSync(c)) return c;
		}
	}
	throw new Error(
		"Pi CLI not found. Set PI_CLI_PATH environment variable to the cli.js path, or ensure pi-coding-agent is installed globally.",
	);
}

const agencyProfiles
'@

if ($content.Contains($oldCliPath)) {
    $content = $content.Replace($oldCliPath, $newResolveCliPath)
    Write-Host "Part A: cliPath -> resolveCliPath REPLACED"
} else {
    Write-Host "Part A: cliPath pattern NOT FOUND"
}

# Part A-2: Replace ensureCliPath body
$oldEnsureCliPath = @'
function ensureCliPath(): string {
	if (existsSync(cliPath)) return cliPath;
	throw new Error(`Pi CLI not found at `${cliPath}``);
}
'@

$newEnsureCliPath = @'
function ensureCliPath(): string {
	return resolveCliPath();
}
'@

if ($content.Contains($oldEnsureCliPath)) {
    $content = $content.Replace($oldEnsureCliPath, $newEnsureCliPath)
    Write-Host "Part A-2: ensureCliPath REPLACED"
} else {
    Write-Host "Part A-2: ensureCliPath pattern NOT FOUND"
    # Try to find what's there
    if ($content -match 'function ensureCliPath\(\): string \{\s+if \(existsSync') {
        Write-Host "  -> Found ensureCliPath with old body pattern"
    }
}

# Part B: Add metadata to success return
$oldSuccessReturn = @'
			try {
				const result = await runSubagent(agent, params.task, params.cwd, ctx, signal, params.allowLocalModel);
				return {
					content: [{ type: "text", text: result }],
					details: {
						agent: agent.name,
						description: agent.description,
						agencyLevel: agent.agencyLevel,
						model: agent.model ?? ctx.model?.id,
						provider: agent.provider ?? ctx.model?.provider,
						tools: agent.tools ?? [],
						sourceFile: agent.sourceFile,
					},
				};
'@

$newSuccessReturn = @'
			try {
				const result = await runSubagent(agent, params.task, params.cwd, ctx, signal, params.allowLocalModel);
				return {
					content: [{ type: "text", text: result }],
					details: {
						agent: agent.name,
						description: agent.description,
						agencyLevel: agent.agencyLevel,
						model: agent.model ?? ctx.model?.id,
						provider: agent.provider ?? ctx.model?.provider,
						tools: agent.tools ?? [],
						sourceFile: agent.sourceFile,
					},
					metadata: {
						agent: agent.name,
						agencyLevel: agent.agencyLevel,
						model: agent.model ?? ctx.model?.id ?? "unknown",
						provider: agent.provider ?? ctx.model?.provider ?? "unknown",
						sourceFile: agent.sourceFile,
						resultLength: result.length,
						cwd: params.cwd ?? ctx.cwd,
					},
				};
'@

if ($content.Contains($oldSuccessReturn)) {
    $content = $content.Replace($oldSuccessReturn, $newSuccessReturn)
    Write-Host "Part B: success metadata REPLACED"
} else {
    Write-Host "Part B: success return pattern NOT FOUND"
}

# Part C: Add metadata to error return
$oldErrorReturn = @'
			} catch (error: any) {
				return {
					content: [{ type: "text", text: error?.message || `Subagent `${agent.name}` failed` }],
					isError: true,
					details: { agent: agent.name, sourceFile: agent.sourceFile },
				};
'@

$newErrorReturn = @'
			} catch (error: any) {
				return {
					content: [{ type: "text", text: error?.message || `Subagent `${agent.name}` failed` }],
					isError: true,
					details: { agent: agent.name, sourceFile: agent.sourceFile },
					metadata: { agent: agent.name, sourceFile: agent.sourceFile },
				};
'@

if ($content.Contains($oldErrorReturn)) {
    $content = $content.Replace($oldErrorReturn, $newErrorReturn)
    Write-Host "Part C: error metadata REPLACED"
} else {
    Write-Host "Part C: error return pattern NOT FOUND"
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "subagent.ts written successfully"
