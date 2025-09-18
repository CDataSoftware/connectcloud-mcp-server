#!/usr/bin/env node

import { config } from 'dotenv';
import { log, error } from './utils/logger';
import { setupTransport } from './transports';

// Declare a global variable to track the current request ID
declare global {
  // eslint-disable-next-line no-var
  var currentRequestId: string | number | null;
}
global.currentRequestId = null;

// Load environment variables from .env file
config();

// Start the server with the appropriate transport
setupTransport()
  .then(() => {
    log('MCP Server started successfully');
  })
  .catch(err => {
    error(`Failed to start MCP server: ${err}`);
    process.exit(1);
  });
