import { waitForPiSDK } from '@/lib/utils';

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
      openShareDialog: (title: string, message: string) => void;
      nativeFeaturesList: () => Promise<string[]>;
    };
  }
}

export class PiSDK {
  private static instance: PiSDK;
  private initialized = false;

  static getInstance(): PiSDK {
    if (!PiSDK.instance) {
      PiSDK.instance = new PiSDK();
    }
    return PiSDK.instance;
  }

  init(sandbox: boolean = true): void {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined' && window.Pi) {
      window.Pi.init({ 
        version: "2.0", 
        sandbox 
      });
      this.initialized = true;
      console.log('Pi SDK initialized with sandbox:', sandbox);
    } else {
      console.warn('Pi SDK not loaded yet, will retry');
      // Retry initialization after a short delay if Pi is not available
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Pi && !this.initialized) {
          window.Pi.init({ 
            version: "2.0", 
            sandbox 
          });
          this.initialized = true;
          console.log('Pi SDK initialized with sandbox (retry):', sandbox);
        }
      }, 1000);
    }
  }

  async authenticate(
    scopes: string[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    // Ensure Pi SDK is loaded
    try {
      await waitForPiSDK();
    } catch (error) {
      console.error('Pi SDK failed to load:', error);
      throw new Error('Pi SDK not available');
    }

    // Initialize if not already done
    if (!this.initialized) {
      this.init(true); // Always use sandbox mode for Testnet
      // Wait a bit for initialization
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      console.log('Calling Pi.authenticate with scopes:', scopes);
      const authResult = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      console.log('Pi authentication successful:', authResult);
      return authResult;
    } catch (error) {
      console.error('Pi authentication failed:', error);
      return null;
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
    if (!this.initialized || !window.Pi) {
      throw new Error('Pi SDK not initialized');
    }

    console.log('Creating Pi payment:', paymentData);
    window.Pi.createPayment(paymentData, callbacks);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const piSDK = PiSDK.getInstance();