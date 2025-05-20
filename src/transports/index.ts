import { setupStdioTransport } from './stdioTransport';
import { setupHttpTransport } from './httpTransport';
import { info } from '../utils/logger';
import { registerTools } from '../server/toolRegistry';
import { server } from '../server/mcpServer';

/**
 * Set up the appropriate transport based on environment configuration
 */
export async function setupTransport() {
  // Register all tools with the MCP server
  registerTools(server);

  // Choose and set up the appropriate transport based on environment configuration
  const port = parseInt(process.env.PORT || '3000');
  const host = process.env.HOST || 'localhost';
  const transportType = process.env.TRANSPORT_TYPE || 'stdio';

  // If using as a CLI tool with stdio
  if (transportType === 'stdio') {
    info('Using stdio transport as specified in environment');
    return setupStdioTransport();
  } else {
    info(`Using HTTP transport on ${host}:${port}`);
    return setupHttpTransport(port, host);
  }
}
