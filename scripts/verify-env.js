#!/usr/bin/env node

/**
 * Verify production environment variables are set correctly
 */

const fs = require('fs');
const path = require('path');

const requiredVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

const envFile = process.env.ENV_FILE || '.env.production.local';
const envPath = path.join(process.cwd(), envFile);

console.log('🔍 Verifying Environment Variables');
console.log('==================================');
console.log('');

if (!fs.existsSync(envPath)) {
  console.log(`❌ Environment file not found: ${envPath}`);
  console.log('');
  console.log('Create it by copying .env.production.example:');
  console.log(`  cp .env.production.example ${envFile}`);
  process.exit(1);
}

// Load environment variables
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      envVars[key.trim()] = value.trim();
    }
  }
});

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log('Required Variables:');
console.log('-------------------');

requiredVars.forEach(varName => {
  const value = envVars[varName] || process.env[varName];
  
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    hasErrors = true;
  } else if (value.includes('change-this') || value.includes('your-')) {
    console.log(`⚠️  ${varName}: Set but contains placeholder value`);
    hasWarnings = true;
  } else {
    // Mask sensitive values
    const masked = varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')
      ? value.substring(0, 8) + '...' + value.substring(value.length - 4)
      : value.length > 50 ? value.substring(0, 50) + '...' : value;
    console.log(`✅ ${varName}: ${masked}`);
  }
});

console.log('');

// Validate DATABASE_URL format
if (envVars.DATABASE_URL || process.env.DATABASE_URL) {
  const dbUrl = envVars.DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
    console.log('⚠️  DATABASE_URL should start with postgresql:// or postgres://');
    hasWarnings = true;
  }
  if (dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
    console.log('⚠️  Using localhost in DATABASE_URL - ensure this is correct for production');
    hasWarnings = true;
  }
}

// Validate NEXTAUTH_SECRET
if (envVars.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET) {
  const secret = envVars.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret.length < 32) {
    console.log('⚠️  NEXTAUTH_SECRET should be at least 32 characters long');
    hasWarnings = true;
  }
}

// Validate NEXTAUTH_URL
if (envVars.NEXTAUTH_URL || process.env.NEXTAUTH_URL) {
  const url = envVars.NEXTAUTH_URL || process.env.NEXTAUTH_URL;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.log('⚠️  NEXTAUTH_URL should start with http:// or https://');
    hasWarnings = true;
  }
  if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.log('⚠️  Using localhost in NEXTAUTH_URL for production - this may cause issues');
    hasWarnings = true;
  }
}

console.log('');

if (hasErrors) {
  console.log('❌ Environment verification failed');
  console.log('   Please fix the errors above before deploying');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Environment verification completed with warnings');
  console.log('   Please review the warnings above');
  process.exit(0);
} else {
  console.log('✅ All environment variables are set correctly');
  process.exit(0);
}

