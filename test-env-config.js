/**
 * Test script for environment configuration
 * 
 * This script tests the environment variables needed for Pi Network integration.
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

console.log('🧪 Testing Environment Configuration');
console.log('===================================');

// Test environment variables
console.log('\n🔍 Environment Variables Check:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PI_SANDBOX: ${process.env.PI_SANDBOX || 'not set'}`);
console.log(`PI_SERVER_API_KEY: ${process.env.PI_SERVER_API_KEY ? 'Set (length: ' + process.env.PI_SERVER_API_KEY.length + ')' : 'not set'}`);
console.log(`PI_API_KEY: ${process.env.PI_API_KEY ? 'Set (length: ' + process.env.PI_API_KEY.length + ')' : 'not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set (length: ' + process.env.JWT_SECRET.length + ')' : 'not set'}`);

// Test Pi Network configuration
const PI_SANDBOX = String(process.env.PI_SANDBOX || "").toLowerCase() === "true";
const PI_SERVER_URL = PI_SANDBOX ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
const PI_API_KEY = process.env.PI_SERVER_API_KEY || process.env.PI_API_KEY;

console.log('\n🔧 Pi Network Configuration:');
console.log(`Sandbox Mode: ${PI_SANDBOX}`);
console.log(`Server URL: ${PI_SERVER_URL}`);
console.log(`API Key Available: ${!!PI_API_KEY}`);

if (!PI_API_KEY) {
    console.log('❌ ERROR: Pi Network API Key is missing!');
    console.log('   Please set either PI_SERVER_API_KEY or PI_API_KEY environment variable.');
}

if (!process.env.JWT_SECRET) {
    console.log('❌ ERROR: JWT Secret is missing!');
    console.log('   Please set JWT_SECRET environment variable.');
}

console.log('\n📋 Summary:');
if (PI_API_KEY && process.env.JWT_SECRET) {
    console.log('✅ All required environment variables are set');
    console.log('✅ Pi Network integration should work correctly');
} else {
    console.log('❌ Missing required environment variables');
    console.log('❌ Pi Network integration may fail');
}

console.log('\n💡 Tips:');
console.log('   1. Create a .env file in the root directory');
console.log('   2. Add the required environment variables:');
console.log('      PI_SERVER_API_KEY=your_pi_api_key_here');
console.log('      PI_SANDBOX=true');
console.log('      JWT_SECRET=your_jwt_secret_here');
console.log('   3. Restart the development server');