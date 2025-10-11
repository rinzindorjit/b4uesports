import { waitForPiSDK, loadPiSDK, isPiBrowser } from './utils';

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

  // More comprehensive Pi Browser detection
  private isPiEnvironment(): boolean {
    if (typeof window === 'undefined') return false;
    
    // Check for Pi Browser user agent (multiple variations)
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    const piBrowserIndicators = [
      'PiBrowser',
      'Pi Browser',
      'Pi-Crypto-Browser',
      'PiNetwork'
    ];
    
    const isPiUserAgent = piBrowserIndicators.some(indicator => 
      userAgent && userAgent.includes(indicator)
    );
    
    // Check for Pi object on window
    const hasPiObject = !!(window as any).Pi;
    
    // Check for other Pi Browser specific properties
    const hasPiSpecificProperties = !!(window as any).PiNetwork || 
                                  !!(window as any).PiBrowser || 
                                  (window as any).webkit?.messageHandlers?.PiBrowser;
    
    console.log('Pi Environment Detection:', {
      userAgent,
      isPiUserAgent,
      hasPiObject,
      hasPiSpecificProperties
    });
    
    // Return true if any of the indicators are present
    // More lenient approach - if we're not sure, we'll assume it's Pi environment
    return isPiUserAgent || hasPiObject || hasPiSpecificProperties;
  }

  // Enhanced initialization with dynamic SDK loading and proper sandbox detection
  async init(sandbox: boolean = true): Promise<void> {
    if (this.initialized) {
      console.log('Pi SDK already initialized');
      return;
    }

    try {
      // More lenient Pi Browser detection - check multiple conditions
      const isPiEnvironment = this.isPiEnvironment();
      if (!isPiEnvironment) {
        console.warn('Not detected as Pi Browser environment, but continuing with initialization...');
        // Don't throw error immediately, try to initialize anyway
        console.warn('Environment Warning: Pi Browser environment not detected. Proceeding with initialization anyway.');
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
        // Even if Pi object is not immediately available, we might still be in Pi Browser
        console.warn('Pi SDK object not immediately available, but continuing with initialization...');
        this.sandboxMode = sandbox;
        // Try to initialize anyway - Pi Browser might load it later
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.Pi) {
            window.Pi.init({
              version: '2.0',
              sandbox: this.sandboxMode,
            });
            this.initialized = true;
            console.log('✅ Pi SDK initialized with version 2.0, sandbox mode:', this.sandboxMode);
          } else {
            // If still not available after timeout, show a warning but don't fail
            console.warn('Pi SDK still not available after timeout. Authentication may fail.');
            console.warn('Pi SDK Warning: Pi SDK is not available. Authentication may not work properly.');
            // Still mark as initialized to allow authentication attempts
            this.initialized = true;
          }
        }, 3000);
        // Mark as initialized to allow authentication attempts
        this.initialized = true;
      }
    } catch (error) {
      console.error('❌ Pi SDK initialization failed:', error);
      this.initialized = false;
      // Even if initialization fails, don't throw error - let authentication handle it
      console.warn('Initialization Warning: Pi SDK initialization encountered issues. Proceeding anyway.');
      // Mark as initialized to allow authentication attempts
      this.initialized = true;
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
        console.log('Initializing Pi SDK before authentication...');
        await this.init(true); // Always use sandbox mode for Testnet
      }

      // Wait a bit more for Pi object to be available
      if (typeof window !== 'undefined' && !window.Pi) {
        console.log('Waiting for Pi object to be available...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (!window.Pi) {
        // Try one more time with a longer wait
        console.log('Pi object still not available, trying again...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        if (!window.Pi) {
          console.warn('Pi SDK not immediately available, attempting authentication anyway...');
          // Create a mock Pi object for testing purposes
          if (typeof window !== 'undefined') {
            (window as any).Pi = (window as any).Pi || {};
          }
        }
      }

      // Additional check to ensure Pi object is properly initialized
      if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
        console.error('Pi SDK not properly initialized or authenticate function not available');
        throw new Error('Pi SDK not properly initialized. Please make sure you are using the official Pi Browser app and refresh the page.');
      }

      console.log('🔐 Calling Pi.authenticate with scopes:', scopes);
      
      // Add timeout to the authentication promise
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Authentication timeout - please check your Pi Browser and try refreshing the page.')), 180000)
      );

      const authResult = (await Promise.race([authPromise, timeoutPromise])) as {
        accessToken: string;
        user: { uid: string; username: string; wallet_address?: string };
      };

      // Validate the authentication result
      if (!authResult || !authResult.accessToken || !authResult.user) {
        console.error('Invalid authentication result received:', authResult);
        throw new Error('Authentication failed - invalid response from Pi Network. Please try again.');
      }

      // Save granted scopes
      this.grantedScopes = scopes;
      console.log('✅ Pi authentication successful. Granted scopes:', scopes);

      return authResult;
    } catch (error: any) {
      console.error('❌ Pi authentication failed:', error);
      
      // Handle the specific "Discarding message" error
      if (error.message && error.message.includes('Discarding message')) {
        // This is a Pi Browser-specific error that often resolves itself with a retry
        console.log('Detected "Discarding message" error, suggesting retry...');
        throw new Error('The Pi Browser app is not properly loaded. Please close and reopen the Pi Browser app, then try authenticating again. If the problem persists, restart your device.');
      }
      
      // Provide more specific error messages
      let errorMessage = 'Authentication failed. Please try the following:';
      errorMessage += '\n1. Make sure you are using the official Pi Browser app';
      errorMessage += '\n2. Refresh the page and try again';
      errorMessage += '\n3. Check for any Pi Browser notification banners and approve the authentication request';
      errorMessage += '\n4. If problems persist, restart the Pi Browser app';
      
      if (error.message && error.message.includes('timeout')) {
        errorMessage = 'Authentication is taking longer than expected. Please check for Pi Browser notification banners and approve the authentication request. If you don\'t see a prompt, try refreshing the page.';
      }
      
      throw new Error(errorMessage);
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
    if (!this.initialized) {
      const errorMessage = 'Pi SDK not initialized. Please refresh the page and try again.';
      console.error(errorMessage);
      callbacks.onError(new Error(errorMessage));
      return;
    }

    // Ensure Pi object is available
    if (!window.Pi) {
      const errorMessage = 'Pi SDK not available. Please refresh the page and try again.';
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
      throw new Error('Pi SDK not initialized. Please refresh the page and try again.');
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