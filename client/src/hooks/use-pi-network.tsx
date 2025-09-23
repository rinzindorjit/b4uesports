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
    const isProduction = import.meta.env.PROD;
    const isDevelopment = import.meta.env.DEV;
    const isPreview = import.meta.env.MODE === 'preview';
    
    // In development or preview, we can use sandbox mode
    // In production, we use the live network
    const useSandbox = isDevelopment || isPreview || !isProduction;
    
    // Only initialize Pi SDK if not in preview mode
    if (!isPreview) {
      piSDK.init(useSandbox); // sandbox mode for development/preview, production mode for production
    }

    // Check for existing session
    const savedToken = localStorage.getItem('pi_token');
    const savedUser = localStorage.getItem('pi_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const authenticate = async () => {
    const isPreview = import.meta.env.MODE === 'preview';
    
    if (isPreview) {
      // In preview mode, we can't use the real Pi SDK
      // We'll simulate the authentication flow
      setIsLoading(true);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock user data
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
      
      setUser(mockUser);
      setToken(mockToken);
      setIsAuthenticated(true);
      
      // Save to localStorage
      localStorage.setItem('pi_token', mockToken);
      localStorage.setItem('pi_user', JSON.stringify(mockUser));
      
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

    piSDK.createPayment(enhancedPaymentData, enhancedCallbacks);
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