import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"add",
			"Adds two numbers and returns the result as text.",
			{ 	
				a: z.number().describe("Primer número a sumar"),
				b: z.number().describe("Segundo número a sumar") 
			},
			async ({ a, b }) => ({
				content: [{ type: "text", text: String(a + b) 
			}],
		}));

		// Calculator tool with multiple operations
		this.server.tool(
			"calculate",
			"Adds two numbers and returns the result as text.",
			{
				operation: z.enum(["add", "subtract", "multiply", "divide"]).describe("Tipo de operación aritmética a realizar"),
				a: z.number().describe("Primer número"),
				b: z.number().describe("Segundo número"),
			},
			async ({ operation, a, b }) => {
				let result: number;
				switch (operation) {
					case "add":
						result = a + b;
						break;
					case "subtract":
						result = a - b;
						break;
					case "multiply":
						result = a * b;
						break;
					case "divide":
						if (b === 0)
							return {
								content: [
									{
										type: "text",
										text: "Error: Cannot divide by zero",
									},
								],
							};
						result = a / b;
						break;
				}
				return { content: [{ type: "text", text: String(result) }] };
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
