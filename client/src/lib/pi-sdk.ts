import { waitForPiSDK, loadPiSDK, isPiBrowser } from '@/lib/utils';

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => void;
      authenticate: (
        scopes: string[],
        onIncompletePaymentFound?: (payment: any) => void
      ) => Promise<{ accessToken: string; user: { uid: string; username: string; wallet_address?: string } }>;
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
      request: (options: {
        method: string;
        params: Record<string, any>;
      }) => Promise<any>;
      openShareDialog: (title: string, message: string) => void;
      nativeFeaturesList: () => Promise<string[]>;
    };
  }
}

export class PiSDK {
  private static instance: PiSDK;
  private initialized = false;
  private grantedScopes: string[] = [];
  private sandboxMode = true; // Default to sandbox mode for Testnet

  static getInstance(): PiSDK {
    if (!PiSDK.instance) {
      PiSDK.instance = new PiSDK();
    }
    return PiSDK.instance;
  }

  // Enhanced initialization with dynamic SDK loading and proper sandbox detection
  async init(sandbox: boolean = true): Promise<void> {
    if (this.initialized) {
      console.log('Pi SDK already initialized');
      return;
    }

    try {
      // Always check if we're in Pi Browser
      if (!isPiBrowser()) {
        throw new Error('Please open this app in the Pi Browser app for authentication to work properly.');
      }

      // Load Pi SDK
      await loadPiSDK();
      await waitForPiSDK(45000);

      if (typeof window !== 'undefined' && window.Pi) {
        // Set sandbox mode based on environment
        this.sandboxMode = sandbox;
        
        window.Pi.init({
          version: '2.0',
          sandbox: this.sandboxMode, // Enable sandbox mode for Testnet
        });
        this.initialized = true;
        console.log('✅ Pi SDK initialized with version 2.0, sandbox mode:', this.sandboxMode);
      } else {
        throw new Error('Pi SDK not available after loading. Please refresh the page in Pi Browser.');
      }
    } catch (error) {
      console.error('❌ Pi SDK initialization failed:', error);
      this.initialized = false;
      throw error;
    }
  }

  // Authenticate and track granted scopes
  async authenticate(
    scopes: string[] = ['payments', 'username', 'wallet_address'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string; wallet_address?: string } } | null> {
    try {
      // Initialize SDK if not already done
      if (!this.initialized) {
        await this.init(true); // Always use sandbox mode for Testnet
      }

      if (!window.Pi) {
        throw new Error('Pi SDK not loaded properly. Please refresh the page in the Pi Browser.');
      }

      console.log('🔐 Calling Pi.authenticate with scopes:', scopes);
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout - please check your Pi Browser.')), 180000)
      );

      const authResult = (await Promise.race([authPromise, timeoutPromise])) as {
        accessToken: string;
        user: { uid: string; username: string; wallet_address?: string };
      };

      // Save granted scopes
      this.grantedScopes = scopes;
      console.log('✅ Pi authentication successful. Granted scopes:', scopes);

      return authResult;
    } catch (error: any) {
      console.error('❌ Pi authentication failed:', error);
      throw new Error(
        `Authentication failed: ${error.message || 'Unknown error'}. Please retry in Pi Browser.`
      );
    }
  }

  // Helper to check if current session includes a scope
  hasScope(scope: string): boolean {
    return this.grantedScopes.includes(scope);
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
      const errorMessage = 'Pi SDK not initialized. Please use Pi Browser and refresh the page.';
      console.error(errorMessage);
      callbacks.onError(new Error(errorMessage));
      return;
    }

    // Ensure user has "payments" scope before creating a payment
    if (!this.hasScope('payments')) {
      const errorMessage = 'Cannot create a payment without "payments" scope. Please re-authenticate.';
      console.error(errorMessage);
      callbacks.onError(new Error(errorMessage));
      return;
    }

    console.log('💰 Creating Pi payment:', paymentData);
    window.Pi.createPayment(paymentData, callbacks);
  }

  // New method for request-based payments with server-side approval
  async requestPayment(
    amount: string,
    memo: string
  ): Promise<any> {
    if (!this.initialized || !window.Pi) {
      throw new Error('Pi SDK not initialized. Please use Pi Browser and refresh the page.');
    }

    // Ensure user has "payments" scope before requesting payment
    if (!this.hasScope('payments')) {
      throw new Error('Cannot request payment without "payments" scope. Please re-authenticate.');
    }

    try {
      console.log('💰 Requesting Pi payment:', { amount, memo });
      const result = await window.Pi.request({
        method: "pi_requestPayment",
        params: {
          amount: amount,
          memo: memo
        }
      });
      
      console.log('✅ Payment request result:', result);
      return result;
    } catch (error) {
      console.error('❌ Payment request failed:', error);
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  isSandboxMode(): boolean {
    return this.sandboxMode;
  }

  reset(): void {
    this.initialized = false;
    this.grantedScopes = [];
    this.sandboxMode = true;
  }
}

export const piSDK = PiSDK.getInstance();