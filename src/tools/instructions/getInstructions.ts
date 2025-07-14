import { log, error } from '../config';
import { DriverInstructions } from './types';
import { instructionsCache } from './cache';
import * as fs from 'fs';
import * as path from 'path';

// Configuration for external instructions API
const INSTRUCTIONS_API_URL = process.env.INSTRUCTIONS_API_URL;
const INSTRUCTIONS_API_KEY = process.env.INSTRUCTIONS_API_KEY;

// Driver aliases mapping
const DRIVER_ALIASES: Record<string, string> = {
  azuredevops: 'azure-devops',
  vsts: 'azure-devops',
  tfs: 'azure-devops',
  sharepoint: 'sharepoint',
  sharepointonline: 'sharepoint',
  salesforce: 'salesforce',
  sfdc: 'salesforce',
  dynamics365: 'dynamics-365',
  dynamics: 'dynamics-365',
  servicenow: 'servicenow',
  snow: 'servicenow',
  oracle: 'oracle-service-cloud',
  osc: 'oracle-service-cloud',
  hubspot: 'hubspot',
  jira: 'jira',
  quickbooks: 'quickbooks',
  qb: 'quickbooks',
  netsuite: 'netsuite',
};

/**
 * Normalize driver name using aliases
 */
function normalizeDriverName(driverName: string): string {
  const normalized = driverName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return DRIVER_ALIASES[normalized] || normalized;
}

/**
 * Load instructions from local JSON file
 */
async function loadLocalInstructions(driverName: string): Promise<DriverInstructions | null> {
  try {
    const instructionsPath = path.join(__dirname, 'driverInstructions', `${driverName}.json`);

    if (!fs.existsSync(instructionsPath)) {
      return null;
    }

    const fileContent = fs.readFileSync(instructionsPath, 'utf8');
    const instructions = JSON.parse(fileContent) as DriverInstructions;

    log({
      message: 'Local instructions loaded successfully',
      timestamp: new Date().toISOString(),
      details: {
        driverName,
        source: 'local',
        operation: 'getInstructions',
      },
    });

    return instructions;
  } catch (err: unknown) {
    const errorObj = err as Error;
    error({
      level: 'error',
      message: 'Error loading local instructions',
      timestamp: new Date().toISOString(),
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      details: {
        driverName,
        source: 'local',
        operation: 'getInstructions',
      },
    });
    return null;
  }
}

/**
 * Fetch instructions from external API
 */
async function fetchApiInstructions(driverName: string): Promise<DriverInstructions | null> {
  if (!INSTRUCTIONS_API_URL || !INSTRUCTIONS_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `${INSTRUCTIONS_API_URL}/driver-instructions/${encodeURIComponent(driverName)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${INSTRUCTIONS_API_KEY}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Instructions not found for this driver
        return null;
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    log({
      message: 'API instructions retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        driverName,
        source: 'api',
        operation: 'getInstructions',
      },
    });

    return data as DriverInstructions;
  } catch (err: unknown) {
    const errorObj = err as Error;
    error({
      level: 'error',
      message: 'Error fetching API instructions',
      timestamp: new Date().toISOString(),
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      details: {
        driverName,
        source: 'api',
        operation: 'getInstructions',
      },
    });
    return null;
  }
}

/**
 * Load generic fallback instructions
 */
async function loadGenericInstructions(): Promise<DriverInstructions | null> {
  return await loadLocalInstructions('generic');
}

interface ApiResponse {
  jsonrpc: string;
  result?: DriverInstructions;
  error?: {
    code: number;
    message: string;
    data?: {
      name: string;
      stack?: string;
    };
  };
  id: string | number | null;
}

/**
 * Main function to get driver instructions with fallback strategy
 */
async function getInstructions(driverName: string, connectionId?: string): Promise<ApiResponse> {
  try {
    const normalizedDriverName = normalizeDriverName(driverName);

    // Check cache first
    const cachedInstructions = instructionsCache.get(normalizedDriverName);
    if (cachedInstructions) {
      log({
        message: 'Instructions retrieved from cache',
        timestamp: new Date().toISOString(),
        details: {
          driverName: normalizedDriverName,
          connectionId,
          source: 'cache',
          operation: 'getInstructions',
        },
      });

      return {
        jsonrpc: '2.0',
        result: cachedInstructions,
        id: global.currentRequestId || null,
      };
    }

    let instructions: DriverInstructions | null = null;

    // Strategy 1: Try external API first
    instructions = await fetchApiInstructions(normalizedDriverName);

    // Strategy 2: Fallback to local JSON files
    if (!instructions) {
      instructions = await loadLocalInstructions(normalizedDriverName);
    }

    // Strategy 3: Fallback to generic instructions
    if (!instructions) {
      instructions = await loadGenericInstructions();
    }

    if (!instructions) {
      throw new Error(`No instructions available for driver: ${driverName}`);
    }

    // Cache the result (shorter TTL for generic instructions)
    const cacheTTL = instructions.driverName === 'generic' ? 5 * 60 * 1000 : undefined; // 5 minutes for generic
    instructionsCache.set(normalizedDriverName, instructions, cacheTTL);

    log({
      message: 'Driver instructions retrieved successfully',
      timestamp: new Date().toISOString(),
      details: {
        driverName: normalizedDriverName,
        connectionId,
        source: instructions.driverName === 'generic' ? 'generic' : 'specific',
        operation: 'getInstructions',
      },
    });

    return {
      jsonrpc: '2.0',
      result: instructions,
      id: global.currentRequestId || null,
    };
  } catch (err: unknown) {
    const errorObj = err as Error;
    error({
      level: 'error',
      message: 'Error getting driver instructions',
      timestamp: new Date().toISOString(),
      error: {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
      },
      details: {
        driverName,
        connectionId,
        operation: 'getInstructions',
      },
    });

    return {
      jsonrpc: '2.0',
      error: {
        code: -32000,
        message: errorObj.message || 'Unknown error getting instructions',
        data: {
          name: errorObj.name,
          stack: errorObj.stack,
        },
      },
      id: global.currentRequestId || null,
    };
  }
}

export { getInstructions };
