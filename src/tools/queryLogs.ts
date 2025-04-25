const CDATA_API_URL = process.env.CDATA_API_URL || 'https://cloud.cdata.com/api';
import { log, error } from '../utils/logger';

async function getQueryLogs(queryType?: number, startTime?: string, endTime?: string) {
    try {
        const response = await fetch(`${CDATA_API_URL}/log/query/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
          },
          body: JSON.stringify({  
              queryType,
              startTime,
              endTime,
              }),
          });
          if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
              }
          const data = await response.json();
          log({
              message: "Query logs retrieved successfully",
              timestamp: new Date().toISOString(),
              details: {
                  queryType,
                  period: {
                      startTime,
                      endTime
                  }
              }
          });

          return {
              jsonrpc: "2.0",
              result: data,
              id: global.currentRequestId || null
          };
    } catch (error: any) {
        error({
            level: "error",
            message: "Error fetching query logs",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                queryType,
                period: {
                    startTime,
                    endTime
                }
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching query logs",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

async function downloadQueryLog(queryId: string) {
    try {
        const response = await fetch(`${CDATA_API_URL}/log/query/get/${queryId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
          },
          });
          if (!response.ok) {
              throw new Error(`Error: ${response.statusText}`);
              }
          const data = await response.json();
          log({
              message: "Query log downloaded successfully",
              timestamp: new Date().toISOString(),
              details: {
                  queryId
              }
          });
          
          return {
              jsonrpc: "2.0",
              result: data,
              id: global.currentRequestId || null
          };
    } catch (error: any) {
        error({
            level: "error",
            message: "Error downloading query log",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                queryId
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error downloading query log",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

export { getQueryLogs, downloadQueryLog };