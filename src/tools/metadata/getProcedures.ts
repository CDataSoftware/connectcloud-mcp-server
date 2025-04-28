import { CDATA_API_URL, log } from './config';

async function getProcedures(catalogName?: string, schemaName?: string, procedureName?: string) {
  try {
    let url = `${CDATA_API_URL}/procedures`;
    const params = new URLSearchParams();

    if (catalogName) params.append('catalogName', catalogName);
    if (schemaName) params.append('schemaName', schemaName);
    if (procedureName) params.append('procedureName', procedureName);

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
      message: 'Procedures information retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        procedureName: procedureName || 'all',
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
      message: 'Error fetching procedures',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        procedureName: procedureName || 'all',
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message || 'Unknown error fetching procedures',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { getProcedures };
