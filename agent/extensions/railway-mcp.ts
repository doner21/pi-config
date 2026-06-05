/**
 * Railway MCP Extension for Pi Code
 *
 * Spawns the Railway MCP server on session start and registers all its
 * Railway infrastructure tools into Pi's tool registry via pi.registerTool().
 *
 * The Railway MCP server communicates over stdio (JSON-RPC 2.0). This
 * extension uses @modelcontextprotocol/sdk to connect as an MCP client.
 *
 * Prerequisites:
 *   1. Railway CLI installed: npm install -g @railway/cli
 *   2. Railway CLI authenticated: railway login
 *   3. The @railway/mcp-server package (auto-fetched via npx)
 *
 * Tools provided by Railway MCP:
 *   - check-railway-status: Verify CLI installation and authentication
 *   - list-projects: List all projects
 *   - create-project-and-link: Create a project and link it to the current directory
 *   - list-services: List project services
 *   - link-service: Link a service to the current directory
 *   - deploy: Deploy a service
 *   - deploy-template: Deploy from the Railway Template Library
 *   - create-environment: Create a new environment
 *   - link-environment: Link environment to current directory
 *   - list-variables: List environment variables
 *   - set-variables: Set environment variables
 *   - generate-domain: Generate a Railway domain
 *   - get-logs: Retrieve service logs
 */

import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { registerMcpServer, unregisterMcpServer } from "./mcp-status.js";

// ─── Module-level state ───────────────────────────────────────────────────────

let mcpClient: Client | null = null;
let mcpTransport: StdioClientTransport | null = null;

// ─── Bridge Initialization ────────────────────────────────────────────────────

async function startMcpBridge(pi: ExtensionAPI): Promise<void> {
  // Create transport — spawns `railway mcp` as a child process
  // (Railway MCP is now bundled in the CLI itself; @railway/mcp-server is deprecated)
  mcpTransport = new StdioClientTransport({
    command: "railway",
    args: ["mcp"],
    stderr: "pipe",
  });

  // Create and connect the MCP client
  mcpClient = new Client({ name: "pi-railway-bridge", version: "1.0.0" });
  await mcpClient.connect(mcpTransport);

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

      execute: async (
        _toolCallId: string,
        params: Record<string, unknown>,
        _signal: AbortSignal | undefined,
        _onUpdate: any,
        _ctx: any,
      ) => {
        if (!mcpClient) {
          return {
            content: [
              {
                type: "text" as const,
                text: `[railway-mcp] Error: MCP client is not connected.`,
              },
            ],
          };
        }

        try {
          const result = await mcpClient.callTool({
            name: toolName,
            arguments: params as Record<string, unknown>,
          });

          // Process content items from the MCP result
          const contentItems: Array<{ type: "text"; text: string }> = [];

          for (const item of (result.content ?? []) as any[]) {
            if (item.type === "text") {
              contentItems.push({
                type: "text" as const,
                text: item.text as string,
              });
            } else if (item.type === "image") {
              const mimeType = (item.mimeType as string) ?? "image/png";
              const data = item.data as string;
              contentItems.push({
                type: "text" as const,
                text: `[railway-mcp image]\ndata:${mimeType};base64,${data}`,
              });
            } else {
              contentItems.push({
                type: "text" as const,
                text: JSON.stringify(item),
              });
            }
          }

          if (contentItems.length === 0) {
            contentItems.push({
              type: "text" as const,
              text: `[railway-mcp] Tool "${toolName}" completed.`,
            });
          }

          return { content: contentItems };
        } catch (err: unknown) {
          return {
            content: [
              {
                type: "text" as const,
                text: `[railway-mcp] Tool "${toolName}" failed: ${(err as any)?.message ?? String(err)}`,
              },
            ],
          };
        }
      },
    });
  }

  console.log(`[railway-mcp] Registered ${allTools.length} Railway tools.`);

  // ── Register with the shared MCP status registry ──────────────────────────
  registerMcpServer({
    id: "railway-mcp",
    label: "Railway MCP",
    status: "connected",
    tools: allTools.map((t) => t.name as string),
  });
}

// ─── Extension Entry Point ────────────────────────────────────────────────────

export default function railwayMcpExtension(pi: ExtensionAPI) {
  // ─── Session Start: spawn MCP server and register tools ──────────────────

  pi.on("session_start", async (_event: any, _ctx: any) => {
    if (mcpClient) return; // already connected — guard against double-init

    try {
      await startMcpBridge(pi);
    } catch (err: any) {
      console.warn(
        "[railway-mcp] Failed to start MCP bridge:",
        err?.message ?? String(err),
        "\nEnsure Railway CLI is installed and authenticated:",
        "\n  npm install -g @railway/cli",
        "\n  railway login",
      );
      registerMcpServer({
        id: "railway-mcp",
        label: "Railway MCP",
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
        console.warn(
          "[railway-mcp] Error during MCP client close:",
          err?.message ?? String(err),
        );
      });
      unregisterMcpServer("railway-mcp");
      mcpClient = null;
      mcpTransport = null;
    }
  });
}
