import { config } from 'dotenv';
import { log, error } from './utils/logger';
import { setupTransport } from './transports';

// Declare a global variable to track the current request ID
declare global {
  var currentRequestId: string | number | null;
}
global.currentRequestId = null;

// Load environment variables from .env file
config();

// Force stdio transport for debugging
// This is temporary to fix the initialization issue
process.env.TRANSPORT = 'stdio';

// Start the server with the appropriate transport
setupTransport()
  .then(() => {
    log('MCP Server started successfully');
  })
  .catch((err) => {
    error(`Failed to start MCP server: ${err}`);
    process.exit(1);
  });