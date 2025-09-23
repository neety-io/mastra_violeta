import { MCPClient } from "@mastra/mcp";
import path from "path";
 
// Configure MCPClient to connect to your server(s)
export const mcp = new MCPClient({
  servers: {
    brightdata: {
      url: new URL("http://localhost:8080/mcp"), //Para solucionar error de lectura de env
    },
  },
});