import * as fs from 'fs';
import * as path from 'path';
import { log, error as logError } from '../../utils/logger';

interface InstructionResponse {
  success: boolean;
  result?: any;
  error?: {
    message: string;
    code?: string;
  };
}

interface DriverInstructions {
  driverName: string;
  instructions: {
    overview: string;
    connectionSetup: any;
    commonQueries: any[];
    availableTables?: string[];
    bestPractices?: string[];
    generalGuidelines?: string[];
    troubleshooting: any[];
    supportedDrivers?: string[];
  };
}

// Map of driver names to their JSON file names
const DRIVER_FILE_MAP: Record<string, string> = {
  'azure devops': 'azure-devops.json',
  'azuredevops': 'azure-devops.json',
  'azure-devops': 'azure-devops.json',
  'generic': 'generic.json'
};

// Supported drivers list
const SUPPORTED_DRIVERS = ['Azure DevOps'];

/**
 * Get instructions for a specific driver
 * @param driverName The name of the driver to get instructions for
 * @param connectionId Optional connection ID for context
 * @returns Promise with structured instruction content
 */
export async function getInstructions(
  driverName?: string,
  connectionId?: string
): Promise<InstructionResponse> {
  try {
    // Log usage for tracking
    log(`getInstructions called - Driver: ${driverName || 'undefined'}, ConnectionId: ${connectionId || 'undefined'}`);

    // Determine which instructions file to load
    let fileName = 'generic.json';
    let normalizedDriverName = 'Generic';

    if (driverName) {
      const lowerDriverName = driverName.toLowerCase().trim();
      if (DRIVER_FILE_MAP[lowerDriverName]) {
        fileName = DRIVER_FILE_MAP[lowerDriverName];
        normalizedDriverName = driverName;
      } else {
        // Log unknown driver request
        log(`Unknown driver requested: ${driverName}. Falling back to generic instructions.`);
      }
    }

    // Load instructions from JSON file
    const instructionsPath = path.join(__dirname, 'data', fileName);
    
    if (!fs.existsSync(instructionsPath)) {
      const errorMsg = `Instructions file not found: ${fileName}`;
      logError(errorMsg);
      return {
        success: false,
        error: {
          message: errorMsg,
          code: 'FILE_NOT_FOUND'
        }
      };
    }

    const fileContent = fs.readFileSync(instructionsPath, 'utf8');
    const instructions: DriverInstructions = JSON.parse(fileContent);
    
    // Override the driverName with the requested driver name if provided
    if (driverName && fileName === 'generic.json') {
      instructions.driverName = driverName;
    }

    // Add contextual information if connectionId is provided
    const responseData = {
      ...instructions,
      requestContext: {
        requestedDriver: driverName || 'Not specified',
        connectionId: connectionId || 'Not specified',
        timestamp: new Date().toISOString(),
        supportedDrivers: SUPPORTED_DRIVERS
      }
    };

    log(`Successfully retrieved instructions for: ${normalizedDriverName}`);

    return {
      success: true,
      result: responseData
    };

  } catch (error: any) {
    const errorMsg = `Error retrieving instructions: ${error.message}`;
    logError(errorMsg);
    
    return {
      success: false,
      error: {
        message: errorMsg,
        code: 'RETRIEVAL_ERROR'
      }
    };
  }
}
