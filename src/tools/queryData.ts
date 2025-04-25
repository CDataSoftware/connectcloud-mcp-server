const CDATA_API_URL = process.env.CDATA_API_URL || 'https://cloud.cdata.com/api';
import { log } from '../utils/logger';

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
  } catch (error: any) {
    error({
      level: 'error',
      message: 'Error fetching query data',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
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
        message: error.message || 'Unknown error during query execution',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

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
  } catch (error: any) {
    error({
      level: 'error',
      message: 'Error fetching exec data',
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
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
        message: error.message || 'Unknown error during stored procedure execution',
        data: {
          name: error.name,
          stack: error.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { queryData, batchData, execData };
