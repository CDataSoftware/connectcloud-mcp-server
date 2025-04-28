import { CDATA_API_URL, log } from '../config';

async function batchData(
  query: string,
  defaultSchema?: string,
  parameters?: Array<Record<string, { dataType: number; value: any }>>,
) {
  try {
    const response = await fetch(`${CDATA_API_URL}/batch`, {
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
        parameters,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    log({
      message: 'Batch operation executed successfully',
      timestamp: new Date().toISOString(),
      details: {
        query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        defaultSchema,
        batchSize: parameters?.length || 0,
      },
    });

    return {
      jsonrpc: '2.0',
      result: data,
      id: global.currentRequestId || null,
    };
  } catch (error: any) {
    error({
      level: 'error',
      message: 'Error fetching batch data',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      details: {
        query: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
        defaultSchema,
        batchSize: parameters?.length || 0,
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message || 'Unknown error during batch operation',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { batchData };
