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
  'azure_devops': 'azure-devops.json',
  'azuredevopsv5.0': 'azure-devops.json',
  'azuredevopsv5': 'azure-devops.json',
  'azure devops services': 'azure-devops.json',
  'azure devops server': 'azure-devops.json',
  'tfs': 'azure-devops.json',
  'team foundation server': 'azure-devops.json',
  'vsts': 'azure-devops.json',
  'visual studio team services': 'azure-devops.json',
  'devops': 'azure-devops.json',
  'generic': 'generic.json'
};

// Supported drivers list
const SUPPORTED_DRIVERS = ['Azure DevOps'];

/**
 * Normalizes driver name for better matching
 * @param driverName Raw driver name from request
 * @returns Normalized driver name for lookup
 */
function normalizeDriverName(driverName: string): string {
  return driverName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '_');
}

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

    // Determine which instructions file to load based on driver name
    let fileName = 'generic.json';
    let normalizedDriverName = 'Generic';
    let isDriverSpecific = false;

    if (driverName) {
      const lowerDriverName = driverName.toLowerCase().trim();
      const normalizedName = normalizeDriverName(driverName);
      
      // Check for exact matches first
      if (DRIVER_FILE_MAP[lowerDriverName]) {
        fileName = DRIVER_FILE_MAP[lowerDriverName];
        normalizedDriverName = driverName;
        isDriverSpecific = true;
      }
      // Check for normalized matches
      else if (DRIVER_FILE_MAP[normalizedName]) {
        fileName = DRIVER_FILE_MAP[normalizedName];
        normalizedDriverName = driverName;
        isDriverSpecific = true;
      }
      // Check for partial matches (contains azure devops)
      else if (lowerDriverName.includes('azure') && lowerDriverName.includes('devops')) {
        fileName = DRIVER_FILE_MAP['azure-devops'];
        normalizedDriverName = 'Azure DevOps';
        isDriverSpecific = true;
      }
      else {
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

    // Enhanced instruction formatting for LLM processing
    const enhancedInstructions = {
      ...instructions,
      processingGuidance: {
        driverType: isDriverSpecific ? 'specific' : 'generic',
        mustFollowWorkflow: isDriverSpecific,
        driverSpecificRequirements: isDriverSpecific && fileName === 'azure-devops.json' 
          ? {
              mandatorySteps: [
                "ALWAYS start by calling get_catalogs tool to discover the actual catalog name (never use hardcoded 'CData')",
                "Follow the stepByStepProcess in the instructions exactly as specified",
                "Use the detailed tableSpecifications provided - these contain comprehensive column details, supported operators, and example queries",
                "Reference the hierarchical dataModel structure: Project -> Repository -> Data", 
                "Apply driver-specific queryPatterns and commonQueries provided",
                "Follow the recommendedWorkflow for developer activity reports and work item analysis",
                "Use the importantColumnNames reference for accurate field selection"
              ],
              tableGuidance: "The instructions contain detailed tableSpecifications for key tables (PullRequests, AgentPools, BuildDefinitions, GroupMembers, Projects, Users, etc.) with complete column definitions, data types, supported operators, and example queries. Use this information directly instead of calling get_columns for these well-documented tables.",
              queryApproach: "For Azure DevOps, always follow this pattern: 1) get_catalogs, 2) identify project, 3) identify repository if needed, 4) use provided table specifications, 5) build query with proper time filtering and grouping."
            }
          : isDriverSpecific 
            ? [
                "Follow the exact workflow steps provided in the instructions",
                "Use the specific table specifications and column details provided", 
                "Apply the best practices listed for this driver",
                "Reference the data model hierarchy when structuring queries",
                "Use common query patterns for typical scenarios"
              ]
            : [
                "Use metadata tools (getCatalogs, getSchemas, getTables, getColumns) to explore data structure",
                "Apply generic best practices for query optimization",
                "Start with LIMIT clauses for initial exploration",
                "Use appropriate filtering based on discovered schema"
              ],
        llmProcessingNotes: isDriverSpecific 
          ? "This driver has comprehensive, specific instructions. The LLM should prioritize and strictly follow the detailed guidance, workflow steps, and provided examples rather than generic approaches."
          : "This is generic guidance. The LLM should use metadata exploration tools to understand the specific data source structure and capabilities.",
        priority: isDriverSpecific ? 'driver_specific' : 'generic_fallback'
      }
    };

    // Add contextual information if connectionId is provided
    const responseData = {
      ...enhancedInstructions,
      requestContext: {
        requestedDriver: driverName || 'Not specified',
        connectionId: connectionId || 'Not specified',
        timestamp: new Date().toISOString(),
        supportedDrivers: SUPPORTED_DRIVERS,
        instructionSource: fileName,
        driverMatched: isDriverSpecific,
        instructionQuality: isDriverSpecific ? 'comprehensive_driver_specific' : 'generic_fallback'
      },
      llmInstructions: {
        primaryDirective: isDriverSpecific 
          ? `These are comprehensive, driver-specific instructions for ${normalizedDriverName}. Follow the detailed step-by-step processes, use the provided table specifications, and apply the specific query patterns. The instructions contain everything needed including column names, data types, supported operators, and example queries.`
          : `These are generic instructions. Use the metadata exploration tools (getCatalogs, getSchemas, getTables, getColumns) to discover the specific data structure and capabilities of the data source.`,
        processingPriority: isDriverSpecific ? 'HIGH - Use driver-specific guidance' : 'MEDIUM - Use generic approach with metadata exploration',
        warningNote: !isDriverSpecific && driverName ? `Driver "${driverName}" not recognized. Using generic instructions as fallback. For better results, specify a supported driver name like "Azure DevOps".` : undefined
      }
    };

    log(`Successfully retrieved ${isDriverSpecific ? 'driver-specific' : 'generic'} instructions for: ${normalizedDriverName} (file: ${fileName})`);

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
