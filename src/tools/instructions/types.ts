export interface DriverInstructions {
  driverName: string;
  version: string;
  instructions: {
    overview: string;
    dataModel: {
      hierarchy: string;
      keyTables: string[];
      relationships: string;
    };
    queryPatterns: {
      timeFiltering: string;
      commonQueries: string[];
      bestPractices: string[];
    };
    fieldConventions: {
      userFields: string;
      dateFields: string;
      idFields: string;
    };
    limitations: string[];
    troubleshooting: string[];
  };
  lastUpdated: string;
}

export interface GetInstructionsArgs {
  driverName: string;
  connectionId?: string;
}

export interface CacheEntry {
  data: DriverInstructions;
  timestamp: number;
  ttl: number;
}
