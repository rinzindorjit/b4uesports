import { shouldInitializePiSDK, getPiSDKSandboxMode } from '@/lib/auth-mode';

declare global {
  interface Window {
    Pi?: {
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
    // Check if we should initialize Pi SDK
    if (!shouldInitializePiSDK()) {
      console.log('Skipping Pi SDK initialization in mock environment');
      this.initialized = true;
      return;
    }
    
    // Check if Pi SDK is available
    if (typeof window === 'undefined' || !window.Pi) {
      console.warn('Pi SDK not available - running in mock mode');
      this.initialized = true;
      return;
    }
    
    if (this.initialized) return;
    
    try {
      window.Pi.init({ 
        version: "2.0", 
        sandbox 
      });
      this.initialized = true;
      console.log('Pi SDK initialized successfully with sandbox:', sandbox);
    } catch (error) {
      console.error('Pi SDK initialization failed:', error);
      this.initialized = true; // Still mark as initialized to allow mock operations
    }
  }

  async authenticate(scopes: string[] = ['payments', 'username']): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    // Check if we should use Pi SDK
    if (!shouldInitializePiSDK()) {
      console.log('Skipping Pi SDK authentication in mock environment, returning null to trigger mock auth');
      return null;
    }
    
    // Check if Pi SDK is available
    if (typeof window === 'undefined' || !window.Pi) {
      console.log('Pi SDK not available, returning null to trigger mock authentication');
      return null;
    }
    
    if (!this.initialized) {
      // Try to initialize if not already done
      const sandboxMode = getPiSDKSandboxMode();
      this.init(sandboxMode);
      if (!this.initialized) {
        throw new Error('Pi SDK not initialized');
      }
    }

    try {
      // Ensure required scopes are included
      const requiredScopes = ['payments', 'username'];
      const finalScopes = Array.from(new Set([...scopes, ...requiredScopes]));
      
      console.log('Requesting Pi authentication with scopes:', finalScopes);
      const authResult = await window.Pi.authenticate(finalScopes, (payment) => {
        console.log('Incomplete payment found:', payment);
        // Handle incomplete payments if needed
      });
      console.log('Pi authentication result:', authResult);
      return authResult;
    } catch (error) {
      console.error('Pi authentication failed:', error);
      // More detailed error handling
      if (error instanceof Error) {
        if (error.message.includes('User closed')) {
          throw new Error('Authentication cancelled by user');
        } else if (error.message.includes('scopes')) {
          throw new Error('Required permissions not granted');
        } else {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      } else {
        throw new Error('Authentication failed: Unknown error');
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
    // Check if we should use Pi SDK
    if (!shouldInitializePiSDK()) {
      console.log('Skipping Pi SDK payment creation in mock environment');
      throw new Error('Pi SDK not available - mock payment should be handled separately');
    }
    
    // Check if Pi SDK is available
    if (typeof window === 'undefined' || !window.Pi) {
      console.log('Pi SDK not available, triggering mock payment flow');
      throw new Error('Pi SDK not available - mock payment should be handled separately');
    }
    
    if (!this.initialized) {
      throw new Error('Pi SDK not initialized');
    }

    window.Pi.createPayment(paymentData, callbacks);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const piSDK = PiSDK.getInstance();