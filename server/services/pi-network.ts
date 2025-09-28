import axios from 'axios';

// Use Testnet API for all requests
const PI_API_BASE = 'https://sandbox.minepi.com';
const SERVER_API_KEY = process.env.PI_SERVER_API_KEY;

if (!SERVER_API_KEY) {
  throw new Error("PI_SERVER_API_KEY environment variable must be set");
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
  private apiKey: string;

  constructor() {
    this.apiKey = SERVER_API_KEY!;
  }

  async verifyAccessToken(accessToken: string): Promise<PiUser | null> {
    try {
      const response = await axios.get(`${PI_API_BASE}/v2/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Pi Network token verification failed:', error);
      return null;
    }
  }

  async approvePayment(paymentId: string): Promise<boolean> {
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