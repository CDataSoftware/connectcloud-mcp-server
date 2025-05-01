import express from 'express';
import { log, error } from '../utils/logger';
import { queryData, execData } from '../tools/query';
import { getCatalogs, getColumns, getSchemas, getTables } from '../tools/metadata';

/**
 * Create the handler for direct JSON-RPC requests
 * These requests bypass the MCP transport system for simple API calls
 */
export function createDirectHandler() {
  return (req: express.Request, res: express.Response) => {
    (async () => {
      try {
        log(`Received direct request: ${JSON.stringify(req.body)}`);

        // Basic validation for JSON-RPC
        if (!req.body || req.body.jsonrpc !== '2.0' || !req.body.method) {
          return res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32600,
              message: 'Invalid Request: Not a valid JSON-RPC 2.0 request',
            },
            id: req.body?.id || null,
          });
        }

        const { method, params, id } = req.body;
        global.currentRequestId = id; // Store the ID for this request
        log(`Processing direct request for method: ${method} with ID: ${id}`);

        // Handle methods directly based on the method name
        // This bypasses the MCP transport system for simple requests
        let result;
        try {
          switch (method) {
            case 'getCatalogs':
              result = await getCatalogs();
              break;
            case 'getSchemas':
              result = await getSchemas(params?.catalogName);
              break;
            case 'getTables':
              result = await getTables(params?.catalogName, params?.schemaName, params?.tableName);
              break;
            case 'getColumns':
              result = await getColumns(
                params?.catalogName,
                params?.schemaName,
                params?.tableName,
                params?.columnName,
              );
              break;
            case 'queryData':
              result = await queryData(
                params.query,
                params?.defaultSchema,
                params?.schemaOnly,
                params?.parameters,
              );
              break;
            case 'execData':
              result = await execData(params.procedure, params?.defaultSchema, params?.parameters);
              break;
            default:
              throw new Error(`Method '${method}' not found`);
          }

          log(`Success for method ${method}`);
          return res.json({
            jsonrpc: '2.0',
            result,
            id,
          });
        } catch (err: any) {
          error(`Error processing method ${method}: ${err.message}`);
          return res.json({
            jsonrpc: '2.0',
            error: {
              code: -32603,
              message: `Internal error: ${err.message}`,
            },
            id,
          });
        }
      } catch (err: any) {
        error(`Unexpected error in direct handler: ${err}`);
        return res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: `Server error: ${err.message}`,
          },
          id: null,
        });
      }
    })();
  };
}
