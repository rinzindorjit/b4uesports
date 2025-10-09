import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_b4u_key';

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

export const getStorage = () => store;

// Mock Pi Network verification (you can replace with real API call)
export const getPiNetworkService = () => ({
  verifyAccessToken: async (accessToken: string) => {
    if (!accessToken) throw new Error('Missing access token');
    // Simulate verified Pi user
    return {
      username: 'pi_user',
      pi_id: 'testnet_1234',
      email: 'user@pi.network',
    };
  },
});

export const jwtSign = (payload: any) => jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
export const jwtVerify = (token: string) => jwt.verify(token, JWT_SECRET);

export { jwt, bcrypt, JWT_SECRET };