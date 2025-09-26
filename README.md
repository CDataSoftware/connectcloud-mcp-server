# 🧠 CData Connect AI MCP Server

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![CData Connect AI](https://img.shields.io/badge/CData-Connect%20Cloud-0072C6)](https://www.cdata.com/ai/)
[![smithery badge](https://smithery.ai/badge/@CDataSoftware/connectcloud-mcp-server)](https://smithery.ai/server/@CDataSoftware/connectcloud-mcp-server)

## 🚨 Now Available in Connect AI 🚨

Connect AI (formerly Connect Cloud) now has a built-in Remote MCP Server (using the Streamable HTTP transport type). [Learn more](https://www.cdata.com/ai/).

This project still allows for local installation/hosting of the MCP server using the STDIO transport type.

---

A **Model Context Protocol (MCP)** server for querying and managing data through [CData Connect AI](https://www.cdata.com/ai/). This server enables AI agents to interact with data using SQL, metadata introspection, and procedure execution.

---

## ✨ Features

- ✅ Execute SQL queries on cloud-connected data sources
- 🔄 Perform batch operations (INSERT, UPDATE, DELETE)
- ⚙️ Execute stored procedures
- 📚 Access metadata (catalogs, schemas, tables, columns)

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- A **CData Connect Cloud** account with API access
- A **Personal Access Token (PAT)** for authentication

---

## ⚙️ Setup

### Installing via Smithery

To install CData Connect AI MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@CDataSoftware/connectcloud-mcp-server):

```bash
npx -y @smithery/cli install @CDataSoftware/connectcloud-mcp-server --client claude
```

### Manual Installation
1. **Clone the repository**

   ```bash
   git clone https://github.com/cdatasoftware/connectcloud-mcp-server.git
   cd connect-cloud-mcp-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file with the following content:

   ```env
   CDATA_USERNAME=your_username
   CDATA_PAT=your_personal_access_token

   # Optional Configuration
   LOG_ENABLED=false
   LOG_LEVEL=info
   CDATA_URL=https://your-test-environment-url
   
   # Transport Configuration (default: http)
   TRANSPORT_TYPE=http  # or 'stdio' for terminal usage
   PORT=3000           # HTTP server port
   HOST=localhost      # HTTP server host
   ```

---

## ▶️ Running the Server

### Development Mode

Use `ts-node` for live development:

```bash
npm run dev
```

### Production Mode

Build and start:

```bash
npm run build
npm start
```

### HTTP Transport Endpoints

When running with HTTP transport (default), the server provides these endpoints:

- **MCP Endpoint**: `http://localhost:3000/mcp` - Primary Model Context Protocol endpoint
- **Direct Endpoint**: `http://localhost:3000/direct` - Direct JSON-RPC endpoint without session management
- **Manifest**: `http://localhost:3000/.well-known/mc/manifest.json` - MCP discovery manifest

### Using STDIO Transport

To use STDIO transport instead (for terminal/CLI usage):

```bash
TRANSPORT_TYPE=stdio npm start
```

---

## 🔍 Testing with MCP Inspector

The MCP Inspector is a visual testing tool that provides both a web UI and CLI interface for testing MCP servers. This project includes full support for the inspector.

### Quick Setup Validation

Run the setup validation script to ensure everything is configured correctly:

```bash
npm run validate:inspector
```

This will check your configuration and provide detailed setup instructions.

### Quick Start with Inspector

1. **Install the inspector globally** (optional but recommended):
   ```bash
   npm install -g @modelcontextprotocol/inspector
   ```

2. **Launch inspector with web UI**:
   ```bash
   npm run inspector
   ```
   This opens a web interface where you can select and test different transport configurations.

### Testing Different Transports

#### STDIO Transport
```bash
# Launch inspector with STDIO transport (starts server automatically)
npm run inspector:stdio
```

#### HTTP Transport  
```bash
# Start the server first
npm run dev:http

# Then in another terminal, launch inspector
npm run inspector:http
```

#### Command Line Testing
```bash
# Quick CLI testing with STDIO transport
npm run inspector:cli

# Test specific methods directly
npm run test:inspector
```

### Inspector Configuration

The project includes a `mcp-inspector.json` configuration file with pre-configured server setups:

- **connectcloud-stdio**: STDIO transport with automatic server startup
- **connectcloud-http**: Streamable HTTP transport (requires manual server start)

### Available Inspector Scripts

| Script | Description |
|--------|-------------|
| `npm run inspector` | Launch inspector web UI with server selection |
| `npm run inspector:stdio` | Launch inspector with STDIO transport |
| `npm run inspector:http` | Launch inspector with HTTP transport |
| `npm run inspector:cli` | CLI mode with STDIO transport |
| `npm run test:inspector` | Quick automated test |

---

## 🧰 Available Tools

### 🔹 Data Operations

| Tool       | Description                                         |
|------------|-----------------------------------------------------|
| `queryData`  | Execute SQL queries                                 |
| `execData`   | Execute stored procedures                           |

### 🔹 Metadata Operations

| Tool                   | Description                                 |
|------------------------|---------------------------------------------|
| `getCatalogs`          | Retrieve available catalogs                 |
| `getSchemas`           | List schemas in a catalog                   |
| `getTables`            | List tables in a schema                     |
| `getColumns`           | Get column metadata for a table             |
| `getPrimaryKeys`       | Retrieve primary keys for tables            |
| `getIndexes`           | Get index information for tables            |
| `getImportedKeys`      | Retrieve foreign key columns that reference tables |
| `getExportedKeys`      | Retrieve foreign key columns referenced from tables |
| `getProcedures`        | List available procedures                   |
| `getProcedureParameters` | Get procedure input/output params         |

---

## 🤖 Usage with LLMs

This server is compatible with AI agents that implement the Model Context Protocol.

### Example (TypeScript + MCP Agent)

```ts
const response = await agent.generateContent({
  tools: [
    {
      name: "queryData",
      parameters: {
        query: "SELECT * FROM Salesforce1.Salesforce.Account LIMIT 10"
      }
    }
  ]
});
```

---

## 🐳 Running in Docker

### Build the image

```bash
docker build -t mcp/connectcloud:latest -f Dockerfile .
```

---

## 🧩 Claude Desktop Integration

Add or edit this configuration to your `claude_desktop_config.json` under the `mcpServers` section:

#### 🔹 From Docker

```json
{
  "mcpServers": {
    "connect-cloud": {
      "command": "docker",
      "args": [
        "run", 
        "-i",
        "--rm",
        "--name", "connect-cloud-mcp",
        "-e", "CDATA_USERNAME",
        "-e", "CDATA_PAT",
        "mcp/connectcloud"
      ],
      "env": {
        "CDATA_USERNAME": "<your-cdata-username>",
        "CDATA_PAT": "<your-cdata-personal-access-token>"
      }
    }
  }
}
```

#### Via Npx
```json
{
  "mcpServers": {
    "connect-cloud": {
      "command": "npx",
      "args": [
        "-y",
        "@cdatasoftware/connectcloud-mcp-server"],
      "env": {
        "CDATA_USERNAME": "<your-cdata-username>",
        "CDATA_PAT": "<your-cdata-personal-access-token>"
      }
    }
  }
}
```
---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
