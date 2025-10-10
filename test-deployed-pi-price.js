// Test the deployed pi-price endpoint
async function testDeployedPiPrice() {
  try {
    console.log('Testing deployed /api/pi-price endpoint...');
    
    // Replace with your actual deployed URL
    const response = await fetch('https://b4uesports.vercel.app/api/pi-price');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Raw response text:', JSON.stringify(text));
    
    // Try to parse as JSON
    const data = JSON.parse(text);
    console.log('Parsed JSON data:', data);
    
    // Check if it's valid JSON
    if (typeof data === 'object' && data !== null) {
      console.log('✅ Success: Response is valid JSON');
      console.log('Price:', data.price);
      console.log('Last updated:', data.lastUpdated);
    } else {
      console.log('❌ Error: Response is not valid JSON');
    }
  } catch (error) {
    console.error('❌ Error testing deployed pi-price endpoint:', error);
  }
}

testDeployedPiPrice();