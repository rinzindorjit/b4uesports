/**
 * Verification script to test if the Pi Network API fixes are working
 */
async function verifyDeployment() {
  console.log('🔍 Verifying Pi Network API fixes deployment...\n');
  
  try {
    // Test 1: Check if the API endpoint exists
    console.log('Test 1: Checking if API endpoint exists...');
    const response = await fetch('https://b4uesports.vercel.app/api/pi/create-payment', {
      method: 'OPTIONS'
    });
    
    console.log('✅ API endpoint accessible');
    console.log('   Status:', response.status);
    console.log('   CORS headers present:', response.headers.get('access-control-allow-origin') !== null);
    
    // Test 2: Check environment variables endpoint
    console.log('\nTest 2: Checking environment variables...');
    const envResponse = await fetch('https://b4uesports.vercel.app/api/test-env');
    
    if (envResponse.ok) {
      const envData = await envResponse.json();
      console.log('✅ Environment variables endpoint working');
      console.log('   PI_SERVER_API_KEY:', envData.envVars.PI_SERVER_API_KEY);
      console.log('   PI_SANDBOX_MODE:', envData.envVars.PI_SANDBOX_MODE);
    } else {
      console.log('⚠️  Environment variables endpoint not available (status:', envResponse.status, ')');
    }
    
    // Test 3: Try a simple POST request to create-payment
    console.log('\nTest 3: Testing payment creation endpoint...');
    const paymentResponse = await fetch('https://b4uesports.vercel.app/api/pi/create-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentData: {
          amount: 1.0,
          memo: 'Deployment Verification Test',
          metadata: { test: true, purpose: 'deployment-verification' }
        }
      })
    });
    
    console.log('   Payment creation request status:', paymentResponse.status);
    
    const paymentText = await paymentResponse.text();
    console.log('   Response preview (first 500 chars):', paymentText.substring(0, 500));
    
    // Try to parse as JSON
    try {
      const paymentData = JSON.parse(paymentText);
      if (paymentResponse.ok) {
        console.log('✅ Payment creation endpoint is working correctly');
      } else if (paymentData.error) {
        console.log('⚠️  Payment creation endpoint returned error:', paymentData.error);
        if (paymentData.message) {
          console.log('   Message:', paymentData.message);
        }
      }
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON');
      if (paymentText.includes('403') || paymentText.includes('distribution')) {
        console.log('🚨 CDN blocking detected - this is the issue we need to fix');
      }
    }
    
    console.log('\n========================================');
    console.log('Verification complete!');
    console.log('========================================');
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
    console.log('   This might be due to network issues or the deployment not being complete yet.');
  }
}

// Run verification
verifyDeployment();