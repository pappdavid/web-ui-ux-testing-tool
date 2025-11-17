#!/usr/bin/env node

/**
 * Create Neon PostgreSQL database
 * Requires: NEON_API_KEY environment variable
 */

const https = require('https');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Neon Database Setup');
console.log('=====================');
console.log('');

// Check for API key
if (!process.env.NEON_API_KEY) {
  console.log('To use Neon API, you need an API key:');
  console.log('1. Sign up at https://neon.tech (free)');
  console.log('2. Go to https://console.neon.tech/app/settings/account');
  console.log('3. Generate an API key');
  console.log('4. Run: NEON_API_KEY=your-key node scripts/create-neon-db.js');
  console.log('');
  console.log('Alternatively, create a project manually:');
  console.log('1. Go to https://console.neon.tech');
  console.log('2. Create a new project');
  console.log('3. Copy the connection string');
  console.log('');
  
  rl.question('Paste your Neon connection string here (or press Enter to skip): ', (connStr) => {
    if (connStr && connStr.startsWith('postgresql://')) {
      saveConnectionString(connStr);
    } else {
      console.log('Skipping Neon setup. Please set up a database manually.');
      rl.close();
    }
  });
} else {
  createNeonProject(process.env.NEON_API_KEY);
}

function saveConnectionString(connStr) {
  const fs = require('fs');
  const envContent = `DATABASE_URL="${connStr}"
NEXTAUTH_SECRET="test-secret-key-for-local-development-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PATH="./storage"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('');
  console.log('✅ Saved DATABASE_URL to .env');
  console.log('');
  console.log('Next steps:');
  console.log('1. npx prisma migrate deploy');
  console.log('2. npm run db:seed');
  console.log('3. Restart dev server');
  rl.close();
}

function createNeonProject(apiKey) {
  console.log('Creating Neon project via API...');
  // Neon API implementation would go here
  // For now, fall back to manual setup
  console.log('API setup not fully implemented. Please use manual setup.');
  rl.close();
}

