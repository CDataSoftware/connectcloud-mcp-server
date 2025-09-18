#!/usr/bin/env node

const fs = require('fs');

function validateServerJson() {
  try {
    console.log('📋 Reading server.json...');
    const serverJson = JSON.parse(fs.readFileSync('server.json', 'utf8'));

    // Perform basic structural validation
    const errors = [];

    // Required fields
    if (!serverJson.name) errors.push('Missing required field: name');
    if (!serverJson.description) errors.push('Missing required field: description');
    if (!serverJson.deployments) errors.push('Missing required field: deployments');

    // Validate name format for GitHub namespace
    if (serverJson.name && !serverJson.name.startsWith('io.github.')) {
      console.warn('⚠️  Warning: Name should start with "io.github." for GitHub namespace authentication');
    }

    // Validate deployments
    if (serverJson.deployments) {
      if (!serverJson.deployments.packages || !Array.isArray(serverJson.deployments.packages)) {
        errors.push('deployments.packages must be an array');
      } else if (serverJson.deployments.packages.length === 0) {
        errors.push('deployments.packages must contain at least one package');
      } else {
        serverJson.deployments.packages.forEach((pkg, index) => {
          if (!pkg.type) errors.push(`Package ${index}: missing type`);
          if (!pkg.name) errors.push(`Package ${index}: missing name`);
          if (!pkg.version) errors.push(`Package ${index}: missing version`);
          if (pkg.validation && !pkg.validation.serverName) {
            errors.push(`Package ${index}: validation.serverName is required`);
          }
        });
      }
    }

    // Validate features
    if (serverJson.features) {
      const validFeatures = ['tools', 'prompts', 'resources', 'sampling'];
      Object.keys(serverJson.features).forEach(feature => {
        if (!validFeatures.includes(feature)) {
          errors.push(`Invalid feature: ${feature}`);
        }
      });
    }

    // Validate config
    if (serverJson.config) {
      if (serverJson.config.required) {
        Object.entries(serverJson.config.required).forEach(([key, value]) => {
          if (!value.type) errors.push(`Config required.${key}: missing type`);
          if (!value.description) errors.push(`Config required.${key}: missing description`);
        });
      }
      if (serverJson.config.optional) {
        Object.entries(serverJson.config.optional).forEach(([key, value]) => {
          if (!value.type) errors.push(`Config optional.${key}: missing type`);
          if (!value.description) errors.push(`Config optional.${key}: missing description`);
        });
      }
    }

    if (errors.length > 0) {
      console.error('❌ Validation failed with errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      return false;
    }

    console.log('✅ server.json is structurally valid!');
    console.log('\n📝 Server Configuration:');
    console.log(`  Name: ${serverJson.name}`);
    console.log(`  Description: ${serverJson.description}`);
    if (serverJson.deployments.packages[0]) {
      console.log(`  Version: ${serverJson.deployments.packages[0].version}`);
      console.log(`  NPM Package: ${serverJson.deployments.packages[0].name}`);
    }
    console.log('\n🎯 Features:');
    if (serverJson.features) {
      Object.entries(serverJson.features).forEach(([feature, enabled]) => {
        console.log(`  ${enabled ? '✅' : '❌'} ${feature}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    return false;
  }
}

// Run validation
const valid = validateServerJson();
process.exit(valid ? 0 : 1);