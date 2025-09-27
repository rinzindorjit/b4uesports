import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { piSDK } from '@/lib/pi-sdk';
import { apiRequest } from '@/lib/queryClient';
import { shouldUseMockAuth, shouldInitializePiSDK, getPiSDKSandboxMode } from '@/lib/auth-mode';
import type { User, PaymentData, PaymentCallbacks } from '@/types/pi-network';

interface PiNetworkContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authenticate: () => Promise<void>;
  logout: () => void;
  createPayment: (paymentData: PaymentData, callbacks: PaymentCallbacks) => void;
  token: string | null;
}

const PiNetworkContext = createContext<PiNetworkContextType | undefined>(undefined);

interface PiNetworkProviderProps {
  children: ReactNode;
}

// Robust Pi Browser detection function (matches server-side implementation)
function isPiBrowser() {
  // Check for Pi Browser using robust detection method
  if (typeof window !== 'undefined') {
    // Check for Pi Browser specific user agent or features
    const userAgent = window.navigator.userAgent.toLowerCase();
    const xRequestedWith = (window as any).Pi ? 'pi.browser' : '';
    
    // Robust detection that matches server-side implementation
    const isPiBrowserRequest = (
      xRequestedWith === 'pi.browser' ||
      userAgent.includes('pi browser') ||
      userAgent.includes('pibrowser') ||
      userAgent.includes('pi network')
    );
    
    // Additional environment checks
    const isVercel = window.location.hostname.includes('vercel.app');
    const isNetlify = window.location.hostname.includes('netlify.app');
    const isLocalhost = window.location.hostname === 'localhost' && window.location.port === '5173';
    
    return isPiBrowserRequest || isVercel || isNetlify || isLocalhost;
  }
  
  return false;
}

// Add a new function to detect if we're in a sandbox environment
function isSandboxEnvironment() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Treat as sandbox for testnet environments
    return hostname.includes('netlify.app') || hostname.includes('vercel.app') || 
           (hostname === 'localhost' && window.location.port === '5173');
  }
  return false;
}

