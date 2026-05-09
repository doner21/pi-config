/**
 * Playwright MCP Extension for Pi Code
 *
 * Spawns the Playwright MCP server on session start and registers all its
 * browser automation tools into Pi's tool registry via pi.registerTool().
 *
 * The MCP server communicates over stdio (JSON-RPC 2.0). This extension
 * uses @modelcontextprotocol/sdk to connect to it as an MCP client.
 *
 * Required tools registered (at minimum):
 *   browser_navigate, browser_click, browser_snapshot,
 *   browser_take_screenshot, browser_type
 *
 * All other tools returned by listTools() are also registered.
 *
 * Screenshot results are returned as base64 data URIs in text content,
 * which is safe across all LLM providers.
 *
 * Auto-recovery: if a zombie Chrome process holds the browser profile lock,
 * this extension kills it via PowerShell Stop-Process (not taskkill — taskkill
 * is broken in bash on Windows due to /F → F:/ path mangling) and retries.
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { env } from "node:process";
import { homedir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { registerMcpServer, unregisterMcpServer } from "./mcp-status.js";

// ─── Lock recovery helpers ────────────────────────────────────────────────────

const MCP_PROFILES_DIR = join(
  env["LOCALAPPDATA"] ?? join(homedir(), "AppData", "Local"),
  "ms-playwright"
);

/** Kill all Chrome processes using PowerShell Stop-Process.
 *  Does NOT use taskkill — bash on Windows mangles /F to F:/ making it fail. */
function killZombieChrome(): void {
  try {
    execSync(
      `powershell -Command "Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue"`,
      { stdio: "pipe" }
    );
    console.log("[playwright-mcp] Killed zombie Chrome processes.");
  } catch {
    // Ignore — means no chrome processes were running
  }
}

/** Return true if any mcp-chrome-* profile has a Default/LOCK file present. */
function isBrowserLockPresent(): boolean {
  if (!existsSync(MCP_PROFILES_DIR)) return false;
  try {
    return readdirSync(MCP_PROFILES_DIR)
      .filter((d) => d.startsWith("mcp-chrome-"))
      .some((d) => existsSync(join(MCP_PROFILES_DIR, d, "Default", "LOCK")));
  } catch {
    return false;
  }
}

/** Remove stale Default/LOCK files from all mcp-chrome-* profile dirs.
 *  Only safe to call after Chrome has been killed. */
function clearStaleLocks(): void {
  if (!existsSync(MCP_PROFILES_DIR)) return;
  try {
    for (const dir of readdirSync(MCP_PROFILES_DIR).filter((d) =>
      d.startsWith("mcp-chrome-")
    )) {
      const lockPath = join(MCP_PROFILES_DIR, dir, "Default", "LOCK");
      if (existsSync(lockPath)) {
        try {
          rmSync(lockPath);
          console.log(`[playwright-mcp] Removed stale lock: ${lockPath}`);
        } catch {
          // File still held — Chrome kill may need a moment; proceed anyway
        }
      }
    }
  } catch {
    // Non-fatal
  }
}

/** Kill zombie Chrome and remove stale locks. Returns after a short settle. */
async function recoverBrowserLock(): Promise<void> {
  killZombieChrome();
  // Give the OS a moment to release file handles before removing lock files.
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  clearStaleLocks();
}

const LOCK_ERROR_PATTERNS = [
  "already in use",
  "browser is already",
  "LOCK",
  "user data dir",
];

function isLockError(err: unknown): boolean {
  const msg = (err as any)?.message ?? String(err);
  return LOCK_ERROR_PATTERNS.some((p) => msg.toLowerCase().includes(p.toLowerCase()));
}

// ─── Module-level state ───────────────────────────────────────────────────────

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

// ─── Bridge Initialization ────────────────────────────────────────────────────

