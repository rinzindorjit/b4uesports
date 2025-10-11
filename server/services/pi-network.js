import axios from 'axios';
// Determine if we're in sandbox (Testnet) mode based on environment
const isSandbox = process.env.PI_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
const PI_API_BASE_URL = isSandbox ? 'https://sandbox.minepi.com/v2' : 'https://api.minepi.com/v2';
console.log(`Pi Network service initialized in ${isSandbox ? 'SANDBOX (Testnet)' : 'PRODUCTION (Mainnet)'} mode`);
export const piNetworkService = {
    isSandbox,
    verifyAccessToken: async (accessToken) => {
        try {
            const res = await axios.get(`${PI_API_BASE_URL}/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            if (!res.status.toString().startsWith('2')) {
                console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} /me failed:`, res.statusText);
                return null;
            }
            const user = res.data;
            console.log(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verified user:`, user);
            return user;
        }
        catch (error) {
            console.error(`Pi ${isSandbox ? 'Testnet' : 'Mainnet'} verification error:`, error.response?.data || error.message);
            return null;
        }
    },
    // Payment approval method
    approvePayment: async (paymentId, apiKey) => {
        try {
            const response = await axios.post(`${PI_API_BASE_URL}/payments/${paymentId}/approve`, {}, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✅ Payment approved on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return true;
        }
        catch (error) {
            console.error('Payment approval failed:', error.response?.data || error.message);
            return false;
        }
    },
    // Payment completion method
    completePayment: async (paymentId, txid, apiKey) => {
        try {
            const response = await axios.post(`${PI_API_BASE_URL}/payments/${paymentId}/complete`, { txid }, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`✅ Payment completed on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId, "TXID:", txid);
            return true;
        }
        catch (error) {
            console.error('Payment completion failed:', error.response?.data || error.message);
            return false;
        }
    },
    // Get payment details
    getPayment: async (paymentId, apiKey) => {
        try {
            const response = await axios.get(`${PI_API_BASE_URL}/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                },
            });
            console.log(`Retrieved payment from ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return response.data;
        }
        catch (error) {
            console.error('Get payment failed:', error.response?.data || error.message);
            return null;
        }
    },
    // Cancel payment
    cancelPayment: async (paymentId, apiKey) => {
        try {
            const response = await axios.post(`${PI_API_BASE_URL}/payments/${paymentId}/cancel`, {}, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`Payment cancelled on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, paymentId);
            return true;
        }
        catch (error) {
            console.error('Payment cancellation failed:', error.response?.data || error.message);
            return false;
        }
    },
    // Create A2U (App-to-User) payment
    createA2UPayment: async (paymentData, apiKey) => {
        try {
            const response = await axios.post(`${PI_API_BASE_URL}/payments`, { payment: paymentData }, {
                headers: {
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`A2U Payment created on ${isSandbox ? 'Testnet' : 'Mainnet'}:`, response.data);
            return response.data;
        }
        catch (error) {
            console.error('A2U Payment creation failed:', error.response?.data || error.message);
            return null;
        }
    }
};
