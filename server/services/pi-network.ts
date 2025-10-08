import axios from 'axios';

export const piNetworkService = {
  verifyAccessToken: async (accessToken: string) => {
    try {
      const res = await axios.get("https://sandbox.minepi.com/v2/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.status.toString().startsWith('2')) {
        console.error("Pi Testnet /me failed:", res.statusText);
        return null;
      }

      const user = res.data;
      console.log("Pi Testnet verified user:", user);
      return user;
    } catch (error: any) {
      console.error("Pi Testnet verification error:", error.response?.data || error.message);
      return null;
    }
  },
  
  // Keep other methods for payment functionality
  approvePayment: async (paymentId: string, apiKey: string) => {
    try {
      await axios.post(
        "https://sandbox.minepi.com/v2/payments/" + paymentId + "/approve",
        {},
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Payment approval failed:', error);
      return false;
    }
  },

  completePayment: async (paymentId: string, txid: string, apiKey: string) => {
    try {
      await axios.post(
        "https://sandbox.minepi.com/v2/payments/" + paymentId + "/complete",
        { txid },
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return true;
    } catch (error) {
      console.error('Payment completion failed:', error);
      return false;
    }
  },

  getPayment: async (paymentId: string, apiKey: string) => {
    try {
      const response = await axios.get("https://sandbox.minepi.com/v2/payments/" + paymentId, {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Get payment failed:', error);
      return null;
    }
  },

  cancelPayment: async (paymentId: string, apiKey: string) => {
    try {
      await axios.post(
        "https://sandbox.minepi.com/v2/payments/" + paymentId + "/cancel",
        {},
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
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
};
