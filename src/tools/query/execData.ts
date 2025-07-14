import { CDATA_API_URL, log, error } from '../config';

async function execData(
  procedure: string,
  defaultSchema?: string,
  parameters?: Record<string, { dataType: number; direction?: number; value?: any }>,
) {
  try {
    const response = await fetch(`${CDATA_API_URL}/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
      },
      body: JSON.stringify({
        procedure,
        defaultSchema,
        parameters,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    log({
      message: 'Stored procedure executed successfully',
      timestamp: new Date().toISOString(),
      details: {
        procedure,
        defaultSchema,
        parameterCount: parameters ? Object.keys(parameters).length : 0,
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
      message: 'Error fetching exec data',
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      details: {
        procedure,
        defaultSchema,
        parameterCount: parameters ? Object.keys(parameters).length : 0,
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: err.message || 'Unknown error during stored procedure execution',
        data: {
          name: err.name,
          stack: err.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { execData };
