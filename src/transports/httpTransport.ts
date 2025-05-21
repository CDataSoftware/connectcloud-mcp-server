import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { log, error, info, debug } from '../utils/logger';
import { server } from '../server/mcpServer';
import { createDirectHandler } from '../http/routes';

/**
 * Set up an HTTP server with StreamableHTTP transport for MCP
 * @param port The port to listen on
 * @param host The host to bind to
 * @returns The Express app instance
 */
export async function setupHttpTransport(port: number, host: string) {
  info(`Starting MCP server with HTTP transport on ${host}:${port}`);

  const app = express();
  app.use(express.json());

  // Add error handling middleware for JSON parsing errors
  app.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof SyntaxError && 'body' in err) {
      error(`JSON parsing error: ${err.message}`);
      return res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error: Invalid JSON',
        },
        id: null,
      });
    }
    next();
  });

  // Add middleware to extract and store the request ID
  app.use((req: any, res: any, next: any) => {
    if (req.body && req.body.id) {
      global.currentRequestId = req.body.id;
      debug(`Set currentRequestId to ${global.currentRequestId} for request`);
    }
    next();
  });

  // Serve manifest file for MCP discovery
  app.get('/.well-known/mc/manifest.json', (req, res) => {
    res.json({
      name: 'CData Connect Cloud',
      version: '1.0.5',
      transport: 'streamable-http',
      endpoint: '/mcp',
      auth: 'none',
    });
  });

  // Direct handler for JSON-RPC requests without requiring session management
  app.post('/direct', createDirectHandler());

  // Create a map to store transports by session ID
  const transports: Record<string, StreamableHTTPServerTransport> = {};

  // Handle POST requests for client-to-server communication with MCP
  app.post('/mcp', async (req, res) => {
    try {
      log(`Received request to /mcp: ${JSON.stringify(req.body)}`);

      // Store request ID for downstream handlers
      if (req.body && req.body.id) {
        global.currentRequestId = req.body.id;
        log(`Set current request ID to: ${global.currentRequestId}`);
      }

      // Check for existing session ID
      const sessionId = req.headers['mcp-session-id'] as string | undefined;
      log(`Session ID from request: ${sessionId}`);

      let transport: StreamableHTTPServerTransport;

      if (sessionId && transports[sessionId]) {
        log(`Using existing transport for session ${sessionId}`);
        // Reuse existing transport
        transport = transports[sessionId];
      } else if (!sessionId) {
        log(`No session ID provided, creating new transport`);
        // New session for standard MCP clients
        transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: () => {
            const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
            log(`Generated new session ID: ${id}`);
            return id;
          },
          onsessioninitialized: newSessionId => {
            log(`Session initialized with ID: ${newSessionId}`);
            // Store the transport by session ID
            transports[newSessionId] = transport;
          },
        });

        // Clean up transport when closed
        transport.onclose = () => {
          if (transport.sessionId) {
            log(`Cleaning up session ${transport.sessionId}`);
            delete transports[transport.sessionId];
          }
        };

        // Connect to the MCP server
        try {
          log(`Connecting transport to MCP server`);
          await server.connect(transport);
          log(`Transport connected successfully`);
        } catch (err: any) {
          error(`Failed to connect transport to server: ${err.message}`);
          res.status(500).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: `Failed to initialize transport: ${err.message}`,
            },
            id: req.body?.id || null,
          });
          return;
        }
      } else {
        log(`Invalid session ID provided: ${sessionId}`);
        // Invalid session ID
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: Invalid session ID provided',
          },
          id: req.body?.id || null,
        });
        return;
      }

      // Handle the request
      log(`Handling request with transport`);
      await transport.handleRequest(req, res, req.body);
      log(`Request handled successfully`);
    } catch (err: any) {
      error(`Error in /mcp endpoint: ${err}`);
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: `Internal server error: ${err.message}`,
        },
        id: req.body?.id || null,
      });
    }
  });

  // Handler for GET and DELETE requests (for SSE and session termination)
  const handleSessionRequest = async (req: express.Request, res: express.Response) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const transport = transports[sessionId];
    await transport.handleRequest(req, res);
  };

  // Handle GET requests for SSE
  app.get('/mcp', handleSessionRequest);

  // Handle DELETE requests for session termination
  app.delete('/mcp', handleSessionRequest);

  // Add a simple health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Start the Express server
  app.listen(port, host, () => {
    info(`MCP Server listening on http://${host}:${port}`);
    info(`Direct endpoint available at http://${host}:${port}/direct`);
  });

  return app;
}
