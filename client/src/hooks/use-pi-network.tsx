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
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3002';
    
    console.log('PiNetworkProvider init, isProduction:', isProduction, 'isDevelopment:', isDevelopment, 'isPreview:', isPreview);
    
    // In development or preview, we can use sandbox mode
    // In production, we use the live network
    const useSandbox = isDevelopment || isPreview || !isProduction;
    
    // Initialize Pi SDK even in preview mode for payment functionality
    // But mock the actual payment calls
    piSDK.init(useSandbox); // sandbox mode for development/preview, production mode for production

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
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3002';
    
    console.log('Authentication called, isPreview:', isPreview);
    console.log('Window location:', window.location);
    
    if (isPreview) {
      console.log('Using preview authentication flow');
      // In preview mode, we can't use the real Pi SDK
      // We'll simulate the authentication flow with NO delay
      setIsLoading(true);
      
      // Create mock user data immediately
      const mockUser: User = {
        id: 'preview-user-123',
        username: 'preview_user',
        email: 'preview@example.com',
        phone: '+1234567890',
        country: 'US',
        language: 'en',
        walletAddress: 'GAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        gameAccounts: {
          pubg: { ign: 'PreviewPlayer', uid: '123456789' },
          mlbb: { userId: '987654321', zoneId: '1234' }
        },
        profileImageUrl: undefined,
        isProfileVerified: false,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User;
      
      // Set mock token and user
      const mockToken = 'preview-jwt-token-12345';
      
      console.log('Setting mock user and token');
      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', mockToken);
      localStorage.setItem('pi_user', JSON.stringify(mockUser));
      
      console.log('Authentication complete, user:', mockUser);
      
      // Set loading to false immediately
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Ensure we request both 'payments' and 'username' scopes
      // Also add 'wallet_address' scope to get wallet address
      const authResult = await piSDK.authenticate(['payments', 'username', 'wallet_address']);
      if (!authResult) {
        throw new Error('Authentication failed - missing required scopes');
      }

      // Send access token to backend for verification
      const response = await apiRequest('POST', '/api/auth/pi', {
        accessToken: authResult.accessToken,
      });
      
      const data = await response.json();
      
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', data.token);
      localStorage.setItem('pi_user', JSON.stringify(data.user));
      
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    }
    setIsLoading(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('pi_token');
    localStorage.removeItem('pi_user');
  };

  const createPayment = (paymentData: PaymentData, callbacks: PaymentCallbacks) => {
    // Check if we're in preview mode
    const isPreview = window.location.hostname === 'localhost' && window.location.port === '3002';
    
    if (isPreview) {
      // Mock payment flow for preview mode
      console.log('Mock payment initiated:', paymentData);
      
      // Generate a mock payment ID
      const mockPaymentId = 'preview_payment_' + Date.now();
      
      // Simulate payment approval
      setTimeout(() => {
        callbacks.onReadyForServerApproval(mockPaymentId);
        
        // Simulate payment completion
        setTimeout(() => {
          const mockTxId = 'preview_tx_' + Date.now();
          callbacks.onReadyForServerCompletion(mockPaymentId, mockTxId);
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
        const useSandbox = isDevelopment || !isProduction;
        piSDK.init(useSandbox);
        piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
      } catch (retryError) {
        console.error('Payment creation retry failed:', retryError);
        callbacks.onError(retryError as Error);
      }
    }
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