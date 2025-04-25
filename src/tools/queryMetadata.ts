const CDATA_API_URL = process.env.CDATA_API_URL || 'https://cloud.cdata.com/api';
import { log, error } from '../utils/logger';

async function getCatalogs() {
    try {
        const response = await fetch(`${CDATA_API_URL}/catalogs`, {
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
            message: "Catalogs retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                operation: "getCatalogs"
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
            message: "Error fetching catalogs",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                operation: "getCatalogs"
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching catalogs",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

async function getColumns(catalogName?: string, schemaName?: string, tableName?: string, columnName?: string) {
    try {
        let url = `${CDATA_API_URL}/columns`;
        const params = new URLSearchParams();
        
        if (catalogName) params.append('catalogName', catalogName);
        if (schemaName) params.append('schemaName', schemaName);
        if (tableName) params.append('tableName', tableName);
        if (columnName) params.append('columnName', columnName);
        
        // Add query parameters if any are specified
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
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
            message: "Column information retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                tableName: tableName || 'all',
                columnName: columnName || 'all'
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
            message: "Error fetching columns",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                tableName: tableName || 'all',
                columnName: columnName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching columns",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

async function getSchemas(catalogName?: string) {
    try {
        let url = `${CDATA_API_URL}/schemas`;
        
        if (catalogName) {
            url += `?catalogName=${encodeURIComponent(catalogName)}`;
        }

        const response = await fetch(url, {
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
            message: "Schemas retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                catalogName: catalogName || 'all'
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
            message: "Error fetching schemas",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                catalogName: catalogName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching schemas",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

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
                'Authorization': 'Basic ' + Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        log({
            message: "Tables information retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                tableName: tableName || 'all'
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
            message: "Error fetching tables",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                tableName: tableName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching tables",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

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
                'Authorization': 'Basic ' + Buffer.from(`${process.env.CDATA_USERNAME}:${process.env.CDATA_PAT}`).toString('base64'),
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        log({
            message: "Procedures information retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                procedureName: procedureName || 'all'
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
            message: "Error fetching procedures",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                procedureName: procedureName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching procedures",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

async function getProcedureParameters(catalogName?: string, schemaName?: string, procedureName?: string, paramName?: string) {
    try {
        let url = `${CDATA_API_URL}/procedureParameters`;
        const params = new URLSearchParams();
        
        if (catalogName) params.append('catalogName', catalogName);
        if (schemaName) params.append('schemaName', schemaName);
        if (procedureName) params.append('procedureName', procedureName);
        if (paramName) params.append('paramName', paramName);
        
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }

        const response = await fetch(url, {
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
            message: "Procedure parameters information retrieved successfully",
            timestamp: new Date().toISOString(),
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                procedureName: procedureName || 'all',
                paramName: paramName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            result: data,
            id: global.currentRequestId || null
        };
    }
    catch (error: any) {    
        error({
            level: "error",
            message: "Error fetching procedure parameters",
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            details: {
                catalogName: catalogName || 'all',
                schemaName: schemaName || 'all',
                procedureName: procedureName || 'all',
                paramName: paramName || 'all'
            }
        });
        
        return {
            jsonrpc: "2.0",
            error: {
                code: -32000,
                message: error.message || "Unknown error fetching procedure parameters",
                data: {
                    name: error.name,
                    stack: error.stack
                }
            },
            id: global.currentRequestId || null
        };
    }
}

export { getCatalogs, getColumns, getSchemas, getTables, getProcedures, getProcedureParameters };

