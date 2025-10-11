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
          "Accept": "application/json",
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
        'Accept': 'application/json',
      });

      // Test API key validity first
      console.log('Testing API key validity...');
      const testResponse = await fetch(`${PI_API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'B4U-Esports-App/1.0'
        }
      });
      
      console.log(`API key test response status:`, testResponse.status);
      console.log(`API key test response headers:`, Object.fromEntries(testResponse.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const testContentType = testResponse.headers.get('content-type') || '';
      console.log('API key test Content-Type:', testContentType);
      
      if (testContentType.includes('text/html')) {
        const errorText = await testResponse.text();
        console.error('❌ Received HTML response instead of JSON for API key test');
        console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
        return false;
      }
      
      if (!testResponse.ok) {
        const testError = await testResponse.text();
        console.error('API key test failed:', testResponse.status, testError);
        return false;
      }

      // First, check if the payment exists and is in the correct state
      console.log('Checking payment status before approval...');
      const statusCheck = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Accept': 'application/json',
          'User-Agent': 'B4U-Esports-App/1.0'
        }
      });
      
      console.log(`Payment status check response status:`, statusCheck.status);
      console.log(`Payment status check response headers:`, Object.fromEntries(statusCheck.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const statusCheckContentType = statusCheck.headers.get('content-type') || '';
      console.log('Payment status check Content-Type:', statusCheckContentType);
      
      if (statusCheckContentType.includes('text/html')) {
        const errorText = await statusCheck.text();
        console.error('❌ Received HTML response instead of JSON for payment status check');
        console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
        return false;
      }
      
      if (!statusCheck.ok) {
        const statusError = await statusCheck.text();
        console.error('Payment status check failed:', statusCheck.status, statusError);
        return false;
      }
      
      let paymentStatus: any;
      try {
        paymentStatus = await statusCheck.json();
      } catch (parseError) {
        const errorText = await statusCheck.text();
        console.error('❌ Failed to parse JSON response for payment status:', errorText);
        return false;
      }
      
      console.log('Payment status:', paymentStatus);
      
      // Check if payment is in a valid state for approval
      if (paymentStatus.status !== 'created') {
        console.error('Payment is not in "created" status:', paymentStatus.status);
        return false;
      }

      // Try different approaches to make the request
      // Approach 1: POST with empty JSON body and Accept header
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'B4U-Esports-App/1.0'
          },
          body: JSON.stringify({}),
        }
      );
      
      console.log(`Pi Network API response status:`, response.status);
      console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const contentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', contentType);
      
      if (contentType.includes('text/html')) {
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
        'Accept': 'application/json',
      });
      console.log('- Body:', { txid });

      // Try different approaches to make the request
      // Approach 1: POST with JSON body containing txid and Accept header
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'B4U-Esports-App/1.0'
          },
          body: JSON.stringify({ txid }),
        }
      );
      
      console.log(`Pi Network API response status:`, response.status);
      console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const contentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', contentType);
      
      if (contentType.includes('text/html')) {
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
          'Accept': 'application/json',
          'User-Agent': 'B4U-Esports-App/1.0'
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
      // Approach 1: POST with empty JSON body and Accept header
      let response = await fetch(
        `${PI_API_BASE_URL}/payments/${paymentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'B4U-Esports-App/1.0'
          },
          body: JSON.stringify({}),
        }
      );
      
      console.log(`Pi Network API response status:`, response.status);
      console.log(`Pi Network API response headers:`, Object.fromEntries(response.headers.entries()));
      
      // Check if we got HTML content (which indicates an error)
      const contentType = response.headers.get('content-type') || '';
      console.log('Response Content-Type:', contentType);
      
      if (contentType.includes('text/html')) {
        const errorText = await response.text();
        console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
        console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
        return false;
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
            'Accept': 'application/json',
            'User-Agent': 'B4U-Esports-App/1.0'
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