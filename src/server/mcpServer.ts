import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { config } from 'dotenv';
import { getPrompts, generatePromptMessages } from '../tools/prompts';
import { debug } from '../utils/logger';

// Load environment variables from .env file
config();

// Create a new MCP server using Anthropic's SDK format
const server = new McpServer({
  name: "CData Connect Cloud",
  version: "1.0.0",
  capabilities: {
    prompts: {} 
  }
});

// Register all available prompts
const promptList = getPrompts();
promptList.forEach(promptDef => {
  if (promptDef.arguments && promptDef.arguments.length > 0) {
    // Create a schema for the prompt arguments
    const argsSchema: Record<string, any> = {};
    promptDef.arguments.forEach(arg => {
      argsSchema[arg.name] = arg.required 
        ? z.string() 
        : z.string().optional();
    });
    
      // Register prompt with arguments
      server.prompt(
        promptDef.name,
        promptDef.description || "",
        argsSchema,
        (args, extra) => {
          debug(`Handling prompt request for ${promptDef.name} with args: ${JSON.stringify(args)}`);
          return {
            messages: generatePromptMessages(promptDef.name, args) as {
              role: "user" | "assistant";
              content: { type: "text"; text: string; };
            }[]
          };
        }
      );
    } else {
      // Register prompt with no arguments
      server.prompt(
      promptDef.name,
      promptDef.description || "",
      {},  // Empty args schema for prompts without arguments
      (_args, _extra) => {
        debug(`Handling prompt request for ${promptDef.name}`);
        return {
          messages: generatePromptMessages(promptDef.name, {}) as {
            role: "user" | "assistant";
            content: { type: "text"; text: string; };
          }[]
        };
      }
    );
  }
});

export { server };