import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { json, object } from "zod/v4";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "Authless Calculator",
		version: "1.0.0",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"catalogo",
			"return all technological products within the store ",
			{ 	 
			},
			async () => ({
				content: [{ 
					type: "text", text: JSON.stringify({
						"catalogo": [
						  {
							"categoria": "Computadores Portátiles",
							"productos": [
							  { "nombre": "Laptop Dell XPS 13", "precio": 1199.99, "cantidad": 15 },
							  { "nombre": "MacBook Air M2", "precio": 1299.00, "cantidad": 10 },
							  { "nombre": "Lenovo ThinkPad X1 Carbon", "precio": 1499.50, "cantidad": 8 },
							  { "nombre": "HP Pavilion 15", "precio": 849.99, "cantidad": 20 }
							]
						  },
						  {
							"categoria": "Computadores de Escritorio",
							"productos": [
							  { "nombre": "PC Gamer ASUS ROG Strix", "precio": 1799.00, "cantidad": 5 },
							  { "nombre": "iMac 24” M3", "precio": 1599.00, "cantidad": 7 },
							  { "nombre": "HP Envy Desktop", "precio": 1099.00, "cantidad": 12 },
							  { "nombre": "Mini PC Intel NUC 13", "precio": 699.00, "cantidad": 18 }
							]
						  },
						  {
							"categoria": "Monitores",
							"productos": [
							  { "nombre": "Monitor Samsung Odyssey G5 32”", "precio": 349.99, "cantidad": 25 },
							  { "nombre": "LG UltraFine 27” 4K", "precio": 499.00, "cantidad": 15 },
							  { "nombre": "Dell 24” IPS", "precio": 179.99, "cantidad": 30 }
							]
						  },
						  {
							"categoria": "Periféricos",
							"productos": [
							  { "nombre": "Teclado Mecánico Logitech G Pro X", "precio": 149.99, "cantidad": 40 },
							  { "nombre": "Mouse Gamer Razer DeathAdder V3", "precio": 89.99, "cantidad": 50 },
							  { "nombre": "Audífonos HyperX Cloud II", "precio": 99.99, "cantidad": 35 },
							  { "nombre": "Webcam Logitech C920 HD Pro", "precio": 79.99, "cantidad": 22 }
							]
						  },
						  {
							"categoria": "Almacenamiento y Accesorios",
							"productos": [
							  { "nombre": "Disco SSD Samsung 970 EVO Plus 1TB", "precio": 109.99, "cantidad": 60 },
							  { "nombre": "Disco Duro Externo Seagate 2TB", "precio": 79.99, "cantidad": 45 },
							  { "nombre": "Memoria USB Kingston 128GB", "precio": 19.99, "cantidad": 80 },
							  { "nombre": "Hub USB-C Anker 7 en 1", "precio": 59.99, "cantidad": 25 }
							]
						  },
						  {
							"categoria": "Componentes",
							"productos": [
							  { "nombre": "Tarjeta Gráfica NVIDIA RTX 4070 Ti", "precio": 799.00, "cantidad": 9 },
							  { "nombre": "Procesador Intel Core i7-13700K", "precio": 419.00, "cantidad": 14 },
							  { "nombre": "Placa Madre ASUS Prime Z790", "precio": 249.00, "cantidad": 11 },
							  { "nombre": "Memoria RAM Corsair Vengeance 32GB DDR5", "precio": 159.99, "cantidad": 26 }
							]
						  }
						]
					  }
						
					)
						
				}],
			})
		);

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
