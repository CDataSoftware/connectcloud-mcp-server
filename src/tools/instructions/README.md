# Driver Instructions Feature

This feature provides driver-specific usage instructions and context to help construct optimal queries for different data sources.

## Overview

The `getInstructions` tool retrieves contextual guidance for specific CData drivers, including:
- Data model hierarchy and relationships
- Query patterns and best practices
- Field naming conventions
- Driver-specific limitations
- Troubleshooting guidance

## Architecture

The implementation follows a three-tier fallback strategy:

1. **Primary**: External API with API key authentication
2. **Secondary**: Local JSON files for driver-specific instructions
3. **Tertiary**: Generic CData best practices

## Configuration

Set these environment variables:

```bash
# External API configuration (optional)
INSTRUCTIONS_API_URL=https://api.example.com/instructions
INSTRUCTIONS_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

```typescript
// Get instructions for a specific driver
const response = await getInstructions("salesforce");

// Get instructions with connection context
const response = await getInstructions("azure-devops", "connection-123");
```

### MCP Tool Usage

```json
{
  "tool": "getInstructions",
  "arguments": {
    "driverName": "salesforce",
    "connectionId": "optional-connection-id"
  }
}
```

## Supported Drivers

The following drivers have specific instructions available:

1. **azure-devops** - Azure DevOps Services and TFS
2. **salesforce** - Salesforce CRM
3. **sharepoint** - SharePoint Online and Server
4. **dynamics-365** - Microsoft Dynamics 365
5. **servicenow** - ServiceNow platform
6. **oracle-service-cloud** - Oracle Service Cloud
7. **hubspot** - HubSpot CRM
8. **jira** - Atlassian Jira
9. **quickbooks** - QuickBooks Online and Desktop
10. **netsuite** - NetSuite ERP

## Driver Aliases

The system supports common driver aliases:

- `azuredevops`, `vsts`, `tfs` → `azure-devops`
- `sharepointonline` → `sharepoint`
- `sfdc` → `salesforce`
- `dynamics` → `dynamics-365`
- `snow` → `servicenow`
- `osc` → `oracle-service-cloud`
- `qb` → `quickbooks`

## Fallback Behavior

1. **API Available**: Returns driver-specific instructions from external API
2. **API Unavailable**: Falls back to local JSON files
3. **No Specific Instructions**: Returns generic CData best practices
4. **Complete Failure**: Returns error with troubleshooting guidance

## Caching

The system implements in-memory caching with:
- 15-minute TTL for API responses
- 5-minute TTL for generic instructions
- Automatic cleanup of expired entries
- Cache invalidation on service restart

## File Structure

```
src/tools/instructions/
├── index.ts                    # Main exports
├── types.ts                    # TypeScript interfaces
├── cache.ts                    # In-memory caching
├── getInstructions.ts          # Core implementation
└── driverInstructions/         # Local JSON files
    ├── azure-devops.json
    ├── salesforce.json
    ├── sharepoint.json
    ├── dynamics-365.json
    ├── servicenow.json
    ├── oracle-service-cloud.json
    ├── hubspot.json
    ├── jira.json
    ├── quickbooks.json
    ├── netsuite.json
    └── generic.json
```

## Response Format

```json
{
  "driverName": "salesforce",
  "version": "1.0.0",
  "instructions": {
    "overview": "Brief description of the driver and its purpose",
    "dataModel": {
      "hierarchy": "Data organization structure",
      "keyTables": ["list", "of", "important", "tables"],
      "relationships": "Description of how tables relate"
    },
    "queryPatterns": {
      "timeFiltering": "How to filter by date/time",
      "commonQueries": ["example", "queries"],
      "bestPractices": ["query", "optimization", "tips"]
    },
    "fieldConventions": {
      "userFields": "How user fields are named",
      "dateFields": "Date field conventions",
      "idFields": "ID field patterns"
    },
    "limitations": ["known", "limitations"],
    "troubleshooting": ["common", "solutions"]
  },
  "lastUpdated": "2024-01-15T10:00:00Z"
}
```

## Error Handling

The system provides comprehensive error handling:

- **Driver Not Found**: Returns generic instructions
- **API Errors**: Falls back to local files
- **File Not Found**: Falls back to generic instructions
- **Network Issues**: Cached responses when available
- **Authentication Errors**: Detailed error messages

## Performance Considerations

- **Caching**: Reduces API calls and improves response times
- **Fallback Strategy**: Ensures service availability
- **Async Operations**: Non-blocking instruction retrieval
- **Memory Management**: Automatic cache cleanup

## Future Enhancements

- Dynamic instruction updates from external sources
- User feedback integration for instruction quality
- Custom instruction overlays for organizations
- Analytics and usage tracking
- A/B testing for instruction effectiveness
