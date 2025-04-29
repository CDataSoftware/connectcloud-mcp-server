# 🧠 CData Connect Cloud MCP Server

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)
[![CData Connect Cloud](https://img.shields.io/badge/CData-Connect%20Cloud-0072C6)](https://www.cdata.com/connect/)

A **Model Context Protocol (MCP)** server for querying and managing data through [CData Connect Cloud](https://cloud.cdata.com/). This server enables AI agents to interact with data using SQL, metadata introspection, and procedure execution.

---

## ✨ Features

- ✅ Execute SQL queries on cloud-connected data sources
- 🔄 Perform batch operations (INSERT, UPDATE, DELETE)
- ⚙️ Execute stored procedures
- 📚 Access metadata (catalogs, schemas, tables, columns)
- 📈 Retrieve and download query execution logs

---

## 🛠 Prerequisites

- [Node.js](https://nodejs.org/) **v18 or higher**
- A **CData Connect Cloud** account with API access
- A **Personal Access Token (PAT)** for authentication

---

## ⚙️ Setup

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

   # Optional
   LOG_ENABLED=false
   LOG_LEVEL=info
   CDATA_URL=https://your-test-environment-url
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

---

## 🧰 Available Tools

### 🔹 Data Operations

| Tool       | Description                                         |
|------------|-----------------------------------------------------|
| `queryData`  | Execute SQL queries                                 |
| `batchData`  | Batch operations (INSERT, UPDATE, DELETE)           |
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

### 🔹 Log Operations

| Tool              | Description                          |
|-------------------|--------------------------------------|
| `getQueryLogs`    | View history of executed queries     |
| `downloadQueryLog`| Download logs for specific queries   |

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

### 🚀 One-Click Installation

Click the link below to automatically install this MCP server in Claude Desktop:

[![Install to Claude](https://img.shields.io/badge/Install%20to%20Claude-blue?logo=anthropic)](claude://install?url=https://raw.githubusercontent.com/cdatasoftware/connectcloud-mcp-server/main/mcp.json)


You'll still need to configure your credentials after installation.

### 🔹 Manual Configuration

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

#### 🔹 From Source

```json
{
  "mcpServers": {
    "connect-cloud": {
      "command": "npm",
      "args": ["run", "build-start", "--silent", "--prefix", "C:\\path\\to\\your\\directory"],
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