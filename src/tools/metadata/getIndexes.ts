import { CDATA_API_URL, log } from '../config';

async function getIndexes(
  catalogName?: string,
  schemaName?: string,
  tableName?: string,
  indexName?: string,
) {
  try {
    let url = `${CDATA_API_URL}/indexes`;
    const params = new URLSearchParams();

    if (catalogName) params.append('catalogName', catalogName);
    if (schemaName) params.append('schemaName', schemaName);
    if (tableName) params.append('tableName', tableName);
    if (indexName) params.append('indexName', indexName);

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
      message: 'Indexes information retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        tableName: tableName || 'all',
        indexName: indexName || 'all',
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
      message: 'Error fetching indexes',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      details: {
        catalogName: catalogName || 'all',
        schemaName: schemaName || 'all',
        tableName: tableName || 'all',
        indexName: indexName || 'all',
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: error.message || 'Unknown error fetching indexes',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { getIndexes };
