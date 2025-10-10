// Test the packages endpoint response
async function testPackagesResponse() {
  try {
    console.log('Testing packages endpoint response...');
    
    const response = await fetch('https://b4uesports.vercel.app/api/packages');
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Raw response text length:', text.length);
    console.log('Raw response text (first 200 chars):', text.substring(0, 200));
    
    // Try to parse as JSON
    const data = JSON.parse(text);
    console.log('Parsed data type:', Array.isArray(data) ? 'array' : typeof data);
    console.log('Number of packages:', Array.isArray(data) ? data.length : 'N/A');
    if (Array.isArray(data) && data.length > 0) {
      console.log('First package:', data[0]);
    }
    
  } catch (error) {
    console.error('Error testing packages response:', error);
  }
}

testPackagesResponse();