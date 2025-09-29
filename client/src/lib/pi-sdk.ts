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
      try {
        window.Pi.init({ 
          version: "2.0", 
          sandbox 
        });
        this.initialized = true;
        console.log('Pi SDK initialized with sandbox:', sandbox);
      } catch (error) {
        console.error('Pi SDK initialization failed:', error);
        return;
      }
    } else {
      console.warn('Pi SDK not loaded yet, will retry');
      // Retry initialization after a short delay if Pi is not available
      setTimeout(() => {
        if (typeof window !== 'undefined' && window.Pi && !this.initialized) {
          try {
            window.Pi.init({ 
              version: "2.0", 
              sandbox 
            });
            this.initialized = true;
            console.log('Pi SDK initialized with sandbox (retry):', sandbox);
          } catch (error) {
            console.error('Pi SDK initialization failed on retry:', error);
          }
        }
      }, 1500);
    }
  }

  async authenticate(
    scopes: string[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    // Ensure Pi SDK is loaded
    try {
      await waitForPiSDK(15000); // Increase timeout to 15 seconds
    } catch (error) {
      console.error('Pi SDK failed to load:', error);
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser and refresh the page.');
    }

    // Initialize if not already done
    if (!this.initialized) {
      this.init(true); // Always use sandbox mode for Testnet
      // Wait a bit for initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Additional check to ensure Pi is available
    if (!window.Pi) {
      throw new Error('Pi SDK not properly loaded. Please refresh the page or try again in the Pi Browser.');
    }

    try {
      console.log('Calling Pi.authenticate with scopes:', scopes);
      // Add a timeout to the authentication call
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout - please check your Pi Browser for pending requests')), 45000)
      );
      
      const authResult = await Promise.race([authPromise, timeoutPromise]) as { accessToken: string; user: { uid: string; username: string } };
      console.log('Pi authentication successful:', authResult);
      return authResult;
    } catch (error: any) {
      console.error('Pi authentication failed:', error);
      
      // More specific error handling
      if (error.message && error.message.includes('timeout')) {
        throw new Error('Authentication timed out. Please check your Pi Browser for pending authentication requests and approve them.');
      } else if (error.message && error.message.includes('cancelled')) {
        throw new Error('Authentication was cancelled in the Pi Browser.');
      } else {
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}. Please try again and make sure you are using the Pi Browser.`);
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