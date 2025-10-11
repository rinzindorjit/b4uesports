import fetch from 'node-fetch';
// Determine if we're in sandbox (Testnet) mode based on environment
const isSandbox = process.env.PI_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
const PI_API_BASE_URL = isSandbox ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
console.log(`Pi Network service initialized in ${isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION (Mainnet)'} mode`);
export const piNetworkService = {
    isSandbox,
    verifyAccessToken: async (accessToken) => {
        try {
            const res = await fetch(`${PI_API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "User-Agent": "B4U-Esports-App/1.0",
                },
            });
            
            if (!res.ok) {
                console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} /me failed:`, res.statusText);
                return null;
            }
            
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                const errorText = await res.text();
                console.error('❌ Received HTML response instead of JSON for access token verification');
                console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
                return null;
            }
            
            const user = await res.json();
            console.log(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verified user:`, user);
            return user;
        }
        catch (error) {
            console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verification error:`, error.message);
            return null;
        }
    },
    // Payment approval method
    approvePayment: async (paymentId, apiKey) => {
        try {
            // Pre-validation: Check if payment exists and is in 'created' status
            const paymentDetails = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0'
                },
            });
            
            if (!paymentDetails.ok) {
                const errorDetails = await paymentDetails.text();
                console.error('Payment details fetch failed:', paymentDetails.status, errorDetails);
                return false;
            }
            
            const paymentData = await paymentDetails.json();
            if (paymentData.status !== 'created') {
                console.error('Payment is not in created status:', paymentData.status);
                return false;
            }
            
            const response = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0',
                },
            });
            
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                const errorText = await response.text();
                console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
                console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
                return false;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Payment approval failed:', response.status, errorData);
                return false;
            }
            
            console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return true;
        }
        catch (error) {
            console.error('Payment approval failed:', error.message);
            return false;
        }
    },
    // Payment completion method
    completePayment: async (paymentId, txid, apiKey) => {
        try {
            // Pre-validation: Check if payment exists and is in 'approved' status
            const paymentDetails = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0'
                },
            });
            
            if (!paymentDetails.ok) {
                const errorDetails = await paymentDetails.text();
                console.error('Payment details fetch failed:', paymentDetails.status, errorDetails);
                return false;
            }
            
            const paymentData = await paymentDetails.json();
            if (paymentData.status !== 'approved') {
                console.error('Payment is not in approved status:', paymentData.status);
                return false;
            }
            
            const response = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}/complete`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0',
                },
                body: JSON.stringify({ txid }),
            });
            
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('text/html')) {
                const errorText = await response.text();
                console.error('❌ Received HTML response instead of JSON - likely a CloudFront error');
                console.error('HTML Response (first 1000 chars):', errorText.substring(0, 1000));
                return false;
            }
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Payment completion failed:', response.status, errorData);
                return false;
            }
            
            console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
            return true;
        }
        catch (error) {
            console.error('Payment completion failed:', error.message);
            return false;
        }
    },
    // Get payment details
    getPayment: async (paymentId, apiKey) => {
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
        }
        catch (error) {
            console.error('Get payment failed:', error.message);
            return null;
        }
    },
    // Cancel payment
    cancelPayment: async (paymentId, apiKey) => {
        try {
            const response = await fetch(`${PI_API_BASE_URL}/payments/${paymentId}/cancel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0'
                },
                body: JSON.stringify({}),
            });
            
            const contentType = response.headers.get('content-type') || '';
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
        }
        catch (error) {
            console.error('Payment cancellation failed:', error.message);
            return false;
        }
    },
    // Create A2U (App-to-User) payment
    createA2UPayment: async (paymentData, apiKey) => {
        try {
            const response = await fetch(`${PI_API_BASE_URL}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'User-Agent': 'B4U-Esports-App/1.0'
                },
                body: JSON.stringify({ payment: paymentData }),
            });
            
            if (!response.ok) {
                console.error(`A2U Payment creation failed: ${response.status} ${response.statusText}`);
                return null;
            }
            
            const data = await response.json();
            console.log(`A2U Payment created on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, data);
            return data;
        }
        catch (error) {
            console.error('A2U Payment creation failed:', error.message);
            return null;
        }
    }
};