async function startMcpBridge(pi: ExtensionAPI): Promise<void> {
  // Pre-flight: if a stale lock is already present, recover before connecting.
  if (isBrowserLockPresent()) {
    console.log("[playwright-mcp] Stale browser lock detected — recovering before connect…");
    await recoverBrowserLock();
  }

  // Attempt to connect — retry once on lock errors.
  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      // Create transport — spawns `playwright-mcp --headless` as a child process
      mcpTransport = new StdioClientTransport({
        command: "playwright-mcp",
        args: ["--headless"],
        stderr: "pipe",
      });

      // Create and connect the MCP client
      mcpClient = new Client({ name: "pi-playwright-bridge", version: "1.0.0" });
      await mcpClient.connect(mcpTransport);
      break; // success — exit retry loop
    } catch (err: unknown) {
      lastError = err;
      if (attempt === 1 && isLockError(err)) {
        console.log("[playwright-mcp] Connect failed with lock error — killing Chrome and retrying…");
        mcpClient = null;
        mcpTransport = null;
        await recoverBrowserLock();
        continue;
      }
      throw err; // non-lock error or second attempt — propagate
    }
  }
  if (!mcpClient) throw lastError;

  // Discover all available tools (handle pagination)
  const allTools: any[] = [];
  let cursor: string | undefined = undefined;
  do {
    const response = await mcpClient.listTools(cursor ? { cursor } : undefined);
    allTools.push(...response.tools);
    cursor = response.nextCursor;
  } while (cursor);

  // Register every discovered tool with Pi
  for (const tool of allTools) {
    const toolName = tool.name as string;
    const toolDescription = (tool.description as string) ?? toolName;
    const toolSchema = tool.inputSchema ?? { type: "object", properties: {} };

    pi.registerTool({
      name: toolName,
      label: toolName,
      description: toolDescription,
      parameters: Type.Unsafe<Record<string, unknown>>(toolSchema),

      execute: async (_toolCallId: string, params: Record<string, unknown>, _signal: AbortSignal | undefined, _onUpdate: any, _ctx: any) => {
        if (!mcpClient) {
          return {
            content: [{ type: "text" as const, text: `[playwright-mcp] Error: MCP client is not connected.` }],
          };
        }

        let result: any;
        try {
          result = await mcpClient.callTool({ name: toolName, arguments: params as Record<string, unknown> });
        } catch (err: unknown) {
          // If the tool fails with a lock error mid-session (e.g. Chrome crashed
          // after Pi started), kill the zombie, restart the bridge, and retry once.
          if (isLockError(err)) {
            console.log(`[playwright-mcp] Tool "${toolName}" hit lock error — recovering and retrying…`);
            try {
              await mcpClient.close().catch(() => {});
            } catch { /* ignore */ }
            mcpClient = null;
            mcpTransport = null;
            await recoverBrowserLock();
            try {
              await startMcpBridge(pi);
              result = await mcpClient!.callTool({ name: toolName, arguments: params as Record<string, unknown> });
            } catch (retryErr: unknown) {
              return {
                content: [{ type: "text" as const, text: `[playwright-mcp] Recovery failed for "${toolName}": ${(retryErr as any)?.message ?? String(retryErr)}` }],
              };
            }
          } else {
            return {
              content: [{ type: "text" as const, text: `[playwright-mcp] Tool call failed: ${(err as any)?.message ?? String(err)}` }],
            };
          }
        }

        // Process content items from the MCP result
        const contentItems: Array<{ type: "text"; text: string }> = [];

        for (const item of (result.content ?? []) as any[]) {
          if (item.type === "text") {
            // Plain text — pass through directly
            contentItems.push({ type: "text" as const, text: item.text as string });
          } else if (item.type === "image") {
            // Image content (e.g. screenshots) — encode as data URI in text
            // This is safe across all LLM providers regardless of image support
            const mimeType = (item.mimeType as string) ?? "image/png";
            const data = item.data as string;
            contentItems.push({
              type: "text" as const,
              text: `[screenshot]\ndata:${mimeType};base64,${data}`,
            });
          } else {
            // Unknown content type — stringify as fallback
            contentItems.push({
              type: "text" as const,
              text: JSON.stringify(item),
            });
          }
        }

        if (contentItems.length === 0) {
          contentItems.push({ type: "text" as const, text: `[playwright-mcp] Tool "${toolName}" completed with no output.` });
        }

        return { content: contentItems };
      },
    });
  }

  console.log(`[playwright-mcp] Registered ${allTools.length} browser tools.`);

  // ── Register with the shared MCP status registry ──────────────────────────
  registerMcpServer({
    id: "playwright-mcp",
    label: "Playwright MCP",
    status: "connected",
    tools: allTools.map((t) => t.name as string),
  });
}

// ─── Extension Entry Point ────────────────────────────────────────────────────

export default function playwrightMcpExtension(pi: ExtensionAPI) {

  // ─── Session Start: spawn MCP server and register tools ──────────────────

  pi.on("session_start", async (_event: any, _ctx: any) => {
    if (mcpClient) return; // already connected — guard against double-init

    try {
      await startMcpBridge(pi);
    } catch (err: any) {
      console.warn(
        "[playwright-mcp] Failed to start MCP bridge:",
        err?.message ?? String(err),
        "\nEnsure `playwright-mcp` is installed: npm install -g @playwright/mcp"
      );
      registerMcpServer({
        id: "playwright-mcp",
        label: "Playwright MCP",
        status: "error",
        error: err?.message ?? String(err),
        tools: [],
      });
      mcpClient = null;
      mcpTransport = null;
    }
  });

  // ─── Session Shutdown: close MCP connection cleanly ──────────────────────

  pi.on("session_shutdown", async (_event?: any) => {
    if (mcpClient) {
      await mcpClient.close().catch((err: any) => {
        console.warn("[playwright-mcp] Error during MCP client close:", err?.message ?? String(err));
      });
      unregisterMcpServer("playwright-mcp");
      mcpClient = null;
      mcpTransport = null;
    }
  });
}
