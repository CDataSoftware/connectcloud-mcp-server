import { CDATA_API_URL, log } from '../config';

async function downloadQueryLog(queryId: string) {
  try {
    const response = await fetch(`${CDATA_API_URL}/log/query/get/${queryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' +
          Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
      },
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    const data = await response.json();
    log({
      message: 'Query log downloaded successfully',
      timestamp: new Date().toISOString(),
      details: {
        queryId,
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
      message: 'Error downloading query log',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      details: {
        queryId,
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message || 'Unknown error downloading query log',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { downloadQueryLog };
