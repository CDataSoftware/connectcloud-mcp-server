import { error, debug } from '../utils/logger';

/**
 * Prompt interface following MCP specification
 */
export interface MCPPrompt {
  name: string; // Unique identifier for the prompt
  description?: string; // Human-readable description
  arguments?: {
    name: string; // Argument identifier
    description?: string; // Argument description
    required?: boolean; // Whether argument is required
  }[];
}

/**
 * Database query best practices prompts
 */
const DATABASE_PROMPTS: Record<string, MCPPrompt> = {
  'limit-results': {
    name: 'limit-results',
    description: 'Get guidance on limiting result sets when querying databases',
    arguments: [],
  },
  'explore-schema': {
    name: 'explore-schema',
    description: 'Get workflow for exploring an unfamiliar database schema',
    arguments: [],
  },
  pagination: {
    name: 'pagination',
    description: 'Get patterns for implementing pagination with SQL queries',
    arguments: [
      {
        name: 'dialect',
        description: 'SQL dialect (mysql, postgresql, sqlserver)',
        required: false,
      },
    ],
  },
  'parameterized-queries': {
    name: 'parameterized-queries',
    description: 'Get guidance on using parameters in SQL queries to prevent SQL injection',
    arguments: [],
  },
  'handle-results': {
    name: 'handle-results',
    description: 'Get strategies for handling empty or large result sets',
    arguments: [],
  },
  'error-handling': {
    name: 'error-handling',
    description: 'Get troubleshooting steps for database query errors',
    arguments: [],
  },
};

/**
 * Get all available prompts
 * @returns List of available prompts
 */
export function getPrompts(): MCPPrompt[] {
  debug('Retrieving all available prompts');
  return Object.values(DATABASE_PROMPTS);
}

/**
 * Get a specific prompt by name
 * @param name - Prompt name to retrieve
 * @returns The prompt if found, or undefined if not found
 */
export function getPromptByName(name: string): MCPPrompt | undefined {
  debug(`Retrieving prompt with name: ${name}`);
  return DATABASE_PROMPTS[name];
}

/**
 * Generate prompt messages based on the prompt name and arguments
 * @param name - Prompt name
 * @param args - Prompt arguments
 * @returns Array of messages for the prompt
 */
export function generatePromptMessages(
  name: string,
  args: Record<string, any> = {},
): Array<{ role: string; content: { type: string; text: string } }> {
  debug(`Generating messages for prompt: ${name} with args: ${JSON.stringify(args)}`);

  switch (name) {
    case 'limit-results':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'Provide guidance on limiting result sets when querying databases to prevent excessive data retrieval.',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Result Set Limiting
When using the \`queryData\` tool, always include LIMIT/TOP clauses in your queries to prevent excessive result sets. For example:
\`\`\`sql
SELECT * FROM table_name LIMIT 10;
-- or for SQL Server
SELECT TOP 10 * FROM table_name;
\`\`\`
Limiting results to 10-20 rows is recommended unless specifically instructed otherwise.`,
          },
        },
      ];

    case 'explore-schema':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: "What's the recommended workflow for exploring an unfamiliar database schema?",
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Schema Exploration Workflow
Before querying an unfamiliar database:
1. Use \`getCatalogs\` to identify available data sources
2. Use \`getSchemas\` with the relevant catalog to find available schemas
3. Use \`getTables\` to discover tables within the schema of interest
4. Use \`getColumns\` to understand the structure of specific tables`,
          },
        },
      ];

    case 'pagination':
      const dialect = args.dialect || 'standard';
      let paginationExample;

      if (dialect === 'sqlserver') {
        paginationExample = `-- SQL Server pagination (2012+)
-- Initial query
SELECT * FROM table_name ORDER BY id OFFSET 0 ROWS FETCH NEXT 10 ROWS ONLY;

-- Subsequent queries
SELECT * FROM table_name ORDER BY id OFFSET 10 ROWS FETCH NEXT 10 ROWS ONLY;`;
      } else {
        paginationExample = `-- Standard SQL pagination
-- Initial query
SELECT * FROM table_name ORDER BY id LIMIT 10 OFFSET 0;

-- Subsequent queries
SELECT * FROM table_name ORDER BY id LIMIT 10 OFFSET 10;`;
      }

      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Provide patterns for implementing pagination with SQL queries for ${dialect} dialect.`,
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Pagination for Large Result Sets
For queries that may return large result sets, implement pagination:
\`\`\`sql
${paginationExample}
\`\`\`

This approach allows you to retrieve data in manageable chunks, improving performance and user experience.`,
          },
        },
      ];

    case 'parameterized-queries':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'How should I use parameters in SQL queries to prevent SQL injection?',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Parameterized Query Usage
Always use parameters for dynamic values to prevent SQL injection:
\`\`\`
-- Query with parameters
SELECT * FROM customers WHERE region = @region AND status = @status LIMIT 10;

-- Parameters object
{
  "@region": "West",
  "@status": "Active"
}
\`\`\`

Never concatenate user input directly into SQL strings. Always use the parameters object to pass variable data.`,
          },
        },
      ];

    case 'handle-results':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'What strategies should I use for handling empty or large result sets?',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Handling Empty or Large Results
Consider these strategies when dealing with potentially empty or large result sets:

- Check if results are empty before proceeding with analysis
- For large results, consider aggregations or filtering before fetching
- Use COUNT(*) queries to understand result size before fetching all rows

Example to check result size first:
\`\`\`sql
SELECT COUNT(*) as total_count FROM table_name WHERE condition;
\`\`\`

If the count is manageable, proceed with the actual query:
\`\`\`sql
SELECT * FROM table_name WHERE condition LIMIT 100;
\`\`\``,
          },
        },
      ];

    case 'error-handling':
      return [
        {
          role: 'user',
          content: {
            type: 'text',
            text: 'What troubleshooting steps should I take when a database query fails?',
          },
        },
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `# Error Handling
If a query fails, try these troubleshooting steps:

1. Checking table and column names
   - Verify spelling and case sensitivity
   - Ensure the table exists in the current schema

2. Verifying parameter formats
   - Check data types match expected formats
   - Ensure date formats are correct

3. Simplifying the query complexity
   - Break down complex queries into simpler parts
   - Test individual components separately

4. Ensuring proper permissions for the requested operation
   - Verify connection has SELECT, INSERT, UPDATE permissions as needed`,
          },
        },
      ];

    default:
      error(`Unknown prompt name: ${name}`);
      return [
        {
          role: 'assistant',
          content: {
            type: 'text',
            text: `Error: Prompt '${name}' is not available.`,
          },
        },
      ];
  }
}
