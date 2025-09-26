import axios from 'axios';

const PI_API_BASE = 'https://api.minepi.com';
// In sandbox mode, no API keys are required
// For production mode, we would need PI_SERVER_API_KEY
const SERVER_API_KEY = process.env.PI_SERVER_API_KEY;
const PI_APP_ID = process.env.PI_APP_ID;

// Only run in mock mode for sandbox environments when no API keys are provided
// Since we're using Pi Network testnet, we'll use mock mode only when API keys are not set
const IS_SANDBOX = !SERVER_API_KEY || !PI_APP_ID;

if (IS_SANDBOX) {
  console.log("Running in sandbox mode - no API keys provided, using mock mode");
} else {
  console.log("Running in production mode with Pi Network API keys");
}

export interface PiUser {
  uid: string;
  username: string;
  roles: string[];
}

export interface PaymentData {
  amount: number;
  memo: string;
  metadata: {
    type: 'backend';
    userId: string;
    packageId: string;
    gameAccount: Record<string, string>;
    [key: string]: any;
  };
}

export interface PaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  from_address: string;
  to_address: string;
  direction: 'user_to_app' | 'app_to_user';
  created_at: string;
  network: 'Pi Testnet' | 'Pi Network';
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction: null | {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

export class PiNetworkService {
  private apiKey: string | null;
  private appId: string | null;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = SERVER_API_KEY || null;
    this.appId = PI_APP_ID || null;
    // Use mock mode only when API keys are not provided
    this.isMockMode = IS_SANDBOX || !SERVER_API_KEY || !PI_APP_ID;
    
    if (this.isMockMode) {
      console.log('PiNetworkService running in mock mode - no real API calls will be made');
      if (IS_SANDBOX) {
        console.log('Sandbox mode: No API keys provided for Pi Network operations');
      }
    } else {
      console.log('PiNetworkService running in production mode with real API keys');
    }
  }

  async verifyAccessToken(accessToken: string): Promise<PiUser | null> {
    // In mock mode, return a mock user
    if (this.isMockMode) {
      return {
        uid: 'mock-user-uid',
        username: 'mock_user',
        roles: ['user']
      };
    }
    
    try {
      const response = await axios.get(`${PI_API_BASE}/v2/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Pi Network token verification failed:', error);
      return null;
    }
  }

  async approvePayment(paymentId: string): Promise<boolean> {
    // In mock mode, always return success
    if (this.isMockMode) {
      console.log('Mock payment approval for:', paymentId);
      // Also update mock transactions if they exist
      // Type assertion to avoid TypeScript errors
      const globalAny: any = global;
      if (globalAny.mockTransactions) {
        const transaction = globalAny.mockTransactions.find((tx: any) => tx.paymentId === paymentId);
        if (transaction) {
          transaction.status = 'approved';
          transaction.updatedAt = new Date().toISOString();
        }
      }
      return true;
    }
    
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Payment approval failed:', error);
      return false;
    }
  }

  async completePayment(paymentId: string, txid: string): Promise<boolean> {
    // In mock mode, always return success
    if (this.isMockMode) {
      console.log('Mock payment completion for:', paymentId, 'with txid:', txid);
      // Also update mock transactions if they exist
      // Type assertion to avoid TypeScript errors
      const globalAny: any = global;
      if (globalAny.mockTransactions) {
        const transaction = globalAny.mockTransactions.find((tx: any) => tx.paymentId === paymentId);
        if (transaction) {
          transaction.status = 'completed';
          transaction.txid = txid;
          transaction.updatedAt = new Date().toISOString();
        }
      }
      return true;
    }
    
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/complete`,
        { txid },
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Payment completion failed:', error);
      return false;
    }
  }

  async getPayment(paymentId: string): Promise<PaymentDTO | null> {
    // In mock mode, return a mock payment
    if (this.isMockMode) {
      console.log('Mock payment retrieval for:', paymentId);
      return {
        identifier: paymentId,
        user_uid: 'mock-user-uid',
        amount: 1,
        memo: 'Mock payment',
        metadata: {},
        from_address: 'mock-from-address',
        to_address: 'mock-to-address',
        direction: 'user_to_app',
        created_at: new Date().toISOString(),
        network: 'Pi Testnet',
        status: {
          developer_approved: true,
          transaction_verified: true,
          developer_completed: false,
          cancelled: false,
          user_cancelled: false
        },
        transaction: null
      };
    }
    
    try {
      const response = await axios.get(`${PI_API_BASE}/v2/payments/${paymentId}`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get payment failed:', error);
      return null;
    }
  }

  async cancelPayment(paymentId: string): Promise<boolean> {
    // In mock mode, always return success
    if (this.isMockMode) {
      console.log('Mock payment cancellation for:', paymentId);
      return true;
    }
    
    try {
      await axios.post(
        `${PI_API_BASE}/v2/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            'Authorization': `Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Payment cancellation failed:', error);
      return false;
    }
  }
}

export const piNetworkService = new PiNetworkService();