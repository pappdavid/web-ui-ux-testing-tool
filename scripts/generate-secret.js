#!/usr/bin/env node

/**
 * Generate a secure random secret for NEXTAUTH_SECRET
 */

const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');

console.log('🔐 Generated NEXTAUTH_SECRET:');
console.log('');
console.log(secret);
console.log('');
console.log('Add this to your .env.production.local or Vercel environment variables');
console.log('');

