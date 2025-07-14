#!/usr/bin/env node

/**
 * MCP Inspector Setup Validation Script
 * This script validates that the MCP Inspector configuration is correct
 * and provides setup instructions.
 */

const fs = require('fs');
const path = require('path');

function checkFile(filename, description) {
  const exists = fs.existsSync(filename);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filename}`);
  return exists;
}

function checkConfigFile() {
  const configPath = 'mcp-inspector.json';
  if (!checkFile(configPath, 'MCP Inspector config')) {
    return false;
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const servers = Object.keys(config.mcpServers || {});
    console.log(`   📋 Configured servers: ${servers.join(', ')}`);
    return true;
  } catch (error) {
    console.log(`   ❌ Invalid JSON in ${configPath}: ${error.message}`);
    return false;
  }
}

function checkEnvironment() {
  const envExists = checkFile('.env', 'Environment file');
  const templateExists = checkFile('.env.example', 'Environment template');
  
  if (!envExists && templateExists) {
    console.log('   💡 Copy .env.example to .env and configure your credentials');
  }
  
  return envExists || templateExists;
}

function printUsageInstructions() {
  console.log('\n📖 MCP Inspector Usage Instructions:');
  console.log('');
  console.log('1. 🏗️  Setup (one-time):');
  console.log('   cp .env.example .env');
  console.log('   # Edit .env with your CData Connect Cloud credentials');
  console.log('');
  console.log('2. 🧪 Testing with Inspector:');
  console.log('');
  console.log('   # Web UI mode (recommended):');
  console.log('   npm run inspector');
  console.log('');
  console.log('   # STDIO transport (auto-starts server):');
  console.log('   npm run inspector:stdio');
  console.log('');
  console.log('   # HTTP transport (start server first):');
  console.log('   npm run dev:http        # Terminal 1');
  console.log('   npm run inspector:http  # Terminal 2');
  console.log('');
  console.log('   # CLI mode for quick testing:');
  console.log('   npm run inspector:cli');
  console.log('');
  console.log('3. 🔍 Available Endpoints (HTTP mode):');
  console.log('   • MCP: http://localhost:3000/mcp');
  console.log('   • Direct: http://localhost:3000/direct');
  console.log('   • Manifest: http://localhost:3000/.well-known/mc/manifest.json');
  console.log('   • Health: http://localhost:3000/health');
}

function main() {
  console.log('🚀 CData Connect Cloud MCP Server - Inspector Setup Validation\n');
  
  let allGood = true;
  
  console.log('📁 Checking required files...');
  allGood &= checkFile('package.json', 'Package configuration');
  allGood &= checkFile('dist/index.js', 'Built server') || checkFile('src/index.ts', 'Source code');
  allGood &= checkConfigFile();
  allGood &= checkEnvironment();
  
  console.log('\n📦 Checking npm scripts...');
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const inspectorScripts = Object.keys(pkg.scripts || {}).filter(s => s.includes('inspector'));
    console.log(`✅ Inspector scripts: ${inspectorScripts.join(', ')}`);
  } catch (error) {
    console.log('❌ Failed to read package.json scripts');
    allGood = false;
  }
  
  console.log(`\n${allGood ? '🎉' : '⚠️'} Setup Status: ${allGood ? 'Ready for testing!' : 'Needs attention'}`);
  
  printUsageInstructions();
  
  console.log('\n💡 Tips:');
  console.log('• The inspector requires Node.js 22+ for optimal performance');
  console.log('• Use HTTP transport for web-based testing');
  console.log('• Use STDIO transport for command-line integration');
  console.log('• Check logs if connections fail (LOG_ENABLED=true)');
}

if (require.main === module) {
  main();
}
