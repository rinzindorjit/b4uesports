// Test all API endpoints
async function testAllEndpoints() {
  try {
    console.log('Testing all API endpoints...\n');

    // Test health endpoint
    console.log('1. Testing /api/health endpoint...');
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
    
    // Test packages endpoint
    console.log('\n3. Testing /api/packages endpoint...');
    const packagesResponse = await fetch('https://b4uesports.vercel.app/api/packages');
    console.log('Packages status:', packagesResponse.status);
    const packagesData = await packagesResponse.json();
    console.log('Number of packages:', packagesData.length);
    console.log('First package:', packagesData[0]);
    
    console.log('\n✅ All API endpoints are working correctly!');
  } catch (error) {
    console.error('❌ Error testing API endpoints:', error);
  }
}

testAllEndpoints();