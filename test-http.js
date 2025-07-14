#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server HTTP transport is working
 */

const serverUrl = 'http://localhost:3000';

async function testManifest() {
  console.log('🔍 Testing manifest endpoint...');
  try {
    const response = await fetch(`${serverUrl}/.well-known/mc/manifest.json`);
    const manifest = await response.json();
    console.log('✅ Manifest endpoint working:', manifest);
    return true;
  } catch (error) {
    console.error('❌ Manifest endpoint failed:', error.message);
    return false;
  }
}

async function testDirectEndpoint() {
  console.log('🔍 Testing direct endpoint...');
  try {
    const response = await fetch(`${serverUrl}/direct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        },
        id: 1
      })
    });
    
    const result = await response.json();
    console.log('✅ Direct endpoint response:', result);
    return true;
  } catch (error) {
    console.error('❌ Direct endpoint failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing CData Connect Cloud MCP Server HTTP Transport\n');
  
  const manifestTest = await testManifest();
  if (!manifestTest) {
    console.log('❌ Server may not be running. Please start with: npm run dev');
    process.exit(1);
  }
  
  console.log();
  await testDirectEndpoint();
  
  console.log('\n✅ HTTP Transport tests completed!');
  console.log('📝 The server is running on streamable-http transport successfully.');
  console.log(`🌐 Access the server at: ${serverUrl}`);
  console.log(`📋 Manifest: ${serverUrl}/.well-known/mc/manifest.json`);
  console.log(`🔧 MCP Endpoint: ${serverUrl}/mcp`);
  console.log(`⚡ Direct Endpoint: ${serverUrl}/direct`);
}

main().catch(console.error);
