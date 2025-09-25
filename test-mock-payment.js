import http from 'http';

// Test the mock payment endpoint
console.log('Testing mock payment endpoint...');

// First, we need to create a mock user and get a token
const authData = JSON.stringify({
  isMockAuth: true
});

const authOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/pi',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(authData)
  }
};

console.log('Creating mock user...');
const authReq = http.request(authOptions, (res) => {
  let authData = '';
  
  res.on('data', (chunk) => {
    authData += chunk;
  });
  
  res.on('end', () => {
    try {
      const authResponse = JSON.parse(authData);
      console.log('Auth response:', authResponse);
      
      if (authResponse.token) {
        console.log('Successfully authenticated. Token:', authResponse.token);
        
        // Now test the mock payment endpoint
        const paymentData = JSON.stringify({
          packageId: 'pubg-1',
          gameAccount: {
            ign: 'TestPlayer',
            uid: '123456789'
          }
        });
        
        const paymentOptions = {
          hostname: 'localhost',
          port: 3001,
          path: '/api/mock-pi-payment',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authResponse.token}`,
            'Content-Length': Buffer.byteLength(paymentData)
          }
        };
        
        console.log('Making mock payment...');
        const paymentReq = http.request(paymentOptions, (res) => {
          let paymentResponseData = '';
          
          res.on('data', (chunk) => {
            paymentResponseData += chunk;
          });
          
          res.on('end', () => {
            try {
              const paymentResponse = JSON.parse(paymentResponseData);
              console.log('Payment response:', paymentResponse);
              
              if (paymentResponse.success) {
                console.log('✅ Mock payment test PASSED');
              } else {
                console.log('❌ Mock payment test FAILED:', paymentResponse.message);
              }
            } catch (error) {
              console.log('❌ Error parsing payment response:', error.message);
              console.log('Response data:', paymentResponseData);
            }
          });
        });
        
        paymentReq.on('error', (error) => {
          console.log('❌ Payment request error:', error.message);
        });
        
        paymentReq.write(paymentData);
        paymentReq.end();
      } else {
        console.log('❌ Authentication failed');
      }
    } catch (error) {
      console.log('❌ Error parsing auth response:', error.message);
      console.log('Response data:', authData);
    }
  });
});

authReq.on('error', (error) => {
  console.log('❌ Auth request error:', error.message);
});

authReq.write(authData);
authReq.end();