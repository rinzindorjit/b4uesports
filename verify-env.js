// Simple script to verify environment variables
async function verifyEnv() {
  try {
    console.log('Verifying environment variables...');
    
    // Test the environment variables endpoint
    const response = await fetch('https://b4uesports.vercel.app/api/test-env', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Verification failed:', error.message);
  }
}

// Run the verification
verifyEnv();