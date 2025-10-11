/**
 * Test script for users API endpoint
 * 
 * This script tests the users API endpoint that handles authentication verification.
 */

import fetch from 'node-fetch';

console.log('🧪 Testing Users API Endpoint');
console.log('=============================');

// Test the users API endpoint
async function testUsersAPI() {
    try {
        console.log('\n🔍 Testing /api/users endpoint...');
        
        // Test POST request to /api/users
        const response = await fetch('http://localhost:5000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: 'authenticate',
                data: {
                    accessToken: 'test_token_12345'
                }
            })
        });
        
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        
        const responseBody = await response.text();
        console.log(`Response Body: ${responseBody}`);
        
        if (response.ok) {
            console.log('✅ Users API endpoint is working correctly');
        } else {
            console.log('❌ Users API endpoint returned an error');
            console.log('   This might indicate an issue with the backend implementation');
        }
        
    } catch (error) {
        console.error('❌ Error testing Users API endpoint:', error.message);
        console.log('   This might indicate the server is not running or there is a network issue');
    }
}

// Test the health API endpoint as a baseline
async function testHealthAPI() {
    try {
        console.log('\n🔍 Testing /api/health endpoint...');
        
        const response = await fetch('http://localhost:5000/api/health');
        console.log(`Health API Status: ${response.status}`);
        
        if (response.ok) {
            console.log('✅ Health API endpoint is working correctly');
        } else {
            console.log('❌ Health API endpoint returned an error');
        }
        
    } catch (error) {
        console.error('❌ Error testing Health API endpoint:', error.message);
    }
}

// Run the tests
async function runTests() {
    await testHealthAPI();
    await testUsersAPI();
    
    console.log('\n📋 Summary:');
    console.log('   If the Health API works but Users API fails,');
    console.log('   there might be an issue with Pi Network API integration.');
    console.log('   Check the server logs for more detailed error information.');
}

runTests();