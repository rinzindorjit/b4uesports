// Simple Pi SDK implementation
declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[], 
        onIncompletePaymentFound?: (payment: any) => void
      ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
      createPayment: (
        paymentData: {
          amount: number;
          memo: string;
          metadata: Record<string, any>;
        },
        callbacks: {
          onReadyForServerApproval: (paymentId: string) => void;
          onReadyForServerCompletion: (paymentId: string, txid: string) => void;
          onCancel: (paymentId: string) => void;
          onError: (error: Error, payment?: any) => void;
        }
      ) => void;
    };
  }
}

class SimplePiSDK {
  private initialized = false;

  // Simple initialization
  init(sandbox: boolean = true): void {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined' && window.Pi) {
      try {
        window.Pi.init({ 
          version: "2.0", 
          sandbox 
        });
        this.initialized = true;
        console.log('Pi SDK initialized');
      } catch (error) {
        console.error('Pi SDK initialization failed:', error);
        throw new Error('Failed to initialize Pi SDK. Please make sure you are using the Pi Browser app.');
      }
    } else {
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser app.');
    }
  }

  // Simple authentication
  async authenticate(
    scopes: string[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser app.');
    }

    if (!this.initialized) {
      this.init(true); // Always use sandbox for Testnet
    }

    try {
      console.log('Calling Pi.authenticate');
      const result = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      console.log('Pi authentication successful');
      return result;
    } catch (error: any) {
      console.error('Pi authentication failed:', error);
      if (error.message && error.message.includes('timeout')) {
        throw new Error('Authentication timed out. Please check your Pi Browser for pending requests.');
      } else if (error.message && error.message.includes('cancelled')) {
        throw new Error('Authentication was cancelled.');
      } else {
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}. Please try again.`);
      }
    }
  }

  createPayment(
    paymentData: {
      amount: number;
      memo: string;
      metadata: Record<string, any>;
    },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: any) => void;
    }
  ): void {
    if (!window.Pi) {
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser app.');
    }

    if (!this.initialized) {
      this.init(true); // Always use sandbox for Testnet
    }

    window.Pi.createPayment(paymentData, callbacks);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const piSDK = new SimplePiSDK();