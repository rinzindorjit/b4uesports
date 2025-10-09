import { get } from 'https';

function checkMainPage() {
  console.log('Checking main page...');
  
  get('https://b4uesports-8c2nd4uex-rinzin-s-projects.vercel.app/', (res) => {
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

checkMainPage();