export function PiNetworkProvider({ children }: PiNetworkProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    console.log('PiNetworkProvider useEffect running');
    
    // Initialize Pi SDK
    const useMockAuth = shouldUseMockAuth();
    const shouldInitPiSDK = shouldInitializePiSDK();
    const sandboxMode = getPiSDKSandboxMode();
    
    console.log('PiNetworkProvider init, useMockAuth:', useMockAuth, 'shouldInitPiSDK:', shouldInitPiSDK, 'sandboxMode:', sandboxMode);
    
    // Initialize Pi SDK only if needed
    if (shouldInitPiSDK) {
      // Check if Pi SDK is available before initializing
      if (typeof window !== 'undefined' && window.Pi) {
        piSDK.init(sandboxMode);
      } else {
        console.warn('Pi SDK not available for initialization');
      }
    }

    // Check for existing session
    const savedToken = localStorage.getItem('pi_token');
    const savedUser = localStorage.getItem('pi_user');
    
    console.log('Checking for existing session:', { savedToken, savedUser });
    
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('Restored session from localStorage');
      } catch (error) {
        console.error('Failed to parse saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('pi_token');
        localStorage.removeItem('pi_user');
      }
    }
    
    console.log('Setting isLoading to false');
    setIsLoading(false);
  }, []);

  const authenticate = async () => {
    console.log('=== AUTHENTICATION START ===');
    
    // Check if we should use mock authentication
    const useMockAuth = shouldUseMockAuth();
    const isPiSDKAvailable = typeof window !== 'undefined' && window.Pi;
    
    console.log('Authentication environment check:', {
      useMockAuth,
      isPiSDKAvailable,
      location: window.location,
      userAgent: window.navigator.userAgent
    });
    
    // Use mock authentication only for development mock environments
    if (useMockAuth) {
      console.log('Using mock authentication flow');
      // In mock environments, we'll use a mock authentication flow
      setIsLoading(true);
      
      try {
        console.log('Sending mock auth request to backend');
        // Send request to backend with mock auth flag
        const response = await apiRequest('POST', '/api/pi?action=auth', {
          isMockAuth: true
        });
        
        console.log('Mock auth response received:', response.status, response.statusText);
        const data = await response.json();
        console.log('Mock auth response data:', data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Mock authentication failed on server');
        }
        
        console.log('Setting mock user and token');
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Save to localStorage
        localStorage.setItem('pi_token', data.token);
        localStorage.setItem('pi_user', JSON.stringify(data.user));
        
        console.log('Mock authentication complete, user:', data.user);
      } catch (error) {
        console.error('Mock authentication error:', error);
        alert(`Mock authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        // Clear any partial data
        localStorage.removeItem('pi_token');
        localStorage.removeItem('pi_user');
      } finally {
        console.log('Mock auth finally block - setting isLoading to false');
        // Ensure isLoading is always set to false
        setIsLoading(false);
      }
      return;
    }
    
    // For production mode with available Pi SDK, use real Pi Network authentication
    console.log('Using real Pi Network authentication');
    setIsLoading(true);
    try {
      // Ensure we request both 'payments' and 'username' scopes
      // Also add 'wallet_address' scope to get wallet address
      console.log('Requesting Pi authentication with scopes: payments, username, wallet_address');
      const authResult = await piSDK.authenticate(['payments', 'username', 'wallet_address']);
      console.log('Pi authentication result:', authResult);
      
      // If authResult is null, it means we should use mock authentication
      if (authResult === null) {
        console.log('Pi SDK returned null, using mock authentication');
        // Send request to backend with mock auth flag
        const response = await apiRequest('POST', '/api/pi?action=auth', {
          isMockAuth: true
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Mock authentication failed on server');
        }
        
        console.log('Setting mock user and token');
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);
        
        // Save to localStorage
        localStorage.setItem('pi_token', data.token);
        localStorage.setItem('pi_user', JSON.stringify(data.user));
        
        console.log('Mock authentication complete, user:', data.user);
        setIsLoading(false);
        return;
      }
      
      if (!authResult) {
        throw new Error('Authentication failed - missing required scopes or user cancelled');
      }

      // Send access token to backend for verification
      console.log('Sending access token to backend for verification');
      const response = await apiRequest('POST', '/api/pi?action=auth', {
        accessToken: authResult.accessToken,
      });
      
      console.log('Backend response status:', response.status);
      const data = await response.json();
      console.log('Backend response data:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed on server');
      }
      
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', data.token);
      localStorage.setItem('pi_user', JSON.stringify(data.user));
      
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication error:', error);
      // Show error to user
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      // Clear any partial data
      localStorage.removeItem('pi_token');
      localStorage.removeItem('pi_user');
    } finally {
      console.log('Real auth finally block - setting isLoading to false');
      // Ensure isLoading is always set to false
      setIsLoading(false);
    }
    
    console.log('=== AUTHENTICATION END ===');
  };

  const createPayment = (paymentData: PaymentData, callbacks: PaymentCallbacks) => {
    // Check if we're in preview mode or Pi Browser
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '5173';
    const isPiBrowserEnv = isPiBrowser();
    const isNetlify = window.location.hostname.includes('netlify.app');
    const isSandbox = isSandboxEnvironment();
    const isVercel = window.location.hostname.includes('vercel.app');
    
    // For testing purposes in the Pi Developer Portal, we want to use real payments
    // even in sandbox environments to ensure proper tracking
    // Check if we're specifically testing Step 11 in the Pi Developer Portal
    const isPiPortalTest = localStorage.getItem('pi_portal_test') === 'true';
    const useRealPayments = isPiPortalTest || isSandbox || isNetlify || isVercel;
    
    // Only use mock payments in local development (unless specifically testing Pi Portal)
    if (isPreview || (process.env.NODE_ENV !== 'production' && !useRealPayments)) {
      // Mock payment flow for preview mode, sandbox, or Pi Browser
      console.log('Mock payment initiated:', paymentData);
      
      // Generate a mock payment ID
      const mockPaymentId = 'mock_payment_' + Date.now();
      
      // Simulate payment approval
      setTimeout(() => {
        callbacks.onReadyForServerApproval(mockPaymentId);
        
        // Simulate payment completion with API call to update transactions
        setTimeout(async () => {
          const mockTxId = 'mock_tx_' + Date.now();
          callbacks.onReadyForServerCompletion(mockPaymentId, mockTxId);
          
          // In mock mode, we should also update the transactions in localStorage
          // to simulate the backend updating the database
          try {
            const token = localStorage.getItem('pi_token');
            if (token) {
              // Create a mock transaction and add it to localStorage
              const mockTransaction = {
                id: 'transaction-' + Date.now(),
                userId: 'mock-user-' + Date.now(),
                packageId: paymentData.metadata?.packageId || 'unknown',
                paymentId: mockPaymentId,
                txid: mockTxId,
                piAmount: paymentData.amount.toString(),
                usdAmount: (paymentData.amount * 0.01).toString(), // Mock conversion
                piPriceAtTime: '0.01',
                status: 'completed',
                gameAccount: paymentData.metadata?.gameAccount || {},
                metadata: paymentData.metadata || {},
                emailSent: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              // Get existing transactions from localStorage
              const existingTransactions = JSON.parse(localStorage.getItem('mock_transactions') || '[]');
              existingTransactions.push(mockTransaction);
              localStorage.setItem('mock_transactions', JSON.stringify(existingTransactions));
              
              // Also update the global mock transactions for immediate UI update
              // Type assertion to avoid TypeScript errors
              const globalAny: any = global;
              if (globalAny.mockTransactions) {
                globalAny.mockTransactions.push(mockTransaction);
              }
            }
          } catch (error) {
            console.error('Error updating mock transactions:', error);
          }
        }, 1000);
      }, 500);
      
      return;
    }
    
    // For Vercel deployments and Testnet environments, we still use the Pi SDK directly
    // but we don't call the backend approval/complete endpoints
    if (isVercel || isNetlify || isSandbox) {
      console.log('Testnet payment initiated:', paymentData);
      
      // Add user context to metadata
      const enhancedPaymentData = {
        ...paymentData,
        metadata: {
          ...paymentData.metadata,
          type: 'testnet' as const,
          userId: user?.id,
        },
      };

      // For Testnet, we use simplified callbacks that don't call the backend
      const testnetCallbacks = {
        onReadyForServerApproval: (paymentId: string) => {
          console.log('Testnet payment approved:', paymentId);
          // In Testnet, we don't need to call the backend for approval
          // Just call the original callback
          callbacks.onReadyForServerApproval(paymentId);
        },
        onReadyForServerCompletion: (paymentId: string, txid: string) => {
          console.log('Testnet payment completed:', paymentId, txid);
          // In Testnet, we don't need to call the backend for completion
          // Just call the original callback
          callbacks.onReadyForServerCompletion(paymentId, txid);
        },
        onCancel: callbacks.onCancel,
        onError: callbacks.onError,
      };

      // Initialize Pi SDK if not already initialized
      try {
        piSDK.createPayment(enhancedPaymentData, testnetCallbacks);
      } catch (error) {
        console.error('Testnet payment creation failed:', error);
        // Try to reinitialize Pi SDK and retry
        try {
          const useSandbox = true; // Always use sandbox for Testnet
          piSDK.init(useSandbox);
          piSDK.createPayment(enhancedPaymentData, testnetCallbacks);
        } catch (retryError) {
          console.error('Testnet payment creation retry failed:', retryError);
          callbacks.onError(retryError as Error);
        }
      }
      
      return;
    }
    
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    // Add user context to metadata
    const enhancedPaymentData = {
      ...paymentData,
      metadata: {
        ...paymentData.metadata,
        type: 'backend' as const,
        userId: user.id,
      },
    };

    // Enhanced callbacks with API calls
    const enhancedCallbacks = {
      onReadyForServerApproval: async (paymentId: string) => {
        try {
          await apiRequest('POST', '/api/payment/approve', { paymentId });
          callbacks.onReadyForServerApproval(paymentId);
        } catch (error) {
          console.error('Payment approval failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        try {
          await apiRequest('POST', '/api/payment/complete', { paymentId, txid });
          callbacks.onReadyForServerCompletion(paymentId, txid);
        } catch (error) {
          console.error('Payment completion failed:', error);
          callbacks.onError(error as Error);
        }
      },
      onCancel: callbacks.onCancel,
      onError: callbacks.onError,
    };

    // Initialize Pi SDK if not already initialized
    try {
      piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
    } catch (error) {
      console.error('Payment creation failed:', error);
      // Try to reinitialize Pi SDK and retry
      try {
        const isProduction = process.env.NODE_ENV === 'production';
        // For sandbox mode (Vercel deployments), we also use sandbox mode
        const useSandbox = !isProduction || window.location.hostname.includes('vercel.app') || window.location.hostname.includes('netlify.app');
        piSDK.init(useSandbox);
        piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
      } catch (retryError) {
        console.error('Payment creation retry failed:', retryError);
        callbacks.onError(retryError as Error);
      }
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
  };

  console.log('PiNetworkProvider rendering with state:', { isAuthenticated, user, isLoading, token });

  return (
    <PiNetworkContext.Provider value={{
      isAuthenticated,
      user,
      isLoading,
      authenticate,
      logout,
      createPayment,
      token,
    }}>
      {children}
    </PiNetworkContext.Provider>
  );
}

export function usePiNetwork() {
  const context = useContext(PiNetworkContext);
  if (context === undefined) {
    throw new Error('usePiNetwork must be used within a PiNetworkProvider');
  }
  return context;
}