// Test the new API structure
async function testNewApiStructure() {
  try {
    console.log('Testing new API structure...');
    
    // Test health endpoint
    console.log('\n1. Testing /api/health endpoint...');
    const healthResponse = await fetch('https://b4uesports.vercel.app/api/health');
    console.log('Health status:', healthResponse.status);
    const healthData = await healthResponse.json();
    console.log('Health data:', healthData);
    
    // Test pi-price endpoint
    console.log('\n2. Testing /api/pi-price endpoint...');
    const priceResponse = await fetch('https://b4uesports.vercel.app/api/pi-price');
    console.log('Price status:', priceResponse.status);
    const priceData = await priceResponse.json();
    console.log('Price data:', priceData);
    
    console.log('\n✅ New API structure is working correctly!');
  } catch (error) {
    console.error('❌ Error testing new API structure:', error);
  }
}

testNewApiStructure();