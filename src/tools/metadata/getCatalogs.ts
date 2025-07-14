import { CDATA_API_URL, log, error } from '../config';

async function getCatalogs() {
  try {
    const response = await fetch(`${CDATA_API_URL}/catalogs`, {
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
      message: 'Catalogs retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        operation: 'getCatalogs',
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
      message: 'Error fetching catalogs',
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      details: {
        operation: 'getCatalogs',
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: err.message || 'Unknown error fetching catalogs',
        data: {
          name: err.name,
          stack: err.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { getCatalogs };
