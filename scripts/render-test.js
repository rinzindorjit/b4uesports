#!/usr/bin/env node

// Simple test script for Render deployment
console.log('Render deployment test script');
console.log('============================');

// Check if required environment variables are set
const requiredEnvVars = [
  'EMAILJS_SERVICE_ID',
  'EMAILJS_TEMPLATE_ID',
  'EMAILJS_ADMIN_TEMPLATE_ID',
  'EMAILJS_PUBLIC_KEY',
  'ADMIN_EMAIL',
  'PI_SECRET_KEY',
  'PI_SERVER_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET'
];

console.log('Checking environment variables...');
let allSet = true;

for (const envVar of requiredEnvVars) {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: SET`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
    allSet = false;
  }
}

console.log('\nChecking Node.js version...');
console.log(`✅ Node.js version: ${process.version}`);

console.log('\nChecking platform...');
console.log(`✅ Platform: ${process.platform}`);

console.log('\nDeployment test completed.');
if (allSet) {
  console.log('✅ All required environment variables are set. Ready for deployment!');
} else {
  console.log('⚠️  Some environment variables are missing. Please set them before deploying.');
}

// Export for use as a module
module.exports = { requiredEnvVars };