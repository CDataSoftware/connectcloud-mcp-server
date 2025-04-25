import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { debug, error, info } from '../utils/logger';
import { server } from '../server/mcpServer';

/**
 * Initialize and connect the stdio transport to the MCP server
 */
export async function setupStdioTransport() {
  error("Starting MCP server with stdio transport");
  
  const transport = new StdioServerTransport();
  
  // Add debug event listeners
  process.stdin.on('data', (data) => {
    debug(`Received stdin data: ${data.toString().trim()}`);
    
    // Try to parse the incoming data to extract the request ID
    try {
      const parsed = JSON.parse(data.toString().trim());
      if (parsed && parsed.id) {
        global.currentRequestId = parsed.id;
        debug(`Set currentRequestId to ${global.currentRequestId}`);
      }
    } catch (err) {
      debug("Failed to parse stdin data as JSON");
    }
  });
  
  process.stdin.on('error', (err) => {
    error(`stdin error: ${err.message}`);
  });
  
  try {
    await server.connect(transport);
    info(`MCP Server connected using stdio transport`);
    return true;
  } catch (err: any) {
    error(`Failed to connect server with stdio transport: ${err.message}`);
    return false;
  }
}