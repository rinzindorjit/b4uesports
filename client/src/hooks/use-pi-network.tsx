import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { piSDK } from '@/lib/pi-sdk';
import { apiRequest } from '@/lib/queryClient';
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

// Function to detect if we're running in Pi Browser
function isPiBrowser() {
  // Check for Pi Browser specific user agent or features
  if (typeof window !== 'undefined') {
    // Check for Pi Browser user agent
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('PiBrowser') || userAgent.includes('Pi Network')) {
      return true;
    }
    
    // Check for Pi Browser specific features
    // @ts-ignore
    if (window.Pi && typeof window.Pi === 'object') {
      return true;
    }
    
    // Check for localhost development
    if (window.location.hostname === 'localhost' && window.location.port === '3005') {
      return true;
    }
    
    // Check for Vercel deployment (for testing)
    if (window.location.hostname.includes('vercel.app')) {
      return true;
    }
  }
  
  return false;
}

export function PiNetworkProvider({ children }: PiNetworkProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Pi SDK
    const isProduction = process.env.NODE_ENV === 'production';
    const isDevelopment = process.env.NODE_ENV === 'development';
    // Check if we're in preview mode by looking at the hostname
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3005';
    
    console.log('PiNetworkProvider init, isProduction:', isProduction, 'isDevelopment:', isDevelopment, 'isPreview:', isPreview);
    
    // In development or preview, we can use sandbox mode
    // In production, we use the live network
    // For sandbox mode (Vercel deployments), we also use sandbox mode
    const useSandbox = isDevelopment || isPreview || !isProduction || window.location.hostname.includes('vercel.app');
    
    // Initialize Pi SDK even in preview mode for payment functionality
    // But mock the actual payment calls
    piSDK.init(useSandbox); // sandbox mode for development/preview/sandbox, production mode for production

    // Check for existing session
    const savedToken = localStorage.getItem('pi_token');
    const savedUser = localStorage.getItem('pi_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      console.log('Restored session from localStorage');
    }
    
    setIsLoading(false);
  }, []);

  const authenticate = async () => {
    // Check if we're in preview mode by looking at the hostname
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3005';
    // Check if we're in sandbox mode (Vercel deployment)
    const isSandbox = window.location.hostname.includes('vercel.app');
    // Check if we're in Pi Browser
    const isPiBrowserEnv = isPiBrowser();
    
    console.log('Authentication called, isPreview:', isPreview, 'isSandbox:', isSandbox, 'isPiBrowserEnv:', isPiBrowserEnv);
    console.log('Window location:', window.location);
    
    // Use mock authentication for Pi Browser, preview mode, or sandbox mode
    if (isPreview || isSandbox || isPiBrowserEnv) {
      console.log('Using mock authentication flow for Pi Browser/Preview/Sandbox');
      // In Pi Browser, preview mode, or sandbox, we'll use a mock authentication flow
      setIsLoading(true);
      
      try {
        // Send request to backend with mock auth flag
        const response = await apiRequest('POST', '/api/auth/pi', {
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
        setIsLoading(false);
      }
      return;
    }
    
    // For production mode, use real Pi Network authentication
    setIsLoading(true);
    try {
      // Ensure we request both 'payments' and 'username' scopes
      // Also add 'wallet_address' scope to get wallet address
      console.log('Requesting Pi authentication with scopes: payments, username, wallet_address');
      const authResult = await piSDK.authenticate(['payments', 'username', 'wallet_address']);
      console.log('Pi authentication result:', authResult);
      
      if (!authResult) {
        throw new Error('Authentication failed - missing required scopes or user cancelled');
      }

      // Send access token to backend for verification
      console.log('Sending access token to backend for verification');
      const response = await apiRequest('POST', '/api/auth/pi', {
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
      setIsLoading(false);
    }
  };

  const createPayment = (paymentData: PaymentData, callbacks: PaymentCallbacks) => {
    // Check if we're in preview mode or Pi Browser
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3005';
    const isPiBrowserEnv = isPiBrowser();
    const isSandbox = window.location.hostname.includes('vercel.app');
    
    if (isPreview || isSandbox || isPiBrowserEnv) {
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
        const isDevelopment = process.env.NODE_ENV === 'development';
        // For sandbox mode (Vercel deployments), we also use sandbox mode
        const useSandbox = isDevelopment || !isProduction || window.location.hostname.includes('vercel.app');
        piSDK.init(useSandbox);
        piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
      } catch (retryError) {
        console.error('Payment creation retry failed:', retryError);
        callbacks.onError(retryError as Error);
      }
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
  };

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