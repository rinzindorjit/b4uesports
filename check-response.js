import { get } from 'https';

function checkUrl(url) {
  console.log(`Checking ${url}...`);
  
  get(url, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Status Code: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
      if (data.length > 0) {
        console.log(`Body: ${data.substring(0, 500)}${data.length > 500 ? '...' : ''}`);
        console.log(`Body length: ${data.length} characters`);
      }
      console.log('---');
    });
  }).on('error', (err) => {
    console.log(`Error: ${err.message}`);
  });
}

// Check various URLs
checkUrl('https://b4uesports.vercel.app/');
checkUrl('https://b4uesports.vercel.app/index.html');
checkUrl('https://b4uesports.vercel.app/index-CdZFCnM6.js');
checkUrl('https://b4uesports.vercel.app/index-BqeVzBDh.css');
checkUrl('https://b4uesports.vercel.app/api/pi-price');