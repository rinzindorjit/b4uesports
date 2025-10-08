// Robust Pi SDK implementation with better error handling and script loading
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

class RobustPiSDK {
  private initialized = false;
  private sdkLoadingPromise: Promise<void> | null = null;

  // Load Pi SDK script dynamically
  private async loadPiSDK(): Promise<void> {
    // If we're not in a browser environment, reject
    if (typeof window === 'undefined') {
      throw new Error('Pi SDK can only be loaded in a browser environment');
    }

    // If Pi SDK is already loaded and has the init function, return immediately
    if (window.Pi && typeof window.Pi.init === 'function') {
      console.log('Pi SDK already loaded and initialized');
      return Promise.resolve();
    }

    // If we're already loading the SDK, return the existing promise
    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    // Create a new promise for loading the SDK
    this.sdkLoadingPromise = new Promise((resolve, reject) => {
      // Check if script is already being loaded or exists in the DOM
      const existingScript = document.querySelector('script[src*="pi-sdk"]');
      if (existingScript) {
        console.log('Pi SDK script already exists in DOM');
        
        // If script is already loaded and marked as loaded, resolve immediately
        if (existingScript.hasAttribute('data-loaded')) {
          console.log('Pi SDK script already loaded');
          resolve();
          return;
        }
        
        // Script is in DOM but not yet loaded, wait for it
        existingScript.addEventListener('load', () => {
          console.log('Pi SDK script loaded from existing element');
          (existingScript as HTMLScriptElement).setAttribute('data-loaded', 'true');
          resolve();
        });
        
        existingScript.addEventListener('error', (error) => {
          console.error('Pi SDK script failed to load from existing element:', error);
          reject(new Error('Pi SDK script failed to load. Please check your internet connection and make sure you are using the Pi Browser app.'));
        });
        
        return;
      }

      // Create and load the script
      console.log('Creating and loading Pi SDK script');
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Pi SDK script loaded successfully');
        script.setAttribute('data-loaded', 'true');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Pi SDK script failed to load:', error);
        reject(new Error('Failed to load Pi SDK. Please check your internet connection and make sure you are using the Pi Browser app.'));
      };
      
      document.head.appendChild(script);
    });

    return this.sdkLoadingPromise;
  }

  // Wait for Pi to be available with timeout
  private async waitForPi(timeoutMs: number = 15000): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if Pi is already available
      if (typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function') {
        resolve(true);
        return;
      }

      const startTime = Date.now();
      const interval = setInterval(() => {
        if ((typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function') || 
            (Date.now() - startTime) > timeoutMs) {
          clearInterval(interval);
          resolve(typeof window !== 'undefined' && window.Pi && typeof window.Pi.init === 'function');
        }
      }, 100);
    });
  }

  // Robust initialization with retries and script loading
  async init(sandbox: boolean = true): Promise<void> {
    if (this.initialized) {
      console.log('Pi SDK already initialized');
      return;
    }

    try {
      // Load the Pi SDK script
      console.log('Loading Pi SDK script...');
      await this.loadPiSDK();
      
      // Wait for Pi to be available
      console.log('Waiting for Pi SDK to be ready...');
      const piAvailable = await this.waitForPi(15000);
      if (!piAvailable) {
        throw new Error('Pi SDK not available after loading. Please make sure you are using the Pi Browser app and refresh the page.');
      }

      if (!window.Pi) {
        throw new Error('Pi object not found after SDK load. Please make sure you are using the Pi Browser app.');
      }

      console.log('Initializing Pi SDK with version 2.0, sandbox:', sandbox);
      window.Pi.init({ 
        version: "2.0", 
        sandbox 
      });
      this.initialized = true;
      console.log('Pi SDK initialized successfully');
    } catch (error: any) {
      console.error('Pi SDK initialization failed:', error);
      this.initialized = false;
      throw new Error(`Failed to initialize Pi SDK: ${error.message || 'Unknown error'}. Please refresh the page and try again.`);
    }
  }

  // Robust authentication with better error handling
  async authenticate(
    scopes: string[] = ['payments', 'username'],
    onIncompletePaymentFound?: (payment: any) => void
  ): Promise<{ accessToken: string; user: { uid: string; username: string } } | null> {
    // Ensure Pi is available
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser app.');
    }

    // Initialize if not already done
    if (!this.initialized) {
      console.log('Pi SDK not initialized, initializing now...');
      await this.init(true); // Always use sandbox for Testnet
    }

    // Double-check initialization
    if (!this.initialized) {
      throw new Error('Pi SDK failed to initialize. Please refresh the page and try again.');
    }

    if (!window.Pi || typeof window.Pi.authenticate !== 'function') {
      throw new Error('Pi authentication function not available. Please refresh the page and try again.');
    }

    try {
      console.log('Calling Pi.authenticate with scopes:', scopes);
      
      // Set a reasonable timeout for the authentication
      const authPromise = window.Pi.authenticate(scopes, onIncompletePaymentFound);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout - please check your Pi Browser for pending requests')), 120000)
      );
      
      const result = await Promise.race([authPromise, timeoutPromise]) as { accessToken: string; user: { uid: string; username: string } };
      console.log('Pi authentication successful');
      return result;
    } catch (error: any) {
      console.error('Pi authentication failed:', error);
      
      // Provide specific error messages
      if (error.message && error.message.includes('timeout')) {
        throw new Error('Authentication timed out. Please check your Pi Browser for pending authentication requests. On mobile, look for a notification banner.');
      } else if (error.message && (error.message.includes('cancelled') || error.message.includes('User closed'))) {
        throw new Error('Authentication was cancelled. Please try again and approve the authentication request in the Pi Browser.');
      } else if (error.message && error.message.includes('init')) {
        throw new Error('Pi SDK not properly initialized. Please refresh the page and try again.');
      } else {
        throw new Error(`Authentication failed: ${error.message || 'Unknown error'}. Please try again and make sure you are using the Pi Browser app.`);
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
    if (typeof window === 'undefined' || !window.Pi) {
      throw new Error('Pi SDK not available. Please make sure you are using the Pi Browser app.');
    }

    if (!this.initialized) {
      throw new Error('Pi SDK initialized. Please authenticate first.');
    }

    if (!window.Pi || typeof window.Pi.createPayment !== 'function') {
      throw new Error('Pi payment function not available. Please refresh the page and try again.');
    }

    window.Pi.createPayment(paymentData, callbacks);
  }

  isInitialized(): boolean {
    return this.initialized;
  }
  
  // Reset the SDK state
  reset(): void {
    this.initialized = false;
    this.sdkLoadingPromise = null;
  }
}

export const piSDK = new RobustPiSDK();