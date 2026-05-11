import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "master-dash-mcp",
  version: "1.0.0",
});

// Example tool — replace with your dashboard tools
server.tool(
  "ping",
  { message: z.string().optional() },
  async ({ message }) => ({
    content: [{ type: "text", text: message ?? "pong" }],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
