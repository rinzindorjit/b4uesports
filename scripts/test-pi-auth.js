#!/usr/bin/env node

/**
 * Test script for Pi Network authentication
 * This script tests the Pi Network authentication flow without running the full application
 */

import axios from 'axios';
import { config } from 'dotenv';
import { piNetworkService } from '../server/services/pi-network.js';

// Load environment variables
config();

async function testPiNetworkService() {
  console.log('Testing Pi Network Service...');
  
  // Test if the service is in mock mode or real mode
  console.log('Pi Network Service Configuration:');
  console.log('- API Key:', piNetworkService.apiKey ? 'SET' : 'NOT SET');
  console.log('- App ID:', piNetworkService.appId ? 'SET' : 'NOT SET');
  console.log('- Mock Mode:', piNetworkService.isMockMode ? 'YES' : 'NO');
  
  if (piNetworkService.isMockMode) {
    console.log('\nRunning in Mock Mode - Testing Mock Functions');
    
    // Test mock authentication
    const mockUser = await piNetworkService.verifyAccessToken('mock-token');
    console.log('Mock User:', mockUser);
    
    // Test mock payment functions
    const mockApproval = await piNetworkService.approvePayment('mock-payment-id');
    console.log('Mock Payment Approval:', mockApproval);
    
    const mockCompletion = await piNetworkService.completePayment('mock-payment-id', 'mock-txid');
    console.log('Mock Payment Completion:', mockCompletion);
    
    const mockPayment = await piNetworkService.getPayment('mock-payment-id');
    console.log('Mock Payment Data:', mockPayment);
  } else {
    console.log('\nRunning in Real Mode - Testing Real Pi Network Functions');
    console.log('NOTE: Real tests require valid API keys and may incur costs');
    
    // Test real payment functions with invalid data to verify connectivity
    try {
      const payment = await piNetworkService.getPayment('invalid-payment-id');
      console.log('Payment Data:', payment);
    } catch (error) {
      console.log('Expected error for invalid payment ID:', error.message);
    }
  }
  
  console.log('\nPi Network Service Test Complete');
}

// Run the test
testPiNetworkService().catch(console.error);