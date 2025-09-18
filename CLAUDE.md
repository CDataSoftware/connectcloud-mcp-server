# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Model Context Protocol (MCP) server** for CData Connect Cloud API integration. It enables AI agents to interact with cloud-connected data sources through SQL queries, metadata introspection, and stored procedure execution.

## Development Commands

### Build and Development
- `npm run build` - Compile TypeScript to dist/
- `npm run dev` - Start development server with ts-node (default: HTTP transport)
- `npm run dev:http` - Start development server with HTTP transport
- `npm run dev:stdio` - Start development server with STDIO transport
- `npm run watch` - Watch TypeScript files and recompile on changes
- `npm run clean` - Remove dist/ directory

### Production
- `npm start` - Start compiled server (default: HTTP transport)
- `npm run start:http` - Start with HTTP transport
- `npm run start:stdio` - Start with STDIO transport
- `npm run build-start` - Build then start production server

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run lint:format` - Run both lint and format

### Testing and Debugging
- `npm run inspector` - Launch MCP Inspector web UI
- `npm run inspector:stdio` - Launch inspector with STDIO transport
- `npm run inspector:http` - Launch inspector with HTTP transport (requires separate server start)
- `npm run inspector:cli` - CLI mode inspector with STDIO transport
- `npm run test:inspector` - Quick automated inspector test
- `npm run validate:inspector` - Validate inspector configuration

## Architecture

### Core Components

**Entry Point**: `src/index.ts`
- Global request ID tracking
- Environment configuration loading
- Transport initialization

**MCP Server**: `src/server/mcpServer.ts`
- Basic MCP server instance using @modelcontextprotocol/sdk
- Server name: "CData Connect Cloud"

**Transport Layer**: `src/transports/`
- `index.ts` - Transport selection logic (HTTP vs STDIO)
- `httpTransport.ts` - HTTP server with Express.js endpoints
- `stdioTransport.ts` - Standard I/O transport for CLI usage

**Tool Registry**: `src/server/toolRegistry.ts`
- Registers all MCP tools with the server
- Handles tool parameter validation using Zod schemas
- Error handling and response formatting

### Tool Categories

**Data Operations** (`src/tools/query/`):
- `queryData` - Execute SQL queries with optional parameters
- `execData` - Execute stored procedures

**Metadata Operations** (`src/tools/metadata/`):
- `getCatalogs` - List available connections/catalogs
- `getSchemas` - List schemas within catalogs
- `getTables` - List tables within schemas
- `getColumns` - Get column metadata for tables
- `getPrimaryKeys` - Retrieve primary key information
- `getIndexes` - Get index information
- `getImportedKeys` / `getExportedKeys` - Foreign key relationships
- `getProcedures` - List stored procedures
- `getProcedureParameters` - Get procedure parameter information

### HTTP Transport Endpoints

When using HTTP transport (default), the server provides:
- `/mcp` - Primary MCP endpoint with session management
- `/direct` - Direct JSON-RPC endpoint without sessions
- `/.well-known/mc/manifest.json` - MCP discovery manifest

### Configuration

**Environment Variables**:
- `CDATA_USERNAME` - CData Connect Cloud username (required)
- `CDATA_PAT` - Personal Access Token (required)
- `CDATA_API_URL` - API URL (default: https://cloud.cdata.com/api)
- `TRANSPORT_TYPE` - "http" or "stdio" (default: "http")
- `PORT` - HTTP server port (default: 3000)
- `HOST` - HTTP server host (default: localhost)
- `LOG_ENABLED` - Enable logging (default: false)
- `LOG_LEVEL` - Log level (default: info)

**Inspector Configuration**: `mcp-inspector.json`
- Pre-configured for both STDIO and HTTP transports
- Used by MCP Inspector for testing and debugging

## Development Workflow

1. **Environment Setup**: Create `.env` file with required CData credentials
2. **Development**: Use `npm run dev` for live development with HTTP transport
3. **Testing**: Use `npm run inspector` to test tools with MCP Inspector
4. **Code Quality**: Run `npm run lint:format` before commits
5. **Build**: Use `npm run build` to compile for production

## Key Dependencies

- `@modelcontextprotocol/sdk` - Core MCP functionality
- `axios` - HTTP client for CData API requests
- `express` - HTTP server framework
- `winston` - Logging framework
- `zod` - Schema validation for tool parameters
- `dotenv` - Environment variable management

## Transport Modes

**HTTP Transport** (Default):
- Better for integration with web-based AI clients
- Provides REST-like endpoints and MCP protocol endpoints
- Session management and connection pooling

**STDIO Transport**:
- Direct stdin/stdout communication
- Better for CLI tools and direct process communication
- Used by Claude Desktop and similar clients