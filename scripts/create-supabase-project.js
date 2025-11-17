#!/usr/bin/env node

/**
 * Script to help create Supabase database
 * This opens the browser to Supabase and provides instructions
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Supabase Database Setup');
console.log('===========================');
console.log('');
console.log('This script will help you create a Supabase database.');
console.log('');

// Try to open browser
try {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = 'open';
  } else if (platform === 'win32') {
    command = 'start';
  } else {
    command = 'xdg-open';
  }
  
  console.log('Opening Supabase in your browser...');
  execSync(`${command} https://supabase.com/dashboard/projects`);
} catch (error) {
  console.log('Please manually open: https://supabase.com/dashboard/projects');
}

console.log('');
console.log('Steps:');
console.log('1. Sign up/Login to Supabase (free)');
console.log('2. Click "New Project"');
console.log('3. Fill in project details:');
console.log('   - Name: web-ui-ux-testing-tool');
console.log('   - Database Password: (choose a strong password)');
console.log('   - Region: (choose closest)');
console.log('4. Wait for project to be created (~2 minutes)');
console.log('5. Go to Project Settings → Database');
console.log('6. Copy the "Connection string" (URI format)');
console.log('');

rl.question('Paste your Supabase connection string here: ', (connectionString) => {
  if (connectionString && connectionString.startsWith('postgresql://')) {
    console.log('');
    console.log('✅ Connection string received!');
    console.log('');
    console.log('Adding to Vercel environment variables...');
    
    // Try to add to Vercel
    try {
      const { execSync } = require('child_process');
      execSync(`vercel env add DATABASE_URL production <<< "${connectionString}"`, { stdio: 'inherit' });
      console.log('');
      console.log('✅ DATABASE_URL added to Vercel!');
      console.log('');
      console.log('Next steps:');
      console.log('1. vercel env pull .env.local');
      console.log('2. npx prisma migrate deploy');
      console.log('3. npm run db:seed');
    } catch (error) {
      console.log('');
      console.log('⚠️  Could not add to Vercel automatically.');
      console.log('Please run manually:');
      console.log(`   vercel env add DATABASE_URL production`);
      console.log(`   Then paste: ${connectionString}`);
    }
    
    // Also save locally
    const fs = require('fs');
    const envContent = `DATABASE_URL="${connectionString}"
NEXTAUTH_SECRET="test-secret-key-for-local-development-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PATH="./storage"
PLAYWRIGHT_BROWSERS_PATH="./.playwright"
`;
    fs.writeFileSync('.env', envContent);
    console.log('');
    console.log('✅ Saved to .env file for local development');
  } else {
    console.log('❌ Invalid connection string format');
    console.log('Expected format: postgresql://postgres:[password]@[host]:5432/postgres');
  }
  
  rl.close();
});

