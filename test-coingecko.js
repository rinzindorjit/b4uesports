// Test script to check CoinGecko API response
async function testCoinGeckoAPI() {
  try {
    console.log('Testing CoinGecko API...');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=pi-network&vs_currencies=usd&x_cg_demo_api_key=CG-z4MZkBd78fn7PgPhPYcKq1r4';
    console.log('Fetching from:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Raw response text:', JSON.stringify(text));
    console.log('Response text length:', text.length);
    console.log('Characters at positions 10-15:', JSON.stringify(text.substring(10, 15)));
    
    // Try to parse the JSON
    const data = JSON.parse(text);
    console.log('Parsed data:', data);
  } catch (error) {
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testCoinGeckoAPI();