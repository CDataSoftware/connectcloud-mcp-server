import { CDATA_API_URL, log, error } from '../config';

async function getTables(catalogName?: string, schemaName?: string, tableName?: string) {
  try {
    let url = `${CDATA_API_URL}/tables`;
    const params = new URLSearchParams();

    if (catalogName) params.append('catalogName', catalogName);
    if (schemaName) params.append('schemaName', schemaName);
    if (tableName) params.append('tableName', tableName);

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
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
      message: 'Tables information retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        tableName: tableName || 'all',
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
      message: 'Error fetching tables',
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        tableName: tableName || 'all',
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: err.message || 'Unknown error fetching tables',
        data: {
          name: err.name,
          stack: err.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { getTables };
