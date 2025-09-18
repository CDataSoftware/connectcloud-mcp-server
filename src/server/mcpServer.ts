import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { config } from 'dotenv';

config();

const server = new McpServer({
  name: 'CData Connect Cloud',
  version: '1.0.5',
  capabilities: {
    tools: {},
    prompts: {},
  },
});

export { server };
