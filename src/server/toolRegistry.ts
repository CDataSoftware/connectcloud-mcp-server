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
import { getInstructions } from '../tools/instructions';

/**
 * Register all tools with the MCP server
 * @param server The MCP server instance
 */
export function registerTools(server: McpServer) {
  // Get Catalogs tool - START HERE FOR DATA DISCOVERY
  server.tool(
    'getCatalogs',
    'START HERE: Retrieve a list of available data source connections from CData Connect Cloud. This is typically the first step in data exploration unless you already know the specific connection/driver name. The connection names returned should be used as catalog names in subsequent tools. RECOMMENDED WORKFLOW: getCatalogs → getInstructions (for each driver) → getSchemas → getTables → getColumns → queryData.',
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

  // Get Instructions tool - USE AFTER IDENTIFYING DRIVERS
  server.tool(
    'getInstructions',
    'Retrieve driver-specific usage instructions and context for optimal query construction. Use this tool after identifying specific drivers from getCatalogs and before querying. This provides essential guidance about data models, schema hierarchies, query patterns, field naming conventions, time filtering approaches, and driver limitations. For multi-driver queries, call this tool for each driver involved to understand their specific characteristics.',
    {
      driverName: z
        .string()
        .describe(
          'The name of the driver to get instructions for. Use the catalog/connection name from getCatalogs (e.g., "azure-devops", "salesforce", "sharepoint").',
        ),
      connectionId: z.string().optional().describe('Optional connection ID for additional context'),
    },
    async ({ driverName, connectionId }) => {
      try {
        const response = await getInstructions(driverName, connectionId);
        if (response.error) {
          return {
            content: [{ type: 'text', text: `Error: ${response.error.message}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: 'text', text: JSON.stringify(response.result, null, 2) }],
        };
      } catch (error: unknown) {
        const errorObj = error as Error;
        return {
          content: [{ type: 'text', text: `Error: ${errorObj.message}` }],
          isError: true,
        };
      }
    },
  );

  // Query Data tool - ENHANCED WITH MULTI-DRIVER WORKFLOW
  server.tool(
    'queryData',
    'Execute SQL queries against connected data sources and retrieve results. IMPORTANT WORKFLOW: Start with getCatalogs to identify available connections/drivers, then use getInstructions for each driver involved in your query to understand their specific patterns and limitations. For cross-driver queries, ensure you understand the schema structures and field naming conventions of all involved drivers through their respective getInstructions output.',
    {
      query: z
        .string()
        .describe(
          'The SQL statement(s) to execute. Separate multiple statements with semi-colons. Apply driver-specific patterns from getInstructions for optimal results. For cross-driver queries, use fully qualified table names (catalog.schema.table).',
        ),
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

  // Execute Data tool - ENHANCED WITH MULTI-DRIVER GUIDANCE
  server.tool(
    'execData',
    'Execute stored procedures against connected data sources. Use getInstructions for the target driver to understand procedure conventions and parameter requirements before execution.',
    {
      procedure: z
        .string()
        .describe(
          'The name of the stored procedure to execute. Use fully qualified names (catalog.schema.procedure) for clarity.',
        ),
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

  // Get Catalogs tool - START HERE FOR DATA DISCOVERY
  server.tool(
    'getCatalogs',
    'Retrieve a list of available data source connections from CData Connect Cloud. The connection names returned should be used as catalog names in other tools and queries. RECOMMENDED WORKFLOW: After identifying your target catalog, use getInstructions with the catalog name to understand driver-specific guidance, then use getSchemas to explore the data structure.',
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

  // Get Schemas tool - ENHANCED WITH WORKFLOW GUIDANCE
  server.tool(
    'getSchemas',
    'Retrieve a list of available database schemas from CData Connect Cloud for a specific catalog. Use getTables to explore tables within each schema. TIP: Some drivers have hierarchical schema naming patterns (e.g., Project_<name> in Azure DevOps) - check getInstructions for driver-specific schema conventions.',
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

  // Get Tables tool - ENHANCED WITH WORKFLOW GUIDANCE
  server.tool(
    'getTables',
    'Retrieve a list of available database tables from CData Connect Cloud for a specific catalog and schema. Use getColumns to inspect table structure before querying. TIP: Some drivers have specific table naming patterns or key tables - check getInstructions for driver-specific table guidance.',
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

  // Get Columns tool - ENHANCED WITH FIELD GUIDANCE
  server.tool(
    'getColumns',
    'Retrieve detailed column metadata from CData Connect Cloud for specific tables. This shows data types, nullable status, and other column properties essential for query construction. TIP: Different drivers have varying field naming conventions (e.g., CreatedById vs CreatedByDisplayName) - check getInstructions for driver-specific field patterns.',
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

  // Get Primary Keys tool - ENHANCED DESCRIPTION
  server.tool(
    'getPrimaryKeys',
    'Retrieve primary key information for tables. This is essential for understanding table relationships and constructing efficient JOIN queries.',
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

  // Get Exported Keys tool - ENHANCED DESCRIPTION
  server.tool(
    'getExportedKeys',
    'Retrieve foreign key relationships where this table is referenced by other tables. Use this to understand how tables relate to each other and construct proper JOIN queries.',
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

  // Get Imported Keys tool - ENHANCED DESCRIPTION
  server.tool(
    'getImportedKeys',
    'Retrieve foreign key relationships where this table references other tables. Essential for understanding data dependencies and constructing accurate JOIN queries.',
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

  // Get Indexes tool - ENHANCED DESCRIPTION
  server.tool(
    'getIndexes',
    'Retrieve index information for tables. This helps understand query performance characteristics and available optimization opportunities.',
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

  // Get Procedure Parameters tool - ENHANCED DESCRIPTION
  server.tool(
    'getProcedureParameters',
    'Retrieve parameter details for stored procedures, including data types, direction (input/output), and whether parameters are required. Essential for proper procedure execution.',
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

  // Get Procedures tool - ENHANCED DESCRIPTION
  server.tool(
    'getProcedures',
    'Retrieve available stored procedures for a catalog and schema. Use getProcedureParameters to understand parameter requirements before execution.',
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
}
