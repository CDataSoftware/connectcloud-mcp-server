import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { queryData, execData } from '../tools/query';
import {
  getCatalogs,
  getColumns,
  getExportedKeys,
  getImportedKeys,
  getIndexes,
  getPrimaryKeys,
  getProcedures,
  getProcedureParameters,
  getSchemas,
  getTables,
} from '../tools/metadata';

/**
 * Register all tools with the MCP server
 * @param server The MCP server instance
 */
export function registerTools(server: McpServer) {
  // Query Data tool
  server.tool(
    'queryData',
    'Execute SQL queries against connected data sources and retrieve results',
    {
      query: z
        .string()
        .describe('The SQL statement(s) to execute. Separate multiple statements with semi-colons'),
      defaultSchema: z
        .string()
        .optional()
        .describe('Schema to use if tables are not prefixed with a schema name'),
      schemaOnly: z
        .boolean()
        .optional()
        .describe('If true, the result only includes column metadata'),
      parameters: z
        .record(z.any())
        .optional()
        .describe(
          'A JSON object containing a list of query parameters. All parameter names must begin with @',
        ),
    },
    async ({ query, defaultSchema, schemaOnly, parameters }) => {
      try {
        const response = await queryData(query, defaultSchema, schemaOnly, parameters);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Execute Data tool
  server.tool(
    'execData',
    'Execute stored procedures against connected data sources',
    {
      procedure: z.string().describe('The name of the stored procedure to execute'),
      defaultSchema: z
        .string()
        .optional()
        .describe('Schema to use if the procedure is not prefixed with a schema name'),
      parameters: z
        .record(z.any())
        .optional()
        .describe(
          'A JSON object containing procedure parameters. All parameter names must begin with @',
        ),
    },
    async ({ procedure, defaultSchema, parameters }) => {
      try {
        const response = await execData(procedure, defaultSchema, parameters);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Catalogs tool
  server.tool(
    'getCatalogs',
    'Retrieve a list of available connections from CData Connect Cloud.  The connection names should be used as catalog names in other tools and in any queries to CData Connect Cloud. Use the `getSchemas` tool to get a list of available schemas for a specific catalog.',
    {},
    async () => {
      try {
        const response = await getCatalogs();
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Columns tool
  server.tool(
    'getColumns',
    'Retrieve a list of available database columns from CData Connect Cloud for a specific catalog, schema, and table',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter columns by'),
      schemaName: z.string().optional().describe('Optional schema name to filter columns by'),
      tableName: z.string().optional().describe('Optional table name to filter columns by'),
      columnName: z.string().optional().describe('Optional column name to filter by'),
    },
    async ({ catalogName, schemaName, tableName, columnName }) => {
      try {
        const response = await getColumns(catalogName, schemaName, tableName, columnName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Exported Keys tool
  server.tool(
    'getExportedKeys',
    'Retrieve a list of foreign key relationships from CData Connect Cloud for a specific catalog, schema, and table',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter keys by'),
      schemaName: z.string().optional().describe('Optional schema name to filter keys by'),
      tableName: z.string().optional().describe('Optional table name to filter by'),
    },
    async ({ catalogName, schemaName, tableName }) => {
      try {
        const response = await getExportedKeys(catalogName, schemaName, tableName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Imported Keys tool
  server.tool(
    'getImportedKeys',
    'Retrieve a list of foreign key relationships from CData Connect Cloud for a specific catalog, schema, and table',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter keys by'),
      schemaName: z.string().optional().describe('Optional schema name to filter keys by'),
      tableName: z.string().optional().describe('Optional table name to filter by'),
    },
    async ({ catalogName, schemaName, tableName }) => {
      try {
        const response = await getImportedKeys(catalogName, schemaName, tableName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Indexes tool
  server.tool(
    'getIndexes',
    'Retrieve a list of indexes from CData Connect Cloud for a specific catalog, schema, and table',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter indexes by'),
      schemaName: z.string().optional().describe('Optional schema name to filter indexes by'),
      tableName: z.string().optional().describe('Optional table name to filter by'),
    },
    async ({ catalogName, schemaName, tableName }) => {
      try {
        const response = await getIndexes(catalogName, schemaName, tableName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Primary Keys tool
  server.tool(
    'getPrimaryKeys',
    'Retrieve a list of primary keys from CData Connect Cloud for a specific catalog, schema, and table',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter keys by'),
      schemaName: z.string().optional().describe('Optional schema name to filter keys by'),
      tableName: z.string().optional().describe('Optional table name to filter by'),
    },
    async ({ catalogName, schemaName, tableName }) => {
      try {
        const response = await getPrimaryKeys(catalogName, schemaName, tableName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Procedure Parameters tool
  server.tool(
    'getProcedureParameters',
    'Retrieve a list of stored procedure parameters from CData Connect Cloud for a specific catalog, schema, and procedure',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter parameters by'),
      schemaName: z.string().optional().describe('Optional schema name to filter parameters by'),
      procedureName: z
        .string()
        .optional()
        .describe('Optional procedure name to filter parameters by'),
      parameterName: z.string().optional().describe('Optional parameter name to filter by'),
    },
    async ({ catalogName, schemaName, procedureName, parameterName }) => {
      try {
        const response = await getProcedureParameters(
          catalogName,
          schemaName,
          procedureName,
          parameterName,
        );
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Procdures tool
  server.tool(
    'getProcedures',
    'Retrieve a list of stored procedures from CData Connect Cloud for a specific catalog and schema',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter procedures by'),
      schemaName: z.string().optional().describe('Optional schema name to filter procedures by'),
      procedureName: z.string().optional().describe('Optional procedure name to filter by'),
    },
    async ({ catalogName, schemaName, procedureName }) => {
      try {
        const response = await getProcedures(catalogName, schemaName, procedureName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Schemas tool
  server.tool(
    'getSchemas',
    'Retrieve a list of available database schemas from CData Connect Cloud for a specific catalog.  Use the `getTables` tool to get a list of available tables for a specific catalog and schema.',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter schemas by'),
    },
    async ({ catalogName }) => {
      try {
        const response = await getSchemas(catalogName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );

  // Get Tables tool
  server.tool(
    'getTables',
    'Retrieve a list of available database tables from CData Connect Cloud for a specific catalog and schema.  Use the `getColumns` tool to get a list of available columns for a specific table.',
    {
      catalogName: z.string().optional().describe('Optional catalog name to filter tables by'),
      schemaName: z.string().optional().describe('Optional schema name to filter tables by'),
      tableName: z.string().optional().describe('Optional table name to filter by'),
    },
    async ({ catalogName, schemaName, tableName }) => {
      try {
        const response = await getTables(catalogName, schemaName, tableName);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: any) {
        return {
          content: [{ type: 'text', text: `Error: ${error.message}` }],
          isError: true,
        };
      }
    },
  );
}
