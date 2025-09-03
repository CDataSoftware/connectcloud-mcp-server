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
  // Query Data tool
  server.tool(
    'queryData',
    '🚨 CRITICAL: Before executing any queries, you MUST first call getInstructions to understand the driver-specific data model, required catalogs, schemas, table structures, field naming conventions, query patterns, and critical limitations. Failure to read instructions first will result in failed queries. This tool executes SQL queries against connected data sources only AFTER proper preparation.',
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
    '🔍 This tool retrieves available connections from CData Connect Cloud. The connection names should be used as catalog names in other tools and queries. ⚠️ IMPORTANT: After getting catalogs, you MUST call getInstructions with the specific driver name to understand the data model, required workflows, and proper access patterns before proceeding with other metadata tools or queries.',
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
    '⚠️ IMPORTANT: Before using this tool, you MUST first call getInstructions to understand the driver-specific data model, field conventions, and column naming patterns. The getInstructions tool contains essential prerequisites including which catalogs, schemas, and tables to use, and provides complete column specifications when available. Only use this tool AFTER reading the instructions.',
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
    '⚠️ IMPORTANT: Before using this tool, you MUST first call getInstructions to understand the driver-specific data model and required workflows. The getInstructions tool contains essential prerequisites and tells you which catalogs to use and how to properly navigate the schema hierarchy. Only use this tool AFTER reading the instructions for proper schema discovery.',
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
    '⚠️ IMPORTANT: Before using this tool, you MUST first call getInstructions to understand the driver-specific data model, required workflows, and table hierarchy. The getInstructions tool contains essential prerequisites and tells you which catalogs and schemas to use. Only use this tool AFTER reading the instructions for proper table discovery and access patterns.',
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

  // Get Instructions tool
  server.tool(
    'getInstructions',
    '🚨 CRITICAL FIRST STEP: This tool MUST be called FIRST before any other tools to retrieve essential driver-specific instructions, data model hierarchy, required workflows, and critical limitations. This tool tells you which subsequent tools to call and in what order. The instructions contain mandatory prerequisites that prevent errors and ensure proper data access patterns. Failure to read these instructions first will result in failed queries and incorrect approaches.',
    {
      driverName: z
        .string()
        .optional()
        .describe(
          'The name of the driver to get instructions for (e.g., "Azure DevOps", "Salesforce", "SharePoint"). If not provided, generic instructions will be returned.',
        ),
      connectionId: z
        .string()
        .optional()
        .describe(
          'Optional connection ID for additional context. This helps with tracking and may provide connection-specific guidance in future versions.',
        ),
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

        const instructions = response.result.instructions;
        const formattedInstructions = `
🚨🚨 CRITICAL INSTRUCTIONS - READ FIRST BEFORE ANY OTHER ACTIONS 🚨🚨

# ${response.result.driverName.toUpperCase()} Driver Instructions

⚠️ MANDATORY: These instructions contain essential prerequisites that MUST be followed before executing any queries or calling other tools. Ignoring these instructions will result in failed operations.

## 📋 REQUIRED READING BEFORE PROCEEDING
${instructions.limitationsNote || 'Please read all sections carefully before proceeding.'}

## 🎯 Overview
${instructions.overview || 'No overview provided.'}

## 📝 MANDATORY STEP-BY-STEP PROCESS
${instructions.stepByStepProcess ? Object.entries(instructions.stepByStepProcess).map(([key, step]: [string, any]) => 
`### ${step.title}
${step.description}
${step.action ? `**Action**: ${step.action}` : ''}
${step.query ? `**Query**: \`${step.query}\`` : ''}
${step.methods ? step.methods.map((method: any) => `- **${method.method}**: \`${method.query}\``).join('\n') : ''}
${step.parameters ? `**Parameters**: ${JSON.stringify(step.parameters, null, 2)}` : ''}
`).join('\n') : 'No step-by-step process defined.'}

## 📊 Data Model & Hierarchy (CRITICAL FOR QUERY SUCCESS)
${instructions.dataModel ? `
${instructions.dataModel.hierarchy}

### �️ How and When to Use Tables:
${instructions.dataModel.howAndWhenToUseTables ? 
  Object.entries(instructions.dataModel.howAndWhenToUseTables).map(([table, description]) => `• **${table}**: ${description}`).join('\n') : 
  instructions.dataModel.keyTables ? instructions.dataModel.keyTables.map((table: string) => `• ${table}`).join('\n') : 'No key tables specified'}

### 🔗 Relationships:
${instructions.dataModel.relationships || 'No relationships specified'}
` : 'No data model information provided.'}

## 🔍 Common Query Patterns

### ⏰ Time-based Filtering:
${instructions.queryPatterns ? instructions.queryPatterns.timeFiltering || 'No time filtering guidance provided.' : 'No query patterns provided.'}

### 📚 Example Queries (USE THESE AS TEMPLATES):
${instructions.queryPatterns && instructions.queryPatterns.commonQueries ? 
  instructions.queryPatterns.commonQueries.map((query: string) => `\`\`\`sql\n${query}\n\`\`\``).join('\n\n') : 
  'No example queries provided.'}

### ✅ MANDATORY Best Practices:
${instructions.queryPatterns && instructions.queryPatterns.bestPractices ? 
  instructions.queryPatterns.bestPractices.map((practice: string) => `• ${practice}`).join('\n') : 
  'No best practices provided.'}

## 🏷️ Field Conventions (IMPORTANT FOR PROPER QUERIES)
${instructions.fieldConventions ? 
  Object.entries(instructions.fieldConventions).map(([key, value]) => `**${key}**: ${value}`).join('\n\n') : 
  'No field conventions provided.'}

## 🚫 CRITICAL Limitations (READ CAREFULLY)
${instructions.limitations ? 
  instructions.limitations.map((limitation: string) => `❌ ${limitation}`).join('\n') : 
  'No limitations specified.'}

## 🔧 Troubleshooting Guide
${instructions.troubleshooting ? 
  instructions.troubleshooting.map((tip: string) => `🛠️ ${tip}`).join('\n') : 
  'No troubleshooting information provided.'}

🚨 REMINDER: You MUST follow these instructions and use the specified tools in the correct order before attempting any queries!

---
*Last updated: ${response.result.lastUpdated}*
*Driver: ${driverName || response.result.driverName || 'Not specified'}*
         `.trim();
   
         return {
           content: [{ type: 'text', text: formattedInstructions }],
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
