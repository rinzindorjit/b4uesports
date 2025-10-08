import { waitForPiSDK, loadPiSDK } from '@/lib/utils';

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

  // Enhanced initialization with dynamic SDK loading
  async init(sandbox: boolean = true): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('Initializing Pi SDK...');
      
      // First, ensure the Pi SDK is loaded
      await loadPiSDK();
      
      // Wait for Pi SDK to be available on window object
      await waitForPiSDK(30000); // 30 second timeout
      
      if (typeof window !== 'undefined' && window.Pi) {
        console.log('Pi SDK is available, initializing...');
        // Always use version "2.0" as required by Pi Network
        window.Pi.init({ 
          version: "2.0", 
          sandbox 
        });
        this.initialized = true;
        console.log('Pi SDK initialized with version 2.0, sandbox:', sandbox);
      } else {
        throw new Error('Pi SDK not available after loading. Please make sure you are using the Pi Browser app.');
      }
    } catch (error) {
      console.error('Pi SDK initialization failed:', error);
      throw new Error(`Failed to initialize Pi SDK: ${error instanceof Error ? error.message : 'Unknown error'}. Please make sure you are using the Pi Browser app.`);
    }
  }

  async authenticate(
    scopes: string[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    // Ensure Pi SDK is loaded and initialized
    try {
      console.log('Starting authentication process...');
      
      if (!this.initialized) {
        console.log('Pi SDK not initialized, initializing now...');
        // Always use sandbox mode for Testnet
        await this.init(true);
      }
      
      // Additional check to ensure Pi is available
      if (!window.Pi) {
        throw new Error('Pi SDK not properly loaded. Please refresh the page or try again in the Pi Browser.');
      }

      console.log('Calling Pi.authenticate with scopes:', scopes);
      
      // Add a timeout to the authentication call with proper Pi Network timeout values
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      // Use 120 seconds timeout for better mobile experience
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout - please check your Pi Browser for pending requests')), 120000)
      );
      
      const authResult = await Promise.race([authPromise, timeoutPromise]) as { accessToken: string; user: { uid: string; username: string } };
      console.log('Pi authentication successful:', authResult);
      return authResult;
    } catch (error: any) {
      console.error('Pi authentication failed:', error);
      
      // More specific error handling
      if (error.message && error.message.includes('timeout')) {
        throw new Error('Authentication timed out. Please check your Pi Browser for pending authentication requests and approve them. On mobile, look for a notification banner. If you don\'t see a prompt, try refreshing the page or restarting the Pi Browser app.');
      } else if (error.message && error.message.includes('cancelled')) {
        throw new Error('Authentication was cancelled in the Pi Browser.');
      } else if (error.message && error.message.includes('Pi Network is not available')) {
        throw new Error('Pi Network is not available. Please make sure you are using the Pi Browser app.');
      } else if (error.message && error.message.includes('User closed')) {
        throw new Error('Authentication was cancelled. Please try again and approve the authentication request in the Pi Browser.');
      } else if (error.message && error.message.includes('load')) {
        throw new Error('Failed to load Pi SDK. Please check your internet connection and make sure you are using the Pi Browser app.');
      } else {
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}. Please try again and make sure you are using the Pi Browser. If the issue persists, try refreshing the page or restarting the Pi Browser app.`);
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
      throw new Error('Pi SDK not initialized. Please make sure you are using the Pi Browser app.');
    }

    console.log('Creating Pi payment:', paymentData);
    window.Pi.createPayment(paymentData, callbacks);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
  
  // Method to reset the SDK state (useful for testing or error recovery)
  reset(): void {
    this.initialized = false;
  }
}

export const piSDK = PiSDK.getInstance();