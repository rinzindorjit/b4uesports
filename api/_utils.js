// @ts-nocheck
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_b4u_key';
const PI_API_URL = 'https://api.minepi.com/v2';
const PI_SERVER_API_KEY = process.env.PI_SERVER_API_KEY || 'test_pi_server_api_key_for_development';

// In-memory store (replace with DB later)
const store = {
  users: {},
  transactions: [],
  packages: [
    { id: 1, name: 'Starter Pack', price: 10 },
    { id: 2, name: 'Pro Pack', price: 25 },
    { id: 3, name: 'Elite Pack', price: 50 },
  ],
  payments: [],
};

const getStorage = () => store;

// Pi Network verification service
const getPiNetworkService = () => ({
  verifyAccessToken: async (accessToken) => {
    if (!accessToken) throw new Error('Missing access token');
    
    try {
      const response = await fetch(`${PI_API_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = (errorData && errorData['message']) || errorMessage;
        } catch (e) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(`Pi Network API error: ${response.status} - ${errorMessage}`);
      }
      
      const userData = await response.json();
      
      return {
        username: userData['username'],
        pi_id: userData['uid'],
        email: userData['email'] || '',
      };
    } catch (error) {
      console.error('Pi Network verification failed:', error);
      throw new Error(`Failed to verify Pi Network access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
});

const jwtSign = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
const jwtVerify = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  getStorage,
  getPiNetworkService,
  jwtSign,
  jwtVerify,
  jwt,
  bcrypt,
  JWT_SECRET
};