import fetch from 'node-fetch';

// Determine if we're in sandbox (Testnet) mode based on environment
const isSandbox = process.env.PI_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
const PI_API_BASE_URL = isSandbox ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';

console.log(`Pi Network service initialized in ${isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION (Mainnet)'} mode`);

export const piNetworkService = {
  isSandbox,
  
  verifyAccessToken: async (accessToken: string) => {
    try {
      const res = await fetch(`${PI_API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} /me failed:`, res.statusText);
        return null;
      }

      const user = await res.json();
      console.log(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verified user:`, user);
      return user;
    } catch (error: any) {
      console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verification error:`, error.message);
      return null;
    }
  },
  
  // Payment approval method
  approvePayment: async (paymentId: string, apiKey: string) => {
    try {
      console.log('Approving payment with Pi Network API:');
      console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/approve`);
      console.log('- Headers:', {
        'Authorization': `Key ${apiKey.substring(0, 8)}...`,
        'Content-Type': 'application/json',
      });

      // Try different approaches to make the request
      // Approach 1: POST with empty JSON body
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      
      // If we get HTML content, try a different approach
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.log('First approach failed with HTML response, trying alternative approach...');
        
        // Approach 2: POST with no body
        response = await fetch(
          `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Key ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      console.log(`Pi Network API response status:`, response.status);
      console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const finalContentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', finalContentType);
      
      if (finalContentType.includes('text/html')) {
        const errorText = await response.text();
        console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
        console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
        return false;
      }
      
      // Parse JSON response
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (parseError) {
        const errorText = await response.text();
        console.error('❌ Failed to parse JSON response:', errorText);
        return false;
      }
      
      if (response.ok) {
        console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
        return true;
      } else {
        console.error('Payment approval failed:', response.status, responseData);
        return false;
      }
    } catch (error: any) {
      console.error('Payment approval failed:', error.message);
      return false;
    }
  },

  // Payment completion method
  completePayment: async (paymentId: string, txid: string, apiKey: string) => {
    try {
      console.log('Completing payment with Pi Network API:');
      console.log('- URL:', `${PI_API_BASE_URL}/payments/${paymentId}/complete`);
      console.log('- Headers:', {
        'Authorization': `Key ${apiKey.substring(0, 8)}...`,
        'Content-Type': 'application/json',
      });
      console.log('- Body:', { txid });

      // Try different approaches to make the request
      // Approach 1: POST with JSON body containing txid
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ txid }),
        }
      );
      
      // If we get HTML content, try a different approach
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.log('First approach failed with HTML response, trying alternative approach...');
        
        // Approach 2: POST with form-encoded body
        response = await fetch(
          `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Key ${apiKey}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `txid=${encodeURIComponent(txid)}`,
          }
        );
      }
      
      console.log(`Pi Network API response status:`, response.status);
      console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const finalContentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', finalContentType);
      
      if (finalContentType.includes('text/html')) {
        const errorText = await response.text();
        console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
        console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
        return false;
      }
      
      // Parse JSON response
      let responseData: any;
      try {
        responseData = await response.json();
      } catch (parseError) {
        const errorText = await response.text();
        console.error('❌ Failed to parse JSON response:', errorText);
        return false;
      }
      
      if (response.ok) {
        console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
        return true;
      } else {
        console.error('Payment completion failed:', response.status, responseData);
        return false;
      }
    } catch (error: any) {
      console.error('Payment completion failed:', error.message);
      return false;
    }
  },

  // Get payment details
  getPayment: async (paymentId: string, apiKey: string) => {
    try {
      const response = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      });
      
      if (!response.ok) {
        console.error(`Get payment failed: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`Retrieved payment from ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
      return data;
    } catch (error: any) {
      console.error('Get payment failed:', error.message);
      return null;
    }
  },

  // Cancel payment
  cancelPayment: async (paymentId: string, apiKey: string) => {
    try {
      // Try different approaches to make the request
      // Approach 1: POST with empty JSON body
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );
      
      // If we get HTML content, try a different approach
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.log('First approach failed with HTML response, trying alternative approach...');
        
        // Approach 2: POST with no body
        response = await fetch(
          `${PI_API_BASE_URL}/payments/${paymentId}/cancel`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Key ${apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );
      }
      
      if (!response.ok) {
        console.error(`Payment cancellation failed: ${response.status} ${response.statusText}`);
        return false;
      }
      
      console.log(`Payment cancelled on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
      return true;
    } catch (error: any) {
      console.error('Payment cancellation failed:', error.message);
      return false;
    }
  },
  
  // Create A2U (App-to-User) payment
  createA2UPayment: async (paymentData: any, apiKey: string) => {
    try {
      const response = await fetch(
        `${PI_API_BASE_URL}/payments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payment: paymentData }),
        }
      );
      
      if (!response.ok) {
        console.error(`A2U Payment creation failed: ${response.status} ${response.statusText}`);
        return null;
      }
      
      const data = await response.json();
      console.log(`A2U Payment created on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, data);
      return data;
    } catch (error: any) {
      console.error('A2U Payment creation failed:', error.message);
      return null;
    }
  }
};