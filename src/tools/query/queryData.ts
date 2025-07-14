import { CDATA_API_URL, log, error } from '../config';

async function queryData(
  query: string,
  defaultSchema?: string,
  schemaOnly?: boolean,
  parameters?: Record<string, { dataType: number; value: any }>,
) {
  try {
    const response = await fetch(`${CDATA_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
      },
      body: JSON.stringify({
        query,
        defaultSchema,
        schemaOnly,
        parameters,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    log({
      message: 'Query executed successfully',
      timestamp: new Date().toISOString(),
      details: {
        query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        defaultSchema,
        schemaOnly,
      },
    });

    return {
      jsonrpc: '2.0',
      result: data,
      id: global.currentRequestId || null,
    };
  } catch (err: any) {
    error({
      level: 'error',
      message: 'Error fetching query data',
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      details: {
        query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        defaultSchema,
        schemaOnly,
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: err.message || 'Unknown error during query execution',
        data: {
          name: err.name,
          stack: err.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { queryData };
